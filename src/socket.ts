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
  patchRoom,
  updateMemeInRoom,
} from "./redis";
import { generatateId, shuffleAndAssignMemeRecipients } from "./utils";
import dotenv from "dotenv";
dotenv.config();

function getCorsOrigin() {
  if (process.env.NODE_ENV === "development") {
    return "*";
  }

  if (process.env.HOST && process.env.PORT) {
    return `https://${process.env.HOST}:${process.env.PORT}`;
  }

  return "*";
}

export function initSocket(server: HttpServer) {
  // Socket.IO setup with proper CORS configuration
  const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, {}>(
    server,
    {
      cors: {
        origin: "*",
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

        const newRoomCode = generatateId();

        const newRoom: TRoom = {
          roomCode: newRoomCode,
          memes: [],
          state: WebGameStates.WaitStart,
          users: [],
        };

        await addRoom(newRoom);

        await addUserToRoom(newRoomCode, newUser);

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

      socket.on(WebGameEvents.ChnageGameState, async ({ roomCode, state }) => {
        console.log(roomCode, "start game");

        await patchRoom(roomCode, {
          state,
        });

        if (state === WebGameStates.CreatingImage) {
          const room = await getRoom(roomCode);

          if (!room) return;

          const newMemes = shuffleAndAssignMemeRecipients(room.memes);

          await patchRoom(roomCode, {
            memes: newMemes,
          });
        }

        const shufledRoom = await getRoom(roomCode);

        if (!shufledRoom) return;

        io.to(roomCode).emit(WebGameEvents.GameStateChanged, shufledRoom);
      });

      socket.on(WebGameEvents.CreateImage, async ({ meme, roomCode }) => {
        console.log("create image", meme, roomCode);

        await updateMemeInRoom(roomCode, meme);

        const room = await getRoom(roomCode);

        console.log(room);

        if (!room) return;

        io.to(roomCode).emit(WebGameEvents.ImageCreated, room);
      });

      socket.on(WebGameEvents.CreateMeme, async ({ meme, roomCode }) => {
        console.log("Meme created", meme, roomCode);

        await updateMemeInRoom(roomCode, meme);

        const room = await getRoom(roomCode);

        console.log(room);

        if (!room) return;

        io.to(roomCode).emit(WebGameEvents.MemeCreated, room);
      });

      socket.on(WebGameEvents.Disconnect, async () => {
        console.log("Client disconnected:", socket.id);
      });
    }
  );
}
