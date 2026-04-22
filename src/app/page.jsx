import React from "react";
import styles from "./landing.module.css";

export const metadata = {
    title: "Code by V | Catálogo y Herramientas Digitales",
    description: "Construimos bloque a bloque junto con tu negocio. Catálogos dinámicos conectados a WhatsApp, integraciones a medida y digitalización real para empresas bolivianas.",
    openGraph: {
        title: "Code by V | Catálogo y Herramientas Digitales",
        description: "Construimos bloque a bloque junto con tu negocio. Catálogos dinámicos y digitales para emprendedores.",
        siteName: "Code by V"
    }
};

// --- ICONOS SVG ESTANDARIZADOS ---
const BoltIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);
const ImageGalleryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
);
const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
);
const ToolPlugIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-5"></path><path d="M9 8V2"></path><path d="M15 8V2"></path><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"></path></svg>
);
const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
);

export default function LandingPage() {
    const waPhone = "59175269450";
    const waLinkCatalogo = `https://wa.me/${waPhone}?text=Hola%20equipo%20Code%20by%20V,%20me%20interesa%20tener%20mi%20cat%C3%A1logo%20din%C3%A1mico.`;
    const waLinkDesarrollo = `https://wa.me/${waPhone}?text=Hola%20equipo%20Code%20by%20V,%20quiero%20conversar%20sobre%20una%20integraci%C3%B3n%20a%20medida%20para%20mi%20negocio.`;

    return (
        <div className={styles.page}>
            {/* --- NAVBAR --- */}
            <nav className={styles.navbar}>
                <img 
                    src="/code-by-v-logo.png" 
                    alt="Code by V Logo" 
                    className={styles.logoImage}
                />
                <a href={waLinkCatalogo} target="_blank" rel="noopener noreferrer" className={styles.navButton}>
                    Contactar
                </a>
            </nav>

            {/* --- HERO ASIMETRICO --- */}
            <header className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={`${styles.title} ${styles.heroTitle}`}>
                        Deja atrás el <br/> <span className={styles.textFocus}>PDF estático.</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Tus clientes quieren ver qué tienes ahora mismo, no en el catálogo de ayer. 
                        <strong> catalogo.by-v</strong> es la herramienta que te permite construir bloque a bloque la estructura de tus ventas. Fácil, visual y siempre sincronizado.
                    </p>
                    <div className={styles.ctaGroup} style={{ marginTop: '1rem', justifyContent: 'flex-start' }}>
                        <a href={waLinkCatalogo} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
                            Quiero un catálogo dinámico
                        </a>
                    </div>
                </div>
                <div className={styles.heroVisual}>
                    <div className={styles.hugeHex}></div>
                </div>
            </header>

            {/* --- SECCION PANAL (SOLUCIONES) --- */}
            <section className={styles.honeycombSection}>
                <h2 className={styles.title} style={{ fontSize: 'clamp(1.5rem, 6vw, 4rem)', maxWidth: '800px', lineHeight: '1.2' }}>
                    Construido a tu ritmo, <br/>ágil como tú.
                </h2>
                <div className={styles.honeyGrid}>
                    <div className={styles.honeyCard}>
                        <div className={styles.hexagon}><BoltIcon /></div>
                        <h3>Al Instante</h3>
                        <p>Actualiza precios u oculta productos agotados con un clic. Todos tus compradores verán la versión definitiva al momento.</p>
                    </div>
                    <div className={`${styles.honeyCard} ${styles.honeyCardShifted}`}>
                        <div className={styles.hexagon}><ImageGalleryIcon /></div>
                        <h3>Visual y Ligero</h3>
                        <p>No más fotos de baja resolución. Tu catálogo recorta y optimiza las galerías de productos en la nube para cargar velozmente.</p>
                    </div>
                    <div className={styles.honeyCard}>
                        <div className={styles.hexagon}><PackageIcon /></div>
                        <h3>Directo al WhatsApp</h3>
                        <p>El cliente arma su carrito sin complicaciones y tú recibes la orden de pedido detallada directamente en el chat.</p>
                    </div>
                </div>
            </section>

            {/* --- LA EXPANSIÓN (BLOQUES ASIMETRICOS) --- */}
            <section className={styles.servicesSection}>
                <div className={styles.servicesText}>
                    <h2 className={styles.title} style={{ fontSize: 'clamp(1.5rem, 6vw, 3.5rem)', marginBottom: '1.5rem' }}>
                        Crecemos junto con tu empresa.
                    </h2>
                    <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', lineHeight: '1.7', color: '#111', fontWeight: '500' }}>
                        Sabemos que cada negocio es distinto. Por eso no te empaquetamos sistemas inmensos e innecesarios desde el día uno. Trabajamos contigo "bloque a bloque". Empezamos por tu catálogo y añadimos funciones cuando estés listo para escalar.
                    </p>
                </div>
                
                <div className={styles.servicesGrid}>
                    <div className={styles.srvBlock}>
                        <div className={styles.hexagon}><CodeIcon /></div>
                        <h3>Landings y Webs a Medida</h3>
                        <p>Cuando necesites más que un catálogo, diseñaremos máquinas de ventas o portafolios web con tu identidad propia, enfocados no en verse bonitos, sino en captar clientes de verdad.</p>
                    </div>
                    <div className={styles.srvBlock}>
                        <div className={styles.hexagon}><ToolPlugIcon /></div>
                        <h3>Integraciones Graduales</h3>
                        <p>¿Ya usas otras herramientas de venta, inventarios, o sistemas contables? Perfecto. No necesitamos borrar tu progreso. Construimos puentes y conectamos nuevas funcionalidades a la maquinaria que ya dominas.</p>
                    </div>
                </div>
            </section>

            {/* --- EL ORIGEN / EL GUÍA --- */}
            <section className={styles.originSection}>
                <h2 className={styles.title} style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}>Code by V</h2>
                <p>
                    Una iniciativa Boliviana para agilizar a medianos y pequeños emprendedores. 
                    En vez de obligarte a comprar suscripciones genéricas, queremos darte las herramientas tecnológicas exactas que requiere tu ritmo comercial y construir juntos el futuro de tus ventas sin perder el toque de autenticidad nacional.
                </p>
            </section>

            {/* --- EL CLÍMAX / CTA FINAL --- */}
            <section className={styles.ctaSection}>
                <h2 className={styles.title}>Listos para operar.</h2>
                <div className={styles.ctaGroup}>
                    <a href={waLinkCatalogo} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
                        Activar mi Catálogo (Start)
                    </a>
                    <a href={waLinkDesarrollo} target="_blank" rel="noopener noreferrer" className={styles.btnOutline}>
                        Contactar (Scale)
                    </a>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className={styles.footer}>
                <div>CODE BY V | TECNOLOGÍA BOLIVIANA</div>
                <div style={{ marginTop: '0.8rem', color: '#666', fontSize: '0.8rem' }}>© {new Date().getFullYear()} Todos los derechos reservados.</div>
            </footer>
        </div>
    );
}