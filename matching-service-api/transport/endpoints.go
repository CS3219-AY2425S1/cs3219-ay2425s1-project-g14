package transport

import (
	"matching-service-api/models"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"time"
)

func SetAllEndpoints(router *gin.Engine, producerQueue *models.ProducerQueue, logger *models.Logger) {
	router.POST("/request", )

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