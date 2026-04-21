"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const negocioSlug = params.negocio || "admin";
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push(`/${negocioSlug}/admin`);
      }
    };
    checkSession();
  }, [router, negocioSlug, supabase]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isResetMode, setIsResetMode] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Correo o contraseña incorrectos. Verifica tus datos.");
    } else {
      router.push(`/${negocioSlug}/admin`);
      router.refresh();
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${negocioSlug}/login/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Te hemos enviado un correo con el enlace para restablecer tu contraseña. Revisa tu bandeja de entrada o spam.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{isResetMode ? 'Restablecer contraseña' : 'Iniciar Sesión'}</h1>
          <p className={styles.subtitle}>
             Panel Administrativo
          </p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {message && <div className={styles.successAlert}>{message}</div>}

        <form onSubmit={isResetMode ? handleResetPassword : handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Correo Electrónico</label>
            <input
              type="email"
              id="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
            />
          </div>

          {!isResetMode && (
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Contraseña</label>
              <input
                type="password"
                id="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          )}

          <button 
            type="submit" 
            className={styles.buttonMain} 
            disabled={loading}
          >
            {loading 
              ? "Cargando..." 
              : isResetMode 
                ? 'Enviar enlace de recuperación' 
                : 'Iniciar Sesión'
            }
          </button>
        </form>

        <div className={styles.footer}>
          <button 
            type="button" 
            className={styles.textButton}
            onClick={() => {
                setIsResetMode(!isResetMode);
                setError(null);
                setMessage(null);
            }}
          >
            {isResetMode ? "¿Ya tienes tu contraseña? Iniciar Sesión" : "¿Olvidaste tu contraseña?"}
          </button>
        </div>
      </div>
    </div>
  );
}