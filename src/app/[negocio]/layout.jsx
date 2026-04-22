import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export function getThemeStyles(hexCol) {
    if (!hexCol) return {};
    
    // Sanitizar
    let hex = hexCol.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(x => x + x).join('');
    }
    if (hex.length !== 6) return {}; // fallback silencioso si falla
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calcular el hover (oscurecemos el color un 15%)
    const hoverR = Math.floor(r * 0.85);
    const hoverG = Math.floor(g * 0.85);
    const hoverB = Math.floor(b * 0.85);
    const hoverHex = `#${hoverR.toString(16).padStart(2,'0')}${hoverG.toString(16).padStart(2,'0')}${hoverB.toString(16).padStart(2,'0')}`;

    // Calcular el contraste (Luminancia para On-Primary)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    // Si el color primario es muy brillante/claro, usamos azul marino oscuro, sino usamos blanco limpio.
    const onPrimary = luminance > 0.6 ? '#001d33' : '#ffffff';

    return {
        '--primary': `#${hex}`,
        '--primary-hover': hoverHex,
        '--on-primary': onPrimary
    };
}

export async function generateMetadata({ params }) {
    const { negocio } = await params;
    
    // Al ser Server Component aislado podemos llamar a Supabase puro para Metadata
    // IMPORTANTE: Este no necesita cookies si es público, pero respetamos la instancia existente
    const { createClient } = await import("@/utils/supabase/server");
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: negocioData } = await supabase
        .from("negocio")
        .select("nombre, descripcion, logo_url")
        .eq("slug", negocio)
        .single();

    if (!negocioData) {
        return {
            title: "Tienda no encontrada"
        };
    }

    return {
        title: {
            template: `%s | ${negocioData.nombre}`,
            default: `Catálogo ${negocioData.nombre}`,
        },
        description: negocioData.descripcion || `Catálogo digital oficial y tienda en línea de ${negocioData.nombre}`,
        openGraph: {
            title: `Catálogo de ${negocioData.nombre}`,
            description: negocioData.descripcion || `Explora nuestros productos y ofertas.`,
            siteName: negocioData.nombre,
            images: negocioData.logo_url ? [
                {
                    url: negocioData.logo_url,
                    width: 800,
                    height: 800,
                    alt: `Logotipo de ${negocioData.nombre}`
                }
            ] : [],
        },
        icons: {
            icon: negocioData.logo_url || '/favicon.ico',
            apple: negocioData.logo_url || '/favicon.ico',
        }
    };
}

export default async function NegocioLayout({ children, params }) {
    const { negocio } = await params;
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: negocioData } = await supabase
        .from("negocio")
        .select("color_primario")
        .eq("slug", negocio)
        .single();

    // Calculamos todas las variables hijas basadas en el código hex proveniente de supabase
    const themeStyles = getThemeStyles(negocioData?.color_primario || "#3AA8DF");

    return (
        <div style={themeStyles}>
            {children}
        </div>
    );
}
