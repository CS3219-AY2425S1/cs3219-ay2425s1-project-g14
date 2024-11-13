package transport

import (
	"net/http"
	"peerprep/common"
	"peerprep/database"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func GetRandomMatchingQuestion(db *database.QuestionDB, logger *common.Logger) (gin.HandlerFunc) {
	return func(ctx *gin.Context) {
		var request common.MatchingQuestion

		err := ctx.BindJSON(&request)

		if err != nil {
			ctx.JSON(http.StatusBadGateway, "error binding request from JSON")
			logger.Log.Error("Error converting JSON to matching request:", err.Error())
			return
		}
		
		filter := bson.D{
			{Key: "topicTags", Value: bson.D{{Key: "$in", Value: request.TopicTags}}},
			{Key: "difficulty", Value: request.Difficulty},
		}
		question, err := db.GetOneQuestionWithQuery(logger, filter)

		if err != nil {
			ctx.JSON(http.StatusBadGateway, "error retrieving questions from database")
			return
		}

		if question == nil {
			ctx.JSON(http.StatusNotFound, "no questions found matching the request")
			return
		}	
		
		ctx.JSON(http.StatusOK, question)
		logger.Log.Info("matching-service request handled successfully")
	}
}