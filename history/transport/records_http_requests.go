// This is used to keep track of all the endpoints that we are using in the application
package transport

import (
	"time"

	"gorm.io/gorm"

	"history/common"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetAllEndpoints(router *gin.Engine, db *gorm.DB, logger *common.Logger) {
	router.GET("/health", HealthCheck(logger))

	authorized := router.Group("/history", AuthorizeJWT(logger))
	authorized.POST("/:uid", AddHistory(db, logger))
	authorized.PUT("/:uid", UpdateHistory(db, logger))
	authorized.GET("/:uid", GetAllHistory(db, logger))
	authorized.DELETE("/:uid/:qid", DeleteHistoryEntry(db, logger))
	authorized.DELETE("/:uid", ClearAllHistory(db, logger))
}

// enable CORS for the frontend
func SetCors(router *gin.Engine, origin string) {
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://host.docker.internal", origin},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           2 * time.Minute,
	}))
}
