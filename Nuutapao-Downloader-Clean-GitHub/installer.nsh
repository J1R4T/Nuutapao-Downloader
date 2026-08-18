!include "LogicLib.nsh"
!include "WinMessages.nsh"

!define MUI_DIRECTORYPAGE_VERIFY

!macro FixInstDirMacro
  Push $0
  Push $1
  Push $2

  StrCpy $0 $INSTDIR

  # Remove trailing backslash if present (e.g. "D:\" -> "D:")
  StrCpy $1 $0 1 -1
  ${If} $1 == "\"
    StrCpy $0 $0 -1
  ${EndIf}

  # Check if path already ends with "Nuutapao Downloader" or "Nuudownloader"
  StrLen $2 "Nuutapao Downloader"
  StrCpy $1 $0 "" -$2
  ${If} $1 != "Nuutapao Downloader"
    StrLen $2 "Nuudownloader"
    StrCpy $1 $0 "" -$2
    ${If} $1 != "Nuudownloader"
      StrCpy $0 "$0\Nuutapao Downloader"
    ${EndIf}
  ${EndIf}

  StrCpy $INSTDIR $0

  # Update edit box control 1019 if dialog is open
  FindWindow $1 "#32770" "" $HWNDPARENT
  ${If} $1 != 0
    GetDlgItem $2 $1 1019
    ${If} $2 != 0
      SendMessage $2 ${WM_SETTEXT} 0 "STR:$INSTDIR"
    ${EndIf}
  ${EndIf}

  Pop $2
  Pop $1
  Pop $0
!macroend

!macro customPageAfterDirectoryShow
  !insertmacro FixInstDirMacro
!macroend

!macro customPageAfterDirectory
  !insertmacro FixInstDirMacro
!macroend
