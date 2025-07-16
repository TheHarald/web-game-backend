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
  StaterGame = "stater-game",

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
};

export type ServerToClientEvents = {
  [WebGameEvents.ReciveMessage]: (message: TMessage) => void;
  [WebGameEvents.UserJoined]: ({
    users,
    roomCode,
  }: {
    users: TUser[];
    roomCode: string;
  }) => void;
  [WebGameEvents.UserLeft]: ({
    users,
    roomCode,
  }: {
    users: TUser[];
    roomCode: string;
  }) => void;
  [WebGameEvents.MyUserJoined]: (user: TUser) => void;
  [WebGameEvents.RecivePoo]: () => void;
};
