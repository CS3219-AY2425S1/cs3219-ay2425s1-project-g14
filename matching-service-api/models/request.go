package models

type Request struct {
	UserId string `json:"userId"` 

	TopicTags []string `json:"topicTags"`

	Difficulty string `json:"difficulty"`
}