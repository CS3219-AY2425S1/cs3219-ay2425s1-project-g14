package models
type Room struct {
	
	RoomId     string	`json:"roomId"`
	User1      string	`json:"user1"`  //requesting user
	User2      string	`json:"user2"`   //other user
	RequestTime string	`json:"requestTime"` //takes user1's requestTime since this is older
	
	//contains question Data
	Title      string   `json:"title"`
	TitleSlug  string   `json:"titleSlug"`
	Difficulty string   `json:"difficulty"`
	TopicTags  []string `json:"topicTags"`
	Content    string   `json:"content"`
	Schemas    []string `json:"schemas"`
	QuestionId         int      `json:"questionId"`

}
