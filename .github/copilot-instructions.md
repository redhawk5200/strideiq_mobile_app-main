# Copilot Instructions (React Native • Expo • iOS)

Use this repository with TypeScript + Expo Router + React Native.

## Folder Structure & Styles
- `/app` — route files. Each `_layout.tsx` must `export default` a component. Use route groups like `(tabs)/` etc.
- `/src/ui` — reusable UI primitives (components like Button, Text, Input, Card). Variants via props (`intent`, `size`, `disabled`, `loading`).
- `/src/features` — feature modules: screens + hooks + services. 
- `/src/lib` — shared utilities (theme, api, storage, constants).
- `/src/hooks` — app-wide custom hooks.
- `/src/assets` — images, fonts, icons.
- `/src/types` — shared TS types.

## Guidelines
- UI primitives must not have business logic or fetch/data layer.  
- Use theme tokens from `src/lib/theme.ts` for colors/spacing.  
- Use ESLint + Prettier; keep styles consistent.  
- Tests / testIDs / accessibility should be included for core components.

## Common Tasks for Copilot
- Scaffold new component with correct placement (e.g. `src/ui/button/Button.tsx`).  
- Generate route files inside `app/(tabs)/…`.  
- Create feature hooks + mock services in `src/features/<feat>`.  
- Always ensure default exports in `_layout.tsx`.
