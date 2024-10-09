package models

type Requests struct {
	UserId string `json:"userId"`
	TopicTags []string `json:"topicTags"`
	Difficulty string `json:"difficulty"`
	//QuestionId string `json:"id"`    //named id to be consistent with json naming in question-service 
}
