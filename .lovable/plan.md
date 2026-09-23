# UniSphere Login Redesign

## Goal
Rebuild only the login experience as a premium, responsive university LMS screen while preserving the repository’s current authentication contract, session handling, role data, tenant disambiguation, redirects, protected-route behavior, and backend endpoints.

## Existing behavior to preserve
- Submit `email`, `password`, and optional `tenantId` to `POST /api/v1/auth/login` through the existing API layer.
- Keep Zod and React Hook Form validation, Zustand loading state, structured server errors, token persistence, refresh rotation, and `/dashboard` or originally requested-route redirect.
- Keep the existing multi-institution `TENANT_REQUIRED` recovery flow and institution choices.
- Keep links to registration and password recovery because both are supported routes.
- Keep the current persistent-session behavior; the “Remember me” control will reflect that behavior without rewriting token/session storage.
- Make no backend, environment-variable, endpoint, database, JWT, role, or protected-route changes.

## Design
- Create a desktop split screen: an academic brand/story panel with a refined university visual on the left, and a focused sign-in area on the right.
- Collapse to a single-column mobile and tablet experience with compact branding above the form.
- Use a light neutral base, deep academic navy, crisp university blue, restrained teal accents, professional typography, subtle borders/shadows, and small motion with reduced-motion support.
- Keep “Welcome Back” and “Sign in to continue to your learning workspace.” as the primary hierarchy.
- Include accessible email and password fields, keyboard-operable password visibility, persistent-session checkbox, forgot-password link, optional institution field, clear validation/server alerts, and a loading sign-in button.
- Retain the existing developer demo autofill in a visually secondary disclosure so no current workflow disappears.

## Implementation
- Port the inspected login behavior into this project’s existing TanStack Start route structure rather than introducing a second router/runtime.
- Add focused reusable login presentation pieces and semantic design tokens; avoid changes outside the login experience.
- Add route-specific metadata for the login page.
- Use a locally generated academic visual asset rather than a remote image dependency.

## Verification
- Check the page at desktop, tablet, and mobile widths for overflow, overlap, hierarchy, focus visibility, and form usability.
- Verify client validation, password visibility, institution expansion/selection, loading state, registration/recovery navigation, and server error rendering.
- Verify the login request payload and success redirect remain compatible with the existing API contract.
- Check the preview for broken imports, runtime errors, and console errors.

## Technical notes
- Source repository: React 18 + Vite 5 + Tailwind 3, React Router, Zustand, Axios, React Hook Form, and Zod.
- Current Lovable runtime: TanStack Start + Tailwind 4. The authentication behavior will be preserved while using the host project’s supported routing/runtime conventions.
- No backend code from the cloned repository will be modified.
