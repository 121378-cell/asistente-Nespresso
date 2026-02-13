# Nespresso Assistant Backend

Backend API for the Nespresso Repair Assistant application. Built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- ✅ RESTful API for managing saved repairs
- ✅ PostgreSQL database with Prisma ORM
- ✅ TypeScript for type safety
- ✅ CORS enabled for frontend communication
- ✅ Automatic database migrations
- ✅ Support for image attachments (data URLs)

## Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)

## Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and configure your database connection:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/nespresso_assistant?schema=public"
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```

3. **Set up PostgreSQL database:**

   **Option A: Local PostgreSQL**
   - Install PostgreSQL on your machine
   - Create a database: `createdb nespresso_assistant`
   - Update `DATABASE_URL` in `.env` with your credentials

   **Option B: Cloud PostgreSQL (Recommended for production)**
   - Use a service like [Supabase](https://supabase.com/), [Railway](https://railway.app/), or [Render](https://render.com/)
   - Get the connection string and update `DATABASE_URL` in `.env`

4. **Run database migrations:**

   ```bash
   npm run prisma:migrate
   ```

5. **Generate Prisma client:**
   ```bash
   npm run prisma:generate
   ```

## Development

Start the development server with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## Production

1. **Build the project:**

   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

## API Endpoints

### Health Check

- `GET /health` - Check if the server is running

### Repairs

- `GET /api/repairs` - Get all saved repairs (with message preview)
- `GET /api/repairs/:id` - Get a specific repair with all messages
- `POST /api/repairs` - Create a new repair
- `PUT /api/repairs/:id` - Update a repair
- `DELETE /api/repairs/:id` - Delete a repair

### Example: Create a Repair

```bash
POST /api/repairs
Content-Type: application/json

{
  "name": "Aguila 440 - Problema de presión",
  "machineModel": "Aguila 440",
  "serialNumber": "A440-12345",
  "timestamp": 1700000000000,
  "messages": [
    {
      "role": "MODEL",
      "text": "Hola, soy tu asistente..."
    },
    {
      "role": "USER",
      "text": "La máquina no tiene presión"
    }
  ]
}
```

## Database Management

### View database in Prisma Studio

```bash
npm run prisma:studio
```

### Create a new migration

```bash
npm run prisma:migrate
```

### Reset database (⚠️ deletes all data)

```bash
npx prisma migrate reset
```

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── controllers/
│   │   └── repairsController.ts  # Business logic
│   ├── routes/
│   │   └── repairsRouter.ts      # API routes
│   └── server.ts                 # Express app setup
├── .env                          # Environment variables (not in git)
├── .env.example                  # Environment template
├── package.json
└── tsconfig.json
```

## Troubleshooting

### Database connection errors

- Ensure PostgreSQL is running
- Check your `DATABASE_URL` in `.env`
- Verify database exists: `psql -l`

### Port already in use

- Change `PORT` in `.env` to a different port
- Or kill the process using port 3001: `npx kill-port 3001`

### Prisma errors

- Regenerate client: `npm run prisma:generate`
- Reset database: `npx prisma migrate reset`

## Deployment

### Railway (Recommended)

1. Create a new project on [Railway](https://railway.app/)
2. Add PostgreSQL database
3. Deploy this backend
4. Set environment variables in Railway dashboard
5. Update `FRONTEND_URL` to your deployed frontend URL

### Render

1. Create a new Web Service on [Render](https://render.com/)
2. Add PostgreSQL database
3. Set build command: `npm install && npm run build && npm run prisma:generate`
4. Set start command: `npm start`
5. Add environment variables

## License

MIT
