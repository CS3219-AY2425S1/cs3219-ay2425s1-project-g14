package main

import (
	verify "collab/verify"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Client struct {
	conn   *websocket.Conn
	roomID string
	authenticated bool
}

type Hub struct {
	clients    map[*Client]bool
	workspaces     map[string]string
	broadcast  chan Message
	register   chan *Client
	unregister chan *Client
	mutex      sync.Mutex
}

type Message struct {
	roomID  string
	content []byte
}

func verifyToken(token string) (bool, string) {
	client := &http.Client{}
	USER_SERVICE_URI := os.Getenv("USER_SERVICE_URI")
	if USER_SERVICE_URI == "" {
		USER_SERVICE_URI = "http://localhost:3001"
	}
	req, err := http.NewRequest("GET", USER_SERVICE_URI+"/auth/verify-token", nil)
	if err != nil {
		log.Println("Error creating request:", err)
		return false, ""
	}

	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := client.Do(req)
	if err != nil {
		log.Println("Error making request:", err)
		return false, ""
	}
	defer resp.Body.Close()

	var response struct {
		Message string `json:"message"`
		Data    struct {
			ID       string `json:"id"`
			Username string `json:"username"`
			Email    string `json:"email"`
			IsAdmin  bool   `json:"isAdmin"`
		} `json:"data"`
	}

    body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error reading response body:", err)
		return false, ""
	}

	// Unmarshal the response body into the struct
	if err := json.Unmarshal(body, &response); err != nil {
		log.Println("Error unmarshaling response:", err)
		return false, ""
	}

	// Check if the token was verified successfully
	if resp.StatusCode != http.StatusOK {
		log.Println("Token verification failed with status:", resp.Status)
		return false, ""
	}

	// Return true and the ID from the response
	return true, response.Data.ID
}

// NewHub creates a new hub instance
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		workspaces:     make(map[string]string),
		broadcast:  make(chan Message),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// Run starts the hub's main loop
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			h.clients[client] = true
			h.mutex.Unlock()

		case client := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				client.conn.Close()
			}
			h.mutex.Unlock()

		case message := <-h.broadcast:
			h.mutex.Lock()
			// Update the current workspace for this roomID
			h.workspaces[message.roomID] = string(message.content)
			for client := range h.clients {
				if client.roomID == message.roomID {
					err := client.conn.WriteMessage(websocket.TextMessage, message.content)
					if err != nil {
						log.Printf("Error sending message: %v", err)
						client.conn.Close()
						delete(h.clients, client)
					}
				}
			}
			h.mutex.Unlock()
		}
	}
}

// ServeWs handles WebSocket requests
func serveWs(hub *Hub, c *gin.Context, roomMappings *verify.RoomMappings) {
	roomID := c.Query("roomID")
	if roomID == "" {
		http.Error(c.Writer, "roomID required", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("Failed to upgrade:", err)
		return
	}

	client := &Client{conn: conn, roomID: roomID}
	hub.register <- client

	go handleMessages(client, hub, roomMappings)
}

func authenticateClient(token string, client *Client, roomMappings *verify.RoomMappings) bool {
	ok, userID := verifyToken(token)
	if !ok {
		log.Println("bruh")
		return false
	}
	return verify.VerifyRoom(roomMappings, client.roomID, userID)
}

func handleMessages(client *Client, hub *Hub, roomMappings *verify.RoomMappings) {
	defer func() {
		hub.unregister <- client
	}()

	for {
		_, message, err := client.conn.ReadMessage()
		if err != nil {
			log.Printf("WebSocket error: %v", err)
			break
		}

		var msgData map[string]interface{}
		if err := json.Unmarshal(message, &msgData); err != nil {
			log.Printf("Failed to parse message: %v", err)
			continue
		}
		// Handle authentication message
		if msgData["type"] == "auth" {
            token, ok := msgData["token"].(string)
            if !ok || !authenticateClient(token, client, roomMappings) {
                log.Println("Authentication failed")
                client.conn.WriteMessage(websocket.TextMessage, []byte("Authentication failed"))
                client.conn.Close()
                break
            }
            client.authenticated = true
            log.Println("Client authenticated successfully")
        }

		if msgData["type"] == "close_session" {
			closeMessage := Message{
				roomID:  client.roomID,
				content: []byte("The session has been closed by a user."),
			}
			hub.broadcast <- closeMessage
		}

		// Broadcast the message to other clients
		hub.broadcast <- Message{roomID: client.roomID, content: message}
	}
}

// Status endpoint that shows the number of clients and the current color for each roomID
func statusHandler(hub *Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		hub.mutex.Lock()
		defer hub.mutex.Unlock()

		status := make(map[string]interface{})
		for client := range hub.clients {
			roomID := client.roomID
			currentStatus, ok := status[roomID]
			if !ok {
				// Initialize status for a new roomID
				status[roomID] = map[string]interface{}{
					"clients": 1,
					"workspace":   hub.workspaces[roomID],
				}
			} else {
				// Update the client count for an existing roomID
				status[roomID] = map[string]interface{}{
					"clients": currentStatus.(map[string]interface{})["clients"].(int) + 1,
					"workspace":   hub.workspaces[roomID],
				}
			}
		}

		c.JSON(http.StatusOK, status)
	}
}


func main() {
	r := gin.Default()
	hub := NewHub()
	go hub.Run()

	ORIGIN := os.Getenv("CORS_ORIGIN")
	if ORIGIN == "" {
		ORIGIN = "http://localhost:3000"
	}
	gintransport.SetCors(r, ORIGIN)

	REDIS_URI := os.Getenv("REDIS_URI")
	if REDIS_URI == "" {
		REDIS_URI = "localhost:9190"
	}
	roomMappings := verify.InitialiseRoomMappings(REDIS_URI, 1)

	// WebSocket connection endpoint
	r.GET("/ws", func(c *gin.Context) {
		serveWs(hub, c, roomMappings)
	})

	// Status endpoint
	r.GET("/status", statusHandler(hub))

	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = ":4000"
	}
	r.Run(PORT)
}
