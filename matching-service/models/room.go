package models

type Room struct {
	// stores what key to ship the resulting blob to
	MatchHash1 string `json:"matchHash1"`
	MatchHash2 string `json:"matchHash2"`
	
	// user information
	RoomId     string	`json:"roomId"`
	User1      string	`json:"user1"`
	User2      string	`json:"user2"`
	RequestTime string	`json:"requestTime"` //takes user1's requestTime since this is older
	
	//contains question Data
	Title      string   `json:"title"`
	TitleSlug  string   `json:"titleSlug"`
	Difficulty string   `json:"difficulty"`
	TopicTags  []string `json:"topicTags"`
	Content    string   `json:"content"`
	Schemas    []string `json:"schemas"`
	QuestionId         int      `json:"id"`

}
