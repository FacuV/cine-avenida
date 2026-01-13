import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';

const money = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
});

function formatDate(value) {
  return new Date(value).toLocaleString('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Home() {
  const [showings, setShowings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();
  const maxTilt = 8;

  useEffect(() => {
    let mounted = true;
    apiFetch('/showings')
      .then((data) => {
        if (mounted) setShowings(data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const handleCardMove = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const xPercent = x / rect.width - 0.5;
    const yPercent = y / rect.height - 0.5;
    const rotateY = xPercent * maxTilt;
    const rotateX = -yPercent * maxTilt;
    card.style.setProperty('--rx', `${rotateX.toFixed(2)}deg`);
    card.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`);
  };

  const handleCardLeave = (event) => {
    const card = event.currentTarget;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  };

  return (
    <section className="page">
      <header className="hero hero-main">
        <div className="hero-copy">
          <p className="eyebrow">Cine Avenida Bolivar</p>
          <h1>Entradas claras, sin filas</h1>
          <p className="lead">
            Reserva online con QR inmediato. Elegi la funcion, selecciona tus asientos y
            confirma en segundos. Si preferis, reserva sin pagar y valida en boleteria.
          </p>
          <div className="hero-actions">
            <div className="cta-box">
              <p className="muted">Reservas online para clientes registrados.</p>
              {auth ? (
                <span className="pill">Sesion activa: {auth.user.email}</span>
              ) : (
                <Link className="button" to="/login">
                  Iniciar sesion
                </Link>
              )}
              <p className="tiny">Tu QR llega al instante y queda en Mis reservas.</p>
              <p className="tiny">
                Si ya tenes cuenta en EMBO (estacionamiento medido), usa la misma.
              </p>
            </div>
            <div className="hero-tags">
              <span className="tag">QR inmediato</span>
              <span className="tag">Reserva sin pago</span>
              <span className="tag">Compra en boleteria</span>
            </div>
          </div>
          <div className="hero-steps">
            <div className="step-card reveal" style={{ animationDelay: '0ms' }}>
              <span className="step-number">01</span>
              <h3>Elegi la funcion</h3>
              <p className="muted">Mira horarios, idioma y formato.</p>
            </div>
            <div className="step-card reveal" style={{ animationDelay: '120ms' }}>
              <span className="step-number">02</span>
              <h3>Selecciona butacas</h3>
              <p className="muted">Mapa de sala en tiempo real.</p>
            </div>
            <div className="step-card reveal" style={{ animationDelay: '240ms' }}>
              <span className="step-number">03</span>
              <h3>Recibi tu QR</h3>
              <p className="muted">Entrar es mostrar tu codigo.</p>
            </div>
          </div>
        </div>
        <div className="hero-panel">
          <p className="eyebrow">Guia rapida</p>
          <h2>Como funciona</h2>
          <ol className="step-list">
            <li>Busca la funcion y revisa el precio.</li>
            <li>Reserva tus asientos disponibles.</li>
            <li>Recibi el QR o confirma en boleteria.</li>
          </ol>
          <div className="panel-footer">
            <span className="chip">Compra online</span>
            <span className="chip">Pago en boleteria</span>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Cartelera</p>
            <h2>Funciones disponibles</h2>
          </div>
          <p className="muted">Actualizamos horarios y asientos en tiempo real.</p>
        </div>

        {loading && <p className="muted">Cargando funciones...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && showings.length === 0 && (
          <p className="muted">No hay funciones cargadas todavia.</p>
        )}

        <div className="grid">
          {showings.map((showing, index) => (
            <article
              key={showing.id}
              className="movie-card reveal"
              style={{ animationDelay: `${index * 80}ms` }}
              onMouseMove={handleCardMove}
              onMouseLeave={handleCardLeave}
            >
              <div className="movie-card-inner">
                <div className="movie-card-front">
                  <div className="movie-card-media">
                    {showing.movie.posterUrl ? (
                      <img
                        src={showing.movie.posterUrl}
                        alt={`Portada de ${showing.movie.title}`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="poster-fallback">
                        <span>{showing.movie.title}</span>
                      </div>
                    )}
                  </div>
                  <div className="movie-card-body">
                    <div className="card-header">
                      <h3>{showing.movie.title}</h3>
                      <span className="chip">{showing.movie.format}</span>
                    </div>
                    <p className="muted">{showing.movie.language}</p>
                    <p className="movie-card-desc">{showing.movie.description}</p>
                    <p className="meta">{formatDate(showing.startTime)}</p>
                    <div className="card-row">
                      <span className="price">{money.format(showing.priceCents / 100)}</span>
                      <span className="pill">{showing.availableSeats} asientos libres</span>
                    </div>
                    <Link className="link" to={`/showings/${showing.id}`}>
                      Ver detalles y reservar
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
