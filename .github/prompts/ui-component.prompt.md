# UI Component Prompt

Generate a reusable UI primitive component in `src/ui/`:

- Component name: `<Name>` (capitalized)  
- Props: `intent` ("primary" | "secondary" | "ghost"), `size` ("sm" | "md" | "lg"), optional `disabled`, `loading`, `testID`.  
- Should import colors/spacings from `src/lib/theme.ts`.  
- Use functional React component in TS.  
- No logic or API calls. Minimal styles.  
- Export in `src/ui/index.ts`.  

Also include a small usage example comment inside the generated file.
