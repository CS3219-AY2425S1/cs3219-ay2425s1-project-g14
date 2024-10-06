// This is used to keep track of all the endpoints that we are using in the application
package transport

import (
	"time"

	"peerprep/common"
	"peerprep/database"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetAllEndpoints(router *gin.Engine, db *database.QuestionDB, logger *common.Logger) {
	router.GET("/questions", GetAllQuestionsWithLogger(db, logger))
	router.POST("/questions", AddQuestionWithLogger(db, logger))
	router.GET("/questions/search/:query", GetMatchingQuestionsWithLogger(db, logger))
	router.GET("/questions/solve/:id", GetQuestionWithLogger(db, logger))
	router.DELETE("/questions/delete/:id", DeleteQuestionWithLogger(db, logger))
	router.PUT("/questions/replace/:id", ReplaceQuestionWithLogger(db, logger))
	router.GET("/health", HealthCheck(logger))
}

// enable CORS for the frontend
func SetCors(router *gin.Engine, origin string) {
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{origin},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           2 * time.Minute,
	}))
}
