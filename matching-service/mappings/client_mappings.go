package mappings

import "matching-service/models"

type Mappings struct {
	Storage map[string][]int
}

func CreateMappings() *Mappings {
	return &Mappings{
		Storage: make(map[string][]int),
	}
}

//TODO: implement logic to find matching questions and then respond to backend server
func (db *Mappings) HandleRequest(models.Requests) {

}