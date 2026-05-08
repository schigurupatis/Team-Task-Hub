// ─── User Entity ──────────────────────────────────────────────────────────────
export interface User {
  id:          string;       // UUID v4
  firstName:   string;       // e.g. "Santha"
  lastName:    string;       // e.g. "Kumar"
  username:    string;       // unique, e.g. "santhakumar"
  email:       string;       // unique, e.g. "santha@gmail.com"
  phone:       string;       // e.g. "+91 9876543210"
  password:    string;       // bcrypt hashed — NEVER store plain text
  createdAt:   string;       // ISO 8601
}

// ─── What we return to the client (never send password) ───────────────────────
export type SafeUser = Omit<User, 'password'>;

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface RegisterDto {
  firstName: string;
  lastName:  string;
  username:  string;
  email:     string;
  phone:     string;
  password:  string;
}

export interface LoginDto {
  username: string;
  password: string;
}

// ─── JWT Payload (what we encode inside the token) ────────────────────────────
export interface JwtPayload {
  userId:   string;
  username: string;
  email:    string;
}

// ─── Auth Response shape ───────────────────────────────────────────────────────
export interface AuthResponse {
  user:  SafeUser;
  token: string;   // JWT — frontend stores this and sends on every request
}