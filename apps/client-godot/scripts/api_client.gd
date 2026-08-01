class_name RroApiClient
extends Node

signal request_failed(message: String)

var server_url := "http://127.0.0.1:8788"
var session_token := ""

func request_json(path: String, method: int, payload: Dictionary, callback: Callable) -> void:
	var request := HTTPRequest.new()
	request.timeout = 15.0
	add_child(request)
	request.request_completed.connect(func(result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
		var text := body.get_string_from_utf8()
		var parsed = JSON.parse_string(text) if not text.is_empty() else {}
		if parsed == null:
			parsed = {"error": {"message": "The server returned invalid JSON."}}
		var ok := result == HTTPRequest.RESULT_SUCCESS and response_code >= 200 and response_code < 300
		if not ok:
			var message := "Request failed (%d)." % response_code
			if parsed is Dictionary and parsed.has("error"):
				message = str(parsed.error.get("message", message))
			request_failed.emit(message)
		callback.call(ok, parsed, response_code)
		request.queue_free()
	)
	var headers := PackedStringArray(["Content-Type: application/json", "Accept: application/json"])
	if not session_token.is_empty():
		headers.append("Authorization: Bearer %s" % session_token)
	var request_body := "" if method == HTTPClient.METHOD_GET or method == HTTPClient.METHOD_DELETE else JSON.stringify(payload)
	var error := request.request(server_url.trim_suffix("/") + path, headers, method, request_body)
	if error != OK:
		request_failed.emit("Could not connect to the local world server.")
		callback.call(false, {"error": {"message": "Could not start request."}}, 0)
		request.queue_free()

func get_json(path: String, callback: Callable) -> void:
	request_json(path, HTTPClient.METHOD_GET, {}, callback)

func post_json(path: String, payload: Dictionary, callback: Callable) -> void:
	request_json(path, HTTPClient.METHOD_POST, payload, callback)

func patch_json(path: String, payload: Dictionary, callback: Callable) -> void:
	request_json(path, HTTPClient.METHOD_PATCH, payload, callback)

func put_json(path: String, payload: Dictionary, callback: Callable) -> void:
	request_json(path, HTTPClient.METHOD_PUT, payload, callback)

func delete_json(path: String, callback: Callable) -> void:
	request_json(path, HTTPClient.METHOD_DELETE, {}, callback)
