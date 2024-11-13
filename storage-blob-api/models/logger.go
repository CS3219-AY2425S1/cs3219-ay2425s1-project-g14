package models

import (
	"github.com/sirupsen/logrus"
)

type Logger struct {
	Log *logrus.Logger
}

func NewLogger() *Logger {
	return &Logger {
		Log: logrus.New(),
	}
}