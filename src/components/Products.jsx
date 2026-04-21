import React from "react";
import {Product} from "./Product";
import { createClient } from "../utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import styles from "./Products.module.css";
import { SortDropdown } from "./SortDropdown";

export const Products = async ({ slug, query, categoryId, page, sort = "nombre.asc" }) => {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // 1. Obtener ID del negocio usando el slug
    const { data: negocioData, error: negocioError } = await supabase
        .from("negocio")
        .select("id")
        .eq("slug", slug)
        .single();
        
    if (negocioError || !negocioData) {
        return <div className={styles.emptyState}>No encontramos los productos para este negocio.</div>;
    }
    const negocioId = negocioData.id;

    // 2. Configurar paginación
    const ITEMS_PER_PAGE = 8;
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    // 3. Consultar productos de ESE negocio en específico y que estén activos
    const [sortField, sortOrder] = sort.split('.');
    const isAscending = sortOrder === 'asc';

    let dbQuery = supabase
        .from("productos")
        .select("*, producto_imagenes(*), categorias(categoria), producto_presentaciones(*)", { count: 'exact' })
        .eq("negocio_id", negocioId)
        .eq("activo", true);

    // Aplicar buscador si el usuario escribió algo
    if (query) {
        dbQuery = dbQuery.ilike("nombre", `%${query}%`);
    }

    // Filtrar por categoría
    if (categoryId) {
        dbQuery = dbQuery.eq("categoria_id", categoryId);
    }
    
    // Si ordenamos por nombre, podemos paginar desde SQL ahorrando memoria
    if (sortField === 'nombre') {
        dbQuery = dbQuery.range(from, to).order('nombre', { ascending: isAscending });
    }

    const { data: products, error, count } = await dbQuery;

    if (error) {
        console.error("Error al obtener productos:", error.message);
    }

    // Obtener CATEGORÍAS (sin paginación, queremos mostrarlas todas)
    const { data: categorias, error: categoriasError } = await supabase
        .from("categorias")
        .select("*")
        .eq("negocio_id", negocioId)
        .eq("activo", true)
        .order('categoria', { ascending: true });

    if (categoriasError) {
        console.error("Error al obtener categorias:", categoriasError.message);
    }
    
    let listadoProductos = products || [];
    let totalCount = count || 0;

    // Si ordenamos por precio, se realiza en memoria porque el precio está en una tabla relacionada (1 a muchos)
    if (sortField === 'precio') {
        listadoProductos.sort((a, b) => {
            const getMinPrice = (prod) => {
                const pres = prod.producto_presentaciones?.filter(p => p.activo) || [];
                if (pres.length === 0) return 99999999;
                return Math.min(...pres.map(p => (p.precio_oferta && p.precio_oferta > 0) ? p.precio_oferta : p.precio));
            };
            const priceA = getMinPrice(a);
            const priceB = getMinPrice(b);
            return isAscending ? (priceA - priceB) : (priceB - priceA);
        });
        
        totalCount = listadoProductos.length;
        listadoProductos = listadoProductos.slice(from, to + 1);
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    // Helpers para construir URLs limpias manteniendo estados
    const baseQuery = query ? `q=${query}&` : "";
    const baseCat = categoryId ? `c=${categoryId}&` : "";

    return (
        <div className={styles.container} id="productos">
            <h2 className={styles.title}>Catálogo</h2>
            
            <div className={styles.categoriesWrapper}>
                <Link 
                    href={`?${query ? `q=${query}` : ""}#productos`} 
                    className={`${styles.categoryChip} ${!categoryId ? styles.active : ''}`}
                >
                    Todos
                </Link>
                {categorias?.map((categoria) => (
                    <Link 
                        key={categoria.id} 
                        href={`?${baseQuery}c=${categoria.id}#productos`}
                        className={`${styles.categoryChip} ${categoryId == categoria.id ? styles.active : ''}`}
                    >
                        {categoria.categoria}
                    </Link>
                ))}
            </div>
            
            
            {listadoProductos.length === 0 ? (
                <div className={styles.emptyState}>
                    No se encontraron productos en esta categoría o búsqueda.
                </div>
            ) : (
                <div className={styles.grid}>
                    {listadoProductos.map((product) => (
                        <Product key={product.id} product={product} />
                    ))}
                </div>
            )}

            {/* Componente de Paginación */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    {page > 1 ? (
                        <Link 
                            href={`?${baseQuery}${baseCat}page=${page - 1}#productos`}
                            className={styles.pageButton}
                        >
                            ← Anterior
                        </Link>
                    ) : (
                        <button disabled className={styles.pageButtonDisabled}>
                            ← Anterior
                        </button>
                    )}
                    
                    <span className={styles.pageIndicator}>
                        Página {page} de {totalPages}
                    </span>
                    
                    {page < totalPages ? (
                        <Link 
                            href={`?${baseQuery}${baseCat}page=${page + 1}#productos`}
                            className={styles.pageButton}
                        >
                            Siguiente →
                        </Link>
                    ) : (
                        <button disabled className={styles.pageButtonDisabled}>
                            Siguiente →
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};