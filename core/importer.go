package core

import (
	"context"
	"fmt"
	"net/url"
	"strings"

	"github.com/google/uuid"
)

type ImportHandler struct {
	ctx     context.Context
	storage *Storage
}

func NewImportHandler(storage *Storage) *ImportHandler {
	return &ImportHandler{storage: storage}
}

func (h *ImportHandler) Startup(ctx context.Context) {
	h.ctx = ctx
}

func (h *ImportHandler) ImportFromURI(uri string) (int, error) {
	if strings.HasPrefix(uri, "otpauth-migration://") {
		migEntries, err := ParseMigrationURI(uri)
		if err != nil {
			return 0, fmt.Errorf("failed to parse migration data: %w", err)
		}

		entries := MigrationEntriesToEntries(migEntries)
		if err := h.storage.AddEntries(entries); err != nil {
			return 0, err
		}
		return len(entries), nil
	}

	if strings.HasPrefix(uri, "otpauth://totp/") || strings.HasPrefix(uri, "otpauth://hotp/") {
		entry, err := parseOtpauthURI(uri)
		if err != nil {
			return 0, err
		}
		if err := h.storage.AddEntry(entry); err != nil {
			return 0, err
		}
		return 1, nil
	}

	return 0, fmt.Errorf("unsupported QR code format")
}

func parseOtpauthURI(uri string) (Entry, error) {
	u, err := url.Parse(uri)
	if err != nil {
		return Entry{}, err
	}

	label := strings.TrimPrefix(u.Path, "/")
	label, _ = url.PathUnescape(label)

	var issuer, name string
	if strings.Contains(label, ":") {
		parts := strings.SplitN(label, ":", 2)
		issuer = strings.TrimSpace(parts[0])
		name = strings.TrimSpace(parts[1])
	} else {
		name = label
	}

	params := u.Query()
	if i := params.Get("issuer"); i != "" {
		issuer = i
	}
	secret := params.Get("secret")

	return Entry{
		ID:     uuid.New().String(),
		Issuer: issuer,
		Name:   name,
		Secret: secret,
	}, nil
}
