extends Control

const CLIENT_VERSION := "1.0.0-alpha.2"

var api: RroApiClient
var realtime: RroRealtimeClient
var store := RroSessionStore.new()
var bootstrap: Dictionary = {}
var current_shift_id := ""
var current_restaurant_id := ""
var current_role_id := ""
var presence_kind := ""
var latest_snapshot: Dictionary = {}
var current_floor: RestaurantFloor
var current_task_panel: TaskPanel
var current_builder: BuilderPalette
var current_inventory_panel: InventoryPanel
var pending_inventory_catalog: Dictionary = {}
var selected_builder_object: Dictionary = {}
var status_label: Label
var screen_root: Control
var shift_tasks_completed := 0
var shift_start_cash := 0
var shift_start_xp := 0
var debug_console: Control
var debug_log: RichTextLabel
var debug_visible := false

func _ready() -> void:
	get_window().title = "Rush & Revenue Online"
	api = RroApiClient.new()
	add_child(api)
	api.request_failed.connect(func(msg: String) -> void: show_status(msg); log_debug("[API] " + msg))
	realtime = RroRealtimeClient.new()
	add_child(realtime)
	realtime.snapshot_received.connect(on_realtime_snapshot)
	realtime.command_acknowledged.connect(on_command_ack)
	realtime.realtime_error.connect(func(msg: String) -> void: show_status(msg); log_debug("[WS] " + msg))
	realtime.shift_closed.connect(func(_id: String) -> void: show_status("The restaurant closed for the day."); leave_shift_ui())
	theme = make_theme()
	api.server_url = load_server_url()
	api.session_token = store.load_token()
	build_debug_console()
	log_debug("Client v%s started" % CLIENT_VERSION)
	log_debug("Server: %s" % api.server_url)
	try_connect()

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and event.keycode == KEY_F12:
		debug_visible = not debug_visible
		debug_console.visible = debug_visible
		get_viewport().set_input_as_handled()

func build_debug_console() -> void:
	debug_console = PanelContainer.new()
	debug_console.visible = false
	debug_console.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	debug_console.offset_top = -280
	debug_console.z_index = 100
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0, 0, 0, 0.88)
	style.set_border_width_all(1)
	style.border_color = Color("3d585c")
	debug_console.add_theme_stylebox_override("panel", style)
	debug_log = RichTextLabel.new()
	debug_log.bbcode_enabled = true
	debug_log.scroll_following = true
	debug_log.selection_enabled = true
	debug_log.add_theme_font_size_override("normal_font_size", 12)
	debug_console.add_child(debug_log)
	add_child(debug_console)

func log_debug(message: String) -> void:
	var timestamp := Time.get_time_string_from_system()
	var line := "[color=#7a8a8c]%s[/color]  %s" % [timestamp, message]
	if is_instance_valid(debug_log):
		debug_log.append_text(line + "\n")
	print(message)

func try_connect() -> void:
	log_debug("Checking server health...")
	var http := HTTPRequest.new()
	add_child(http)
	http.timeout = 3.0
	http.request_completed.connect(func(result: int, code: int, _headers: PackedStringArray, _body: PackedByteArray) -> void:
		http.queue_free()
		if result == HTTPRequest.RESULT_SUCCESS and code == 200:
			log_debug("[color=#75c5a7]Server online[/color] — protocol rro.v1")
			if api.session_token.is_empty():
				show_login()
			else:
				load_bootstrap()
		else:
			var err := "result=%d code=%d" % [result, code]
			log_debug("[color=#e68472]Server unreachable[/color] (%s)" % err)
			show_login()
			show_status("Server offline — start the server and try again")
	)
	http.request(api.server_url + "/health")

func load_server_url() -> String:
	# Check for server.cfg next to the executable (one line: host or host:port)
	var cfg_path := OS.get_executable_path().get_base_dir().path_join("server.cfg")
	if FileAccess.file_exists(cfg_path):
		var line := FileAccess.get_file_as_string(cfg_path).strip_edges()
		if not line.is_empty():
			if not line.begins_with("http"):
				line = "http://" + line
			if line.count(":") < 2:
				line = line + ":8788"
			return line
	# Check command-line --server=address
	for arg in OS.get_cmdline_args():
		if arg.begins_with("--server="):
			var addr := arg.substr(9).strip_edges()
			if not addr.begins_with("http"):
				addr = "http://" + addr
			if addr.count(":") < 2:
				addr = addr + ":8788"
			return addr
	return "http://127.0.0.1:8788"

func make_theme() -> Theme:
	var result := Theme.new()
	result.default_font_size = 14
	result.set_color("font_color", "Label", Color("e7e5d5"))
	result.set_color("font_color", "Button", Color("e7e5d5"))
	result.set_color("font_hover_color", "Button", Color("ffffff"))
	result.set_color("font_pressed_color", "Button", Color("182024"))
	result.set_color("font_color", "LineEdit", Color("f4f1df"))
	result.set_color("font_color", "OptionButton", Color("f4f1df"))
	result.set_color("font_color", "TabBar", Color("d5d7cb"))
	result.set_constant("outline_size", "Label", 0)
	result.set_constant("separation", "HBoxContainer", 9)
	result.set_constant("separation", "VBoxContainer", 9)
	var button := StyleBoxFlat.new(); button.bg_color = Color("203135"); button.border_color = Color("3d585c"); button.set_border_width_all(1); button.set_corner_radius_all(6); button.content_margin_left = 13; button.content_margin_right = 13; button.content_margin_top = 9; button.content_margin_bottom = 9
	var hover := button.duplicate(); hover.bg_color = Color("315056"); hover.border_color = Color("70b69e")
	var pressed := button.duplicate(); pressed.bg_color = Color("d7a94c"); pressed.border_color = Color("f2c96b")
	result.set_stylebox("normal", "Button", button); result.set_stylebox("hover", "Button", hover); result.set_stylebox("pressed", "Button", pressed); result.set_stylebox("focus", "Button", hover)
	var input := StyleBoxFlat.new(); input.bg_color = Color("111b1e"); input.border_color = Color("385156"); input.set_border_width_all(1); input.set_corner_radius_all(6); input.content_margin_left = 11; input.content_margin_right = 11; input.content_margin_top = 9; input.content_margin_bottom = 9
	result.set_stylebox("normal", "LineEdit", input); result.set_stylebox("focus", "LineEdit", hover)
	var panel := StyleBoxFlat.new(); panel.bg_color = Color("10191c"); panel.border_color = Color("293d41"); panel.set_border_width_all(1); panel.set_corner_radius_all(9); panel.content_margin_left = 14; panel.content_margin_right = 14; panel.content_margin_top = 14; panel.content_margin_bottom = 14
	result.set_stylebox("panel", "PanelContainer", panel)
	return result

func clear_screen() -> void:
	for child in get_children():
		if child != api and child != realtime and child != debug_console: child.queue_free()
	screen_root = null
	status_label = null
	current_floor = null
	current_task_panel = null
	current_builder = null
	current_inventory_panel = null

func add_background() -> void:
	var background := ColorRect.new()
	background.color = Color("091113")
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(background)
	move_child(background, 0)

func show_login() -> void:
	clear_screen(); add_background()
	var composition := Control.new(); composition.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT); add_child(composition)
	var title := Label.new(); title.text = "RUSH & REVENUE\nONLINE"; title.position = Vector2(90, 90); title.add_theme_font_size_override("font_size", 50); title.add_theme_color_override("font_color", Color("efbc54")); composition.add_child(title)
	var subtitle := Label.new(); subtitle.text = "A persistent hospitality world\nCrew a live restaurant. Own every decision."; subtitle.position = Vector2(95, 230); subtitle.add_theme_font_size_override("font_size", 20); subtitle.add_theme_color_override("font_color", Color("80ceb2")); composition.add_child(subtitle)
	var feature := Label.new(); feature.text = "NATIVE V1  ·  SHARED SHIFTS  ·  4× SERVICE TIME\n196 ROLE SKILLS  ·  89 MULTI-PHASE ACTIVITIES"; feature.position = Vector2(95, 335); feature.add_theme_font_size_override("font_size", 13); feature.add_theme_color_override("font_color", Color("87999a")); composition.add_child(feature)
	var panel := PanelContainer.new(); panel.custom_minimum_size = Vector2(470, 610); panel.position = Vector2(size.x - 560, 90); panel.set_anchors_preset(Control.PRESET_TOP_RIGHT); panel.offset_left = -560; panel.offset_right = -90; panel.offset_top = 90; panel.offset_bottom = 790; composition.add_child(panel)
	var form := VBoxContainer.new(); panel.add_child(form)
	var heading := Label.new(); heading.text = "Log in"; heading.add_theme_font_size_override("font_size", 26); form.add_child(heading)
	var username := make_field("Username or email", "", false); form.add_child(username)
	var password := make_field("Password", "", true); form.add_child(password)
	var login_button := Button.new(); login_button.text = "Log in"; login_button.custom_minimum_size.y = 48; form.add_child(login_button)
	form.add_child(labeled_rule("NEW PLAYER"))
	var signup_username := make_field("New username", "", false); form.add_child(signup_username)
	var email := make_field("Email", "", false); form.add_child(email)
	var display_name := make_field("Character name", "", false); form.add_child(display_name)
	var signup_password := make_field("Password (6+ characters)", "", true); form.add_child(signup_password)
	var signup_button := Button.new(); signup_button.text = "Create account and character"; signup_button.custom_minimum_size.y = 48; form.add_child(signup_button)
	status_label = Label.new(); status_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART; status_label.add_theme_color_override("font_color", Color("e68472")); form.add_child(status_label)
	var build := Label.new(); build.text = "v%s · rro.v1" % CLIENT_VERSION; build.add_theme_color_override("font_color", Color("687b7d")); form.add_child(build)
	var do_login := func() -> void:
		show_status("Connecting…")
		api.post_json("/v1/auth/login", {"login": username.text, "password": password.text}, func(ok: bool, data: Dictionary, _code: int) -> void:
			if ok: accept_session(data)
		)
	var do_signup := func() -> void:
		show_status("Creating account…")
		api.post_json("/v1/auth/signup", {"username": signup_username.text, "email": email.text, "displayName": display_name.text, "password": signup_password.text}, func(ok: bool, data: Dictionary, _code: int) -> void:
			if ok: accept_session(data)
		)
	login_button.pressed.connect(do_login)
	username.text_submitted.connect(func(_t: String) -> void: do_login.call())
	password.text_submitted.connect(func(_t: String) -> void: do_login.call())
	signup_button.pressed.connect(do_signup)
	signup_password.text_submitted.connect(func(_t: String) -> void: do_signup.call())

func make_field(placeholder: String, value: String, secret: bool) -> LineEdit:
	var field := LineEdit.new(); field.placeholder_text = placeholder; field.text = value; field.secret = secret; field.custom_minimum_size.y = 44; return field

func labeled_rule(label: String) -> HBoxContainer:
	var row := HBoxContainer.new(); var left := HSeparator.new(); left.size_flags_horizontal = Control.SIZE_EXPAND_FILL; row.add_child(left); var text := Label.new(); text.text = label; text.add_theme_font_size_override("font_size", 11); text.add_theme_color_override("font_color", Color("819193")); row.add_child(text); var right := HSeparator.new(); right.size_flags_horizontal = Control.SIZE_EXPAND_FILL; row.add_child(right); return row

func accept_session(data: Dictionary) -> void:
	api.session_token = str(data.get("sessionToken", "")); store.save_token(api.session_token); load_bootstrap()

var nav_stack: Array[Callable] = []

func load_bootstrap() -> void:
	api.get_json("/v1/bootstrap", func(ok: bool, data: Dictionary, code: int) -> void:
		if not ok:
			if code in [401, 403]:
				store.clear(); api.session_token = ""; show_login(); show_status("Session expired. Log in again.")
			else:
				show_login(); show_status("Could not load the game right now. Your saved session was kept; retry when the server is available.")
			return
		bootstrap = data
		var character: Dictionary = bootstrap.get("character", {})
		if str(character.get("homeRegionId", "")).is_empty():
			show_region_select()
		else:
			show_home()
	)

func navigate_to(screen: Callable) -> void:
	nav_stack.push_back(screen)
	screen.call()

func navigate_back() -> void:
	if nav_stack.size() > 1:
		nav_stack.pop_back()
		nav_stack.back().call()
	else:
		show_home()

func _unhandled_key_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		if not current_shift_id.is_empty(): return
		navigate_back()
		get_viewport().set_input_as_handled()

func show_region_select() -> void:
	clear_screen(); add_background()
	var center := VBoxContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	center.offset_left = -340; center.offset_right = 340; center.offset_top = -260; center.offset_bottom = 260
	add_child(center)
	var heading := Label.new(); heading.text = "CHOOSE YOUR REGION"; heading.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; heading.add_theme_font_size_override("font_size", 32); heading.add_theme_color_override("font_color", Color("efbc54")); center.add_child(heading)
	var sub := Label.new(); sub.text = "This is where you'll live and work. Restaurants, jobs, and guest visits are all regional."; sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; sub.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART; sub.add_theme_color_override("font_color", Color("9eacab")); center.add_child(sub)
	center.add_child(HSeparator.new())
	var scroll := ScrollContainer.new(); scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL; center.add_child(scroll)
	var list := VBoxContainer.new(); list.size_flags_horizontal = Control.SIZE_EXPAND_FILL; scroll.add_child(list)
	for country in bootstrap.get("world", {}).get("countries", []):
		var country_label := Label.new(); country_label.text = "%s  %s" % [country.get("flag", ""), country.get("name", "")]; country_label.add_theme_font_size_override("font_size", 20); country_label.add_theme_color_override("font_color", Color("80ceb2")); list.add_child(country_label)
		for region in country.get("regions", []):
			var rid: String = str(region.get("id", ""))
			var btn := Button.new(); btn.text = "%s  ·  %d restaurants  ·  demand %d  ·  cost %d" % [region.get("name", ""), int(region.get("restaurantCount", 0)), int(region.get("demand", 0)), int(region.get("costIndex", 0))]; btn.custom_minimum_size.y = 48; btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
			btn.pressed.connect(set_home_region.bind(rid))
			list.add_child(btn)
	var spacer := Control.new(); spacer.custom_minimum_size.y = 12; center.add_child(spacer)
	status_label = Label.new(); status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; status_label.add_theme_color_override("font_color", Color("e78874")); center.add_child(status_label)

func set_home_region(region_id: String) -> void:
	api.post_json("/v1/character/set-region", {"regionId": region_id}, func(ok: bool, _data: Dictionary, _code: int) -> void:
		if ok: load_bootstrap()
	)

func show_home() -> void:
	nav_stack.clear()
	nav_stack.push_back(show_home)
	clear_screen(); add_background()
	var margin := MarginContainer.new(); margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT); margin.add_theme_constant_override("margin_left", 48); margin.add_theme_constant_override("margin_right", 48); margin.add_theme_constant_override("margin_top", 36); margin.add_theme_constant_override("margin_bottom", 36); add_child(margin)
	var root := VBoxContainer.new(); root.size_flags_horizontal = Control.SIZE_EXPAND_FILL; margin.add_child(root)
	var character: Dictionary = bootstrap.get("character", {})
	var employment = bootstrap.get("employment", null)
	var top := HBoxContainer.new(); root.add_child(top)
	var logo := Label.new(); logo.text = "RUSH & REVENUE ONLINE"; logo.add_theme_font_size_override("font_size", 28); logo.add_theme_color_override("font_color", Color("efbc54")); logo.size_flags_horizontal = Control.SIZE_EXPAND_FILL; top.add_child(logo)
	var quit_btn := Button.new(); quit_btn.text = "Quit"; quit_btn.pressed.connect(func() -> void: get_tree().quit()); top.add_child(quit_btn)
	var logout_btn := Button.new(); logout_btn.text = "Log out"; logout_btn.pressed.connect(log_out); top.add_child(logout_btn)
	root.add_child(HSeparator.new())
	var body := HBoxContainer.new(); body.size_flags_vertical = Control.SIZE_EXPAND_FILL; root.add_child(body)
	# Left: character card
	var card := PanelContainer.new(); card.custom_minimum_size.x = 380; body.add_child(card)
	var card_box := VBoxContainer.new(); card.add_child(card_box)
	var name_label := Label.new(); name_label.text = str(character.get("name", "Operator")); name_label.add_theme_font_size_override("font_size", 28); name_label.add_theme_color_override("font_color", Color("efbc54")); card_box.add_child(name_label)
	var stats := Label.new(); stats.text = "Level %d  ·  $%.2f  ·  %d SP" % [int(character.get("level", 1)), float(character.get("cashCents", 0)) / 100.0, int(character.get("skillPoints", 0))]; stats.add_theme_color_override("font_color", Color("80ceb2")); card_box.add_child(stats)
	var role_label := Label.new(); role_label.text = "Role: %s" % str(character.get("activeRoleId", "none")).capitalize(); card_box.add_child(role_label)
	card_box.add_child(HSeparator.new())
	if employment != null and employment is Dictionary:
		var job := Label.new(); job.text = "EMPLOYED AT"; job.add_theme_font_size_override("font_size", 12); job.add_theme_color_override("font_color", Color("819193")); card_box.add_child(job)
		var employer := Label.new(); employer.text = str(employment.get("restaurantName", "Unknown")); employer.add_theme_font_size_override("font_size", 22); employer.add_theme_color_override("font_color", Color("f1ecda")); card_box.add_child(employer)
		var job_details := Label.new(); job_details.text = "%s  ·  ★ %.1f  ·  sanitation %d" % [str(employment.get("roleId", "")).capitalize(), float(employment.get("rating", 0)), int(employment.get("sanitation", 0))]; job_details.add_theme_color_override("font_color", Color("9eacab")); card_box.add_child(job_details)
		var quit_job := Button.new(); quit_job.text = "Quit this job"
		quit_job.pressed.connect(func() -> void:
			api.post_json("/v1/character/quit-job", {}, func(ok: bool, _data: Dictionary, _code: int) -> void:
				if ok: load_bootstrap()
			)
		)
		card_box.add_child(quit_job)
	else:
		var no_job := Label.new(); no_job.text = "No current employment"; no_job.add_theme_color_override("font_color", Color("687b7d")); card_box.add_child(no_job)
		var hint := Label.new(); hint.text = "Use Find Work to get hired at a restaurant."; hint.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART; hint.add_theme_color_override("font_color", Color("819193")); card_box.add_child(hint)
	# Right: action buttons
	var actions := VBoxContainer.new(); actions.size_flags_horizontal = Control.SIZE_EXPAND_FILL; actions.add_theme_constant_override("separation", 16); body.add_child(actions)
	var spacer := Control.new(); spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL; actions.add_child(spacer)
	if employment != null and employment is Dictionary:
		var clock_in := Button.new(); clock_in.text = "CLOCK IN — %s" % str(employment.get("restaurantName", "Work")); clock_in.custom_minimum_size.y = 72; clock_in.add_theme_font_size_override("font_size", 22)
		clock_in.pressed.connect(func() -> void: clock_in_to_job(employment))
		actions.add_child(clock_in)
	var find_work := Button.new(); find_work.text = "Find Work"; find_work.custom_minimum_size.y = 56; find_work.add_theme_font_size_override("font_size", 18)
	find_work.pressed.connect(func() -> void: navigate_to(show_find_work))
	actions.add_child(find_work)
	var owned: Array = bootstrap.get("ownedRestaurants", [])
	if not owned.is_empty():
		var my_rest := Button.new(); my_rest.text = "My Restaurant — %s" % str(owned[0].get("name", "")); my_rest.custom_minimum_size.y = 56; my_rest.add_theme_font_size_override("font_size", 18)
		my_rest.pressed.connect(func() -> void: navigate_to(show_my_restaurant))
		actions.add_child(my_rest)
	else:
		var found_rest := Button.new(); found_rest.text = "Found a Restaurant"; found_rest.custom_minimum_size.y = 56; found_rest.add_theme_font_size_override("font_size", 18)
		found_rest.pressed.connect(func() -> void: navigate_to(show_found_restaurant))
		actions.add_child(found_rest)
	var char_btn := Button.new(); char_btn.text = "Character & Skills"; char_btn.custom_minimum_size.y = 56; char_btn.add_theme_font_size_override("font_size", 18)
	char_btn.pressed.connect(func() -> void: navigate_to(show_character))
	actions.add_child(char_btn)
	var inventory_btn := Button.new(); inventory_btn.text = "Role Inventory & Shop"; inventory_btn.custom_minimum_size.y = 56; inventory_btn.add_theme_font_size_override("font_size", 18)
	inventory_btn.pressed.connect(func() -> void: navigate_to(show_inventory))
	actions.add_child(inventory_btn)
	var spacer2 := Control.new(); spacer2.size_flags_vertical = Control.SIZE_EXPAND_FILL; actions.add_child(spacer2)
	status_label = Label.new(); status_label.add_theme_color_override("font_color", Color("e78874")); root.add_child(status_label)
	var build_label := Label.new(); build_label.text = "v%s · rro.v1" % CLIENT_VERSION; build_label.add_theme_color_override("font_color", Color("687b7d")); root.add_child(build_label)

func clock_in_to_job(employment: Dictionary) -> void:
	var restaurant_id := str(employment.get("restaurantId", ""))
	var role_id := str(employment.get("roleId", ""))
	show_status("Clocking in...")
	api.post_json("/v1/restaurants/%s/shifts" % restaurant_id, {}, func(ok: bool, data: Dictionary, _code: int) -> void:
		if not ok: return
		join_shift(str(data.get("id", "")), "employee", role_id)
	)

func make_shell(section_title: String) -> VBoxContainer:
	clear_screen(); add_background()
	var margin := MarginContainer.new(); margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT); margin.add_theme_constant_override("margin_left", 24); margin.add_theme_constant_override("margin_right", 24); margin.add_theme_constant_override("margin_top", 18); margin.add_theme_constant_override("margin_bottom", 18); add_child(margin)
	var root := VBoxContainer.new(); root.size_flags_horizontal = Control.SIZE_EXPAND_FILL; root.size_flags_vertical = Control.SIZE_EXPAND_FILL; margin.add_child(root)
	var top := HBoxContainer.new(); root.add_child(top)
	var back := Button.new(); back.text = "← Back"; back.pressed.connect(navigate_back); top.add_child(back)
	var logo := Label.new(); logo.text = "R&R  /  %s" % section_title.to_upper(); logo.add_theme_font_size_override("font_size", 23); logo.add_theme_color_override("font_color", Color("efbc54")); logo.size_flags_horizontal = Control.SIZE_EXPAND_FILL; top.add_child(logo)
	var character: Dictionary = bootstrap.get("character", {})
	var identity := Label.new(); identity.text = "%s  ·  LV %d  ·  $%.2f" % [character.get("name", "Operator"), int(character.get("level", 1)), float(character.get("cashCents", 0))/100.0]; identity.add_theme_color_override("font_color", Color("83cdb2")); top.add_child(identity)
	status_label = Label.new(); status_label.custom_minimum_size.y = 22; status_label.add_theme_color_override("font_color", Color("e78874")); root.add_child(status_label)
	root.add_child(HSeparator.new())
	return root

func show_find_work() -> void:
	var root := make_shell("Find Work")
	var split := HSplitContainer.new(); split.size_flags_vertical = Control.SIZE_EXPAND_FILL; root.add_child(split)
	var globe := WorldGlobe.new(); globe.custom_minimum_size = Vector2(700, 580); globe.size_flags_horizontal = Control.SIZE_EXPAND_FILL; globe.set_countries(bootstrap.get("world", {}).get("countries", [])); split.add_child(globe)
	var panel := PanelContainer.new(); panel.custom_minimum_size.x = 420; split.add_child(panel)
	var panel_box := VBoxContainer.new(); panel_box.add_theme_constant_override("separation", 10); panel.add_child(panel_box)
	var panel_title := Label.new(); panel_title.text = "SELECT A REGION"; panel_title.add_theme_font_size_override("font_size", 22); panel_title.add_theme_color_override("font_color", Color("7fd0b2")); panel_box.add_child(panel_title)
	var panel_sub := Label.new(); panel_sub.text = "Click a country on the map. Each region has unique economic conditions that affect earnings, hiring, and competition."; panel_sub.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART; panel_sub.add_theme_color_override("font_color", Color("8da0a2")); panel_box.add_child(panel_sub)
	var region_scroll := ScrollContainer.new(); region_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL; panel_box.add_child(region_scroll)
	var region_list := VBoxContainer.new(); region_list.size_flags_horizontal = Control.SIZE_EXPAND_FILL; region_scroll.add_child(region_list)
	globe.country_selected.connect(func(country: Dictionary) -> void:
		panel_title.text = "%s  %s" % [country.get("flag", ""), country.get("name", "")]
		panel_sub.text = ""
		for child in region_list.get_children(): child.queue_free()
		for region in country.get("regions", []):
			var selected_region: Dictionary = region.duplicate(true)
			var card := PanelContainer.new(); card.custom_minimum_size.y = 110; region_list.add_child(card)
			var card_box := VBoxContainer.new(); card.add_child(card_box)
			var rname := Label.new(); rname.text = str(region.get("name", "Region")); rname.add_theme_font_size_override("font_size", 18); rname.add_theme_color_override("font_color", Color("efbc54")); card_box.add_child(rname)
			var demand_val := int(region.get("demand", 50))
			var demand_indicator := "HIGH" if demand_val >= 70 else ("MED" if demand_val >= 40 else "LOW")
			var demand_color := Color("75c5a7") if demand_val >= 70 else (Color("e7e5d5") if demand_val >= 40 else Color("e68472"))
			var metrics := HBoxContainer.new(); card_box.add_child(metrics)
			var demand_lbl := Label.new(); demand_lbl.text = "Demand: %s" % demand_indicator; demand_lbl.add_theme_color_override("font_color", demand_color); metrics.add_child(demand_lbl)
			var cost_lbl := Label.new(); cost_lbl.text = "  Cost: %d" % int(region.get("costIndex", 100)); metrics.add_child(cost_lbl)
			var cap_lbl := Label.new(); cap_lbl.text = "  Slots: %d/%d" % [int(region.get("restaurantCount", 0)), int(region.get("capacity", 0))]; cap_lbl.add_theme_color_override("font_color", Color("8da0a2")); metrics.add_child(cap_lbl)
			var resources: Dictionary = region.get("resources", {})
			var res_parts: Array[String] = []
			for key in resources.keys():
				var val := int(resources[key])
				var arrow := "^" if val >= 70 else ("=" if val >= 40 else "v")
				res_parts.append("%s%s" % [str(key).left(4).capitalize(), arrow])
			var res_label := Label.new(); res_label.text = "  ".join(res_parts); res_label.add_theme_font_size_override("font_size", 11); res_label.add_theme_color_override("font_color", Color("8da0a2")); card_box.add_child(res_label)
			var browse := Button.new(); browse.text = "Browse jobs"; browse.custom_minimum_size.y = 34
			browse.pressed.connect(open_region.bind(selected_region))
			card_box.add_child(browse)
	)
	var hint := Label.new(); hint.text = "Guest visits require employment in the same region."; hint.add_theme_color_override("font_color", Color("687b7d")); hint.add_theme_font_size_override("font_size", 11); panel_box.add_child(hint)

func open_region(region: Dictionary) -> void:
	navigate_to(show_region_restaurants.bind(region.duplicate(true)))

func show_region_restaurants(region: Dictionary) -> void:
	var root := make_shell(str(region.get("name", "Region")))
	var heading := Label.new(); heading.text = "REGIONAL SUPPLY  ·  %s" % format_resources(region.get("resources", {})); heading.add_theme_color_override("font_color", Color("80cdb1")); root.add_child(heading)
	var scroll := ScrollContainer.new(); scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL; root.add_child(scroll)
	var list := VBoxContainer.new(); list.size_flags_horizontal = Control.SIZE_EXPAND_FILL; scroll.add_child(list)
	api.get_json("/v1/regions/%s/restaurants" % region.get("id", ""), func(ok: bool, data: Dictionary, _code: int) -> void:
		if not ok: return
		for restaurant in data.get("restaurants", []): add_restaurant_card(list, restaurant)
	)

func add_restaurant_card(parent: VBoxContainer, restaurant: Dictionary) -> void:
	var panel := PanelContainer.new(); panel.custom_minimum_size.y = 120; parent.add_child(panel)
	var row := HBoxContainer.new(); panel.add_child(row)
	var info := VBoxContainer.new(); info.size_flags_horizontal = Control.SIZE_EXPAND_FILL; row.add_child(info)
	var restaurant_name := Label.new(); restaurant_name.text = str(restaurant.get("name", "Restaurant")); restaurant_name.add_theme_font_size_override("font_size", 22); restaurant_name.add_theme_color_override("font_color", Color("efbc54")); info.add_child(restaurant_name)
	var details := Label.new(); details.text = "%s  ·  %s  ·  ★ %.2f  ·  sanitation %d" % [restaurant.get("concept", ""), restaurant.get("style", ""), float(restaurant.get("rating", 0)), int(restaurant.get("sanitation", 0))]; info.add_child(details)
	var permanence := Label.new(); permanence.text = "NPC business" if restaurant.get("isNpc", false) else "Player-owned"; permanence.add_theme_color_override("font_color", Color("8e9e9f")); info.add_child(permanence)
	var controls := VBoxContainer.new(); controls.custom_minimum_size.x = 300; row.add_child(controls)
	var role := OptionButton.new(); populate_roles(role, false); controls.add_child(role)
	var apply_btn := Button.new(); apply_btn.text = "Accept this job"; apply_btn.tooltip_text = "Alpha hiring is immediate; quitting is required before accepting another job."; apply_btn.custom_minimum_size.y = 44
	apply_btn.pressed.connect(func() -> void:
		var role_id := str(role.get_item_metadata(role.selected))
		show_status("Applying...")
		api.post_json("/v1/restaurants/%s/apply" % restaurant.get("id", ""), {"roleId": role_id}, func(ok: bool, _data: Dictionary, _code: int) -> void:
			if ok:
				show_status("Hired! Returning home...")
				load_bootstrap()
		)
	)
	controls.add_child(apply_btn)
	var live_shift: Dictionary = restaurant.get("liveShift", {}) if restaurant.get("liveShift", null) is Dictionary else {}
	if not live_shift.is_empty():
		var visit := Button.new(); visit.text = "Visit live shift as a guest"; visit.custom_minimum_size.y = 40
		visit.pressed.connect(join_shift.bind(str(live_shift.get("id", "")), "guest", ""))
		controls.add_child(visit)

func format_resources(resources: Dictionary) -> String:
	var parts: Array[String] = []
	for key in resources.keys(): parts.append("%s %s" % [str(key).capitalize(), resources[key]])
	return "  ·  ".join(parts)

func populate_roles(option: OptionButton, include_owner: bool) -> void:
	for role in bootstrap.get("content", {}).get("roles", []):
		if str(role.get("kind", "base")) != "base": continue
		if not include_owner and str(role.get("id", "")) == "owner": continue
		option.add_item("%s  %s" % [role.get("icon", ""), role.get("label", "Role")]); option.set_item_metadata(option.item_count - 1, role.get("id", ""))
	var active := str(bootstrap.get("character", {}).get("activeRoleId", ""))
	for index in range(option.item_count):
		if str(option.get_item_metadata(index)) == active: option.select(index)

func join_shift(shift_id: String, kind: String, role_id: String) -> void:
	show_status("Joining...")
	var character: Dictionary = bootstrap.get("character", {})
	shift_start_cash = int(character.get("cashCents", 0))
	shift_start_xp = int(character.get("xp", 0))
	shift_tasks_completed = 0
	api.post_json("/v1/shifts/%s/join" % shift_id, {"kind": kind, "roleId": role_id, "partySize": 2}, func(ok: bool, data: Dictionary, _code: int) -> void:
		if not ok: return
		current_shift_id = shift_id; current_restaurant_id = str(data.get("restaurantId", "")); presence_kind = kind; current_role_id = str(data.get("roleId", role_id)); latest_snapshot = data.get("snapshot", {})
		realtime.connect_world(api.server_url, api.session_token); realtime.subscribe(shift_id); show_shift()
	)

func show_shift() -> void:
	var title := str(latest_snapshot.get("restaurant", {}).get("name", "Live restaurant"))
	var root := make_shell(title)
	var strip := HBoxContainer.new(); root.add_child(strip)
	var state := Label.new(); state.text = "%s  ·  %s  ·  %s" % [presence_kind.to_upper(), current_role_id.to_upper(), shift_clock()]; state.size_flags_horizontal = Control.SIZE_EXPAND_FILL; state.add_theme_color_override("font_color", Color("80cdb1")); strip.add_child(state)
	var leave := Button.new(); leave.text = "Leave shift"; leave.pressed.connect(request_leave_shift); strip.add_child(leave)
	var split := HSplitContainer.new(); split.size_flags_vertical = Control.SIZE_EXPAND_FILL; root.add_child(split)
	current_floor = RestaurantFloor.new(); current_floor.custom_minimum_size = Vector2(900, 620); current_floor.size_flags_horizontal = Control.SIZE_EXPAND_FILL; current_floor.set_content(bootstrap.get("content", {})); current_floor.set_snapshot(latest_snapshot); current_floor.movement_input.connect(send_movement); split.add_child(current_floor)
	var panel := PanelContainer.new(); panel.custom_minimum_size.x = 390; split.add_child(panel)
	if presence_kind == "employee":
		current_task_panel = TaskPanel.new(); current_task_panel.task_claim_requested.connect(func(task_id: String) -> void: realtime.send_command("task.claim", current_shift_id, {"taskId": task_id})); current_task_panel.task_action_requested.connect(func(task_id: String, action: String) -> void: realtime.send_command("task.action", current_shift_id, {"taskId": task_id, "action": action})); panel.add_child(current_task_panel); current_task_panel.set_state(latest_snapshot, str(bootstrap.get("character", {}).get("id", "")), current_role_id)
	else:
		panel.add_child(make_guest_panel())

func make_guest_panel() -> VBoxContainer:
	var box := VBoxContainer.new(); var title := Label.new(); title.text = "GUEST INFLUENCE"; title.add_theme_font_size_override("font_size", 20); title.add_theme_color_override("font_color", Color("efbc54")); box.add_child(title)
	var copy := Label.new(); copy.text = "Spend earned money during a real local visit. Choose one of your party's untouched service minigames, then add visible difficulty with staff counterplay—never hidden sabotage."; copy.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART; box.add_child(copy)
	var challenge_option := OptionButton.new()
	var challenges := [["allergy-declaration", "$5  ·  allergy protocol"], ["special-request", "$8  ·  off-menu preference"], ["split-check", "$12  ·  complex split"], ["impatient-pace", "$18  ·  accelerated pacing"], ["tasting-menu", "$25  ·  chef-guided tasting"]]
	for option in challenges:
		challenge_option.add_item(str(option[1]))
		challenge_option.set_item_metadata(challenge_option.item_count - 1, str(option[0]))
	box.add_child(challenge_option)

	var target_option := OptionButton.new()
	target_option.add_item("Create a new request for my party")
	target_option.set_item_metadata(0, "")
	var guest_party_id := ""
	var character_id := str(bootstrap.get("character", {}).get("id", ""))
	for party_value in latest_snapshot.get("parties", []):
		var party: Dictionary = party_value
		if str(party.get("guestCharacterId", "")) == character_id:
			guest_party_id = str(party.get("id", ""))
			break
	for task_value in latest_snapshot.get("tasks", []):
		var task: Dictionary = task_value
		if str(task.get("partyId", "")) != guest_party_id or int(task.get("actionCount", 0)) > 0 or task.get("rivalry", null) != null: continue
		target_option.add_item("Target: %s  ·  %s" % [str(task.get("label", "Service task")), str(task.get("ownerRoleId", "crew")).replace("-", " ").capitalize()])
		target_option.set_item_metadata(target_option.item_count - 1, str(task.get("id", "")))
	box.add_child(target_option)

	var dimension_option := OptionButton.new()
	var dimensions := [["timing-window", "Timing window"], ["precision", "Precision"], ["memory-order", "Memory & order"], ["coordination-handoff", "Coordination & handoff"], ["interruptions", "Interruptions"]]
	for option in dimensions:
		dimension_option.add_item(str(option[1]))
		dimension_option.set_item_metadata(dimension_option.item_count - 1, str(option[0]))
	box.add_child(dimension_option)

	var intensity_option := OptionButton.new()
	for option in [["light", "Light  ·  1× cost"], ["focused", "Focused  ·  1.6× cost"], ["expert", "Expert  ·  2.4× cost"]]:
		intensity_option.add_item(str(option[1]))
		intensity_option.set_item_metadata(intensity_option.item_count - 1, str(option[0]))
	box.add_child(intensity_option)

	var apply := Button.new()
	apply.text = "Spend cash and apply challenge"
	apply.custom_minimum_size.y = 48
	apply.pressed.connect(send_guest_challenge.bind(challenge_option, target_option, dimension_option, intensity_option))
	box.add_child(apply)
	var evidence := Label.new(); evidence.text = "Live party satisfaction and patience are visible on the floor. Your eventual review is generated from recorded food, service, cleanliness, value, and ambience evidence."; evidence.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART; evidence.add_theme_color_override("font_color", Color("8fa1a1")); box.add_child(evidence)
	return box

func send_guest_challenge(challenge_option: OptionButton, target_option: OptionButton, dimension_option: OptionButton, intensity_option: OptionButton) -> void:
	var payload := {
		"challenge": str(challenge_option.get_item_metadata(challenge_option.selected)),
		"dimension": str(dimension_option.get_item_metadata(dimension_option.selected)),
		"intensity": str(intensity_option.get_item_metadata(intensity_option.selected))
	}
	var target_task_id := str(target_option.get_item_metadata(target_option.selected))
	if not target_task_id.is_empty(): payload["targetTaskId"] = target_task_id
	realtime.send_command("guest.challenge", current_shift_id, payload)

func shift_clock() -> String:
	var closes := int(latest_snapshot.get("shift", {}).get("closesAt", 0)); var remaining := maxi(0, int((closes - Time.get_unix_time_from_system()*1000.0)/1000.0)); return "%02d:%02d remaining" % [floori(float(remaining)/60.0), remaining%60]

func send_movement(direction: Vector2) -> void:
	if not current_shift_id.is_empty(): realtime.send_command("move", current_shift_id, {"x": direction.x, "y": direction.y})

func on_realtime_snapshot(snapshot: Dictionary) -> void:
	if str(snapshot.get("shift", {}).get("id", "")) != current_shift_id: return
	latest_snapshot = snapshot
	if is_instance_valid(current_floor): current_floor.set_snapshot(snapshot)
	if is_instance_valid(current_task_panel): current_task_panel.set_state(snapshot, str(bootstrap.get("character", {}).get("id", "")), current_role_id)

func on_command_ack(_command_id: String, result: Dictionary) -> void:
	if result.has("score"):
		var score := int(result.get("score", 0))
		var grade := "S" if score >= 95 else ("A" if score >= 85 else ("B" if score >= 70 else ("C" if score >= 55 else "F")))
		if bool(result.get("completed", false)): shift_tasks_completed += 1
		show_status("%s  %d/100  \u00b7  %s" % [grade, score, result.get("outcome", "resolved")])
		log_debug("[TASK] Score %d (%s) — %s" % [score, grade, result.get("outcome", "")])
	elif result.has("message"): show_status(str(result.message))
	elif result.has("error"): show_status(str(result.get("error", {}).get("message", "Error")))

func request_leave_shift() -> void:
	if current_shift_id.is_empty(): leave_shift_ui(); return
	api.post_json("/v1/shifts/%s/leave" % current_shift_id, {}, func(ok: bool, _data: Dictionary, _code: int) -> void:
		if ok: show_shift_summary()
	)

func show_shift_summary() -> void:
	realtime.close()
	var _shift_id := current_shift_id
	current_shift_id = ""; current_restaurant_id = ""
	clear_screen(); add_background()
	var center := VBoxContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	center.offset_left = -300; center.offset_right = 300; center.offset_top = -200; center.offset_bottom = 200
	add_child(center)
	var heading := Label.new(); heading.text = "SHIFT COMPLETE"; heading.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; heading.add_theme_font_size_override("font_size", 32); heading.add_theme_color_override("font_color", Color("efbc54")); center.add_child(heading)
	center.add_child(HSeparator.new())
	var role_line := Label.new(); role_line.text = "%s  \u00b7  %s" % [current_role_id.to_upper() if not current_role_id.is_empty() else "GUEST", presence_kind.to_upper()]; role_line.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; role_line.add_theme_font_size_override("font_size", 18); role_line.add_theme_color_override("font_color", Color("80ceb2")); center.add_child(role_line)
	center.add_child(Control.new())
	var tasks_line := Label.new(); tasks_line.text = "Tasks completed: %d" % shift_tasks_completed; tasks_line.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; tasks_line.add_theme_font_size_override("font_size", 20); center.add_child(tasks_line)
	center.add_child(Control.new())
	var cont := Button.new(); cont.text = "Continue"; cont.custom_minimum_size.y = 56; cont.add_theme_font_size_override("font_size", 20)
	cont.pressed.connect(func() -> void: latest_snapshot = {}; load_bootstrap())
	center.add_child(cont)
	status_label = Label.new(); status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER; status_label.add_theme_color_override("font_color", Color("9eacab")); center.add_child(status_label)

func leave_shift_ui() -> void:
	realtime.close(); current_shift_id = ""; current_restaurant_id = ""; latest_snapshot = {}; load_bootstrap()

func show_my_restaurant() -> void:
	var owned: Array = bootstrap.get("ownedRestaurants", [])
	if owned.is_empty(): show_found_restaurant(); return
	var restaurant: Dictionary = owned[0]; current_restaurant_id = str(restaurant.get("id", ""))
	var root := make_shell("Restaurant studio")
	var finances := Label.new(); finances.text = "%s  ·  ★ %.2f  ·  sanitation %d  ·  treasury $%.2f" % [restaurant.get("name", "My restaurant"), float(restaurant.get("rating", 0)), int(restaurant.get("sanitation", 0)), float(restaurant.get("treasuryCents", 0))/100.0]; finances.add_theme_color_override("font_color", Color("80cdb1")); root.add_child(finances)
	var service_actions := HBoxContainer.new(); root.add_child(service_actions)
	var owner_shift := Button.new(); owner_shift.text = "Open shift and work as Owner"; owner_shift.custom_minimum_size.y = 48
	owner_shift.pressed.connect(func() -> void:
		api.post_json("/v1/restaurants/%s/shifts" % current_restaurant_id, {}, func(ok: bool, data: Dictionary, _code: int) -> void:
			if ok: join_shift(str(data.get("id", "")), "employee", "owner")
		)
	)
	service_actions.add_child(owner_shift)
	var split := HSplitContainer.new(); split.size_flags_vertical = Control.SIZE_EXPAND_FILL; root.add_child(split)
	current_floor = RestaurantFloor.new(); current_floor.custom_minimum_size = Vector2(900, 620); current_floor.size_flags_horizontal = Control.SIZE_EXPAND_FILL; current_floor.set_content(bootstrap.get("content", {})); current_floor.set_build_mode(true); current_floor.build_action_requested.connect(handle_build_action)
	current_floor.object_selected.connect(func(object: Dictionary) -> void:
		selected_builder_object = object
		if is_instance_valid(current_builder): current_builder.set_selected_object(object)
	)
	split.add_child(current_floor)
	var panel := PanelContainer.new(); panel.custom_minimum_size.x = 390; split.add_child(panel); current_builder = BuilderPalette.new(); current_builder.set_content(bootstrap.get("content", {})); current_builder.tool_selected.connect(func(tool: String, id: String) -> void: current_floor.select_tool(tool, id)); current_builder.repair_selected_requested.connect(repair_selected_builder_object); current_builder.sell_selected_requested.connect(sell_selected_builder_object); current_builder.expand_requested.connect(expand_builder); panel.add_child(current_builder)
	api.get_json("/v1/restaurants/%s/layout" % current_restaurant_id, func(ok: bool, data: Dictionary, _code: int) -> void:
		if ok and is_instance_valid(current_floor): current_floor.set_layout(data)
	)

func show_found_restaurant() -> void:
	var root := make_shell("Found a restaurant")
	var panel := PanelContainer.new(); panel.custom_minimum_size = Vector2(680, 520); panel.size_flags_horizontal = Control.SIZE_SHRINK_CENTER; root.add_child(panel)
	var box := VBoxContainer.new(); panel.add_child(box)
	var heading := Label.new(); heading.text = "TURN $10,000 INTO A WORKING HOUSE"; heading.add_theme_font_size_override("font_size", 24); heading.add_theme_color_override("font_color", Color("efbc54")); box.add_child(heading)
	var text := Label.new(); text.text = "Choose a region with a free license. You receive a fully editable 24×16 modular shell and $8,000 restaurant treasury. Floor, kitchen flow, storage, utilities, seating, office, and decoration placement are your design—not a background picture."; text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART; box.add_child(text)
	var restaurant_name := make_field("Restaurant name", "", false); box.add_child(restaurant_name)
	var region := OptionButton.new(); box.add_child(region)
	for country in bootstrap.get("world", {}).get("countries", []):
		for value in country.get("regions", []):
			if int(value.get("restaurantCount", 0)) < int(value.get("capacity", 0)): region.add_item("%s / %s  ·  %d licenses left" % [country.get("name", ""), value.get("name", ""), int(value.get("capacity", 0))-int(value.get("restaurantCount", 0))]); region.set_item_metadata(region.item_count-1, value.get("id", ""))
	if region.item_count == 0:
		region.add_item("No restaurant licenses are currently available")
		region.disabled = true
	var concept := OptionButton.new()
	for value in bootstrap.get("content", {}).get("concepts", []): concept.add_item(str(value))
	box.add_child(concept)
	var style := OptionButton.new()
	for value in bootstrap.get("content", {}).get("styles", []): style.add_item(str(value))
	box.add_child(style)
	var found := Button.new(); found.text = "Purchase license and open design studio"; found.custom_minimum_size.y = 52; box.add_child(found)
	found.disabled = region.disabled
	found.pressed.connect(func() -> void:
		if region.disabled: return
		api.post_json("/v1/restaurants", {"name": restaurant_name.text, "regionId": region.get_item_metadata(region.selected), "concept": concept.get_item_text(concept.selected), "style": style.get_item_text(style.selected)}, func(ok: bool, _data: Dictionary, _code: int) -> void:
			if ok: load_bootstrap()
		)
	)

func handle_build_action(action: String, payload: Dictionary) -> void:
	if current_restaurant_id.is_empty(): return
	match action:
		"floor": api.patch_json("/v1/restaurants/%s/layout/floor" % current_restaurant_id, payload, build_response)
		"wall": api.put_json("/v1/restaurants/%s/layout/walls" % current_restaurant_id, payload, build_response)
		"place": api.post_json("/v1/restaurants/%s/layout/objects" % current_restaurant_id, payload, build_response)
		"move":
			var id := str(payload.get("id", "")); payload.erase("id"); api.patch_json("/v1/restaurants/%s/layout/objects/%s" % [current_restaurant_id, id], payload, build_response)

func build_response(ok: bool, data: Dictionary, _code: int) -> void:
	if ok and is_instance_valid(current_floor): current_floor.set_layout(data.get("layout", data)); show_status("Layout committed to the authoritative restaurant database.")

func sell_selected_builder_object() -> void:
	if selected_builder_object.is_empty(): show_status("Select a placed object first."); return
	api.delete_json("/v1/restaurants/%s/layout/objects/%s" % [current_restaurant_id, selected_builder_object.get("id", "")], func(ok: bool, data: Dictionary, _code: int) -> void:
		if ok: selected_builder_object = {}; current_floor.set_layout(data.get("layout", {})); show_status("Object sold back at its wear-adjusted recovery value.")
	)

func repair_selected_builder_object() -> void:
	if selected_builder_object.is_empty(): show_status("Select a worn or broken object first."); return
	api.post_json("/v1/restaurants/%s/layout/objects/%s/repair" % [current_restaurant_id, selected_builder_object.get("id", "")], {}, func(ok: bool, data: Dictionary, _code: int) -> void:
		if ok:
			selected_builder_object = {}
			current_floor.set_layout(data.get("layout", {}))
			show_status("Furniture restored for $%.2f from restaurant treasury." % (float(data.get("costCents", 0)) / 100.0))
	)

func expand_builder(add_width: int, add_height: int) -> void:
	api.post_json("/v1/restaurants/%s/layout/expand" % current_restaurant_id, {"addWidth": add_width, "addHeight": add_height}, build_response)

func show_inventory() -> void:
	var root := make_shell("Role Inventory")
	current_inventory_panel = InventoryPanel.new()
	current_inventory_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	current_inventory_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	current_inventory_panel.action_requested.connect(handle_inventory_action)
	root.add_child(current_inventory_panel)
	refresh_inventory_screen()

func refresh_inventory_screen() -> void:
	if not is_instance_valid(current_inventory_panel): return
	show_status("Loading persistent inventory…")
	api.get_json("/v1/character/inventory/catalog", accept_inventory_catalog)

func accept_inventory_catalog(ok: bool, data: Dictionary, _code: int) -> void:
	if not ok: return
	pending_inventory_catalog = data
	api.get_json("/v1/character/inventory", accept_inventory_state)

func accept_inventory_state(ok: bool, data: Dictionary, _code: int) -> void:
	if not ok or not is_instance_valid(current_inventory_panel): return
	bootstrap["inventory"] = data
	var preferred_role: String = current_inventory_panel.selected_role_id
	if preferred_role.is_empty(): preferred_role = str(bootstrap.get("character", {}).get("activeRoleId", "host-busser"))
	current_inventory_panel.set_data(pending_inventory_catalog, data, preferred_role)
	show_status("")

func handle_inventory_action(action: String, payload: Dictionary) -> void:
	var endpoints := {
		"purchase": "/v1/character/inventory/purchase",
		"equip": "/v1/character/inventory/equip",
		"unequip": "/v1/character/inventory/unequip",
		"use": "/v1/character/inventory/use"
	}
	var endpoint := str(endpoints.get(action, ""))
	if endpoint.is_empty(): return
	show_status("Updating inventory…")
	api.post_json(endpoint, payload, accept_inventory_action)

func accept_inventory_action(ok: bool, _data: Dictionary, _code: int) -> void:
	if ok:
		show_status("Inventory updated.")
		refresh_inventory_screen()

func show_character() -> void:
	var root := make_shell("Character")
	var character: Dictionary = bootstrap.get("character", {})
	var nav := HBoxContainer.new(); root.add_child(nav)
	var skills_btn := Button.new(); skills_btn.text = "Skill Trees"; skills_btn.custom_minimum_size.y = 44
	skills_btn.pressed.connect(func() -> void: navigate_to(show_skills))
	nav.add_child(skills_btn)
	var split := HSplitContainer.new(); split.size_flags_vertical = Control.SIZE_EXPAND_FILL; root.add_child(split)
	var stats_panel := PanelContainer.new(); split.add_child(stats_panel); var stats := VBoxContainer.new(); stats_panel.add_child(stats); var heading := Label.new(); heading.text = "RANDOMIZED APTITUDES"; heading.add_theme_font_size_override("font_size", 21); heading.add_theme_color_override("font_color", Color("7fd0b2")); stats.add_child(heading)
	var explanation := Label.new(); explanation.text = "Every new character begins with two strengths, two weak areas, and mixed middle aptitude. This suggests roles; it never locks progression."; explanation.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART; stats.add_child(explanation)
	for attribute in character.get("attributes", []):
		var row := HBoxContainer.new(); var label := Label.new(); label.text = str(attribute.get("attributeId", "")).capitalize(); label.custom_minimum_size.x = 150; row.add_child(label); var bar := ProgressBar.new(); bar.value = float(attribute.get("value", 0)); bar.max_value = 100; bar.show_percentage = true; bar.custom_minimum_size = Vector2(300, 24); row.add_child(bar); stats.add_child(row)
	var fit_parts: Array[String] = []
	for fit in character.get("recommendedRoles", []).slice(0, 3): fit_parts.append("%s %d" % [fit.get("roleId", ""), int(fit.get("fit", 0))])
	var fits := Label.new(); fits.text = "ROLE FIT  ·  " + "  ·  ".join(fit_parts); fits.add_theme_color_override("font_color", Color("efbc54")); stats.add_child(fits)
	var appearance_panel := PanelContainer.new(); appearance_panel.custom_minimum_size.x = 430; split.add_child(appearance_panel); var appearance := VBoxContainer.new(); appearance_panel.add_child(appearance); var appearance_heading := Label.new(); appearance_heading.text = "OUTFIT DESIGN"; appearance_heading.add_theme_font_size_override("font_size", 21); appearance.add_child(appearance_heading)
	var outfit := OptionButton.new()
	for value in bootstrap.get("content", {}).get("appearance", {}).get("outfitSilhouettes", []):
		outfit.add_item(str(value).capitalize())
		outfit.set_item_metadata(outfit.item_count-1, value)
	var saved_outfit := str(character.get("appearance", {}).get("outfit", ""))
	for outfit_index in range(outfit.item_count):
		if str(outfit.get_item_metadata(outfit_index)) == saved_outfit:
			outfit.select(outfit_index)
			break
	appearance.add_child(outfit)
	var primary := ColorPickerButton.new(); primary.text = "Primary outfit color"; primary.color = Color(str(character.get("appearance", {}).get("primaryColor", "#2f684f"))); appearance.add_child(primary)
	var secondary := ColorPickerButton.new(); secondary.text = "Secondary outfit color"; secondary.color = Color(str(character.get("appearance", {}).get("secondaryColor", "#d6a84b"))); appearance.add_child(secondary)
	var preview := Control.new(); preview.custom_minimum_size = Vector2(360, 250); preview.draw.connect(func() -> void: draw_character_preview(preview, primary.color, secondary.color)); primary.color_changed.connect(func(_color: Color) -> void: preview.queue_redraw()); secondary.color_changed.connect(func(_color: Color) -> void: preview.queue_redraw()); appearance.add_child(preview)
	var save := Button.new(); save.text = "Save appearance"
	save.pressed.connect(func() -> void:
		api.patch_json("/v1/character/appearance", {"outfit": outfit.get_item_metadata(outfit.selected), "primaryColor": "#" + primary.color.to_html(false), "secondaryColor": "#" + secondary.color.to_html(false)}, func(ok: bool, _data: Dictionary, _code: int) -> void:
			if ok: load_bootstrap()
		)
	)
	appearance.add_child(save)

func draw_character_preview(control: Control, primary: Color, secondary: Color) -> void:
	var center := Vector2(control.size.x*.5, 88); control.draw_circle(center, 34, Color("b9825c")); control.draw_rect(Rect2(center.x-48, center.y+30, 96, 118), primary, true); control.draw_rect(Rect2(center.x-48, center.y+70, 96, 18), secondary, true); control.draw_line(center+Vector2(-35,145), center+Vector2(-40,200), primary, 18); control.draw_line(center+Vector2(35,145), center+Vector2(40,200), primary, 18)

func show_skills() -> void:
	var root := make_shell("Role progression")
	var top := HBoxContainer.new(); root.add_child(top); var role_option := OptionButton.new(); populate_roles(role_option, true); top.add_child(role_option); var points := Label.new(); points.text = "%d skill points available" % int(bootstrap.get("character", {}).get("skillPoints", 0)); points.add_theme_color_override("font_color", Color("efbc54")); top.add_child(points)
	var scroll := ScrollContainer.new(); scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL; scroll.follow_focus = false; root.add_child(scroll); var tree := VBoxContainer.new(); tree.size_flags_horizontal = Control.SIZE_EXPAND_FILL; scroll.add_child(tree)
	var render := func() -> void:
		for child in tree.get_children(): child.queue_free()
		var role_id := str(role_option.get_item_metadata(role_option.selected))
		var role: Dictionary = {}
		for candidate in bootstrap.get("content", {}).get("roles", []):
			if str(candidate.get("id", "")) == role_id: role = candidate; break
		if role.is_empty(): return
		var fantasy := Label.new(); fantasy.text = str(role.get("fantasy", "")); fantasy.add_theme_font_size_override("font_size", 18); fantasy.add_theme_color_override("font_color", Color("7fd0b2")); tree.add_child(fantasy)
		var unlocked := {}
		for value in bootstrap.get("character", {}).get("unlockedSkills", []): unlocked[str(value.get("skillId", ""))] = true
		var branch_order := ["fundamentals"]
		for branch in role.get("branches", []): branch_order.append(str(branch.get("id", "")))
		for branch_id in branch_order:
			var branch_title := Label.new(); branch_title.text = str(branch_id).replace("-", " ").to_upper(); branch_title.add_theme_font_size_override("font_size", 18); branch_title.add_theme_color_override("font_color", Color("efbc54")); tree.add_child(branch_title)
			var row := HBoxContainer.new(); tree.add_child(row)
			for skill in role.get("skills", []):
				if str(skill.get("branch", "fundamentals")) != branch_id: continue
				var node := Button.new(); var is_unlocked := unlocked.has(str(skill.get("id", ""))); var requires := str(skill.get("requires", "")); var available := requires.is_empty() or unlocked.has(requires); node.text = "%s\n%d SP\n%s" % [("\u2713 " if is_unlocked else "") + str(skill.get("label", "Skill")), int(skill.get("cost", 1)), skill.get("description", "")]; node.custom_minimum_size = Vector2(188, 112); node.disabled = is_unlocked or not available; node.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
				var effect: Dictionary = skill.get("effect", {})
				var tip_parts: Array[String] = []
				if effect.has("type"): tip_parts.append(str(effect.get("type", "")).capitalize())
				if effect.has("value"): tip_parts.append("+%s" % str(effect.get("value", "")))
				node.tooltip_text = " ".join(tip_parts) if not tip_parts.is_empty() else str(skill.get("description", ""))
				var skill_id := str(skill.get("id", ""))
				var unlock_role := role_id
				node.set_meta("skill_id", skill_id)
				node.set_meta("role_id", unlock_role)
				node.pressed.connect(unlock_skill.bind(node))
				row.add_child(node)
	role_option.item_selected.connect(func(_index: int) -> void: render.call()); render.call()

func unlock_skill(button: Button) -> void:
	var skill_id := str(button.get_meta("skill_id", ""))
	var role_id := str(button.get_meta("role_id", ""))
	log_debug("[SKILL] Unlocking %s for role %s" % [skill_id, role_id])
	show_status("Unlocking...")
	api.post_json("/v1/character/skills/unlock", {"roleId": role_id, "skillId": skill_id}, func(ok: bool, _data: Dictionary, _code: int) -> void:
		if ok:
			log_debug("[SKILL] Success")
			load_bootstrap()
		else:
			log_debug("[SKILL] Failed")
	)

func log_out() -> void:
	api.post_json("/v1/auth/logout", {}, func(_ok: bool, _data: Dictionary, _code: int) -> void:
		realtime.close(); store.clear(); api.session_token = ""; bootstrap = {}; show_login()
	)

func show_status(message: String) -> void:
	if is_instance_valid(status_label): status_label.text = message
