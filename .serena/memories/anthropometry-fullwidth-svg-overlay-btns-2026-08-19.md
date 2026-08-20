# Anthropometry: full-width SVG + overlay buttons (2026-08-19)

- Figure SVG is again `w-full` with viewBox `760×1088`. Height ruler and weight pill are the original SVG chrome (T-caps, 132×96 badge font 48/22, weight 320×80 rx40 font 36) — not HTML siblings.
- Zone buttons overlay `absolute right` (`w-14`), so they do not steal flex width. «Передпліччя» → «Передпл.» (`title` keeps full name). `stopPropagation` on the column so taps do not hit-test the figure.
