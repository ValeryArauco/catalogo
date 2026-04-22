"use client";

import React, { useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import styles from "../login.module.css";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const params = useParams();
  const negocioSlug = params.negocio || "admin";
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Capturar el código PKCE silencioso que llega en la URL y convertirlo a sesión real
  React.useEffect(() => {
    const exchangeCode = async () => {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          // Limpiar URL por elegancia (opcional)
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };
    exchangeCode();
  }, [supabase.auth]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Contraseña actualizada correctamente. Redirigiendo a tu bandeja de administración...');
      setTimeout(() => {
        router.push(`/${negocioSlug}/admin`);
      }, 2500);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Nueva Contraseña</h1>
          <p className={styles.subtitle}>
             Define tu nueva contraseña de acceso
          </p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {message && <div className={styles.successAlert}>{message}</div>}

        <form onSubmit={handleUpdatePassword} className={styles.form}>
         
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Nueva Contraseña</label>
            <input
              type="password"
              id="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Escribe tu nueva clave"
            />
          </div>

          <button 
            type="submit" 
            className={styles.buttonMain} 
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Actualizar y Entrar"}
          </button>
        </form>

      </div>
    </div>
  );
}
