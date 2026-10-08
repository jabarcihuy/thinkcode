import type { Role } from "@/types/auth";
export interface ForumViewer { userId: string | null; role: Role | null; guest: boolean }
export interface ForumTopic { id: string; title: string; body: string; category: string; createdAt: string; author: string; locked: boolean; hidden: boolean }
export interface ForumReply { id: string; body: string; createdAt: string; author: string; hidden: boolean }
