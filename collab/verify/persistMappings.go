package verify

import (
	"context"
	"log"

	redis "github.com/go-redis/redis/v8"
)

// same as room mappings, but separated for type safety
type PersistMappings struct {
	Conn *redis.Client
}

func InitialisePersistMappings(addr string, db_num int) *PersistMappings {
	conn := redis.NewClient(&redis.Options{
		Addr: addr,
		DB:   db_num,
	})

	return &PersistMappings{
		Conn: conn,
	}
}

func VerifyPersist(persistMappings *PersistMappings, roomID string, userID string) bool {
	data, err := persistMappings.Conn.HGetAll(context.Background(), userID).Result()
	if err != nil {
		log.Printf("Error retrieving data for userID %s: %v", userID, err)
		return false
	}

	return data["roomId"] == roomID
}
