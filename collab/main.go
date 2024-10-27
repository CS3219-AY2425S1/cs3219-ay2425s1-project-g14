package main

import (
	"encoding/json"
	"log"
	"net/http"
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

func verifyToken(token string) bool {
	client := &http.Client{}
	req, err := http.NewRequest("GET", "http://localhost:3001/auth/verify-token", nil)
	if err != nil {
		log.Println("Error creating request:", err)
		return false
	}

	req.Header.Set("Authorization", "Bearer " + token)

	resp, err := client.Do(req)
	if err != nil {
		log.Println("Error making request:", err)
		return false
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Println("Token verification failed with status:", resp.Status)
		return false
	}

	return true;
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
func serveWs(hub *Hub, c *gin.Context) {
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

	go handleMessages(client, hub)
}

func handleMessages(client *Client, hub *Hub) {
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
			if !ok {
				log.Printf("Auth message missing token")
				continue
			}
			if verifyToken(token) { // Implement this function to verify the token
				client.authenticated = true
				log.Println("Client authenticated successfully")
			} else {
				log.Println("Invalid auth token")
				client.conn.WriteMessage(websocket.TextMessage, []byte("Authentication failed"))
				client.conn.Close()
				break
			}
			continue
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

	// WebSocket connection endpoint
	r.GET("/ws", func(c *gin.Context) {
		serveWs(hub, c)
	})

	// Status endpoint
	r.GET("/status", statusHandler(hub))

	r.Run(":4000")
}
