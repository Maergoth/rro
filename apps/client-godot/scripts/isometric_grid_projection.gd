class_name IsometricGridProjection
extends RefCounted

## Pure projection helpers for the restaurant's elevated orthographic-isometric view.
##
## The design grid uses a 64x32 pixel (2:1) ground diamond. World +X (east)
## projects down-right by (32, 16), and world +Y (south) projects down-left by
## (-32, 16). Screen-up therefore points world northwest. This horizon-free,
## perspective-free basis is the same elevated camera family required by the
## directional furniture and modular-character art contracts. Passing the
## current zoomed cell width preserves that basis at any display scale.

const DESIGN_CELL_PIXELS := 64.0
const HALF_HEIGHT_RATIO := 0.25
const MIN_CELL_PIXELS := 0.001
const INVALID_CELL := Vector2i(-1, -1)

static func basis_x(cell_pixels: float = DESIGN_CELL_PIXELS) -> Vector2:
	var safe_pixels := maxf(cell_pixels, MIN_CELL_PIXELS)
	return Vector2(safe_pixels * 0.5, safe_pixels * HALF_HEIGHT_RATIO)

static func basis_y(cell_pixels: float = DESIGN_CELL_PIXELS) -> Vector2:
	var safe_pixels := maxf(cell_pixels, MIN_CELL_PIXELS)
	return Vector2(-safe_pixels * 0.5, safe_pixels * HALF_HEIGHT_RATIO)

static func grid_to_screen(point: Vector2, screen_origin: Vector2 = Vector2.ZERO, cell_pixels: float = DESIGN_CELL_PIXELS) -> Vector2:
	return screen_origin + basis_x(cell_pixels) * point.x + basis_y(cell_pixels) * point.y

static func screen_to_grid_fractional(point: Vector2, screen_origin: Vector2 = Vector2.ZERO, cell_pixels: float = DESIGN_CELL_PIXELS) -> Vector2:
	var safe_pixels := maxf(cell_pixels, MIN_CELL_PIXELS)
	var local := point - screen_origin
	return Vector2(
		local.x / safe_pixels + local.y / (safe_pixels * 0.5),
		-local.x / safe_pixels + local.y / (safe_pixels * 0.5)
	)

## Uses half-open logical cells: west/north edges are included, east/south edges
## belong to their adjacent cells. This makes picks deterministic on boundaries.
static func screen_to_cell(point: Vector2, screen_origin: Vector2 = Vector2.ZERO, cell_pixels: float = DESIGN_CELL_PIXELS) -> Vector2i:
	var fractional := screen_to_grid_fractional(point, screen_origin, cell_pixels)
	return Vector2i(floori(fractional.x), floori(fractional.y))

static func screen_to_cell_in_bounds(point: Vector2, grid_size: Vector2i, screen_origin: Vector2 = Vector2.ZERO, cell_pixels: float = DESIGN_CELL_PIXELS) -> Vector2i:
	var cell := screen_to_cell(point, screen_origin, cell_pixels)
	if cell.x < 0 or cell.y < 0 or cell.x >= grid_size.x or cell.y >= grid_size.y:
		return INVALID_CELL
	return cell

## Returns corners in clockwise screen order: north, east, south, west.
static func footprint_corners(footprint: Rect2, screen_origin: Vector2 = Vector2.ZERO, cell_pixels: float = DESIGN_CELL_PIXELS) -> PackedVector2Array:
	if footprint.size.x <= 0.0 or footprint.size.y <= 0.0:
		return PackedVector2Array()
	var north := grid_to_screen(footprint.position, screen_origin, cell_pixels)
	var east := grid_to_screen(footprint.position + Vector2(footprint.size.x, 0.0), screen_origin, cell_pixels)
	var south := grid_to_screen(footprint.end, screen_origin, cell_pixels)
	var west := grid_to_screen(footprint.position + Vector2(0.0, footprint.size.y), screen_origin, cell_pixels)
	return PackedVector2Array([north, east, south, west])

static func cell_polygon(cell: Vector2i, screen_origin: Vector2 = Vector2.ZERO, cell_pixels: float = DESIGN_CELL_PIXELS) -> PackedVector2Array:
	return footprint_corners(Rect2(Vector2(cell), Vector2.ONE), screen_origin, cell_pixels)

## The accepted 627px furniture sheets use a common source pivot at (313.5,
## 590): horizontally centered on the lowest opaque floor-contact row. Its
## screen target is the footprint's south/front corner, the point with greatest
## projected ground depth. The art binding can place its source pivot here
## without rotating or stretching the directional texture.
static func floor_contact_target(footprint: Rect2, screen_origin: Vector2 = Vector2.ZERO, cell_pixels: float = DESIGN_CELL_PIXELS) -> Vector2:
	return grid_to_screen(footprint.end, screen_origin, cell_pixels)

## Depth is ordered by projected ground Y, then projected ground X, then a
## stable instance ID. Keeping grid-space sums/differences avoids zoom-dependent
## floating-point changes while matching the screen projection exactly.
static func depth_key(footprint: Rect2, stable_id: String) -> Dictionary:
	var contact_grid := footprint.end
	return {
		"groundDepth": contact_grid.x + contact_grid.y,
		"screenLateral": contact_grid.x - contact_grid.y,
		"stableId": stable_id,
	}

static func depth_key_draws_before(left: Dictionary, right: Dictionary) -> bool:
	var left_depth := float(left.get("groundDepth", 0.0))
	var right_depth := float(right.get("groundDepth", 0.0))
	if not is_equal_approx(left_depth, right_depth):
		return left_depth < right_depth
	var left_lateral := float(left.get("screenLateral", 0.0))
	var right_lateral := float(right.get("screenLateral", 0.0))
	if not is_equal_approx(left_lateral, right_lateral):
		return left_lateral < right_lateral
	return str(left.get("stableId", "")) < str(right.get("stableId", ""))
