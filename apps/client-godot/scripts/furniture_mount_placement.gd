class_name FurnitureMountPlacement
extends RefCounted

## Pure client-side geometry for the server-authoritative furniture mount contract.
##
## A placed object's x/y is always the minimum grid cell in its occupied span.
## Floor and ceiling objects use their rotation-adjusted rectangular footprint.
## A wall object's declared width is instead a span along the supporting edge;
## rotation chooses that room-side edge exactly as the server does.

const WALL_EDGE_BY_ROTATION := {
	0: "north",
	90: "east",
	180: "south",
	270: "west",
}

const WALL_ROTATION_BY_EDGE := {
	"north": 0,
	"east": 90,
	"south": 180,
	"west": 270,
}

static func canonical_rotation(rotation_degrees: int) -> int:
	var normalized := rotation_degrees % 360
	if normalized < 0:
		normalized += 360
	return normalized if WALL_EDGE_BY_ROTATION.has(normalized) else 0

static func mount_for(definition: Dictionary) -> String:
	var placement: Dictionary = definition.get("placement", {})
	return str(placement.get("mount", "floor"))

static func wall_edge_for_rotation(rotation_degrees: int) -> String:
	return str(WALL_EDGE_BY_ROTATION.get(canonical_rotation(rotation_degrees), "north"))

static func rotation_for_wall_edge(edge: String) -> int:
	return int(WALL_ROTATION_BY_EDGE.get(edge, 0))

static func footprint_size(definition: Dictionary, rotation_degrees: int) -> Vector2i:
	var width := maxi(1, int(definition.get("width", 1)))
	var height := maxi(1, int(definition.get("height", 1)))
	var rotation := canonical_rotation(rotation_degrees)
	if mount_for(definition) == "wall":
		var edge := wall_edge_for_rotation(rotation)
		return Vector2i(width, 1) if edge in ["north", "south"] else Vector2i(1, width)
	if rotation in [90, 270]:
		return Vector2i(height, width)
	return Vector2i(width, height)

static func footprint(object: Dictionary, definition: Dictionary) -> Rect2:
	var footprint_size_value := footprint_size(definition, int(object.get("rotation", 0)))
	return Rect2(
		Vector2(float(object.get("x", 0)), float(object.get("y", 0))),
		Vector2(footprint_size_value),
	)

static func footprint_cells(object: Dictionary, definition: Dictionary) -> Array[Vector2i]:
	var cells: Array[Vector2i] = []
	var size_value := footprint_size(definition, int(object.get("rotation", 0)))
	var anchor := Vector2i(int(object.get("x", 0)), int(object.get("y", 0)))
	for y_offset in range(size_value.y):
		for x_offset in range(size_value.x):
			cells.append(anchor + Vector2i(x_offset, y_offset))
	return cells

## Centers odd-width wall objects on the picked edge cell. For an even width,
## the picked cell is the first of the middle pair, which preserves the legacy
## click-as-anchor behavior for the current two-wide wall art. The returned
## anchor is clamped so the complete server footprint remains in bounds.
static func wall_anchor_for_cell(cell: Vector2i, edge: String, span: int, grid_size: Vector2i) -> Vector2i:
	var safe_span := maxi(1, span)
	var before_center := floori(float(safe_span - 1) / 2.0)
	var anchor := cell
	if edge in ["north", "south"]:
		anchor.x = clampi(cell.x - before_center, 0, maxi(0, grid_size.x - safe_span))
	else:
		anchor.y = clampi(cell.y - before_center, 0, maxi(0, grid_size.y - safe_span))
	return anchor

static func wall_placement_for_cell(cell: Vector2i, edge: String, definition: Dictionary, grid_size: Vector2i) -> Dictionary:
	var canonical_edge := edge if WALL_ROTATION_BY_EDGE.has(edge) else "north"
	var anchor := wall_anchor_for_cell(cell, canonical_edge, int(definition.get("width", 1)), grid_size)
	return {
		"x": anchor.x,
		"y": anchor.y,
		"rotation": rotation_for_wall_edge(canonical_edge),
		"edge": canonical_edge,
	}

## Returns the supporting wall edge in grid coordinates, ordered from its
## minimum coordinate to its maximum. This is used for previews, picking, art
## anchoring, and depth without changing the persisted x/y/rotation payload.
static func wall_edge_segment(object: Dictionary, definition: Dictionary) -> PackedVector2Array:
	var x := float(object.get("x", 0))
	var y := float(object.get("y", 0))
	var span := float(maxi(1, int(definition.get("width", 1))))
	match wall_edge_for_rotation(int(object.get("rotation", 0))):
		"north":
			return PackedVector2Array([Vector2(x, y), Vector2(x + span, y)])
		"east":
			return PackedVector2Array([Vector2(x + 1.0, y), Vector2(x + 1.0, y + span)])
		"south":
			return PackedVector2Array([Vector2(x, y + 1.0), Vector2(x + span, y + 1.0)])
		"west":
			return PackedVector2Array([Vector2(x, y), Vector2(x, y + span)])
	return PackedVector2Array()

static func mount_anchor_grid(object: Dictionary, definition: Dictionary) -> Vector2:
	var mount := mount_for(definition)
	var footprint_value := footprint(object, definition)
	if mount == "wall":
		var segment := wall_edge_segment(object, definition)
		if segment.size() == 2:
			return segment[0].lerp(segment[1], 0.5)
	if mount == "ceiling":
		return footprint_value.get_center()
	return footprint_value.end

## Points from a supporting wall edge into the persisted object's room-side
## cell. This is visual geometry only; server-authoritative x/y/rotation and
## support validation remain unchanged.
static func wall_room_normal_grid(rotation_degrees: int) -> Vector2:
	match wall_edge_for_rotation(rotation_degrees):
		"north":
			return Vector2(0.0, 1.0)
		"east":
			return Vector2(-1.0, 0.0)
		"south":
			return Vector2(0.0, -1.0)
		"west":
			return Vector2(1.0, 0.0)
	return Vector2.ZERO

static func wall_room_anchor_grid(object: Dictionary, definition: Dictionary, inset_cells: float) -> Vector2:
	return mount_anchor_grid(object, definition) + wall_room_normal_grid(int(object.get("rotation", 0))) * maxf(0.0, inset_cells)

## A wall sprite sorts at the frontmost endpoint of its complete support span,
## after every individual wall panel in that span. Other mounts keep the
## established footprint-derived depth anchor.
static func mount_depth_anchor_grid(object: Dictionary, definition: Dictionary) -> Vector2:
	if mount_for(definition) == "wall":
		var segment := wall_edge_segment(object, definition)
		if segment.size() == 2:
			var first_depth := segment[0].x + segment[0].y
			var second_depth := segment[1].x + segment[1].y
			return segment[1] if second_depth >= first_depth else segment[0]
	return mount_anchor_grid(object, definition)
