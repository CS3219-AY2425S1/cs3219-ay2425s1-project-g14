package transport

import (
	"history/common"
	"net/http"

	"github.com/gin-gonic/gin"
)

func HealthCheck(logger *common.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		logger.Log.Info("Health check successful")
		ctx.JSON(http.StatusOK, gin.H{"Status": "healthy"})
		logger.Log.Info("Health check successful")
	}
}
