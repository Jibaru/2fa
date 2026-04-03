package core

import (
	"context"
	"sync"

	"github.com/energye/systray"
	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type TrayManager struct {
	ctx      context.Context
	quitting bool
	mu       sync.Mutex
	icon     []byte
}

func NewTrayManager(icon []byte) *TrayManager {
	return &TrayManager{
		icon: icon,
	}
}

func (t *TrayManager) Startup(ctx context.Context) {
	t.ctx = ctx
}

func (t *TrayManager) Start() {
	go systray.Run(t.onReady, t.onExit)
}

func (t *TrayManager) IsQuitting() bool {
	t.mu.Lock()
	defer t.mu.Unlock()
	return t.quitting
}

func (t *TrayManager) OnBeforeClose(ctx context.Context) bool {
	if t.IsQuitting() {
		return false
	}
	wailsRuntime.WindowHide(ctx)
	return true
}

func (t *TrayManager) showWindow() {
	if t.ctx == nil {
		return
	}
	wailsRuntime.WindowShow(t.ctx)
}

func (t *TrayManager) onReady() {
	systray.SetIcon(t.icon)
	systray.SetTooltip("2FA Authenticator")

	systray.SetOnClick(func(menu systray.IMenu) {
		t.showWindow()
	})

	mShow := systray.AddMenuItem("Show", "Show window")
	systray.AddSeparator()
	mQuit := systray.AddMenuItem("Quit", "Quit application")

	mShow.Click(func() {
		t.showWindow()
	})

	mQuit.Click(func() {
		t.mu.Lock()
		t.quitting = true
		t.mu.Unlock()
		systray.Quit()
		if t.ctx != nil {
			wailsRuntime.Quit(t.ctx)
		}
	})
}

func (t *TrayManager) onExit() {}
