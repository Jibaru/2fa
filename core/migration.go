package core

import (
	"encoding/base32"
	"encoding/base64"
	"fmt"
	"net/url"
	"strings"

	"github.com/google/uuid"
)

type MigrationEntry struct {
	Secret    []byte
	Name      string
	Issuer    string
	Algorithm int
	Digits    int
	Type      int
}

func ParseMigrationURI(uri string) ([]MigrationEntry, error) {
	if !strings.HasPrefix(uri, "otpauth-migration://offline?") {
		return nil, fmt.Errorf("not a valid migration URI")
	}

	u, err := url.Parse(uri)
	if err != nil {
		return nil, err
	}

	data := u.Query().Get("data")
	if data == "" {
		return nil, fmt.Errorf("no data parameter found")
	}

	raw, err := base64.StdEncoding.DecodeString(data)
	if err != nil {
		raw, err = base64.URLEncoding.DecodeString(data)
		if err != nil {
			raw, err = base64.RawStdEncoding.DecodeString(data)
			if err != nil {
				return nil, fmt.Errorf("failed to decode base64: %w", err)
			}
		}
	}

	return decodeMigrationPayload(raw)
}

func decodeMigrationPayload(data []byte) ([]MigrationEntry, error) {
	var entries []MigrationEntry
	pos := 0

	for pos < len(data) {
		fieldNum, wireType, n := decodeTag(data[pos:])
		if n == 0 {
			return nil, fmt.Errorf("failed to decode tag at position %d", pos)
		}
		pos += n

		if fieldNum == 1 && wireType == 2 {
			length, n := decodeVarint(data[pos:])
			if n == 0 {
				return nil, fmt.Errorf("failed to decode length")
			}
			pos += n

			if pos+int(length) > len(data) {
				return nil, fmt.Errorf("data truncated")
			}

			entry, err := decodeOtpParameters(data[pos : pos+int(length)])
			if err != nil {
				return nil, err
			}
			entries = append(entries, entry)
			pos += int(length)
		} else {
			newPos := skipField(data, pos, wireType)
			if newPos < 0 {
				return nil, fmt.Errorf("failed to skip field")
			}
			pos = newPos
		}
	}

	return entries, nil
}

func decodeOtpParameters(data []byte) (MigrationEntry, error) {
	var entry MigrationEntry
	pos := 0

	for pos < len(data) {
		fieldNum, wireType, n := decodeTag(data[pos:])
		if n == 0 {
			break
		}
		pos += n

		switch {
		case fieldNum == 1 && wireType == 2:
			length, n := decodeVarint(data[pos:])
			pos += n
			entry.Secret = make([]byte, length)
			copy(entry.Secret, data[pos:pos+int(length)])
			pos += int(length)
		case fieldNum == 2 && wireType == 2:
			length, n := decodeVarint(data[pos:])
			pos += n
			entry.Name = string(data[pos : pos+int(length)])
			pos += int(length)
		case fieldNum == 3 && wireType == 2:
			length, n := decodeVarint(data[pos:])
			pos += n
			entry.Issuer = string(data[pos : pos+int(length)])
			pos += int(length)
		case fieldNum == 4 && wireType == 0:
			val, n := decodeVarint(data[pos:])
			pos += n
			entry.Algorithm = int(val)
		case fieldNum == 5 && wireType == 0:
			val, n := decodeVarint(data[pos:])
			pos += n
			entry.Digits = int(val)
		case fieldNum == 6 && wireType == 0:
			val, n := decodeVarint(data[pos:])
			pos += n
			entry.Type = int(val)
		default:
			newPos := skipField(data, pos, wireType)
			if newPos < 0 {
				return entry, fmt.Errorf("failed to skip field %d", fieldNum)
			}
			pos = newPos
		}
	}

	return entry, nil
}

func decodeTag(data []byte) (fieldNum int, wireType int, n int) {
	val, n := decodeVarint(data)
	if n == 0 {
		return 0, 0, 0
	}
	return int(val >> 3), int(val & 0x7), n
}

func decodeVarint(data []byte) (uint64, int) {
	var val uint64
	for i := 0; i < len(data) && i < 10; i++ {
		val |= uint64(data[i]&0x7f) << (7 * i)
		if data[i]&0x80 == 0 {
			return val, i + 1
		}
	}
	return 0, 0
}

func skipField(data []byte, pos int, wireType int) int {
	switch wireType {
	case 0:
		_, n := decodeVarint(data[pos:])
		return pos + n
	case 1:
		return pos + 8
	case 2:
		length, n := decodeVarint(data[pos:])
		return pos + n + int(length)
	case 5:
		return pos + 4
	default:
		return -1
	}
}

func MigrationEntriesToEntries(migEntries []MigrationEntry) []Entry {
	var entries []Entry
	for _, me := range migEntries {
		issuer := me.Issuer
		name := me.Name

		if issuer == "" && strings.Contains(name, ":") {
			parts := strings.SplitN(name, ":", 2)
			issuer = strings.TrimSpace(parts[0])
			name = strings.TrimSpace(parts[1])
		}

		secret := base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(me.Secret)

		entries = append(entries, Entry{
			ID:     uuid.New().String(),
			Issuer: issuer,
			Name:   name,
			Secret: secret,
		})
	}
	return entries
}
