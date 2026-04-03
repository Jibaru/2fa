package core

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
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
