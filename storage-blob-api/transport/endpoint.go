package transport

import (
	"storage-blob-api/models"
	"storage-blob-api/storage"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetAllEndpoints(router *gin.Engine, db *storage.RoomMappings, logger *models.Logger) {
	router.GET("/request/:matchHash", HandleRequest(db, logger))
}

func SetCors(router *gin.Engine, origin string) {
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{origin},
		AllowMethods:     []string{"POST","OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           2 * time.Minute,
	}))
}