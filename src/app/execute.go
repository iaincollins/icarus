package main

import (
	"path/filepath"
	"syscall"
	"golang.org/x/sys/windows"
	"os"
	"os/exec"
)

func runUnelevated(pathToExecutable string) {
	// Use Explorer to launch the process as the current user
	windowsDirectory, err := windows.GetSystemWindowsDirectory()
	if err != nil {
		return
	}
	pathToExplorer := filepath.Join(windowsDirectory, "explorer.exe")
	cmdInstance := exec.Command(pathToExplorer, pathToExecutable)
	cmdInstance.SysProcAttr = &syscall.SysProcAttr{CreationFlags: 0x08000000, HideWindow: true}
	cmdInstance.Start()
}

func runElevated(pathToExecutable string) {
	cwd, _ := os.Getwd()
	verbPtr, _ := syscall.UTF16PtrFromString("runas")
	exePtr, _ := syscall.UTF16PtrFromString(pathToExecutable)
	cwdPtr, _ := syscall.UTF16PtrFromString(cwd)
	argPtr, _ := syscall.UTF16PtrFromString("")
	windows.ShellExecute(0, verbPtr, exePtr, argPtr, cwdPtr, int32(1))
}

// TODO Refactor to run commands this way (with optional, unlimited args)
// function runCommand(pathToExecutable string, args ...string) {
// 	dirname = filepath.Dir(pathToExecutable)
// 	cmdInstance := exec.Command(pathToExecutable, args)
// 	cmdInstance.Dir = dirname
// 	cmdInstance.SysProcAttr = &syscall.SysProcAttr{CreationFlags: 0x08000000, HideWindow: true}
// 	cmdInstanceErr := cmdInstance.Start()
// }
