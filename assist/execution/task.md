# Task

Active reference: `#128`

## Active

- [x] `#110` Widen Sales invoice print and print QR
  - [x] Phase 1: update print sizing and QR rendering
    - [x] Make the printable invoice a little wider and centered.
    - [x] Render the QR as printable vector shapes instead of background cells.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.

- [x] `#111` Fix Sales invoice print horizontal centering
  - [x] Phase 1: update print centering box
    - [x] Remove fixed A4 body width from print styles.
    - [x] Center the invoice inside the actual printable page area.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.

- [x] `#112` Expand Sales invoice item test rows
  - [x] Phase 1: update item rows
    - [x] Remove PO sample data from rendered item rows.
    - [x] Add 12 single-line dummy rows for PO, DC, and particulars layout testing.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.

- [x] `#113` Stress-test Sales invoice item columns
  - [x] Phase 1: update dummy item row data
    - [x] Add 6 more dummy item rows.
    - [x] Fill every item column with wide test values.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.

- [x] `#114` Update Sales invoice dummy particulars
  - [x] Phase 1: update dummy particulars layout
    - [x] Alternate the two requested particulars descriptions.
    - [x] Left-align dummy particulars cells.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.

- [x] `#115` Adjust Sales invoice dummy item count
  - [x] Phase 1: update print item rows
    - [x] Hide the real first item row from the layout stress view.
    - [x] Reduce dummy item rows to 15.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.

- [x] `#116` Reduce Sales invoice dummy rows
  - [x] Phase 1: update item row count
    - [x] Reduce dummy item rows from 15 to 13.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.

- [x] `#117` Tighten Sales invoice item rows
  - [x] Phase 1: update item row height
    - [x] Reduce item row height slightly.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.

- [x] `#118` Rebuild Sales invoice dummy rows
  - [x] Phase 1: update item stress data
    - [x] Replace current item stress data with 24 generated dummy rows.
    - [x] Use 1 to 3 line particulars per row.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.

- [x] `#119` Fix Sales dummy item initialization
  - [x] Phase 1: fix runtime error
    - [x] Move dummy source arrays before generated dummy rows.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.

- [x] `#120` Fit Sales dummy rows to 24 lines
  - [x] Phase 1: update dummy row count
    - [x] Reduce generated dummy rows to 12 so 1/2/3 line particulars total 24 lines.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.

- [x] `#121` Add one 3-line Sales dummy row
  - [x] Phase 1: update dummy row pattern
    - [x] Add one more generated dummy row with 3 particulars lines.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.

- [x] `#122` Normalize Sales item table font size
  - [x] Phase 1: update item table font sizes
    - [x] Make header, item rows, and total row use the same font size.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.

- [x] `#123` Clamp Sales item particulars lines
  - [x] Phase 1: update particulars overflow
    - [x] Limit Particulars text to 3 lines with ellipsis.
    - [x] Prevent rows from growing beyond the 3-line cap.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.

- [x] `#124` Improve Sales item table header
  - [x] Phase 1: update item header styling
    - [x] Vertically center header labels.
    - [x] Add a double border below the header row.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.

- [x] `#125` Slightly narrow Sales invoice print width
  - [x] Phase 1: update print width
    - [x] Reduce invoice print width slightly and keep it centered.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.

- [x] `#126` Set Sales invoice print width to 198mm
  - [x] Phase 1: update print width
    - [x] Reduce invoice print width to 198mm and keep it centered.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.

- [x] `#127` Align Sales invoice IRN divider
  - [x] Phase 1: update invoice band split
    - [x] Align IRN divider with Ship To left border.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.

- [x] `#128` Center Sales invoice print body
  - [x] Phase 1: update print centering
    - [x] Make print body center the invoice wrapper.
  - [x] Phase 2: validation
    - [x] Run formatter and frontend typecheck or document any gap.
