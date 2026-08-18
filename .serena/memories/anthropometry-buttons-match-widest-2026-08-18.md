# Anthropometry zone column shrink-wrap (2026-08-18)

Right-side zone buttons are not a fixed `w-28`. Column is `w-max items-stretch`: width = the widest visible label (e.g. «Передпліччя»), shorter labels stretch to that width. Skeleton stays `flex-1 min-w-0` and does not shrink to a reserved empty column.
Buttons: `w-auto min-w-full` so they share the column width. Labels stay nowrap (Button default).
