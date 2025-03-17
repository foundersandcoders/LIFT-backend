export interface PingRequest {
  authId: string,
  userName: string,
  managerName: string,
  managerEmail: string
}

export interface PingProps {
  isValid: boolean;
  content: string | undefined;
  validate(): asserts this is { isValid: true; content: string };
}

export class PingInfo implements PingProps {
  isValid: boolean = false;
  content: string | undefined;

  validate() {
    if (!this.isValid) {
      throw new Error("Ping is not valid");
    }
    if (!this.content) {
      throw new Error("Content is required when ping is valid");
    }
  }
}