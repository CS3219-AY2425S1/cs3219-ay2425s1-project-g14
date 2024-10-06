// This is used to get a specific question using the unique ID of the question.
// The endpoint is defined as /questions/solve/id=<id>
package transport

import (
	"fmt"
	"net/http"
	"peerprep/common"
	"peerprep/database"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func GetQuestionWithLogger(db *database.QuestionDB, logger *common.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// get the numeric ID from the URL
		id, err := strconv.Atoi(ctx.Param("id"))

		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"Error retrieving question": "Invalid ID"})
			logger.Log.Warn("Invalid ID: ", ctx.Param("id"))
			return
		}

		var questions []common.Question
		questions, err = db.GetAllQuestionsWithQuery(
			logger,
			bson.D{bson.E{Key: "id", Value: id}},
		)

		if err != nil {
			ctx.JSON(http.StatusBadGateway, err.Error())
			return
		}

		if len(questions) == 0 {
			ctx.JSON(http.StatusNotFound, "Question not found")
			logger.Log.Warn(fmt.Sprintf("Question with ID %d not found", id))
			return
		}

		if len(questions) > 1 {
			ctx.JSON(http.StatusBadGateway, "more than one question found")
			logger.Log.Error("Multiple questions with the same id")
			return
		}

		ctx.JSON(http.StatusOK, questions[0])
		logger.Log.Info(fmt.Sprintf("Question with ID %d returned successfully", id))
	}
}
