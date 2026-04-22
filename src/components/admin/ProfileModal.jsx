"use client";

import React, { useState, useEffect } from "react";
import styles from "./modal.module.css";
import { createClient } from "@/utils/supabase/client";

export default function ProfileModal({ onClose, negocioData, onSave }) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    // Basic Fields
    const [nombre, setNombre] = useState(negocioData?.nombre || "");
    const [descripcion, setDescripcion] = useState(negocioData?.descripcion || "");
    const [ciudad, setCiudad] = useState(negocioData?.ciudad || "");
    const [colorPrimario, setColorPrimario] = useState(negocioData?.color_primario || "#3AA8DF");
    
    const [enviosNac, setEnviosNac] = useState(!!negocioData?.envios_nac);
    const [enviosDom, setEnviosDom] = useState(!!negocioData?.envios_dom);
    const [recojoLocal, setRecojoLocal] = useState(!!negocioData?.recojo_local);

    // Images
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(negocioData?.logo_url_sm || negocioData?.logo_url || "");
    
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(negocioData?.banner_url || negocioData?.banner_url_lg || "");

    // Social Networks (Redes)
    const [redes, setRedes] = useState([]);

    useEffect(() => {
        const fetchRedes = async () => {
            const { data } = await supabase.from("negocio_redes").select("*").eq("negocio_id", negocioData.id);
            if (data && data.length > 0) {
                setRedes(data.map(r => ({ ...r, uuid: crypto.randomUUID() })));
            } else {
                setRedes([{ uuid: crypto.randomUUID(), red: "whatsapp", link: "" }]);
            }
        };
        if (negocioData?.id) {
            fetchRedes();
        }
    }, [negocioData?.id]);

    const handleLogoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setLogoFile(e.target.files[0]);
            setLogoPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleBannerChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setBannerFile(e.target.files[0]);
            setBannerPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const addRed = () => {
        setRedes([...redes, { uuid: crypto.randomUUID(), red: "", link: "" }]);
    };

    const removeRed = (uuid) => {
        if (redes.length === 1) return;
        setRedes(redes.filter(r => r.uuid !== uuid));
    };

    const updateRed = (uuid, field, value) => {
        setRedes(redes.map(r => r.uuid === uuid ? { ...r, [field]: value } : r));
    };

    const uploadToCloudinary = async (file) => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) throw new Error("Fallo subida a Cloudinary");
        const cloudData = await res.json();
        return cloudData.secure_url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validar que haya whatsapp
            const hasWhatsapp = redes.some(r => r.red.toLowerCase() === "whatsapp" && r.link.trim() !== "");
            if (!hasWhatsapp) throw new Error("Debes proporcionar al menos un número de WhatsApp.");

            let finalLogoUrl = logoPreview; // Keep existing from prop
            let finalBannerUrl = bannerPreview; // Keep existing from prop

            if (logoFile) finalLogoUrl = await uploadToCloudinary(logoFile);
            if (bannerFile) finalBannerUrl = await uploadToCloudinary(bannerFile);

            // Actualizar tabla negocio
            const { error: negError } = await supabase
                .from("negocio")
                .update({
                    nombre,
                    descripcion,
                    ciudad,
                    envios_nac: enviosNac,
                    envios_dom: enviosDom,
                    recojo_local: recojoLocal,
                    logo_url: finalLogoUrl,
                    banner_url: finalBannerUrl,
                    color_primario: colorPrimario
                })
                .eq("id", negocioData.id);

            if (negError) throw new Error("Error actualizando negocio: " + negError.message);

            // Preparar redes (Separando actualizadas de nuevas para evitar errores Null en upsert heterogeneo)
            const redesProcessed = redes.map(r => {
                let finalLink = r.link.trim();
                const networkName = r.red.toLowerCase().trim();

                if (networkName === "whatsapp") {
                    if (/^\+?\d+$/.test(finalLink)) {
                        const cleanNum = finalLink.replace("+", "");
                        finalLink = `https://wa.me/${cleanNum.length <= 8 ? "591"+cleanNum : cleanNum}`;
                    }
                } else if (!finalLink.startsWith("http")) { 
                    finalLink = `https://${finalLink}`;
                }

                const row = {
                    negocio_id: negocioData.id,
                    red: networkName,
                    link: finalLink
                };
                if (r.id) row.id = r.id; 
                return row;
            }).filter(r => r.link && r.link !== "https://");

            const updates = redesProcessed.filter(r => r.id !== undefined);
            const inserts = redesProcessed.filter(r => r.id === undefined);

            const currentIds = updates.map(r => r.id);
            
            // Borrar redes obsoletas
            const { data: oldRedes } = await supabase.from("negocio_redes").select("id").eq("negocio_id", negocioData.id);
            if (oldRedes) {
                const originalIds = oldRedes.map(r => r.id);
                const idsToDelete = originalIds.filter(id => !currentIds.includes(id));
                if (idsToDelete.length > 0) {
                    await supabase.from("negocio_redes").delete().in("id", idsToDelete);
                }
            }

            // Ejecutar modificaciones a DB de Redes independientemente
            if (updates.length > 0) {
                const { error: upError } = await supabase.from("negocio_redes").upsert(updates);
                if (upError) throw new Error("Error actualizando redes: " + upError.message);
            }

            if (inserts.length > 0) {
                const { error: insError } = await supabase.from("negocio_redes").insert(inserts);
                if (insError) throw new Error("Error agregando nuevas redes: " + insError.message);
            }

            onSave();

        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.backdrop}>
            <div className={styles.modalCard}>
                <div className={styles.modalHeader}>
                    <h2>Perfil del Negocio</h2>
                    <button type="button" className={styles.iconBtn} onClick={onClose} disabled={loading}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className={styles.modalContent}>
                    
                    <div className={styles.formSplit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Logotipo</label>
                            <label className={styles.uploadArea}>
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className={styles.previewImg} style={{ objectFit: 'contain' }} />
                                ) : (
                                    <div className={styles.uploadPlaceholder}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
                                        <span>Seleccionar imagen</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleLogoChange} className={styles.fileInput} />
                            </label>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Banner</label>
                            <label className={styles.uploadArea}>
                                {bannerPreview ? (
                                    <img src={bannerPreview} alt="Banner" className={styles.previewImg} style={{ objectFit: 'cover' }} />
                                ) : (
                                    <div className={styles.uploadPlaceholder}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
                                        <span>Seleccionar Banner</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleBannerChange} className={styles.fileInput} />
                            </label>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Color Principal (Identidad de Marca)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input 
                                type="color" 
                                className={styles.input} 
                                value={colorPrimario} 
                                onChange={e => setColorPrimario(e.target.value)} 
                                style={{ width: '60px', height: '44px', padding: '4px', cursor: 'pointer' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: 'var(--text-body)', fontWeight: 'bold' }}>{colorPrimario.toUpperCase()}</span>
                                <small style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>El sistema adaptará el contraste automáticamente.</small>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nombre del Negocio</label>
                        <input className={styles.input} required value={nombre} onChange={e => setNombre(e.target.value)} />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Descripción Breve</label>
                        <textarea className={styles.textarea} rows="2" value={descripcion} onChange={e => setDescripcion(e.target.value)}></textarea>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Ciudad / Ubicación</label>
                        <input className={styles.input} value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder="Ej. La Paz, Santa Cruz, Todo el país..." />
                    </div>

                    <div className={styles.divider}></div>
                    <div className={styles.presentationsHeader}>
                        <h3>Opciones de Envío</h3>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--text-body)' }}>
                            <input type="checkbox" checked={enviosNac} onChange={e => setEnviosNac(e.target.checked)} />
                            Envíos Nacionales
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--text-body)' }}>
                            <input type="checkbox" checked={enviosDom} onChange={e => setEnviosDom(e.target.checked)} />
                            Envíos a Domicilio
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--text-body)' }}>
                            <input type="checkbox" checked={recojoLocal} onChange={e => setRecojoLocal(e.target.checked)} />
                            Recojo en Tienda
                        </label>
                    </div>

                    <div className={styles.divider}></div>
                    <div className={styles.presentationsHeader}>
                        <h3>Redes Sociales y Enlaces</h3>
                        <button type="button" className={styles.addBtn} onClick={addRed}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                            Añadir
                        </button>
                    </div>
                    <small style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', marginTop: '-8px', display: 'block' }}>* Importante: Mantén al menos un campo con la palabra <b>whatsapp</b> obligatoriamente para tu botón flotante de chat.</small>

                    <div className={styles.presentationsList} style={{ marginTop: '8px' }}>
                        {redes.map((r) => (
                            <div key={r.uuid} className={styles.presentationRow}>
                                <div className={styles.presCol}>
                                    <label>Red Social</label>
                                    <select 
                                        required 
                                        className={styles.inputMini} 
                                        value={r.red} 
                                        onChange={e => updateRed(r.uuid, 'red', e.target.value)}
                                    >
                                        <option value="" disabled>Seleccione...</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="facebook">Facebook</option>
                                        <option value="instagram">Instagram</option>
                                        <option value="tiktok">TikTok</option>
                                        <option value="twitter">Twitter / X</option>
                                        <option value="youtube">YouTube</option>
                                        <option value="telegram">Telegram</option>
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="correo">Correo Electrónico</option>
                                    </select>
                                </div>
                                <div className={styles.presCol} style={{ flex: 2 }}>
                                    <label>Número / Enlace / URL</label>
                                    <input type="text" required placeholder="Ingresa el link o número" className={styles.inputMini} value={r.link} onChange={e => updateRed(r.uuid, 'link', e.target.value)} />
                                </div>
                                <div className={styles.presColDelete}>
                                    <button 
                                        type="button" 
                                        className={styles.deleteIconBtn} 
                                        onClick={() => removeRed(r.uuid)}
                                        disabled={redes.length === 1}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancelar</button>
                        <button type="submit" className={styles.saveBtn} disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Perfil"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
