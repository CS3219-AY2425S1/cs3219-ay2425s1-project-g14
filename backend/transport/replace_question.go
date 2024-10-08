//updates a question with a given id. The id must be matched perfectly.
//Updating questions will not increment the next id like that of a post request, unless the supplied id is greater or equal to the next id.

package transport

import (
	"net/http"
	"strconv"

	"peerprep/common"
	"peerprep/database"

	"github.com/gin-gonic/gin"
)

// for PUT requests, to replace an entire question with a new question, or create a new question if the id does not yet exist
func ReplaceQuestionWithLogger(db *database.QuestionDB, logger *common.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id_param, err := strconv.Atoi(ctx.Param("id"))

		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"Error replacing question": "ID is not a number"})
			logger.Log.Warn("Attempted to update with invalid ID: ", ctx.Param("id"))
			return
		}

		var new_question common.Question
		err = ctx.BindJSON(&new_question)

		if err != nil {
			logger.Log.Error("error", "Failed to bind JSON", err)
			ctx.JSON(http.StatusBadGateway, gin.H{"Error replacing question": err.Error()})
			return
		}

		if id_param >= db.FindNextQuestionId() {
			logger.Log.Info(
				"Attempting to update a question with an ID greater than next ID, creating a new question",
			)
			status, err := db.AddQuestion(logger, &new_question)

			if err != nil {
				ctx.JSON(status, err.Error())
				return
			}

			ctx.JSON(status, "Question added successfully")
			logger.Log.Info("Question added successfully")
			return
		}

		logger.Log.Info("Replacing question with ID: ", id_param)
		new_question.Id = id_param

		// used	to ensure that replacing a question will not cause a conflict with another question
		// e.g new question shares same title as question A, but is used to replace question B. This will result in 2 question A's in the database.
		if db.QuestionExistsExceptId(&new_question) {
			ctx.JSON(http.StatusConflict, "Question already exists")
			logger.Log.Warn("Cannot replace question: question already exists")
			return
		}

		status, err := db.UpsertQuestion(logger, &new_question)

		if err != nil {
			ctx.JSON(status, err.Error())
			return
		}

		ctx.JSON(status, "Question updated successfully")
		logger.Log.Info("Question upserted successfully")

	}
}
