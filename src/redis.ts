import { createClient } from "redis";
import { TUser } from "./types";

const redis = createClient();

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

export async function removeUser(room: string, userId: string): Promise<void> {
  await redis.hDel(`room:${room}:users`, userId);

  // If room is empty, consider removing it
  const userCount = await redis.hLen(`room:${room}:users`);
  if (userCount === 0) {
    await redis.sRem("rooms:list", room);
  }
}

export async function getUsers(room: string): Promise<TUser[]> {
  const rawUsers = await redis.hGetAll(`room:${room}:users`);

  if (!rawUsers || Object.keys(rawUsers).length === 0) {
    return [];
  }

  return Object.entries(rawUsers).map(([_, userData]) => {
    return JSON.parse(userData);
  });
}

export async function getUser(
  room: string,
  id: string
): Promise<TUser | undefined> {
  const rawUser = await redis.hGet(`room:${room}:users`, id);

  return rawUser ? JSON.parse(rawUser) : undefined;
}

export async function roomExists(room: string): Promise<boolean> {
  return (await redis.sIsMember("rooms:list", room)) === 1;
}
