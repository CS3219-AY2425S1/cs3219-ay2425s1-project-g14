// this is used to initialise the database connection
package database

import (
	"context"
	"log"
	"os"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func InitialiseDB() (*mongo.Client, error) {
	// Load environment variables
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatal("Error loading environment variables: " + err.Error())
	}

	mongoURI := os.Getenv("MONGODB_URI")

	if mongoURI == "" {
		log.Fatal("MONGODB_URI not set in environment variables")
	}

	clientOptions := options.Client().ApplyURI(mongoURI)

	// Connect to MongoDB
	server, err := mongo.Connect(context.Background(), clientOptions)

	if err != nil {
		log.Fatal("Error connecting to MongoDB" + err.Error())
	}

	// Check the connection
	err = server.Ping(context.Background(), nil)

	if err != nil {
		return nil, err
	}

	return server, nil
}
