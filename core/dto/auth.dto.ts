export interface AuthDto {
  email: string;
  password: string;
}

export interface EmailChangeDto {
  uuid: string;
  newEmail: string;
}

export interface GoogleTokenPayload {
  sub: string;
  email: string;
  email_verified: string;
  aud: string;
}

export interface GoogleAccountDto {
  email: string;
  googleId: string;
  isVerified?: boolean;
  password?: null;
}