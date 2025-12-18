## Event Guest Management (MERN)

### Backend

- Go to `backend` and create a `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/guest-events
PORT=4000
JWT_SECRET=change-me-jwt
QR_SECRET=change-me-qr
JWT_EXPIRES_IN=1d
```

- Install and run:

```bash
cd backend
npm install
npm run dev
```

- Seed a super admin (one time):

POST `http://localhost:4000/api/auth/seed-super-admin`

```json
{
  "name": "Super Admin",
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

Use this email/password to log in from the frontend.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open the shown URL (typically `http://localhost:5173`).

### Main Features

- Role-based JWT auth (Super Admin/Event Admin)
- Event creation and management
- Guest management with QR generation
- Secure QR scan + attendance tracking
- Live dashboard with attendance and admin activity logs


