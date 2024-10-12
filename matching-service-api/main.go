package main

import(

	"fmt"
	"log"
	"os"
	"time"

	"matching-service-api/models"
	"github.com/joho/godotenv"

	"github.com/gin-gonic/gin"
	"matching-service-api/transport"
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
		PORT = ":9200"
	}

	logger := models.NewLogger()

	logDirectory := "./log"

	if err := os.MkdirAll(logDirectory, 0755); err != nil {
		logger.Log.Error("Failed to create log directory: " + err.Error())
	}

	logFile, err := os.OpenFile("./log/question_api.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)

	if err != nil {
		logger.Log.Warn("Failed to log to file, using default stderr")
	}

	defer logFile.Close()

	logger.Log.Out = logFile

	URI := os.Getenv("RABBIT_URI")
	if URI == "" {
		logger.Log.Fatal("Error finding the queue URI")
	}
	channel, err := models.InitialiseQueue(URI)

	if err != nil {
		panic(err)
	}


	router := gin.Default()
	transport.SetCors(router, ORIGIN)
	transport.SetAllEndpoints(router, channel, logger)

	logger.Log.Info(fmt.Sprintf("Server started at time: %s", time.Now().String()))

	router.Run(PORT)	
}