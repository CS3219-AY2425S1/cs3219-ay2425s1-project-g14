//This is the logic to handle user requests.
//Each client is internally mapped to all the possible questions that satisfy their request.
//This server stores all the mappings between each client and their potential questions(id).
//If another user comes where their possible questions overlap with that of another user, a random question in the intersection is selected.

package consumer

import (
	"encoding/json"
	db "matching-service/mappings"
	"matching-service/models"

	rabbit "github.com/streadway/amqp"
)

func Process(msg rabbit.Delivery, mappings *db.Mappings) error {
	var request models.Requests

	if err := json.Unmarshal(msg.Body, &request); err != nil {
		return err
	}


	mappings.HandleRequest(request)
	return nil
}