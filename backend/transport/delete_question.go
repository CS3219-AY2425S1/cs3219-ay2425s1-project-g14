/*
This is used to delete a question using the unique ID of the question.
The endpoint is defined as /questions/delete/id=<id>
Since deletion is a dangerous operation, it will perform a delete only on an exact match of the ID.
*/

package transport

import (
	"fmt"
	"net/http"
	"peerprep/common"
	"peerprep/database"
	"strconv"

	"github.com/gin-gonic/gin"
)

func DeleteQuestionWithLogger(db *database.QuestionDB, logger *common.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, err := strconv.Atoi(ctx.Param("id"))
		
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"Error deleting question": "Invalid ID"})
			logger.Log.Warn("Attempted deletion with invalid ID: ", ctx.Param("id"))
			return
		}

		if status, err := db.DeleteQuestion(logger, id); err != nil {
			ctx.JSON(status, err.Error())
		} else {
			ctx.JSON(status, "Question deleted successfully")
			logger.Log.Warn(fmt.Sprintf("Question with ID %d deleted successfully", id))
		}
	}
}