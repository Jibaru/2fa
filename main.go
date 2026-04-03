package main

import (
	"context"
	"embed"

	"2fa/core"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/windows/icon.ico
var trayIcon []byte

func main() {
	app := NewApp()
	storage := core.NewStorage()
	authHandler := core.NewAuthHandler(storage)
	entryHandler := core.NewEntryHandler(storage)
	importHandler := core.NewImportHandler(storage)
	trayManager := core.NewTrayManager(trayIcon)

	trayManager.Start()

	err := wails.Run(&options.App{
		Title:  "2FA Authenticator",
		Width:  420,
		Height: 700,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 255, G: 255, B: 255, A: 1},
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			authHandler.Startup(ctx)
			entryHandler.Startup(ctx)
			importHandler.Startup(ctx)
			trayManager.Startup(ctx)
		},
		OnBeforeClose: func(ctx context.Context) (prevent bool) {
			return trayManager.OnBeforeClose(ctx)
		},
		Bind: []interface{}{
			authHandler,
			entryHandler,
			importHandler,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
