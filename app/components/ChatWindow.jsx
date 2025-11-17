"use client";

import { useState } from "react";
import TemplateButton from "./TemplateButton";

export default function ChatWindow({ contact, messages }) {
  const [localMessages, setLocalMessages] = useState(messages || []);

  if (!contact) return <div className="flex-1 flex items-center justify-center">Select a contact to chat</div>;

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
        <span className="font-semibold">{contact.name}</span>
        <div className="relative cursor-pointer">
          <span className="text-2xl">⋮</span>
          {/* Dropdown menu can be added here */}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        <div className="text-center text-xs text-gray-500 mb-2">Today</div>
        {localMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`px-4 py-2 rounded-lg max-w-xs ${msg.from === "me" ? "bg-green-500 text-white" : "bg-white border border-gray-300"}`}>
              {msg.body}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 flex items-center gap-2 bg-white">
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 border rounded-full px-4 py-2 outline-none"
        />
        <TemplateButton contact={contact} />
      </div>

      <div className="text-center text-xs text-gray-400 py-1">Messages are end-to-end encrypted</div>
    </div>
  );
}
