import { Socket, Server } from "socket.io";
import { Server as HttpServer } from "http";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  TJoinRoomParams,
  TLeaveRoomParams,
  TUser,
  WebGameEvents,
} from "./types";

const rooms = new Map<string, TUser[]>();

export function initSocket(server: HttpServer) {
  // Socket.IO setup with proper CORS configuration
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on(
    WebGameEvents.Connection,
    (socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, {}>) => {
      console.log("New client connected:", socket.id);

      socket.on(WebGameEvents.JoinRoom, (params) => {
        const { user, room } = params;

        socket.join(room.code);

        // Initialize room if it doesn't exist
        if (!rooms.has(room.code)) {
          rooms.set(room.code, []);
        }

        const targetRoom = rooms.get(room.code);

        if (targetRoom === undefined) return;

        // Add user to room
        targetRoom.push({ id: user.id, name: user.name });

        // Notify room about new user
        io.to(room.code).emit(WebGameEvents.UserJoined, {
          users: targetRoom,
          roomId: room.code,
        });

        console.log(`${user.name} joined room ${room}`);
      });

      socket.on(WebGameEvents.LeaveRoom, (params) => {
        const { room, user } = params;

        console.log(room, user);

        const targetRoom = rooms.get(room.code);

        if (targetRoom === undefined) return;

        rooms.set(
          room.code,
          targetRoom.filter((item) => item.id !== user.id)
        );

        const users = rooms.get(room.code);

        // Notify room about user leaving
        io.to(room.code).emit(WebGameEvents.UserLeft, {
          users: users ?? [],
          roomId: room.code,
        });

        // Clean up empty rooms
        if (rooms.get(room.code)?.length === 0) {
          rooms.delete(room.code);
        }

        socket.leave(room.code);

        console.log(`${user.name} left room ${room}`);
      });

      socket.on(WebGameEvents.Disconnect, () => {
        console.log("Client disconnected:", socket.id);
      });
    }
  );
}
