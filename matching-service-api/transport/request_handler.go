package transport

import (
	"encoding/json"
	"fmt"
	"matching-service-api/models"
	"matching-service-api/mappings"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/streadway/amqp"
)

func HandleRequest(channel *models.ProducerQueue, logger *models.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var req models.Request

		if err := ctx.BindJSON(&req); err != nil {
			logger.Log.Error("error receiving request: ", err.Error())
			ctx.JSON(http.StatusBadGateway, gin.H{"error receiving request": err.Error()})
			return
		}

		parsedTime, err := time.Parse("2006-01-02 15-04-05", req.RequestTime)

		if err != nil {
			logger.Log.Error("error parsing the time: ", err.Error())
			ctx.JSON(http.StatusBadRequest, "error parsing time, ensure time is parsed in YYYY-MM-DD HH:mm:ss format")
			return
		}

		// adding this matching hash to reserve user-id as a store for
		// persistence.
		matchHash, err := mappings.GenerateMatchingHash();
		if err != nil {
			logger.Log.Error("Error: " + err.Error())
			ctx.JSON(http.StatusInternalServerError, "failed to generate query hash")
			return
		}
		req.MatchHash = matchHash;

		//current time is more than 30 seconds after request time, timeout
		if time.Now().After(parsedTime.Add(30 * time.Second).Add(-8 * time.Hour)) {
			logger.Log.Warn("request timeout")
			ctx.JSON(http.StatusRequestTimeout, "request time is too old")
			return
		}

		message, err := json.Marshal(req)

		if err != nil {
			logger.Log.Error("error converting request to bytes: ", err.Error())
			ctx.JSON(http.StatusBadGateway, "error processing request")
			return
		}

		if err := channel.Channel.Publish(
			"",
			channel.Queue.Name,
			false,
			false,
			amqp.Publishing{
				DeliveryMode: amqp.Persistent,
				ContentType:  "text/plain",
				Body:         []byte(message),
			}); err != nil {
			logger.Log.Error("error publishing message:", err.Error())
			return
		}

		logger.Log.Info(fmt.Sprintf("request from user %s successfully published", req.UserId))
		ctx.JSON(http.StatusOK, gin.H{
			"match_code": matchHash,
			"message": "processing request",
		})
	}
}
