# Code Generation Constraints

- Generate no business feature unless the prompt explicitly names it.
- Never add placeholder business entities such as User, Product, Order, Cart, Payment, Role, or Account to the foundation.
- Prefer examples that are architectural and behavior-free.
- Keep generated files small and cohesive.
- Add tests for reusable primitives and boundary enforcement when behavior is introduced.
- Update assist docs when a new convention becomes durable.
