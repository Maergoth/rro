# Furniture core directional batch 013 — fixed-camera correction

Corrected with OpenAI built-in image generation after the original 2×2 atlases failed camera-conformance review. The original sources mixed straight-on elevations with arbitrary three-quarter views, so they were rejected even though their identities and alpha mechanics had passed.

Each accepted direction was generated separately. The object rotates in exact 90° world steps while the camera remains fixed:

- elevated orthographic-isometric projection with no perspective convergence;
- camera azimuth 315° and elevation approximately 26.565°;
- projected ground-plane axes at screen slopes −0.5 and +0.5;
- screen-vertical world verticals;
- NORTH shows physical front + right, EAST right + rear, SOUTH rear + left, WEST left + front;
- flat saturated magenta chroma background, no floor, cast shadow, reflection, text, logo, watermark, crop, or extra prop.

## Owner's Operations Desk

Identity lock: one curved walnut 3×2 desk, one centered brass guest-front inlay, one laptop, two drawers only on physical right, one teal grommet only on physical left. NORTH/EAST/SOUTH/WEST were reviewed as front+right, rear+right, rear+left, front+left. One first EAST attempt was rejected because it repeated NORTH's front+right faces instead of completing a quarter turn.

## Live Operations Console

Identity lock: one charcoal-and-teal 3×2 console, exactly three blank physical-front screens and three amber lights, one grille only on physical right, exactly two rear service doors and one rear cable rail, plain physical left. The accepted loop exposes those faces in the required adjacent-face sequence; no cell is a straight-on elevation.

## Essential Cafe Two-Top

Identity lock: one light-oak 2×2 table, one charcoal pedestal, exactly two opposite teal-seat chairs, one napkin holder at physical front-left, and one hook under physical right. NORTH/SOUTH share one projected chair diagonal; EAST/WEST share the other. One first SOUTH correction was rejected because it used EAST/WEST's diagonal instead of NORTH/SOUTH's.

## Processing

The official image-generation chroma-key helper removed the magenta field. A deterministic processor downsampled each full 1254×1254 alpha source to a 627×627 evidence canvas, applied one shared proportional scale per identity, centered every runtime sprite on a 627×627 transparent canvas, and aligned the exclusive alpha baseline to y=590. Processing did not draw or replace source art. Both the 627px dark contact sheet and 128px light gameplay sheet were reviewed and accepted.
