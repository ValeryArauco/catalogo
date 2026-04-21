import styles from "./Footer.module.css";

export const Footer = ({ negocioNombre }) => {
    // Generador de mensaje pre-llenado para WhatsApp
    const mensaje = encodeURIComponent("¡Hola! Estaba viendo un catálogo web y me gustaría obtener uno para mi propio negocio.");
    const waLink = `https://wa.me/59175269450?text=${mensaje}`;

    // Validar nombre del negocio para que sea dinámico si gustas en el futuro
    const nombre = negocioNombre || "N&V Cosmetica Natural";

    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <p className={styles.copyright}>&copy; {new Date().getFullYear()} Todos los derechos reservados a {nombre}</p>
                <p className={styles.developer}>
                    Desarrollado por <a href={waLink} target="_blank" rel="noopener noreferrer">Code by V</a>
                </p>
                <a href={waLink} className={styles.cta} target="_blank" rel="noopener noreferrer">
                    Quiero un catálogo web para mi negocio
                </a>
            </div>
        </footer>
    );
};