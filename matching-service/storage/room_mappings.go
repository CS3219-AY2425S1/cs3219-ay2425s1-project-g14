package storage

import (
	"context"
	"encoding/json"
	"fmt"
	"matching-service/models"
	"time"

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

func (db *RoomMappings) SendToStorageBlob(room *models.Room) error {
	ctx := context.Background()
	topics_json, err := json.Marshal(room.TopicTags)

	if err != nil {
		return fmt.Errorf("error marshling topics: %s", err.Error())
	}

	schema_json, err := json.Marshal(room.Schemas)

	if err != nil {
		return fmt.Errorf("error marshling topics: %s", err.Error())
	}

	// this is where the value is being set
	user1_info := map[string]interface{}{
		"roomId":      room.RoomId,
		"thisUser":    room.User1,
		"otherUser":   room.User2,
		"requestTime": room.RequestTime,

		"title":      room.Title,
		"titleSlug":  room.TitleSlug,
		"difficulty": room.Difficulty,
		"topicTags":  topics_json,
		"content":    room.Content,
		"schemas":    schema_json,
		"id":         room.QuestionId,
	}

	user2_info := map[string]interface{}{
		"roomId":      room.RoomId,
		"thisUser":    room.User2,
		"otherUser":   room.User1,
		"requestTime": room.RequestTime,

		"title":      room.Title,
		"titleSlug":  room.TitleSlug,
		"difficulty": room.Difficulty,
		"topicTags":  topics_json,
		"content":    room.Content,
		"schemas":    schema_json,
		"id":         room.QuestionId,
	}

	// TODO: Modify this - this is where the key-value is being set
	if err1 := db.Conn.HSet(ctx, room.MatchHash1, user1_info).Err(); err1 != nil {
		return fmt.Errorf("error setting user1's room to storage: %s", err1.Error())
	}

	if err2 := db.Conn.HSet(ctx, room.MatchHash2, user2_info).Err(); err2 != nil {
		return fmt.Errorf("error setting user2's room to storage: %s", err2.Error())
	}

	requestTime, err := time.ParseInLocation("2006-01-02 15-04-05", room.RequestTime, time.UTC)

	if err != nil {
		return fmt.Errorf("error parsing the time: %s", err.Error())
	}

	expiryTime := requestTime.Add(30 * time.Second)

	diff := int(time.Until(expiryTime).Seconds())

	if err1 := db.Conn.Expire(ctx, room.MatchHash1, time.Duration(diff)*time.Second).Err(); err1 != nil {
		return fmt.Errorf("error setting expiry time on room data: %s", err1.Error())
	}

	if err2 := db.Conn.Expire(ctx, room.MatchHash2, time.Duration(diff)*time.Second).Err(); err2 != nil {
		return fmt.Errorf("error setting expiry time on room data: %s", err2.Error())
	}

	return nil
}
