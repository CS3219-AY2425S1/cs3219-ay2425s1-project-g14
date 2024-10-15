//this file is deprecated
package mappings

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"matching-service/models"
)

// TODO: consider using redis to store this information instead
type Mappings struct {
	Topics     map[string][]string
	Difficulty map[string]string
}

func CreateMappings() *Mappings {
	return &Mappings{
		Topics:     make(map[string][]string),
		Difficulty: make(map[string]string),
	}
}

// TODO: implement logic to implement TTL for values
// logic to find matching categories and generates a room id for the 2 users
func (db *Mappings) HandleRequest(request models.IncomingRequests) (*models.Room, error) {
	for user1, topics := range db.Topics {
		if difficulty, exists := db.Difficulty[user1]; !exists {
			return nil, fmt.Errorf("user %s only exists in topics store and not in difficulty store", user1)
		} else if difficulty != request.Difficulty {
			continue
		}

		overlapping := findOverLap(topics, request.TopicTags)

		// user1 does not match with this user
		if len(overlapping) == 0 {
			continue
		}

		//match found, generate room Id and return the room
		if roomId, err := generateRoomId(); err != nil {
			return nil, err
		} else {
			//match found! delete user1 from store
			delete(db.Topics, user1)
			delete(db.Difficulty, user1)

			return &models.Room{
				RoomId:     roomId,
				User1:      user1,
				User2:      request.UserId,
				TopicTags:  overlapping,
				Difficulty: request.Difficulty,
			}, nil
		}
	}

	//no match found
	//add user2 to the mappings
	db.Topics[request.UserId] = request.TopicTags
	db.Difficulty[request.UserId] = request.Difficulty

	return nil, nil
}

func generateRoomId() (string, error) {
	bytes := make([]byte, 16)

	if _, err := io.ReadFull(rand.Reader, bytes); err != nil {
		return "", errors.New("Failed to generate random room Id" + err.Error())
	}

	return hex.EncodeToString(bytes), nil
}

func findOverLap(user1 []string, user2 []string) []string {

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
