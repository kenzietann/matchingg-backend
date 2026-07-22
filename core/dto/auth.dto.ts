export interface AuthDto {
  email: string;
  password: string;
}

export interface EmailChangeDto {
  uuid: string;
  newEmail: string;
}