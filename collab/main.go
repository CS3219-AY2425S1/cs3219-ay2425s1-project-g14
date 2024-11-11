package main

import (
	"collab/verify"
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// types
const (
	AUTH           = "auth"
	AUTH_SUCCESS   = "auth_success"
	AUTH_FAIL      = "auth_fail"
	CLOSE_SESSION  = "close_session"
	CONTENT_CHANGE = "content_change"
	PING = "ping"
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
	Type      string `json:"type"`
	RoomID    string `json:"roomId"`
	Content   string `json:"data"`
	UserID    string `json:"userId"`
	Token     string `json:"token"`
	MatchHash string `json:"matchHash"`
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
			h.workspaces[message.RoomID] = message.Content
			for client := range h.clients {
				if client.roomID == message.RoomID {

					log.Println("Original message: ", message)

					msgJson, _ := json.Marshal(message)

					log.Printf("Sending message to client: %s", msgJson)

					err := client.conn.WriteMessage(websocket.TextMessage,
						msgJson,
					)
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

		log.Printf("Raw message received: %s", string(message))

		var msgData Message
		if err := json.Unmarshal(message, &msgData); err != nil {
			log.Printf("Failed to parse message: %v", err)
			continue
		}

		log.Printf("Raw message parsed: %s", msgData)

		if msgData.Type == AUTH {
			token := msgData.Token
			if token == "" {
				log.Println("Authentication failed - no token attached")

				msg := Message{
					Type:    AUTH_FAIL,
					RoomID:  client.roomID,
					Content: "Authentication failed - no token attached",
				}
				msgJson, _ := json.Marshal(msg)
				client.conn.WriteMessage(websocket.TextMessage, msgJson)
				client.conn.Close()
				break
			}
			isSuccess := false
			match := msgData.MatchHash
			if match != "" &&
				!authenticateClient(token, match, client, roomMappings, persistMappings) {
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
				msg := Message{
					Type:    AUTH_FAIL,
					RoomID:  client.roomID,
					Content: "Authentication failed",
				}
				msgJson, _ := json.Marshal(msg)
				client.conn.WriteMessage(websocket.TextMessage, msgJson)

				client.conn.Close()
				break
			}
			client.authenticated = true

			serverContent := hub.workspaces[client.roomID]

			newMsg := Message{
				Type:    AUTH_SUCCESS,
				RoomID:  client.roomID,
				Content: serverContent,
			}
			msgJson, _ := json.Marshal(newMsg)
			client.conn.WriteMessage(websocket.TextMessage, msgJson)

			log.Println("Client authenticated successfully")
		}

		// old logic before type changes
		// if msgData["type"] == "ping" {
		// 	//receives ping from client1, need to send a ping to client2
		// 	//eventually, if present, client2 will send the ping back, which will be broadcasted back to client1.
			
		// 	userID, _ := msgData["userId"].(string)
		// 	request := Message {
		// 		RoomID: client.roomID,
		// 		UserID: userID,
		// 		Content: []byte("ping request"),
		// 	}
			
		// 	hub.broadcast <- request
		// }

		if msgData.Type == CLOSE_SESSION {
			closeMessage := Message{
				RoomID:  client.roomID,
				Content: "The session has been closed by a user.",
			}
			targetId := msgData.UserID
			data, err := persistMappings.Conn.HGetAll(context.Background(), targetId).Result()
			if err != nil {
				log.Printf("Error retrieving data for userID %s: %v", targetId, err)
			} else {
				_, err1 := persistMappings.Conn.Del(context.Background(), targetId).Result()
				if err1 != nil {
					log.Printf("Error deleting data for userID %s: %v", targetId, err1)
				}
				_, err2 := persistMappings.Conn.Del(context.Background(), data["otherUser"]).Result()
				if err2 != nil {
					log.Printf("Error deleting data for other user %s: %v", data["otherUser"], err2)
				}
			}
			hub.broadcast <- closeMessage
		} else if msgData.Type == CONTENT_CHANGE {
			// Broadcast the message to other clients
			hub.broadcast <- Message{
				RoomID:  client.roomID,
				Content: msgData.Content,
				Type:    msgData.Type,
				UserID:  msgData.UserID,
			}
		} else if msgData.Type == PING {
			// Broadcast the message to other clients
			hub.broadcast <- Message{
				RoomID:  client.roomID,
				Type:    msgData.Type,
				UserID:  msgData.UserID,
			}

			extendExpiryTime(msgData.UserID, persistMappings)
		} else {
			log.Printf("Unknown message type: %s", msgData.Type)
	}
	}
}

func extendExpiryTime(userId string, persistMappings *verify.PersistMappings) {
		
	ctx := context.Background()
	if err := persistMappings.Conn.Expire(ctx, userId, time.Minute * 10).Err(); err != nil {
		log.Println("Error extending room time on ping: ", err.Error())
	} else {
		
		log.Printf("expiration reset for 10 minutes for user %s: ", userId)
	}
	
	
}

type ClientWorkspace struct {
	Clients   int    `json:"clients"`
	Workspace string `json:"workspace"`
}

// Status endpoint that shows the number of clients and the current color for each roomID
func statusHandler(hub *Hub) gin.HandlerFunc {

	return func(c *gin.Context) {
		hub.mutex.Lock()
		defer hub.mutex.Unlock()

		status := make(map[string]ClientWorkspace)
		for client := range hub.clients {
			roomID := client.roomID
			currentStatus, ok := status[roomID]
			if !ok {
				// Initialize status for a new roomID
				status[roomID] = ClientWorkspace{
					Clients:   1,
					Workspace: hub.workspaces[roomID],
				}
			} else {
				// Update the client count for an existing roomID
				status[roomID] = ClientWorkspace{
					Clients:   currentStatus.Clients + 1,
					Workspace: hub.workspaces[roomID],
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
