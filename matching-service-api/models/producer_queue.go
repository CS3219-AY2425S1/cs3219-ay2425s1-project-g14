package models

import (
	rabbit "github.com/streadway/amqp"
	"log"
	"time"
)

type ProducerQueue struct {
	Connection *rabbit.Connection
	Channel *rabbit.Channel

	Queue rabbit.Queue
}

func InitialiseQueue(URI string) (*ProducerQueue, error) {
	var connection *rabbit.Connection
	var err error

	for i := 0; i < 10; i++ {
		connection, err = rabbit.Dial(URI)
		if err == nil {
			break
		}
		log.Printf("Could not establish connection to RabbitMQ, retrying in 5 seconds... (%d/10)\n", i+1)
		time.Sleep(5 * time.Second)
	}

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