# Elephant Watch App

A full-stack application for monitoring and reporting elephant sightings and human-elephant conflicts.

## Project Structure

The project is organized into two main directories:

- `frontend/`: React-based web application
- `backend/`: Node.js/Express API server

## Features

- **User Authentication**: Secure login system for authorized personnel
- **Elephant Activity Reporting**: Multi-step form to report elephant sightings with details
- **Geolocation**: Capture precise location data for sightings
- **Live Compass Integration**: Use device compass for accurate direction tracking with lock feature
- **Administrative Data**: Record division, range, beat, and compartment information
- **Elephant Details**: Document number of elephants, gender distribution, and identifying features
- **Damage Assessment**: Record and categorize any damage caused by elephants
- **Data Persistence**: All reports are stored in a Supabase database
- **Mobile-First Design**: Optimized for field use on mobile devices

## Technology Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router
- **Form Management**: React Hook Form with Zod validation
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom authentication with bcrypt
- **Build Tool**: Vite
- **Device APIs**: Geolocation and Device Orientation APIs

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL (v14 or higher)
- Supabase account

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/elephant-watch-app.git
   cd elephant-watch-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration values.

4. Start the development servers:
   ```bash
   npm run dev
   ```

## Development

### Frontend

The frontend is built with:
- React
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- React Router
- React Query

To run the frontend development server:
```bash
npm run dev:frontend
```

### Backend

The backend is built with:
- Node.js
- Express
- TypeScript
- Supabase
- JWT Authentication

To run the backend development server:
```bash
npm run dev:backend
```

## Testing

Run tests for both frontend and backend:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Building for Production

Build both frontend and backend:
```bash
npm run build
```

## Deployment

The frontend is configured for deployment to GitHub Pages:
```bash
npm run deploy
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Supabase](https://supabase.io/)
- [Express](https://expressjs.com/)
