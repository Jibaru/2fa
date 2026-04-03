package core

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"golang.org/x/crypto/bcrypt"
)

type Config struct {
	PasswordHash string `json:"password_hash"`
}

type AuthHandler struct {
	ctx        context.Context
	storage    *Storage
	configPath string
}

func NewAuthHandler(storage *Storage) *AuthHandler {
	home, _ := os.UserHomeDir()
	configPath := filepath.Join(home, ".2fa", "config.json")
	return &AuthHandler{
		storage:    storage,
		configPath: configPath,
	}
}

func (h *AuthHandler) Startup(ctx context.Context) {
	h.ctx = ctx
}

func (h *AuthHandler) IsNewUser() bool {
	_, err := os.Stat(h.configPath)
	return os.IsNotExist(err)
}

func (h *AuthHandler) Register(password string) error {
	if len(password) != 16 {
		return fmt.Errorf("password must be exactly 16 characters")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	config := Config{PasswordHash: string(hash)}
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	if err := os.WriteFile(h.configPath, data, 0600); err != nil {
		return fmt.Errorf("failed to write config: %w", err)
	}

	h.storage.SetKey([]byte(password))
	h.storage.Load()

	return nil
}

func (h *AuthHandler) Login(password string) error {
	if len(password) != 16 {
		return fmt.Errorf("password must be exactly 16 characters")
	}

	data, err := os.ReadFile(h.configPath)
	if err != nil {
		return fmt.Errorf("failed to read config: %w", err)
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return fmt.Errorf("failed to parse config: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(config.PasswordHash), []byte(password)); err != nil {
		return fmt.Errorf("invalid password")
	}

	h.storage.SetKey([]byte(password))
	h.storage.Load()

	return nil
}

func (h *AuthHandler) ChangePassword(currentPassword string, newPassword string) error {
	if len(newPassword) != 16 {
		return fmt.Errorf("new password must be exactly 16 characters")
	}

	data, err := os.ReadFile(h.configPath)
	if err != nil {
		return fmt.Errorf("failed to read config: %w", err)
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return fmt.Errorf("failed to parse config: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(config.PasswordHash), []byte(currentPassword)); err != nil {
		return fmt.Errorf("current password is incorrect")
	}

	if err := h.storage.ReKey([]byte(newPassword)); err != nil {
		return fmt.Errorf("failed to re-encrypt data: %w", err)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	config.PasswordHash = string(hash)
	configData, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	if err := os.WriteFile(h.configPath, configData, 0600); err != nil {
		return fmt.Errorf("failed to write config: %w", err)
	}

	return nil
}
