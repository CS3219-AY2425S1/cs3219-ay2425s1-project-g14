const express = require("express");
const http = require("http");
const app = express();

const server = http.createServer(app);
const io = require("socket.io")(server, {
  path: '/comms',
  cors: {
    // temporarily use * to allow all origins
    origin: `*`,
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  // emit endCall to the room it was in.
  socket.on("disconnecting", () => {
    socket.to(Array.from(socket.rooms))
      .except(socket.id)
      .emit("endCall");
  });

  // join a room and inform the peer that the other person has joined
  socket.on("joinRoom", (data) => {
    console.log(socket.id + " is joining " + data.target);
    socket.join(data.target);
    socket.to(data.target).emit("peerConnected");
  });

  // propagate the socket events for starting and handshaking a call forward.
  socket.on("startCall", (data) => {
    console.log(socket.id + " is starting call in "+ data.target);
    socket.to(data.target).emit("startCall", {
      signal: data.signalData
    });
  });

  socket.on("handshakeCall", (data) => {
    console.log("handshaking call in " + data.target);
    socket.to(data.target).emit("handshakeCall", {
      signal: data.signal
    });
  });
});

server.listen(4001, () => console.log("comms server is running on port 4001"));
