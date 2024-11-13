package consumer

import (
	"matching-service/models"
	db "matching-service/storage"
)

func BeginConsuming(mq *models.MessageQueue, logger *models.Logger, clientMappings *db.ClientMappings, roomMappings *db.RoomMappings) {
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
			if err := Process(req, clientMappings, roomMappings); err != nil {
				logger.Log.Error(err.Error())
			}
		}
	}()
	<-forever //blocks forever
}
