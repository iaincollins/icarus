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
	 "reflect"
)

// Window title declared here as to identify if the app is aleady running
const mainWindowTitle = "ICARUS Terminal Launcher"
const terminalWindowTitle = "ICARUS Terminal"
const lpszClassName = "IcarusTerminalWindowClass"
const defaultServiceName = "ICARUS Service.exe"
const defaultTerminalName = "ICARUS Terminal.exe"
const debugConsole = true

const defaultLauncherWindowWidth = int32(640)
const defaultLauncherWindowHeight = int32(480)
const defaultWindowWidth = int32(1024)
const defaultWindowHeight = int32(768)

var defaultPort = 0 // Set to 0 to be assigned a free high numbered port
var port int // Actual port we are running on
var serviceCmdInstance *exec.Cmd // Global to allow clean exits
var mainWebViewInstance webview.WebView

// Track main window size when switching to/from fullscreen
var windowWidth = defaultWindowWidth
var windowHeight = defaultWindowHeight
var url = fmt.Sprintf("http://localhost:%d", defaultPort)

func main() {
  startTime := time.Now()

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
	servicePtr := flag.String("service", defaultServiceName, "Path to service executable")
	portPtr := flag.Int("port", defaultPort, "Port service should run on")
	terminalMode := flag.Bool("terminal", false, "Run in terminal only mode")
	flag.Parse()

  windowWidth = int32(*widthPtr)
  windowHeight = int32(*heightPtr)

	port = int(*portPtr)
  url = fmt.Sprintf("http://localhost:%d", *portPtr)
  launcherUrl := fmt.Sprintf("http://localhost:%d/launcher.html", *portPtr)

	if (*terminalMode) {
		OpenManagedWindow(terminalWindowTitle, url, defaultWindowWidth, defaultWindowHeight)
		return
	}

	// Check not already running
  if CheckProcessAlreadyExists(mainWindowTitle) {
    dialog.Message("%s", "ICARUS Terminal Service is already running.\n\nYou can only run one instance at a time.").Title("Information").Info()
    ExitApplication(1)
  }

  // Run service
  cmdExe := *servicePtr
  cmdArg0 := fmt.Sprintf("%s%d", "--port=", *portPtr)
  serviceCmdInstance = exec.Command(cmdExe, cmdArg0)
  serviceCmdInstance.SysProcAttr = &syscall.SysProcAttr{CreationFlags: 0x08000000, HideWindow: true} // Don't create a visible window for the service process
  serviceCmdErr := serviceCmdInstance.Start()

  // Exit if service fails to start
  if serviceCmdErr != nil {
    fmt.Println("Error starting service", serviceCmdErr.Error())
    dialog.Message("%s", "Failed to start ICARUS Terminal Service.").Title("Error").Error()
    ExitApplication(1)
  }

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
    ExitApplication(1)
  }()

  // TODO Only open a window once service is ready
  time.Sleep(0 * time.Second)

  // Open main window (block rest of main until closed)
  //OpenMainWindow(mainWindowTitle, launcherUrl, defaultLauncherWindowWidth, defaultLauncherWindowHeight)
	OpenManagedWindow(mainWindowTitle, launcherUrl, defaultLauncherWindowWidth, defaultLauncherWindowHeight)

  // Ensure we terminate all processes cleanly when window closes
  ExitApplication(0)
}

func OpenMainWindow(mainWindowTitle string, url string, width int32, height int32) {
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
  hwndPtr := CreateWindow(hInstance, mainWindowTitle, width, height)
  if hwndPtr == 0 {
    fmt.Println("CreateWindow failed:", win.GetLastError())
  }

  // Center window
  screenWidth := int32(win.GetSystemMetrics(win.SM_CXSCREEN))
  screenHeight := int32(win.GetSystemMetrics(win.SM_CYSCREEN))
  windowX := int32((screenWidth / 2) - (width / 2))
  windowY := int32((screenHeight / 2) - (height / 2))
  win.MoveWindow(win.HWND(hwndPtr), windowX, windowY, width, height, true)

  // Pass the pointer to the window as an unsafe reference
  mainWebViewInstance = webview.NewWindow(debugConsole, unsafe.Pointer(&hwndPtr))
  defer mainWebViewInstance.Destroy()
  BindFunctions(mainWebViewInstance)
  mainWebViewInstance.Navigate(url)
  mainWebViewInstance.Run()
}

func OpenManagedWindow(mainWindowTitle string, url string, width int32, height int32) {
  // Passes the pointer to the window as an unsafe reference
  w := webview.New(debugConsole)
  defer w.Destroy()
  w.SetTitle(mainWindowTitle)
  w.SetSize(int(width), int(height), webview.HintMin)

  // Center window
  hwndPtr := w.Window()
  screenWidth := int32(win.GetSystemMetrics(win.SM_CXSCREEN))
  screenHeight := int32(win.GetSystemMetrics(win.SM_CYSCREEN))
  windowX := int32((screenWidth / 2) - (width / 2))
  windowY := int32((screenHeight / 2) - (height / 2))
  win.MoveWindow(win.HWND(hwndPtr), windowX, windowY, width, height, true)

  BindFunctions(w)
  w.Navigate(url)
  w.Run()
}

func BindFunctions(w webview.WebView) {
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
    ExitApplication(0)
    return 0
  })

  w.Bind("app_newWindow", func() int {
		terminalCmdInstance := exec.Command(defaultTerminalName, "-terminal=true", fmt.Sprintf("--port=%d", port))
		terminalCmdErr := terminalCmdInstance.Start()

		// Exit if service fails to start
		if terminalCmdErr != nil {
			fmt.Println("Opening new terminal failed", terminalCmdErr.Error())
		}

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

func ExitApplication(exitCode int) {
  // Ensure service is stopped on exit (if running)
  if serviceCmdInstance != nil {
    serviceCmdInstance.Process.Kill()
  }
  os.Exit(exitCode)
}

func CheckProcessAlreadyExists(windowTitle string) bool {
  cmd := exec.Command("TASKLIST", "/FI", fmt.Sprintf("windowTitle eq %s", windowTitle))
	cmd.SysProcAttr = &syscall.SysProcAttr{CreationFlags: 0x08000000, HideWindow: true} 
  result, err := cmd.Output()
  if err != nil {
    return false
  }
  return !bytes.Contains(result, []byte("No tasks are running"))
}

func WndProc(hwnd win.HWND, msg uint32, wParam, lParam uintptr) uintptr {
	windowPtr := unsafe.Pointer(win.GetWindowLongPtr(hwnd, win.GWLP_USERDATA))
 	//w, _ := getWindowContext(hwnd).(mainWebViewInstance);
  switch msg {
  	case win.WM_SIZE:
  // FIXME: How to handle weview resizing on custom windows?
		//w.m_browser.resize(hwnd);
		
		//w.webview_set_size()
		//mainWebViewInstance.webview_set_size(webview_t w, int width, int height,int hints);
		fmt.Println("WM_SIZE 1")

		if (mainWebViewInstance != nil) {
			fooType := reflect.TypeOf(windowPtr)
			for i := 0; i < fooType.NumMethod(); i++ {
					method := fooType.Method(i)
					fmt.Println(method.Name)
			}

			
			fmt.Println("WM_SIZE 1.5")
			//w.m_browser.resize(hwnd);
			fmt.Println("WM_SIZE 1.6")
			//mainWebViewInstance.SetSize(int(1900), int(1200),  webview.HintMin)
		}
		fmt.Println("WM_SIZE 2")
		//mainWebViewInstance
		break;
  case win.WM_DESTROY:
    win.PostQuitMessage(0)
    if serviceCmdInstance != nil {
      serviceCmdInstance.Process.Kill()
    }
    os.Exit(1)
  default:
    return win.DefWindowProc(hwnd, msg, wParam, lParam)
  }
  return 0
}

// func getWindowContext(wnd win.HWND) interface{} {
// 	windowContextSync.RLock()
// 	defer windowContextSync.RUnlock()
// 	return windowContext[wnd]
// }

// var (
// 	windowContext     = map[uintptr]interface{}{}
// 	windowContextSync sync.RWMutex
// )


func RegisterClass(hInstance win.HINSTANCE) (atom win.ATOM) {
  var wc win.WNDCLASSEX
  wc.CbSize = uint32(unsafe.Sizeof(wc))
  wc.Style = win.CS_HREDRAW | win.CS_VREDRAW | win.CS_OWNDC
  wc.LpfnWndProc = syscall.NewCallback(WndProc)
  wc.CbClsExtra = 0
  wc.CbWndExtra = 0
  wc.HInstance = hInstance
  wc.HbrBackground = win.GetSysColorBrush(win.COLOR_WINDOWFRAME)
  wc.LpszMenuName = syscall.StringToUTF16Ptr("")
  wc.LpszClassName = syscall.StringToUTF16Ptr(lpszClassName)
  wc.HIconSm = win.LoadIcon(hInstance, win.MAKEINTRESOURCE(win.IDI_APPLICATION))
  wc.HIcon = win.LoadIcon(hInstance, win.MAKEINTRESOURCE(win.IDI_APPLICATION))
  wc.HCursor = win.LoadCursor(0, win.MAKEINTRESOURCE(win.IDC_ARROW))
  return win.RegisterClassEx(&wc)
}

func CreateWindow(hInstance win.HINSTANCE, mainWindowTitle string, width int32, height int32) (hwnd win.HWND) {
  // Center window
  // https://docs.microsoft.com/en-us/windows/win32/api/winuser/
  screenWidth := int32(win.GetSystemMetrics(win.SM_CXSCREEN))
  screenHeight := int32(win.GetSystemMetrics(win.SM_CYSCREEN))
  windowX := int32((screenWidth / 2) - (width / 2))
  windowY := int32((screenHeight / 2) - (height / 2))

  return win.CreateWindowEx(
    //win.WS_EX_APPWINDOW|win.WS_EX_WINDOWEDGE,
		win.WS_EX_APPWINDOW,
    syscall.StringToUTF16Ptr(lpszClassName),
    syscall.StringToUTF16Ptr(mainWindowTitle),
		win.WS_OVERLAPPEDWINDOW, // A normal window
    //win.WS_OVERLAPPED|win.WS_SYSMENU|win.WS_MINIMIZEBOX|win.WS_MAXIMIZEBOX, // No win.WS_MAXIMIZEBOX to prevent resizing (webview broken and doesn't resize with window!)
    windowX,
    windowY,
    width,
    height,
    0,
    0,
    hInstance,
    nil)
}
