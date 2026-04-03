package core

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

type Storage struct {
	mu      sync.RWMutex
	entries []Entry
	path    string
}

func NewStorage() *Storage {
	home, _ := os.UserHomeDir()
	dir := filepath.Join(home, ".2fa")
	os.MkdirAll(dir, 0700)
	path := filepath.Join(dir, "data.json")

	s := &Storage{path: path}
	s.load()
	return s
}

func (s *Storage) load() {
	data, err := os.ReadFile(s.path)
	if err != nil {
		s.entries = []Entry{}
		return
	}
	if err := json.Unmarshal(data, &s.entries); err != nil {
		s.entries = []Entry{}
	}
}

func (s *Storage) save() error {
	data, err := json.MarshalIndent(s.entries, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.path, data, 0600)
}

func (s *Storage) GetEntries() []Entry {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]Entry, len(s.entries))
	copy(result, s.entries)
	return result
}

func (s *Storage) hasSecret(secret string) bool {
	norm := strings.ToUpper(strings.TrimSpace(secret))
	for _, e := range s.entries {
		if strings.ToUpper(strings.TrimSpace(e.Secret)) == norm {
			return true
		}
	}
	return false
}

func (s *Storage) AddEntry(entry Entry) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.hasSecret(entry.Secret) {
		return nil
	}
	s.entries = append(s.entries, entry)
	return s.save()
}

func (s *Storage) AddEntries(entries []Entry) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	var added int
	for _, entry := range entries {
		if !s.hasSecret(entry.Secret) {
			s.entries = append(s.entries, entry)
			added++
		}
	}
	if added == 0 {
		return nil
	}
	return s.save()
}

func (s *Storage) DeleteEntry(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, e := range s.entries {
		if e.ID == id {
			s.entries = append(s.entries[:i], s.entries[i+1:]...)
			return s.save()
		}
	}
	return nil
}
