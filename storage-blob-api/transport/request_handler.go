package transport

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"storage-blob-api/models"
	"storage-blob-api/storage"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

func HandleRequest(db *storage.RoomMappings, logger *models.Logger) (gin.HandlerFunc){
	return func(ctx *gin.Context) {
		userId := ctx.Param("userId")

		result, err := db.Conn.HGetAll(context.Background(), userId).Result()
		
		if err == redis.Nil {
			logger.Log.Warn(fmt.Sprintf("userId %s expired: ", userId))
			ctx.JSON(http.StatusGone, "userId has expired")
			return
		} else if err != nil {
			logger.Log.Error(fmt.Errorf("error retrieving userId from database: %s", err.Error()))
			ctx.JSON(http.StatusBadGateway, "error retriving userId from database")
			return
		}
		
		if len(result) == 0 {
			ctx.JSON(http.StatusNotFound, "data not ready")
		}

		var topics_json, schemas_json []string 

		if err1 := json.Unmarshal([]byte(result["topicTags"]), &topics_json); err1 != nil {
			logger.Log.Error(fmt.Errorf("unable to unmarshal topicTags to json: %s", err1.Error()))
			ctx.JSON(http.StatusBadGateway, "error unmarshling user topics")
			return
		}


		if err2 := json.Unmarshal([]byte(result["schemas"]), &schemas_json); err2 != nil {
			logger.Log.Error(fmt.Errorf("unable to unmarshal schemas to json: %s", err2.Error()))
			ctx.JSON(http.StatusBadGateway, "error unmarshling schemas")
			return
		}

		roomId, user2, requestTime, title, titleSlug, difficulty, content, questionId_string := 
			result["roomId"], result["otherUser"], result["requestTime"], 
			result["title"], result["titleSlug"], result["difficulty"], result["content"], result["id"]

		questionId, err := strconv.Atoi(questionId_string)

		if err != nil {
			logger.Log.Error(fmt.Errorf("failed to convert questionId to int: %s", err.Error()))
			ctx.JSON(http.StatusBadGateway, "questionId is not an int")
			return
		}

		room := models.Room{
			RoomId: roomId,
			User1: userId,
			User2: user2,
			RequestTime: requestTime,

			Title: title,
			TitleSlug: titleSlug,
			TopicTags: topics_json,
			Difficulty: difficulty,
			Content: content,
			Schemas: schemas_json,
			QuestionId: questionId,
		}

		ctx.JSON(http.StatusOK, room)
		logger.Log.Info("Request handled successfully")
	}
}