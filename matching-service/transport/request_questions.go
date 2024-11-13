//handles the request to the question-service to find a suitable question for the 2 users to match on

package transport

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"io"
	"matching-service/models"
	"net/http"
)

func FindSuitableQuestionId(topicTags []string, difficulty string, target *models.Room) (error) {
	data := models.OutGoingRequests{
		TopicTags: topicTags,
		Difficulty: difficulty,
	}

	reqBody, err := json.Marshal(data)
	
	if err != nil {
		return fmt.Errorf("failed to convert outgoing req to JSON: %s", err.Error())
	}

	URI := os.Getenv("BACKEND_MATCH_URI")

	if URI == "" {
		URI = "http://localhost:9090/match"
	}

	req, err := http.NewRequest("POST", URI, bytes.NewBuffer(reqBody))

	if err != nil {
		return fmt.Errorf("failed to make request: %s", err.Error())
	}

	req.Header.Set("Content-Type", "application/json")

	client := http.DefaultClient

	resp, err := client.Do(req)

	if err != nil {
		return fmt.Errorf("error sending request: %s", err.Error())
	} else if resp.StatusCode == http.StatusNotFound {
		//no matching questions
		return nil
	} else if resp.StatusCode >= 300 {
		return fmt.Errorf("question service encountered error when processing request")
	}


	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return fmt.Errorf("error reading response body: %s", err.Error())
	}

	//unmarshal the data into the target room struct
	err = json.Unmarshal(body, target)

	if err != nil {
		return fmt.Errorf("error unmarshalling JSON to question: %s", err.Error())
	}


	return nil
}