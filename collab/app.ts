const express = require("express");
import { createServer } from "http";
import { Server } from "socket.io";

require("dotenv").config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

// Handle socket connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room
  socket.on("joinRoom", (room: string) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
    io.to(room).emit("message", `User ${socket.id} joined the room`);
  });

  // Leave a room
  socket.on("leaveRoom", (room: string) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room ${room}`);
    io.to(room).emit("message", `User ${socket.id} left the room`);
  });

  // Send a message to the room
  socket.on("sendMessage", (data: { room: string; message: string }) => {
    const { room, message } = data;
    console.log(`Message from ${socket.id} to room ${room}: ${message}`);
    io.to(room).emit("message", message); // Broadcast message to everyone in the room
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
