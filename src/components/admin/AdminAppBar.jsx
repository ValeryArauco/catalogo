import React, { useState } from "react";
import styles from "./admin.module.css";

export default function AdminAppBar({ user, negocioData, onLogout, onProfileClick }) {
    const [open, setOpen] = useState(false);

    const toggleMenu = () => setOpen(!open);

    const initial = user?.email ? user.email.charAt(0).toUpperCase() : "A";

    return (
        <header className={styles.appBar}>
            <h1 className={styles.appBarTitle}>Panel Control - {negocioData?.nombre || negocioData?.slug}</h1>
            
            <div className={styles.appBarActions}>
                <button className={styles.avatarBtn} onClick={toggleMenu} aria-label="Perfil de usuario">
                    <div className={styles.avatar}>{initial}</div>
                </button>
                
                {open && (
                    <div className={styles.dropdownMenu}>
                        <button className={styles.dropdownItem} onClick={() => { setOpen(false); onProfileClick(); }}>Perfil</button>
                        <button className={styles.dropdownItem} onClick={onLogout}>Cerrar Sesión</button>
                    </div>
                )}
            </div>
        </header>
    );
}
