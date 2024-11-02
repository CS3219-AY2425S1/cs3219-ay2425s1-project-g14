package main

import (
	"log"
	"os"
	"strconv"

	"matching-service/consumer"
	models "matching-service/models"
	"matching-service/storage"

	"github.com/joho/godotenv"
	rabbit "github.com/streadway/amqp"

	"github.com/sirupsen/logrus"
)

func initialiseLogger() (*models.Logger, *os.File) {
	logger := models.Logger{
		Log: logrus.New(),
	}
	
	logDirectory := "./log"
	
	if err := os.MkdirAll(logDirectory, 0755); err != nil {
		logger.Log.Error("Failed to create log directory: " + err.Error())
	}

	logFile, err := os.OpenFile("./log/matching_service.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)

	if err != nil {
		logger.Log.Warn("Failed to log to file, using default stderr")
	}


	logger.Log.Out = logFile

	return &logger, logFile
}


func createRabbitChannel(channel *rabbit.Channel, queue rabbit.Queue) *models.MessageQueue {
	return &models.MessageQueue{
		Channel: channel,
		Queue: queue,
	}
}

func main() {

	if err := godotenv.Load(".env"); err != nil {
		log.Fatal("Error loading the environment variables" + err.Error())
	}

	URI := os.Getenv("RABBIT_URI")

	if URI == "" {
		log.Fatal("No Rabbit URI found in environment variables")
	}

	connection, err := rabbit.Dial(URI)
	
	if err != nil {
		log.Fatal("Could not establish connection to RabbitMQ" + err.Error())
	}

	defer connection.Close()
	


	channel, err := connection.Channel()

	if err != nil {
		log.Fatal("Could not open a channel" + err.Error())
	}
	
	defer channel.Close()
	
	queue, err := channel.QueueDeclare(
		"match_queue", // name
		true,         // durable
		false,        // delete when unused
		false,        // exclusive
		false,        // no-wait
		nil,          // arguments
	) 
	
	if err != nil {
		log.Fatal("Could not declare a queue" + err.Error())
	}
	
	mq := createRabbitChannel(channel, queue)	
	
	logger, logFile := initialiseLogger()

	defer logFile.Close()

	REDIS_URI := os.Getenv("REDIS_URI")

	if REDIS_URI == "" {
		REDIS_URI = "localhost://9190"
	}

	REDIS_CLIENT_MAPPING := 0
	REDIS_ROOM_MAPPING   := 1

	if os.Getenv("REDIS_CLIENT_MAPPING") != "" {
		num, err := strconv.Atoi(os.Getenv("REDIS_CLIENT_MAPPING"))
		if err != nil {
			log.Fatal("DB no of client map is badly formatted" + err.Error())
		} else {
			REDIS_CLIENT_MAPPING = num
		}
	}

	if os.Getenv("REDIS_ROOM_MAPPING") != "" {
		num, err := strconv.Atoi(os.Getenv("REDIS_ROOM_MAPPING"))
		if err != nil {
			log.Fatal("DB no of room map is badly formatted" + err.Error())
		} else {
			REDIS_ROOM_MAPPING = num
		}
	}
	
	clientMappings := storage.InitialiseClientMappings(REDIS_URI, REDIS_CLIENT_MAPPING)
	roomMappings := storage.InitialiseRoomMappings(REDIS_URI, REDIS_ROOM_MAPPING)


	logger.Log.Info("Beginning consumption from message queue")
	consumer.BeginConsuming(mq, logger, clientMappings, roomMappings)

}
