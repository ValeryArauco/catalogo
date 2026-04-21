import React from "react";
import styles from "./admin.module.css";

export default function AdminFab({ onClick }) {
    return (
        <button className={styles.fab} aria-label="Añadir producto" onClick={onClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
        </button>
    );
}
