package transport

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"peerprep/common"
)

func HealthCheck(logger *common.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"Status": "healthy"})
		logger.Log.Info("Health check successful")
	}
}
