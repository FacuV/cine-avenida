# Cine Avenida Bolivar

Sistema web con backend en NestJS y frontend en React (Vite) para la gestion de funciones, reservas y validacion de entradas.

## Backend (NestJS)

```bash
cd backend
cp .env.example .env
# Si usas SQLite local, deja DATABASE_URL como file:./dev.db
# En algunos entornos puede necesitar la ruta absoluta.

npm install
npx prisma migrate dev --name init
npm run seed
npm run start:dev
```

El backend corre por defecto en `http://localhost:3000`.
El seed crea un admin inicial con:
- Email: `admin@cineavenida.local`
- Password: `Admin123!`
(Podes cambiarlo con `ADMIN_EMAIL` y `ADMIN_PASSWORD` en el entorno.)

## Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

El frontend corre por defecto en `http://localhost:5173`.
