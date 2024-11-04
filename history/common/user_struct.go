package common

type User struct {
	ID       string `json:"id"       gorm:"primaryKey"`
	Username string `json:"username"`
	Email    string `json:"email"`
	IsAdmin  bool   `json:"isAdmin"`
}

type TokenResponse struct {
	Message string `json:"message"`
	Data    User   `json:"data"`
}
