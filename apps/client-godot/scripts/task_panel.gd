class_name TaskPanel
extends VBoxContainer

signal task_claim_requested(task_id: String)
signal task_action_requested(task_id: String, action: String)

var character_id := ""
var current_role_id := ""
var tasks: Array = []
var selected_task: Dictionary = {}
var queue_box: VBoxContainer
var detail_box: VBoxContainer
var title_label: Label
var role_label: Label
var prompt_label: Label
var consequence_label: Label
var stage: MinigameStage
var action_box: HBoxContainer

func _ready() -> void:
	add_theme_constant_override("separation", 10)
	title_label = Label.new()
	title_label.text = "ROLE WORKBOARD"
	title_label.add_theme_font_size_override("font_size", 20)
	title_label.add_theme_color_override("font_color", Color("7fd0b2"))
	add_child(title_label)
	var queue_scroll := ScrollContainer.new()
	queue_scroll.custom_minimum_size = Vector2(330, 215)
	queue_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	queue_box = VBoxContainer.new()
	queue_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	queue_scroll.add_child(queue_box)
	add_child(queue_scroll)
	add_child(HSeparator.new())
	detail_box = VBoxContainer.new()
	detail_box.add_theme_constant_override("separation", 7)
	role_label = Label.new()
	role_label.add_theme_font_size_override("font_size", 13)
	detail_box.add_child(role_label)
	prompt_label = Label.new()
	prompt_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	prompt_label.custom_minimum_size = Vector2(300, 48)
	prompt_label.add_theme_font_size_override("font_size", 16)
	detail_box.add_child(prompt_label)
	stage = MinigameStage.new()
	stage.custom_minimum_size = Vector2(330, 142)
	detail_box.add_child(stage)
	consequence_label = Label.new()
	consequence_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	consequence_label.add_theme_color_override("font_color", Color("92a5a6"))
	consequence_label.add_theme_font_size_override("font_size", 12)
	detail_box.add_child(consequence_label)
	action_box = HBoxContainer.new()
	action_box.add_theme_constant_override("separation", 8)
	detail_box.add_child(action_box)
	add_child(detail_box)
	show_empty_detail()

func set_state(snapshot: Dictionary, own_character_id: String, role_id: String) -> void:
	character_id = own_character_id
	current_role_id = role_id
	tasks = snapshot.get("tasks", [])
	refresh_queue()
	if not selected_task.is_empty():
		for task in tasks:
			if str(task.get("id", "")) == str(selected_task.get("id", "")):
				select_task(task)
				return
		selected_task = {}
		show_empty_detail()

func refresh_queue() -> void:
	for child in queue_box.get_children(): child.queue_free()
	var owned_count := 0
	for task in tasks:
		var task_role := str(task.get("ownerRoleId", ""))
		var off_role := task_role != current_role_id
		var claimed_by := str(task.get("claimedByCharacterId", ""))
		var unavailable := not claimed_by.is_empty() and claimed_by != character_id
		if not off_role: owned_count += 1
		var button := Button.new()
		var due_seconds := int((float(task.get("dueAt", 0)) - Time.get_unix_time_from_system() * 1000.0) / 1000.0)
		var marker := "YOUR ROLE" if not off_role else "OFF ROLE −18"
		button.text = "%s  ·  %s\n%s  ·  %ds" % [str(task.get("label", "Work")), marker, str(task.get("lane", "now")).to_upper(), due_seconds]
		button.alignment = HORIZONTAL_ALIGNMENT_LEFT
		button.custom_minimum_size = Vector2(315, 52)
		button.disabled = unavailable
		button.tooltip_text = "This interaction belongs to %s." % task_role if off_role else "Owned responsibility."
		button.pressed.connect(func() -> void: select_task(task))
		queue_box.add_child(button)
	if tasks.is_empty():
		var empty := Label.new()
		empty.text = "The crew queue is clear. Preventive work will arrive shortly."
		empty.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		queue_box.add_child(empty)
	title_label.text = "ROLE WORKBOARD  ·  %d OWNED" % owned_count

func select_task(task: Dictionary) -> void:
	selected_task = task
	var owner_role := str(task.get("ownerRoleId", ""))
	var off_role := owner_role != current_role_id
	var claimed_by := str(task.get("claimedByCharacterId", ""))
	role_label.text = "%s RESPONSIBILITY%s" % [owner_role.to_upper(), "  ·  OFF-ROLE PENALTY" if off_role else ""]
	role_label.add_theme_color_override("font_color", Color("d65b4c") if off_role else Color("7fd0b2"))
	var phase: Dictionary = task.get("phase", {})
	prompt_label.text = "%s\n%s" % [str(task.get("label", "Work")), str(phase.get("prompt", "Choose the next controlled action."))]
	stage.configure(str(task.get("grammar", "process")), int(task.get("phaseIndex", 0)))
	consequence_label.text = grammar_help(str(task.get("grammar", "process")))
	for child in action_box.get_children(): child.queue_free()
	if claimed_by.is_empty():
		var claim := Button.new()
		claim.text = "Claim task%s" % (" (−18 off-role)" if off_role else "")
		claim.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		claim.pressed.connect(func() -> void: task_claim_requested.emit(str(task.get("id", ""))))
		action_box.add_child(claim)
	elif claimed_by == character_id:
		var actions: Array = phase.get("actions", [])
		for index in range(actions.size()):
			var action := str(actions[index])
			var button := Button.new()
			button.text = humanize(action)
			button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			button.add_theme_color_override("font_color", Color("f3e8c8") if index == 0 else Color("e68b7e"))
			button.tooltip_text = "Controlled response" if index == 0 else "Faster/riskier response; failure can create incidents and review evidence."
			button.pressed.connect(func() -> void: task_action_requested.emit(str(task.get("id", "")), action))
			action_box.add_child(button)
	else:
		var coworker := Label.new()
		coworker.text = "Claimed by a coworker"
		action_box.add_child(coworker)

func show_empty_detail() -> void:
	role_label.text = "SELECT OWNED WORK"
	prompt_label.text = "Every interaction is multi-step and fallible. Choose a queue item to begin."
	consequence_label.text = "Late work drains patience. Risky decisions can create spills, refires, sanitation loss, comps, and evidence-backed reviews."
	stage.configure("process", 0)
	for child in action_box.get_children(): child.queue_free()

func humanize(value: String) -> String:
	return value.replace("-", " ").capitalize()

func grammar_help(grammar: String) -> String:
	var help := {
		"dialogue": "Observe the guest's stated need, answer it directly, then close the loop.",
		"orchestration": "Resolve dependency pressure—not simply the oldest card.",
		"allocation": "Protect reserves while committing enough resources to change the outcome.",
		"scheduling": "Fit hard constraints, buffers, and promised times without collision.",
		"evidence": "Reconcile paperwork against physical state before signing responsibility.",
		"diagnosis": "Inspect, test a cause, then verify the correction.",
		"memory": "Encode seats, modifiers, exceptions, and the high-risk confirmation.",
		"precision": "Set up safely, control the gesture, inspect before handoff.",
		"packing": "Optimize compatibility, balance, access, and downstream unloading.",
		"route": "Scan hazards and chain full-hands stops with explicit handoffs.",
		"process": "Calibrate, control concurrent state, verify release.",
		"construction": "Measure utilities and clearance, place for flow, simulate before commit.",
	}
	return str(help.get(grammar, help.process))
