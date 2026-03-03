# Artificial THINKING

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- A ChatGPT-like conversational AI chat interface
- Chat history stored per session (multiple conversations)
- User can ask any question and receive an AI-generated response
- New chat creation
- Sidebar listing past conversations
- Message bubbles for user and AI responses
- Typing indicator while AI is generating response
- Backend stores conversations and messages persistently
- AI responses generated via HTTP outcalls to an external LLM API

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Select `http-outcalls` component for backend LLM API calls
2. Generate Motoko backend with:
   - Conversation management (create, list, get, delete)
   - Message storage (user messages + AI responses)
   - HTTP outcall to generate AI responses
3. Build React frontend with:
   - Sidebar with conversation list and "New Chat" button
   - Main chat area with message bubbles
   - Input field with send button
   - Typing/loading indicator
   - Responsive layout matching ChatGPT-style UI
