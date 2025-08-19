# Toastify - Cold Email Outreach Management System

A comprehensive cold email outreach management system with automatic prospect scoring, engagement tracking, and Supabase backend integration.

## Features

- 🎯 **Smart Prospect Management** - Automatic scoring and engagement tracking
- 📧 **Email Sequence Management** - Multi-stage email campaigns
- 📊 **Analytics & Reporting** - Track performance and optimize campaigns
- 🔐 **Authentication** - Secure user management with Supabase Auth
- 🎮 **Demo Mode** - Full-featured demo without requiring authentication
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Quick Start

### 1. Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

```bash
npm run dev
```

The application will start at `http://localhost:3000`.

## Demo Mode

If you don't have Supabase configured, the application automatically falls back to demo mode with:
- Sample prospect data
- Full feature functionality
- No authentication required
- Local storage for persistence

## Production Setup

### Supabase Configuration

1. **Create a Supabase project** at https://supabase.com
2. **Set up the database schema** (see `/database/schema.sql` for the required tables)
3. **Configure OAuth providers** in your Supabase dashboard:
   - Google OAuth
   - GitHub OAuth
4. **Update environment variables** with your actual Supabase credentials

### Database Schema

The application requires these tables in your Supabase database:

- `prospects` - Store prospect information and engagement data
- `email_sequences` - Store email sequence templates
- `user_settings` - Store user preferences and configuration

### Build for Production

```bash
npm run build
```

## Development

### Code Quality

- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **Husky** - Pre-commit hooks for code quality

```bash
npm run lint        # Check for linting errors
npm run lint:fix    # Fix linting errors
npm run format      # Format code with Prettier
npm run type-check  # TypeScript type checking
```

### Testing

```bash
npm run test              # Run tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage
```

## Architecture

### Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **React Query** - Data fetching and caching
- **Supabase** - Backend as a service
- **Shadcn/ui** - UI component library
- **Zod** - Schema validation

### Key Features

- **Error Boundaries** - Graceful error handling
- **Empty States** - User-friendly empty data states
- **Form Validation** - Robust form validation with Zod
- **Accessibility** - WCAG compliance and keyboard navigation
- **Responsive Design** - Mobile-first approach

### Project Structure

```
├── components/           # React components
│   ├── ui/              # Shadcn/ui components
│   └── ...              # Feature components
├── hooks/               # Custom React hooks
├── schemas/             # Zod validation schemas
├── utils/               # Utility functions
│   └── supabase/        # Supabase client configuration
├── styles/              # Global styles and Tailwind config
└── App.tsx              # Main application component
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL | No* |
| `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anonymous key | No* |

*Required for production with real authentication and data persistence

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details