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
	config.set_value("session", "token", token)
	config.save(PATH)

func clear() -> void:
	var config := ConfigFile.new()
	config.set_value("session", "token", "")
	config.save(PATH)
