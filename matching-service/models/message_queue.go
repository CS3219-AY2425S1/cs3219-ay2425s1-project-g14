package models

import (
	rabbit "github.com/streadway/amqp"
)

type MessageQueue struct {
	Channel *rabbit.Channel
	Queue rabbit.Queue	
}

