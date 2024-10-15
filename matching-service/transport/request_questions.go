//handles the request to the question-service to find a suitable question for the 2 users to match on

package transport

import (
	"bytes"
	"encoding/json"
	"fmt"
	"matching-service/models"
	"net/http"
)

func FindSuitableQuestionId(topicTags []string, difficulty string) (error) {
	data := models.OutGoingRequests{
		TopicTags: topicTags,
		Difficulty: difficulty,
	}

	reqBody, err := json.Marshal(data)
	
	if err != nil {
		return fmt.Errorf("failed to convert outgoing req to JSON: %s", err.Error())
	}

	req, err := http.NewRequest("POST", "http://localhost:9090", bytes.NewBuffer(reqBody))

	if err != nil {
		return fmt.Errorf("failed to make request: %s", err.Error())
	}

	req.Header.Set("Content-Type", "application/json")

	client := http.DefaultClient

	resp, err := client.Do(req)

	if err != nil {
		return fmt.Errorf("error sending request: %s", err.Error())
	}

	var response 

}