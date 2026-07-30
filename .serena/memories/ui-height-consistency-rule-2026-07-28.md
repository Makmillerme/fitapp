## Global UI size rule (from user)

Date: 2026-07-28

Requirement:
- All text/search input fields across the app must have the same height.
- Exclusion: the input in AI tab can differ.
- All buttons across the app must have identical height.
- Button height must match input height.

Interpretation for implementation:
- Treat this as a global design-system constraint.
- Prefer enforcing via shared UI primitives (`Button`, input components) and variants/tokens, not per-screen ad hoc classes.
- Keep mobile/desktop behavior consistent unless explicitly approved by user.