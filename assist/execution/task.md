# Task

Active reference: `#78`

## Active

- [x] `#78` Fix container update Compose execution
  - [x] Phase 1: reproduce and scope
    - [x] 1.1 Reproduce system update preflight failure inside the app container.
    - [x] 1.2 Confirm Docker is installed but Compose is unavailable in the runner image.
  - [x] Phase 2: implementation
    - [x] 2.1 Install Docker Compose in the app container image.
    - [x] 2.2 Make setup and system update scripts resolve Compose consistently.
    - [x] 2.3 Bump workspace version and changelog to `1.0.78`.
  - [x] Phase 3: local Docker E2E
    - [x] 3.1 Rebuild the local app image.
    - [x] 3.2 Restart the local app container.
    - [x] 3.3 Validate setup/status and system update preflight/build through the container.
