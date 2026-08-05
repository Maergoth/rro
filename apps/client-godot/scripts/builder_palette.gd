class_name BuilderPalette
extends VBoxContainer

signal tool_selected(tool: String, catalog_id: String)
signal expand_requested(add_width: int, add_height: int)
signal sell_selected_requested
signal repair_selected_requested
signal undo_requested
signal redo_requested

var content: Dictionary = {}
var category_tabs: TabContainer
var rotation_label: Label
var selected_label: Label
var undo_button: Button
var redo_button: Button

func _ready() -> void:
	add_theme_constant_override("separation", 8)
	var title := Label.new()
	title.text = "MODULAR RESTAURANT STUDIO"
	title.add_theme_font_size_override("font_size", 19)
	title.add_theme_color_override("font_color", Color("efbc54"))
	add_child(title)
	var instructions := Label.new()
	instructions.text = "Left-drag flooring and objects. Right-click or R rotates. Middle-drag pans. Every purchase is server-priced and collision-checked."
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
	var history_actions := HBoxContainer.new()
	undo_button = Button.new(); undo_button.text = "Undo"; undo_button.disabled = true; undo_button.pressed.connect(func() -> void: undo_requested.emit()); history_actions.add_child(undo_button)
	redo_button = Button.new(); redo_button.text = "Redo"; redo_button.disabled = true; redo_button.pressed.connect(func() -> void: redo_requested.emit()); history_actions.add_child(redo_button)
	add_child(history_actions)
	if not content.is_empty(): rebuild()

func set_content(value: Dictionary) -> void:
	content = value
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
			var modifier_text := ""
			for key in item.get("stats", {}).keys(): modifier_text += "%s %+d  " % [key, int(item.stats[key])]
			add_catalog_button(catalog, "%s\n$%.2f  ·  %s  ·  %s" % [item_name, float(item.get("costCents", 0))/100.0, str(item.get("tier", item.get("style", "standard"))).capitalize(), modifier_text], select_catalog.bind("object", item_id, "%s · right-click to rotate" % item_name))

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
	selected_label.text = "Selected: %s · %s · %.1f%% wear\nDrag to move · right-click to rotate" % [object.get("definitionId", "object"), str(object.get("state", "operational")).capitalize(), float(object.get("wear", 0))]

func set_history_state(history: Dictionary) -> void:
	if not is_instance_valid(undo_button) or not is_instance_valid(redo_button): return
	undo_button.disabled = not bool(history.get("canUndo", false))
	redo_button.disabled = not bool(history.get("canRedo", false))
	undo_button.text = "Undo %s" % str(history.get("undoAction", "")).capitalize() if not undo_button.disabled else "Undo"
	redo_button.text = "Redo %s" % str(history.get("redoAction", "")).capitalize() if not redo_button.disabled else "Redo"
