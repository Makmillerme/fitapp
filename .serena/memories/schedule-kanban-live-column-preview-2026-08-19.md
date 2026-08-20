# Kanban live preview in target column (2026-08-19)

On dragOver the appointment is moved in local column state (same as shadcn kanban demo), so the ghost/placeholder appears in the hovered day list. Persist still only on dragEnd via `moveAppointmentToDay` if the day changed from `originDayRef`. Cancel restores from props.
