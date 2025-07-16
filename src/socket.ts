import { Socket, Server } from "socket.io";
import { Server as HttpServer } from "http";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  TUser,
  WebGameEvents,
} from "./types";
import { addUser, getUsers, hasRoomAdmin, removeUser } from "./redis";
import { generateRoomCode } from "./utils";

export function initSocket(server: HttpServer) {
  // Socket.IO setup with proper CORS configuration
  const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, {}>(
    server,
    {
      cors: {
        origin: "*", // TODO replace from env
        methods: ["GET", "POST"],
      },
    }
  );

  io.on(
    WebGameEvents.Connection,
    (socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, {}>) => {
      console.log("New client connected:", socket.id);

      socket.on(WebGameEvents.JoinRoom, async (params) => {
        const { userName, roomCode } = params;

        const hasAdmin = await hasRoomAdmin(roomCode);

        console.log(hasAdmin);

        const newUser: TUser = {
          id: socket.id,
          name: userName,
          isAdmin: !hasAdmin,
        };

        socket.join(roomCode);

        addUser(roomCode, newUser);

        const users = await getUsers(roomCode);

        io.to(socket.id).emit(WebGameEvents.MyUserJoined, newUser);

        // Notify room about new user
        io.to(roomCode).emit(WebGameEvents.UserJoined, {
          users: users,
          roomCode: roomCode,
        });

        console.log(`${userName} joined to room ${roomCode}`);
      });

      socket.on(WebGameEvents.CreateRoom, async (userName) => {
        const newUser: TUser = {
          id: socket.id,
          name: userName,
          isAdmin: true,
        };

        const newRoomCode = generateRoomCode();

        socket.join(newRoomCode);

        addUser(newRoomCode, newUser);

        const users = await getUsers(newRoomCode);

        io.to(socket.id).emit(WebGameEvents.MyUserJoined, newUser);

        // Notify room about new user
        io.to(newRoomCode).emit(WebGameEvents.UserJoined, {
          users: users,
          roomCode: newRoomCode,
        });

        console.log(`${userName} created room ${newRoomCode} and join`);
      });

      socket.on(WebGameEvents.LeaveRoom, async (params) => {
        const { roomCode, userId } = params;

        removeUser(roomCode, userId);

        const users = await getUsers(roomCode);

        // Notify room about user leaving
        io.to(roomCode).emit(WebGameEvents.UserLeft, {
          users: users,
          roomCode: roomCode,
        });

        socket.leave(roomCode);

        console.log(`${userId} left room ${roomCode}`);
      });

      socket.on(WebGameEvents.SendPoo, (userId) => {
        console.log("poo send to", userId);
        io.to(userId).emit(WebGameEvents.RecivePoo);
      });

      socket.on(WebGameEvents.SendMessage, (params) => {
        io.to(params.roomCode).emit(
          WebGameEvents.ReciveMessage,
          params.message
        );
      });

      socket.on(WebGameEvents.Disconnect, () => {
        console.log("Client disconnected:", socket.id);
      });
    }
  );
}
