//This is the logic to handle user requests.
//Each client is internally mapped to all the possible questions that satisfy their request.
//This server stores all the mappings between each client and their potential questions(id).
//If another user comes where their possible questions overlap with that of another user, a random question in the intersection is selected.

package consumer

import (
	"encoding/json"
	db "matching-service/storage"
	"matching-service/models"

	"fmt"

	rabbit "github.com/streadway/amqp"
)

func Process(msg rabbit.Delivery, mappings *db.ClientMappings) error {
	var request models.IncomingRequests

	if err := json.Unmarshal(msg.Body, &request); err != nil {
		return err
	}

	room, err := mappings.HandleRequest(request)

	if err != nil {
		return err
	}

	//deliver the response to the backend
	//TODO: to implement this
	if room != nil {
		
	}
	return nil
}
