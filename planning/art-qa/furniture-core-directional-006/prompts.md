# Furniture Core Directional 006 — Source Prompts

Generator: OpenAI built-in image generation. Legacy sprites were identity and material references only; accepted furniture batches 002/003 defined camera, finish, scale, and directional presentation. Every accepted source uses a flat `#FF00FF` chroma field and was processed with the official image-generation chroma-removal helper.

## Shared production contract

Create the same rigid object in a 2×2 north/east/south/west atlas (top-left/top-right/bottom-left/bottom-right). Use a fixed elevated orthographic semi-isometric camera approximately 35 degrees downward, identical scale and lighting, generous padding, and no perspective convergence. Preserve component counts, physical side assignments, operational-front/rear state, and asymmetric ordering under every quarter turn. No clipping, people, text, symbols, logos, watermarks, room, floor, cast shadow, borders, grid lines, labels, or unrelated props.

## `local-art` — Local Print Set

One rigid 2×1 wall-mounted heritage triptych with exactly three adjacent dark-walnut frames and aged-brass corner brackets. Fixed true-left-to-right front art: terracotta botanical still life, ochre village architecture, navy-and-rust peacock; no writing. North/east show the illustrated fronts. South/west show exactly three plain dark-wood rear panels with one small brass keyhole hanger each. The first generated atlas passed source review.

## `furniture-oak-two-top` — Oak Two-Top

One 2×2 dining set with exactly one round pale radial-grain oak tabletop, one centered matte-black trumpet pedestal and round foot, and exactly two identical navy upholstered curved-back chairs in slim blackened-ash frames directly opposite one another. Preserve the same chair axis and spacing through every quarter turn. North/south must share one projected diagonal ground axis as 180-degree counterparts, while east/west share the other; no cell may place the chair centers screen-horizontal or vertical. No place settings or extra props.

The first atlas was rejected because north/south used a screen-horizontal chair axis. A fresh second atlas put every view on a diagonal but repeated one ground axis in three cells. A targeted third result fixed east/west but regressed north/south to horizontal. The accepted fourth result uses a checkerboard of the two isometric ground axes—north/south rising and east/west falling—with exactly two chairs in every cell.

## `furniture-walnut-four-top` — Walnut Four-Top

One 3×3 dining set with exactly one thick square American-walnut tabletop with rounded bullnose edges, exactly one flush centered square brushed-brass inset, one centered dark pedestal base, and exactly four identical deep-teal upholstered curved-back walnut-frame chairs, one centered on each side. The first atlas was rejected because north drifted toward direct overhead. A targeted correction fixed the camera but introduced a fifth chair and was rejected. A second correction restored four chairs but regressed north to near-overhead and was rejected. The accepted targeted correction rotates the north set onto the isometric screen axes while preserving exactly four chairs and the elevated camera.
