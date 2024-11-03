// This is used to keep track of all the endpoints that we are using in the application
package transport

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

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
