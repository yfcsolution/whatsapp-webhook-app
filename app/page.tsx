"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";

// Define the Contact interface that matches ChatList's expectation
interface Contact {
  name: string;
  number: string;
  unread: boolean;
  favorite: boolean;
}

interface Message {
  _id: string;
  from: string;
  to: string;
  text: string;
  type: 'incoming' | 'outgoing' | 'template';
  messageType: string;
  timestamp: string;
}

export default function Home() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ FIXED: Convert to international format (remove leading 0, add 92)
  const contacts: Contact[] = [
    { name: "Laila", number: "923010813515", unread: true, favorite: false },
    { name: "Ceo", number: "923130541339", unread: false, favorite: false },
  ];

  // Load messages when selected contact changes
  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.number);
    } else {
      setMessages([]);
    }
  }, [selectedContact]);

  // Function to load messages from API
  const loadMessages = async (contactNumber: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/messages/${contactNumber}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error("Failed to load messages");
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh messages (can be called from child components)
  const refreshMessages = () => {
    if (selectedContact) {
      loadMessages(selectedContact.number);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar onSelect={(id: string) => console.log(id)} />

      <ChatList
        contacts={contacts}
        onSelect={setSelectedContact}
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
      />

      <ChatWindow 
        contact={selectedContact} 
        messages={messages}
        // If you added the onMessageSent prop to ChatWindow, pass this:
         onMessageSent={refreshMessages}
      />
    </div>
  );
}