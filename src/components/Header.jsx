"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import styles from "./Header.module.css";

export const Header = ({ whatsapp, negocioCiudad, logo }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Estado de checkout: 0 = Carrito, 1 = Formulario de Envío
    const [checkoutStep, setCheckoutStep] = useState(0);
    const [formData, setFormData] = useState({
        nombre: "",
        ciudad: "",
        direccion: ""
    });

    useEffect(() => {
        const urlQ = searchParams.get("q") || "";
        if (searchTerm !== urlQ) {
            setSearchTerm(urlQ);
        }
    }, [searchParams]);

    useEffect(() => {
        const handler = setTimeout(() => {
            const currentQ = searchParams.get("q") || "";
            if (searchTerm.trim() !== currentQ.trim()) {
                const params = new URLSearchParams(searchParams);
                if (searchTerm.trim()) {
                    params.set("q", searchTerm.trim());
                } else {
                    params.delete("q");
                }
                params.delete("page");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            }
        }, 400);

        return () => clearTimeout(handler);
    }, [searchTerm, searchParams, pathname, router]);

    const loadCart = () => {
        const stored = localStorage.getItem("catalogo_cart");
        if (stored) {
            setCart(JSON.parse(stored));
        }
    };

    useEffect(() => {
        loadCart();
        window.addEventListener("cart_updated", loadCart);
        return () => window.removeEventListener("cart_updated", loadCart);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (searchTerm.trim()) {
            params.set("q", searchTerm.trim());
        } else {
            params.delete("q");
        }
        params.delete("page");
        router.push(`${pathname}?${params.toString()}#productos`);
    };

    const removeFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
        localStorage.setItem("catalogo_cart", JSON.stringify(newCart));
        window.dispatchEvent(new Event("cart_updated"));
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const isLocalCity = typeof negocioCiudad === "string" && formData.ciudad.toLowerCase().trim() === negocioCiudad.toLowerCase().trim();

    const confirmarPedido = (e) => {
        e.preventDefault();
        
        // Armar el mensaje para WhatsApp
        let mensaje = `*¡Hola! Quiero hacer un pedido:*\n\n`;
        
        cart.forEach(item => {
            mensaje += `- ${item.quantity}x ${item.name} (${item.variant}) - Bs. ${item.price * item.quantity}\n`;
        });
        
        mensaje += `\n*TOTAL: Bs. ${total.toFixed(2)}*\n\n`;
        mensaje += `*Mis datos:*\n`;
        mensaje += `Nombre: ${formData.nombre}\n`;
        mensaje += `Ciudad: ${formData.ciudad}\n`;
        
        if (isLocalCity && formData.direccion) {
            mensaje += `Dirección: ${formData.direccion}\n`;
            // El usuario luego anexará la ubicación en el chat
        }

        const encodedMensaje = encodeURIComponent(mensaje);
        const wsNumber = whatsapp || ""; // Fallback si no hay whatsapp (idealmente el negocio siempre tendrá)
        const wsUrl = `https://wa.me/${wsNumber}?text=${encodedMensaje}`;

        // Vaciar el carrito tras abrir ws 
        setCart([]);
        localStorage.setItem("catalogo_cart", "[]");
        window.dispatchEvent(new Event("cart_updated"));
        
        setIsCartOpen(false);
        setCheckoutStep(0);
        window.open(wsUrl, "_blank");
    };

    const logoDisplay = logo || "https://placehold.co/100x100?text=Logo";

    return (
        <div className={styles.header}>
           
            
            <form className="search" onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '400px' }}>
                <input 
                    type="text" 
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--light-gray)', outline: 'none' }}
                />
                <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Buscar

                </button>
            </form>
            
            <h1 style={{ display: 'none' }}>Catálogo</h1>

            <div>
                <button className={styles.cart} onClick={() => { setIsCartOpen(true); setCheckoutStep(0); }} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.08 7.00001C20.9072 6.70063 20.6598 6.45114 20.3618 6.27588C20.0639 6.10062 19.7256 6.00557 19.38 6.00001H6.58L6 3.74001C5.9414 3.52184 5.81066 3.32995 5.62908 3.19558C5.44749 3.06121 5.22576 2.99227 5 3.00001H3C2.73478 3.00001 2.48043 3.10536 2.29289 3.2929C2.10536 3.48044 2 3.73479 2 4.00001C2 4.26522 2.10536 4.51958 2.29289 4.70711C2.48043 4.89465 2.73478 5.00001 3 5.00001H4.24L7 15.26C7.0586 15.4782 7.18934 15.6701 7.37092 15.8044C7.55251 15.9388 7.77424 16.0077 8 16H17C17.1847 15.9994 17.3656 15.9478 17.5227 15.8507C17.6798 15.7536 17.8069 15.6149 17.89 15.45L21.17 8.89001C21.3122 8.59202 21.3783 8.26348 21.3626 7.93369C21.3469 7.6039 21.2498 7.28313 21.08 7.00001Z" fill="var(--primary)"/>
                        <path d="M7.5 21C8.32843 21 9 20.3284 9 19.5C9 18.6716 8.32843 18 7.5 18C6.67157 18 6 18.6716 6 19.5C6 20.3284 6.67157 21 7.5 21Z" fill="var(--primary)"/>
                        <path d="M17.5 21C18.3284 21 19 20.3284 19 19.5C19 18.6716 18.3284 18 17.5 18C16.6716 18 16 18.6716 16 19.5C16 20.3284 16.6716 21 17.5 21Z" fill="var(--primary)"/>
                    </svg>
                    {cart.length > 0 && (
                        <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            {cart.length}
                        </span>
                    )}
                </button>
            </div>

            {isCartOpen && (
                <>
                    <div className={styles.backdrop} onClick={() => setIsCartOpen(false)}></div>
                    <div className={styles.sideSheet}>
                        <div className={styles.sideSheetHeader}>
                            <h3 className={styles.sideSheetTitle}>
                                {checkoutStep === 0 ? "Tu Carrito" : "Detalles de Envío"}
                            </h3>
                            <button className={styles.closeButton} onClick={() => setIsCartOpen(false)}>&times;</button>
                        </div>
                        
                        <div className={styles.sideSheetContent}>
                            {checkoutStep === 0 ? (
                                cart.length === 0 ? (
                                    <p style={{ color: 'var(--on-surface-variant)', fontSize: '1rem', textAlign: 'center', marginTop: '2rem' }}>
                                        El carrito está vacío
                                    </p>
                                ) : (
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {cart.map((item, index) => (
                                            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--light-gray)', padding: '1rem 0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    {item.image && <img src={item.image} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />}
                                                    <div>
                                                        <p style={{ fontSize: '1rem', display: 'block', color: 'var(--foreground)', fontWeight: '500' }}>{item.name}</p>
                                                        <small style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>{item.variant} (x{item.quantity})</small>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--foreground)' }}>Bs. {item.price * item.quantity}</span>
                                                    <button onClick={() => removeFromCart(index)} style={{ color: 'var(--error, red)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21 6.00004H16V4.33004C15.9765 3.68985 15.7002 3.08509 15.2316 2.64833C14.7629 2.21156 14.1402 1.97843 13.5 2.00004H10.5C9.85975 1.97843 9.23706 2.21156 8.76843 2.64833C8.2998 3.08509 8.02346 3.68985 8 4.33004V6.00004H3C2.73478 6.00004 2.48043 6.10539 2.29289 6.29293C2.10536 6.48047 2 6.73482 2 7.00004C2 7.26525 2.10536 7.51961 2.29289 7.70714C2.48043 7.89468 2.73478 8.00004 3 8.00004H4V19C4 19.7957 4.31607 20.5587 4.87868 21.1214C5.44129 21.684 6.20435 22 7 22H17C17.7956 22 18.5587 21.684 19.1213 21.1214C19.6839 20.5587 20 19.7957 20 19V8.00004H21C21.2652 8.00004 21.5196 7.89468 21.7071 7.70714C21.8946 7.51961 22 7.26525 22 7.00004C22 6.73482 21.8946 6.48047 21.7071 6.29293C21.5196 6.10539 21.2652 6.00004 21 6.00004ZM10 4.33004C10 4.17004 10.21 4.00004 10.5 4.00004H13.5C13.79 4.00004 14 4.17004 14 4.33004V6.00004H10V4.33004ZM18 19C18 19.2653 17.8946 19.5196 17.7071 19.7071C17.5196 19.8947 17.2652 20 17 20H7C6.73478 20 6.48043 19.8947 6.29289 19.7071C6.10536 19.5196 6 19.2653 6 19V8.00004H18V19Z" fill="var(--outline)"/>
<path d="M9 17C9.26522 17 9.51957 16.8946 9.70711 16.7071C9.89464 16.5196 10 16.2652 10 16V12C10 11.7348 9.89464 11.4804 9.70711 11.2929C9.51957 11.1054 9.26522 11 9 11C8.73478 11 8.48043 11.1054 8.29289 11.2929C8.10536 11.4804 8 11.7348 8 12V16C8 16.2652 8.10536 16.5196 8.29289 16.7071C8.48043 16.8946 8.73478 17 9 17ZM15 17C15.2652 17 15.5196 16.8946 15.7071 16.7071C15.8946 16.5196 16 16.2652 16 16V12C16 11.7348 15.8946 11.4804 15.7071 11.2929C15.5196 11.1054 15.2652 11 15 11C14.7348 11 14.4804 11.1054 14.2929 11.2929C14.1054 11.4804 14 11.7348 14 12V16C14 16.2652 14.1054 16.5196 14.2929 16.7071C14.4804 16.8946 14.7348 17 15 17Z" fill="var(--outline)"/>
</svg>
</button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )
                            ) : (
                                <form id="checkoutForm" onSubmit={confirmarPedido} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Nombre y Apellido *</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                            style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--light-gray)" }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Ciudad *</label>
                                        <input 
                                            type="text" 
                                            required
                                            list="ciudades-bolivia"
                                            value={formData.ciudad}
                                            onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                                            placeholder="Ej. Santa Cruz"
                                            style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--light-gray)" }}
                                        />
                                        <datalist id="ciudades-bolivia">
                                            <option value="Beni" />
                                            <option value="Chuquisaca" />
                                            <option value="Cochabamba" />
                                            <option value="La Paz" />
                                            <option value="Oruro" />
                                            <option value="Pando" />
                                            <option value="Potosí" />
                                            <option value="Santa Cruz" />
                                            <option value="Tarija" />
                                        </datalist>
                                    </div>

                                    {isLocalCity && (
                                        <>
                                            <div>
                                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Dirección *</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={formData.direccion}
                                                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--light-gray)" }}
                                                />
                                            </div>
                                            <div style={{ background: "var(--primary)", color: "white", padding: "1rem", borderRadius: "var(--radius-sm)", fontSize: "0.875rem" }}>
                                                <strong>Nota:</strong> Como estás en nuestra ciudad, requerimos que nos envíes tu <strong>ubicación exacta de GPS</strong> por WhatsApp apenas finalices este paso para coordinar la entrega.
                                            </div>
                                        </>
                                    )}
                                </form>
                            )}
                        </div>
                        
                        {cart.length > 0 && (
                            <div className={styles.sideSheetFooter}>
                                {checkoutStep === 0 ? (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '1.5rem', fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--foreground)' }}>
                                            <span>Total:</span>
                                            <span>Bs. {total.toFixed(2)}</span>
                                        </div>
                                        <button onClick={() => setCheckoutStep(1)} style={{ width: '100%', padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontWeight: 'bold', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', transition: 'background-color 0.2s' }}>
                                            Continuar con la compra
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button type="submit" form="checkoutForm" style={{ width: '100%', padding: '1rem', background: '#25D366', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: "0.5rem" }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                                            Enviar pedido
                                        </button>
                                        <button onClick={() => setCheckoutStep(0)} style={{ width: '100%', padding: '0.75rem', background: 'transparent', color: 'var(--on-surface-variant)', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '1rem' }}>
                                            Volver al carrito
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
