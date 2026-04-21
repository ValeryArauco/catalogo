"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Product.module.css";

export const Product = ({ product }) => {
    const pathname = usePathname(); // e.g. /mi-negocio
    
    const activePresentations = (product.producto_presentaciones || []).filter(p => p.activo === true);
    
    // Opcional: ordenar asumiendo que "cantidad" es un número lógico o por precio
    activePresentations.sort((a,b) => (a.precio || 0) - (b.precio || 0));

    const [quantity, setQuantity] = useState(1);
    const [selectedStrId, setSelectedStrId] = useState(
        activePresentations.length > 0 ? String(activePresentations[0].id) : ""
    );
    
    const selectedPres = activePresentations.find(p => String(p.id) === selectedStrId);

    let mainImage = "https://placehold.co/400x300?text=No+Image";
    if (product.producto_imagenes && Array.isArray(product.producto_imagenes) && product.producto_imagenes.length > 0) {
        const sorted = [...product.producto_imagenes].sort((a, b) => (a.orden || 0) - (b.orden || 0));
        const firstImg = sorted[0];
        mainImage = firstImg.url || firstImg.imagen_url || firstImg.image_url || firstImg.ruta || firstImg.imagen || mainImage;
    }

    const addToCart = () => {
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
            image: mainImage
        };

        const existingCart = JSON.parse(localStorage.getItem('catalogo_cart') || '[]');
        existingCart.push(item);
        localStorage.setItem('catalogo_cart', JSON.stringify(existingCart));
        
        // Disparar evento para que el Header se sincronice
        window.dispatchEvent(new Event('cart_updated'));
        
        // Feedback visual en el botón
        const btn = document.getElementById(`btn-add-${product.id}`);
        if(btn) {
            const originalText = btn.innerText;
            btn.innerText = "¡Agregado!";
            btn.style.background = "#4caf50";
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = ""; // Reset inline CSS so the module hover kicks back in
            }, 1000);
        }
    };

    const isAvailable = selectedPres ? selectedPres.disponible : false;
    const isOffer = selectedPres && selectedPres.precio_oferta > 0 && selectedPres.precio_oferta < selectedPres.precio;

    // Removeamos la / del final si es que existe para crear una url segura
    const safePath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const productUrl = `${safePath}/producto/${product.id}`;

    return (
        <div className={styles.card}>
            <Link href={productUrl} className={styles.imageLink}>
                <img src={mainImage} alt={product.nombre} className={styles.image} />
            </Link>
            
            <div className={styles.content}>
                {product.categorias?.categoria && (
                    <span className={styles.category}>
                        {product.categorias.categoria}
                    </span>
                )}
                
                <Link href={productUrl} className={styles.titleLink}>
                    <h3 className={styles.title}>{product.nombre}</h3>
                </Link>
                
                <p className={styles.description}>{product.descripcion.substring(0, 50)}...</p>
                
                <div className={styles.priceContainer}>
                    {isOffer ? (
                        <>
                            <span className={styles.priceStrikethrough}>Bs. {selectedPres.precio}</span>
                            <span className={styles.priceOffer}>Bs. {selectedPres.precio_oferta}</span>
                        </>
                    ) : (
                        <span className={styles.priceNormal}>
                            Bs. {selectedPres?.precio || 0}
                        </span>
                    )}
                </div>
                
                <div className={styles.controls}>
                    <select 
                        value={selectedStrId} 
                        onChange={(e) => setSelectedStrId(e.target.value)} 
                        className={styles.select}
                        disabled={activePresentations.length === 0}
                    >
                        {activePresentations.map(pres => (
                            <option key={pres.id} value={pres.id}>
                                {pres.cantidad} {pres.unidad} {!pres.disponible ? "(Agotado)" : ""}
                            </option>
                        ))}
                        {activePresentations.length === 0 && (
                            <option value="">Sin presentaciones</option>
                        )}
                    </select>
                    
                    <input 
                        type="number" 
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        disabled={!isAvailable}
                        className={styles.inputNumber}
                    />
                </div>
                
                <button 
                    id={`btn-add-${product.id}`}
                    onClick={addToCart}
                    disabled={!isAvailable}
                    className={isAvailable ? styles.addButton : styles.addButtonDisabled}
                >
                    {isAvailable ? "Agregar al carrito" : "No disponible"}
                </button>
            </div>
        </div>
    );
};