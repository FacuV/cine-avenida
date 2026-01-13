import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { API_BASE, apiFetch } from '../api';
import SeatGrid from '../components/SeatGrid';
import { useAuth } from '../context/AuthContext';

const money = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
});

export default function ShowingDetails() {
  const { id } = useParams();
  const { auth } = useAuth();
  const [showing, setShowing] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [reserveOnly, setReserveOnly] = useState(false);
  const [useCredits, setUseCredits] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const selectedRef = useRef([]);
  const maxTilt = 8;
  const isEmployee = auth?.user?.role === 'EMPLOYEE' || auth?.user?.role === 'ADMIN';

  useEffect(() => {
    let mounted = true;
    apiFetch(`/showings/${id}`)
      .then((data) => mounted && setShowing(data))
      .catch((err) => setError(err.message));

    apiFetch(`/showings/${id}/seats`)
      .then((data) => mounted && setSeats(data || []))
      .catch((err) => setError(err.message));

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    if (!auth?.accessToken) {
      setCreditBalance(0);
      setUseCredits(false);
      return;
    }
    apiFetch('/credits/balance', { token: auth.accessToken })
      .then((data) => setCreditBalance(data?.balanceCents ?? 0))
      .catch(() => setCreditBalance(0));
  }, [auth?.accessToken]);

  useEffect(() => {
    if (reserveOnly && useCredits) {
      setUseCredits(false);
    }
  }, [reserveOnly, useCredits]);

  useEffect(() => {
    if (creditBalance <= 0 && useCredits) {
      setUseCredits(false);
    }
  }, [creditBalance, useCredits]);

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

  useEffect(() => {
    if (!id) return undefined;
    const socket = io(API_BASE, { transports: ['websocket'] });
    socket.emit('joinShowing', { showingId: id });
    socket.on('seats:update', (payload) => {
      if (!payload || payload.showingId !== id) {
        return;
      }
      const updates = payload.seats ?? [];
      if (!updates.length) return;
      setSeats((prev) =>
        prev.map((seat) => {
          const update = updates.find((item) => item.id === seat.id);
          return update ? { ...seat, status: update.status } : seat;
        }),
      );

      const soldSeatIds = updates
        .filter((seat) => seat.status === 'SOLD_ONLINE' || seat.status === 'SOLD_PHYSICAL')
        .map((seat) => seat.id);
      const availableSeatIds = updates
        .filter((seat) => seat.status === 'AVAILABLE')
        .map((seat) => seat.id);
      if (soldSeatIds.length > 0 || availableSeatIds.length > 0) {
        setSelected((prev) =>
          prev.filter(
            (seatId) => !soldSeatIds.includes(seatId) && !availableSeatIds.includes(seatId),
          ),
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const total = useMemo(() => {
    if (!showing) return 0;
    return showing.priceCents * selected.length;
  }, [showing, selected.length]);

  const holdSeat = async (seatId) => {
    if (!auth?.accessToken) {
      setError('Necesitas iniciar sesion para seleccionar asientos.');
      return false;
    }
    try {
      await apiFetch(`/showings/${id}/hold`, {
        method: 'POST',
        token: auth.accessToken,
        body: JSON.stringify({ seatIds: [seatId] }),
      });
      setSeats((prev) =>
        prev.map((seat) => (seat.id === seatId ? { ...seat, status: 'HELD' } : seat)),
      );
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const releaseSeat = async (seatId) => {
    if (!auth?.accessToken) {
      return;
    }
    try {
      await apiFetch(`/showings/${id}/release`, {
        method: 'POST',
        token: auth.accessToken,
        body: JSON.stringify({ seatIds: [seatId] }),
      });
      setSeats((prev) =>
        prev.map((seat) => (seat.id === seatId ? { ...seat, status: 'AVAILABLE' } : seat)),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleSeat = async (seat) => {
    setError('');
    if (selected.includes(seat.id)) {
      await releaseSeat(seat.id);
      setSelected((prev) => prev.filter((idValue) => idValue !== seat.id));
      return;
    }
    const held = await holdSeat(seat.id);
    if (held) {
      setSelected((prev) => [...prev, seat.id]);
    }
  };

  useEffect(() => {
    return () => {
      const seatsToRelease = selectedRef.current;
      if (!seatsToRelease.length || !auth?.accessToken || !id) return;
      apiFetch(`/showings/${id}/release`, {
        method: 'POST',
        token: auth.accessToken,
        body: JSON.stringify({ seatIds: seatsToRelease }),
      }).catch(() => {});
    };
  }, [auth?.accessToken, id]);

  const handleBooking = async () => {
    if (!auth) {
      setError('Necesitas iniciar sesion para reservar.');
      return;
    }
    setError('');
    setMessage('');
    try {
      await apiFetch('/bookings', {
        method: 'POST',
        token: auth.accessToken,
        body: JSON.stringify({
          showingId: id,
          seatIds: selected,
          reserveOnly,
          useCredits,
        }),
      });
      setMessage('Reserva confirmada. Revisa tu email para los QR.');
      setSelected([]);
      if (auth?.accessToken) {
        apiFetch('/credits/balance', { token: auth.accessToken })
          .then((data) => setCreditBalance(data?.balanceCents ?? 0))
          .catch(() => {});
      }
      const freshSeats = await apiFetch(`/showings/${id}/seats`);
      setSeats(freshSeats || []);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!showing) {
    return (
      <section className="page">
        <p className="muted">Cargando funcion...</p>
        {error && <p className="error">{error}</p>}
      </section>
    );
  }

  return (
    <section className="page">
      <header className="hero hero-compact">
        <div className="hero-copy">
          <p className="eyebrow">{showing.movie.language}</p>
          <h1>{showing.movie.title}</h1>
          <p className="lead">{showing.movie.description}</p>
        </div>
        <div className="hero-panel">
          <p className="eyebrow">Fecha y hora</p>
          <h2>{new Date(showing.startTime).toLocaleString('es-AR')}</h2>
          <p className="price">{money.format(showing.priceCents / 100)}</p>
          <div className="panel-footer">
            <span className="chip">{showing.movie.format}</span>
            <span className="chip">QR al instante</span>
          </div>
        </div>
      </header>

      <div className="showing-layout">
        <div className="showing-main">
          <div className="section-header">
            <div>
              <p className="eyebrow">Mapa de sala</p>
              <h2>Elegi tus asientos</h2>
            </div>
            <div className="legend">
              <span className="legend-item">
                <span className="seat-dot available" />
                Disponible
              </span>
              <span className="legend-item">
                <span className="seat-dot selected" />
                Seleccionado
              </span>
              <span className="legend-item">
                <span className="seat-dot unavailable" />
                Ocupado
              </span>
            </div>
          </div>
          <div className="screen-label">Pantalla</div>
          {isEmployee && (
            <div className="notice">
              <p className="muted">
                Las reservas online estan disponibles solo para clientes.
              </p>
            </div>
          )}
          <SeatGrid
            seats={seats}
            selectedSeatIds={selected}
            onToggle={toggleSeat}
            disabled={isEmployee}
          />
        </div>

        <aside className="showing-aside">
          {!isEmployee && (
            <div className="booking-panel">
              <div>
                <p className="muted">Asientos seleccionados: {selected.length}</p>
                <p className="price">Total: {money.format(total / 100)}</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={reserveOnly}
                  onChange={(event) => setReserveOnly(event.target.checked)}
                />
                Reservar sin pagar (confirma en boleteria)
              </label>
              {creditBalance > 0 && (
                <div className="credit-box">
                  <p className="muted">
                    Credito disponible: {money.format(creditBalance / 100)}
                  </p>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={useCredits}
                      onChange={(event) => setUseCredits(event.target.checked)}
                      disabled={reserveOnly}
                    />
                    Usar credito disponible
                  </label>
                </div>
              )}
              <button
                className="button"
                type="button"
                onClick={handleBooking}
                disabled={selected.length === 0}
              >
                Confirmar reserva
              </button>
              {message && <p className="success">{message}</p>}
              {error && <p className="error">{error}</p>}
            </div>
          )}

          <div className="info-card">
            <p className="eyebrow">Antes de confirmar</p>
            <h3>Todo listo en minutos</h3>
            <ul className="checklist">
              <li>Selecciona solo asientos disponibles.</li>
              <li>Tu QR queda guardado en Mis reservas.</li>
              <li>Si reservas sin pago, valida en boleteria.</li>
            </ul>
          </div>

          <article
            className="movie-card movie-card-compact"
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
                  <p className="movie-card-desc">{showing.movie.description}</p>
                  <div className="movie-meta">
                    <span>Idioma: {showing.movie.language}</span>
                    <span>Duracion: {showing.movie.durationMinutes} min</span>
                    <span>Funcion: {new Date(showing.startTime).toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>

        </aside>
      </div>
    </section>
  );
}
