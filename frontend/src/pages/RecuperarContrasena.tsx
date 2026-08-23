import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';

export default function RecuperarContrasena() {
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.');
      return;
    }

    setEnviando(true);
    try {
      await api.post('/users/password-reset/request/', { email: email.trim() });
      // El backend siempre responde igual exista o no la cuenta, así que
      // mostramos el mismo mensaje de éxito sin importar el resultado.
      setEnviado(true);
    } catch {
      // Aun si hay un error de red, no queremos confirmar/negar existencia
      // de la cuenta. Mostramos un mensaje genérico de reintento.
      setError('Ocurrió un problema al enviar la solicitud. Intenta de nuevo en unos minutos.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>

      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        <Link
          to="/login"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9ca3af', textDecoration: 'none', marginBottom: '24px' }}
        >
          <ArrowLeft size={15} />
          Volver a iniciar sesión
        </Link>

        {!enviado ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Recupera tu contraseña</h1>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Ingresa el correo con el que te registraste y te enviaremos un link para restablecer tu contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>Correo electrónico</label>
                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <Mail
                    size={18}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@dominio.com"
                    disabled={enviando}
                    style={{
                      width: '100%', padding: '10px', paddingLeft: '38px', borderRadius: '8px',
                      border: '1px solid #e5e7eb', fontSize: '14px', boxSizing: 'border-box' as const,
                    }}
                  />
                </div>
              </div>

              {error && (
                <div style={{
                  background: '#fff5f5', border: '1px solid #fee2e2', borderRadius: '8px',
                  padding: '12px', marginBottom: '12px'
                }}>
                  <p style={{ color: '#ef4444', fontSize: '14px', margin: 0 }}>{error}</p>
                </div>
              )}

              <button type="submit" disabled={enviando}
                style={{ width: '100%', background: '#B66878', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}>
                {enviando ? 'Enviando...' : 'Enviar link de recuperación'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <CheckCircle2 size={48} style={{ margin: '0 auto 16px', color: '#B66878' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Revisa tu correo</h2>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Si el correo <strong style={{ color: '#374151' }}>{email}</strong> está registrado, te llegará un
              link para restablecer tu contraseña en los próximos minutos. Revisa también tu carpeta de spam.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}