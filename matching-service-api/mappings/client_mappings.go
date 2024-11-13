package mappings

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"io"
)

func GenerateMatchingHash() (string, error) {
	bytes := make([]byte, 16)

	if _, err := io.ReadFull(rand.Reader, bytes); err != nil {
		return "", errors.New("Failed to generate random matching hash" + err.Error())
	}

	return hex.EncodeToString(bytes), nil
}
