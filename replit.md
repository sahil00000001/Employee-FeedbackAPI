# Talent360 - Employee Performance Management Suite

## Overview

Talent360 is a full-stack employee performance management application that enables 360-degree feedback collection and analysis. The system allows organizations to manage employees, projects, and managers while facilitating peer-to-peer feedback assignments and performance reviews.

The application connects to an external MongoDB database (MongoDB Atlas) containing employee data, project details, and feedback records. It provides a modern React dashboard for viewing employees, managing projects, assigning peer reviewers, and submitting/viewing performance feedback with radar chart visualizations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens defined in CSS variables
- **Data Visualization**: Recharts for radar charts displaying feedback scores
- **Build Tool**: Vite with React plugin

The frontend follows a page-based architecture with shared components:
- `/client/src/pages/` - Route components (Dashboard, Employees, Projects, Managers, Feedback)
- `/client/src/components/` - Reusable UI components
- `/client/src/hooks/` - Custom React Query hooks for data fetching

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **Database**: MongoDB Atlas (external cloud database)
- **ORM/ODM**: Mongoose for MongoDB, with Drizzle ORM configured for PostgreSQL (currently unused)

The backend uses a controller-based pattern:
- `/server/routes/` - Express route definitions
- `/server/controllers/` - Business logic handlers
- `/server/models/` - Mongoose schema definitions
- `/server/config/db.js` - MongoDB connection configuration

### Data Models
MongoDB collections map to these entities:
- `Total_Company` → Employees
- `Managers` → Manager records
- `Project_Details` → Projects with team members
- `Assign_Feedback` → Peer reviewer assignments
- `360_Feedback` → Submitted feedback with ratings

### API Structure
RESTful endpoints prefixed with `/api/`:
- `/api/employees` - CRUD for employee records
- `/api/managers` - Manager data and team queries
- `/api/projects` - Project management
- `/api/feedback-assignment` - Peer reviewer assignment management
- `/api/feedback-360` - Feedback submission and retrieval

### Build System
- Development: Vite dev server with HMR, proxying API calls to Express
- Production: esbuild bundles server code, Vite builds client to `dist/public`

## External Dependencies

### Database
- **MongoDB Atlas**: Primary database hosted externally
  - Connection string stored in `MONGODB_URI` environment variable
  - Contains employee, project, manager, and feedback data

### PostgreSQL (Configured but Optional)
- Drizzle ORM is configured with PostgreSQL dialect
- Schema defined in `/shared/schema.ts`
- Connection via `DATABASE_URL` environment variable
- Currently not used as primary data source (MongoDB is primary)

### Third-Party Libraries
- **@tanstack/react-query**: Server state management
- **Radix UI**: Accessible component primitives
- **Recharts**: Data visualization
- **date-fns**: Date formatting utilities
- **Zod**: Runtime schema validation
- **Mongoose**: MongoDB ODM

### Environment Variables Required
- `MONGODB_URI` - MongoDB Atlas connection string (URL-encoded password)
- `DATABASE_URL` - PostgreSQL connection string (for Drizzle, optional)