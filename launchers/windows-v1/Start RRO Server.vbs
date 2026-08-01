Option Explicit

Dim fso, shell, root, nodeExe, serverEntry, command, attempt
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
root = fso.GetParentFolderName(WScript.ScriptFullName)
nodeExe = fso.BuildPath(root, "runtime\node.exe")
serverEntry = fso.BuildPath(root, "app\server\index.js")

If ServerHealthy() Then WScript.Quit 0
If Not fso.FileExists(nodeExe) Then
  MsgBox "The pinned Windows server runtime is missing:" & vbCrLf & nodeExe & vbCrLf & vbCrLf & "Re-extract the complete standalone server ZIP.", vbCritical, "Rush & Revenue Online Server"
  WScript.Quit 2
End If
If Not fso.FileExists(serverEntry) Then
  MsgBox "The V1 server application is missing:" & vbCrLf & serverEntry, vbCritical, "Rush & Revenue Online Server"
  WScript.Quit 3
End If

EnsureFolder fso.BuildPath(root, "data")
EnsureFolder fso.BuildPath(root, "run")
EnsureFolder fso.BuildPath(root, "logs")
shell.CurrentDirectory = root
command = Quote(nodeExe) & " --no-warnings " & Quote(serverEntry)
shell.Run command, 0, False

For attempt = 1 To 80
  WScript.Sleep 125
  If ServerHealthy() Then WScript.Quit 0
Next

MsgBox "The server did not become healthy within ten seconds. Open RRO Server Control and review the installation.", vbExclamation, "Rush & Revenue Online Server"
WScript.Quit 4

Function ServerHealthy()
  On Error Resume Next
  Dim http
  Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
  http.SetTimeouts 250, 250, 250, 250
  http.Open "GET", "http://127.0.0.1:8788/health", False
  http.Send
  ServerHealthy = (Err.Number = 0 And http.Status = 200 And InStr(http.ResponseText, """protocol"":""rro.v1""") > 0)
  Err.Clear
  On Error GoTo 0
End Function

Sub EnsureFolder(path)
  If Not fso.FolderExists(path) Then fso.CreateFolder path
End Sub

Function Quote(value)
  Quote = Chr(34) & value & Chr(34)
End Function
