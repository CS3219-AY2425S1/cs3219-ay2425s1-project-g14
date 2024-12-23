package verify

import (
	"context"
	"log"
	//"time"

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

func VerifyRoomAndMoveToPersist(
		roomMappings *RoomMappings,
		roomID string,
		userId string,
		matchHash string,
		persistMappings *PersistMappings,
) bool {
	ctx := context.Background()
	data, err := roomMappings.Conn.HGetAll(ctx, matchHash).Result()
	if err != nil {
		log.Printf("Error retrieving data for matchHash %s: %v", matchHash, err)
		return false
	}

	if data["roomId"] != roomID || data["thisUser"] != userId {
		log.Printf("Mismatch in room data and user data")
		return false
	}

	roomMappings.Conn.Del(ctx, matchHash);
	persistentRoom := map[string]interface{}{
		"roomId":        roomID,
		"otherUser":     data["otherUser"],
		"requestTime":   data["requestTime"],
	}

	// this always overrides the persistent room
	if err := persistMappings.Conn.HSet(ctx, userId, persistentRoom).Err(); err != nil {
		log.Printf("error sending room to persistent storage: %s", err.Error())
	}

	/*	
	if err := persistMappings.Conn.Expire(ctx, userId, 20 * time.Second).Err(); err != nil {
		log.Printf("error setting expiration for persisting room storage: %s", err.Error())
	} else {
		log.Printf("expiration set for 10 minutes for user %s: ", userId)
	
	}
	*/
	return true
}
