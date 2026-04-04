package core

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	qrcode "github.com/skip2/go-qrcode"
	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type EntryHandler struct {
	ctx     context.Context
	storage *Storage
}

func NewEntryHandler(storage *Storage) *EntryHandler {
	return &EntryHandler{storage: storage}
}

func (h *EntryHandler) Startup(ctx context.Context) {
	h.ctx = ctx
}

func (h *EntryHandler) GetEntries(search string) []EntryWithCode {
	entries := h.storage.GetEntries()
	now := time.Now()
	remaining := GetRemainingSeconds()

	var result []EntryWithCode
	search = strings.ToLower(strings.TrimSpace(search))

	for _, e := range entries {
		if search != "" {
			if !strings.Contains(strings.ToLower(e.Issuer), search) &&
				!strings.Contains(strings.ToLower(e.Name), search) {
				continue
			}
		}

		code, err := GenerateTOTP(e.Secret, now)
		if err != nil {
			code = "------"
		}

		result = append(result, EntryWithCode{
			ID:        e.ID,
			Issuer:    e.Issuer,
			Name:      e.Name,
			Code:      code,
			Remaining: remaining,
			Period:    DefaultPeriod,
		})
	}

	if result == nil {
		result = []EntryWithCode{}
	}

	return result
}

func (h *EntryHandler) AddEntry(issuer string, name string, secret string) error {
	entry := Entry{
		ID:     uuid.New().String(),
		Issuer: issuer,
		Name:   name,
		Secret: secret,
	}
	return h.storage.AddEntry(entry)
}

func (h *EntryHandler) DeleteEntry(id string) error {
	return h.storage.DeleteEntry(id)
}

func (h *EntryHandler) GetEntryQR(id string) (string, error) {
	entries := h.storage.GetEntries()
	var entry *Entry
	for _, e := range entries {
		if e.ID == id {
			entry = &e
			break
		}
	}
	if entry == nil {
		return "", fmt.Errorf("entry not found")
	}

	label := entry.Name
	if entry.Issuer != "" && entry.Name != "" {
		label = entry.Issuer + ":" + entry.Name
	} else if entry.Issuer != "" {
		label = entry.Issuer
	}

	uri := fmt.Sprintf("otpauth://totp/%s?secret=%s",
		url.PathEscape(label),
		url.QueryEscape(entry.Secret),
	)
	if entry.Issuer != "" {
		uri += "&issuer=" + url.QueryEscape(entry.Issuer)
	}

	png, err := qrcode.Encode(uri, qrcode.Medium, 256)
	if err != nil {
		return "", fmt.Errorf("failed to generate QR: %w", err)
	}

	return "data:image/png;base64," + base64.StdEncoding.EncodeToString(png), nil
}

type ExportEntry struct {
	Issuer string `json:"issuer"`
	Name   string `json:"name"`
	Secret string `json:"secret"`
}

func (h *EntryHandler) ExportToFile() error {
	path, err := wailsRuntime.SaveFileDialog(h.ctx, wailsRuntime.SaveDialogOptions{
		Title:           "Export 2FA Codes",
		DefaultFilename: "2fa-export.json",
		Filters: []wailsRuntime.FileFilter{
			{DisplayName: "JSON Files", Pattern: "*.json"},
		},
	})
	if err != nil {
		return fmt.Errorf("dialog error: %w", err)
	}
	if path == "" {
		return nil
	}

	entries := h.storage.GetEntries()
	export := make([]ExportEntry, len(entries))
	for i, e := range entries {
		export[i] = ExportEntry{
			Issuer: e.Issuer,
			Name:   e.Name,
			Secret: e.Secret,
		}
	}

	data, err := json.MarshalIndent(export, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal: %w", err)
	}

	if err := os.WriteFile(path, data, 0600); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	return nil
}

func (h *EntryHandler) ImportFromFile() (int, error) {
	path, err := wailsRuntime.OpenFileDialog(h.ctx, wailsRuntime.OpenDialogOptions{
		Title: "Import 2FA Codes",
		Filters: []wailsRuntime.FileFilter{
			{DisplayName: "JSON Files", Pattern: "*.json"},
		},
	})
	if err != nil {
		return 0, fmt.Errorf("dialog error: %w", err)
	}
	if path == "" {
		return 0, nil
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return 0, fmt.Errorf("failed to read file: %w", err)
	}

	var imported []ExportEntry
	if err := json.Unmarshal(data, &imported); err != nil {
		return 0, fmt.Errorf("invalid JSON format: %w", err)
	}

	var entries []Entry
	for _, e := range imported {
		if strings.TrimSpace(e.Secret) == "" {
			continue
		}
		entries = append(entries, Entry{
			ID:     uuid.New().String(),
			Issuer: e.Issuer,
			Name:   e.Name,
			Secret: e.Secret,
		})
	}

	if len(entries) == 0 {
		return 0, nil
	}

	if err := h.storage.AddEntries(entries); err != nil {
		return 0, fmt.Errorf("failed to import: %w", err)
	}

	return len(entries), nil
}
