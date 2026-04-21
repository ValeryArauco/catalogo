"use client";

import React, { useState } from "react";
import AdminAppBar from "./AdminAppBar";
import AdminProductCard from "./AdminProductCard";
import AdminFab from "./AdminFab";
import ProductModal from "./ProductModal";
import ProfileModal from "./ProfileModal";
import styles from "./admin.module.css";
import { createClient } from "@/utils/supabase/client";

export default function AdminDashboardClient({ user, negocioData, initialProducts, categorias }) {
    const supabase = createClient();
    const [products, setProducts] = useState(initialProducts || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    
    // Snackbar states
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const [productToDelete, setProductToDelete] = useState(null);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = `/${negocioData.slug}/login`;
    };

    const triggerDeleteProduct = (product) => {
        setProductToDelete(product);
        setSnackbarMsg(`¿Eliminar permanentemente ${product.nombre}?`);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        // UI update optimista
        const optimisticallyRemoved = products.filter(p => p.id !== productToDelete.id);
        const productSnapshot = [...products];
        setProducts(optimisticallyRemoved);
        setSnackbarMsg("Eliminando...");

        const { error } = await supabase
            .from("productos")
            .delete()
            .eq("id", productToDelete.id);

        if (error) {
            alert("Error al eliminar el producto: " + error.message);
            // Revert state
            setProducts(productSnapshot);
        } else {
            setSnackbarMsg("Producto eliminado con éxito");
            setTimeout(() => {
                setSnackbarMsg("");
            }, 3000);
        }
        setProductToDelete(null);
    };

    const cancelDelete = () => {
        setProductToDelete(null);
        setSnackbarMsg("");
    };

    const openModal = (prod = null) => {
        setEditingProduct(prod);
        setIsModalOpen(true);
    };

    const handleProductSaved = (data, verb) => {
        setIsModalOpen(false);
        setSnackbarMsg(`Producto ${verb} exitosamente`);
        setTimeout(() => {
            window.location.reload(); 
        }, 1500);
    };

    return (
        <div className={styles.dashboardWrapper}>
            <AdminAppBar 
                user={user} 
                negocioData={negocioData} 
                onLogout={handleLogout} 
                onProfileClick={() => setIsProfileOpen(true)}
            />

            <div className={styles.mainContent}>
                <div className={styles.cardContainer}>
                    {products.length === 0 ? (
                        <div className={styles.emptyState}>No hay productos registrados en tu catálogo. Toca el botón "+" para comenzar.</div>
                    ) : (
                        products.map(prod => (
                            <AdminProductCard 
                                key={prod.id} 
                                product={prod} 
                                onEdit={() => openModal(prod)}
                                onDelete={() => triggerDeleteProduct(prod)}
                            />
                        ))
                    )}
                </div>
            </div>

            <AdminFab onClick={() => openModal(null)} />

            {isModalOpen && (
                <ProductModal 
                    onClose={() => setIsModalOpen(false)} 
                    negocioId={negocioData.id}
                    categorias={categorias}
                    product={editingProduct}
                    onSave={handleProductSaved}
                />
            )}

            {/* Custom Snackbar para Confirmar / Info */}
            {snackbarMsg && (
                <div className={styles.snackbar}>
                    <span className={styles.snackText}>{snackbarMsg}</span>
                    {productToDelete && (
                        <div className={styles.snackbarActions}>
                            <button className={styles.snackBtnClose} onClick={cancelDelete}>Cancelar</button>
                            <button className={styles.snackBtn} onClick={confirmDelete}>Eliminar</button>
                        </div>
                    )}
                </div>
            )}

            {isProfileOpen && (
                <ProfileModal 
                    onClose={() => setIsProfileOpen(false)} 
                    negocioData={negocioData}
                    onSave={() => {
                        setIsProfileOpen(false);
                        setSnackbarMsg("Perfil y Redes guardados exitosamente");
                        setTimeout(() => window.location.reload(), 1500);
                    }}
                />
            )}
        </div>
    );
}
