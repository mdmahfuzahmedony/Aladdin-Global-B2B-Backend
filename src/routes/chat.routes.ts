import { Router } from "express";
import {
  startOrGetConversation,
  getConversations,
  sendMessage,
  getMessagesByConversation,
  sendAdminWarning,
} from "../controllers/chat.controller";

const router = Router();

// Initialize or retrieve a conversation
router.post("/start-or-get", startOrGetConversation);

// Fetch conversations (with filters by role, user, suspicious)
router.get("/conversations", getConversations);

// Send message
router.post("/messages", sendMessage);

// Get messages for a conversation
router.get("/conversations/:conversationId/messages", getMessagesByConversation);

// Admin warning
router.post("/admin-warning", sendAdminWarning);

export default router;
