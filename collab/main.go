package main

import (
	verify "collab/verify"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
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
	conn          *websocket.Conn
	roomID        string
	authenticated bool
}

type Hub struct {
	clients    map[*Client]bool
	workspaces map[string]string
	broadcast  chan Message
	register   chan *Client
	unregister chan *Client
	mutex      sync.Mutex
}

type Message struct {
	Type    string `json:"type"`
	RoomID  string `json:"roomId"`
	Content []byte `json:"data"`
	UserID  string `json:"userId"`
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
		workspaces: make(map[string]string),
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
			// Update the current workspace for this RoomID
			h.workspaces[message.RoomID] = string(message.Content)
			for client := range h.clients {
				if client.roomID == message.RoomID {
					err := client.conn.WriteMessage(websocket.TextMessage, message.Content)
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
func serveWs(
	hub *Hub, c *gin.Context,
	roomMappings *verify.RoomMappings,
	persistMappings *verify.PersistMappings,
) {
	log.Println("handler called!")
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

	go handleMessages(client, hub, roomMappings, persistMappings)
}

func authenticateClient(
	token string, match string, client *Client,
	roomMappings *verify.RoomMappings,
	persistMappings *verify.PersistMappings,
) bool {
	ok, userID := verifyToken(token)
	if !ok {
		log.Println("bad token in request")
		return false
	}
	return verify.VerifyRoomAndMoveToPersist(
		roomMappings, client.roomID, userID, match, persistMappings)
}

func authenticateClientNoMatch(
	token string, client *Client,
	persistMappings *verify.PersistMappings,
) bool {
	ok, userID := verifyToken(token)
	if !ok {
		log.Println("bad token in request")
		return false
	}
	return verify.VerifyPersist(persistMappings, client.roomID, userID)
}

func handleMessages(
	client *Client, hub *Hub,
	roomMappings *verify.RoomMappings,
	persistMappings *verify.PersistMappings,
) {
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


		if msgData["type"] == "auth" {
			token, tokenOk := msgData["token"].(string)
			if !tokenOk {
				log.Println("Authentication failed - no token attached")
				client.conn.WriteMessage(
					websocket.TextMessage,
					[]byte("Authentication failed - no JWT token"),
				)
				client.conn.Close()
				break
			}
			isSuccess := false
			match, matchOk := msgData["matchHash"].(string)
			if matchOk && !authenticateClient(token, match, client, roomMappings, persistMappings) {
				log.Println(
					"failed to find a matching room from match hash, proceeding with persistence check",
				)
			}
			// I will ping the persistent map even if I've found it in the original map
			if !authenticateClientNoMatch(token, client, persistMappings) {
				log.Println("failed to find a persistent room")
				isSuccess = false
			} else {
				isSuccess = true
			}
			if !isSuccess {
				client.conn.WriteMessage(
					websocket.TextMessage,
					[]byte("Authentication failed - failed to find a matching room"),
				)
				client.conn.Close()
				break
			}
			client.authenticated = true
			log.Println("Client authenticated successfully")
		}

		if msgData["type"] == "close_session" {
			closeMessage := Message{
				RoomID:  client.roomID,
				Content: []byte("The session has been closed by a user."),
			}
			hub.broadcast <- closeMessage
		}

		// Broadcast the message to other clients
		userID, _ := msgData["userId"].(string)
		hub.broadcast <- Message{RoomID: client.roomID, Content: message, UserID: userID}
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
					"clients":   1,
					"workspace": hub.workspaces[roomID],
				}
			} else {
				// Update the client count for an existing roomID
				status[roomID] = map[string]interface{}{
					"clients":   currentStatus.(map[string]interface{})["clients"].(int) + 1,
					"workspace": hub.workspaces[roomID],
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

	REDIS_URI := os.Getenv("REDIS_URI")
	if REDIS_URI == "" {
		REDIS_URI = "localhost:9190"
	}

	REDIS_ROOM_MAPPING := 1
	REDIS_ROOM_PERSIST := 2

	if os.Getenv("REDIS_ROOM_MAPPING") != "" {
		num, err := strconv.Atoi(os.Getenv("REDIS_ROOM_MAPPING"))
		if err != nil {
			log.Fatal("DB no of room map is badly formatted" + err.Error())
		} else {
			REDIS_ROOM_MAPPING = num
		}
	}

	if os.Getenv("REDIS_ROOM_PERSIST") != "" {
		num, err := strconv.Atoi(os.Getenv("REDIS_ROOM_PERSIST"))
		if err != nil {
			log.Fatal("DB no of room persistance store is badly formatted" + err.Error())
		} else {
			REDIS_ROOM_PERSIST = num
		}
	}

	roomMappings := verify.InitialiseRoomMappings(REDIS_URI, REDIS_ROOM_MAPPING)
	persistMappings := verify.InitialisePersistMappings(REDIS_URI, REDIS_ROOM_PERSIST)

	// WebSocket connection endpoint
	r.GET("/ws", func(c *gin.Context) {
		serveWs(hub, c, roomMappings, persistMappings)
	})

	// Status endpoint
	r.GET("/status", statusHandler(hub))

	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = ":4000"
	}
	r.Run(PORT)
}
