import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default async function AdminPage({ params }) {
  const { negocio } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${negocio}/login`);
  }

  const { data: negocioData } = await supabase
    .from("negocio")
    .select("id, slug, nombre, descripcion, logo_url, banner_url, ciudad, envios_nac, envios_dom, recojo_local")
    .eq("slug", negocio)
    .single();

  if(!negocioData) {
      redirect(`/${negocio}/login`);
  }

  const { data: initialProducts } = await supabase
      .from("productos")
      .select("*, producto_imagenes(*), categorias(categoria), producto_presentaciones(*)")
      .eq("negocio_id", negocioData.id)
      .order("nombre", { ascending: true });

  const { data: categorias } = await supabase.from('categorias').select('id, categoria');

  return (
    <div style={{ backgroundColor: 'var(--background)' }}>
        <AdminDashboardClient 
            user={user} 
            negocioData={negocioData} 
            initialProducts={initialProducts || []}
            categorias={categorias || []} 
        />
    </div>
  );
}