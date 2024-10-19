package database

import (
	"go.mongodb.org/mongo-driver/mongo"
)

// QuestionDB is a struct that contains a pointer to a mongo client.
// questions is the collection with all the questions, nextId is a single-entry collection that stores the next ID to be used.
type QuestionDB struct {
	questions *mongo.Collection
	nextId    *mongo.Collection
}

// returns a pointer to an instance of the Question collection
func NewQuestionDB(client *mongo.Client) *QuestionDB {

	questionCollection := client.Database("questions").Collection("questions")
	idCollection := client.Database("questions").Collection("counter")
	return &QuestionDB{questions: questionCollection, nextId: idCollection}
}
