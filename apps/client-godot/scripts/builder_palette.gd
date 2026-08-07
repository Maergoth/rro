class_name BuilderPalette
extends VBoxContainer

signal tool_selected(tool: String, catalog_id: String)
signal expand_requested(add_width: int, add_height: int)
signal sell_selected_requested
signal repair_selected_requested
signal undo_requested
signal redo_requested
signal commit_staged_requested
signal cancel_staged_requested

var content: Dictionary = {}
var room_tags: Array = []
var category_tabs: TabContainer
var rotation_label: Label
var selected_label: Label
var undo_button: Button
var redo_button: Button
var validation_label: Label
var staged_label: Label
var commit_button: Button
var cancel_button: Button
var latest_history: Dictionary = {}
var staged_count := 0
var staged_commit_in_flight := false

func _ready() -> void:
	add_theme_constant_override("separation", 8)
	var title := Label.new()
	title.text = "MODULAR RESTAURANT STUDIO"
	title.add_theme_font_size_override("font_size", 19)
	title.add_theme_color_override("font_color", Color("efbc54"))
	add_child(title)
	var instructions := Label.new()
	instructions.text = "Left-drag flooring or room tags. Wall decor snaps to the pointed cell edge; ceiling fixtures use their grid footprint. Changes stay staged until Commit; Cancel or Escape restores the authoritative layout without spending."
	instructions.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	instructions.add_theme_color_override("font_color", Color("95a6a6"))
	instructions.custom_minimum_size = Vector2(310, 66)
	add_child(instructions)
	var select_button := Button.new()
	select_button.text = "Pointer / drag placed object"
	select_button.pressed.connect(func() -> void: tool_selected.emit("select", ""))
	add_child(select_button)
	category_tabs = TabContainer.new()
	category_tabs.custom_minimum_size = Vector2(330, 410)
	category_tabs.size_flags_vertical = Control.SIZE_EXPAND_FILL
	add_child(category_tabs)
	selected_label = Label.new()
	selected_label.text = "Nothing selected"
	selected_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	add_child(selected_label)
	var actions := HBoxContainer.new()
	var repair := Button.new(); repair.text = "Repair selected"; repair.pressed.connect(func() -> void: repair_selected_requested.emit()); actions.add_child(repair)
	var sell := Button.new(); sell.text = "Sell selected (40%)"; sell.pressed.connect(func() -> void: sell_selected_requested.emit()); actions.add_child(sell)
	var expand := Button.new(); expand.text = "Add 4×4 area"; expand.pressed.connect(func() -> void: expand_requested.emit(4, 4)); actions.add_child(expand)
	add_child(actions)
	var staged_actions := HBoxContainer.new()
	staged_label = Label.new(); staged_label.text = "No staged edits"; staged_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL; staged_actions.add_child(staged_label)
	commit_button = Button.new(); commit_button.text = "Commit"; commit_button.disabled = true; commit_button.pressed.connect(func() -> void: commit_staged_requested.emit()); staged_actions.add_child(commit_button)
	cancel_button = Button.new(); cancel_button.text = "Cancel"; cancel_button.disabled = true; cancel_button.pressed.connect(func() -> void: cancel_staged_requested.emit()); staged_actions.add_child(cancel_button)
	add_child(staged_actions)
	var history_actions := HBoxContainer.new()
	undo_button = Button.new(); undo_button.text = "Undo"; undo_button.disabled = true; undo_button.pressed.connect(func() -> void: undo_requested.emit()); history_actions.add_child(undo_button)
	redo_button = Button.new(); redo_button.text = "Redo"; redo_button.disabled = true; redo_button.pressed.connect(func() -> void: redo_requested.emit()); history_actions.add_child(redo_button)
	add_child(history_actions)
	validation_label = Label.new(); validation_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART; validation_label.text = "Checking service readiness…"; add_child(validation_label)
	if not content.is_empty(): rebuild()

func set_content(value: Dictionary) -> void:
	content = value
	if not is_node_ready(): return
	rebuild()

func set_room_tags(value: Array) -> void:
	room_tags = value.duplicate(true)
	if not is_node_ready(): return
	rebuild()

func rebuild() -> void:
	for child in category_tabs.get_children(): child.queue_free()
	var floors := make_catalog("Floor tiles")
	for surface in content.get("construction", {}).get("surfaces", []):
		var surface_id := str(surface.get("id", ""))
		var surface_label := str(surface.get("label", "Floor"))
		var stats: Dictionary = surface.get("stats", {})
		add_catalog_button(floors, "%s\n$%.2f/cell  ·  sanitation %+d  ·  ambience %+d" % [surface_label, float(surface.get("costCents", 0))/100.0, int(stats.get("sanitation", 0)), int(stats.get("ambience", 0))], select_catalog.bind("floor", surface_id, "%s floor brush" % surface_label))
	var rooms := make_catalog("Room tags")
	for room in room_tags:
		var room_id := str(room.get("id", ""))
		var room_label := str(room.get("label", room_id.capitalize()))
		add_catalog_button(rooms, "%s\nOperational zone · no construction cost" % room_label, select_catalog.bind("room-tag", room_id, "%s room-tag brush" % room_label))
	var walls := make_catalog("Walls & doors")
	for wall in content.get("construction", {}).get("wallStyles", []):
		var wall_id := str(wall.get("id", ""))
		var wall_label := str(wall.get("label", "Wall"))
		add_catalog_button(walls, "%s wall\n$%.2f/edge  ·  snaps to the nearest cell edge" % [wall_label, float(wall.get("costCents", 0))/100.0], select_catalog.bind("wall", wall_id, "%s wall edge" % wall_label))
	add_catalog_button(walls, "Service door opening\nUses painted plaster edge price", select_catalog.bind("door", "painted-plaster", "Service door · click a cell edge"))
	add_catalog_button(walls, "Dining arch opening\nUses painted plaster edge price", select_catalog.bind("arch", "painted-plaster", "Dining arch · click a cell edge"))
	var by_category := {}
	for item in content.get("furniture", []):
		var category := str(item.get("category", "Other"))
		if not by_category.has(category): by_category[category] = []
		by_category[category].append(item)
	for category in by_category.keys():
		var catalog := make_catalog(str(category))
		for item in by_category[category]:
			var item_id := str(item.get("id", ""))
			var item_name := str(item.get("name", "Object"))
			var placement: Dictionary = item.get("placement", {})
			var mount := str(placement.get("mount", "floor"))
			var modifier_text := ""
			for key in item.get("stats", {}).keys(): modifier_text += "%s %+d  " % [key, int(item.stats[key])]
			var mount_hint := "snaps to the pointed wall edge" if mount == "wall" else ("ceiling footprint · right-click to rotate" if mount == "ceiling" else "right-click to rotate")
			var catalog_detail := "%s mount" % mount if mount != "floor" else str(item.get("tier", item.get("style", "standard"))).capitalize()
			add_catalog_button(catalog, "%s\n$%.2f  ·  %s  ·  %s" % [item_name, float(item.get("costCents", 0))/100.0, catalog_detail, modifier_text], select_catalog.bind("object", item_id, "%s · %s" % [item_name, mount_hint]))

func select_catalog(tool: String, catalog_id: String, label: String) -> void:
	selected_label.text = label
	tool_selected.emit(tool, catalog_id)

func make_catalog(label: String) -> VBoxContainer:
	var scroll := ScrollContainer.new()
	scroll.name = label
	var box := VBoxContainer.new()
	box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(box)
	category_tabs.add_child(scroll)
	return box

func add_catalog_button(parent: VBoxContainer, text: String, callback: Callable) -> void:
	var button := Button.new()
	button.text = text
	button.alignment = HORIZONTAL_ALIGNMENT_LEFT
	button.custom_minimum_size = Vector2(305, 54)
	button.pressed.connect(callback)
	parent.add_child(button)

func set_selected_object(object: Dictionary) -> void:
	var definition_id := str(object.get("definitionId", "object"))
	var mount := "floor"
	for definition in content.get("furniture", []):
		if str(definition.get("id", "")) == definition_id:
			var placement: Dictionary = definition.get("placement", {})
			mount = str(placement.get("mount", "floor"))
			break
	var move_hint := "Drag across a cell edge to re-snap" if mount == "wall" else "Drag to move · right-click to rotate"
	selected_label.text = "Selected: %s · %s · %.1f%% wear\n%s" % [definition_id, str(object.get("state", "operational")).capitalize(), float(object.get("wear", 0)), move_hint]

func set_history_state(history: Dictionary) -> void:
	latest_history = history.duplicate(true)
	if not is_instance_valid(undo_button) or not is_instance_valid(redo_button): return
	undo_button.disabled = staged_count > 0 or not bool(history.get("canUndo", false))
	redo_button.disabled = staged_count > 0 or not bool(history.get("canRedo", false))
	undo_button.text = "Undo %s" % str(history.get("undoAction", "")).capitalize() if not undo_button.disabled else "Undo"
	redo_button.text = "Redo %s" % str(history.get("redoAction", "")).capitalize() if not redo_button.disabled else "Redo"

func set_staged_state(count: int, commit_in_flight := false) -> void:
	staged_count = maxi(0, count)
	staged_commit_in_flight = commit_in_flight
	if is_instance_valid(staged_label):
		staged_label.text = "Committing %d edits…" % staged_count if staged_commit_in_flight else ("%d staged edit%s" % [staged_count, "" if staged_count == 1 else "s"] if staged_count > 0 else "No staged edits")
	if is_instance_valid(commit_button): commit_button.disabled = staged_count == 0 or staged_commit_in_flight
	if is_instance_valid(cancel_button): cancel_button.disabled = staged_count == 0 or staged_commit_in_flight
	set_history_state(latest_history)

func set_layout_validation(validation: Dictionary) -> void:
	if not is_instance_valid(validation_label): return
	var errors: Array = validation.get("errors", [])
	var warnings: Array = validation.get("warnings", [])
	var checks: Array = validation.get("operationalChecks", [])
	if bool(validation.get("openingReady", validation.get("validForService", false))):
		validation_label.text = "✓ Operational opening checklist passed · %d exits · %d/%d walkable cells reachable · %d checks" % [int(validation.get("usableExits", 0)), int(validation.get("reachableCells", 0)), int(validation.get("walkableCells", 0)), checks.size()]
		validation_label.add_theme_color_override("font_color", Color("7fd0b2"))
	else:
		var messages: Array[String] = []
		for issue in errors: messages.append(str(issue.get("message", "Layout error")))
		for issue in warnings: messages.append(str(issue.get("message", "Layout warning")))
		for check in checks:
			if not bool(check.get("passed", false)): messages.append("%s: %s" % [str(check.get("label", "Check")), str(check.get("detail", "Action required"))])
		validation_label.text = "⚠ Operational opening checklist\n" + "\n".join(messages)
		validation_label.add_theme_color_override("font_color", Color("ef8f83"))
