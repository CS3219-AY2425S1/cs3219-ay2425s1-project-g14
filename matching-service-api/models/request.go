package models

type Request struct {
	MatchHash string

	UserId string `json:"userId"` 

	TopicTags []string `json:"topicTags"`

	Difficulty string `json:"difficulty"`

	RequestTime string `json:"requestTime"`
}