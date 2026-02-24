# AI Coding Rules

## Tech Stack
- **Framework**: React 19 (Vite-based)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: lucide-react
- **Routing**: React Router 7
- **State Management**: React Hooks (useState, useReducer, useContext)
- **Form Handling**: react-hook-form + zod for validation

## Library Usage Rules
- **UI Components**: Always check for existing components in `src/components/ui` before creating new ones. Use `shadcn/ui` patterns for consistency.
- **Icons**: Use `lucide-react` for all iconography.
- **Layout**: Use Tailwind CSS utility classes for all positioning, spacing, and responsiveness. Avoid custom CSS files unless absolutely necessary.
- **Navigation**: Use `react-router-dom` for all navigation and routing logic.
- **Data Validation**: Use `zod` for defining schemas and validating inputs or API responses.
- **Components**: Prefer functional components with hooks. Keep components small, focused, and stored in `src/components/`.
- **Pages**: Store top-level route components in `src/pages/`.
- **Global State**: Use React Context for global state that doesn't change frequently (e.g., user auth, theme).
