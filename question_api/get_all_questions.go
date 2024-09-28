// endpoint to get all questions
package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)
func GetAllQuestionsWithLogger(db *QuestionDB, logger *Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		questions, err := db.GetAllQuestions(logger)

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
