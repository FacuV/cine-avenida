import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import QrImage from '../components/QrImage';
import { useAuth } from '../context/AuthContext';

const money = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
});

const statusLabels = {
  PAID: 'Pagada',
  RESERVED: 'Reservada',
  CANCELLED: 'Cancelada',
};

const channelLabels = {
  ONLINE: 'Online',
  PHYSICAL: 'Presencial',
};

export default function MyBookings() {
  const { auth } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [expandedKey, setExpandedKey] = useState('');
  const [creditBalance, setCreditBalance] = useState(0);

  const sections = [
    {
      id: 'pending',
      title: 'Pendientes',
      description: 'Entradas disponibles y reservas sin pago.',
    },
    {
      id: 'cancelled',
      title: 'Canceladas',
      description: 'Funciones canceladas con credito disponible.',
    },
    {
      id: 'used',
      title: 'Vistas',
      description: 'Entradas que ya fueron escaneadas.',
    },
    {
      id: 'all',
      title: 'Todas',
      description: 'Listado completo con estado por entrada.',
    },
  ];

  useEffect(() => {
    if (!auth?.accessToken) return;
    apiFetch('/bookings/me', { token: auth.accessToken })
      .then((data) => setBookings(data || []))
      .catch((err) => setError(err.message));
  }, [auth?.accessToken]);

  useEffect(() => {
    if (!auth?.accessToken) return;
    apiFetch('/credits/balance', { token: auth.accessToken })
      .then((data) => setCreditBalance(data?.balanceCents ?? 0))
      .catch(() => setCreditBalance(0));
  }, [auth?.accessToken]);

  if (!auth) {
    return (
      <section className="page">
        <h1>Mis reservas</h1>
        <p className="muted">Inicia sesion para ver tus reservas.</p>
      </section>
    );
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Clientes</p>
          <h1>Mis reservas</h1>
          <p className="lead">Tus entradas y QR activos.</p>
        </div>
      </header>

      <div className="info-strip">
        <div className="info-card">
          <p className="info-title">QR listo</p>
          <p className="muted">Mostralo en el ingreso para entrar.</p>
        </div>
        <div className="info-card">
          <p className="info-title">Reserva sin pago</p>
          <p className="muted">Valida en boleteria antes de la funcion.</p>
        </div>
        {creditBalance > 0 && (
          <div className="info-card">
            <p className="info-title">Credito disponible</p>
            <p className="muted">
              Tenes {money.format(creditBalance / 100)} para usar en otra funcion.
            </p>
          </div>
        )}
        <div className="info-card">
          <p className="info-title">Canal de compra</p>
          <p className="muted">Online o fisico segun tu operacion.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {bookings.length === 0 && !error && (
        <p className="muted">Todavia no tenes reservas.</p>
      )}

      {sections.map((section) => {
        const filteredBookings = bookings
          .map((booking) => {
            const tickets = booking.tickets ?? [];
            const pendingTickets = tickets.filter((ticket) => !ticket.checkedInAt);
            const usedTickets = tickets.filter((ticket) => ticket.checkedInAt);
            const cancelled =
              booking.status === 'CANCELLED' ||
              tickets.some((ticket) => ticket.seat.showing.status === 'CANCELLED');

            if (section.id === 'pending') {
              if (cancelled) {
                return null;
              }
              if (booking.status === 'RESERVED' && tickets.length === 0) {
                return { ...booking, tickets: [] };
              }
              return { ...booking, tickets: pendingTickets };
            }
            if (section.id === 'cancelled') {
              return cancelled ? booking : null;
            }
            if (section.id === 'used') {
              if (cancelled) {
                return null;
              }
              return { ...booking, tickets: usedTickets };
            }
            return booking;
          })
          .filter((booking) => {
            if (!booking) {
              return false;
            }
            if (section.id === 'all') {
              return true;
            }
            if (section.id === 'cancelled') {
              return booking.status === 'CANCELLED';
            }
            if (section.id === 'pending' && booking.status === 'RESERVED') {
              return booking.tickets.length > 0 || booking.status === 'RESERVED';
            }
            return booking.tickets.length > 0;
          });

        if (filteredBookings.length === 0) {
          return null;
        }

        return (
          <section key={section.id} className="section">
            <div className="section-header">
              <div>
                <p className="eyebrow">{section.title}</p>
                <h2>{section.title}</h2>
              </div>
              <p className="muted">{section.description}</p>
            </div>

            <div className="grid">
              {filteredBookings.map((booking) => {
                const localKey = `${section.id}-${booking.id}`;
                const isOpen = expandedKey === localKey;
                const statusLabel = statusLabels[booking.status] ?? booking.status;
                const channelLabel = channelLabels[booking.channel] ?? booking.channel;
                const tickets = booking.tickets ?? [];
                const isCancelled =
                  booking.status === 'CANCELLED' ||
                  tickets.some((ticket) => ticket.seat.showing.status === 'CANCELLED');
                return (
                  <article key={localKey} className="card">
                    <div className="card-header">
                      <h3>Reserva {statusLabel}</h3>
                      <span className="pill">{channelLabel}</span>
                    </div>
                    <p className="muted">Total: {money.format(booking.totalPriceCents / 100)}</p>
                    {isCancelled && (
                      <div className="ticket-meta">
                        <span className="badge cancelled">Funcion cancelada</span>
                      </div>
                    )}

                    <div className="booking-actions">
                      <button
                        className="ghost"
                        type="button"
                        onClick={() => setExpandedKey(isOpen ? '' : localKey)}
                      >
                        {isOpen ? 'Ocultar detalles' : 'Ver QR y detalles'}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="booking-details">
                        {isCancelled ? (
                          <div className="notice">
                            <p className="info-title">Funcion cancelada</p>
                            <p className="muted">
                              Generamos un credito por{' '}
                              {money.format(booking.totalPriceCents / 100)} equivalente a{' '}
                              {tickets.length} entrada(s). Podes usarlo cuando quieras.
                            </p>
                            {creditBalance > 0 && (
                              <p className="muted">
                                Saldo actual: {money.format(creditBalance / 100)}.
                              </p>
                            )}
                          </div>
                        ) : tickets.length === 0 ? (
                          <p className="muted">Reserva sin pago. Confirma en boleteria.</p>
                        ) : (
                          <div className="ticket-details-list">
                            {tickets.map((ticket) => {
                              const seen = Boolean(ticket.checkedInAt);
                              return (
                                <div key={ticket.id} className="ticket-details">
                                  <div>
                                    <p className="ticket-title">
                                      {ticket.seat.showing.movie.title}
                                    </p>
                                    <p className="muted">
                                      {ticket.seat.rowLabel}-{ticket.seat.number} -{' '}
                                      {new Date(ticket.seat.showing.startTime).toLocaleString(
                                        'es-AR',
                                      )}
                                    </p>
                                    <div className="ticket-meta">
                                      <span className="chip">
                                        QR: {ticket.qrToken.slice(0, 8)}...
                                      </span>
                                      <span className={`badge ${seen ? 'used' : 'pending'}`}>
                                        {seen ? 'Vista' : 'Disponible'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="qr-wrap">
                                    <QrImage value={ticket.qrToken} size={140} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </section>
  );
}
