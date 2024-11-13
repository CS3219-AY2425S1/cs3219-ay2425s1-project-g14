package storage

import (
	redis "github.com/go-redis/redis/v8"
)

type RoomMappings struct {
	Conn *redis.Client
}

func InitialiseRoomMappings(addr string, db_num int) *RoomMappings {
	conn := redis.NewClient(&redis.Options{
			Addr:addr,
			DB: db_num,
		})

	return &RoomMappings{
		Conn: conn,
	}
}