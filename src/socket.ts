import { Socket, Server } from "socket.io";
import { Server as HttpServer } from "http";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  TRoom,
  TUser,
  WebGameEvents,
  WebGameStates,
} from "./types";
import {
  addRoom,
  addUserToRoom,
  deleteUserFromRoom,
  getRoom,
  hasRoomAdmin,
} from "./redis";
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

        const newUser: TUser = {
          id: socket.id,
          name: userName,
          isAdmin: !hasAdmin,
        };

        await addUserToRoom(roomCode, newUser);

        const room = await getRoom(roomCode);

        if (!room) return;

        socket.join(roomCode);

        io.to(socket.id).emit(WebGameEvents.MyUserJoined, newUser);

        // Notify room about new user
        io.to(roomCode).emit(WebGameEvents.UserJoined, room);

        console.log(`${userName} joined to room ${roomCode}`);
      });

      socket.on(WebGameEvents.CreateRoom, async (userName) => {
        const newUser: TUser = {
          id: socket.id,
          name: userName,
          isAdmin: true,
        };

        const newRoomCode = generateRoomCode();

        const newRoom: TRoom = {
          roomCode: newRoomCode,
          memes: [],
          state: WebGameStates.WaitStart,
          users: [newUser],
        };

        await addRoom(newRoom);

        const room = await getRoom(newRoomCode);

        if (!room) return;

        socket.join(newRoomCode);

        io.to(socket.id).emit(WebGameEvents.MyUserJoined, newUser);

        // Notify room about new user
        io.to(newRoomCode).emit(WebGameEvents.UserJoined, room);

        console.log(`${userName} created room ${newRoomCode} and join`);
      });

      socket.on(WebGameEvents.LeaveRoom, async (params) => {
        const { roomCode, userId } = params;

        await deleteUserFromRoom(roomCode, userId);

        const room = await getRoom(roomCode);

        if (!room) return;

        // Notify room about user leaving
        io.to(roomCode).emit(WebGameEvents.UserLeft, room);

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

      socket.on(WebGameEvents.StartGame, (roomCode) => {});

      socket.on(WebGameEvents.Disconnect, async () => {
        console.log("Client disconnected:", socket.id);
      });
    }
  );
}
