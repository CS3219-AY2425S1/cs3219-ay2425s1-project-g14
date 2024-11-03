package transport

import (
	"errors"
	"history/common"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AddHistory(db *gorm.DB, logger *common.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var record common.Record

		if err := ctx.BindJSON(&record); err != nil {
			ctx.JSON(
				http.StatusBadRequest,
				gin.H{"error": "Error parsing JSON", "details": err.Error()},
			)
			logger.Log.Error("AddHistory: Error parsing JSON to record: ", err.Error())
			return
		}

		if record.UserID == "" || record.RoomID == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "UserID and RoomID are required"})
			logger.Log.Error("AddHistory: Missing UserID or RoomID")
			return
		}

		if record.UserID != ctx.Param("uid") {
			ctx.JSON(
				http.StatusBadRequest,
				gin.H{"error": "UserID in URL does not match UserID in body"},
			)
			logger.Log.Error("AddHistory: UserID in URL does not match UserID in body")
			return
		}

		if result := db.Create(&record); result.Error != nil {
			if errors.Is(result.Error, gorm.ErrDuplicatedKey) {
				ctx.JSON(
					http.StatusConflict,
					gin.H{"error": "Record already exists", "details": result.Error.Error()},
				)
				logger.Log.Error("AddHistory: Record already exists")
				return
			}
			// TODO: other error handling
			ctx.JSON(
				http.StatusInternalServerError,
				gin.H{"error": "Error adding record", "details": result.Error.Error()},
			)
			logger.Log.Error("AddHistory: Error adding record to database: ", result.Error.Error())
			return
		}

		ctx.JSON(
			http.StatusCreated,
			gin.H{
				"status": "Record added successfully",
				"roomId": record.RoomID,
				"userId": record.UserID,
			},
		)
		logger.Log.Info("AddHistory: Record added successfully")
	}
}

func UpdateHistory(db *gorm.DB, logger *common.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var record common.Record

		if err := ctx.BindJSON(&record); err != nil {
			ctx.JSON(
				http.StatusBadRequest,
				gin.H{"error": "Error parsing JSON", "details": err.Error()},
			)
			logger.Log.Error("UpdateHistory: Error parsing JSON to record: ", err.Error())
			return
		}

		if record.UserID != ctx.Param("uid") {
			ctx.JSON(
				http.StatusBadRequest,
				gin.H{"error": "UserID in URL does not match UserID in body"},
			)
			logger.Log.Error("UpdateHistory: UserID in URL does not match UserID in body")
			return
		}

		if record.RoomID == "" || record.UserID == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "RoomID and UserID are required"})
			logger.Log.Error("UpdateHistory: Missing RoomID or UserID")
			return
		}

		result := db.Save(&record)

		if result.Error != nil {
			ctx.JSON(
				http.StatusInternalServerError,
				gin.H{"error": "Error updating record", "details": result.Error.Error()},
			)
			logger.Log.Error(
				"UpdateHistory: Error updating record in database: ",
				result.Error.Error(),
			)
			return
		}

		ctx.JSON(
			http.StatusOK,
			gin.H{
				"status": "Record updated successfully",
				"roomId": record.RoomID,
				"userId": record.UserID,
			},
		)
		logger.Log.Info("UpdateHistory: Record updated successfully")
	}
}

func ClearAllHistory(db *gorm.DB, logger *common.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userID := ctx.Param("uid")
		if userID == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
			logger.Log.Error("ClearAllHistory: Missing user ID")
			return
		}

		result := db.Where("userID = ?", userID).Delete(&common.Record{})
		if result.Error != nil {
			ctx.JSON(
				http.StatusInternalServerError,
				gin.H{"error": "Error deleting records", "details": result.Error.Error()},
			)
			logger.Log.Error(
				"ClearAllHistory: Error deleting records from database: ",
				result.Error.Error(),
			)
			return
		}

		ctx.JSON(
			http.StatusOK,
			gin.H{"status": "All user records deleted successfully", "userId": userID},
		)
		logger.Log.Info("ClearAllHistory: All records deleted successfully for user ", userID)
	}
}

func DeleteHistoryEntry(db *gorm.DB, logger *common.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		roomID := ctx.Param("qid")
		userID := ctx.Param("uid")

		if roomID == "" || userID == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Room ID and User ID are required"})
			logger.Log.Error("DeleteHistoryEntry: Missing Room ID or User ID")
			return
		}

		result := db.Where("roomID = ? AND userID = ?", roomID, userID).Delete(&common.Record{})
		if result.Error != nil {
			ctx.JSON(
				http.StatusInternalServerError,
				gin.H{"error": "Error deleting record", "details": result.Error.Error()},
			)
			logger.Log.Error(
				"DeleteHistoryEntry: Error deleting record from database: ",
				result.Error.Error(),
			)
			return
		}

		ctx.JSON(
			http.StatusOK,
			gin.H{"status": "Record deleted successfully", "roomId": roomID, "userId": userID},
		)
		logger.Log.Info(
			"DeleteHistoryEntry: Record deleted successfully for RoomID ",
			roomID,
			" and UserID ",
			userID,
		)
	}
}

func GetAllHistory(db *gorm.DB, logger *common.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userID := ctx.Param("uid")
		if userID == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
			logger.Log.Error("GetAllHistory: Missing user ID")
			return
		}

		var records []common.Record
		result := db.Where("userID = ?", userID).Find(&records)
		if result.Error != nil {
			ctx.JSON(
				http.StatusInternalServerError,
				gin.H{"error": "Error retrieving records", "details": result.Error.Error()},
			)
			logger.Log.Error(
				"GetAllHistory: Error retrieving records from database: ",
				result.Error.Error(),
			)
			return
		}

		ctx.JSON(
			http.StatusOK,
			gin.H{"status": "Records retrieved successfully", "records": records},
		)
		logger.Log.Info("GetAllHistory: Records retrieved successfully for user ", userID)
	}
}
