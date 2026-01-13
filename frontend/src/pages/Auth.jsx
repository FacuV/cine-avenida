import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    dni: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : {
              name: form.name,
              lastName: form.lastName,
              dni: Number(form.dni),
              email: form.email,
              password: form.password,
            };
      const data = await apiFetch(`/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setAuth(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page auth">
      <div className="auth-shell">
        <div className="auth-card">
          <h1>{mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</h1>
          <p className="muted">
            {mode === 'login'
              ? 'Accede para reservar tus entradas.'
              : 'Registrate para reservar o comprar online.'}
          </p>
          <p className="tiny">
            Una sola cuenta municipal: si ya tenes usuario en EMBO (estacionamiento medido),
            usa el mismo email y contrasena.
          </p>

          <div className="switch">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => setMode('login')}
            >
              Iniciar sesion
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => setMode('register')}
            >
              Registrarme
            </button>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <label>
                  Nombre
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    required
                  />
                </label>
                <label>
                  Apellido
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Tu apellido"
                    required
                  />
                </label>
                <label>
                  DNI
                  <input
                    name="dni"
                    type="number"
                    inputMode="numeric"
                    value={form.dni}
                    onChange={handleChange}
                    placeholder="Tu documento"
                    required
                  />
                </label>
              </>
            )}
            <label>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@mail.com"
                required
              />
            </label>
            <label>
              Contrasena
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimo 6 caracteres"
                required
              />
            </label>

            {error && <p className="error">{error}</p>}

            <button className="button" type="submit" disabled={loading}>
              {loading
                ? 'Procesando...'
                : mode === 'login'
                  ? 'Entrar'
                  : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <aside className="auth-info">
          <p className="eyebrow">Guia rapida</p>
          <h2>Que obtenes al registrarte</h2>
          <ul className="checklist">
            <li>Reserva online y QR inmediato.</li>
            <li>Acceso a tus entradas en Mis reservas.</li>
            <li>Reserva sin pago para confirmar en boleteria.</li>
          </ul>
          <div className="info-card">
            <p className="info-title">Necesitas ayuda?</p>
            <p className="muted">
              Si tenes dudas, nuestro equipo te asiste en boleteria.
            </p>
          </div>
          <div className="info-card">
            <p className="info-title">Cuenta unica con EMBO</p>
            <p className="muted">
              Registrandote una sola vez accedes a Cine Avenida y al estacionamiento medido EMBO.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
