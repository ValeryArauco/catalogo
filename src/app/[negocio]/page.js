import styles from "../page.module.css";

import {Header} from "../../components/Header"
import {Banner} from "../../components/Banner"
import {Products} from "../../components/Products"
import { createClient } from "../../utils/supabase/server";
import { cookies } from "next/headers";
import { SocialIcons } from "@/components/SocialIcons";
import { Fab } from "@/components/Fab";
import { Footer } from "@/components/Footer";

export default async function Home({ params, searchParams }) {
  const { negocio } = await params;
  
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || "";
  const categoryId = resolvedSearchParams?.c || "";
  const page = parseInt(resolvedSearchParams?.page) || 1;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: negocioData } = await supabase
    .from("negocio")
    .select("id, ciudad, logo_url_sm")
    .eq("slug", negocio)
    .single();

  let whatsappNumber = "";
  if (negocioData?.id) {
      const { data: redes } = await supabase
          .from("negocio_redes")
          .select("red, link")
          .eq("negocio_id", negocioData.id);
          
      if (redes) {
          const wa = redes.find(r => r.red?.toLowerCase().trim() === 'whatsapp');
          if (wa && wa.link) {
              // Extraer dígitos (o texto) después del último slash "/"
              const parts = wa.link.split('/').filter(Boolean);
              if (parts.length > 0) {
                  whatsappNumber = parts[parts.length - 1];
              }
          }
      }
  }
  const IconoSVG = SocialIcons["whatsapp"];

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Header whatsapp={whatsappNumber} negocioCiudad={negocioData?.ciudad} logo={negocioData?.logo_url_sm} />
        <Banner slug={negocio} />
        <Products slug={negocio} query={query} categoryId={categoryId} page={page} />
        <Fab whatsappNumber={whatsappNumber} IconoSVG={IconoSVG} />
        <Footer />
      </main>
    </div>

  );
}
