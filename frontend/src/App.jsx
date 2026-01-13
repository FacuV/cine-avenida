import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Employee from './pages/Employee';
import Home from './pages/Home';
import MyBookings from './pages/MyBookings';
import ShowingDetails from './pages/ShowingDetails';

function Navigation() {
  const { auth, logout } = useAuth();
  const isEmployee = auth?.user?.role === 'EMPLOYEE' || auth?.user?.role === 'ADMIN';

  return (
    <header className="nav">
      <Link className="brand" to="/">
        Cine Avenida
      </Link>
      <nav className="nav-links">
        <Link to="/">Funciones</Link>
        {auth && !isEmployee && <Link to="/me">Mis reservas</Link>}
        {isEmployee && <Link to="/employee">Administracion</Link>}
        {auth ? (
          <button className="ghost" type="button" onClick={logout}>
            Salir
          </button>
        ) : (
          <Link className="button" to="/login">
            Ingresar
          </Link>
        )}
      </nav>
    </header>
  );
}

function Shell() {
  return (
    <div className="app">
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/employee" element={<Employee />} />
          <Route path="/showings/:id" element={<ShowingDetails />} />
          <Route path="/me" element={<MyBookings />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AuthProvider>
  );
}
