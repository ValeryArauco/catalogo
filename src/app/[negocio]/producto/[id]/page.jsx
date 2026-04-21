import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";
import { Header } from "../../../../components/Header";
import { Fab } from "../../../../components/Fab";
import { Footer } from "../../../../components/Footer";
import { SocialIcons } from "../../../../components/SocialIcons";
import { ProductDetails } from "./ProductDetails";
import { notFound } from "next/navigation";

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header whatsapp={whatsappNumber} negocioCiudad={negocioData?.ciudad} logo={negocioData?.logo_url_sm} />
      
      <main style={{ flex: 1, backgroundColor: 'var(--background)' }}>
        <ProductDetails product={product} />
      </main>

      <Fab whatsappNumber={whatsappNumber} IconoSVG={IconoSVG} />
      <Footer negocioNombre={negocioData?.nombre} />
    </div>
  );
}