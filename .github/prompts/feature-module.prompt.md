# Scaffold a feature module

Create `src/features/<feature>/` with:
- `components/` — feature-specific presentational components
- `hooks/`      — e.g., `use<Feature>Form`, `use<Feature>Query`
- `services/`   — data access; export typed functions (mock initially)
- `types.ts`    — shared types for this feature
- `index.ts`    — barrels (optional)

Also:
- Add one screen under `app/(tabs)/<feature>/index.tsx` using the new hooks and `src/ui` primitives.
- Keep business logic in hooks/services; screens remain thin.
- Include TODO comments where real API will plug in later.
