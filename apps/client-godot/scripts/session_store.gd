class_name RroSessionStore
extends RefCounted

const PATH := "user://session.cfg"

func load_token() -> String:
	var config := ConfigFile.new()
	if config.load(PATH) != OK:
		return ""
	return str(config.get_value("session", "token", ""))

func save_token(token: String) -> void:
	var config := ConfigFile.new()
	config.load(PATH)
	config.set_value("session", "token", token)
	config.save(PATH)

func load_server_url() -> String:
	var config := ConfigFile.new()
	if config.load(PATH) != OK:
		return "http://127.0.0.1:8788"
	return str(config.get_value("session", "server_url", "http://127.0.0.1:8788"))

func save_server_url(url: String) -> void:
	var config := ConfigFile.new()
	config.load(PATH)
	config.set_value("session", "server_url", url)
	config.save(PATH)

func clear() -> void:
	var config := ConfigFile.new()
	config.set_value("session", "token", "")
	config.save(PATH)
