// defines the JSON format of quesitons.
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
