package main

import (
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

// Client represents a WebSocket client
type Client struct {
	conn   *websocket.Conn
	secret string
}

// Hub maintains the set of active clients, broadcasts messages, and stores the current color per secret
type Hub struct {
	clients    map[*Client]bool
	colors     map[string]string // Store current color per secret
	broadcast  chan Message
	register   chan *Client
	unregister chan *Client
	mutex      sync.Mutex
}

// Message represents a message with the associated secret
type Message struct {
	secret  string
	content []byte
}

// NewHub creates a new hub instance
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		colors:     make(map[string]string),
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
			// Update the current color for this secret
			h.colors[message.secret] = string(message.content)
			for client := range h.clients {
				if client.secret == message.secret {
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
	secret := c.Query("secret")
	if secret == "" {
		http.Error(c.Writer, "Secret required", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("Failed to upgrade:", err)
		return
	}

	client := &Client{conn: conn, secret: secret}
	hub.register <- client

	go handleMessages(client, hub)
}

// HandleMessages listens for color messages from the client
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

		// Broadcast the message to other clients
		hub.broadcast <- Message{secret: client.secret, content: message}
	}
}

// Status endpoint that shows the number of clients and the current color for each secret
func statusHandler(hub *Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		hub.mutex.Lock()
		defer hub.mutex.Unlock()

		status := make(map[string]interface{})
		for client := range hub.clients {
			secret := client.secret
			currentStatus, ok := status[secret]
			if !ok {
				// Initialize status for a new secret
				status[secret] = map[string]interface{}{
					"clients": 1,
					"color":   hub.colors[secret],
				}
			} else {
				// Update the client count for an existing secret
				status[secret] = map[string]interface{}{
					"clients": currentStatus.(map[string]interface{})["clients"].(int) + 1,
					"color":   hub.colors[secret],
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
