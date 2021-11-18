# From https://gist.github.com/jhandley/1ec569242170454c593a3b1642cc995e

# Install webview2 by launching the bootstrapper
# See https://docs.microsoft.com/en-us/microsoft-edge/webview2/concepts/distribution#online-only-deployment
Function installWebView2

	# If this key exists and is not empty then webview2 is already installed
	ReadRegStr $0 HKLM \
        	"SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" "pv"

	${If} ${Errors} 
	${OrIf} $0 == ""

		SetDetailsPrint both
		DetailPrint "Installing: WebView2 Runtime"
		SetDetailsPrint listonly
		
		InitPluginsDir
		CreateDirectory "$pluginsdir"
		SetOutPath "$pluginsdir"
		File "MicrosoftEdgeWebview2Setup.exe"
		ExecWait '"$pluginsdir\MicrosoftEdgeWebview2Setup.exe" /silent /install'
		
		SetDetailsPrint both

	${EndIf}

FunctionEnd