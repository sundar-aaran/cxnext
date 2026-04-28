# Modular Monolith Guidelines

- The backend is one deployable NestJS service.
- Internal bounded contexts must be isolated.
- Module dependencies must be explicit and registered.
- Prefer events for cross-module reactions.
- Prefer application ports for direct queries or commands across boundaries.
- Avoid shared mutable state.
- Keep package code domain-neutral.
- A module should be removable without rewriting unrelated modules.
