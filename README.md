# weConnect Monorepo

A full-stack monorepo using Turborepo with Express.js backend and React frontend, featuring shared UI components, TypeScript configs, and ESLint/Prettier setup.

## 📁 Repository Structure

```
weConnect/
├── apps/
│   ├── client/          # React + Vite frontend
│   └── server/          # Express.js backend
├── packages/
│   ├── eslint-config/   # Shared ESLint configuration
│   ├── prettier-config/ # Shared Prettier configuration
│   ├── tsconfig/        # Shared TypeScript configurations
│   └── ui/              # Shared UI components library (shadcn/ui)
├── turbo.json           # Turborepo pipeline configuration
├── pnpm-workspace.yaml  # pnpm workspace configuration
├── package.json         # Root package.json with scripts
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 10.4.1

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start all apps in dev mode
pnpm run dev

# Start specific app
pnpm run dev --filter="@weconnect/client"
pnpm run dev --filter="@weconnect/server"
```

### Build

```bash
# Build all apps
pnpm run build

# Build specific app
pnpm run build --filter="@weconnect/server"
```

### Linting & Formatting

```bash
# Lint all apps
pnpm run lint

# Format all code
pnpm run format

# Type check
pnpm run check-types
```

## 📦 Packages

### `@weconnect/ui`

Shared UI component library built with shadcn/ui and Tailwind CSS.

**Usage:**

```typescript
import { Button, cn } from '@weconnect/ui';

export function MyComponent() {
  return <Button className={cn('w-full')}>Click me</Button>;
}
```

**Adding components:**

```bash
# In client or packages/ui
pnpm dlx shadcn-ui@latest add button
```

### `@weconnect/eslint-config`

Shared ESLint configuration for TypeScript, React, and Node.js.

### `@weconnect/prettier-config`

Shared Prettier formatting configuration.

### `@weconnect/tsconfig`

Shared TypeScript base configurations:

- `base.json` - Base config (ES2020, strict mode)
- `react.json` - Extends base with React JSX support
- `node.json` - Extends base for Node.js

## 🔧 Apps

### Client (`@weconnect/client`)

React + Vite frontend application.

**Features:**

- React 19 with Vite bundler
- Redux Toolkit for state management
- React Router for navigation
- Socket.io for real-time communication
- Tailwind CSS + shadcn/ui components
- TypeScript

**Key Directories:**

- `src/components/` - React components
- `src/pages/` - Page components
- `src/context/` - Redux store and slices
- `src/hooks/` - Custom React hooks
- `src/api/` - API service calls
- `src/utils/` - Utility functions

**Scripts:**

```bash
pnpm run dev              # Start Vite dev server
pnpm run build            # Build for production
pnpm run lint             # Run ESLint
pnpm run format           # Format code
pnpm run type-check       # Check TypeScript types
```

### Server (`@weconnect/server`)

Express.js backend application.

**Features:**

- Express.js web server
- Prisma ORM for database management
- PostgreSQL database
- Socket.io for real-time features
- Passport.js for authentication
- JWT token support
- Winston logging

**Key Directories:**

- `src/controllers/` - Request handlers
- `src/services/` - Business logic
- `src/repository/` - Database queries
- `src/routes/` - API endpoints
- `src/middlewares/` - Express middlewares
- `src/socket/` - Socket.io handlers
- `prisma/` - Database schema and migrations

**Scripts:**

```bash
pnpm run dev              # Start with file watching
pnpm run build            # Compile TypeScript
pnpm run start            # Run compiled app
pnpm run lint             # Run ESLint
pnpm run format           # Format code
pnpm run type-check       # Check TypeScript types
```

## 🔄 Turborepo Pipeline

Tasks are defined in `turbo.json`:

- **build**: Compiles apps, outputs to `dist/`, caches results
- **dev**: Development with watch mode, no caching
- **lint**: Lints code, caches results
- **format**: Code formatting, no caching
- **check-types**: TypeScript type checking, caches results

## 📝 Global Configurations

### Root ESLint (`.eslintrc.json`)

Extends `@weconnect/eslint-config`. Override in individual apps if needed.

### Root Prettier (`.prettierrc.json`)

Shared formatting rules:

- 2-space indentation
- Single quotes
- 100 character print width
- Trailing commas (ES5)
- LF line endings

### Root TypeScript (`packages/tsconfig/`)

- Apps extend from base configs
- Path aliases for imports
- Strict type checking

## 🔗 Workspace References

Use `workspace:*` protocol in `package.json` to reference local packages:

```json
{
  "devDependencies": {
    "@weconnect/ui": "workspace:*",
    "@weconnect/eslint-config": "workspace:*"
  }
}
```

## 📋 Scripts Reference

### At Root

```bash
pnpm run dev                # Start all apps
pnpm run build              # Build all apps
pnpm run lint               # Lint all code
pnpm run format             # Format all code
pnpm run check-types        # Type check all apps
```

### With Filters

```bash
pnpm run dev --filter="@weconnect/client"
pnpm run build --filter="@weconnect/server"
pnpm run lint --filter="@weconnect/ui"
```

## 🚦 Git Workflow

1. Create feature branch
2. Make changes
3. Run `pnpm run lint` and `pnpm run format`
4. Run `pnpm run check-types` to verify types
5. Test with `pnpm run dev`
6. Commit and push

## 📚 Documentation

- [Turborepo Docs](https://turbo.build/)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Prisma Docs](https://www.prisma.io/docs/)

## 🤝 Contributing

1. Follow the workspace structure
2. Use shared configs (ESLint, Prettier, TypeScript)
3. Add types for new features
4. Keep components modular and reusable
5. Use shadcn/ui components when possible

## 📄 License

ISC
