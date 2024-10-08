package common

import (
	"github.com/sirupsen/logrus"
)

// contains the logger
type Logger struct {
	Log *logrus.Logger
}

func NewLogger(logger *logrus.Logger) *Logger {
	return &Logger{Log: logger}
}
