import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";

actor {
  type Role = {
    #user;
    #assistant;
  };

  type Message = {
    id : Nat;
    role : Role;
    content : Text;
    timestamp : Int;
  };

  module Message {
    public func compare(message1 : Message, message2 : Message) : Order.Order {
      Nat.compare(message1.id, message2.id);
    };
  };

  type Conversation = {
    id : Nat;
    title : Text;
    createdAt : Int;
    messages : [Message];
  };

  module Conversation {
    public func compare(conversation1 : Conversation, conversation2 : Conversation) : Order.Order {
      switch (Int.compare(conversation2.createdAt, conversation1.createdAt)) {
        case (#equal) { Nat.compare(conversation1.id, conversation2.id) };
        case (order) { order };
      };
    };
  };

  let conversations = Map.empty<Nat, Conversation>();
  var nextConversationId = 0;
  var nextMessageId = 0;

  func getConversationInternal(conversationId : Nat) : Conversation {
    switch (conversations.get(conversationId)) {
      case (null) { Runtime.trap("No conversation with this ID exists") };
      case (?conversation) { conversation };
    };
  };

  public shared ({ caller }) func createConversation(title : Text) : async Nat {
    let id = nextConversationId;
    let conversation : Conversation = {
      id;
      title;
      createdAt = Time.now();
      messages = [];
    };
    conversations.add(id, conversation);
    nextConversationId += 1;
    id;
  };

  public shared ({ caller }) func deleteConversation(conversationId : Nat) : async () {
    conversations.remove(conversationId);
  };

  public query ({ caller }) func getConversation(conversationId : Nat) : async Conversation {
    getConversationInternal(conversationId);
  };

  public query ({ caller }) func listConversations() : async [Conversation] {
    conversations.values().toArray().sort();
  };

  public shared ({ caller }) func addMessage(conversationId : Nat, role : Role, content : Text) : async Nat {
    let conversation = getConversationInternal(conversationId);
    let id = nextMessageId;
    let message : Message = {
      id;
      role;
      content;
      timestamp = Time.now();
    };

    let updatedMessages = conversation.messages.concat([message]);
    let updatedConversation : Conversation = {
      id = conversation.id;
      title = conversation.title;
      createdAt = conversation.createdAt;
      messages = updatedMessages;
    };

    conversations.add(conversationId, updatedConversation);
    nextMessageId += 1;
    id;
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func callAI(message : Text) : async Text {
    await OutCall.httpGetRequest("https://jsonplaceholder.typicode.com/posts", [], transform);
  };

  public shared ({ caller }) func sendMessage(conversationId : Nat, userMessage : Text) : async Message {
    switch (conversations.get(conversationId)) {
      case (null) { Runtime.trap("No conversation with this ID exists") };
      case (?_) {
        let messageId = await addMessage(conversationId, #user, userMessage);

        let aiResponse = await callAI(userMessage);
        let aiMessageId = await addMessage(conversationId, #assistant, aiResponse);

        switch (conversations.get(conversationId)) {
          case (null) { Runtime.trap("No conversation with this ID exists") };
          case (?{ messages }) {
            if (messages.size() > aiMessageId) {
              messages[aiMessageId];
            } else {
              Runtime.trap("Failed to add message");
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getMessages(conversationId : Nat) : async [Message] {
    let conversation = getConversationInternal(conversationId);
    conversation.messages.sort();
  };

  public shared ({ caller }) func updateConversationTitle(conversationId : Nat, title : Text) : async () {
    let conversation = getConversationInternal(conversationId);
    let updatedConversation : Conversation = {
      id = conversation.id;
      title;
      createdAt = conversation.createdAt;
      messages = conversation.messages;
    };
    conversations.add(conversationId, updatedConversation);
  };

  public shared ({ caller }) func autoGenerateTitle(conversationId : Nat) : async () {
    switch (conversations.get(conversationId)) {
      case (null) { Runtime.trap("No conversation with this ID exists") };
      case (?conversation) {
        let userMessages = conversation.messages.filter(
          func(m) { m.role == #user }
        );
        if (userMessages.size() == 0) {
          Runtime.trap("No messages found to auto-generate title");
        };
        let firstUserMessage = userMessages[0].content;
        await updateConversationTitle(conversationId, firstUserMessage);
      };
    };
  };
};
