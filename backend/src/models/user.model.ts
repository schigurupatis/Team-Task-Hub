import { v4 as uuidv4 } from 'uuid';
import { User, SafeUser, RegisterDto } from '../types/auth.types';

// ─── UserStore — same pattern as TaskStore ────────────────────────────────────
// All data access through methods — swap to DB by rewriting only this file
class UserStore {
  private users: Map<string, User> = new Map();
  // Secondary indexes for fast lookup by username and email
  private byUsername: Map<string, string> = new Map(); // username → id
  private byEmail:    Map<string, string> = new Map(); // email    → id

  // ── Find by username (for login) ──────────────────────────────────────────
  findByUsername(username: string): User | undefined {
    const id = this.byUsername.get(username.toLowerCase());
    if (!id) return undefined;
    return this.users.get(id);
  }

  // ── Find by email (for duplicate check on register) ───────────────────────
  findByEmail(email: string): User | undefined {
    const id = this.byEmail.get(email.toLowerCase());
    if (!id) return undefined;
    return this.users.get(id);
  }

  // ── Find by id (for JWT verification) ─────────────────────────────────────
  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  // ── Check if username is already taken ────────────────────────────────────
  isUsernameTaken(username: string): boolean {
    return this.byUsername.has(username.toLowerCase());
  }

  // ── Check if email is already registered ──────────────────────────────────
  isEmailTaken(email: string): boolean {
    return this.byEmail.has(email.toLowerCase());
  }

  // ── Create new user — password must already be hashed before calling this ─
  create(dto: RegisterDto & { hashedPassword: string }): User {
    const id = uuidv4();
    const user: User = {
      id,
      firstName: dto.firstName,
      lastName:  dto.lastName,
      username:  dto.username.toLowerCase(),
      email:     dto.email.toLowerCase(),
      phone:     dto.phone,
      password:  dto.hashedPassword,   // bcrypt hash
      createdAt: new Date().toISOString(),
    };
    // Store in main map + secondary indexes
    this.users.set(id, user);
    this.byUsername.set(user.username, id);
    this.byEmail.set(user.email, id);
    return user;
  }

  // ── Strip password before sending to client ────────────────────────────────
  toSafeUser(user: User): SafeUser {
    const { password, ...safe } = user;
    void password; // explicitly unused
    return safe;
  }

  // ── Test helper ───────────────────────────────────────────────────────────
  _reset(): void {
    this.users.clear();
    this.byUsername.clear();
    this.byEmail.clear();
  }

  _count(): number {
    return this.users.size;
  }
}

// Singleton — one instance for the whole app
export const userStore = new UserStore();