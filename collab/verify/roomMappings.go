package verify

import (
	"context"
	"log"

	redis "github.com/go-redis/redis/v8"
)

// same as client mappings, but separated for type safety
type RoomMappings struct {
	Conn *redis.Client
}

func InitialiseRoomMappings(addr string, db_num int) *RoomMappings {
	conn := redis.NewClient(&redis.Options{
		Addr: addr,
		DB:   db_num,
	})

	return &RoomMappings{
		Conn: conn,
	}
}

func VerifyRoom(roomMappings *RoomMappings, roomID string, userID string) bool {
	data, err := roomMappings.Conn.HGetAll(context.Background(), userID).Result()
	if err != nil {
		log.Printf("Error retrieving data for userID %s: %v", userID, err)
		return false
	}

	return data["roomId"] == roomID
}
