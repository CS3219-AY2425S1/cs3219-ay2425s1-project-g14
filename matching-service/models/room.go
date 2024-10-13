package models

type Room struct {
	RoomId     string
	User1      string
	User2      string
	TopicTags  []string
	Difficulty string
	RequestTime string  //takes user1's requestTime since this is older
}
