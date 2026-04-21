"use client";

import React, { useState } from "react";
import styles from "./modal.module.css";
import { createClient } from "@/utils/supabase/client";

export default function ProductModal({ onClose, negocioId, categorias, onSave, product }) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    
    const isEditMode = !!product;

    const [nombre, setNombre] = useState(product?.nombre || "");
    const [descripcion, setDescripcion] = useState(product?.descripcion || "");
    const [categoriaId, setCategoriaId] = useState(product?.categoria_id || categorias?.[0]?.id || "");
    
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState(
        (product?.producto_imagenes ? [...product.producto_imagenes] : []).sort((a,b)=> (a.orden || 0) - (b.orden || 0))
    );
    const [deletedExistingImageIds, setDeletedExistingImageIds] = useState([]);

    const [presentaciones, setPresentaciones] = useState(
        product?.producto_presentaciones?.length > 0 
            ? product.producto_presentaciones.map(p => ({
                ...p,
                uuid: crypto.randomUUID(),
                disponible: p.disponible !== undefined ? p.disponible : true
              }))
            : [{
                uuid: crypto.randomUUID(),
                cantidad: 1,
                unidad: "Pza",
                precio: "",
                precio_oferta: "",
                disponible: true
              }]
    );

    const handleImageChange = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(f => URL.createObjectURL(f));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const addPresentacion = () => {
        setPresentaciones([...presentaciones, {
            uuid: crypto.randomUUID(),
            cantidad: 1,
            unidad: "Pza",
            precio: "",
            precio_oferta: "",
            disponible: true
        }]);
    };

    const removePresentacion = (uuid) => {
        if (presentaciones.length === 1) return;
        setPresentaciones(presentaciones.filter(p => p.uuid !== uuid));
    };

    const updatePresentacion = (uuid, field, value) => {
        setPresentaciones(presentaciones.map(p => 
            p.uuid === uuid ? { ...p, [field]: value } : p
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalCategoryId = categoriaId;

            if (isCreatingCategory && newCategoryName.trim() !== "") {
                const { data: catData, error: catError } = await supabase
                    .from("categorias")
                    .insert({ categoria: newCategoryName.trim() })
                    .select()
                    .single();

                if (catError) throw new Error("Error al crear categoría: " + catError.message);
                finalCategoryId = catData.id;
            } else if (!finalCategoryId) {
                throw new Error("Debes seleccionar o crear una categoría válida");
            }

            // 1. Crear o Actualizar Producto
            let prodData = null;
            if (isEditMode) {
                const { data, error: prodError } = await supabase
                    .from("productos")
                    .update({ categoria_id: finalCategoryId, nombre, descripcion })
                    .eq("id", product.id)
                    .select()
                    .single();
                if (prodError) throw new Error(prodError.message);
                prodData = data;
            } else {
                const { data, error: prodError } = await supabase
                    .from("productos")
                    .insert({ negocio_id: negocioId, categoria_id: finalCategoryId, nombre, descripcion, activo: true })
                    .select()
                    .single();
                if (prodError) throw new Error(prodError.message);
                prodData = data;
            }

            // 2. Imagenes a Cloudinary
            const uploadedUrls = [];
            if (imageFiles.length > 0) {
                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
                const uploadPromises = imageFiles.map(async (file) => {
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
                });
                uploadedUrls.push(...await Promise.all(uploadPromises));
            }

            // Eliminar imágenes viejas de DB si el usuario las borró
            if (deletedExistingImageIds.length > 0) {
                await supabase.from("producto_imagenes").delete().in("id", deletedExistingImageIds);
            }

            // Conseguir orden correcto
            const maxExistingOrder = existingImages.length > 0 
                ? Math.max(...existingImages.map(img => img.orden || 0)) 
                : 0;

            if (uploadedUrls.length > 0) {
                const imgInserts = uploadedUrls.map((url, i) => ({
                    producto_id: prodData.id,
                    url: url,
                    orden: maxExistingOrder + i + 1
                }));
                await supabase.from("producto_imagenes").insert(imgInserts);
            }

            // 3. Crear / Actualizar Presentaciones
            const presToUpsert = presentaciones.map(p => {
                const row = {
                    producto_id: prodData.id,
                    cantidad: parseFloat(p.cantidad) || 1,
                    unidad: p.unidad,
                    precio: parseFloat(p.precio) || 0,
                    precio_oferta: p.precio_oferta ? parseFloat(p.precio_oferta) : null,
                    activo: true,
                    disponible: !!p.disponible
                };
                if (p.id) row.id = p.id;
                return row;
            });

            if (isEditMode) {
                const currentIds = presToUpsert.map(p => p.id).filter(Boolean);
                const originalIds = product.producto_presentaciones.map(p => p.id);
                const idsToDelete = originalIds.filter(id => !currentIds.includes(id));

                if (idsToDelete.length > 0) {
                    await supabase.from("producto_presentaciones").delete().in("id", idsToDelete);
                }
            }

            const { error: presError } = await supabase.from("producto_presentaciones").upsert(presToUpsert);
            if (presError) throw new Error(presError.message);

            onSave(prodData, isEditMode ? "actualizado" : "creado");
        } catch (err) {
            alert(err.message);
            setLoading(false);
        }
    };

    return (
        <div className={styles.backdrop}>
            <div className={styles.modalCard}>
                <div className={styles.modalHeader}>
                    <h2>{isEditMode ? "Editar Producto" : "Nuevo Producto"}</h2>
                    <button type="button" className={styles.iconBtn} onClick={onClose} disabled={loading}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className={styles.modalContent}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nombre del Producto</label>
                        <input className={styles.input} required value={nombre} onChange={e => setNombre(e.target.value)} />
                    </div>

                    <div className={styles.formSplit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Categoría</label>
                            {!isCreatingCategory ? (
                                <select 
                                    className={styles.select} required={!isCreatingCategory} value={categoriaId} 
                                    onChange={e => {
                                        if (e.target.value === "NEW") {
                                            setIsCreatingCategory(true);
                                            setCategoriaId("");
                                        } else setCategoriaId(e.target.value);
                                    }}
                                >
                                    {categorias.map(c => <option key={c.id} value={c.id}>{c.categoria}</option>)}
                                    <option value="NEW" style={{ fontWeight: 'bold' }}>+ Crear nueva categoría...</option>
                                </select>
                            ) : (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input 
                                        type="text" className={styles.input} style={{ flex: 1 }}
                                        placeholder="Nueva categoría..." value={newCategoryName} required={isCreatingCategory} onChange={e => setNewCategoryName(e.target.value)}
                                    />
                                    <button 
                                        type="button" className={styles.cancelBtn} style={{ padding: '0 12px' }}
                                        onClick={() => { setIsCreatingCategory(false); setCategoriaId(categorias?.[0]?.id || ""); setNewCategoryName(""); }}
                                    >✕</button>
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Imágenes</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                {existingImages.map((img) => (
                                    <div key={img.id} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--outline)' }}>
                                        <img src={img.url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button 
                                            type="button" aria-label="Remover"
                                            style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(211, 47, 47, 0.9)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '10px', padding: '2px 4px', borderBottomLeftRadius: '4px' }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setExistingImages(prev => prev.filter(p => p.id !== img.id));
                                                setDeletedExistingImageIds(prev => [...prev, img.id]);
                                            }}
                                        >✕</button>
                                    </div>
                                ))}

                                {imagePreviews.map((src, idx) => (
                                    <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, border: '1px dashed var(--primary)' }}>
                                        <img src={src} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button 
                                            type="button" aria-label="Remover"
                                            style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(211, 47, 47, 0.9)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '10px', padding: '2px 4px', borderBottomLeftRadius: '4px' }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setImageFiles(prev => prev.filter((_, i) => i !== idx));
                                                setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                                            }}
                                        >✕</button>
                                    </div>
                                ))}
                            </div>

                            <label className={styles.uploadArea} style={{ height: '50px' }}>
                                <div className={styles.uploadPlaceholder} style={{ flexDirection: 'row' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
                                    <span>Adjuntar</span>
                                </div>
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} className={styles.fileInput} />
                            </label>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Descripción</label>
                        <textarea className={styles.textarea} rows="2" value={descripcion} onChange={e => setDescripcion(e.target.value)}></textarea>
                    </div>

                    <div className={styles.divider}></div>
                    <div className={styles.presentationsHeader}>
                        <h3>Presentaciones y Precios</h3>
                        <button type="button" className={styles.addBtn} onClick={addPresentacion}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                            Añadir
                        </button>
                    </div>

                    <div className={styles.presentationsList}>
                        {presentaciones.map((pres) => (
                            <div key={pres.uuid} className={`${styles.presentationRow} ${!pres.disponible ? styles.presDisabled : ''}`}>
                                <div className={styles.presCol}>
                                    <label>Cant.</label>
                                    <input type="number" required min="0.1" step="0.1" className={styles.inputMini} value={pres.cantidad} onChange={e => updatePresentacion(pres.uuid, 'cantidad', e.target.value)} disabled={!pres.disponible} />
                                </div>
                                <div className={styles.presCol}>
                                    <label>Unidad</label>
                                    <input type="text" required placeholder="Pza" className={styles.inputMini} value={pres.unidad} onChange={e => updatePresentacion(pres.uuid, 'unidad', e.target.value)} disabled={!pres.disponible} />
                                </div>
                                <div className={styles.presCol}>
                                    <label>Precio</label>
                                    <input type="number" required min="0" step="0.5" className={styles.inputMini} value={pres.precio} onChange={e => updatePresentacion(pres.uuid, 'precio', e.target.value)} disabled={!pres.disponible} />
                                </div>
                                <div className={styles.presCol}>
                                    <label>Oferta</label>
                                    <input type="number" min="0" step="0.5" className={styles.inputMini} value={pres.precio_oferta || ""} onChange={e => updatePresentacion(pres.uuid, 'precio_oferta', e.target.value)} disabled={!pres.disponible} />
                                </div>
                                <div className={styles.presColToggle}>
                                    <label>Diponible</label>
                                    <label className={styles.toggleSwitch}>
                                        <input type="checkbox" checked={!!pres.disponible} onChange={e => updatePresentacion(pres.uuid, 'disponible', e.target.checked)} />
                                        <span className={styles.toggleSlider}></span>
                                    </label>
                                </div>
                                <div className={styles.presColDelete}>
                                    <button type="button" className={styles.deleteIconBtn} onClick={() => removePresentacion(pres.uuid)} disabled={presentaciones.length === 1}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancelar</button>
                        <button type="submit" className={styles.saveBtn} disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
