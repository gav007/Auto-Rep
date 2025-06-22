# AutoRep - Voice-First Smart Workout App

## Overview

AutoRep is a modern fitness tracking application that combines AI-powered workout planning with voice-first interactions. The app provides personalized workout recommendations, tracks progress, and enables hands-free workout logging through voice commands. Built as a full-stack TypeScript application with a focus on mobile-first design and accessibility.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Voice Integration**: Web Speech API for voice recognition and synthesis

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL sessions with connect-pg-simple
- **API Design**: RESTful API with JSON responses

### Build System
- **Frontend Bundler**: Vite with React plugin
- **Backend Bundler**: esbuild for production builds
- **Development**: tsx for TypeScript execution in development
- **Type Checking**: Shared TypeScript configuration across client/server

## Key Components

### Database Schema
The application uses a relational database design with the following core entities:

1. **Users**: Store user preferences, equipment, goals, and training settings
2. **Exercises**: Exercise library with categorization, muscle groups, and equipment requirements
3. **Workout Templates**: Reusable workout configurations
4. **Workouts**: Individual workout sessions with timing and completion tracking
5. **Workout Sets**: Individual exercise sets with weight, reps, and performance data
6. **Progress Records**: User progress tracking per exercise

### Voice Interface
- **Speech Recognition**: Browser-native Web Speech API for voice commands
- **Text-to-Speech**: Browser-native synthesis for audio feedback
- **Voice Commands**: Support for workout logging, navigation, and controls
- **Accessibility**: Fallback UI controls when voice is unavailable

### AI Workout Generation
- **Workout Planning**: Algorithm-based workout generation considering user equipment, goals, and experience
- **Progressive Overload**: Automatic progression suggestions based on performance history
- **Equipment Matching**: Smart exercise selection based on available equipment
- **Goal-Specific Programming**: Different workout structures for muscle building, fat loss, strength, and general fitness

### Mobile-First Design
- **Responsive Layout**: Tailored for mobile devices with touch-friendly interfaces
- **Bottom Navigation**: Standard mobile app navigation pattern
- **PWA Ready**: Meta tags and configuration for progressive web app installation
- **Touch Optimization**: Large touch targets and gesture-friendly interactions

## Data Flow

### User Onboarding
1. User selects equipment and fitness goals
2. System creates user profile with preferences
3. AI generates initial workout recommendations
4. User is redirected to dashboard with personalized content

### Workout Session
1. User starts workout from template or AI recommendation
2. Voice commands or manual input log exercise sets
3. Rest timers automatically trigger between sets
4. Progress is saved in real-time to the database
5. Workout completion updates user statistics

### Progress Tracking
1. Set data is aggregated into progress records
2. Charts visualize performance trends over time
3. AI analyzes patterns for future workout recommendations
4. Personal records are automatically detected and celebrated

### Voice Integration
1. Speech recognition converts voice to text commands
2. Natural language processing interprets workout actions
3. Database operations execute based on voice commands
4. Text-to-speech provides audio feedback and confirmations

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, React Query for state management
- **UI Components**: Radix UI primitives for accessible component foundation
- **Styling**: Tailwind CSS with PostCSS for processing
- **Form Handling**: React Hook Form with Zod validation

### Database and Backend
- **Database**: Neon Database (serverless PostgreSQL)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Validation**: Zod for runtime type validation and schema generation
- **Sessions**: connect-pg-simple for PostgreSQL session storage

### Build and Development Tools
- **Bundling**: Vite for frontend, esbuild for backend
- **TypeScript**: Comprehensive type safety across the stack
- **Development**: Replit-specific plugins for enhanced development experience

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module for local development
- **Hot Reload**: Vite HMR for frontend, tsx watch mode for backend
- **Port Configuration**: Frontend serves on port 5000, backend proxies API requests

### Production Build
- **Frontend**: Vite builds to `dist/public` with static asset optimization
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend assets in production
- **Environment Variables**: DATABASE_URL required for database connection

### Deployment Configuration
- **Build Command**: `npm run build` (builds both frontend and backend)
- **Start Command**: `npm run start` (runs production server)
- **Auto-scaling**: Configured for Replit's autoscale deployment target
- **Database Migration**: `npm run db:push` for schema updates

## Changelog

```
Changelog:
- June 22, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```