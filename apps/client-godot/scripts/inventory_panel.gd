class_name InventoryPanel
extends Control

signal action_requested(action: String, payload: Dictionary)

var catalog: Dictionary = {}
var inventory_state: Dictionary = {}
var selected_role_id := ""
var role_option: OptionButton
var owned_only: CheckButton
var loadout_box: VBoxContainer
var item_grid: GridContainer

func set_data(catalog_data: Dictionary, state_data: Dictionary, preferred_role_id: String) -> void:
	catalog = catalog_data
	inventory_state = state_data
	if not preferred_role_id.is_empty(): selected_role_id = preferred_role_id
	build_interface()

func build_interface() -> void:
	for child in get_children():
		remove_child(child)
		child.queue_free()
	var root := VBoxContainer.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_theme_constant_override("separation", 12)
	add_child(root)

	var toolbar := HBoxContainer.new()
	root.add_child(toolbar)
	var role_label := Label.new()
	role_label.text = "ROLE LOADOUT"
	role_label.add_theme_color_override("font_color", Color("7fd0b2"))
	toolbar.add_child(role_label)
	role_option = OptionButton.new()
	role_option.custom_minimum_size.x = 260
	var role_ids: Array = catalog.get("roleSlots", {}).keys()
	role_ids.sort()
	for role_id_value in role_ids:
		var role_id := str(role_id_value)
		role_option.add_item(role_label_for(role_id))
		role_option.set_item_metadata(role_option.item_count - 1, role_id)
		if role_id == selected_role_id: role_option.select(role_option.item_count - 1)
	if role_option.item_count > 0 and selected_role_id.is_empty():
		selected_role_id = str(role_option.get_item_metadata(0))
	role_option.item_selected.connect(on_role_selected)
	toolbar.add_child(role_option)
	var balance := Label.new()
	balance.text = "Personal cash  $%.2f" % (float(inventory_state.get("cashCents", 0)) / 100.0)
	balance.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	balance.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	balance.add_theme_color_override("font_color", Color("efbc54"))
	toolbar.add_child(balance)
	owned_only = CheckButton.new()
	owned_only.text = "Owned only"
	owned_only.toggled.connect(on_owned_filter_toggled)
	toolbar.add_child(owned_only)

	var split := HSplitContainer.new()
	split.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root.add_child(split)
	var loadout_panel := PanelContainer.new()
	loadout_panel.custom_minimum_size.x = 420
	split.add_child(loadout_panel)
	loadout_box = VBoxContainer.new()
	loadout_box.add_theme_constant_override("separation", 10)
	loadout_panel.add_child(loadout_box)

	var catalog_panel := PanelContainer.new()
	split.add_child(catalog_panel)
	var catalog_box := VBoxContainer.new()
	catalog_panel.add_child(catalog_box)
	var catalog_heading := Label.new()
	catalog_heading.text = "ROLE SHOP & INVENTORY"
	catalog_heading.add_theme_font_size_override("font_size", 20)
	catalog_heading.add_theme_color_override("font_color", Color("efbc54"))
	catalog_box.add_child(catalog_heading)
	var hint := Label.new()
	hint.text = "Tools are persistent character equipment. Consumables are purchased in stacks and spent deliberately. Prices buy options and tradeoffs—not a single best ladder."
	hint.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	hint.add_theme_color_override("font_color", Color("8fa1a1"))
	catalog_box.add_child(hint)
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	catalog_box.add_child(scroll)
	item_grid = GridContainer.new()
	item_grid.columns = 2
	item_grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	item_grid.add_theme_constant_override("h_separation", 10)
	item_grid.add_theme_constant_override("v_separation", 10)
	scroll.add_child(item_grid)
	render_role()

func on_role_selected(index: int) -> void:
	selected_role_id = str(role_option.get_item_metadata(index))
	render_role()

func on_owned_filter_toggled(_enabled: bool) -> void:
	render_items()

func render_role() -> void:
	if not is_instance_valid(loadout_box) or not is_instance_valid(item_grid): return
	for child in loadout_box.get_children(): child.queue_free()
	var title := Label.new()
	title.text = role_label_for(selected_role_id)
	title.add_theme_font_size_override("font_size", 23)
	title.add_theme_color_override("font_color", Color("efbc54"))
	loadout_box.add_child(title)
	var progress := role_level(selected_role_id)
	var level := Label.new()
	level.text = "Role level %d  ·  four persistent equipment slots" % progress
	level.add_theme_color_override("font_color", Color("80ceb2"))
	loadout_box.add_child(level)
	loadout_box.add_child(HSeparator.new())
	for slot_id_value in catalog.get("roleSlots", {}).get(selected_role_id, []):
		add_loadout_slot(str(slot_id_value))
	var modifiers := combined_modifiers()
	loadout_box.add_child(HSeparator.new())
	var mod_title := Label.new()
	mod_title.text = "EQUIPPED EFFECTS"
	mod_title.add_theme_color_override("font_color", Color("7fd0b2"))
	loadout_box.add_child(mod_title)
	if modifiers.is_empty():
		var empty := Label.new()
		empty.text = "No equipment bonuses yet."
		empty.add_theme_color_override("font_color", Color("687b7d"))
		loadout_box.add_child(empty)
	else:
		var parts: Array[String] = []
		for key in modifiers.keys():
			var value := int(modifiers[key])
			parts.append("%s %s%d" % [str(key).capitalize(), "+" if value >= 0 else "", value])
		var effects := Label.new()
		effects.text = "  ·  ".join(parts)
		effects.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		loadout_box.add_child(effects)
	render_items()

func render_items() -> void:
	if not is_instance_valid(item_grid): return
	for child in item_grid.get_children(): child.queue_free()
	var shown := 0
	for item_value in catalog.get("items", []):
		var item: Dictionary = item_value
		if not selected_role_id in item.get("allowedRoleIds", []): continue
		if is_instance_valid(owned_only) and owned_only.button_pressed and int(item.get("ownedQuantity", 0)) <= 0: continue
		add_item_card(item)
		shown += 1
	if shown == 0:
		var empty := Label.new()
		empty.text = "No matching items."
		empty.add_theme_color_override("font_color", Color("687b7d"))
		item_grid.add_child(empty)

func add_loadout_slot(slot_id: String) -> void:
	var panel := PanelContainer.new()
	panel.custom_minimum_size.y = 96
	loadout_box.add_child(panel)
	var row := HBoxContainer.new()
	panel.add_child(row)
	var equipped_id := equipped_item_id(slot_id)
	var item := item_by_id(equipped_id)
	row.add_child(make_icon(item if not item.is_empty() else {"id": slot_id, "category": "empty"}))
	var info := VBoxContainer.new()
	info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(info)
	var slot := Label.new()
	slot.text = slot_label(slot_id).to_upper()
	slot.add_theme_font_size_override("font_size", 11)
	slot.add_theme_color_override("font_color", Color("819193"))
	info.add_child(slot)
	var item_name := Label.new()
	item_name.text = str(item.get("name", "Empty slot"))
	item_name.add_theme_font_size_override("font_size", 17)
	item_name.add_theme_color_override("font_color", Color("f1ecda") if not item.is_empty() else Color("687b7d"))
	info.add_child(item_name)
	if not item.is_empty():
		var remove := Button.new()
		remove.text = "Unequip"
		remove.set_meta("role_id", selected_role_id)
		remove.set_meta("slot_id", slot_id)
		remove.pressed.connect(on_unequip_pressed.bind(remove))
		row.add_child(remove)

func add_item_card(item: Dictionary) -> void:
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(430, 218)
	item_grid.add_child(panel)
	var card := VBoxContainer.new()
	panel.add_child(card)
	var top := HBoxContainer.new()
	card.add_child(top)
	top.add_child(make_icon(item))
	var title_box := VBoxContainer.new()
	title_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top.add_child(title_box)
	var title := Label.new()
	title.text = str(item.get("name", "Item"))
	title.add_theme_font_size_override("font_size", 17)
	title.add_theme_color_override("font_color", Color("f1ecda"))
	title_box.add_child(title)
	var meta := Label.new()
	meta.text = "%s  ·  %s  ·  LV %d" % [str(item.get("qualityTier", "basic")).capitalize(), str(item.get("kind", "equipment")).capitalize(), int(item.get("requiredRoleLevel", 1))]
	meta.add_theme_font_size_override("font_size", 11)
	meta.add_theme_color_override("font_color", tier_color(str(item.get("qualityTier", "basic"))))
	title_box.add_child(meta)
	var owned := Label.new()
	owned.text = "Owned %d" % int(item.get("ownedQuantity", 0))
	owned.add_theme_color_override("font_color", Color("80ceb2"))
	top.add_child(owned)
	var description := Label.new()
	description.text = str(item.get("description", ""))
	description.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	description.add_theme_font_size_override("font_size", 12)
	description.add_theme_color_override("font_color", Color("9eacab"))
	card.add_child(description)
	var stats: Array[String] = []
	for key in item.get("modifiers", {}).keys():
		var value := int(item.get("modifiers", {})[key])
		stats.append("%s %s%d" % [str(key).capitalize(), "+" if value >= 0 else "", value])
	for key in item.get("useEffects", {}).keys():
		stats.append("%s %s" % [str(key).capitalize(), str(item.get("useEffects", {})[key])])
	var stats_label := Label.new()
	stats_label.text = "  ·  ".join(stats)
	stats_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	stats_label.add_theme_font_size_override("font_size", 11)
	stats_label.add_theme_color_override("font_color", Color("d5c58f"))
	card.add_child(stats_label)
	var buttons := HBoxContainer.new()
	card.add_child(buttons)
	var buy := Button.new()
	buy.text = "Buy  $%.2f" % (float(item.get("priceCents", 0)) / 100.0)
	buy.disabled = role_level(selected_role_id) < int(item.get("requiredRoleLevel", 1)) or int(item.get("ownedQuantity", 0)) >= int(item.get("stackLimit", 1))
	buy.set_meta("item_id", str(item.get("id", "")))
	buy.set_meta("role_id", selected_role_id)
	buy.pressed.connect(on_purchase_pressed.bind(buy))
	buttons.add_child(buy)
	if int(item.get("ownedQuantity", 0)) > 0 and str(item.get("kind", "")) == "equipment":
		var compatible_slot := first_empty_compatible_slot(item)
		var equip := Button.new()
		equip.text = "Equip" if not compatible_slot.is_empty() else "Slots full"
		equip.disabled = compatible_slot.is_empty() or role_level(selected_role_id) < int(item.get("requiredRoleLevel", 1))
		equip.set_meta("item_id", str(item.get("id", "")))
		equip.set_meta("role_id", selected_role_id)
		equip.set_meta("slot_id", compatible_slot)
		equip.pressed.connect(on_equip_pressed.bind(equip))
		buttons.add_child(equip)
	elif int(item.get("ownedQuantity", 0)) > 0 and str(item.get("kind", "")) == "consumable":
		var use := Button.new()
		use.text = "Use one"
		use.set_meta("item_id", str(item.get("id", "")))
		use.set_meta("role_id", selected_role_id)
		use.pressed.connect(on_use_pressed.bind(use))
		buttons.add_child(use)

func make_icon(item: Dictionary) -> Control:
	var icon_id := str(item.get("iconId", item.get("id", "item")))
	var file_name := icon_id.replace(".", "-").replace("/", "-")
	var path := "res://assets/items/%s.png" % file_name
	if ResourceLoader.exists(path):
		var texture_rect := TextureRect.new()
		texture_rect.custom_minimum_size = Vector2(66, 66)
		texture_rect.texture = load(path) as Texture2D
		texture_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		texture_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		return texture_rect
	var badge := PanelContainer.new()
	badge.custom_minimum_size = Vector2(66, 66)
	var style := StyleBoxFlat.new()
	var hue := float(absi(icon_id.hash()) % 1000) / 1000.0
	style.bg_color = Color.from_hsv(hue, .42, .36)
	style.border_color = Color.from_hsv(hue, .35, .72)
	style.set_border_width_all(2)
	style.set_corner_radius_all(9)
	badge.add_theme_stylebox_override("panel", style)
	var glyph := Label.new()
	glyph.text = initials(str(item.get("name", "Empty")))
	glyph.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	glyph.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	glyph.add_theme_font_size_override("font_size", 19)
	glyph.add_theme_color_override("font_color", Color("f6efd9"))
	badge.add_child(glyph)
	return badge

func initials(value: String) -> String:
	var result := ""
	for word in value.split(" "):
		if not word.is_empty(): result += word.left(1).to_upper()
		if result.length() == 2: break
	return result if not result.is_empty() else "?"

func role_label_for(role_id: String) -> String:
	return role_id.replace("-", " ").capitalize()

func role_level(role_id: String) -> int:
	for progress_value in catalog.get("roleProgress", []):
		var progress: Dictionary = progress_value
		if str(progress.get("roleId", "")) == role_id: return int(progress.get("level", 1))
	return 1

func item_by_id(item_id: String) -> Dictionary:
	for item_value in catalog.get("items", []):
		var item: Dictionary = item_value
		if str(item.get("id", "")) == item_id: return item
	return {}

func equipped_item_id(slot_id: String) -> String:
	for loadout_value in inventory_state.get("loadouts", []):
		var loadout: Dictionary = loadout_value
		if str(loadout.get("roleId", "")) == selected_role_id and str(loadout.get("slotId", "")) == slot_id:
			return str(loadout.get("itemId", ""))
	return ""

func first_empty_compatible_slot(item: Dictionary) -> String:
	for slot_id_value in item.get("equipSlots", []):
		var slot_id := str(slot_id_value)
		if slot_id in catalog.get("roleSlots", {}).get(selected_role_id, []) and equipped_item_id(slot_id).is_empty(): return slot_id
	return ""

func slot_label(slot_id: String) -> String:
	for slot_value in catalog.get("slots", []):
		var slot: Dictionary = slot_value
		if str(slot.get("id", "")) == slot_id: return str(slot.get("label", slot_id))
	return slot_id.replace("-", " ").capitalize()

func combined_modifiers() -> Dictionary:
	var result: Dictionary = {}
	for loadout_value in inventory_state.get("loadouts", []):
		var loadout: Dictionary = loadout_value
		if str(loadout.get("roleId", "")) != selected_role_id: continue
		var item := item_by_id(str(loadout.get("itemId", "")))
		for key in item.get("modifiers", {}).keys(): result[key] = int(result.get(key, 0)) + int(item.get("modifiers", {})[key])
	return result

func tier_color(tier: String) -> Color:
	match tier:
		"premium": return Color("efbc54")
		"professional": return Color("80ceb2")
		_: return Color("9eacab")

func on_purchase_pressed(button: Button) -> void:
	action_requested.emit("purchase", {"itemId": button.get_meta("item_id"), "roleId": button.get_meta("role_id"), "quantity": 1})

func on_equip_pressed(button: Button) -> void:
	action_requested.emit("equip", {"itemId": button.get_meta("item_id"), "roleId": button.get_meta("role_id"), "slotId": button.get_meta("slot_id")})

func on_unequip_pressed(button: Button) -> void:
	action_requested.emit("unequip", {"roleId": button.get_meta("role_id"), "slotId": button.get_meta("slot_id")})

func on_use_pressed(button: Button) -> void:
	action_requested.emit("use", {"itemId": button.get_meta("item_id"), "roleId": button.get_meta("role_id"), "quantity": 1})
