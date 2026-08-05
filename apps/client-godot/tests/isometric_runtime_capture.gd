extends SceneTree

const OUTPUT_ARGUMENT := "--output-dir="
const VIEWPORT_SIZE := Vector2i(1800, 1100)
const WATCHDOG_SECONDS := 45.0
const ROTATIONS := [0, 90, 180, 270]
const DIRECTION_NAMES := {0: "north", 90: "east", 180: "south", 270: "west"}
const MOUNTED_ASSET_IDS := ["local-art", "pendants", "plants"]

var capture_finished := false

const DEFINITIONS := [
	{"id": "banquette", "assetId": "banquette", "name": "Deep Teal Banquette", "category": "Dining", "width": 5, "height": 2},
	{"id": "booth", "assetId": "booth", "name": "Tomato Vinyl Booth", "category": "Dining", "width": 4, "height": 2},
	{"id": "dish-machine", "assetId": "dish-machine", "name": "High-Temp Dish Machine", "category": "Utility", "width": 3, "height": 2},
	{"id": "espresso", "assetId": "espresso", "name": "Espresso Machine", "category": "Service", "width": 2, "height": 1},
	{"id": "banquette-section", "assetId": "furniture-banquette-section", "name": "Upholstered Banquette", "category": "Dining", "width": 4, "height": 2},
	{"id": "commercial-chair", "assetId": "furniture-commercial-chair", "name": "Commercial Dining Chair", "category": "Dining", "width": 1, "height": 1},
	{"id": "convection-oven", "assetId": "furniture-convection-oven", "name": "Convection Oven", "category": "Kitchen", "width": 3, "height": 3, "placement": {"mount": "floor", "occupancy": "blocking", "serviceAccess": "adjacent"}},
	{"id": "expo-pass-heated", "assetId": "furniture-expo-pass-heated", "name": "Heated Expo Pass", "category": "Kitchen", "width": 4, "height": 2, "placement": {"mount": "floor", "occupancy": "blocking", "serviceAccess": "adjacent"}},
	{"id": "host-stand-pro", "assetId": "furniture-host-stand-pro", "name": "Reservation Host Stand", "category": "Service", "width": 2, "height": 2},
	{"id": "oak-two-top", "assetId": "furniture-oak-two-top", "name": "Oak Two-Top", "category": "Dining", "width": 2, "height": 2},
	{"id": "plancha-commercial", "assetId": "furniture-plancha-commercial", "name": "Commercial Plancha", "category": "Kitchen", "width": 3, "height": 2, "placement": {"mount": "floor", "occupancy": "blocking", "serviceAccess": "adjacent"}},
	{"id": "pos-terminal", "assetId": "furniture-pos-terminal", "name": "Commercial POS Terminal", "category": "Service", "width": 1, "height": 1},
	{"id": "premium-chair", "assetId": "furniture-premium-chair", "name": "Premium Dining Chair", "category": "Dining", "width": 1, "height": 1},
	{"id": "server-station-pro", "assetId": "furniture-server-station-pro", "name": "Integrated Server Station", "category": "Service", "width": 3, "height": 2},
	{"id": "six-burner-range", "assetId": "furniture-six-burner-range", "name": "Six-Burner Range", "category": "Kitchen", "width": 4, "height": 3},
	{"id": "walnut-four-top", "assetId": "furniture-walnut-four-top", "name": "Walnut Four-Top", "category": "Dining", "width": 3, "height": 3},
	{"id": "host-stand", "assetId": "host-stand", "name": "Host Stand", "category": "Service", "width": 2, "height": 1},
	{"id": "local-art", "assetId": "local-art", "name": "Local Print Set", "category": "Decor", "width": 2, "height": 1, "placement": {"mount": "wall", "occupancy": "nonblocking", "serviceAccess": "none", "allowedWallOpenings": ["solid"]}},
	{"id": "mop-sink", "assetId": "mop-sink", "name": "Utility Sink", "category": "Utility", "width": 2, "height": 2},
	{"id": "pass", "assetId": "pass", "name": "Heated Pass", "category": "Kitchen", "width": 3, "height": 1},
	{"id": "pendants", "assetId": "pendants", "name": "Mustard Pendant Lights", "category": "Decor", "width": 2, "height": 1, "placement": {"mount": "ceiling", "occupancy": "nonblocking", "serviceAccess": "none"}},
	{"id": "plants", "assetId": "plants", "name": "Window Herb Wall", "category": "Decor", "width": 3, "height": 1, "placement": {"mount": "wall", "occupancy": "nonblocking", "serviceAccess": "none", "allowedWallOpenings": ["solid"]}},
	{"id": "prep", "assetId": "prep", "name": "Cold Prep Table", "category": "Kitchen", "width": 3, "height": 1},
	{"id": "range", "assetId": "range", "name": "Six-Burner Range", "category": "Kitchen", "width": 3, "height": 2},
	{"id": "recycling", "assetId": "recycling", "name": "Sorting Station", "category": "Utility", "width": 2, "height": 1},
	{"id": "service-station", "assetId": "service-station", "name": "Service Station", "category": "Service", "width": 2, "height": 2},
	{"id": "table-four", "assetId": "table-four", "name": "Oak Four-Top", "category": "Dining", "width": 3, "height": 2},
	{"id": "table-two", "assetId": "table-two", "name": "Walnut Two-Top", "category": "Dining", "width": 2, "height": 2},
]

# These are the exact positions used by the already accepted floor-mounted
# identities. Mounted objects intentionally have no entry here: their anchors
# must follow the legal supporting edge selected by each capture rotation.
const FLOOR_POSITIONS := {
	"banquette": Vector2i(2, 2),
	"booth": Vector2i(9, 2),
	"dish-machine": Vector2i(15, 2),
	"espresso": Vector2i(21, 2),
	"furniture-banquette-section": Vector2i(4, 6),
	"furniture-commercial-chair": Vector2i(10, 6),
	"furniture-convection-oven": Vector2i(14, 16),
	"furniture-expo-pass-heated": Vector2i(3, 14),
	"furniture-host-stand-pro": Vector2i(16, 6),
	"furniture-oak-two-top": Vector2i(22, 6),
	"furniture-plancha-commercial": Vector2i(18, 1),
	"furniture-pos-terminal": Vector2i(2, 12),
	"furniture-premium-chair": Vector2i(8, 12),
	"furniture-server-station-pro": Vector2i(14, 12),
	"furniture-six-burner-range": Vector2i(20, 12),
	"furniture-walnut-four-top": Vector2i(5, 16),
	"host-stand": Vector2i(11, 16),
	"mop-sink": Vector2i(23, 16),
	"pass": Vector2i(8, 20),
	"prep": Vector2i(2, 20),
	"range": Vector2i(1, 16),
	"recycling": Vector2i(25, 12),
	"service-station": Vector2i(26, 2),
	"table-four": Vector2i(26, 6),
	"table-two": Vector2i(27, 16),
}

# Wall anchors move to a complete solid perimeter span for the edge selected
# by the persisted rotation. The ceiling anchor shares the walnut four-top's
# cells on purpose, proving floor/ceiling namespaces while giving the pendants
# an honest dining-table context in every reviewed direction.
const MOUNTED_POSITIONS_BY_ROTATION := {
	0: {"local-art": Vector2i(5, 0), "pendants": Vector2i(5, 16), "plants": Vector2i(20, 0)},
	90: {"local-art": Vector2i(29, 3), "pendants": Vector2i(5, 16), "plants": Vector2i(29, 12)},
	180: {"local-art": Vector2i(5, 22), "pendants": Vector2i(5, 16), "plants": Vector2i(20, 22)},
	270: {"local-art": Vector2i(0, 3), "pendants": Vector2i(5, 16), "plants": Vector2i(0, 12)},
}

func _initialize() -> void:
	var watchdog := create_timer(WATCHDOG_SECONDS, true, false, true)
	watchdog.timeout.connect(capture_timed_out)
	call_deferred("capture_runtime")

func capture_timed_out() -> void:
	if capture_finished:
		return
	push_error("Native runtime QA capture exceeded the %.0f-second watchdog." % WATCHDOG_SECONDS)
	finish_capture(6)

func finish_capture(exit_code: int) -> void:
	capture_finished = true
	quit(exit_code)

func output_directory() -> String:
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with(OUTPUT_ARGUMENT):
			return argument.substr(OUTPUT_ARGUMENT.length()).strip_edges()
	return "/tmp/rro-isometric-runtime"

func make_cells(width: int, height: int) -> Array:
	var cells: Array = []
	var surfaces := ["sealed-concrete", "quarry-tile", "slate-tile", "oak-plank"]
	for y in range(height):
		for x in range(width):
			var surface_index := int(floor(float(x) / 6.0)) + int(floor(float(y) / 5.0))
			cells.append({"x": x, "y": y, "surfaceId": surfaces[surface_index % surfaces.size()]})
	return cells

func make_walls(width: int, height: int) -> Array:
	var walls: Array = []
	for x in range(width):
		walls.append({"id": "north-%d" % x, "x": x, "y": 0, "edge": "north", "openingType": "solid"})
		walls.append({"id": "south-%d" % x, "x": x, "y": height - 1, "edge": "south", "openingType": "arch" if x in [14, 15] else "solid"})
	for y in range(height):
		walls.append({"id": "west-%d" % y, "x": 0, "y": y, "edge": "west", "openingType": "solid"})
		walls.append({"id": "east-%d" % y, "x": width - 1, "y": y, "edge": "east", "openingType": "service-door" if y in [8, 9] else "solid"})
	for x in range(5, 27):
		walls.append({"id": "room-%d" % x, "x": x, "y": 10, "edge": "south", "openingType": "door" if x == 16 else "solid"})
	return walls

func make_objects(rotation: int) -> Array:
	var mounted_positions: Dictionary = MOUNTED_POSITIONS_BY_ROTATION.get(FurnitureMountPlacement.canonical_rotation(rotation), {})
	var objects: Array = []
	for index in range(DEFINITIONS.size()):
		var definition: Dictionary = DEFINITIONS[index]
		var asset_id := str(definition.get("assetId", definition.get("id", "")))
		var position: Vector2i = mounted_positions.get(asset_id, FLOOR_POSITIONS.get(asset_id, Vector2i(-1, -1)))
		objects.append({
			"id": "qa-%s" % asset_id,
			"definitionId": definition.id,
			"x": position.x,
			"y": position.y,
			"rotation": FurnitureMountPlacement.canonical_rotation(rotation),
			"state": "worn" if index == 2 else ("broken" if index == 9 else "operational"),
			"wear": 42 if index == 2 else (100 if index == 9 else 0),
		})
	return objects

func mounted_fixture_failure(restaurant_view: RestaurantFloor, objects: Array) -> String:
	var observed_ids: Array[String] = []
	for object in objects:
		var definition := restaurant_view.furniture_definition(str(object.get("definitionId", "")))
		var mount := FurnitureMountPlacement.mount_for(definition)
		if mount == "floor":
			continue
		var asset_id := str(definition.get("assetId", definition.get("id", "")))
		observed_ids.append(asset_id)
		var placement: Dictionary = definition.get("placement", {})
		if str(placement.get("occupancy", "")) != "nonblocking":
			return "%s must remain nonblocking" % asset_id
		if not restaurant_view.placement_preview_is_valid(object, definition, str(object.get("id", ""))):
			return "%s has an unsupported, overlapping, or out-of-bounds %s placement" % [asset_id, mount]
	observed_ids.sort()
	var expected_ids: Array = MOUNTED_ASSET_IDS.duplicate()
	expected_ids.sort()
	if observed_ids != expected_ids:
		return "mounted fixture identities do not match the exact review set"
	return ""

func fixture_definition(definition_id: String) -> Dictionary:
	for definition in DEFINITIONS:
		if str(definition.get("id", "")) == definition_id:
			return definition
	return {}

func mounted_placement_records(objects: Array) -> Array:
	var records: Array = []
	for object in objects:
		var definition := fixture_definition(str(object.get("definitionId", "")))
		if definition.is_empty():
			continue
		var mount := FurnitureMountPlacement.mount_for(definition)
		if mount == "floor":
			continue
		var footprint := FurnitureMountPlacement.footprint(object, definition)
		var anchor := FurnitureMountPlacement.mount_anchor_grid(object, definition)
		var record := {
			"assetId": str(definition.get("assetId", definition.get("id", ""))),
			"mount": mount,
			"occupancy": str(Dictionary(definition.get("placement", {})).get("occupancy", "")),
			"x": int(object.get("x", 0)),
			"y": int(object.get("y", 0)),
			"rotation": int(object.get("rotation", 0)),
			"footprint": [footprint.position.x, footprint.position.y, footprint.size.x, footprint.size.y],
			"anchor": [anchor.x, anchor.y],
		}
		if mount == "wall":
			record["supportEdge"] = FurnitureMountPlacement.wall_edge_for_rotation(int(object.get("rotation", 0)))
		records.append(record)
	return records

func sampled_color_count(image: Image) -> int:
	var colors: Dictionary = {}
	for y in range(0, image.get_height(), 16):
		for x in range(0, image.get_width(), 16):
			colors[image.get_pixel(x, y).to_rgba32()] = true
	return colors.size()

func capture_runtime() -> void:
	var output := output_directory()
	if DirAccess.make_dir_recursive_absolute(output) != OK:
		push_error("Could not create runtime QA directory: %s" % output)
		finish_capture(2)
		return
	get_root().size = VIEWPORT_SIZE
	get_root().content_scale_size = VIEWPORT_SIZE
	var restaurant_view := RestaurantFloor.new()
	restaurant_view.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	restaurant_view.size = Vector2(VIEWPORT_SIZE)
	restaurant_view.cell_pixels = 40.0
	restaurant_view.camera_offset = Vector2(900, 70)
	get_root().add_child(restaurant_view)
	var layout := {
		"width": 30,
		"height": 23,
		"cells": make_cells(30, 23),
		"walls": make_walls(30, 23),
		"objects": make_objects(0),
	}
	restaurant_view.set_content({"furniture": DEFINITIONS})
	restaurant_view.set_snapshot({
		"layout": layout,
		"incidents": [{"id": "qa-spill", "x": 18.5, "y": 13.5, "severity": 2}],
		"parties": [{"id": "qa-party-a", "patience": 30}, {"id": "qa-party-b", "patience": 78}],
		"presences": [
			{"characterId": "qa-owner", "name": "Owner", "x": 12.5, "y": 10.5, "directionX": 1, "directionY": 0, "primaryColor": "#2f684f", "secondaryColor": "#d6a84b"},
			{"characterId": "qa-server", "name": "Server", "x": 19.5, "y": 17.5, "directionX": 0, "directionY": -1, "primaryColor": "#4b678c", "secondaryColor": "#d87554"},
		],
	})
	var captures: Array = []
	for rotation in ROTATIONS:
		var objects := make_objects(rotation)
		layout.objects = objects
		restaurant_view.set_layout(layout)
		var fixture_failure := mounted_fixture_failure(restaurant_view, objects)
		if not fixture_failure.is_empty():
			push_error("Runtime QA mounted fixture failed for rotation %d: %s" % [rotation, fixture_failure])
			finish_capture(7)
			return
		restaurant_view.queue_redraw()
		print("RRO_RUNTIME_CAPTURE_WAIT rotation=%d" % rotation)
		# Readback is only safe after the renderer has completed the queued frame.
		# force_draw() can block indefinitely with a headless display driver.
		await RenderingServer.frame_post_draw
		var image := get_root().get_texture().get_image()
		var colors := sampled_color_count(image)
		if image.is_empty() or image.get_size() != VIEWPORT_SIZE or colors < 16:
			push_error("Runtime QA capture failed for rotation %d: size=%s sampledColors=%d" % [rotation, image.get_size(), colors])
			finish_capture(3)
			return
		var direction: String = DIRECTION_NAMES[rotation]
		var path := output.path_join("restaurant-%s.png" % direction)
		if image.save_png(path) != OK:
			push_error("Could not save runtime QA capture: %s" % path)
			finish_capture(4)
			return
		print("RRO_RUNTIME_CAPTURE_SAVED rotation=%d path=%s" % [rotation, path])
		captures.append({"direction": direction, "rotation": rotation, "path": path.get_file(), "sha256": FileAccess.get_sha256(path), "sampledColors": colors, "mountedPlacements": mounted_placement_records(objects)})
	var manifest_path := output.path_join("qa.json")
	var manifest := {
		"schemaVersion": 1,
		"fixture": "%d source-accepted directional identities (%d floor and %d mounted) plus walls, openings, incidents, parties, and avatars" % [DEFINITIONS.size(), FLOOR_POSITIONS.size(), MOUNTED_ASSET_IDS.size()],
		"viewport": [VIEWPORT_SIZE.x, VIEWPORT_SIZE.y],
		"acceptedAssetIds": FurnitureArtBinding.contract().acceptedDirectionalAssetIds,
		"runtimeCompositeAcceptedAssetIds": FurnitureArtBinding.contract().runtimeCompositeAcceptedAssetIds,
		"runtimeCompositeBlockedAssetIds": FurnitureArtBinding.contract().runtimeCompositeBlockedAssetIds,
		"runtimeCompositePendingAssetIds": FurnitureArtBinding.contract().runtimeCompositePendingAssetIds,
		"captures": captures,
		"productionComplete": false,
		"remainingGate": "Human visual acceptance of these exact native Godot captures and durable repository preservation.",
	}
	var file := FileAccess.open(manifest_path, FileAccess.WRITE)
	if file == null:
		push_error("Could not write runtime QA manifest: %s" % manifest_path)
		finish_capture(5)
		return
	file.store_string(JSON.stringify(manifest, "\t") + "\n")
	file.close()
	print("RRO_ISOMETRIC_RUNTIME_QA ", JSON.stringify(manifest))
	finish_capture(0)
