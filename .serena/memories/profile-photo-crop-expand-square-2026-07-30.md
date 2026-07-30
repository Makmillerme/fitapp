Profile photo UX update:
1) Upload now opens square crop dialog with circular mask (react-easy-crop). Saved file is always square JPEG, then client compress + sharp pipeline.
2) Viewer no longer uses black fullscreen lightbox. Avatar morphs (circle→square) into full-width square hero at top of app shell with light backdrop, swipe carousel, name overlay, kebab Make primary/Delete, reverse morph on close.
Files: profile-photo-crop-dialog.tsx, crop-image.ts, rewritten profile-photo-viewer.tsx, profile-view wiring.