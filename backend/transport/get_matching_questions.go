// this is used to get all questions that match a query. The query can be on either the title or the id of the question
package transport

import (
	"fmt"
	"net/http"
	"peerprep/common"
	"peerprep/database"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

//matches if the id is equal to the query, or if the title contains the query
func GetMatchingQuestionsWithLogger(db *database.QuestionDB, logger *common.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		query := ctx.Param("query")
		
		if strings.Contains(query, " ") {
			ctx.JSON(http.StatusBadRequest, gin.H{"Error finding questions": "endpoint cannot contain spaces"})
			logger.Log.Warn("Attempted to query with illegal endpoint: ", query)
			return
		}
		
		// replace all dashes with spaces
		query = strings.ReplaceAll(query, "-", " ")
		
		title_filter := bson.D{bson.E{Key: "title", Value: bson.D{bson.E{Key: "$regex", Value: "(?i)" + query}}}}
		
		var id_filter bson.D
		
		if id, err := strconv.Atoi(query); err == nil {
			id_filter = bson.D{bson.E{Key: "id", Value: id}}
		}
		
		var filter bson.D
		
		if id_filter == nil {
			//query is a string
			filter = title_filter
		} else {
			//query is an integer
			filter = bson.D{bson.E{Key: "$or", Value: []bson.D{id_filter, title_filter}}}
		}

		questions, err := db.GetAllQuestionsWithQuery(logger, filter)

		if err != nil {
			ctx.JSON(http.StatusBadGateway, err.Error())
			return
		}
		
		if len(questions) == 0 {
			ctx.JSON(http.StatusNotFound, gin.H{"No questions match the query": query})
			logger.Log.Warn(fmt.Sprintf("No questions found matching the query: %s", query))
			return
		}

		ctx.JSON(http.StatusOK, questions)
		logger.Log.Info(fmt.Sprintf("Questions matching query %s retrieved successfully", query))
	}
}

