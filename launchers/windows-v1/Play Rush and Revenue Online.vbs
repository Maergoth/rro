Option Explicit

Dim fso, shell, root, gameExe, serverStart, attempt, godotExe
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
root = fso.GetParentFolderName(WScript.ScriptFullName)
gameExe = fso.BuildPath(root, "Rush & Revenue Online.exe")
serverStart = fso.BuildPath(root, "Start RRO Server.vbs")

If fso.FileExists(serverStart) And Not ServerHealthy() Then shell.Run Chr(34) & serverStart & Chr(34), 0, False
For attempt = 1 To 80
  If ServerHealthy() Then Exit For
  WScript.Sleep 125
Next
If Not ServerHealthy() Then
  MsgBox "The local world server is not available. Use RRO Server Control to start it.", vbExclamation, "Rush & Revenue Online"
  WScript.Quit 2
End If

If fso.FileExists(gameExe) Then
  shell.CurrentDirectory = root
  shell.Run Chr(34) & gameExe & Chr(34), 1, False
  WScript.Quit 0
End If

' Developer-source convenience: open the native project only when an installed editor is found.
godotExe = FindGodot()
If Len(godotExe) > 0 And fso.FileExists(fso.BuildPath(root, "client-source\project.godot")) Then
  shell.Run Chr(34) & godotExe & Chr(34) & " --editor --path " & Chr(34) & fso.BuildPath(root, "client-source") & Chr(34), 1, False
  WScript.Quit 0
End If

MsgBox "This source package does not contain a fabricated game executable." & vbCrLf & vbCrLf & "Export the Godot project for Windows to produce:" & vbCrLf & gameExe, vbInformation, "Native client export required"
WScript.Quit 3

Function ServerHealthy()
  On Error Resume Next
  Dim http
  Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
  http.SetTimeouts 250,250,250,250
  http.Open "GET", "http://127.0.0.1:8788/health", False
  http.Send
  ServerHealthy = (Err.Number = 0 And http.Status = 200)
  Err.Clear
  On Error GoTo 0
End Function

Function FindGodot()
  Dim candidates, value
  candidates = Array(fso.BuildPath(root, "Godot.exe"), shell.ExpandEnvironmentStrings("%ProgramFiles%\Godot\Godot.exe"), shell.ExpandEnvironmentStrings("%LOCALAPPDATA%\Programs\Godot\Godot.exe"))
  For Each value In candidates
    If fso.FileExists(value) Then FindGodot = value: Exit Function
  Next
  FindGodot = ""
End Function
