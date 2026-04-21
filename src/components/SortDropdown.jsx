"use client";
import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styles from './SortDropdown.module.css';

export const SortDropdown = ({ currentSort }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleChange = (e) => {
        const params = new URLSearchParams(searchParams);
        params.set('sort', e.target.value);
        params.delete('page'); // Volver a la primera página
        router.push(`${pathname}?${params.toString()}#productos`, { scroll: false });
    };

    return (
        <div className={styles.sort}>
            <p className={styles.label}>Ordenar por:</p>
            <div className={styles.selectWrapper}>
                <select 
                    name="sort" 
                    id="sort" 
                    value={currentSort}
                    onChange={handleChange}
                    className={styles.select}
                >
                    <option value="nombre.asc">Alfabético A-Z</option>
                    <option value="nombre.desc">Alfabético Z-A</option>
                    <option value="precio.asc">Menor precio</option>
                    <option value="precio.desc">Mayor precio</option>
                </select>
                <div className={styles.icon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
                    </svg>
                </div>
            </div>
        </div>
    );
};
