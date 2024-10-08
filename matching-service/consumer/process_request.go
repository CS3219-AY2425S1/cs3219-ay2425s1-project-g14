//This is the logic to handle user requests.
//Each client is internally mapped to all the possible questions that satisfy their request.
//This server stores all the mappings between each client and their potential questions(id).
//If another user comes where their possible questions overlap with that of another user, a random question in the intersection is selected.

package consumer

import (
	rabbit "github.com/streadway/amqp"
	db "matching-service/mappings"
)

func Process(rabbit.Delivery, *db.Mappings) {
		
}