class_name WorldGlobe
extends Control

signal country_selected(country: Dictionary)

var countries: Array = []
var selected_id := ""
var hover_id := ""
var globe_zoom := 1.0
var target_zoom := 1.0
var focus := Vector2.ZERO
var target_focus := Vector2.ZERO

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP
	set_process(true)
	queue_redraw()

func set_countries(value: Array) -> void:
	countries = value
	queue_redraw()

func _process(delta: float) -> void:
	globe_zoom = lerpf(globe_zoom, target_zoom, min(1.0, delta * 5.0))
	focus = focus.lerp(target_focus, min(1.0, delta * 5.0))
	queue_redraw()

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion:
		hover_id = country_at(event.position)
		queue_redraw()
	elif event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var id := country_at(event.position)
		for country in countries:
			if str(country.get("id", "")) == id:
				selected_id = id
				target_zoom = 1.28
				target_focus = country_point(country) - size * 0.5
				country_selected.emit(country)
				queue_redraw()
				accept_event()
	elif event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_RIGHT:
		selected_id = ""
		target_zoom = 1.0
		target_focus = Vector2.ZERO
		queue_redraw()
		accept_event()
	elif event is InputEventMouseButton and event.pressed and event.button_index in [MOUSE_BUTTON_WHEEL_UP, MOUSE_BUTTON_WHEEL_DOWN]:
		target_zoom = clampf(target_zoom + (0.1 if event.button_index == MOUSE_BUTTON_WHEEL_UP else -0.1), 0.85, 1.55)
		accept_event()

func globe_rect() -> Rect2:
	var diameter := minf(size.x * 0.88, size.y * 0.92)
	return Rect2((size - Vector2(diameter, diameter)) * 0.5, Vector2(diameter, diameter))

func country_point(country: Dictionary) -> Vector2:
	var rect := globe_rect()
	var raw := rect.position + Vector2(float(country.get("x", 50)) / 100.0 * rect.size.x, float(country.get("y", 50)) / 100.0 * rect.size.y)
	var center := rect.get_center()
	return center + (raw - center - focus) * globe_zoom

func country_at(point: Vector2) -> String:
	var best := ""
	var distance := 24.0
	for country in countries:
		var candidate := point.distance_to(country_point(country))
		if candidate < distance:
			distance = candidate
			best = str(country.get("id", ""))
	return best

func _draw() -> void:
	var rect := globe_rect()
	var center := rect.get_center()
	var radius := rect.size.x * 0.5
	draw_circle(center, radius + 14.0, Color("182226"))
	draw_circle(center, radius, Color("0d2730"))
	for index in range(1, 6):
		var latitude_y: float = center.y - radius + index * radius * 2.0 / 6.0
		var half_width := sqrt(maxf(0.0, radius * radius - pow(latitude_y - center.y, 2.0)))
		draw_line(Vector2(center.x - half_width, latitude_y), Vector2(center.x + half_width, latitude_y), Color("284854"), 1.0)
	for index in range(-3, 4):
		var x: float = center.x + index * radius / 4.0
		var half_height := sqrt(maxf(0.0, radius * radius - pow(x - center.x, 2.0)))
		draw_arc(center, Vector2(half_height * 0.35, half_height).length() * 0.7, -PI * 0.5, PI * 0.5, 32, Color("23434e"), 1.0)
	# Stylized land plates keep the globe readable without a baked world image.
	var land := Color("315947")
	draw_colored_polygon(PackedVector2Array([center + Vector2(-radius*.78,-radius*.3), center + Vector2(-radius*.35,-radius*.68), center+Vector2(-radius*.1,-radius*.25), center+Vector2(-radius*.28,radius*.12), center+Vector2(-radius*.58,radius*.27)]), land)
	draw_colored_polygon(PackedVector2Array([center+Vector2(-radius*.18,-radius*.65), center+Vector2(radius*.42,-radius*.7), center+Vector2(radius*.75,-radius*.28), center+Vector2(radius*.3,-radius*.05), center+Vector2(radius*.08,radius*.45), center+Vector2(-radius*.18,radius*.2)]), land)
	draw_colored_polygon(PackedVector2Array([center+Vector2(radius*.5,radius*.25), center+Vector2(radius*.82,radius*.42), center+Vector2(radius*.66,radius*.66), center+Vector2(radius*.35,radius*.55)]), land)
	draw_arc(center, radius, 0, TAU, 96, Color("6b9aa3"), 3.0)
	for country in countries:
		var point := country_point(country)
		if point.distance_to(center) > radius - 8.0:
			continue
		var id := str(country.get("id", ""))
		var active := id == selected_id
		var hovered := id == hover_id
		var color := Color("f2bd54") if active else (Color("e5e7cf") if hovered else Color("84d2b6"))
		draw_circle(point, 10.0 if active else 7.0, Color(color, 0.22))
		draw_circle(point, 5.0 if active else 3.5, color)
		if active or hovered:
			draw_string(ThemeDB.fallback_font, point + Vector2(12, 5), "%s  %s" % [country.get("flag", ""), country.get("name", "")], HORIZONTAL_ALIGNMENT_LEFT, -1, 16, Color("f5f1df"))
	draw_string(ThemeDB.fallback_font, Vector2(24, 32), "GLOBAL HOSPITALITY NETWORK", HORIZONTAL_ALIGNMENT_LEFT, -1, 18, Color("84d2b6"))
	draw_string(ThemeDB.fallback_font, Vector2(24, 56), "Click a country • wheel to zoom • right-click to reset", HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color("8da0a2"))
