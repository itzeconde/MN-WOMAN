import { useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  const linkInvalido = !uid || !token;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setEnviando(true);
    try {
      await api.post('/users/password-reset/confirm/', {
        uid,
        token,
        new_password: password,
      });
      setExito(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      const mensaje =
        err?.response?.data?.error ||
        'No se pudo restablecer la contraseña. El link puede haber expirado.';
      setError(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  if (linkInvalido) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <XCircle size={48} style={{ margin: '0 auto 16px', color: '#ef4444' }} />
          <h1 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Link inválido</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
            Este link de recuperación no es válido o está incompleto.
          </p>
          <Link to="/recuperar-contrasena" style={{ fontSize: '14px', fontWeight: '600', color: '#B66878' }}>
            Solicitar un nuevo link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>

      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        {!exito ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Nueva contraseña</h1>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Elige una nueva contraseña para tu cuenta.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>Nueva contraseña</label>
                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <Lock
                    size={18}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
                  />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    disabled={enviando}
                    style={{
                      width: '100%', padding: '10px', paddingLeft: '38px', paddingRight: '40px', borderRadius: '8px',
                      border: '1px solid #e5e7eb', fontSize: '14px', boxSizing: 'border-box' as const,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                      display: 'flex', alignItems: 'center', color: '#9ca3af',
                    }}
                    aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    tabIndex={-1}
                  >
                    {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>Confirmar contraseña</label>
                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <Lock
                    size={18}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
                  />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu nueva contraseña"
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
                {enviando ? 'Guardando...' : 'Restablecer contraseña'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <CheckCircle2 size={48} style={{ margin: '0 auto 16px', color: '#B66878' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>¡Contraseña actualizada!</h2>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Ya puedes iniciar sesión con tu nueva contraseña. Te redirigiremos en un momento...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}