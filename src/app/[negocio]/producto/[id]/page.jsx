import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";
import { Header } from "../../../../components/Header";
import { Fab } from "../../../../components/Fab";
import { Footer } from "../../../../components/Footer";
import { SocialIcons } from "../../../../components/SocialIcons";
import { ProductDetails } from "./ProductDetails";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { createClient } = await import("@/utils/supabase/server");
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: product } = await supabase
    .from("productos")
    .select("nombre, descripcion, producto_imagenes(url, orden)")
    .eq("id", id)
    .single();

  if (!product) return {};

  const sortedImages = (product.producto_imagenes || []).sort((a,b) => (a.orden || 0) - (b.orden || 0));
  const mainImageUrl = sortedImages[0]?.url || "https://placehold.co/800x800?text=No+Image";

  return {
    title: product.nombre,
    description: product.descripcion || `Adquiere ${product.nombre} al mejor precio.`,
    openGraph: {
      title: product.nombre,
      description: product.descripcion || `Conoce los detalles y promociones de ${product.nombre}`,
      images: [
        {
          url: mainImageUrl,
          width: 800,
          height: 800,
          alt: product.nombre
        }
      ]
    }
  };
}

export default async function ProductPage({ params }) {
  const { negocio, id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Info del negocio (header, estilos globales de tenant, whastapp)
  const { data: negocioData } = await supabase
    .from("negocio")
    .select("id, ciudad, nombre, logo_url_sm")
    .eq("slug", negocio)
    .single();

  if (!negocioData) {
      notFound();
  }

  let whatsappNumber = "";
  const { data: redes } = await supabase
      .from("negocio_redes")
      .select("red, link")
      .eq("negocio_id", negocioData.id);
      
  if (redes) {
      const wa = redes.find(r => r.red?.toLowerCase().trim() === 'whatsapp');
      if (wa && wa.link) {
          const parts = wa.link.split('/').filter(Boolean);
          if (parts.length > 0) {
              whatsappNumber = parts[parts.length - 1];
          }
      }
  }

  // 2. Info del producto por ID
  const { data: product, error } = await supabase
    .from("productos")
    .select("*, producto_imagenes(*), categorias(categoria), producto_presentaciones(*)")
    .eq("id", id)
    .single();

  if (error || !product) {
      notFound();
  }

  const IconoSVG = SocialIcons["whatsapp"];

  // 3. Crear Estructura SEO (JSON-LD) para las Google Bots
  const precios = product.producto_presentaciones?.map(p => p.precio_oferta > 0 ? p.precio_oferta : p.precio) || [];
  const minPrecio = precios.length > 0 ? Math.min(...precios) : 0;
  
  const mainImage = (product.producto_imagenes || []).sort((a,b) => (a.orden||0) - (b.orden||0))[0]?.url || "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.nombre,
    "image": [mainImage].filter(Boolean),
    "description": product.descripcion || `Adquiere ${product.nombre} en ${negocioData.nombre}.`,
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "BOB",
      "lowPrice": minPrecio > 0 ? minPrecio : undefined,
      "offerCount": product.producto_presentaciones?.length || 1,
      "availability": product.producto_presentaciones?.some(p => p.disponible) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": negocioData.nombre
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header whatsapp={whatsappNumber} negocioCiudad={negocioData?.ciudad} logo={negocioData?.logo_url_sm} />
      
      <main style={{ flex: 1, backgroundColor: 'var(--background)' }}>
        <ProductDetails product={product} />
      </main>

      <Fab whatsappNumber={whatsappNumber} IconoSVG={IconoSVG} />
      <Footer negocioNombre={negocioData?.nombre} />
    </div>
  );
}