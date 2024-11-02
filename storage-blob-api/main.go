package main

import (
	"log"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"storage-blob-api/models"
	"storage-blob-api/storage"
	"storage-blob-api/transport"
)

func main() {
	//initialise logger file and directory if they do not exist

	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading environment variables: " + err.Error())
	}

	ORIGIN := os.Getenv("CORS_ORIGIN")
	if ORIGIN == "" {
		ORIGIN = "http://localhost:3000"
	}
	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = ":9300"
	}

	logger := models.NewLogger()

	logDirectory := "./log"

	if err := os.MkdirAll(logDirectory, 0755); err != nil {
		logger.Log.Error("Failed to create log directory: " + err.Error())
	}

	logFile, err := os.OpenFile("./log/matching_service_api.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)

	if err != nil {
		logger.Log.Warn("Failed to log to file, using default stderr")
	}

	defer logFile.Close()

	logger.Log.Out = logFile

	REDIS_URI := os.Getenv("REDIS_URI")

	if REDIS_URI == "" {
		REDIS_URI = "localhost://9190"
	}
	
	REDIS_ROOM_MAPPING   := 1

	if os.Getenv("REDIS_ROOM_MAPPING") != "" {
		num, err := strconv.Atoi(os.Getenv("REDIS_ROOM_MAPPING"))
		if err != nil {
			log.Fatal("DB no of room map is badly formatted" + err.Error())
		} else {
			REDIS_ROOM_MAPPING = num
		}
	}

	roomMappings := storage.InitialiseRoomMappings(REDIS_URI, REDIS_ROOM_MAPPING)	

	router := gin.Default()
	transport.SetCors(router, ORIGIN)
	transport.SetAllEndpoints(router, roomMappings, logger)

	logger.Log.Info("Server started running successfully")
	router.Run(PORT)
}