package models

type Requests struct {
	UserId string `json:"userId"`
	TopicTags []string `json:"topicTags"`
	Difficulty string `json:"difficulty"`
	RequestTime string `json:"requestTime"`
}
