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
}

export type TRoom = {
  code: string;
};

export type TUser = {
  id: string;
  name: string;
};

export type TMessage = {
  content: string;
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
    message: string;
    roomCode: string;
  }) => void;
  [WebGameEvents.CreateRoom]: (userName: string) => void;
};

export type ServerToClientEvents = {
  [WebGameEvents.ReciveMessage]: (message: string) => void;
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
