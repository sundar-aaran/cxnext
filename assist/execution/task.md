# Task

Active reference: `#27`

## Active

- [x] `#27` Fix helper documentation paths
  - [x] Phase 1: inspect GitHub helper changelog path usage
  - [x] Phase 2: update CLI and rules to moved documentation paths
  - [x] Phase 3: validate helper parsing

- [x] `#26` Add sidebar team switcher
  - [x] Phase 1: inspect sidebar header and dropdown primitives
  - [x] Phase 2: add current team trigger and teams dropdown
  - [x] Phase 3: bump workspace version and validate

- [x] `#25` Add collapsed sidebar tooltips
  - [x] Phase 1: inspect tooltip primitive and sidebar collapsed render path
  - [x] Phase 2: wire tooltip provider and collapsed side menu item tooltips
  - [x] Phase 3: bump workspace version and validate

- [x] `#24` Apply theme orientation to full page
  - [x] Phase 1: inspect hardcoded shell/page colors
  - [x] Phase 2: replace hardcoded page surfaces with theme-aware tokens
  - [x] Phase 3: bump workspace version and validate

- [x] `#23` Smooth mobile menu and pointer controls
  - [x] Phase 1: inspect shell controls and sheet animation
  - [x] Phase 2: add smooth mobile/desktop motion and pointer cursors
  - [x] Phase 3: bump workspace version and validate

- [x] `#22` Fix theme accents and real sidebar version
  - [x] Phase 1: inspect package version and temp accent tokens
  - [x] Phase 2: wire real version and theme accent variables
  - [x] Phase 3: bump workspace version and validate

- [x] `#21` Polish sidebar logo and header buttons
  - [x] Phase 1: inspect shell logo, buttons, and badge classes
  - [x] Phase 2: update visual treatment
  - [x] Phase 3: validate UI and frontend

- [x] `#20` Smooth sidebar expand and collapse animation
  - [x] Phase 1: inspect current desktop sidebar states
  - [x] Phase 2: add smooth width and content transitions
  - [x] Phase 3: validate UI and frontend

- [x] `#19` Reinstall side menu with shadcn sidebar drawer behavior
  - [x] Phase 1: fetch and inspect shadcn sidebar-07
  - [x] Phase 2: remove mobile side rail and add left drawer menu
  - [x] Phase 3: validate UI and frontend

- [x] `#18` Make Application Desk responsive across breakpoints
  - [x] Phase 1: inspect current desk and shell breakpoints
  - [x] Phase 2: implement responsive side rail, header, and desk content
  - [x] Phase 3: validate UI and frontend

- [x] `#17` Match temp 90 percent workspace width
  - [x] Phase 1: read temp workspace width references
  - [x] Phase 2: set desk workspace to 90 percent with 5 percent side gutters
  - [x] Phase 3: validate shell and frontend

- [x] `#16` Standardize Application Desk width and slim scrollbars
  - [x] Phase 1: inspect current desk width and scroll containers
  - [x] Phase 2: set desk content to 9/12 standard width and slim scrollbars
  - [x] Phase 3: validate shell and frontend

- [x] `#15` Match temp theme selector
  - [x] Phase 1: read temp theme toggle reference
  - [x] Phase 2: implement exact appearance and accent dropdown
  - [x] Phase 3: validate shell

- [x] `#14` Match Application Desk header dropdowns and fixed side rail
  - [x] Phase 1: inspect temp desk UI references
    - [x] 1.1 read temp dashboard shell navigation files
    - [x] 1.2 compare current shared shell implementation
  - [x] Phase 2: implement shell interactions
    - [x] 2.1 add exact app switch dropdown
    - [x] 2.2 add notification, home, theme, and user menus
    - [x] 2.3 make side menu fixed with scrollable inner workspace area
  - [x] Phase 3: validation
    - [x] 3.1 run focused UI and frontend validation
    - [x] 3.2 verify `/desk` still responds

- [x] `#13` Add Application Desk sidebar collapse toggle
  - [x] Phase 1: inspect current shell
    - [x] 1.1 inspect shared dashboard shell structure
    - [x] 1.2 confirm header menu button is the intended toggle
  - [x] Phase 2: implement sidebar collapse
    - [x] 2.1 add local collapsed state to the dashboard shell
    - [x] 2.2 collapse sidebar labels/footer while keeping icon navigation visible
    - [x] 2.3 expand main content when collapsed
  - [x] Phase 3: validation
    - [x] 3.1 run focused UI and frontend validation
    - [x] 3.2 verify `/desk` still responds
