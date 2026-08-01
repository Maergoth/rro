class_name MinigameStage
extends Control

var grammar := "process"
var phase_index := 0
var elapsed := 0.0
var pulse := 0.0

func configure(new_grammar: String, new_phase: int) -> void:
	grammar = new_grammar
	phase_index = new_phase
	elapsed = 0.0
	queue_redraw()

func _process(delta: float) -> void:
	elapsed += delta
	pulse = (sin(elapsed * 2.4) + 1.0) * 0.5
	queue_redraw()

func _draw() -> void:
	draw_style_box(make_box(Color("111a1d"), Color("2b4147"), 1), Rect2(Vector2.ZERO, size))
	var area := Rect2(18, 18, maxf(10, size.x - 36), maxf(10, size.y - 36))
	match grammar:
		"dialogue": draw_dialogue(area)
		"orchestration": draw_orchestration(area)
		"allocation": draw_allocation(area)
		"scheduling": draw_scheduling(area)
		"evidence": draw_evidence(area)
		"diagnosis": draw_diagnosis(area)
		"memory": draw_memory(area)
		"precision": draw_precision(area)
		"packing": draw_packing(area)
		"route": draw_route(area)
		"construction": draw_construction(area)
		_: draw_process(area)

func make_box(fill: Color, border: Color, width: int) -> StyleBoxFlat:
	var box := StyleBoxFlat.new()
	box.bg_color = fill
	box.border_color = border
	box.set_border_width_all(width)
	box.set_corner_radius_all(8)
	return box

func label(text: String, position: Vector2, color := Color("c9d1cf"), font_size := 14) -> void:
	draw_string(ThemeDB.fallback_font, position, text, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, color)

func draw_dialogue(area: Rect2) -> void:
	label("READ → RESPOND → CONFIRM", area.position + Vector2(0, 14), Color("7fd0b2"))
	for index in range(3):
		var x: float = area.position.x + 22 + index * minf(115, area.size.x / 3.2)
		draw_circle(Vector2(x, area.position.y + 56), 14, Color("d8a94d") if index == phase_index else Color("2d4b50"))
		if index < 2: draw_line(Vector2(x + 18, area.position.y + 56), Vector2(x + 88, area.position.y + 56), Color("52696d"), 3)
	label("Tone and evidence matter more than speed.", area.position + Vector2(0, 96), Color("91a1a1"), 12)

func draw_orchestration(area: Rect2) -> void:
	label("LIVE QUEUE", area.position + Vector2(0, 14), Color("7fd0b2"))
	var widths: Array[float] = [0.92, 0.7, 0.84, 0.55, 0.63]
	for index in range(5):
		var width: float = area.size.x * widths[index]
		draw_rect(Rect2(area.position + Vector2(0, 28 + index * 18), Vector2(width, 11)), Color("d65b4c") if index == phase_index else Color("34565a"), true)

func draw_allocation(area: Rect2) -> void:
	label("PROTECT THE RESERVE", area.position + Vector2(0, 14), Color("7fd0b2"))
	draw_rect(Rect2(area.position + Vector2(0, 34), Vector2(area.size.x, 28)), Color("243439"), true)
	draw_rect(Rect2(area.position + Vector2(0, 34), Vector2(area.size.x * (0.55 + pulse * 0.15), 28)), Color("d8a94d"), true)
	label("CASH", area.position + Vector2(8, 54), Color("151b1c"), 12)

func draw_scheduling(area: Rect2) -> void:
	label("SERVICE TIMELINE", area.position + Vector2(0, 14), Color("7fd0b2"))
	draw_line(area.position + Vector2(0, 61), area.position + Vector2(area.size.x, 61), Color("52696d"), 3)
	for index in range(5):
		var x: float = area.position.x + area.size.x * (index + 0.5) / 5.0
		draw_rect(Rect2(x - 9, area.position.y + 33 + (index % 2) * 16, 18, 32), Color("d8a94d") if index == phase_index else Color("3c6063"), true)

func draw_evidence(area: Rect2) -> void:
	label("RECONCILE THE RECORD", area.position + Vector2(0, 14), Color("7fd0b2"))
	for index in range(3):
		var y: float = area.position.y + 33 + index * 25
		draw_rect(Rect2(area.position.x, y, 16, 16), Color("d8a94d") if index <= phase_index else Color("223136"), true)
		label(["Source record", "Physical state", "Signed owner"][index], Vector2(area.position.x + 25, y + 13), Color("c9d1cf"), 12)

func draw_diagnosis(area: Rect2) -> void:
	label("SYMPTOM → TEST → CAUSE", area.position + Vector2(0, 14), Color("7fd0b2"))
	var center := area.get_center() + Vector2(0, 10)
	draw_circle(center, 20, Color("d65b4c") if phase_index == 0 else Color("d8a94d"))
	for angle in [0.0, 2.1, 4.2]:
		var end := center + Vector2.from_angle(angle) * 58
		draw_line(center, end, Color("52696d"), 2)
		draw_circle(end, 8, Color("7fd0b2") if phase_index > 0 else Color("34565a"))

func draw_memory(area: Rect2) -> void:
	label("ENCODE THE EXCEPTIONS", area.position + Vector2(0, 14), Color("7fd0b2"))
	for index in range(6):
		var rect := Rect2(area.position.x + index * minf(42, area.size.x / 6.0), area.position.y + 38, 30, 42)
		draw_rect(rect, Color("d8a94d") if (index + phase_index) % 3 == 0 else Color("2d4b50"), true)
		label(str(index + 1), rect.position + Vector2(10, 27), Color("f2f0df"), 12)

func draw_precision(area: Rect2) -> void:
	label("CONTROLLED WINDOW", area.position + Vector2(0, 14), Color("7fd0b2"))
	var y := area.position.y + 58
	draw_line(Vector2(area.position.x, y), Vector2(area.end.x, y), Color("52696d"), 8)
	draw_line(Vector2(area.position.x + area.size.x * .42, y), Vector2(area.position.x + area.size.x * .58, y), Color("7fd0b2"), 10)
	draw_circle(Vector2(area.position.x + area.size.x * pulse, y), 10, Color("f0bd55"))

func draw_packing(area: Rect2) -> void:
	label("BALANCE • ACCESS • CLEARANCE", area.position + Vector2(0, 14), Color("7fd0b2"))
	for y in range(2):
		for x in range(6):
			var filled := x + y * 6 < 5 + phase_index * 2
			draw_rect(Rect2(area.position + Vector2(x * 34, 32 + y * 34), Vector2(28, 28)), Color("d8a94d") if filled else Color("273b40"), true)

func draw_route(area: Rect2) -> void:
	label("CHAIN SAFE STOPS", area.position + Vector2(0, 14), Color("7fd0b2"))
	var points := PackedVector2Array([area.position+Vector2(10,80), area.position+Vector2(area.size.x*.3,35), area.position+Vector2(area.size.x*.62,78), area.position+Vector2(area.size.x-15,42)])
	draw_polyline(points, Color("52696d"), 5)
	for index in range(points.size()): draw_circle(points[index], 9, Color("d8a94d") if index <= phase_index + 1 else Color("34565a"))

func draw_process(area: Rect2) -> void:
	label("SET → CONTROL → VERIFY", area.position + Vector2(0, 14), Color("7fd0b2"))
	var center := area.get_center() + Vector2(0, 10)
	draw_arc(center, 45, PI, TAU, 48, Color("52696d"), 8)
	var angle := PI + pulse * PI
	draw_line(center, center + Vector2.from_angle(angle) * 38, Color("d8a94d"), 4)
	draw_circle(center, 6, Color("f2f0df"))

func draw_construction(area: Rect2) -> void:
	label("FLOW AND CLEARANCE", area.position + Vector2(0, 14), Color("7fd0b2"))
	for x in range(8):
		for y in range(3):
			var rect := Rect2(area.position + Vector2(x*27, 29+y*27), Vector2(24,24))
			draw_rect(rect, Color("d8a94b") if x in [phase_index+1, phase_index+2] and y == 1 else Color("263b40"), true)
