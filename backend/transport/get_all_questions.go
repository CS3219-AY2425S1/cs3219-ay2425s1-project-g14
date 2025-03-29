// endpoint to get all questions
package transport

import (
	"net/http"
	"peerprep/common"
	"peerprep/database"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)
func GetAllQuestionsWithLogger(db *database.QuestionDB, logger *common.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		questions, err := db.GetAllQuestionsWithQuery(logger, bson.D{})

		if err != nil {
			ctx.JSON(http.StatusBadGateway, err.Error())
			return
		}
		
		if len(questions) == 0 {
			ctx.JSON(http.StatusNotFound, gin.H{"Error retrieving questions": "No questions found"})
			logger.Log.Error("No questions found when retrieving all questions")
			return
		}

		ctx.JSON(http.StatusOK, questions)
		logger.Log.Info("All questions retrieved successfully")
	}
}

