//This is the logic to handle user requests.
//Each client is internally mapped to all the possible questions that satisfy their request.
//If another user comes where their possible questions overlap with that of another user, a random question in the intersection is selected.

package consumer

import (
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
	if room != nil {
		if err := roomMappings.SendToStorageBlob(room); err != nil {
			return err
		}

		fmt.Println("success sending to storage blob")
	}

	return nil
}
