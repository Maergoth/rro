class_name FurnitureArtBinding
extends RefCounted

const CONTRACT_PATH := "res://furniture-art-runtime.json"

static var _contract_cache: Dictionary = {}

static func contract() -> Dictionary:
	if not _contract_cache.is_empty():
		return _contract_cache
	var source := FileAccess.get_file_as_string(CONTRACT_PATH)
	var parsed: Variant = JSON.parse_string(source)
	if parsed is Dictionary:
		_contract_cache = parsed
	return _contract_cache

static func capability() -> Dictionary:
	return Dictionary(contract().get("capability", {})).duplicate(true)

static func canonical_rotation(rotation_degrees: int) -> int:
	var normalized := rotation_degrees % 360
	if normalized < 0:
		normalized += 360
	return normalized

static func direction_for_rotation(rotation_degrees: int) -> String:
	var directions: Dictionary = contract().get("directionsByRotation", {})
	return str(directions.get(str(canonical_rotation(rotation_degrees)), ""))

static func definition_asset_id(definition: Dictionary) -> String:
	var asset_id := str(definition.get("assetId", ""))
	return asset_id if not asset_id.is_empty() else str(definition.get("id", ""))

static func directional_texture_path(definition: Dictionary, rotation_degrees: int) -> String:
	var asset_id := definition_asset_id(definition)
	var accepted_assets: Array = contract().get("acceptedDirectionalAssetIds", [])
	if asset_id.is_empty() or not accepted_assets.has(asset_id):
		return ""
	var direction := direction_for_rotation(rotation_degrees)
	if direction.is_empty():
		return ""
	return "%s/%s/%s.png" % [str(contract().get("directionalRoot", "")), asset_id, direction]

static func draw_rect_for_floor_contact(texture_size: Vector2, footprint_rect: Rect2) -> Rect2:
	return draw_rect_for_floor_contact_target(texture_size, Vector2(footprint_rect.get_center().x, footprint_rect.end.y), footprint_rect.size)

static func draw_rect_for_floor_contact_target(texture_size: Vector2, floor_contact: Vector2, visual_extent: Vector2) -> Rect2:
	var canvas: Dictionary = contract().get("sourceCanvas", {})
	var canvas_width := float(canvas.get("width", 0.0))
	var canvas_height := float(canvas.get("height", 0.0))
	var pivot_data: Dictionary = canvas.get("floorContactPivot", {})
	if texture_size.x <= 0.0 or texture_size.y <= 0.0 or canvas_width <= 0.0 or canvas_height <= 0.0:
		return Rect2()
	var uniform_scale := maxf(visual_extent.x, visual_extent.y) / maxf(canvas_width, canvas_height)
	var source_pivot := Vector2(float(pivot_data.get("x", canvas_width * 0.5)), float(pivot_data.get("y", canvas_height)))
	return Rect2(floor_contact - source_pivot * uniform_scale, texture_size * uniform_scale)
