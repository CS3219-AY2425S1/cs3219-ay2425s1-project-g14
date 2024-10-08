package consumer

import (
	"matching-service/models"
	db "matching-service/mappings"
)

func BeginConsuming(mq *models.MessageQueue, logger *models.Logger, mappings *db.Mappings) {
	logger.Log.Info("Begin processing requests")

	msgs, err := mq.Channel.Consume(
		mq.Queue.Name, // queue
		"",            // consumer
		true,          // auto-ack
		false,         // exclusive
		false,         // no-local
		false,         // no-wait
		nil,           // args
	)

	if err != nil {
		logger.Log.Error("Error when consuming requests:" + err.Error())
	}

	forever := make(chan bool)

	go func() {
		for req := range msgs {
			if err := Process(req, mappings); err != nil {
				logger.Log.Error("Unable to convert request from JSON:" + err.Error())
			}
		}
	}()
	<-forever //blocks forever
}
