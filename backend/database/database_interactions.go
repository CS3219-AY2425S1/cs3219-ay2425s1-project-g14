// contains the database-related functions for the questions API.
package database

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"peerprep/common"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (db *QuestionDB) GetAllQuestionsWithQuery(
	logger *common.Logger,
	filter bson.D,
) ([]common.Question, error) {
	questionCursor, err := db.questions.Find(context.Background(), filter)

	if err != nil {
		logger.Log.Error("Error retrieving questions: ", err.Error())
		return nil, err
	}

	var questions []common.Question

	if err = questionCursor.All(context.Background(), &questions); err != nil {
		logger.Log.Error("Error decoding questions: ", err.Error())
		return nil, err
	}

	return questions, nil
}

func (db *QuestionDB) AddQuestion(logger *common.Logger, question *common.Question) (int, error) {
	if db.QuestionExists(question) {
		logger.Log.Warn("Cannot add question: question already exists")
		return http.StatusConflict, errors.New("question already exists")
	}

	if _, err := db.questions.InsertOne(context.Background(), question); err != nil {
		logger.Log.Error("Error adding question", err.Error())
		return http.StatusBadGateway, err
	}

	return http.StatusOK, nil
}

func (db *QuestionDB) UpsertQuestion(
	logger *common.Logger,
	question *common.Question,
) (int, error) {

	filter := bson.D{bson.E{Key: "id", Value: question.Id}}
	setter := bson.M{"$set": question}
	upsert := options.Update().SetUpsert(true)

	_, err := db.questions.UpdateOne(context.Background(), filter, setter, upsert)

	if err != nil {
		logger.Log.Error("Error while upserting question", err.Error())
		return http.StatusBadGateway, err
	}

	return http.StatusOK, nil
}

func (db *QuestionDB) DeleteQuestion(logger *common.Logger, id int) (int, error) {
	deleteStatus, err := db.questions.DeleteOne(
		context.Background(),
		bson.D{bson.E{Key: "id", Value: id}},
	)

	if err != nil {
		logger.Log.Error("Error deleting question", err.Error())
		return http.StatusBadGateway, err
	} else if deleteStatus.DeletedCount == 0 {
		msg := fmt.Sprintf("Question with ID %d not found when deleting question", id)
		logger.Log.Warn(msg)
		return http.StatusNotFound, errors.New(msg)
	}

	return http.StatusNoContent, nil
}
