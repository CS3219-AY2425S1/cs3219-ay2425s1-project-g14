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
    // for each room in the disconnecting socket...
    socket.rooms.forEach((target) => {
      // ignoring the room matching its own id...
      if (target === socket.id) {
        return;
      }
      // get the user ids within the room...
      io.sockets.adapter.rooms
          .get(target)
          .forEach(
            (id) => {
              // and for each user id in the room not matching
              // its own id...
              if (id === socket.id) {
                return;
              }
              // leave the target room...
              io.sockets.sockets.get(id).leave(target);
              console.log(id + " leaves " + target);
              // then tell the user id to endCall.
              io.to(id).emit("endCall");
            }
          );
    });
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
