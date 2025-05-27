# Elephant Watch App

A modern web application for reporting and tracking elephant sightings and activities. This application helps forest officials and conservationists collect data about elephant movements, behaviors, and human-elephant conflicts.

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

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Supabase account and project
- Modern mobile device with compass support (for compass feature)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/elephant-watch-app.git
   cd elephant-watch-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and add your Supabase credentials
   ```
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

### Database Setup

The application uses several tables in Supabase. Run the following migration script to set up your database:

```sql
-- See migrations/activity_reports.sql for the complete schema
```

### Device Permissions

For the compass feature to work:

1. The app must be served over HTTPS (except for localhost)
2. Users must grant permission to access device orientation
3. Device must have compass hardware support
4. For iOS 13+, users will be prompted for permission when using the compass feature

## Usage

### Compass Feature

The app includes a built-in compass feature that allows users to:

1. Start compass tracking using the device's internal compass
2. Lock the bearing at any point for accurate recording
3. Manually input bearing if needed
4. Visual feedback with rotating compass icon
5. Support for both iOS and Android devices

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Deployment

This application can be deployed to any static hosting service like Netlify, Vercel, or GitHub Pages. Make sure to:

1. Configure environment variables in your hosting platform
2. Enable HTTPS for device APIs to work
3. Set up proper CORS policies in Supabase

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors and maintainers
- Built with [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Supabase](https://supabase.io/)
