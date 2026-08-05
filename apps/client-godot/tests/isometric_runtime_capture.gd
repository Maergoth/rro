extends SceneTree

const OUTPUT_ARGUMENT := "--output-dir="
const VIEWPORT_SIZE := Vector2i(1800, 1100)
const WATCHDOG_SECONDS := 45.0
const ROTATIONS := [0, 90, 180, 270]
const DIRECTION_NAMES := {0: "north", 90: "east", 180: "south", 270: "west"}

var capture_finished := false

const DEFINITIONS := [
	{"id": "banquette", "assetId": "banquette", "name": "Deep Teal Banquette", "category": "Dining", "width": 5, "height": 2},
	{"id": "booth", "assetId": "booth", "name": "Tomato Vinyl Booth", "category": "Dining", "width": 4, "height": 2},
	{"id": "dish-machine", "assetId": "dish-machine", "name": "High-Temp Dish Machine", "category": "Utility", "width": 3, "height": 2},
	{"id": "espresso", "assetId": "espresso", "name": "Espresso Machine", "category": "Service", "width": 2, "height": 1},
	{"id": "banquette-section", "assetId": "furniture-banquette-section", "name": "Upholstered Banquette", "category": "Dining", "width": 4, "height": 2},
	{"id": "commercial-chair", "assetId": "furniture-commercial-chair", "name": "Commercial Dining Chair", "category": "Dining", "width": 1, "height": 1},
	{"id": "host-stand-pro", "assetId": "furniture-host-stand-pro", "name": "Reservation Host Stand", "category": "Service", "width": 2, "height": 2},
	{"id": "oak-two-top", "assetId": "furniture-oak-two-top", "name": "Oak Two-Top", "category": "Dining", "width": 2, "height": 2},
	{"id": "pos-terminal", "assetId": "furniture-pos-terminal", "name": "Commercial POS Terminal", "category": "Service", "width": 1, "height": 1},
	{"id": "premium-chair", "assetId": "furniture-premium-chair", "name": "Premium Dining Chair", "category": "Dining", "width": 1, "height": 1},
	{"id": "server-station-pro", "assetId": "furniture-server-station-pro", "name": "Integrated Server Station", "category": "Service", "width": 3, "height": 2},
	{"id": "six-burner-range", "assetId": "furniture-six-burner-range", "name": "Six-Burner Range", "category": "Kitchen", "width": 4, "height": 3},
	{"id": "walnut-four-top", "assetId": "furniture-walnut-four-top", "name": "Walnut Four-Top", "category": "Dining", "width": 3, "height": 3},
	{"id": "host-stand", "assetId": "host-stand", "name": "Host Stand", "category": "Service", "width": 2, "height": 1},
	{"id": "local-art", "assetId": "local-art", "name": "Local Print Set", "category": "Decor", "width": 2, "height": 1},
	{"id": "mop-sink", "assetId": "mop-sink", "name": "Utility Sink", "category": "Utility", "width": 2, "height": 2},
	{"id": "pass", "assetId": "pass", "name": "Heated Pass", "category": "Kitchen", "width": 3, "height": 1},
	{"id": "pendants", "assetId": "pendants", "name": "Mustard Pendant Lights", "category": "Decor", "width": 2, "height": 1},
	{"id": "plants", "assetId": "plants", "name": "Window Herb Wall", "category": "Decor", "width": 3, "height": 1},
	{"id": "prep", "assetId": "prep", "name": "Cold Prep Table", "category": "Kitchen", "width": 3, "height": 1},
	{"id": "range", "assetId": "range", "name": "Six-Burner Range", "category": "Kitchen", "width": 3, "height": 2},
	{"id": "recycling", "assetId": "recycling", "name": "Sorting Station", "category": "Utility", "width": 2, "height": 1},
	{"id": "service-station", "assetId": "service-station", "name": "Service Station", "category": "Service", "width": 2, "height": 2},
	{"id": "table-four", "assetId": "table-four", "name": "Oak Four-Top", "category": "Dining", "width": 3, "height": 2},
	{"id": "table-two", "assetId": "table-two", "name": "Walnut Two-Top", "category": "Dining", "width": 2, "height": 2},
]

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

func make_objects() -> Array:
	var positions := [
		Vector2i(2, 2), Vector2i(9, 2), Vector2i(15, 2), Vector2i(21, 2),
		Vector2i(4, 6), Vector2i(10, 6), Vector2i(16, 6), Vector2i(22, 6),
		Vector2i(2, 12), Vector2i(8, 12), Vector2i(14, 12), Vector2i(20, 12),
		Vector2i(5, 16), Vector2i(11, 16), Vector2i(17, 16), Vector2i(23, 16),
		Vector2i(8, 20), Vector2i(15, 20), Vector2i(22, 20), Vector2i(2, 20),
		Vector2i(1, 16), Vector2i(25, 12),
		Vector2i(26, 2), Vector2i(26, 6), Vector2i(27, 16),
	]
	var objects: Array = []
	for index in range(DEFINITIONS.size()):
		var definition: Dictionary = DEFINITIONS[index]
		var position: Vector2i = positions[index]
		objects.append({
			"id": "qa-%s" % str(definition.assetId),
			"definitionId": definition.id,
			"x": position.x,
			"y": position.y,
			"rotation": 0,
			"state": "worn" if index == 2 else ("broken" if index == 9 else "operational"),
			"wear": 42 if index == 2 else (100 if index == 9 else 0),
		})
	return objects

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
		"objects": make_objects(),
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
		var objects: Array = layout.objects
		for object in objects:
			object.rotation = rotation
		layout.objects = objects
		restaurant_view.set_layout(layout)
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
		captures.append({"direction": direction, "rotation": rotation, "path": path.get_file(), "sha256": FileAccess.get_sha256(path), "sampledColors": colors})
	var manifest_path := output.path_join("qa.json")
	var manifest := {
		"schemaVersion": 1,
		"fixture": "accepted directional furniture plus walls, openings, incidents, parties, and avatars",
		"viewport": [VIEWPORT_SIZE.x, VIEWPORT_SIZE.y],
		"acceptedAssetIds": FurnitureArtBinding.contract().acceptedDirectionalAssetIds,
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
