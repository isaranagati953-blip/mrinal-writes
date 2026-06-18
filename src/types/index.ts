import type { User, AudioSession, Transcription, Note, AuditLog } from "@prisma/client";

// Re-export Prisma types with useful extensions

export type SafeUser = Omit<User, "passwordHash">; // never send hash to client

export type SessionWithTranscription = AudioSession & {
  transcription: Transcription | null;
  _count: { notes: number };
};

export type NoteWithSession = Note & {
  audioSession: Pick<AudioSession, "id" | "title">;
};

export type AuditEntry = AuditLog & {
  user: SafeUser | null;
};

// API response wrapper
export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
