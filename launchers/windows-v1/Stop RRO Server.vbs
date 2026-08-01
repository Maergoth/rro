Option Explicit

Dim fso, shell, root, tokenPath, pidPath, token, http, pid
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
root = fso.GetParentFolderName(WScript.ScriptFullName)
tokenPath = fso.BuildPath(root, "run\rro-control.token")
pidPath = fso.BuildPath(root, "run\rro-server.pid")

If Not ServerHealthy() Then
  CleanMarkers
  WScript.Quit 0
End If

If fso.FileExists(tokenPath) Then
  token = Trim(ReadText(tokenPath))
  If Len(token) >= 32 Then
    On Error Resume Next
    Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
    http.SetTimeouts 500, 500, 1000, 1000
    http.Open "POST", "http://127.0.0.1:8788/v1/local-admin/shutdown", False
    http.SetRequestHeader "X-RRO-Control-Token", token
    http.SetRequestHeader "Content-Type", "application/json"
    http.Send "{}"
    If Err.Number = 0 And http.Status = 202 Then
      On Error GoTo 0
      WaitForStop
      CleanMarkers
      WScript.Quit 0
    End If
    Err.Clear
    On Error GoTo 0
  End If
End If

' Exact-PID fallback is used only if the loopback graceful-control endpoint is unavailable.
If fso.FileExists(pidPath) Then
  pid = Trim(ReadText(pidPath))
  If IsNumeric(pid) And Len(pid) < 12 Then shell.Run "taskkill.exe /PID " & CLng(pid) & " /T /F", 0, True
End If
CleanMarkers

Function ServerHealthy()
  On Error Resume Next
  Dim request
  Set request = CreateObject("WinHttp.WinHttpRequest.5.1")
  request.SetTimeouts 250, 250, 250, 250
  request.Open "GET", "http://127.0.0.1:8788/health", False
  request.Send
  ServerHealthy = (Err.Number = 0 And request.Status = 200)
  Err.Clear
  On Error GoTo 0
End Function

Sub WaitForStop()
  Dim attempt
  For attempt = 1 To 40
    WScript.Sleep 125
    If Not ServerHealthy() Then Exit Sub
  Next
End Sub

Function ReadText(path)
  Dim stream
  Set stream = fso.OpenTextFile(path, 1, False)
  ReadText = stream.ReadAll
  stream.Close
End Function

Sub CleanMarkers()
  On Error Resume Next
  If fso.FileExists(tokenPath) Then fso.DeleteFile tokenPath, True
  If fso.FileExists(pidPath) Then fso.DeleteFile pidPath, True
  On Error GoTo 0
End Sub
