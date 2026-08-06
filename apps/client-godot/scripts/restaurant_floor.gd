class_name RestaurantFloor
extends Control

signal build_action_requested(action: String, payload: Dictionary)
signal movement_input(direction: Vector2)
signal object_selected(object_data: Dictionary)

var snapshot: Dictionary = {}
var content: Dictionary = {}
var layout: Dictionary = {}
var build_mode := false
var build_tool := "select"
var selected_catalog_id := ""
var build_rotation := 0
var cell_pixels := 64.0
var camera_offset := Vector2(440, 55)
var panning := false
var pan_origin := Vector2.ZERO
var camera_origin := Vector2.ZERO
var painting := false
var paint_cells: Dictionary = {}
var dragging_object: Dictionary = {}
var drag_preview_placement: Dictionary = {}
var hover_cell := Vector2i(-1, -1)
var hover_screen_position := Vector2.ZERO
var movement_send_cooldown := 0.0
var last_sent_direction := Vector2.ZERO
var texture_cache: Dictionary = {}

const FLOOR_COLORS := {
	"sealed-concrete": Color("586367"), "quarry-tile": Color("805f4b"), "white-hex": Color("d9d6ca"),
	"slate-tile": Color("424d54"), "oak-plank": Color("8f6c48"), "walnut-plank": Color("5d4030"),
	"terrazzo": Color("b7a78d"), "pattern-cement": Color("6d8191"), "commercial-vinyl": Color("8c907f"),
	"rubber-kitchen": Color("27373c"), "entry-mat": Color("33383a"), "outdoor-paver": Color("85796a")
}

const CATEGORY_COLORS := {
	"Dining": Color("b98551"), "Service": Color("4b8c83"), "Kitchen": Color("bd5548"),
	"Utility": Color("52758f"), "Decor": Color("6e9364"), "Storage": Color("80705d"), "Office": Color("776487")
}

# Visual elevation is deliberately client-only. Persisted x/y/rotation keep
# the exact server contract while art is raised from its wall edge or ceiling
# cell anchor in the elevated orthographic-isometric view. These solid-color
# structural planes do not claim the pending construction texture art.
const WALL_PLANE_HEIGHT_CELLS := 1.75
const WALL_ART_ELEVATION_CELLS := 0.85
const WALL_ART_ROOM_INSET_CELLS := 0.14
const CEILING_ART_ELEVATION_CELLS := 2.15
const CEILING_WORLD_DRAW_LAYER := 1

const WALL_PLANE_COLORS := {
	"north": Color("d6cfbd"),
	"east": Color("bbb39f"),
	"south": Color("aca38f"),
	"west": Color("c7bfac"),
}

func _ready() -> void:
	clip_contents = true
	mouse_filter = Control.MOUSE_FILTER_STOP
	set_process(true)
	queue_redraw()

func set_content(value: Dictionary) -> void:
	content = value
	queue_redraw()

func set_snapshot(value: Dictionary) -> void:
	snapshot = value
	layout = value.get("layout", {})
	queue_redraw()

func set_layout(value: Dictionary) -> void:
	layout = value
	queue_redraw()

func set_staged_layout(authoritative: Dictionary, operations: Array) -> void:
	layout = authoritative.duplicate(true)
	for operation in operations:
		if operation is Dictionary:
			apply_staged_operation(operation)
	queue_redraw()

func staged_wall_key(x: int, y: int, edge: String) -> String:
	match edge:
		"north": return "h:%d:%d" % [x, y]
		"south": return "h:%d:%d" % [x, y + 1]
		"west": return "v:%d:%d" % [x, y]
		"east": return "v:%d:%d" % [x + 1, y]
	return "invalid:%d:%d:%s" % [x, y, edge]

func apply_staged_operation(operation: Dictionary) -> void:
	match str(operation.get("type", "")):
		"floor":
			var selected_cells := {}
			for cell in operation.get("cells", []): selected_cells["%d:%d" % [int(cell.get("x", -1)), int(cell.get("y", -1))]] = true
			var cells: Array = layout.get("cells", [])
			for cell in cells:
				if selected_cells.has("%d:%d" % [int(cell.get("x", -1)), int(cell.get("y", -1))]):
					cell["surfaceId"] = str(operation.get("surfaceId", cell.get("surfaceId", "")))
					if operation.has("roomTag"): cell["roomTag"] = str(operation.get("roomTag", ""))
			layout["cells"] = cells
		"wall":
			var walls: Array = layout.get("walls", [])
			var target_key := staged_wall_key(int(operation.get("x", -1)), int(operation.get("y", -1)), str(operation.get("edge", "")))
			var replaced := false
			for wall in walls:
				if staged_wall_key(int(wall.get("x", -1)), int(wall.get("y", -1)), str(wall.get("edge", ""))) == target_key:
					wall.merge(operation, true); replaced = true; break
			if not replaced:
				var staged_wall := operation.duplicate(true); staged_wall["id"] = "staged-wall-%s" % target_key; walls.append(staged_wall)
			layout["walls"] = walls
		"place":
			var objects: Array = layout.get("objects", [])
			objects.append({"id": str(operation.get("clientId", "staged-object")), "definitionId": str(operation.get("definitionId", "")), "x": int(operation.get("x", 0)), "y": int(operation.get("y", 0)), "rotation": int(operation.get("rotation", 0)), "state": "staged", "wear": 0})
			layout["objects"] = objects
		"move":
			var objects: Array = layout.get("objects", [])
			for object in objects:
				if str(object.get("id", "")) == str(operation.get("id", "")):
					object["x"] = int(operation.get("x", object.get("x", 0)))
					object["y"] = int(operation.get("y", object.get("y", 0)))
					object["rotation"] = int(operation.get("rotation", object.get("rotation", 0)))
					break
			layout["objects"] = objects

func set_build_mode(enabled: bool) -> void:
	build_mode = enabled
	build_tool = "select"
	selected_catalog_id = ""
	queue_redraw()

func select_tool(tool: String, catalog_id := "") -> void:
	build_tool = tool
	selected_catalog_id = catalog_id
	dragging_object = {}
	drag_preview_placement = {}
	paint_cells.clear()
	queue_redraw()

func grid_to_screen(point: Vector2) -> Vector2:
	return IsometricGridProjection.grid_to_screen(point, camera_offset, cell_pixels)

func screen_to_grid(point: Vector2) -> Vector2i:
	return IsometricGridProjection.screen_to_cell(point, camera_offset, cell_pixels)

func screen_to_grid_fractional(point: Vector2) -> Vector2:
	return IsometricGridProjection.screen_to_grid_fractional(point, camera_offset, cell_pixels)

func grid_footprint(x: float, y: float, width: float, height: float) -> Rect2:
	return Rect2(Vector2(x, y), Vector2(width, height))

func object_footprint(object: Dictionary, definition: Dictionary) -> Rect2:
	return FurnitureMountPlacement.footprint(object, definition)

func footprint_polygon(footprint: Rect2) -> PackedVector2Array:
	return IsometricGridProjection.footprint_corners(footprint, camera_offset, cell_pixels)

func closed_polygon(points: PackedVector2Array) -> PackedVector2Array:
	var closed := points.duplicate()
	if not closed.is_empty():
		closed.append(closed[0])
	return closed

func polygon_bounds(points: PackedVector2Array) -> Rect2:
	if points.is_empty():
		return Rect2()
	var bounds := Rect2(points[0], Vector2.ZERO)
	for point in points:
		bounds = bounds.expand(point)
	return bounds

func distance_to_segment(point: Vector2, start: Vector2, finish: Vector2) -> float:
	var segment := finish - start
	var length_squared := segment.length_squared()
	if length_squared <= 0.000001:
		return point.distance_to(start)
	var amount := clampf((point - start).dot(segment) / length_squared, 0.0, 1.0)
	return point.distance_to(start + segment * amount)

func nearest_cell_edge(cell: Vector2i, screen_point: Vector2) -> String:
	var polygon := IsometricGridProjection.cell_polygon(cell, camera_offset, cell_pixels)
	var edges := {
		"north": [polygon[0], polygon[1]],
		"east": [polygon[1], polygon[2]],
		"south": [polygon[2], polygon[3]],
		"west": [polygon[3], polygon[0]],
	}
	var nearest := "north"
	for edge in edges:
		var segment: Array = edges[edge]
		if distance_to_segment(screen_point, segment[0], segment[1]) < distance_to_segment(screen_point, edges[nearest][0], edges[nearest][1]):
			nearest = edge
	return nearest

func inside_grid(cell: Vector2i) -> bool:
	return cell.x >= 0 and cell.y >= 0 and cell.x < int(layout.get("width", 0)) and cell.y < int(layout.get("height", 0))

func layout_grid_size() -> Vector2i:
	return Vector2i(int(layout.get("width", 0)), int(layout.get("height", 0)))

func furniture_definition(id: String) -> Dictionary:
	for definition in content.get("furniture", []):
		if str(definition.get("id", "")) == id:
			return definition
	return {}

func active_object_definition() -> Dictionary:
	if not dragging_object.is_empty():
		return furniture_definition(str(dragging_object.get("definitionId", "")))
	if build_tool == "object" and not selected_catalog_id.is_empty():
		return furniture_definition(selected_catalog_id)
	return {}

func object_placement_for_pointer(definition: Dictionary, cell: Vector2i, screen_point: Vector2, rotation: int) -> Dictionary:
	if FurnitureMountPlacement.mount_for(definition) == "wall":
		var edge := nearest_cell_edge(cell, screen_point)
		return FurnitureMountPlacement.wall_placement_for_cell(cell, edge, definition, layout_grid_size())
	return {
		"x": cell.x,
		"y": cell.y,
		"rotation": FurnitureMountPlacement.canonical_rotation(rotation),
	}

func wall_edge_screen_segment(object: Dictionary, definition: Dictionary) -> PackedVector2Array:
	var grid_segment := FurnitureMountPlacement.wall_edge_segment(object, definition)
	if grid_segment.size() != 2:
		return PackedVector2Array()
	return PackedVector2Array([grid_to_screen(grid_segment[0]), grid_to_screen(grid_segment[1])])

func object_at(cell: Vector2i, screen_point: Vector2) -> Dictionary:
	var objects: Array = layout.get("objects", [])
	var fallback: Dictionary = {}
	for index in range(objects.size() - 1, -1, -1):
		var object: Dictionary = objects[index]
		var definition := furniture_definition(str(object.get("definitionId", "")))
		if definition.is_empty(): continue
		if not object_footprint(object, definition).has_point(Vector2(cell) + Vector2(0.5, 0.5)):
			continue
		if fallback.is_empty():
			fallback = object
		if FurnitureMountPlacement.mount_for(definition) == "wall":
			var segment := wall_edge_screen_segment(object, definition)
			if segment.size() == 2 and distance_to_segment(screen_point, segment[0], segment[1]) <= maxf(8.0, cell_pixels * 0.18):
				return object
	return fallback

func object_depth_grid_position(object: Dictionary, definition: Dictionary) -> Vector2:
	return FurnitureMountPlacement.mount_depth_anchor_grid(object, definition)

func object_draw_layer(definition: Dictionary) -> int:
	return CEILING_WORLD_DRAW_LAYER if FurnitureMountPlacement.mount_for(definition) == "ceiling" else 0

func wall_opening_at(x: int, y: int, edge: String) -> String:
	for wall in layout.get("walls", []):
		if int(wall.get("x", -1)) == x and int(wall.get("y", -1)) == y and str(wall.get("edge", "")) == edge:
			return str(wall.get("openingType", ""))
	var mirrored_x := x
	var mirrored_y := y
	var mirrored_edge := ""
	match edge:
		"north":
			mirrored_y -= 1; mirrored_edge = "south"
		"east":
			mirrored_x += 1; mirrored_edge = "west"
		"south":
			mirrored_y += 1; mirrored_edge = "north"
		"west":
			mirrored_x -= 1; mirrored_edge = "east"
	for wall in layout.get("walls", []):
		if int(wall.get("x", -1)) == mirrored_x and int(wall.get("y", -1)) == mirrored_y and str(wall.get("edge", "")) == mirrored_edge:
			return str(wall.get("openingType", ""))
	return ""

## This is advisory preview state only. The server still prices, validates,
## persists, and either accepts or rejects every unchanged placement payload.
func placement_preview_is_valid(object: Dictionary, definition: Dictionary, except_id := "") -> bool:
	var footprint_cells := FurnitureMountPlacement.footprint_cells(object, definition)
	for cell in footprint_cells:
		if not inside_grid(cell):
			return false
	var mount := FurnitureMountPlacement.mount_for(definition)
	if mount == "wall":
		var placement: Dictionary = definition.get("placement", {})
		var allowed_openings: Array = placement.get("allowedWallOpenings", [])
		var edge := FurnitureMountPlacement.wall_edge_for_rotation(int(object.get("rotation", 0)))
		for cell in footprint_cells:
			if not allowed_openings.has(wall_opening_at(cell.x, cell.y, edge)):
				return false
	for placed in layout.get("objects", []):
		if str(placed.get("id", "")) == except_id:
			continue
		var placed_definition := furniture_definition(str(placed.get("definitionId", "")))
		if placed_definition.is_empty() or FurnitureMountPlacement.mount_for(placed_definition) != mount:
			continue
		var placed_cells := FurnitureMountPlacement.footprint_cells(placed, placed_definition)
		for cell in footprint_cells:
			if placed_cells.has(cell):
				return false
	return true

func _process(delta: float) -> void:
	if build_mode:
		return
	movement_send_cooldown -= delta
	if movement_send_cooldown <= 0.0:
		var direction := Input.get_vector("move_left", "move_right", "move_up", "move_down")
		if direction.length() <= 0.05:
			direction = Vector2.ZERO
		if direction != last_sent_direction or direction != Vector2.ZERO:
			movement_input.emit(direction)
			last_sent_direction = direction
		movement_send_cooldown = 0.1

func _notification(what: int) -> void:
	if what == NOTIFICATION_APPLICATION_FOCUS_OUT and not build_mode and last_sent_direction != Vector2.ZERO:
		last_sent_direction = Vector2.ZERO
		movement_input.emit(Vector2.ZERO)

func _exit_tree() -> void:
	if not build_mode and last_sent_direction != Vector2.ZERO:
		movement_input.emit(Vector2.ZERO)

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index in [MOUSE_BUTTON_WHEEL_UP, MOUSE_BUTTON_WHEEL_DOWN]:
		var before := screen_to_grid_fractional(event.position)
		cell_pixels = clampf(cell_pixels * (1.12 if event.button_index == MOUSE_BUTTON_WHEEL_UP else 0.89), 24.0, 128.0)
		camera_offset += event.position - grid_to_screen(before)
		queue_redraw(); accept_event(); return
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_MIDDLE:
		panning = event.pressed
		pan_origin = event.position
		camera_origin = camera_offset
		accept_event(); return
	if event is InputEventMouseMotion and panning:
		camera_offset = camera_origin + event.position - pan_origin
		queue_redraw(); accept_event(); return
	if not build_mode:
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_RIGHT:
		var active_definition := active_object_definition()
		if not active_definition.is_empty() and FurnitureMountPlacement.mount_for(active_definition) == "wall":
			queue_redraw(); accept_event(); return
		build_rotation = (build_rotation + 90) % 360
		if not dragging_object.is_empty():
			drag_preview_placement["rotation"] = build_rotation
			build_action_requested.emit("move", {
				"id": dragging_object.get("id", ""),
				"x": int(drag_preview_placement.get("x", dragging_object.get("x", 0))),
				"y": int(drag_preview_placement.get("y", dragging_object.get("y", 0))),
				"rotation": build_rotation,
			})
			dragging_object = {}
			drag_preview_placement = {}
		queue_redraw(); accept_event(); return
	if event is InputEventKey and event.pressed and event.physical_keycode == KEY_R:
		var active_definition := active_object_definition()
		if not active_definition.is_empty() and FurnitureMountPlacement.mount_for(active_definition) == "wall":
			queue_redraw(); accept_event(); return
		build_rotation = (build_rotation + 90) % 360
		queue_redraw(); accept_event(); return
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		var cell := screen_to_grid(event.position)
		if not inside_grid(cell): return
		hover_cell = cell
		hover_screen_position = event.position
		if event.pressed:
			if build_tool == "floor":
				painting = true; paint_cells.clear(); paint_cells["%d:%d" % [cell.x, cell.y]] = {"x": cell.x, "y": cell.y}; queue_redraw()
			elif build_tool in ["wall", "door", "arch"]:
				var edge := nearest_cell_edge(cell, event.position)
				var opening := "solid" if build_tool == "wall" else ("service-door" if build_tool == "door" else "arch")
				build_action_requested.emit("wall", {"x": cell.x, "y": cell.y, "edge": edge, "wallStyleId": selected_catalog_id, "openingType": opening, "rotation": build_rotation})
			elif build_tool == "object" and not selected_catalog_id.is_empty():
				var definition := furniture_definition(selected_catalog_id)
				if not definition.is_empty():
					var placement := object_placement_for_pointer(definition, cell, event.position, build_rotation)
					if FurnitureMountPlacement.mount_for(definition) == "wall":
						build_rotation = int(placement.get("rotation", 0))
					build_action_requested.emit("place", {
						"definitionId": selected_catalog_id,
						"x": int(placement.get("x", cell.x)),
						"y": int(placement.get("y", cell.y)),
						"rotation": int(placement.get("rotation", build_rotation)),
					})
			else:
				var object := object_at(cell, event.position)
				if not object.is_empty():
					dragging_object = object.duplicate(true)
					var definition := furniture_definition(str(object.get("definitionId", "")))
					var preserve_clicked_anchor := FurnitureMountPlacement.mount_for(definition) == "floor"
					drag_preview_placement = {
						"x": cell.x if preserve_clicked_anchor else int(object.get("x", 0)),
						"y": cell.y if preserve_clicked_anchor else int(object.get("y", 0)),
						"rotation": int(object.get("rotation", 0)),
					}
					build_rotation = int(object.get("rotation", 0))
					object_selected.emit(object)
		else:
			if painting:
				painting = false
				build_action_requested.emit("floor", {"surfaceId": selected_catalog_id, "cells": paint_cells.values()})
				paint_cells.clear()
			elif not dragging_object.is_empty():
				var definition := furniture_definition(str(dragging_object.get("definitionId", "")))
				var placement := object_placement_for_pointer(definition, cell, event.position, build_rotation)
				build_action_requested.emit("move", {
					"id": dragging_object.get("id", ""),
					"x": int(placement.get("x", cell.x)),
					"y": int(placement.get("y", cell.y)),
					"rotation": int(placement.get("rotation", build_rotation)),
				})
				dragging_object = {}
				drag_preview_placement = {}
		queue_redraw(); accept_event(); return
	if event is InputEventMouseMotion:
		var cell := screen_to_grid(event.position)
		hover_cell = cell if inside_grid(cell) else Vector2i(-1, -1)
		hover_screen_position = event.position
		if painting and inside_grid(cell):
			paint_cells["%d:%d" % [cell.x, cell.y]] = {"x": cell.x, "y": cell.y}
			queue_redraw(); accept_event()
		elif not dragging_object.is_empty() and inside_grid(cell):
			var definition := furniture_definition(str(dragging_object.get("definitionId", "")))
			drag_preview_placement = object_placement_for_pointer(definition, cell, event.position, build_rotation)
			if FurnitureMountPlacement.mount_for(definition) == "wall":
				build_rotation = int(drag_preview_placement.get("rotation", 0))
			queue_redraw(); accept_event()
		else:
			queue_redraw()

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color("091114"), true)
	if layout.is_empty():
		draw_string(ThemeDB.fallback_font, Vector2(30, 50), "Waiting for authoritative layout…", HORIZONTAL_ALIGNMENT_LEFT, -1, 18, Color("91a1a1"))
		return
	for cell in layout.get("cells", []):
		var polygon := IsometricGridProjection.cell_polygon(Vector2i(int(cell.get("x", 0)), int(cell.get("y", 0))), camera_offset, cell_pixels)
		var color: Color = FLOOR_COLORS.get(str(cell.get("surfaceId", "sealed-concrete")), Color("586367"))
		draw_colored_polygon(polygon, color)
		draw_polyline(closed_polygon(polygon), Color(color).darkened(0.22), 1.0, true)
	if painting:
		for value in paint_cells.values():
			var polygon := IsometricGridProjection.cell_polygon(Vector2i(int(value.x), int(value.y)), camera_offset, cell_pixels)
			draw_colored_polygon(polygon, Color("efbc54", 0.55))
			draw_polyline(closed_polygon(polygon), Color("ffd982", 0.8), 2.0, true)
	var world_items: Array = []
	for wall in layout.get("walls", []):
		world_items.append(world_item("wall", wall, wall_grid_position(wall)))
	var objects: Array = layout.get("objects", []).duplicate(true)
	for object in objects:
		if not dragging_object.is_empty() and str(object.get("id", "")) == str(dragging_object.get("id", "")): continue
		var definition := furniture_definition(str(object.get("definitionId", "")))
		if not definition.is_empty():
			world_items.append(world_item("object", object, object_depth_grid_position(object, definition), object_draw_layer(definition)))
	if not dragging_object.is_empty():
		var preview := dragging_object.duplicate()
		preview.x = int(drag_preview_placement.get("x", dragging_object.get("x", 0)))
		preview.y = int(drag_preview_placement.get("y", dragging_object.get("y", 0)))
		preview.rotation = int(drag_preview_placement.get("rotation", build_rotation))
		var preview_definition := furniture_definition(str(preview.get("definitionId", "")))
		if not preview_definition.is_empty():
			preview["_previewValid"] = placement_preview_is_valid(preview, preview_definition, str(preview.get("id", "")))
			world_items.append(world_item("object-preview", preview, object_depth_grid_position(preview, preview_definition), object_draw_layer(preview_definition)))
	elif build_tool == "object" and not selected_catalog_id.is_empty() and inside_grid(hover_cell):
		var preview_definition := furniture_definition(selected_catalog_id)
		if not preview_definition.is_empty():
			var preview_placement := object_placement_for_pointer(preview_definition, hover_cell, hover_screen_position, build_rotation)
			var preview := {
				"definitionId": selected_catalog_id,
				"x": int(preview_placement.get("x", hover_cell.x)),
				"y": int(preview_placement.get("y", hover_cell.y)),
				"rotation": int(preview_placement.get("rotation", build_rotation)),
				"_previewValid": false,
			}
			preview["_previewValid"] = placement_preview_is_valid(preview, preview_definition)
			world_items.append(world_item("object-preview", preview, object_depth_grid_position(preview, preview_definition), object_draw_layer(preview_definition)))
	for incident in snapshot.get("incidents", []):
		world_items.append(world_item("incident", incident, Vector2(float(incident.get("x", 0)), float(incident.get("y", 0)))))
	for party in snapshot.get("parties", []):
		world_items.append(world_item("party", party, party_grid_position(party)))
	for avatar in snapshot.get("presences", []):
		world_items.append(world_item("avatar", avatar, Vector2(float(avatar.get("x", 0)), float(avatar.get("y", 0)))))
	world_items.sort_custom(world_item_draws_before)
	for item in world_items:
		match str(item.get("kind", "")):
			"wall": draw_wall(item.data)
			"object": draw_object(item.data)
			"object-preview": draw_object(item.data, 0.65)
			"incident": draw_incident(item.data)
			"party": draw_party(item.data)
			"avatar": draw_avatar(item.data)
	draw_hud()

func world_item(kind: String, data: Dictionary, grid_position: Vector2, draw_layer := 0) -> Dictionary:
	return {
		"kind": kind,
		"data": data,
		"drawLayer": draw_layer,
		"depth": IsometricGridProjection.depth_key(Rect2(grid_position, Vector2.ZERO), "%s:%s" % [kind, str(data.get("id", data.get("characterId", "")))]),
	}

func world_item_draws_before(left: Dictionary, right: Dictionary) -> bool:
	var left_layer := int(left.get("drawLayer", 0))
	var right_layer := int(right.get("drawLayer", 0))
	if left_layer != right_layer:
		return left_layer < right_layer
	return IsometricGridProjection.depth_key_draws_before(left.get("depth", {}), right.get("depth", {}))

func wall_grid_position(wall: Dictionary) -> Vector2:
	var x := float(wall.get("x", 0)); var y := float(wall.get("y", 0))
	match str(wall.get("edge", "north")):
		"north": return Vector2(x + 0.5, y)
		"east": return Vector2(x + 1.0, y + 0.5)
		"south": return Vector2(x + 0.5, y + 1.0)
		"west": return Vector2(x, y + 0.5)
	return Vector2(x, y)

func wall_plane_point(start: Vector2, finish: Vector2, along: float, height: float) -> Vector2:
	return start.lerp(finish, clampf(along, 0.0, 1.0)) - Vector2(0.0, cell_pixels * WALL_PLANE_HEIGHT_CELLS * clampf(height, 0.0, 1.0))

func draw_wall_plane_section(start: Vector2, finish: Vector2, along_start: float, along_end: float, height_start: float, height_end: float, color: Color) -> void:
	var panel := PackedVector2Array([
		wall_plane_point(start, finish, along_start, height_start),
		wall_plane_point(start, finish, along_end, height_start),
		wall_plane_point(start, finish, along_end, height_end),
		wall_plane_point(start, finish, along_start, height_end),
	])
	draw_colored_polygon(panel, color)
	draw_polyline(closed_polygon(panel), Color("273034"), 1.25, true)

func draw_wall(wall: Dictionary) -> void:
	var x := float(wall.get("x", 0)); var y := float(wall.get("y", 0)); var edge := str(wall.get("edge", "north"))
	var polygon := footprint_polygon(grid_footprint(x, y, 1.0, 1.0))
	var start := polygon[0]; var finish := polygon[1]
	match edge:
		"north": start = polygon[0]; finish = polygon[1]
		"east": start = polygon[1]; finish = polygon[2]
		"south": start = polygon[2]; finish = polygon[3]
		"west": start = polygon[3]; finish = polygon[0]
	var opening := str(wall.get("openingType", "solid"))
	var plane_color: Color = WALL_PLANE_COLORS.get(edge, Color("c8c0ad"))
	var opening_color := Color("82ccb1")
	if opening == "solid":
		draw_wall_plane_section(start, finish, 0.0, 1.0, 0.0, 1.0, plane_color)
	else:
		# Preserve a traversable/readable center opening while retaining wall
		# mass at both jambs. Windows also keep a sill; doors and arches remain
		# open to the floor with a shallow structural header.
		draw_wall_plane_section(start, finish, 0.0, 0.28, 0.0, 1.0, plane_color)
		draw_wall_plane_section(start, finish, 0.72, 1.0, 0.0, 1.0, plane_color)
		if opening == "window":
			draw_wall_plane_section(start, finish, 0.28, 0.72, 0.0, 0.30, plane_color)
			draw_wall_plane_section(start, finish, 0.28, 0.72, 0.72, 1.0, plane_color)
			draw_line(wall_plane_point(start, finish, 0.28, 0.30), wall_plane_point(start, finish, 0.72, 0.30), opening_color, 2.0)
			draw_line(wall_plane_point(start, finish, 0.28, 0.72), wall_plane_point(start, finish, 0.72, 0.72), opening_color, 2.0)
		else:
			var header_bottom := 0.62 if opening == "arch" else 0.72
			draw_wall_plane_section(start, finish, 0.28, 0.72, header_bottom, 1.0, plane_color)
			draw_line(wall_plane_point(start, finish, 0.28, 0.0), wall_plane_point(start, finish, 0.28, header_bottom), opening_color, 2.0)
			draw_line(wall_plane_point(start, finish, 0.72, 0.0), wall_plane_point(start, finish, 0.72, header_bottom), opening_color, 2.0)
	draw_line(start, finish, Color("172024"), 7)
	if opening == "solid": draw_line(start, finish, plane_color.lightened(0.12), 3)
	else:
		draw_line(start, start.lerp(finish, .28), opening_color, 3); draw_line(start.lerp(finish, .72), finish, opening_color, 3)

func object_draws_before(left: Dictionary, right: Dictionary) -> bool:
	var left_definition := furniture_definition(str(left.get("definitionId", "")))
	var right_definition := furniture_definition(str(right.get("definitionId", "")))
	var left_key := IsometricGridProjection.depth_key(object_footprint(left, left_definition), str(left.get("id", "")))
	var right_key := IsometricGridProjection.depth_key(object_footprint(right, right_definition), str(right.get("id", "")))
	return IsometricGridProjection.depth_key_draws_before(left_key, right_key)

func object_art_mount_anchor_screen(object: Dictionary, definition: Dictionary) -> Vector2:
	var mount := FurnitureMountPlacement.mount_for(definition)
	var grid_anchor := FurnitureMountPlacement.mount_anchor_grid(object, definition)
	if mount == "wall":
		grid_anchor = FurnitureMountPlacement.wall_room_anchor_grid(object, definition, WALL_ART_ROOM_INSET_CELLS)
		return grid_to_screen(grid_anchor) - Vector2(0.0, cell_pixels * WALL_ART_ELEVATION_CELLS)
	if mount == "ceiling":
		return grid_to_screen(grid_anchor) - Vector2(0.0, cell_pixels * CEILING_ART_ELEVATION_CELLS)
	return grid_to_screen(grid_anchor)

func object_art_mount_visual_extent(object: Dictionary, definition: Dictionary, footprint: Rect2) -> Vector2:
	if FurnitureMountPlacement.mount_for(definition) == "wall":
		var segment := wall_edge_screen_segment(object, definition)
		if segment.size() == 2:
			# The projected support span is rotation-invariant and keeps wall art
			# scaled to the wall plane instead of the containing floor diamond.
			return Vector2(segment[0].distance_to(segment[1]), cell_pixels * WALL_ART_ELEVATION_CELLS)
	return polygon_bounds(footprint_polygon(footprint)).size

func draw_object(object: Dictionary, alpha := 1.0) -> void:
	var definition := furniture_definition(str(object.get("definitionId", "")))
	if definition.is_empty(): return
	var item_rotation := FurnitureMountPlacement.canonical_rotation(int(object.get("rotation", 0)))
	var mount := FurnitureMountPlacement.mount_for(definition)
	var footprint := object_footprint(object, definition)
	var polygon := footprint_polygon(footprint)
	var bounds := polygon_bounds(polygon)
	var color: Color = CATEGORY_COLORS.get(str(definition.get("category", "Decor")), Color("6e9364"))
	var condition := str(object.get("state", "operational"))
	var wear := float(object.get("wear", 0))
	var is_preview := object.has("_previewValid")
	var preview_valid := bool(object.get("_previewValid", true))
	if condition == "broken": color = Color("7b3e3e")
	elif condition == "worn": color = color.darkened(.24)
	if not preview_valid: color = Color("b7433f")
	color.a = alpha
	if mount == "floor":
		draw_colored_polygon(polygon, color)
		draw_polyline(closed_polygon(polygon), Color(color).lightened(.25), 2.0, true)
	elif mount == "wall" and (build_mode or is_preview):
		var segment := wall_edge_screen_segment(object, definition)
		if segment.size() == 2:
			draw_line(segment[0], segment[1], Color("101719", alpha), 8.0)
			draw_line(segment[0], segment[1], Color(color).lightened(.25), 4.0)
	elif mount == "ceiling" and (build_mode or is_preview):
		var ceiling_color := Color(color, alpha * 0.24)
		draw_colored_polygon(polygon, ceiling_color)
		draw_polyline(closed_polygon(polygon), Color(color).lightened(.25), 2.0, true)
	var texture_binding := texture_binding_for(definition, item_rotation)
	var texture: Texture2D = texture_binding.get("texture")
	if texture != null:
		var condition_tint := Color(1, 1, 1, alpha)
		if condition == "broken": condition_tint = Color(.62, .43, .40, alpha)
		elif condition == "worn": condition_tint = Color(.78, .72, .65, alpha)
		if not preview_valid: condition_tint = Color(1.0, .42, .38, alpha)
		if bool(texture_binding.get("directional", false)):
			var directional_rect := Rect2()
			if mount == "floor":
				var floor_contact := IsometricGridProjection.floor_contact_target(footprint, camera_offset, cell_pixels)
				directional_rect = FurnitureArtBinding.draw_rect_for_floor_contact_target(texture.get_size(), floor_contact, bounds.size)
			else:
				var mount_anchor := object_art_mount_anchor_screen(object, definition)
				var mount_extent := object_art_mount_visual_extent(object, definition, footprint)
				directional_rect = FurnitureArtBinding.draw_rect_for_mount_anchor(texture.get_size(), mount_anchor, mount_extent)
			draw_texture_rect(texture, directional_rect, false, condition_tint)
		else:
			var source_size := bounds.size - Vector2.ONE * 8
			draw_set_transform(bounds.get_center(), deg_to_rad(float(item_rotation)), Vector2.ONE)
			draw_texture_rect(texture, Rect2(-source_size * .5, source_size), false, condition_tint)
			draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	var symbol := str(definition.get("symbol", str(definition.get("name", "?"))[0]))
	if texture == null: draw_string(ThemeDB.fallback_font, bounds.get_center() + Vector2(-5, 5), symbol, HORIZONTAL_ALIGNMENT_LEFT, -1, clampi(int(cell_pixels * .35), 11, 22), Color("f7f0db", alpha))
	if build_mode and cell_pixels > 30:
		draw_string(ThemeDB.fallback_font, bounds.position + Vector2(5, 14), str(definition.get("name", "")), HORIZONTAL_ALIGNMENT_LEFT, int(bounds.size.x - 10), 10, Color("f7f0db", alpha * .92))
		if condition in ["worn", "broken"]:
			draw_string(ThemeDB.fallback_font, bounds.position + Vector2(5, bounds.size.y - 5), "%s · %.0f%%" % [condition.to_upper(), wear], HORIZONTAL_ALIGNMENT_LEFT, int(bounds.size.x - 10), 10, Color("ffc6a5", alpha))
	elif condition in ["worn", "broken"]:
		var marker_position := bounds.position + Vector2(9, 9)
		var marker_color := Color("d9a44b") if condition == "worn" else Color("c6544f")
		draw_circle(marker_position, 8, Color("101719", alpha))
		draw_circle(marker_position, 6, Color(marker_color, alpha))
		draw_string(ThemeDB.fallback_font, marker_position + Vector2(-2.5, 3.5), "!", HORIZONTAL_ALIGNMENT_LEFT, -1, 10, Color("fff4d8", alpha))

func make_object_box(color: Color) -> StyleBoxFlat:
	var box := StyleBoxFlat.new(); box.bg_color = color; box.border_color = Color(color).lightened(.25); box.set_border_width_all(2); box.set_corner_radius_all(5); return box

func texture_for(definition: Dictionary) -> Texture2D:
	var key := str(definition.get("id", ""))
	var asset_key := str(definition.get("assetId", key))
	for generated_key in [asset_key, key]:
		var generated_path := "res://assets/objects/generated/%s.png" % generated_key
		if ResourceLoader.exists(generated_path):
			if texture_cache.has(generated_path): return texture_cache[generated_path]
			var generated_texture := load(generated_path) as Texture2D
			texture_cache[generated_path] = generated_texture
			return generated_texture
	var mapping := {"table-two": "table-two", "oak-two-top": "table-two", "table-four": "table-four", "walnut-four-top": "table-four", "host-stand": "host-stand", "host-stand-pro": "host-stand", "range": "range", "six-burner-range": "range", "prep": "prep-table", "prep-table-refrigerated": "prep-table", "dish-machine": "dish-machine", "dish-machine-high-temp": "dish-machine", "service-station": "service-station", "server-station-pro": "service-station", "plants": "plant", "large-planter": "plant"}
	var file_name := str(mapping.get(key, mapping.get(asset_key, "")))
	if file_name.is_empty(): return null
	if texture_cache.has(file_name): return texture_cache[file_name]
	var path := "res://assets/objects/%s.svg" % file_name
	if not ResourceLoader.exists(path): return null
	var texture := load(path) as Texture2D
	texture_cache[file_name] = texture
	return texture

func texture_binding_for(definition: Dictionary, item_rotation: int) -> Dictionary:
	var directional_path := FurnitureArtBinding.directional_texture_path(definition, item_rotation)
	if not directional_path.is_empty() and ResourceLoader.exists(directional_path):
		if not texture_cache.has(directional_path):
			texture_cache[directional_path] = load(directional_path) as Texture2D
		return {"texture": texture_cache.get(directional_path), "directional": true, "path": directional_path}
	return {"texture": texture_for(definition), "directional": false, "path": "legacy-fallback"}

func draw_avatar(avatar: Dictionary) -> void:
	var draw_position := grid_to_screen(Vector2(float(avatar.get("x", 0)), float(avatar.get("y", 0))))
	var primary := Color(str(avatar.get("primaryColor", "#2f684f"))); var secondary := Color(str(avatar.get("secondaryColor", "#d6a84b")))
	draw_circle(draw_position, 12, Color("101719")); draw_circle(draw_position, 10, primary); draw_arc(draw_position, 8, -PI*.1, PI*.9, 16, secondary, 4)
	var direction := Vector2(float(avatar.get("directionX", 0)), float(avatar.get("directionY", 1)))
	if direction.length() > .1:
		var projected_direction := IsometricGridProjection.basis_x(cell_pixels) * direction.x + IsometricGridProjection.basis_y(cell_pixels) * direction.y
		draw_line(draw_position, draw_position + projected_direction.normalized() * 15, Color("f5e7c5"), 2)
	draw_string(ThemeDB.fallback_font, draw_position + Vector2(-24, -16), str(avatar.get("name", "Player")), HORIZONTAL_ALIGNMENT_CENTER, 48, 10, Color("f1ecda"))

func draw_party(party: Dictionary) -> void:
	var draw_position := grid_to_screen(party_grid_position(party))
	draw_circle(draw_position, 7, Color("d7d0bd")); draw_circle(draw_position, 3, Color("573f36"))
	if int(party.get("patience", 100)) < 40: draw_arc(draw_position, 12, 0, TAU, 24, Color("dc5b4a"), 2)

func party_grid_position(party: Dictionary) -> Vector2:
	var index: int = absi(str(party.get("id", "")).hash()) % 8
	return Vector2(3 + index * 1.55, 5 + (index % 2) * 5)

func draw_incident(incident: Dictionary) -> void:
	var draw_position := grid_to_screen(Vector2(float(incident.get("x", 0)), float(incident.get("y", 0))))
	var radius := 13.0 + sin(Time.get_ticks_msec() / 160.0) * 3.0
	draw_circle(draw_position, radius, Color("d6a348", .35)); draw_arc(draw_position, radius, 0, TAU, 24, Color("efbd54"), 3)
	draw_string(ThemeDB.fallback_font, draw_position + Vector2(-7, 5), "!", HORIZONTAL_ALIGNMENT_LEFT, -1, 16, Color("2a2117"))

func draw_hud() -> void:
	var mode := "BUILD MODE" if build_mode else "LIVE SERVICE"
	draw_rect(Rect2(16, 16, 226, 54), Color("0c1518", .9), true)
	draw_string(ThemeDB.fallback_font, Vector2(30, 40), mode, HORIZONTAL_ALIGNMENT_LEFT, -1, 17, Color("7fd0b2") if not build_mode else Color("efbc54"))
	var active_definition := active_object_definition()
	var wall_mount_active := not active_definition.is_empty() and FurnitureMountPlacement.mount_for(active_definition) == "wall"
	var build_hint := "Wall mount • point at an edge to snap • drag to move" if wall_mount_active else "Left drag/place • drag objects • right-click/R rotate"
	var hint := "WASD move • wheel zoom • middle-drag pan" if not build_mode else build_hint
	draw_string(ThemeDB.fallback_font, Vector2(30, 59), hint, HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color("9aabaa"))
