import { createClient } from "redis";
import { TRoom, TUser } from "./types";
import dotenv from "dotenv";
dotenv.config();

const redis = createClient({
  socket: {
    host: process.env.HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
  },
});

// Add error handling
redis.on("error", (err) => console.error("Redis Client Error", err));

// Connect when the module loads
(async () => {
  try {
    await redis.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Redis connection error:", err);
  }
})();

export async function addUser(room: string, user: TUser): Promise<void> {
  await redis.hSet(`room:${room}:users`, user.id, JSON.stringify(user));

  await redis.sAdd("rooms:list", room);
}

export async function addRoom(room: TRoom): Promise<void> {
  try {
    // Using roomCode as the Redis key
    const roomKey = `room:${room.roomCode}`;

    // Store the room data in Redis
    await redis.set(roomKey, JSON.stringify(room));

    // Optionally, you might want to add the room code to a set of all rooms
    await redis.sAdd("rooms:list", room.roomCode);

    console.log(`Room ${room.roomCode} added successfully`);
  } catch (error) {
    console.error("Error adding room to Redis:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}

// Get room by room code
export async function getRoom(roomCode: string): Promise<TRoom | null> {
  try {
    const roomKey = `room:${roomCode}`;
    const roomData = await redis.get(roomKey);

    if (!roomData) return null;

    return JSON.parse(roomData) as TRoom;
  } catch (error) {
    console.error("Error getting room:", error);
    throw new Error("Failed to get room");
  }
}

// Check if room exists
export async function roomExists(roomCode: string): Promise<boolean> {
  try {
    const roomKey = `room:${roomCode}`;
    const exists = await redis.exists(roomKey);
    return exists === 1;
  } catch (error) {
    console.error("Error checking room existence:", error);
    throw new Error("Failed to check room existence");
  }
}

export async function setRoom(room: TRoom, ttl?: number): Promise<void> {
  try {
    const roomKey = `room:${room.roomCode}`;
    const options = ttl ? { EX: ttl } : undefined;

    await redis.set(roomKey, JSON.stringify(room), options);
  } catch (error) {
    console.error(`Error setting room ${room.roomCode}:`, error);
    throw new Error("Failed to set room");
  }
}

export async function addUserToRoom(
  roomCode: string,
  user: TUser
): Promise<void> {
  try {
    const room = await getRoom(roomCode);
    if (!room) throw new Error("Room not found");
    room.users.push(user);
    await setRoom(room);
  } catch (error) {
    console.error(`Error adding user to room ${roomCode}:`, error);
    throw new Error("Failed to add user to room");
  }
}

export async function deleteUserFromRoom(
  roomCode: string,
  userId: string
): Promise<void> {
  try {
    // Get current room data
    const room = await getRoom(roomCode);
    if (!room) throw new Error("Room not found");

    // Filter out the user
    room.users = room.users.filter((u) => u.id !== userId);

    // Full overwrite (consistent with your setRoom approach)
    await setRoom(room);
  } catch (error) {
    console.error(`Error removing user from room ${roomCode}:`, error);
    throw new Error("Failed to remove user from room");
  }
}

export async function hasRoomAdmin(roomCode: string): Promise<boolean> {
  try {
    const room = await getRoom(roomCode);
    return room ? room.users.some((user) => user.isAdmin) : false;
  } catch (error) {
    console.error(`Error checking admin status for room ${roomCode}:`, error);
    return false;
  }
}

export async function patchRoom(
  roomCode: string,
  updates: Omit<Partial<TRoom>, "roomCode">,
  ttl?: number
): Promise<void> {
  try {
    const roomKey = `room:${roomCode}`;
    const currentRoom = await getRoom(roomCode);

    if (!currentRoom) {
      throw new Error("Room not found");
    }

    const updatedRoom = {
      ...currentRoom,
      ...updates,
      roomCode, // Ensure roomCode stays unchanged
    };

    const options = ttl ? { EX: ttl } : undefined;
    await redis.set(roomKey, JSON.stringify(updatedRoom), options);
  } catch (error) {
    console.error(`Error patching room ${roomCode}:`, error);
    throw new Error("Failed to patch room");
  }
}
