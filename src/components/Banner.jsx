import React from "react";
import { createClient } from "../utils/supabase/server";
import { cookies } from "next/headers";
import { SocialIcons } from "./SocialIcons";

import styles from "./Banner.module.css";

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.86002 18C9.72291 17.9996 9.58735 17.9709 9.46177 17.9159C9.33618 17.8608 9.22326 17.7805 9.13002 17.68L4.27002 12.51C4.08835 12.3164 3.99103 12.0585 3.99947 11.7932C4.00791 11.5278 4.12142 11.2767 4.31502 11.095C4.50863 10.9133 4.76648 10.816 5.03184 10.8244C5.29721 10.8329 5.54835 10.9464 5.73002 11.14L9.85003 15.53L18.26 6.33C18.3454 6.22372 18.4515 6.13602 18.572 6.07227C18.6925 6.00851 18.8247 5.97007 18.9606 5.95928C19.0965 5.9485 19.2331 5.9656 19.3622 6.00955C19.4912 6.0535 19.6099 6.12336 19.7109 6.21485C19.8119 6.30633 19.8932 6.41751 19.9497 6.54154C20.0062 6.66558 20.0368 6.79986 20.0395 6.93614C20.0423 7.07242 20.0171 7.20781 19.9656 7.33401C19.9141 7.46021 19.8373 7.57455 19.74 7.67L10.6 17.67C10.5077 17.7724 10.3951 17.8545 10.2695 17.9113C10.1439 17.9681 10.0079 17.9983 9.87002 18H9.86002Z" fill="white"/>
</svg>


);

const CrossIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.41 12L17.71 7.71C17.8983 7.5217 18.0041 7.2663 18.0041 7C18.0041 6.7337 17.8983 6.47831 17.71 6.29C17.5217 6.1017 17.2663 5.99591 17 5.99591C16.7337 5.99591 16.4783 6.1017 16.29 6.29L12 10.59L7.71 6.29C7.5217 6.1017 7.2663 5.99591 7 5.99591C6.7337 5.99591 6.4783 6.1017 6.29 6.29C6.1017 6.47831 5.99591 6.7337 5.99591 7C5.99591 7.2663 6.1017 7.5217 6.29 7.71L10.59 12L6.29 16.29C6.19627 16.383 6.12188 16.4936 6.07111 16.6154C6.02034 16.7373 5.9942 16.868 5.9942 17C5.9942 17.132 6.02034 17.2627 6.07111 17.3846C6.12188 17.5064 6.19627 17.617 6.29 17.71C6.38296 17.8037 6.49356 17.8781 6.61542 17.9289C6.73728 17.9797 6.86799 18.0058 7 18.0058C7.13201 18.0058 7.26272 17.9797 7.38458 17.9289C7.50644 17.8781 7.61704 17.8037 7.71 17.71L12 13.41L16.29 17.71C16.383 17.8037 16.4936 17.8781 16.6154 17.9289C16.7373 17.9797 16.868 18.0058 17 18.0058C17.132 18.0058 17.2627 17.9797 17.3846 17.9289C17.5064 17.8781 17.617 17.8037 17.71 17.71C17.8037 17.617 17.8781 17.5064 17.9289 17.3846C17.9797 17.2627 18.0058 17.132 18.0058 17C18.0058 16.868 17.9797 16.7373 17.9289 16.6154C17.8781 16.4936 17.8037 16.383 17.71 16.29L13.41 12Z" fill="white"/>
</svg>

);

const ShippingOption = ({ isAvailable, label }) => (
    <li className={!isAvailable ? styles.disabledOption : ""}>
        <span className={styles.icon}>{isAvailable ? <CheckIcon /> : <CrossIcon />}</span>
        <p>{label}</p>
    </li>
);

export const Banner = async ({ slug }) => {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: negocios, error } = await supabase
        .from("negocio")
        .select("*")
        .eq("slug", slug)
        .limit(1);

    if (error) {
        console.error("Error obteniendo el negocio:", error.message);
    }

    const negocio = negocios?.[0];
    
    // Imprimimos el objeto devuelto por Supabase para depuración
    console.log("=== DATOS DEL NEGOCIO ===", negocio);

    let redes = [];
    if (negocio?.id) {
        // Consultamos la tabla relacionada enviando el id del negocio
        const { data: redesSociales, error: errorRedes } = await supabase
            .from("negocio_redes")
            .select("*")
            .eq("negocio_id", negocio.id);
            
        if (!errorRedes) {
            redes = redesSociales || [];
        } else {
            console.error("Error obteniendo redes:", errorRedes.message);
        }
    }

    if (!negocio) {
        return (
            <div className="banner">
                <div className="details">
                    <h1>Negocio "{slug}" no encontrado</h1>
                </div>
            </div>
        );
    }

    // Por defecto usamos una imagen vacia o genérica si la columna no existe o está vacía
    const imagenFondo = negocio.bannerUrl || negocio.banner_url || "https://images.unsplash.com/photo-1517487895467-b27f148cf5a3?q=80&w=2070&auto=format&fit=crop";
    const imagenLogo = negocio.logoUrl || negocio.logo_url || "https://images.unsplash.com/photo-1517487895467-b27f148cf5a3?q=80&w=2070&auto=format&fit=crop";
    return (
        <div className={styles.banner}>
            <div 
                className={styles.background}
                style={{ backgroundImage: `url(${imagenFondo})` }}
            >

            </div>
            <div className={styles.details}>
                <div className={styles.logo}
                style={{backgroundImage: `url(${imagenLogo})`}}
                ></div>
                
                <h1 className={styles.name}>{negocio.nombre || "Nombre del negocio"}</h1>
                
                <p className={styles.description}>{negocio.descripcion || "Descripción del negocio"}</p>
                <div className={styles.location}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 11C12.8284 11 13.5 10.3284 13.5 9.5C13.5 8.67157 12.8284 8 12 8C11.1716 8 10.5 8.67157 10.5 9.5C10.5 10.3284 11.1716 11 12 11Z" fill="black"/>
                        <path d="M12 2C9.89206 1.99989 7.86926 2.83176 6.37124 4.31479C4.87323 5.79782 4.02108 7.81216 4 9.92C4 15.4 11.05 21.5 11.35 21.76C11.5311 21.9149 11.7616 22.0001 12 22.0001C12.2384 22.0001 12.4689 21.9149 12.65 21.76C13 21.5 20 15.4 20 9.92C19.9789 7.81216 19.1268 5.79782 17.6288 4.31479C16.1307 2.83176 14.1079 1.99989 12 2ZM12 13C11.3078 13 10.6311 12.7947 10.0555 12.4101C9.47993 12.0256 9.03133 11.4789 8.76642 10.8394C8.50151 10.1999 8.4322 9.49612 8.56725 8.81718C8.7023 8.13825 9.03564 7.51461 9.52513 7.02513C10.0146 6.53564 10.6382 6.2023 11.3172 6.06725C11.9961 5.9322 12.6999 6.00151 13.3394 6.26642C13.9789 6.53133 14.5256 6.97993 14.9101 7.5555C15.2947 8.13108 15.5 8.80777 15.5 9.5C15.5 10.4283 15.1313 11.3185 14.4749 11.9749C13.8185 12.6313 12.9283 13 12 13Z" fill="black"/>
                    </svg>
                    <p>{negocio.ciudad || "Bolivia"}</p>
                </div>
                
                <a href="#productos" className={styles.buttonPrimary}>Ver productos</a>
                <details className={styles.envios}>
                    <summary>Formas de envio</summary>
                    <ul>
                        <ShippingOption isAvailable={negocio.envios_nac} label="Envíos Nacionales" />
                        <ShippingOption isAvailable={negocio.envios_dom} label="Envíos a Domicilio" />
                        <ShippingOption isAvailable={negocio.recojo_local} label="Recojo en Tienda" />
                    </ul>
                </details>
                <details className={styles.contacto} >
                    <summary>Contacto</summary>
                    <ul>
                        {redes.length === 0 && <li>No hay redes registradas</li>}
                        
                        {redes.map(red => {
                            // Obtenemos el ícono del diccionario ("facebook", "instagram", etc)
                            const nombreLlave = red.red?.toLowerCase() || "";
                            const IconoSVG = SocialIcons[nombreLlave];

                            return (
                                
                                <li key={red.id || nombreLlave}>
                                    <a href={red.link} target="_blank" rel="noopener noreferrer">
                                    <div className={styles.link}>
                                        {IconoSVG && <span className={styles.icon}>{IconoSVG}</span>}
                                    
                                     <p>
                                        {/* Capitalizamos la primera letra */}
                                        {red.red.charAt(0).toUpperCase() + red.red.slice(1)}
                                    </p>
                                    
                                    </div>
                                    
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20 11C19.7348 11 19.4804 11.1054 19.2929 11.2929C19.1054 11.4804 19 11.7348 19 12V18C19 18.2652 18.8946 18.5196 18.7071 18.7071C18.5196 18.8946 18.2652 19 18 19H6C5.73478 19 5.48043 18.8946 5.29289 18.7071C5.10536 18.5196 5 18.2652 5 18V6C5 5.73478 5.10536 5.48043 5.29289 5.29289C5.48043 5.10536 5.73478 5 6 5H12C12.2652 5 12.5196 4.89464 12.7071 4.70711C12.8946 4.51957 13 4.26522 13 4C13 3.73478 12.8946 3.48043 12.7071 3.29289C12.5196 3.10536 12.2652 3 12 3H6C5.20435 3 4.44129 3.31607 3.87868 3.87868C3.31607 4.44129 3 5.20435 3 6V18C3 18.7956 3.31607 19.5587 3.87868 20.1213C4.44129 20.6839 5.20435 21 6 21H18C18.7956 21 19.5587 20.6839 20.1213 20.1213C20.6839 19.5587 21 18.7956 21 18V12C21 11.7348 20.8946 11.4804 20.7071 11.2929C20.5196 11.1054 20.2652 11 20 11Z" fill="black"/>
<path d="M16 5H17.58L11.29 11.28C11.1963 11.373 11.1219 11.4836 11.0711 11.6054C11.0203 11.7273 10.9942 11.858 10.9942 11.99C10.9942 12.122 11.0203 12.2527 11.0711 12.3746C11.1219 12.4964 11.1963 12.607 11.29 12.7C11.383 12.7937 11.4936 12.8681 11.6154 12.9189C11.7373 12.9697 11.868 12.9958 12 12.9958C12.132 12.9958 12.2627 12.9697 12.3846 12.9189C12.5064 12.8681 12.617 12.7937 12.71 12.7L19 6.42V8C19 8.26522 19.1054 8.51957 19.2929 8.70711C19.4804 8.89464 19.7348 9 20 9C20.2652 9 20.5196 8.89464 20.7071 8.70711C20.8946 8.51957 21 8.26522 21 8V4C21 3.73478 20.8946 3.48043 20.7071 3.29289C20.5196 3.10536 20.2652 3 20 3H16C15.7348 3 15.4804 3.10536 15.2929 3.29289C15.1054 3.48043 15 3.73478 15 4C15 4.26522 15.1054 4.51957 15.2929 4.70711C15.4804 4.89464 15.7348 5 16 5Z" fill="black"/>
</svg>
</a>

                                </li>
                                
                            );
                        })}
                    </ul>
                </details>
            </div>
            <div className={styles.divider}>
                <hr />
            </div>
        </div>
    );
};