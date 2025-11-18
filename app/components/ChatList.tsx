"use client";

// This interface must match the one in page.tsx
export interface Contact {
  name: string;
  number: string; // This is required
  unread: boolean;
  favorite: boolean;
}

export default function ChatList({
  contacts,
  onSelect,
  search,
  setSearch,
  filter,
  setFilter,
}: {
  contacts: Contact[];
  onSelect: (contact: Contact) => void;
  search: string;
  setSearch: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
}) {
  return (
    <div className="w-1/3 border-r flex flex-col bg-white">
      {/* Search Bar */}
      <div className="p-3 border-b">
        <input
          type="text"
          placeholder="Search or start new chat"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 rounded-lg bg-gray-100 outline-none text-sm"
        />
      </div>

      {/* Chats List */}
      <div className="overflow-y-auto">
        {contacts.map((contact, index) => (
          <div
            key={index}
            onClick={() => onSelect(contact)}
            className="flex items-center gap-3 p-3 cursor-pointer border-b hover:bg-gray-100 transition"
          >
            {/* Avatar */}
            <div className="w-12 h-12 bg-green-600 text-white flex items-center justify-center rounded-full text-lg font-bold">
              {contact.name[0]}
            </div>

            {/* Contact and last message */}
            <div className="flex-1">
              <p className="font-medium text-gray-900">{contact.name}</p>
              <p className="text-xs text-gray-500">Tap to start chatting...</p>
            </div>

            {/* Unread Badge */}
            {contact.unread && (
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                1
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}