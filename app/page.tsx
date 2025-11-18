"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";

// Define the Contact interface that matches ChatList's expectation
interface Contact {
  name: string;
  number: string; // ✅ This is required by ChatList
  unread: boolean;
  favorite: boolean;
}

export default function Home() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  // ✅ FIXED: Convert to international format (remove leading 0, add 92)
  const contacts: Contact[] = [
    { name: "Laila", number: "923010813515", unread: true, favorite: true }, // ✅ 03010813515 → 923010813515
    { name: "Ceo", number: "923130541339", unread: false, favorite: false }, // ✅ 03130541339 → 923130541339
  ];

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

      <ChatWindow contact={selectedContact} messages={[]} />
    </div>
  );
}