// this is a method used to add questions to the database. This function will eventually be only called by admins.
package transport

import (
	"net/http"
	"peerprep/common"
	"peerprep/database"
	"strings"

	"github.com/microcosm-cc/bluemonday"

	"github.com/gin-gonic/gin"
)

func AddQuestionWithLogger(db *database.QuestionDB, logger *common.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var feQuestion common.FrontendQuestion

		if err := ctx.BindJSON(&feQuestion); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"Error adding question": err.Error()})
			logger.Log.Error("Error converting JSON to question: ", err.Error())
			return
		}

		p := bluemonday.UGCPolicy()
		feQuestion.Content = p.Sanitize(feQuestion.Content)

		titleSlug := strings.ToLower(feQuestion.Title)
		titleSlug = strings.ReplaceAll(titleSlug, " ", "-")

		question := common.Question{
			Title:      feQuestion.Title,
			TitleSlug:  titleSlug,
			Difficulty: feQuestion.Difficulty,
			TopicTags:  feQuestion.TopicTags,
			Schemas:    make([]string, 0),
			Content:    feQuestion.Content,
			Id:         -1,
		}

		status, err := db.AddQuestion(logger, &question)

		if err != nil {
			ctx.JSON(status, err.Error())
			return
		}

		ctx.JSON(status, "Question added successfully")
		logger.Log.Info("Question added successfully")
	}
}
