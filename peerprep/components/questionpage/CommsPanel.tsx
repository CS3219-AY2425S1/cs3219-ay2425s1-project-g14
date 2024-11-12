import React, { useEffect, useRef, useState } from "react";
import Peer, { Instance } from "simple-peer";
import io from "socket.io-client";

interface Props {
  className?: string;
  roomId?: string;
}

const socket = io(`/`, {
  path: '/comms'
});

function CommsPanel({ className, roomId }: Props) {
  const [stream, setStream] = useState<MediaStream>();

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Instance>();

  useEffect(() => {
    socket.removeAllListeners();
    socket.open();
    return () => {
      console.log("socket cleanup called");
      if (socket) {
        console.log("destroying socket");
        socket.close();
      }
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    // capture the stream within the cleanup function itself.
    let videoElement: MediaStream | undefined;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((newStream) => {
        console.log("new stream's status is " + newStream.active);
        newStream.getTracks().forEach((track: MediaStreamTrack) => {
          console.log(
            "media track status (ready/enabled): " +
              track.readyState +
              "/" +
              track.enabled,
          );
        });
        if (myVideo.current) {
          console.log("can set myVideo.current");
          myVideo.current.srcObject = newStream;
        }
        setStream(newStream);
        videoElement = newStream;
      })
      .catch((err) => console.log("failed to get stream", err));

    return () => {
      console.log("cleaning up media");
      if (videoElement) {
        console.log("destroying stream");
        videoElement.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!roomId || !stream || !socket.connected) {
      console.log("stream status: " + stream);
      console.log("connection status: " + socket.connected);
      return;
    }
    console.log("in hook");

    // clear all listeners if we are reinitializing this.
    socket.removeAllListeners();
    console.log("removed all listeners");

    // when we receive the first peer connection, we immediately send out
    // a peer connection request.
    attachSocketInitiator(stream, roomId, userVideo, connectionRef);

    // as the receiver, I will propagate my data outwards now.
    attachSocketReceiver(stream, roomId, userVideo, connectionRef);

    socket.on("endCall", () => {
      // immediately destroy the socket listeners
      destroyCallListeners(roomId);
      if (userVideo.current) {
        (userVideo.current.srcObject as MediaStream)
          .getTracks()
          .forEach((tracks: MediaStreamTrack) => {
            tracks.stop();
          });
        userVideo.current.srcObject = null;
      }
      if (connectionRef.current && !connectionRef.current.destroyed) {
        connectionRef.current.destroy();
      }
      // reattach the sockets
      attachSocketInitiator(stream, roomId, userVideo, connectionRef);
      attachSocketReceiver(stream, roomId, userVideo, connectionRef);
      // rejoin the room
      socket.emit("joinRoom", {
        target: roomId,
      });
    });

    socket.emit("joinRoom", {
      target: roomId,
    });
    console.log("applied all hooks");
  }, [stream, socket.connected]);

  return (
    <div className={className}>
      <div className="video">
        <video
          playsInline
          muted
          ref={myVideo}
          autoPlay
          style={{ width: "200px" }}
        />
      </div>
      <div className="video">
        <video
          playsInline
          ref={userVideo}
          autoPlay
          style={{ width: "200px" }}
        />
      </div>
    </div>
  );
}

function destroyCallListeners(roomId: string) {
  socket.removeAllListeners("startCall");
  socket.removeAllListeners("peerConnected");
  socket.removeAllListeners("handshakeCall");
}

function attachSocketReceiver(
  stream: MediaStream,
  roomId: string,
  userVideo: React.RefObject<HTMLVideoElement>,
  connectionRef: React.MutableRefObject<Peer.Instance | undefined>,
) {
  socket.on("startCall", (data) => {
    console.log("received start call signal");
    const peerReceive = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peerReceive.on("signal", (data) => {
      console.log("sending handshake");
      socket.emit("handshakeCall", { signal: data, target: roomId });
    });

    peerReceive.on("stream", (stream) => {
      console.log("setting stream of first user");
      if (userVideo.current) {
        console.log("user video exists");
        userVideo.current.srcObject = stream;
      }
    });

    connectionRef.current = peerReceive;
    console.log("signalling receiver");
    peerReceive.signal(data.signal);
  });
}

function attachSocketInitiator(
  stream: MediaStream,
  roomId: string,
  userVideo: React.RefObject<HTMLVideoElement>,
  connectionRef: React.MutableRefObject<Peer.Instance | undefined>,
) {
  socket.on("peerConnected", () => {
    console.log("peer connected, starting call");
    const peerInit = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peerInit.on("signal", (data) => {
      console.log("signal to start call received");
      socket.emit("startCall", { signalData: data, target: roomId });
    });

    peerInit.on("stream", (stream) => {
      if (userVideo.current) {
        console.log("setting stream for handshake");
        userVideo.current.srcObject = stream;
      }
    });

    connectionRef.current = peerInit;

    socket.on("handshakeCall", (data) => {
      console.log("received handshake");
      peerInit.signal(data.signal);
    });
  });
}

export default CommsPanel;
