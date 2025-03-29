// defines the JSON format of questions.
package common

type Question struct {
	Title      string   `json:"title"`
	TitleSlug  string   `json:"titleSlug"`
	Difficulty string   `json:"difficulty"`
	TopicTags  []string `json:"topicTags"`
	Content    string   `json:"content"`
	Schemas    []string `json:"schemas"`
	Id         int      `json:"id"`
}

type FrontendQuestion struct {
	Title      string   `json:"title"`
	Difficulty string   `json:"difficulty"`
	TopicTags  []string `json:"topicTags"`
	Content    string   `json:"content"`
}

type MatchingQuestion struct {
	TopicTags []string `json:"topicTags"`
	Difficulty string `json:"difficulty"`
}