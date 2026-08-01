class_name RroRealtimeClient
extends Node

signal connected_to_world
signal snapshot_received(snapshot: Dictionary)
signal command_acknowledged(command_id: String, result: Dictionary)
signal realtime_error(message: String)
signal shift_closed(shift_id: String)

var socket := WebSocketPeer.new()
var token := ""
var server_url := "http://127.0.0.1:8788"
var subscribed_shift_id := ""
var authenticated := false
var connection_started := false

func connect_world(base_url: String, session_token: String) -> void:
	close()
	server_url = base_url
	token = session_token
	var ws_url := base_url.replace("https://", "wss://").replace("http://", "ws://").trim_suffix("/") + "/v1/realtime"
	var error := socket.connect_to_url(ws_url)
	if error != OK:
		realtime_error.emit("Could not open the realtime connection.")
		return
	connection_started = true
	set_process(true)

func subscribe(shift_id: String) -> void:
	subscribed_shift_id = shift_id
	if authenticated:
		send_message({"type": "subscribe", "shiftId": shift_id})

func send_command(command_type: String, shift_id: String, payload: Dictionary) -> String:
	var command_id := "%s-%d-%d" % [command_type, Time.get_ticks_msec(), randi()]
	send_message({"type": "command", "command": {"id": command_id, "type": command_type, "shiftId": shift_id, "payload": payload}})
	return command_id

func send_message(message: Dictionary) -> void:
	if socket.get_ready_state() == WebSocketPeer.STATE_OPEN:
		socket.send_text(JSON.stringify(message))

func close() -> void:
	if socket.get_ready_state() == WebSocketPeer.STATE_OPEN:
		socket.close(1000, "Client leaving")
	socket = WebSocketPeer.new()
	authenticated = false
	connection_started = false
	set_process(false)

func _process(_delta: float) -> void:
	if not connection_started:
		return
	socket.poll()
	var state := socket.get_ready_state()
	if state == WebSocketPeer.STATE_OPEN and not authenticated:
		send_message({"type": "auth", "token": token})
		authenticated = true
	elif state == WebSocketPeer.STATE_CLOSED:
		var reason := socket.get_close_reason()
		connection_started = false
		set_process(false)
		if not reason.is_empty() and reason != "Client leaving":
			realtime_error.emit("Realtime disconnected: %s" % reason)
		return
	while socket.get_available_packet_count() > 0:
		var message = JSON.parse_string(socket.get_packet().get_string_from_utf8())
		if not message is Dictionary:
			continue
		match str(message.get("type", "")):
			"ready":
				connected_to_world.emit()
				if not subscribed_shift_id.is_empty():
					send_message({"type": "subscribe", "shiftId": subscribed_shift_id})
			"snapshot":
				snapshot_received.emit(message.get("data", {}))
			"command.ack":
				command_acknowledged.emit(str(message.get("commandId", "")), message.get("result", {}))
			"shift.closed":
				shift_closed.emit(str(message.get("shiftId", "")))
			"error":
				realtime_error.emit(str(message.get("error", {}).get("message", "Realtime command failed.")))
