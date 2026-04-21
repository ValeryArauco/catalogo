"use client";

import React, { useState } from "react";
import styles from "./ProductDetails.module.css";
import Link from "next/link";
import { useParams } from "next/navigation";

export const ProductDetails = ({ product }) => {
    const params = useParams();
    
    // Filtro para prestaciones activas y ordenación simple opcional
    const activePresentations = (product.producto_presentaciones || []).filter(p => p.activo === true);
    activePresentations.sort((a,b) => (a.precio || 0) - (b.precio || 0));

    // Estados
    const [quantity, setQuantity] = useState(1);
    const [selectedStrId, setSelectedStrId] = useState(
        activePresentations.length > 0 ? String(activePresentations[0].id) : ""
    );
    const [mainImageIndex, setMainImageIndex] = useState(0);
    
    const selectedPres = activePresentations.find(p => String(p.id) === selectedStrId);

    // Imágenes ordenadas
    const images = [...(product.producto_imagenes || [])].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    // Resolutor universal de nombres de imagen a URLs (ya que DBs cambian su schema a veces)
    const getUrl = (img) => img?.url || img?.imagen_url || img?.image_url || img?.ruta || img?.imagen || "https://placehold.co/800x800?text=No+Image";
    
    if (images.length === 0) {
        images.push({ id: 'fallback', url: "https://placehold.co/800x800?text=No+Image" });
    }

    const currentMainImageUrl = getUrl(images[mainImageIndex]);

    const handleAddToCart = () => {
        if (!selectedPres || !selectedPres.disponible) return;

        const currentPrice = (selectedPres.precio_oferta && selectedPres.precio_oferta > 0) 
            ? selectedPres.precio_oferta 
            : selectedPres.precio;

        const item = {
            id: product.id,
            name: product.nombre,
            price: currentPrice || 0,
            quantity: quantity,
            variant: `${selectedPres.cantidad} ${selectedPres.unidad}`,
            image: getUrl(images[0]) // Siempre llevar la principal (la cubierta)
        };

        const existingCart = JSON.parse(localStorage.getItem('catalogo_cart') || '[]');
        existingCart.push(item);
        localStorage.setItem('catalogo_cart', JSON.stringify(existingCart));
        
        window.dispatchEvent(new Event('cart_updated')); // Activa el interceptor en Header.jsx
        
        const btn = document.getElementById(`btn-details-add-${product.id}`);
        if(btn) {
            const originalText = btn.innerText;
            btn.innerText = "¡Agregado al carrito!";
            btn.style.background = "#4caf50";
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = "var(--primary)";
            }, 1000);
        }
    };

    return (
        <div className={styles.container}>
            <Link href={`/${params.negocio}`} className={styles.backButton}>
                ← Volver al catálogo
            </Link>
            
            <div className={styles.grid}>
                {/* Visualizador de Imágenes */}
                <div className={styles.imageGallery}>
                    <div className={styles.mainImageWrapper}>
                        <img src={currentMainImageUrl} alt={product.nombre} className={styles.mainImage} />
                    </div>
                    {images.length > 1 && (
                        <div className={styles.thumbnailList}>
                            {images.map((img, idx) => (
                                <button 
                                    key={img.id || idx} 
                                    onClick={() => setMainImageIndex(idx)}
                                    className={`${styles.thumbnailButton} ${idx === mainImageIndex ? styles.activeThumbnail : ''}`}
                                >
                                    <img src={getUrl(img)} alt={`Vista secundaria`} className={styles.thumbnail} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detalles y Formularios de Material Design */}
                <div className={styles.detailsBlock}>
                    <span className={styles.category}>{product.categorias?.categoria || "General"}</span>
                    <h1 className={styles.title}>{product.nombre}</h1>
                    <p className={styles.description}>{product.descripcion || "Este producto no tiene una descripción profunda agregada, pero puedes comunicarte con la tienda por medio del botón inferior si necesitas conocer más especificaciones importantes y detalles de salud."}</p>

                    <div className={styles.pricingSection}>
                        {selectedPres && selectedPres.precio_oferta > 0 ? (
                            <>
                                <span className={styles.offerPrice}>Bs. {selectedPres.precio_oferta}</span>
                                <span className={styles.normalPrice}>Bs. {selectedPres.precio}</span>
                            </>
                        ) : selectedPres ? (
                            <span className={styles.offerPrice}>Bs. {selectedPres.precio}</span>
                        ) : (
                            <span className={styles.offerPrice}>No disponible</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Presentación</label>
                        <select 
                            className={styles.select} 
                            value={selectedStrId} 
                            onChange={(e) => setSelectedStrId(e.target.value)}
                        >
                            {activePresentations.map((p) => (
                                <option key={p.id} value={String(p.id)} disabled={!p.disponible}>
                                    {p.cantidad} {p.unidad} {!p.disponible ? "(Agotado temporalmente)" : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Cantidad a pedir</label>
                        <div className={styles.quantityControls}>
                            <button 
                                className={styles.qtyBtn} 
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                disabled={!selectedPres?.disponible}
                            >-</button>
                            <input 
                                type="number" 
                                readOnly 
                                value={quantity} 
                                className={styles.qtyInput} 
                                disabled={!selectedPres?.disponible}
                            />
                            <button 
                                className={styles.qtyBtn} 
                                onClick={() => setQuantity(q => q + 1)}
                                disabled={!selectedPres?.disponible}
                            >+</button>
                        </div>
                    </div>

                    <button 
                        id={`btn-details-add-${product.id}`}
                        className={`${styles.addToCartBtn} ${(!selectedPres || !selectedPres.disponible) ? styles.disabledBtn : ''}`}
                        onClick={handleAddToCart}
                        disabled={!selectedPres || !selectedPres.disponible}
                    >
                        {!selectedPres || !selectedPres.disponible ? "Producto Agotado" : "Añadir al carrito"}
                    </button>
                    
                </div>
            </div>
        </div>
    );
};
