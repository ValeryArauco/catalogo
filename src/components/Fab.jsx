import styles from "./Fab.module.css";

export const Fab = ({ whatsappNumber, IconoSVG }) => {
    return (
        <div className={styles['fab']}>
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                {IconoSVG}
            </a>
        </div>
    );
};