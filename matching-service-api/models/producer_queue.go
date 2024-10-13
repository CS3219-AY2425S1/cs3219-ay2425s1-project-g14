package models

import (
	rabbit "github.com/streadway/amqp"
)

type ProducerQueue struct {
	Connection *rabbit.Connection
	Channel *rabbit.Channel

	Queue rabbit.Queue
}

func InitialiseQueue(URI string) (*ProducerQueue, error) {
	connection, err := rabbit.Dial(URI)

	if err != nil {
		return nil, err
	}


	channel, err := connection.Channel()

	if err != nil {
		return nil, err
	}

	queue, err := channel.QueueDeclare(
		"match_queue", // name of the queue
		true,          // durable
		false,         // delete when unused
		false,         // exclusive
		false,         // no-wait
		nil,           // arguments
	)

	if err != nil {
		return nil, err
	}

	return &ProducerQueue{
		Connection: connection,
		Channel: channel,
		Queue: queue,
	}, nil
} 