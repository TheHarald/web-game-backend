export enum ChatEvent {
  Connecting = "connecting",
  Disconect = "disconect",
  // Message = "message",
}

export interface Message {
  id: string;
  text: string;
  userId: string;
}
