import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function sitemap() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Obtener URL Base del entorno (en producción debe ser tu dominio real)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // 1. Consultar todos los negocios (tiendas online)
  const { data: negocios } = await supabase
    .from("negocio")
    .select("slug");

  const negocioUrls = (negocios || []).map((negocio) => ({
    url: `${baseUrl}/${negocio.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 1.0,
  }));

  // 2. Consultar todos los productos activos
  const { data: productos } = await supabase
    .from("productos")
    .select("id, negocio_id, negocio!inner(slug)")
    .eq("activo", true);

  const productoUrls = (productos || []).map((producto) => ({
    url: `${baseUrl}/${producto.negocio.slug}/producto/${producto.id}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Combinar Rutas Fijas (Generales) + Rutas Negocios + Rutas Productos
  const rutasEstaticas = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.5,
    }
  ];

  return [...rutasEstaticas, ...negocioUrls, ...productoUrls];
}
