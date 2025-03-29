// utility functions for questions api
package database

import (
	"context"
	"peerprep/common"

	"go.mongodb.org/mongo-driver/bson"
)

// used to check if a question already exists in the database.
func (db *QuestionDB) QuestionExists(question *common.Question) bool {
	filter := bson.D{bson.E{Key: "title", Value: question.Title}}
	err := db.questions.FindOne(context.Background(), filter).
		Decode(&common.Question{})
	//FindOne() returns error if no document is found
	return err == nil
}

// used to find the next question ID to be used. Similar to SERIAL in psql.
func (db *QuestionDB) FindNextQuestionId() int {
	id := struct {
		Next int `json:"next"`
	}{}
	filter := bson.D{}

	if err := db.nextId.FindOne(context.Background(), filter).Decode(&id); err != nil {
		return -1
	}

	return id.Next
}

// used to check if a question being replaced will cause duplicates in the database

func (db *QuestionDB) QuestionExistsExceptId(question *common.Question) bool {
	filter := bson.D{
		bson.E{Key: "title", Value: question.Title},
		bson.E{Key: "id", Value: bson.D{bson.E{Key: "$ne", Value: question.Id}}},
	}
	err := db.questions.FindOne(context.Background(), filter).
		Decode(&common.Question{})
	//FindOne() returns error if no document is found
	return err == nil
}
