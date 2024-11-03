// defines the JSON format of questions.
package common

import "gorm.io/gorm"

type Question struct {
	Title      string   `json:"title"`
	TitleSlug  string   `json:"titleSlug"`
	Difficulty string   `json:"difficulty"`
	TopicTags  []string `json:"topicTags"`
	Content    string   `json:"content"`
	Schemas    []string `json:"schemas"`
	Id         int      `json:"id"`
}

type Record struct {
	QuestionId  uint           `json:"questionId"`
	RoomID      string         `json:"roomId"      gorm:"primaryKey"`
	UserID      string         `json:"userId"      gorm:"primaryKey"`
	OtherUser   string         `json:"otherUser"`
	TimeStarted string         `json:"timeStarted"`
	TimeEnded   string         `json:"timeEnded"`
	Attempt     string         `json:"attempt"`
	Deleted     gorm.DeletedAt // gorm.DeleteAt enables soft-deletes for record-keeping
}
