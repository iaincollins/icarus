package main

import (
	"github.com/nvsoft/win"
	"syscall"
	"unsafe"
)

func WndProc(hwnd win.HWND, msg uint32, wParam, lParam uintptr) uintptr {
	// windowPtr := unsafe.Pointer(win.GetWindowLongPtr(hwnd, win.GWLP_USERDATA))
	// w, _ := GetWindowContext(hwnd).(webViewInstance);
	switch msg {
	case win.WM_SIZE:
		// TODO Handle weview resizing on custom windows
		// Would be great if could access w.m_browser.resize(hwnd) here
		// w.m_browser.resize(hwnd);
		break
	case win.WM_DESTROY:
		win.PostQuitMessage(0)
		exitApplication(0)
	default:
		return win.DefWindowProc(hwnd, msg, wParam, lParam)
	}
	return 0
}

// func GetWindowContext(wnd win.HWND) interface{} {
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
	wc.LpszClassName = syscall.StringToUTF16Ptr(LPSZ_CLASS_NAME)
	wc.HIconSm = win.HICON(win.LoadImage(hInstance, syscall.StringToUTF16Ptr(ICON), win.IMAGE_ICON, 32, 32, win.LR_LOADFROMFILE|win.LR_SHARED|win.LR_LOADTRANSPARENT))
	wc.HIcon = win.HICON(win.LoadImage(hInstance, syscall.StringToUTF16Ptr(ICON), win.IMAGE_ICON, 64, 64, win.LR_LOADFROMFILE|win.LR_SHARED|win.LR_LOADTRANSPARENT))
	wc.HCursor = win.LoadCursor(0, win.MAKEINTRESOURCE(win.IDC_ARROW))
	return win.RegisterClassEx(&wc)
}

func CreateWin32Window(hInstance win.HINSTANCE, LAUNCHER_WINDOW_TITLE string, width int32, height int32) (hwnd win.HWND) {
	// Center window
	// https://docs.microsoft.com/en-us/windows/win32/api/winuser/
	screenWidth := int32(win.GetSystemMetrics(win.SM_CXSCREEN))
	screenHeight := int32(win.GetSystemMetrics(win.SM_CYSCREEN))
	windowX := int32((screenWidth / 2) - (width / 2))
	windowY := int32((screenHeight / 2) - (height / 2))

	return win.CreateWindowEx(
		win.WS_EX_APPWINDOW,
		syscall.StringToUTF16Ptr(LPSZ_CLASS_NAME),
		syscall.StringToUTF16Ptr(LAUNCHER_WINDOW_TITLE),
		win.WS_OVERLAPPED|win.WS_SYSMENU|win.WS_MINIMIZEBOX,
		//win.WS_OVERLAPPEDWINDOW, // A normal window
		windowX,
		windowY,
		width,
		height,
		0,
		0,
		hInstance,
		nil)
}
