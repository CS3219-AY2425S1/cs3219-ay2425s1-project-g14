package mappings

type Mappings struct {
	Storage map[string][]int
}

func CreateMappings() *Mappings {
	return &Mappings{
		Storage: make(map[string][]int),
	}
}