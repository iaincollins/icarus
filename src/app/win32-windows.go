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

// https://docs.microsoft.com/en-us/windows/win32/gdi/positioning-objects-on-a-multiple-display-setup
// const MONITOR_CENTER = 0x0001 // center rect to monitor 
// const MONITOR_CLIP = 0x0000 // clip rect to monitor 
// const MONITOR_WORKAREA = 0x0002 // use monitor work area 
// const MONITOR_AREA = 0x0000 // use monitor entire area 
// func ClipOrCenterRectToMonitor(prc *win.RECT, flags uint) {
// 	var hMonitor win.HMONITOR;
// 	var mi win.MONITORINFO;
// 	var rc win.RECT;
//   var w = prc.Right - prc.Left;
//   var h = prc.Bottom - prc.Top;

//     // 
//     // get the nearest monitor to the passed rect. 
//     // 
//     hMonitor = win.MonitorFromRect(prc, win.MONITOR_DEFAULTTONEAREST);

//     // 
//     // get the work area or entire monitor rect. 
//     // 
//     mi.CbSize = unsafe.Sizeof(mi);
//     win.GetMonitorInfo(hMonitor, &mi);

//     if (flags & MONITOR_WORKAREA) {
//         rc = mi.RcWork;
//     } else {
//         rc = mi.RcMonitor;
// 		}

//     // 
//     // center or clip the passed rect to the monitor rect 
//     // 
//     if (flags & MONITOR_CENTER) {
//         prc.left   = rc.Left + (rc.Right  - rc.Left - w) / 2;
//         prc.top    = rc.Top  + (rc.Bottom - rc.Top  - h) / 2;
//         prc.right  = prc.Left + w;
//         prc.bottom = prc.Top  + h;
//     }  else {
//         prc.left   = unsafe.Max(rc.Left, unsafe.Min(rc.Right-w,  prc.Left));
//         prc.top    = unsafe.Max(rc.Top,  unsafe.Min(rc.Bottom-h, prc.Top));
//         prc.right  = prc.Left + w;
//         prc.bottom = prc.Top  + h;
//     }
// }