import styles from "./Fab.module.css";

export const Fab = ({ whatsappNumber, IconoSVG }) => {

    const mensaje = encodeURIComponent("¡Hola! Estaba viendo su catálogo web y me gustaría comprar...");
    const waLink = `https://wa.me/${whatsappNumber}?text=${mensaje}`;

    return (
        <div className={styles['fab']}>
            <a href={waLink} target="_blank" rel="noopener noreferrer">
                {IconoSVG}
            </a>
        </div>
    );
};