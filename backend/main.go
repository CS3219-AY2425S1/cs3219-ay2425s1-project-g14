// this is the main file to run the server
package main

import (
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"

	apicommon "peerprep/common"
	apidatabase "peerprep/database"
	gintransport "peerprep/transport"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
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
		PORT = ":9090"
	}

	logger := apicommon.NewLogger(logrus.New())

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

	//initialise the database and handle errors
	server, err := apidatabase.InitialiseDB()

	if err != nil {
		panic(err)
	}

	//create a new instance of the questionDB
	questionDB := apidatabase.NewQuestionDB(server)

	f, _ := os.Create("log/gin.log")
	gin.DefaultWriter = io.MultiWriter(f, os.Stdout)

	router := gin.Default()
	gintransport.SetCors(router, ORIGIN)
	gintransport.SetAllEndpoints(router, questionDB, logger)

	logger.Log.Info(fmt.Sprintf("Server started at time: %s", time.Now().String()))

	router.Run(PORT)
}
