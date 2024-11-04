package main

import (
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"

	apicommon "history/common"
	apidatabase "history/database"
	gintransport "history/transport"

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
		PORT = ":9091"
	}
	PG_CONN_STRING := os.Getenv("PG_CONN_STRING")
	if PG_CONN_STRING == "" {
		PG_CONN_STRING = "host=localhost user=postgres password=postgres dbname=history port=5432 sslmode=disable TimeZone=Asia/Shanghai"
	}

	logger := apicommon.NewLogger(logrus.New())

	logDirectory := "./log"

	if err := os.MkdirAll(logDirectory, 0755); err != nil {
		logger.Log.Error("Failed to create log directory: " + err.Error())
	}

	logFile, err := os.OpenFile("./log/history.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)

	if err != nil {
		logger.Log.Warn("Failed to log to file, using default stderr")
	}

	defer logFile.Close()

	logger.Log.Out = logFile

	//initialise the database and handle errors
	db, err := apidatabase.InitialiseDB(PG_CONN_STRING)

	if err != nil {
		panic(err)
	}

	f, _ := os.Create("log/gin.log")
	gin.DefaultWriter = io.MultiWriter(f, os.Stdout)

	router := gin.Default()
	gintransport.SetCors(router, ORIGIN)
	gintransport.SetAllEndpoints(router, db, logger)

	logger.Log.Info(fmt.Sprintf("Server started at time: %s", time.Now().String()))

	router.Run(PORT)
}
