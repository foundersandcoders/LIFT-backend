export interface EmailRequest {
  userId: number,
  userName: string,
  managerName: string,
  managerEmail: string
}

export interface EmailContent {
  sendable: boolean,
  html: string
}