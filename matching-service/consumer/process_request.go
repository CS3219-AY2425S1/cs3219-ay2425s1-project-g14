//This is the logic to handle user requests.
//Each client is internally mapped to all the possible questions that satisfy their request.
//This server stores all the mappings between each client and their potential questions(id).
//If another user comes where their possible questions overlap with that of another user, a random question in the intersection is selected.

package consumer

import (
	"context"
	"encoding/json"
	"fmt"
	"matching-service/models"
	db "matching-service/storage"

	rabbit "github.com/streadway/amqp"
)

func Process(msg rabbit.Delivery, clientMappings *db.ClientMappings, roomMappings *db.RoomMappings) error {
	var request models.IncomingRequests

	if err := json.Unmarshal(msg.Body, &request); err != nil {
		return fmt.Errorf("error unmarshling the request from JSON: %s", err.Error())
	}

	room, err := clientMappings.HandleRequest(request)

	if err != nil {
		return fmt.Errorf("error handling incoming request: %s", err.Error())
	}

	fmt.Println("success handling incoming request!")
	//deliver the response to the backend
	//TODO: to implement this
	if room != nil {
		if err := roomMappings.SendToStorageBlob(room); err != nil {
			return err
		}

		fmt.Println("success sending to storage blob")
		keys, _ := roomMappings.Conn.Keys(context.Background(), "*").Result()
		fmt.Println(keys)
		result, _ := roomMappings.Conn.HGetAll(context.Background(), "user1").Result()

		fmt.Println(len(result))
	}

	return nil
}
