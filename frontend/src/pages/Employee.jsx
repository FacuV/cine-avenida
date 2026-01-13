import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';

const money = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
});

const initialMovie = {
  title: '',
  description: '',
  durationMinutes: 90,
  language: 'Español',
  format: 'TWO_D',
  posterUrl: '',
};

const initialShowing = {
  movieId: '',
  startTime: '',
  priceArs: '2500',
  rows: 8,
  seatsPerRow: 12,
};

const initialShowingEdit = {
  startTime: '',
  priceArs: '',
};

export default function Employee() {
  const { auth } = useAuth();
  const [movies, setMovies] = useState([]);
  const [showings, setShowings] = useState([]);
  const [movieForm, setMovieForm] = useState(initialMovie);
  const [editMovieId, setEditMovieId] = useState('');
  const [editMovieForm, setEditMovieForm] = useState(initialMovie);
  const [showingForm, setShowingForm] = useState(initialShowing);
  const [editShowingId, setEditShowingId] = useState('');
  const [editShowingForm, setEditShowingForm] = useState(initialShowingEdit);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [report, setReport] = useState({ summary: null, showings: [] });
  const [reportDate, setReportDate] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [activeForm, setActiveForm] = useState('movie');

  const isEmployee = auth?.user?.role === 'EMPLOYEE' || auth?.user?.role === 'ADMIN';
  const orderedShowings = [...showings].sort(
    (a, b) => new Date(a.startTime) - new Date(b.startTime),
  );
  const editingMovie = movies.find((movie) => movie.id === editMovieId) ?? null;
  const editingShowing = showings.find((showing) => showing.id === editShowingId) ?? null;

  const loadMovies = () => {
    if (!auth?.accessToken) return;
    apiFetch('/movies', { token: auth.accessToken })
      .then((data) => setMovies(data || []))
      .catch((err) => setError(err.message));
  };

  const loadShowings = () => {
    if (!auth?.accessToken) return;
    apiFetch('/showings', { token: auth.accessToken })
      .then((data) => setShowings(data || []))
      .catch((err) => setError(err.message));
  };

  const loadReport = (dateValue) => {
    if (!auth?.accessToken) return;
    setReportLoading(true);
    setReportError('');
    const query = dateValue ? `?date=${dateValue}` : '';
    apiFetch(`/reports/showings${query}`, { token: auth.accessToken })
      .then((data) => setReport(data ?? { summary: null, showings: [] }))
      .catch((err) => setReportError(err.message))
      .finally(() => setReportLoading(false));
  };

  useEffect(() => {
    loadMovies();
    loadShowings();
  }, [auth?.accessToken]);

  useEffect(() => {
    if (!auth?.accessToken) return;
    loadReport(reportDate);
  }, [auth?.accessToken, reportDate]);

  const handleMovieChange = (event) => {
    const { name, value } = event.target;
    setMovieForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleShowingChange = (event) => {
    const { name, value } = event.target;
    setShowingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditMovieChange = (event) => {
    const { name, value } = event.target;
    setEditMovieForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditShowingChange = (event) => {
    const { name, value } = event.target;
    setEditShowingForm((prev) => ({ ...prev, [name]: value }));
  };

  const toLocalInput = (value) => {
    if (!value) return '';
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const submitMovie = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await apiFetch('/movies', {
        method: 'POST',
        token: auth.accessToken,
        body: JSON.stringify({
          ...movieForm,
          durationMinutes: Number(movieForm.durationMinutes),
        }),
      });
      setMessage('Pelicula creada.');
      setMovieForm(initialMovie);
      loadMovies();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitShowing = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      const priceCents = Math.round(Number(showingForm.priceArs) * 100);
      await apiFetch('/showings', {
        method: 'POST',
        token: auth.accessToken,
        body: JSON.stringify({
          movieId: showingForm.movieId,
          startTime: showingForm.startTime,
          priceCents,
          rows: Number(showingForm.rows),
          seatsPerRow: Number(showingForm.seatsPerRow),
        }),
      });
      setMessage('Funcion creada.');
      setShowingForm(initialShowing);
      loadShowings();
      loadReport(reportDate);
    } catch (err) {
      setError(err.message);
    }
  };

  const startEditMovie = (movie) => {
    setEditShowingId('');
    setEditMovieId(movie.id);
    setEditMovieForm({
      title: movie.title ?? '',
      description: movie.description ?? '',
      durationMinutes: movie.durationMinutes ?? 90,
      language: movie.language ?? '',
      format: movie.format ?? 'TWO_D',
      posterUrl: movie.posterUrl ?? '',
    });
    setMessage('');
    setError('');
  };

  const cancelEditMovie = () => {
    setEditMovieId('');
    setEditMovieForm(initialMovie);
  };

  const submitMovieUpdate = async (event) => {
    event.preventDefault();
    if (!editMovieId) return;
    setMessage('');
    setError('');
    try {
      await apiFetch(`/movies/${editMovieId}`, {
        method: 'PATCH',
        token: auth.accessToken,
        body: JSON.stringify({
          ...editMovieForm,
          durationMinutes: Number(editMovieForm.durationMinutes),
        }),
      });
      setMessage('Pelicula actualizada.');
      cancelEditMovie();
      loadMovies();
      loadShowings();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteMovie = async (movie) => {
    const confirmed = window.confirm(
      `Eliminar la pelicula "${movie.title}"? Solo se puede borrar si no tiene funciones asociadas.`,
    );
    if (!confirmed) return;
    setMessage('');
    setError('');
    try {
      await apiFetch(`/movies/${movie.id}`, {
        method: 'DELETE',
        token: auth.accessToken,
      });
      setMessage('Pelicula eliminada.');
      if (editMovieId === movie.id) {
        cancelEditMovie();
      }
      loadMovies();
      loadShowings();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEditShowing = (showing) => {
    setEditMovieId('');
    setEditShowingId(showing.id);
    setEditShowingForm({
      startTime: toLocalInput(showing.startTime),
      priceArs: String(showing.priceCents / 100),
    });
    setMessage('');
    setError('');
  };

  const cancelEditShowing = () => {
    setEditShowingId('');
    setEditShowingForm(initialShowingEdit);
  };

  const submitShowingUpdate = async (event) => {
    event.preventDefault();
    if (!editShowingId) return;
    setMessage('');
    setError('');
    try {
      const priceCents = Math.round(Number(editShowingForm.priceArs) * 100);
      const payload = {
        priceCents,
      };
      if (editShowingForm.startTime) {
        payload.startTime = new Date(editShowingForm.startTime).toISOString();
      }
      await apiFetch(`/showings/${editShowingId}`, {
        method: 'PATCH',
        token: auth.accessToken,
        body: JSON.stringify(payload),
      });
      setMessage('Funcion actualizada.');
      cancelEditShowing();
      loadShowings();
      loadReport(reportDate);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelShowing = async (showing) => {
    const dateLabel = new Date(showing.startTime).toLocaleString('es-AR');
    const confirmed = window.confirm(
      `Cancelar la funcion de "${showing.movie.title}" (${dateLabel})? Se generara un credito para las entradas pagadas.`,
    );
    if (!confirmed) return;
    setMessage('');
    setError('');
    try {
      await apiFetch(`/showings/${showing.id}/cancel`, {
        method: 'POST',
        token: auth.accessToken,
      });
      setMessage('Funcion cancelada. Se generaron creditos para los usuarios afectados.');
      if (editShowingId === showing.id) {
        cancelEditShowing();
      }
      loadShowings();
      loadReport(reportDate);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!auth) {
    return (
      <section className="page">
        <h1>Acceso restringido</h1>
        <p className="muted">Inicia sesion con una cuenta de empleado.</p>
      </section>
    );
  }

  if (!isEmployee) {
    return (
      <section className="page">
        <h1>Sin permisos</h1>
        <p className="muted">Tu cuenta no tiene rol de empleado.</p>
      </section>
    );
  }

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Panel de administracion</p>
          <h1>Gestion de cartelera y ventas</h1>
          <p className="lead">Administra peliculas, funciones y ventas presenciales.</p>
        </div>
      </header>

      <div className="info-strip">
        <div className="info-card">
          <p className="info-title">Primer paso</p>
          <p className="muted">Carga la pelicula antes de programar la funcion.</p>
        </div>
        <div className="info-card">
          <p className="info-title">Segundo paso</p>
          <p className="muted">Define horarios, precios y sala por funcion.</p>
        </div>
        <div className="info-card">
          <p className="info-title">Ventas presenciales</p>
          <p className="muted">Las butacas se registran y bloquean al instante.</p>
        </div>
      </div>

      <section className="section">
        <div className="section-header">
          <div>
          <p className="eyebrow">Reportes</p>
          <h2>Resumen de ventas y funciones</h2>
          </div>
          <div className="report-controls">
            <label>
              Fecha
              <input
                type="date"
                value={reportDate}
                onChange={(event) => setReportDate(event.target.value)}
              />
            </label>
            <button className="ghost" type="button" onClick={() => setReportDate('')}>
              Ver todo
            </button>
          </div>
        </div>

        {reportError && <p className="error">{reportError}</p>}
        {reportLoading && <p className="muted">Cargando reporte...</p>}

        {!reportLoading && report?.summary && (
          <div className="report-summary">
            <div className="info-card">
              <p className="info-title">Funciones</p>
              <p className="price">{report.summary.totalShowings}</p>
            </div>
            <div className="info-card">
              <p className="info-title">Entradas vendidas</p>
              <p className="price">{report.summary.totalTicketsSold}</p>
            </div>
            <div className="info-card">
              <p className="info-title">Reservas</p>
              <p className="price">{report.summary.totalReservedSeats}</p>
            </div>
            <div className="info-card">
              <p className="info-title">En hold</p>
              <p className="price">{report.summary.totalHeldSeats}</p>
            </div>
            <div className="info-card">
              <p className="info-title">Recaudacion</p>
              <p className="price">{money.format(report.summary.totalRevenueCents / 100)}</p>
            </div>
          </div>
        )}

        {!reportLoading && report?.showings?.length === 0 && (
          <p className="muted">No hay funciones registradas para esta fecha.</p>
        )}

        {!reportLoading && report?.showings?.length > 0 && (
          <div className="grid">
            {report.showings.map((showing) => (
              <article key={showing.id} className="card report-card">
                <div className="card-header">
                  <h3>{showing.movie.title}</h3>
                  <span className="chip">{showing.movie.format}</span>
                </div>
                <p className="muted">{showing.movie.language}</p>
                <p className="meta">{new Date(showing.startTime).toLocaleString('es-AR')}</p>
                <div className="report-stats">
                  <div>
                    <span className="stat-label">Vendidas</span>
                    <span className="stat-value">{showing.soldSeats}</span>
                  </div>
                  <div>
                    <span className="stat-label">Reservadas</span>
                    <span className="stat-value">{showing.reservedSeats}</span>
                  </div>
                  <div>
                    <span className="stat-label">En hold</span>
                    <span className="stat-value">{showing.heldSeats}</span>
                  </div>
                  <div>
                    <span className="stat-label">Disponibles</span>
                    <span className="stat-value">{showing.availableSeats}</span>
                  </div>
                </div>
                <div className="card-row">
                  <span className="price">{money.format(showing.revenueCents / 100)}</span>
                  <span className="pill">{showing.totalSeats} asientos</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Cartelera</p>
            <h2>Alta de peliculas y funciones</h2>
          </div>
          <p className="muted">
            Carga primero la pelicula y luego programa la funcion con fecha y precio.
          </p>
        </div>

        <div className="form-toggle">
          <button
            type="button"
            className={activeForm === 'movie' ? 'active' : ''}
            onClick={() => setActiveForm('movie')}
          >
            Nueva pelicula
          </button>
          <button
            type="button"
            className={activeForm === 'showing' ? 'active' : ''}
            onClick={() => setActiveForm('showing')}
          >
            Nueva funcion
          </button>
        </div>

        <div className="employee-forms">
          {activeForm === 'movie' && (
            <form className="card form form-panel" onSubmit={submitMovie}>
              <h2>Nueva pelicula</h2>
              <label>
                Titulo
                <input name="title" value={movieForm.title} onChange={handleMovieChange} required />
              </label>
              <label>
                Descripcion
                <textarea
                  name="description"
                  value={movieForm.description}
                  onChange={handleMovieChange}
                  rows="3"
                  required
                />
              </label>
              <label>
                Duracion (min)
                <input
                  name="durationMinutes"
                  type="number"
                  min="1"
                  value={movieForm.durationMinutes}
                  onChange={handleMovieChange}
                  required
                />
              </label>
              <label>
                Idioma
                <input
                  name="language"
                  value={movieForm.language}
                  onChange={handleMovieChange}
                  required
                />
              </label>
              <label>
                Formato
                <select name="format" value={movieForm.format} onChange={handleMovieChange}>
                  <option value="TWO_D">2D</option>
                  <option value="THREE_D">3D</option>
                </select>
              </label>
              <label>
                URL de portada
                <input
                  name="posterUrl"
                  value={movieForm.posterUrl}
                  onChange={handleMovieChange}
                  placeholder="https://..."
                />
              </label>
              <button className="button" type="submit">Guardar pelicula</button>
            </form>
          )}

          {activeForm === 'showing' && (
            <form className="card form form-panel" onSubmit={submitShowing}>
              <h2>Nueva funcion</h2>
              <label>
                Pelicula
                <select
                  name="movieId"
                  value={showingForm.movieId}
                  onChange={handleShowingChange}
                  required
                >
                  <option value="">Seleccionar</option>
                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Fecha y hora
                <input
                  name="startTime"
                  type="datetime-local"
                  value={showingForm.startTime}
                  onChange={handleShowingChange}
                  required
                />
              </label>
              <label>
                Precio (ARS)
                <input
                  name="priceArs"
                  type="number"
                  min="0"
                  value={showingForm.priceArs}
                  onChange={handleShowingChange}
                  required
                />
              </label>
              <label>
                Filas
                <input
                  name="rows"
                  type="number"
                  min="1"
                  value={showingForm.rows}
                  onChange={handleShowingChange}
                  required
                />
              </label>
              <label>
                Asientos por fila
                <input
                  name="seatsPerRow"
                  type="number"
                  min="1"
                  value={showingForm.seatsPerRow}
                  onChange={handleShowingChange}
                  required
                />
              </label>
              <button className="button" type="submit">Programar funcion</button>
            </form>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Gestion</p>
            <h2>Peliculas cargadas</h2>
          </div>
          <p className="muted">Edita datos o elimina peliculas sin funciones.</p>
        </div>

        {movies.length === 0 && <p className="muted">No hay peliculas cargadas.</p>}

        {movies.length > 0 && (
          <div className="manage-grid">
            {movies.map((movie) => (
              <article key={movie.id} className="card manage-card">
                <div className="card-header">
                  <h3>{movie.title}</h3>
                  <span className="chip">{movie.format}</span>
                </div>
                <p className="muted">
                  {movie.language} · {movie.durationMinutes} min
                </p>
                <p className="movie-card-desc">{movie.description}</p>
                <div className="actions-row">
                  <button type="button" className="ghost" onClick={() => startEditMovie(movie)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="ghost danger"
                    onClick={() => handleDeleteMovie(movie)}
                  >
                    Eliminar
                  </button>
                </div>

              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Funciones</p>
            <h2>Funciones programadas</h2>
          </div>
          <p className="muted">Solo podes editar fecha y precio.</p>
        </div>

        {orderedShowings.length === 0 && <p className="muted">No hay funciones programadas.</p>}

        {orderedShowings.length > 0 && (
          <div className="manage-grid">
            {orderedShowings.map((showing) => (
              <article key={showing.id} className="card manage-card">
                <div className="card-header">
                  <h3>{showing.movie.title}</h3>
                  <span className="chip">{showing.movie.format}</span>
                </div>
                <p className="muted">{showing.movie.language}</p>
                <p className="meta">{new Date(showing.startTime).toLocaleString('es-AR')}</p>
                <div className="card-row">
                  <span className="price">{money.format(showing.priceCents / 100)}</span>
                  <span className="pill">{showing.availableSeats} libres</span>
                </div>
                <div className="actions-row">
                  <button type="button" className="ghost" onClick={() => startEditShowing(showing)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="ghost danger"
                    onClick={() => handleCancelShowing(showing)}
                  >
                    Cancelar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {editMovieId && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Editar pelicula</p>
                <h2>{editingMovie?.title ?? 'Editar pelicula'}</h2>
              </div>
              <button type="button" className="ghost" onClick={cancelEditMovie}>
                Cerrar
              </button>
            </div>
            <form className="form" onSubmit={submitMovieUpdate}>
              <label>
                Titulo
                <input
                  name="title"
                  value={editMovieForm.title}
                  onChange={handleEditMovieChange}
                  required
                />
              </label>
              <label>
                Descripcion
                <textarea
                  name="description"
                  value={editMovieForm.description}
                  onChange={handleEditMovieChange}
                  rows="3"
                  required
                />
              </label>
              <label>
                Duracion (min)
                <input
                  name="durationMinutes"
                  type="number"
                  min="1"
                  value={editMovieForm.durationMinutes}
                  onChange={handleEditMovieChange}
                  required
                />
              </label>
              <label>
                Idioma
                <input
                  name="language"
                  value={editMovieForm.language}
                  onChange={handleEditMovieChange}
                  required
                />
              </label>
              <label>
                Formato
                <select
                  name="format"
                  value={editMovieForm.format}
                  onChange={handleEditMovieChange}
                >
                  <option value="TWO_D">2D</option>
                  <option value="THREE_D">3D</option>
                </select>
              </label>
              <label>
                URL de portada
                <input
                  name="posterUrl"
                  value={editMovieForm.posterUrl}
                  onChange={handleEditMovieChange}
                  placeholder="https://..."
                />
              </label>
              <div className="actions-row">
                <button className="button" type="submit">
                  Guardar cambios
                </button>
                <button type="button" className="ghost" onClick={cancelEditMovie}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editShowingId && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Editar funcion</p>
                <h2>{editingShowing?.movie?.title ?? 'Funcion'}</h2>
                <p className="muted">
                  {editingShowing
                    ? new Date(editingShowing.startTime).toLocaleString('es-AR')
                    : ''}
                </p>
              </div>
              <button type="button" className="ghost" onClick={cancelEditShowing}>
                Cerrar
              </button>
            </div>
            <form className="form" onSubmit={submitShowingUpdate}>
              <label>
                Fecha y hora
                <input
                  name="startTime"
                  type="datetime-local"
                  value={editShowingForm.startTime}
                  onChange={handleEditShowingChange}
                  required
                />
              </label>
              <label>
                Precio (ARS)
                <input
                  name="priceArs"
                  type="number"
                  min="0"
                  value={editShowingForm.priceArs}
                  onChange={handleEditShowingChange}
                  required
                />
              </label>
              <p className="tiny">No se puede cambiar la sala ni la cantidad de butacas.</p>
              <div className="actions-row">
                <button className="button" type="submit">
                  Guardar cambios
                </button>
                <button type="button" className="ghost" onClick={cancelEditShowing}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(message || error) && (
        <div className="notice">
          {message && <p>{message}</p>}
          {error && <p className="error">{error}</p>}
        </div>
      )}
    </section>
  );
}
