## User clarification: Telegram photo-as-background (2026-07-30)

Desired model (confirmed):
- Photo morphs/expands and becomes **background** under existing chrome
- Same DOM for name+status and action buttons (no dual overlay fade)
- Name morphs to left + light-on-photo style; buttons morph style the same way
- Info card only moves because hero track grows — no chrome height-collapse snap

Current code already matches (`chromeTop = 96+12` fixed, photo absolute z-0, chrome z-20). User may still see old Cursor DOM paths from prior height-collapse experiment — hard refresh.
