# @weconnect/ui

Shared UI component library built with shadcn/ui, Radix UI, and Tailwind CSS.

## Features

- 🎨 Pre-built shadcn/ui components
- 🎭 Radix UI primitives for accessibility
- 🎯 Tailwind CSS for styling
- 🔧 Easy to customize and extend
- 📦 ESM and TypeScript support

## Installation

This package is part of the weConnect monorepo and is automatically available to all apps.

## Usage

### Using components

```typescript
import { Button } from '@weconnect/ui';

export function MyComponent() {
  return <Button>Click me</Button>;
}
```

### Using utilities

```typescript
import { cn } from '@weconnect/ui';

export function MyComponent() {
  return <div className={cn('px-4', 'py-2', 'text-lg')}>Content</div>;
}
```

### Using specific exports

```typescript
// Components
import { Button, buttonVariants } from '@weconnect/ui/components';

// Utilities
import { cn } from '@weconnect/ui/utils';

// Library utilities
import { cn } from '@weconnect/ui/lib/utils';
```

## Adding New Components

1. Create component in `src/components/[component-name].tsx`
2. Export from `src/components/index.ts`
3. Use `cn()` utility for class merging
4. Use shadcn/ui pattern for consistency

### Example Component

```typescript
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export { Card };
```

## Styling

All components use Tailwind CSS and follow the shadcn/ui styling conventions. Customize by:

1. Editing component source files directly
2. Using the `cn()` utility for dynamic classes
3. Extending with custom CSS classes

## Dependencies

- `@radix-ui/*`: Unstyled, accessible components
- `class-variance-authority`: Type-safe variant utilities
- `clsx`: Dynamic class concatenation
- `tailwind-merge`: Intelligent Tailwind class merging
