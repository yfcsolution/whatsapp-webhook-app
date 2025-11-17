"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";

export default function Home() {
  const [selectedContact, setSelectedContact] = useState<{
    name: string;
    unread: boolean;
    favorite: boolean;
  } | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const contacts = [
    { name: "Laila", unread: true, favorite: true },
    { name: "Ceo", unread: false, favorite: false },
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
