# JobTrail DnD + Upload Accessibility Notes

## Accessible drag-and-drop interface (move-button model)
- Pipeline columns are separated into labeled regions (`Saved`, `Applied`, `Interview`) so screen-reader navigation has clear landmarks.
- Each job card has an explicit text identity (`Title` + `Company`) used in control labels.
- Movement is implemented with native buttons (`Move up/down`, `Move to previous/next column`) instead of pointer-only drag APIs.
- Invalid operations are disabled (top card cannot move up, first column cannot move previous, last column cannot move next).
- Every successful move writes to a polite live region (`role="status"`, `aria-live="polite"`).

## Accessible file upload with progress
- File input has an explicit label (`Resume file`) and clear accepted formats.
- Upload action stays disabled until a file is selected.
- Progress is expressed with semantic progressbar attributes (`aria-valuemin`, `aria-valuemax`, `aria-valuenow`) and visible percentage text.
- Upload lifecycle messages are announced via a polite live region (selected, uploading, completion).
- Completion state is visible and text-based (`Upload complete. Ready for submission.`).

## Practical quality checks
- Keyboard-only: tab through every move button and execute same-column + cross-column moves.
- Screen-reader: verify move announcements and upload announcements are read after each action.
- Data integrity: moved card keeps identity and appears in expected position/column.
- Upload behavior: selecting new file resets progress to `0%`, upload reaches `100%`, then returns to idle-ready state.
