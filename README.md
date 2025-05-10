# Elephant Watch App

A modern web application for reporting and tracking elephant sightings and activities. This application helps forest officials and conservationists collect data about elephant movements, behaviors, and human-elephant conflicts.

## Features

- **User Authentication**: Secure login system for authorized personnel
- **Elephant Activity Reporting**: Multi-step form to report elephant sightings with details
- **Geolocation**: Capture precise location data for sightings
- **Administrative Data**: Record division, range, beat, and compartment information
- **Elephant Details**: Document number of elephants, gender distribution, and identifying features
- **Damage Assessment**: Record and categorize any damage caused by elephants
- **Data Persistence**: All reports are stored in a Supabase database

## Technology Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router
- **Form Management**: React Hook Form with Zod validation
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom authentication with bcrypt
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Supabase account and project

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

Create the following table in your Supabase database:

```sql
CREATE TABLE activity_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_date DATE NOT NULL,
  activity_time TIME NOT NULL,
  latitude TEXT NOT NULL,
  longitude TEXT NOT NULL,
  total_elephants TEXT NOT NULL,
  male_elephants TEXT,
  female_elephants TEXT,
  unknown_elephants TEXT,
  division_name TEXT NOT NULL,
  range_name TEXT NOT NULL,
  beat_name TEXT NOT NULL,
  compartment_no TEXT NOT NULL,
  heading_towards TEXT,
  local_name TEXT,
  identification_marks TEXT,
  reporter_name TEXT NOT NULL,
  reporter_mobile TEXT NOT NULL,
  land_type TEXT NOT NULL,
  damage_done TEXT NOT NULL,
  damage_description TEXT,
  email TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Deployment

This application can be deployed to any static hosting service like Netlify, Vercel, or GitHub Pages.

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
