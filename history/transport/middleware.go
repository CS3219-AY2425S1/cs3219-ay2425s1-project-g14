package transport

import (
	"encoding/json"
	"fmt"
	"history/common"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthorizeJWT(logger *common.Logger) gin.HandlerFunc {

	logger.Log.Info("Authorizing JWT")
	userServiceUrl := os.Getenv("USER_SERVICE_URI")
	if userServiceUrl == "" {
		userServiceUrl = "http://localhost:3001"
	}

	return func(ctx *gin.Context) {
		tokenString := ctx.GetHeader("Authorization")

		if tokenString == "" {
			logger.Log.Info("Authorization header not provided")
			ctx.JSON(http.StatusUnauthorized, gin.H{"Error": "Authorization header not provided"})
			ctx.Abort()
			return
		}

		token := strings.TrimPrefix(tokenString, "Bearer ")
		if token == "" || token == tokenString {
			logger.Log.Info("Invalid token")
			ctx.JSON(http.StatusUnauthorized, gin.H{"Error": "Invalid token"})
			ctx.Abort()
			return
		}

		userData, err := verifyToken(token, userServiceUrl, logger)
		if err != nil {
			logger.Log.Error("Unable to verify token: " + err.Error())
			ctx.JSON(
				http.StatusUnauthorized,
				gin.H{"Error": "Unable to verify token: " + err.Error()},
			)
			ctx.Abort()
			return
		}

		logger.Log.Info("User authorized", userData)

		ctx.Set("user", userData)

		ctx.Next()
	}
}

func verifyToken(token, userServiceUrl string, logger *common.Logger) (*common.User, error) {
	// TODO do we need redis here
	serviceEndpoint := userServiceUrl + "/auth/verify-token"
	logger.Log.Info(serviceEndpoint)

	client := &http.Client{}
	req, err := http.NewRequest("GET", serviceEndpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("error creating POST request: %w", err)
	}
	req.Header.Add("Authorization", "Bearer "+token)

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error sending POST request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("token verification failed: %s", string(body))
	}

	var tokenResponse common.TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResponse); err != nil {
		return nil, fmt.Errorf("error decoding response: %w", err)
	}

	user := tokenResponse.Data

	return &user, nil

}
