package models

type IncomingRequests struct {
	MatchHash   string	 `json:"matchHash"`
	UserId      string   `json:"userId"`
	TopicTags   []string `json:"topicTags"`
	Difficulty  string   `json:"difficulty"`
	RequestTime string   `json:"requestTime"`
}

type OutGoingRequests struct {
	TopicTags   []string `json:"topicTags"`
	Difficulty  string   `json:"difficulty"`
}