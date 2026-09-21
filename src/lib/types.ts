export type UserRole = "admin" | "agent" | "customer";
export type UserStatus = "active" | "away" | "offline";
export type Channel = "website" | "whatsapp";
export type ConversationStatus = "open" | "pending" | "ai" | "human" | "closed";
export type Sender = "customer" | "bot" | "agent" | "system";
export type MessageType = "text" | "image" | "file" | "audio";
export type MessageStatus = "queued" | "sent" | "delivered" | "read" | "failed";
export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  passwordHash?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  channel: Channel;
  status: ConversationStatus;
  assignedAgentId?: string;
  assignedAgentName?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  botPaused: boolean;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: Sender;
  senderName: string;
  body: string;
  messageType: MessageType;
  whatsappMessageId?: string;
  status: MessageStatus;
  metadata?: Record<string, string>;
  createdAt: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  embedding?: number[];
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  sku: string;
  category: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent" | "supervisor";
  status: UserStatus;
  activeChats: number;
  resolvedToday: number;
}

export interface DashboardStats {
  totalConversations: number;
  websiteConversations: number;
  whatsappConversations: number;
  aiResolved: number;
  humanSupport: number;
  openNow: number;
  avgFirstResponseSec: number;
  csat: number;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
