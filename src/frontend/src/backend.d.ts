import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Message {
    id: bigint;
    content: string;
    role: Role;
    timestamp: bigint;
}
export interface Conversation {
    id: bigint;
    title: string;
    messages: Array<Message>;
    createdAt: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export enum Role {
    user = "user",
    assistant = "assistant"
}
export interface backendInterface {
    addMessage(conversationId: bigint, role: Role, content: string): Promise<bigint>;
    autoGenerateTitle(conversationId: bigint): Promise<void>;
    createConversation(title: string): Promise<bigint>;
    deleteConversation(conversationId: bigint): Promise<void>;
    getConversation(conversationId: bigint): Promise<Conversation>;
    getMessages(conversationId: bigint): Promise<Array<Message>>;
    listConversations(): Promise<Array<Conversation>>;
    sendMessage(conversationId: bigint, userMessage: string): Promise<Message>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateConversationTitle(conversationId: bigint, title: string): Promise<void>;
}
