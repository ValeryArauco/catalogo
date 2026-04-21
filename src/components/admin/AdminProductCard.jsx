import React from "react";
import styles from "./admin.module.css";

export default function AdminProductCard({ product, onEdit, onDelete }) {

    const getDefaultImage = () => {
        if (!product.producto_imagenes || product.producto_imagenes.length === 0) return "https://placehold.co/100x100?text=No+Image";
        const sorted = [...product.producto_imagenes].sort((a,b) => (a.orden || 0) - (b.orden || 0));
        const img = sorted[0];
        return img.url || img.imagen_url || img.image_url || img.ruta || img.imagen || "https://placehold.co/100x100?text=No+Image";
    };

    const getBasePrice = () => {
        if (!product.producto_presentaciones || product.producto_presentaciones.length === 0) return "Sin presentaciones";
        const prices = product.producto_presentaciones.map(p => p.precio_oferta || p.precio);
        return `Desde Bs. ${Math.min(...prices)}`;
    };

    return (
        <div className={styles.productCard}>
            <div className={styles.cardImgWrap}>
                <img src={getDefaultImage()} alt={product.nombre} className={styles.cardImg} />
            </div>
            
            <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{product.nombre}</h3>
                <p className={styles.cardSubtitle}>{getBasePrice()}</p>
            </div>

            <div className={styles.cardActions}>
                {/* SVG Edit Material Symbol */}
                <button className={styles.iconBtn} aria-label="Editar producto" onClick={onEdit}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                </button>
                {/* SVG Delete Material Symbol */}
                <button className={`${styles.iconBtn} ${styles.iconBtnDelete}`} aria-label="Eliminar producto" onClick={onDelete}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
