"use client";

import { useState, useEffect, useRef } from "react";
import TemplateButton from "./TemplateButton";

export default function ChatWindow({ contact, messages, onMessageSent }) {
  const [localMessages, setLocalMessages] = useState(messages || []);
  const [customMessage, setCustomMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Update local messages when parent messages change
  useEffect(() => {
    setLocalMessages(messages || []);
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  // Send Custom Message using fetch
  const sendCustomMessage = async () => {
    if (!customMessage.trim() || !contact?.number || isLoading) return;

    setIsLoading(true);
    
    // Store the optimistic message ID to remove it if failed
    const tempMessageId = Date.now().toString();
    
    try {
      // Optimistically add message to UI
      const tempMessage = {
        _id: tempMessageId,
        from: "system",
        to: contact.number,
        text: customMessage,
        type: "outgoing",
        messageType: "text",
        timestamp: new Date().toISOString(),
      };
      
      setLocalMessages(prev => [...prev, tempMessage]);
      setCustomMessage("");

      // Send to API using fetch
      const response = await fetch("/api/send-custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: contact.number,
          message: customMessage,
        }),
      });

      // Get the response data to check for detailed errors
      const result = await response.json();
      
      if (!response.ok) {
        // Show the actual error message from the API
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      console.log('✅ Message sent successfully:', result);
      
      // Notify parent to refresh messages
      if (onMessageSent) {
        onMessageSent();
      }
      
    } catch (err) {
      console.error("❌ Error sending custom message:", err);
      
      // Show detailed error message to user
      let errorMessage = "Failed to send message";
      
      if (err.message.includes("Failed to fetch")) {
        errorMessage = "Network error: Cannot connect to server. Check your internet connection.";
      } else if (err.message.includes("500")) {
        errorMessage = "Server error: The message service is temporarily unavailable.";
      } else if (err.message.includes("404")) {
        errorMessage = "API not found: The send message service is not available.";
      } else if (err.message.includes("400")) {
        errorMessage = "Bad request: Please check the message content.";
      } else {
        errorMessage = `Error: ${err.message}`;
      }
      
      alert(errorMessage);
      
      // Remove the optimistic message on error
      setLocalMessages(prev => prev.filter(msg => msg._id !== tempMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendCustomMessage();
    }
  };

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">💬</div>
          <div>Select a contact to start chatting</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
        <div>
          <span className="font-semibold text-lg">{contact.name}</span>
          <div className="text-sm text-gray-500">{contact.number}</div>
        </div>
        <div className="relative cursor-pointer">
          <span className="text-2xl">⋮</span>
          {/* Dropdown menu can be added here */}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {localMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-2xl mb-2">👋</div>
            <div>No messages yet. Start the conversation!</div>
          </div>
        ) : (
          <>
            <div className="text-center text-xs text-gray-500 mb-4">
              Today
            </div>
            {localMessages.map((msg) => (
              <div 
                key={msg._id} 
                className={`flex ${msg.type === "outgoing" || msg.from === "system" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`px-4 py-2 rounded-lg max-w-xs break-words ${
                    msg.type === "outgoing" || msg.from === "system" 
                      ? "bg-green-500 text-white rounded-br-none" 
                      : "bg-white border border-gray-300 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Template Input Section */}
      <div className="p-3 border-t border-gray-200 flex items-center gap-2 bg-white">
        <input
          type="text"
          placeholder="Type template name..."
          className="flex-1 border rounded-full px-4 py-2 outline-none"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              // You can add template sending on Enter if needed
            }
          }}
        />
        <TemplateButton contact={contact} onMessageSent={onMessageSent} />
      </div>

      {/* Custom Message Input Section */}
      <div className="p-3 border-t border-gray-200 flex items-center gap-2 bg-white">
        <input
          type="text"
          placeholder="Type a custom message..."
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 border rounded-full px-4 py-2 outline-none"
          disabled={isLoading}
        />
        <button
          onClick={sendCustomMessage}
          disabled={!customMessage.trim() || isLoading}
          className={`px-4 py-2 rounded-full font-medium ${
            !customMessage.trim() || isLoading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 py-2 bg-gray-50">
        Messages are end-to-end encrypted
      </div>
    </div>
  );
}