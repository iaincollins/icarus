package main

import (
	"bytes"
	"flag"
	"fmt"
	"github.com/nvsoft/win"
	"github.com/phayes/freeport"
	"github.com/sqweek/dialog"
	"github.com/webview/webview"
	"os"
	"os/exec"
	"syscall"
	"time"
	"unsafe"
)

// Window title declared here as to identify if the app is aleady running
const ICON = "icon.ico"
const LAUNCHER_WINDOW_TITLE = "ICARUS Terminal Launcher"
const TERMINAL_WINDOW_TITLE = "ICARUS Terminal"
const LPSZ_CLASS_NAME = "IcarusTerminalWindowClass"
const SERVICE_EXECUTABLE = "ICARUS Service.exe"
const TERMINAL_EXECUTABLE = "ICARUS Terminal.exe"
const DEBUGGER = true

const defaultLauncherWindowWidth = int32(640)
const defaultLauncherWindowHeight = int32(480)
const defaultWindowWidth = int32(1024)
const defaultWindowHeight = int32(768)

var defaultPort = 0 // Set to 0 to be assigned a free high numbered port
var port int        // Actual port we are running on
var webViewInstance webview.WebView

// Track main window size when switching to/from fullscreen
var windowWidth = defaultWindowWidth
var windowHeight = defaultWindowHeight
var url = fmt.Sprintf("http://localhost:%d", defaultPort)

type process struct {
	Pid    int
	Handle uintptr
}

var processGroup ProcessGroup

func main() {
	startTime := time.Now()

	CheckForUpdate()

	_processGroup, err := NewProcessGroup()
	if err != nil {
		panic(err)
	}
	defer _processGroup.Dispose()
	processGroup = _processGroup

	// Set default port to be random high port
	if defaultPort == 0 {
		randomPort, portErr := freeport.GetFreePort()
		if portErr != nil {
			fmt.Println("Error getting port", portErr.Error())
		} else {
			defaultPort = randomPort
		}
	}

	// Parse arguments
	widthPtr := flag.Int("width", int(windowWidth), "Window width")
	heightPtr := flag.Int("height", int(windowHeight), "Window height")
	portPtr := flag.Int("port", defaultPort, "Port service should run on")
	terminalMode := flag.Bool("terminal", false, "Run in terminal only mode")
	flag.Parse()

	windowWidth = int32(*widthPtr)
	windowHeight = int32(*heightPtr)

	port = int(*portPtr)
	url = fmt.Sprintf("http://localhost:%d", *portPtr)
	launcherUrl := fmt.Sprintf("http://localhost:%d/launcher.html", *portPtr)

	if *terminalMode {
		createWindow(TERMINAL_WINDOW_TITLE, url, defaultWindowWidth, defaultWindowHeight, webview.HintMin)
		return
	}

	// Check not already running
	if checkProcessAlreadyExists(LAUNCHER_WINDOW_TITLE) {
		dialog.Message("%s", "ICARUS Terminal Service is already running.\n\nYou can only run one instance at a time.").Title("Information").Info()
		exitApplication(1)
	}

	// Run service
	cmdArg0 := fmt.Sprintf("%s%d", "--port=", *portPtr)
	serviceCmdInstance := exec.Command(SERVICE_EXECUTABLE, cmdArg0)
	serviceCmdInstance.SysProcAttr = &syscall.SysProcAttr{CreationFlags: 0x08000000, HideWindow: true} // Don't create a visible window for the service process
	serviceCmdErr := serviceCmdInstance.Start()

	// Exit if service fails to start
	if serviceCmdErr != nil {
		fmt.Println("Error starting service", serviceCmdErr.Error())
		dialog.Message("%s", "Failed to start ICARUS Terminal Service.").Title("Error").Error()
		exitApplication(1)
	}

	// Add service to process group so gets shutdown when main process ends
	processGroup.AddProcess(serviceCmdInstance.Process)

	// Exit if service stops running
	go func() {
		serviceCmdInstance.Wait()
		currentTime := time.Now()
		diff := currentTime.Sub(startTime)
		if diff.Seconds() < 10 {
			// Show alternate dialog message if fails within X seconds of startup
			dialog.Message("%s", "ICARUS Terminal Service failed to start.\n\nAntiVirus or Firewall software may have prevented it from starting.").Title("Error").Error()
		} else {
			fmt.Println("Service stopped unexpectedly.")
			dialog.Message("%s", "ICARUS Terminal Service stopped unexpectedly.").Title("Error").Error()
		}
		exitApplication(1)
	}()

	// TODO Only open a window once service is ready
	time.Sleep(0 * time.Second)

	// Open main window (block rest of main until closed)
	createNativeWindow(LAUNCHER_WINDOW_TITLE, launcherUrl, defaultLauncherWindowWidth, defaultLauncherWindowHeight)

	// Ensure we terminate all processes cleanly when window closes
	exitApplication(0)
}

// createWindow() lets the webview library create a managed window for us
func createWindow(LAUNCHER_WINDOW_TITLE string, url string, width int32, height int32, hint webview.Hint) {
	// Passes the pointer to the window as an unsafe reference
	w := webview.New(DEBUGGER)
	defer w.Destroy()

	hwndPtr := w.Window()
	hwnd := win.HWND(hwndPtr)

	// Center window and force it to redraw
	screenWidth := int32(win.GetSystemMetrics(win.SM_CXSCREEN))
	screenHeight := int32(win.GetSystemMetrics(win.SM_CYSCREEN))
	windowX := int32((screenWidth / 2) - (width / 2))
	windowY := int32((screenHeight / 2) - (height / 2))
	win.MoveWindow(hwnd, windowX, windowY, width, height, false)

	// Set window icon
	hIconSm := win.HICON(win.LoadImage(0, syscall.StringToUTF16Ptr(ICON), win.IMAGE_ICON, 32, 32, win.LR_LOADFROMFILE|win.LR_SHARED|win.LR_LOADTRANSPARENT))
	hIcon := win.HICON(win.LoadImage(0, syscall.StringToUTF16Ptr(ICON), win.IMAGE_ICON, 64, 64, win.LR_LOADFROMFILE|win.LR_SHARED|win.LR_LOADTRANSPARENT))
	win.SendMessage(hwnd, win.WM_SETICON, 0, uintptr(hIconSm))
	win.SendMessage(hwnd, win.WM_SETICON, 1, uintptr(hIcon))

	bindFunctionsToWebView(w)

	w.SetTitle(LAUNCHER_WINDOW_TITLE)
	w.SetSize(int(width), int(height), hint)
	w.Navigate(url)
	w.Run()
}

// createNativeWindow() explicitly creates a native window and passes the handle
// for it to the webview, this allows for greater customisation
func createNativeWindow(LAUNCHER_WINDOW_TITLE string, url string, width int32, height int32) {
	// Instance of this executable
	hInstance := win.GetModuleHandle(nil)
	if hInstance == 0 {
		fmt.Println("GetModuleHandle failed:", win.GetLastError())
	}

	// Register window class
	atom := RegisterClass(hInstance)
	if atom == 0 {
		fmt.Println("RegisterClass failed:", win.GetLastError())
	}

	// Create our own window
	// We do this manually and pass it to webview so that we can set the window
	// location (i.e. centered), style, etc before it is displayed.
	hwndPtr := CreateWin32Window(hInstance, LAUNCHER_WINDOW_TITLE, width, height)
	if hwndPtr == 0 {
		fmt.Println("CreateWin32Window failed:", win.GetLastError())
	}

	// Center window
	screenWidth := int32(win.GetSystemMetrics(win.SM_CXSCREEN))
	screenHeight := int32(win.GetSystemMetrics(win.SM_CYSCREEN))
	windowX := int32((screenWidth / 2) - (width / 2))
	windowY := int32((screenHeight / 2) - (height / 2))
	win.MoveWindow(win.HWND(hwndPtr), windowX, windowY, width, height, false)

	// Pass the pointer to the window as an unsafe reference
	webViewInstance = webview.NewWindow(DEBUGGER, unsafe.Pointer(&hwndPtr))
	defer webViewInstance.Destroy()
	bindFunctionsToWebView(webViewInstance)
	webViewInstance.Navigate(url)
	webViewInstance.Run()
}

func bindFunctionsToWebView(w webview.WebView) {
	hwndPtr := w.Window()
	hwnd := win.HWND(hwndPtr)

	var isFullScreen = false
	defaultWindowStyle := win.GetWindowLong(hwnd, win.GWL_STYLE)

	w.Bind("app_toggleFullScreen", func() bool {
		screenWidth := int32(win.GetSystemMetrics(win.SM_CXSCREEN))
		screenHeight := int32(win.GetSystemMetrics(win.SM_CYSCREEN))
		windowX := int32((screenWidth / 2) - (windowWidth / 2))
		windowY := int32((screenHeight / 2) - (windowHeight / 2))

		if isFullScreen {
			// Restore default window style and position
			// TODO Should restore to window size and location before window was set
			// to full screen (currently just resets to what it thinks is best)
			win.SetWindowLong(hwnd, win.GWL_STYLE, defaultWindowStyle)
			win.MoveWindow(hwnd, windowX, windowY, windowWidth, windowHeight, true)
			isFullScreen = false
		} else {
			// Set to fullscreen and remove window border
			newWindowStyle := defaultWindowStyle &^ (win.WS_CAPTION | win.WS_THICKFRAME | win.WS_MINIMIZEBOX | win.WS_MAXIMIZEBOX | win.WS_SYSMENU)
			win.SetWindowLong(hwnd, win.GWL_STYLE, newWindowStyle)
			win.SetWindowPos(hwnd, 0, 0, 0, screenWidth, screenHeight, win.SWP_FRAMECHANGED)
			isFullScreen = true
		}
		return isFullScreen
	})

	w.Bind("app_quit", func() int {
		exitApplication(0)
		return 0
	})

	w.Bind("app_newWindow", func() int {
		terminalCmdInstance := exec.Command(TERMINAL_EXECUTABLE, "-terminal=true", fmt.Sprintf("--port=%d", port))
		terminalCmdErr := terminalCmdInstance.Start()

		// Exit if service fails to start
		if terminalCmdErr != nil {
			fmt.Println("Opening new terminal failed", terminalCmdErr.Error())
		}

		// Add process to process group so all windows close when main process ends
		processGroup.AddProcess(terminalCmdInstance.Process)

		go func() {
			terminalCmdInstance.Wait()
			// Code here will execute when window closes
		}()

		return 0
	})

	// FIXME Broken and sometimes causes crashes on child Windows. Don't know why.
	// To replicate, open a new window (A), then a second window (B), then close
	// A using this method then try and close B using this method. B will stop
	// responding and if repeatedly triggered will crash the entire app.
	// I have tried multiple approaches to resolve this but I think it's a bug
	// in the webview library this app imports.
	/*
		  w.Bind("app_closeWindow", func() int {
				w.Terminate()
		    return 0
		  })
	*/
}

func exitApplication(exitCode int) {
	// Placeholder for future logic
	os.Exit(exitCode)
}

func checkProcessAlreadyExists(windowTitle string) bool {
	cmd := exec.Command("TASKLIST", "/FI", fmt.Sprintf("windowTitle eq %s", windowTitle))
	cmd.SysProcAttr = &syscall.SysProcAttr{CreationFlags: 0x08000000, HideWindow: true}
	result, err := cmd.Output()
	if err != nil {
		return false
	}
	return !bytes.Contains(result, []byte("No tasks are running"))
}
