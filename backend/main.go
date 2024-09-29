package main

import (
	"fmt"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	apidatabase "peerprep/database"
	gintransport "peerprep/transport"
	apicommon "peerprep/common"
)


func main() {
	//initialise logger file and directory if they do not exist
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

	
	router := gin.Default()
	gintransport.SetCors(router)
	gintransport.SetAllEndpoints(router, questionDB, logger)

	logger.Log.Info(fmt.Sprintf("Server started at time: %s", time.Now().String()))

	router.Run(":9090") 
}
