package transport

import (
	"matching-service-api/models"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetAllEndpoints(router *gin.Engine, producerQueue *models.ProducerQueue, logger *models.Logger) {
	router.POST("/request", HandleRequest(producerQueue, logger))

}

func SetCors(router *gin.Engine, origin string) {
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{origin},
		AllowMethods:     []string{"POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           2 * time.Minute,
	}))
}
