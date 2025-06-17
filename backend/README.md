# Elephant Watch App Backend

This is the backend service for the Elephant Watch application, built with Node.js, Express, and TypeScript.

## Features

- RESTful API endpoints for elephant tracking and monitoring
- Authentication and authorization using JWT
- Database integration with Supabase
- File upload and processing for shapefiles
- Data validation and error handling
- Comprehensive test coverage

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project
- PostgreSQL (for local development)

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   JWT_SECRET=your_jwt_secret
   ```

## Development

Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:3000 (or the port specified in your .env file).

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate test coverage report:
```bash
npm run test:coverage
```

## API Documentation

The API documentation is available at `/api-docs` when running the server.

### Main Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/elephants` - Get all elephants
- `POST /api/elephants` - Add new elephant
- `GET /api/elephants/:id` - Get elephant by ID
- `PUT /api/elephants/:id` - Update elephant
- `DELETE /api/elephants/:id` - Delete elephant
- `POST /api/upload/shapefile` - Upload shapefile

## Project Structure

```
backend/
├── app/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── tests/              # Test files
├── .env               # Environment variables
├── .eslintrc.js      # ESLint configuration
├── jest.config.js    # Jest configuration
├── package.json      # Project dependencies
└── tsconfig.json     # TypeScript configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 