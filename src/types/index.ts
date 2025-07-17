export enum WebGameEvents {
  Disconnect = "disconnect",
  Connection = "connection",
  JoinRoom = "join-room",
  CreateRoom = "create-room",
  SendMessage = "send-message",
  ReciveMessage = "recive-message",
  LeaveRoom = "leave-room",
  UserLeft = "user-left",
  UserJoined = "user-joined",
  MyUserJoined = "my-user-joined",
  SendPoo = "send-poo",
  RecivePoo = "recive-poo",

  // игровые события
  ChnageGameState = "chnage-game-state",
  GameStateChanged = "game-state-changed",

  CreateImage = "create-image",
  ImageCreated = "image-created",
  AllImagesCreated = "all-images-created",

  CreateMeme = "create-meme",
  MemeCreated = "meme-created",
  AllMemesCreated = "all-memes-created",
}

export enum WebGameStates {
  Default = "default",
  WaitStart = "wait-start",
  CreateImage = "create-image",
  CreateMeme = "create-meme",
  WatchMeme = "watch-meme",
  EndGame = "end-game",
}

export type TUser = {
  id: string;
  name: string;
  isAdmin: boolean;
};

export type TMessage = {
  content: string;
  sender: TUser;
};

export type TMeme = {
  id: string;
  src: string;
  text: string;
  authorId: string;
};

export type TRoom = {
  roomCode: string; // uniq
  state: WebGameStates;
  memes: TMeme[];
  users: TUser[];
};

export type ClientToServerEvents = {
  [WebGameEvents.JoinRoom]: ({
    roomCode,
    userName,
  }: {
    roomCode: string;
    userName: string;
  }) => void;
  [WebGameEvents.LeaveRoom]: ({
    roomCode,
    userId,
  }: {
    roomCode: string;
    userId: string;
  }) => void;
  [WebGameEvents.SendPoo]: (userId: string) => void;
  [WebGameEvents.SendMessage]: ({
    message,
    roomCode,
  }: {
    message: TMessage;
    roomCode: string;
  }) => void;
  [WebGameEvents.CreateRoom]: (userName: string) => void;
  [WebGameEvents.ChnageGameState]: ({
    roomCode,
    state,
  }: {
    roomCode: string;
    state: WebGameStates;
  }) => void;
};

export type ServerToClientEvents = {
  [WebGameEvents.ReciveMessage]: (message: TMessage) => void;
  [WebGameEvents.UserJoined]: (room: TRoom) => void;
  [WebGameEvents.UserLeft]: (room: TRoom) => void;
  [WebGameEvents.MyUserJoined]: (user: TUser) => void;
  [WebGameEvents.RecivePoo]: () => void;
  [WebGameEvents.GameStateChanged]: (room: TRoom) => void;
};
