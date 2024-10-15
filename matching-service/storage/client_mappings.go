package storage

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"matching-service/models"
	"time"

	redis "github.com/go-redis/redis/v8"
)


type ClientMappings struct {
	Conn *redis.Client
}

func InitialiseClientMappings(addr string, db_num int) *ClientMappings {
	conn := redis.NewClient(&redis.Options{
			Addr:addr,
			DB: db_num,
		})

	return &ClientMappings{
		Conn: conn,
	}

}

func (db *ClientMappings) HandleRequest(request models.IncomingRequests) (*models.Room, error){
	ctx := context.Background()
	user2, user2_difficulty, user2_topics := request.UserId, request.Difficulty, request.TopicTags

	currMappings, err := db.Conn.Keys(ctx, "*").Result()

	if err != nil {
		return nil, err
	}

	for _, user1 := range currMappings {
		result, err := db.Conn.HGetAll(ctx, user1).Result()

		if err == redis.Nil {
			continue //key expired
		} else if err != nil {
			return nil, err
		}

		var user1_topics []string
		if err := json.Unmarshal([]byte(result["topicTags"]), &user1_topics); err != nil {
			return nil, err
		}

		user1_difficulty := result["difficulty"]

		if user1_difficulty != user2_difficulty {
			continue
		}

		overlappingTopics := findOverlap(user1_topics, user2_topics)
		
		if len(overlappingTopics) == 0 {
			continue
		}	

		
		if roomId, err := generateRoomId(); err != nil {
			return nil, err
		} else {
			db.Conn.Del(ctx, user1)
			
			

			return &models.Room{
				RoomId: roomId,
				User1: user1,
				User2: user2,
				TopicTags: overlappingTopics,
				Difficulty: user1_difficulty,
			}, nil
		}

	}

	//no match found

	user2_topics_json, err := json.Marshal(user2_topics)
	
	if err != nil {
		return nil, err
	}

	err = db.Conn.HSet(ctx, user2, map[string]interface{}{
		"topicTags": user2_topics_json,
		"difficulty": user2_difficulty,
	}).Err()

	if err != nil {
		return nil, err
	}

	requestTime, err := time.Parse("2006-01-02 15-04-05", request.RequestTime)

	if err != nil {
		return nil, err
	}

	expiryTime := requestTime.Add(30 * time.Second)
	diff := int(time.Until(expiryTime).Seconds())
	err = db.Conn.Expire(ctx, user2, time.Duration(diff) * time.Second).Err()

	if err != nil  {
		return nil, err
	}

	return nil, nil
}

func findOverlap(user1 []string, user2 []string) []string {

	stringMap := make(map[string]bool)
	var commonStrings []string

	// Store each string from slice1 in the map
	for _, topic := range user1 {
		stringMap[topic] = true
	}

	// Iterate over slice2 and check for common strings
	for _, topic := range user2 {
		if stringMap[topic] {
			commonStrings = append(commonStrings, topic)
			delete(stringMap, topic) // Remove to avoid duplicates in result
		}
	}

	return commonStrings
}

func generateRoomId() (string, error) {
	bytes := make([]byte, 16)

	if _, err := io.ReadFull(rand.Reader, bytes); err != nil {
		return "", errors.New("Failed to generate random room Id" + err.Error())
	}

	return hex.EncodeToString(bytes), nil
}