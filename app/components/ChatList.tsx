"use client";

import { useState, useMemo } from "react";
import {
  BsWhatsapp,
  BsThreeDotsVertical,
  BsPersonPlus,
  BsPersonLinesFill,
  BsPeople,
  BsFillPersonFill,
  BsPhone,
  BsChevronDown,
  BsQrCode,
  BsCamera,
  BsImage,
  BsBrightnessHigh,
  BsChevronRight,
  BsX,
  BsStar,
  BsStarFill,
} from "react-icons/bs";
import { AiOutlineArrowLeft, AiOutlineQrcode } from "react-icons/ai";
import { FiMoreVertical } from "react-icons/fi";

// This interface must match the one in page.tsx
export interface Contact {
  name: string;
  number: string; // This is required
  unread: boolean;
  favorite: boolean;
  isGroup?: boolean;
  lastMessage?: string;
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addNewOpen, setAddNewOpen] = useState(false);
  // New UI states
  const [showNewContact, setShowNewContact] = useState(false);
  const [showNewGroupPicker, setShowNewGroupPicker] = useState(false);
  // New Contact form state
  const [ncFirstName, setNcFirstName] = useState("");
  const [ncLastName, setNcLastName] = useState("");
  const [ncCountryCodeOpen, setNcCountryCodeOpen] = useState(false);
  const [ncCountryCode, setNcCountryCode] = useState({ label: "PK +92", code: "+92" });
  const [ncNumber, setNcNumber] = useState("");
  const [ncSyncToPhone, setNcSyncToPhone] = useState(false);
  const [showSyncPicker, setShowSyncPicker] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  // New Contact: small search to find existing contacts to autofill
  const [ncSearchExisting, setNcSearchExisting] = useState("");
  const [ncSuggestionsOpen, setNcSuggestionsOpen] = useState(false);
  // Favorites Form State
  const [showFavoritesForm, setShowFavoritesForm] = useState(false);
  const [favoritesSearch, setFavoritesSearch] = useState("");
  // Simulated gmail/accounts list for sync picker
  const gmailAccounts = [
    { id: 1, email: "laila@example.com", phone: "+92-300-1111111", selectedEmail: false, selectedPhone: false },
    { id: 2, email: "ceo@example.com", phone: "+92-300-2222222", selectedEmail: false, selectedPhone: false },
    { id: 3, email: "info@example.com", phone: "+92-300-3333333", selectedEmail: false, selectedPhone: false },
  ];
  const [syncList, setSyncList] = useState(gmailAccounts);
  // New Group states
  const [groupContactsSearch, setGroupContactsSearch] = useState("");
  const [selectedGroupContacts, setSelectedGroupContacts] = useState<Contact[]>([]);
  const [showGroupNameForm, setShowGroupNameForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [disappearSettingOpen, setDisappearSettingOpen] = useState(false);
  const [disappearTimer, setDisappearTimer] = useState<"off" | "24h" | "7d" | "90d">("off");
  const [groupPermissionsOpen, setGroupPermissionsOpen] = useState(false);
  const [permissions, setPermissions] = useState({
    editSettings: true,
    sendMessages: true,
    addMembers: true,
    inviteViaLink: true,
    approveMembers: false,
  });
  // Handlers for top dropdown items
  const handleSearch = () => alert("Search clicked");
  const handleReport = () => alert("Report clicked");
  const handleBlockContact = () => alert("Block clicked");
  const handleMute = () => alert("Mute Notifications clicked");
  const handleDisappearingMessages = () => alert("Disappearing Messages clicked");
  const handleChatTheme = () => alert("Chat Theme clicked");
  const handleMediaLinksDocs = () => alert("Media, Links, and Docs clicked");
  const handleClearChat = () => alert("Clear Chat clicked");
  const handleExportChat = () => alert("Export Chat clicked");
  const handleAddShortcut = () => alert("Add Shortcut clicked");
  const filterOptions = ["All", "Unread", "Favorites", "Groups"];
  // country codes list (short sample)
  const countryCodes = [
    { label: "PK +92", code: "+92" },
    { label: "US +1", code: "+1" },
    { label: "UK +44", code: "+44" },
    { label: "IN +91", code: "+91" },
    { label: "AU +61", code: "+61" },
  ];
  // Derived filter for group contacts search
  const availableContactsForGroup = useMemo(() => {
    const q = groupContactsSearch.trim().toLowerCase();
    return contacts.filter((c) => c.name.toLowerCase().includes(q) && !selectedGroupContacts.find((s) => s.number === c.number));
  }, [groupContactsSearch, contacts, selectedGroupContacts]);

  // Helpers
  const toggleSelectContactForGroup = (c: Contact) => {
    const exists = selectedGroupContacts.find((s) => s.number === c.number);
    if (exists) {
      setSelectedGroupContacts(selectedGroupContacts.filter((s) => s.number !== c.number));
    } else {
      setSelectedGroupContacts([...selectedGroupContacts, c]);
    }
  };
  // Sync picker toggles for gmail/phone circles
  const toggleSyncEmail = (id: number) => {
    setSyncList((prev) => prev.map((p) => (p.id === id ? { ...p, selectedEmail: !p.selectedEmail } : p)));
  };
  const toggleSyncPhone = (id: number) => {
    setSyncList((prev) => prev.map((p) => (p.id === id ? { ...p, selectedPhone: !p.selectedPhone } : p)));
  };
  // Save new contact (placeholder)
  const handleSaveContact = () => {
    // TODO: integrate with actual add contact behavior
    alert(`Save contact: ${ncFirstName} ${ncLastName} (${ncCountryCode.code} ${ncNumber})\nSync: ${ncSyncToPhone ? "Yes" : "No"}`);
    setShowNewContact(false);
    // reset basic fields
    setNcFirstName("");
    setNcLastName("");
    setNcNumber("");
    setNcSyncToPhone(false);
    setSyncList(gmailAccounts.map((g) => ({ ...g, selectedEmail: false, selectedPhone: false })));
  };
  // Group flow handlers
  const proceedToGroupName = () => {
    if (selectedGroupContacts.length === 0) {
      alert("Please select at least one contact for the group.");
      return;
    }
    setShowGroupNameForm(true);
  };
  const handleCreateGroup = () => {
    // TODO: integrate with real group creation
    alert(`Group "${groupName}" created with ${selectedGroupContacts.length} members.\nDisappearing: ${disappearTimer}\nPermissions: ${JSON.stringify(permissions)}`);
    // reset group builder
    setSelectedGroupContacts([]);
    setGroupName("");
    setDisappearTimer("off");
    setGroupPermissionsOpen(false);
    setShowNewGroupPicker(false);
    setShowGroupNameForm(false);
  };
  // Toggle favorite status for a contact
  const toggleFavorite = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, you would update the contact in your state/store
    alert(`${contact.name} ${contact.favorite ? "removed from" : "added to"} favorites`);
    // For demo purposes, we'll just show the alert
  };
  // Handle filter button clicks - SIMPLIFIED: No modal anymore
  const handleFilterClick = (option: string) => {
    setFilter(option);
  };
  // -----------------------
  // Search logic for main chat list
  // -----------------------
  // displayedContacts is filtered by both the 'search' text and 'filter' button
  const displayedContacts = useMemo(() => {
    const q = (search || "").trim().toLowerCase();

    let list = contacts.slice(); // copy

    // apply textual search if provided
    if (q.length > 0) {
      if (q === "unread") {
        list = list.filter((c) => c.unread);
      } else if (q === "favorites" || q === "favourite") {
        list = list.filter((c) => c.favorite);
      } else {
        // match name or number
        list = list.filter((c) => {
          return (
            c.name.toLowerCase().includes(q) ||
            c.number.toLowerCase().includes(q)
          );
        });
      }
    }
    // apply filter buttons (they further narrow down)
    if (filter === "Unread") {
      list = list.filter((c) => c.unread);
    } else if (filter === "Favorites") {
      list = list.filter((c) => c.favorite);
    } else if (filter === "Groups") {
      // Filter for groups only
      list = list.filter((c) => c.isGroup);
    }

    return list;
  }, [contacts, search, filter]);

  // Filter contacts for favorites form
  const availableContactsForFavorites = useMemo(() => {
    const q = favoritesSearch.trim().toLowerCase();
    return contacts.filter((c) => 
      (c.name.toLowerCase().includes(q) || c.number.toLowerCase().includes(q))
    );
  }, [favoritesSearch, contacts]);
  // -----------------------
  // FIXED: Handlers for clickable search icons
  // -----------------------
  const handleMainSearchClick = () => {
    // Simply trim the current search value and set it
    setSearch(search.trim());
  };

  const handleGroupSearchClick = () => {
    setGroupContactsSearch(groupContactsSearch.trim());
  };

  const handleNcExistingSearchClick = () => {
    setNcSearchExisting(ncSearchExisting.trim());
    setNcSuggestionsOpen(true);
  };

  // Derived suggestions for New Contact search (existing contacts)
  const ncSuggestions = useMemo(() => {
    const q = ncSearchExisting.trim().toLowerCase();
    if (!q) return [];
    return contacts.filter((c) => c.name.toLowerCase().includes(q) || c.number.toLowerCase().includes(q));
  }, [ncSearchExisting, contacts]);

  // When clicking a suggestion autofill new contact fields
  const handleUseSuggestion = (c: Contact) => {
    // Split name into first/last naively
    const parts = c.name.split(" ");
    setNcFirstName(parts[0] || "");
    setNcLastName(parts.slice(1).join(" ") || "");
    setNcNumber(c.number.replace(/\D/g, "")); // remove non-digit chars but keep digits
    setNcSuggestionsOpen(false);
    setNcSearchExisting("");
  };
  return (
    <div className="w-1/3 border-r flex flex-col bg-white">
      {/* Top bar with WhatsApp icon and title */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <BsWhatsapp className="text-green-600 text-2xl" />
          <span className="font-bold text-lg">WhatsApp</span>
        </div>

        {/* Add New Icon + Three-dot Menu */}
        <div className="flex items-center gap-2 relative">
          {/* Add New Icon with dropdown */}
          <button
            className="p-1 text-gray-500 hover:text-gray-700"
            onClick={() => setAddNewOpen(!addNewOpen)}
          >
            <BsPersonPlus className="text-xl" />
          </button>
          {addNewOpen && (
            <div className="absolute right-10 top-full mt-2 w-64 bg-white border border-gray-200 rounded shadow-lg z-50">
              <button
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
                onClick={() => {
                  setShowNewContact(true);
                  setAddNewOpen(false);
                }}
              >
                <BsPersonLinesFill /> New Contact
              </button>
              <button
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
                onClick={() => {
                  setShowNewGroupPicker(true);
                  setAddNewOpen(false);
                }}
              >
                <BsPeople /> New Group
              </button>
            </div>
          )}

          {/* Three-dot Menu */}
          <button
            className="p-1 text-gray-500 hover:text-gray-700"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <BsThreeDotsVertical className="text-xl" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded shadow-lg z-50">
              <ul className="flex flex-col">
                <li onClick={handleSearch} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Search
                </li>
                <li onClick={handleReport} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Report
                </li>
                <li onClick={handleBlockContact} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Block
                </li>
                <li onClick={handleMute} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Mute Notifications
                </li>
                <li onClick={handleDisappearingMessages} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Disappearing Messages
                </li>
                <li onClick={handleChatTheme} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Chat Theme
                </li>
                <li onClick={handleMediaLinksDocs} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Media, Links, and Docs
                </li>
                <li onClick={handleClearChat} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Clear Chat
                </li>
                <li onClick={handleExportChat} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Export Chat
                </li>
                <li onClick={handleAddShortcut} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Add Shortcut
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar (MAIN) */}
      <div className="p-3 border-b">
        <div className="relative">
          {/* Icon inside input (left) */}
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2"
            onClick={handleMainSearchClick}
            aria-label="Search"
            type="button"
          >
            <img
              src="/assets/search.png"
              alt="search"
              className="w-5 h-5 opacity-70"
            />
          </button>

          <input
            type="text"
            placeholder="Search or start new chat"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 p-2 rounded-lg bg-gray-100 outline-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleMainSearchClick();
              }
            }}
          />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 px-3 py-2 bg-gray-100 border-b">
        {filterOptions.map((option) => (
          <button
            key={option}
            className={`px-3 py-1 rounded text-black font-medium ${
              filter === option ? "bg-gray-300" : "bg-gray-200"
            }`}
            onClick={() => handleFilterClick(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {/* ---------------------------
          FIXED: Favorites Section (Image 1 Style)
          Show this when Favorites filter is selected AND there are no favorite contacts
          --------------------------- */}
      {filter === "Favorites" && displayedContacts.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white">
          {/* Large Book Image */}
          <div className="mb-6">
            <img 
              src="/assets/book.png" 
              alt="Favorites" 
              className="w-24 h-24 mx-auto"
            />
          </div>
          
          {/* Title and Description */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Add to favorites</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            Make it easy to find the people and groups that matter <br /> most across WhatsApp.
          </p>
          
          {/* Add to Favorites Button - NOW GREEN AND CLICKABLE */}
          <button 
            className="text-green-600  px-8 py-3 rounded-lg font-medium  transition-colors text-lg"
            onClick={() => setShowFavoritesForm(true)}
          >
            Add to favorites
          </button>
        </div>
      )}

      {/* Chats List - Only show when NOT in Favorites filter with no favorites, OR when there are contacts to display */}
      {!(filter === "Favorites" && displayedContacts.length === 0) && (
        <div className="overflow-y-auto flex-1">
          {displayedContacts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No contacts found.</div>
          ) : (
            displayedContacts.map((contact, index) => (
              <div
                key={index}
                onClick={() => onSelect(contact)}
                className="flex items-center gap-3 p-3 cursor-pointer border-b hover:bg-gray-100 transition relative"
              >
                {/* Avatar */}
                <div className="w-12 h-12 bg-green-600 text-white flex items-center justify-center rounded-full text-lg font-bold">
                  {contact.name[0]}
                </div>

                {/* Contact and last message */}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{contact.name}</p>
                  <p className="text-xs text-gray-500">{contact.number}</p>
                </div>

                {/* REMOVED: unread/favorite markers */}
                {/* No "NEW" badge or star icons displayed */}
              </div>
            ))
          )}
        </div>
      )}
      {/* ---------------------------
          Favorites Form Modal (Image Style)
          --------------------------- */}
      {showFavoritesForm && (
        <div className="fixed inset-0 bg-black/40 z-60 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <button
                  className="p-2"
                  onClick={() => setShowFavoritesForm(false)}
                >
                  <AiOutlineArrowLeft className="text-xl" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">Add to Favorites</h2>
                <div className="w-8"></div> {/* Spacer for alignment */}
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b">
              <div className="relative">
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  aria-label="Search"
                  type="button"
                >
                  <img
                    src="/assets/search.png"
                    alt="search"
                    className="w-4 h-4 opacity-70"
                  />
                </button>
                <input
                  type="text"
                  placeholder="Search name or number"
                  value={favoritesSearch}
                  onChange={(e) => setFavoritesSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 outline-none text-sm"
                />
              </div>
            </div>

            {/* Info Text */}
            <div className="p-4 border-b">
              <p className="text-sm text-gray-600">
                Add as many people or groups as you want. Only you can see who's included on your lists.
              </p>
            </div>

            {/* Recent Chats Section */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Recent chats</h3>
                
                {/* Contacts List - Using your actual contacts (Laila, Ceo, etc.) */}
                <div className="space-y-2">
                  {availableContactsForFavorites.map((contact) => (
                    <div
                      key={contact.number}
                      className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-50 rounded"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-green-600 text-white flex items-center justify-center rounded-full text-sm font-bold">
                        {contact.name[0]}
                      </div>

                      {/* Contact Info */}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.number}</p>
                      </div>

                      {/* Add to Favorites Button */}
                      <button
                        className="text-green-600 text-sm font-medium hover:text-green-700"
                        onClick={() => {
                          alert(`${contact.name} added to favorites`);
                          // Here you would update the contact's favorite status
                        }}
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------
          New Contact Modal (drawer-like)
          --------------------------- */}
      {showNewContact && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <button
                  className="p-1"
                  onClick={() => {
                    setShowNewContact(false);
                    // reset on close if you want
                  }}
                >
                  <AiOutlineArrowLeft className="text-xl" />
                </button>
                <h3 className="font-bold text-lg">New Contact</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  title="Scan QR"
                  className="p-1"
                  onClick={() => {
                    setShowQrScanner(true);
                  }}
                >
                  <BsQrCode className="text-2xl" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              {/* Small Search existing contacts (NEW) */}
              <div>
                <label className="text-xs text-gray-600">Search existing contacts</label>
                <div className="relative mt-1">
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={handleNcExistingSearchClick}
                    type="button"
                    aria-label="Search existing contacts"
                  >
                    <img src="/assets/search.png" alt="search" className="w-4 h-4 opacity-70" />
                  </button>
                  <input
                    className="w-full pl-10 p-2 rounded-lg border bg-white text-sm outline-none"
                    placeholder="Search contacts to autofill"
                    value={ncSearchExisting}
                    onChange={(e) => {
                      setNcSearchExisting(e.target.value);
                      setNcSuggestionsOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleNcExistingSearchClick();
                      }
                    }}
                  />
                </div>

                {/* suggestions */}
                {ncSuggestionsOpen && ncSuggestions.length > 0 && (
                  <div className="mt-2 border rounded max-h-40 overflow-auto">
                    {ncSuggestions.map((s) => (
                      <div
                        key={s.number}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                        onClick={() => handleUseSuggestion(s)}
                      >
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-gray-500">{s.number}</div>
                        </div>
                        <div className="text-xs text-gray-400">Use</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* First & Last Name */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-600">First name</label>
                  <div className="flex items-center gap-2 border rounded px-2 py-2 mt-1">
                    <BsFillPersonFill />
                    <input
                      className="outline-none w-full"
                      placeholder="First name"
                      value={ncFirstName}
                      onChange={(e) => setNcFirstName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-600">Last name</label>
                  <div className="flex items-center gap-2 border rounded px-2 py-2 mt-1">
                    <input
                      className="outline-none w-full"
                      placeholder="Last name"
                      value={ncLastName}
                      onChange={(e) => setNcLastName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Country code + number */}
              <div className="flex gap-2 items-center">
                <div className="w-36 relative">
                  <label className="text-xs text-gray-600">Country</label>
                  <button
                    className="w-full flex items-center justify-between border rounded px-2 py-2 mt-1"
                    onClick={() => setNcCountryCodeOpen(!ncCountryCodeOpen)}
                  >
                    <span>{ncCountryCode.label}</span>
                    <BsChevronDown />
                  </button>
                  {ncCountryCodeOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow z-40 max-h-40 overflow-auto">
                      {countryCodes.map((c) => (
                        <div
                          key={c.code}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                          onClick={() => {
                            setNcCountryCode(c);
                            setNcCountryCodeOpen(false);
                          }}
                        >
                          <span>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <label className="text-xs text-gray-600">Phone</label>
                  <div className="flex items-center gap-2 border rounded px-2 py-2 mt-1">
                    <BsPhone />
                    <input
                      className="outline-none w-full"
                      placeholder="Enter phone number"
                      value={ncNumber}
                      onChange={(e) => setNcNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Sync to phone row with on/off */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium">Sync contact to phone</p>
                    <p className="text-xs text-gray-500">Sync this contact with your device</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className={`px-3 py-1 rounded ${ncSyncToPhone ? "bg-green-500 text-white" : "bg-gray-200 text-black"}`}
                    onClick={() => {
                      setNcSyncToPhone(!ncSyncToPhone);
                      if (!ncSyncToPhone) {
                        setShowSyncPicker(true);
                      } else {
                        setShowSyncPicker(false);
                      }
                    }}
                  >
                    {ncSyncToPhone ? "On" : "Off"}
                  </button>
                </div>
              </div>

              {/* Save button */}
              <div className="pt-2">
                <button
                  className="w-full bg-green-600 text-white py-2 rounded font-medium"
                  onClick={handleSaveContact}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Picker Modal */}
      {showSyncPicker && (
        <div className="fixed inset-0 bg-black/40 z-60 flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-lg overflow-auto max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <button className="p-1" onClick={() => setShowSyncPicker(false)}>
                  <AiOutlineArrowLeft className="text-xl" />
                </button>
                <h3 className="font-bold text-lg">Sync to</h3>
              </div>
              <div className="text-sm text-gray-500">Select accounts to sync</div>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-600">Select which Gmail or phone to sync with:</p>

              <div className="space-y-2">
                {syncList.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between border rounded px-3 py-2">
                    <div>
                      <div className="font-medium">{acc.email}</div>
                      <div className="text-xs text-gray-500">{acc.phone}</div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          className={`w-5 h-5 rounded-full border ${acc.selectedEmail ? "bg-green-600" : "bg-white"}`}
                          onClick={() => toggleSyncEmail(acc.id)}
                        />
                        <div className="text-xs">Email</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          className={`w-5 h-5 rounded-full border ${acc.selectedPhone ? "bg-green-600" : "bg-white"}`}
                          onClick={() => toggleSyncPhone(acc.id)}
                        />
                        <div className="text-xs">Phone</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  className="px-4 py-2 rounded border"
                  onClick={() => {
                    // cancel
                    setShowSyncPicker(false);
                    setNcSyncToPhone(false);
                    setSyncList(gmailAccounts.map((g) => ({ ...g, selectedEmail: false, selectedPhone: false })));
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-green-600 text-white"
                  onClick={() => {
                    // proceed with selected sync options
                    setShowSyncPicker(false);
                    setNcSyncToPhone(true);
                    alert("Sync preferences saved.");
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Mock Modal */}
      {showQrScanner && (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <button className="p-1" onClick={() => setShowQrScanner(false)}>
                  <AiOutlineArrowLeft className="text-xl" />
                </button>
                <div>
                  <div className="font-bold">Scan code</div>
                  <div className="text-xs text-gray-500">Scan a WhatsApp QR code</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button title="Gallery" className="p-2"><BsImage /></button>
                <button title="Brightness" className="p-2"><BsBrightnessHigh /></button>
              </div>
            </div>

            <div className="p-6 flex flex-col items-center gap-4">
              <div className="w-full h-64 border rounded flex items-center justify-center text-gray-400">
                {/* Mock camera area */}
                <div className="text-center">
                  <BsCamera className="text-4xl mb-2" />
                  <div>Camera view (mock)</div>
                </div>
              </div>

              <div className="text-sm text-gray-600">My code</div>
              <div className="w-full text-center">
                <div className="border rounded p-4">[ QR CODE PLACEHOLDER ]</div>
                <div className="mt-2 text-xs text-gray-500">Scan a WhatsApp QR code</div>
              </div>

              <div className="w-full flex justify-end pt-2">
                <button className="px-4 py-2 rounded border" onClick={() => setShowQrScanner(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------
          New Group Picker Modal
          --------------------------- */}
      {showNewGroupPicker && !showGroupNameForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <button
                  className="p-1"
                  onClick={() => {
                    setShowNewGroupPicker(false);
                    setSelectedGroupContacts([]);
                    setGroupContactsSearch("");
                  }}
                >
                  <AiOutlineArrowLeft className="text-xl" />
                </button>
                <h3 className="font-bold text-lg">New Group</h3>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Search bar */}
              <div>
                <div className="relative">
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={handleGroupSearchClick}
                    aria-label="Search group contacts"
                    type="button"
                  >
                    <img src="/assets/search.png" alt="search" className="w-4 h-4 opacity-70" />
                  </button>
                  <input
                    type="text"
                    placeholder="Search contacts to add"
                    value={groupContactsSearch}
                    onChange={(e) => setGroupContactsSearch(e.target.value)}
                    className="w-full p-2 pl-10 rounded-lg bg-gray-100 outline-none text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleGroupSearchClick();
                    }}
                  />
                </div>
              </div>

              {/* Selected contacts chips */}
              <div className="flex gap-2 flex-wrap">
                {selectedGroupContacts.map((c) => (
                  <div key={c.number} className="flex items-center gap-2 bg-green-100 rounded px-2 py-1">
                    <span className="text-sm">{c.name}</span>
                    <button onClick={() => toggleSelectContactForGroup(c)}>
                      <BsX />
                    </button>
                  </div>
                ))}
              </div>

              {/* Contacts list */}
              <div className="space-y-2 max-h-56 overflow-auto">
                {availableContactsForGroup.map((c) => (
                  <div key={c.number} className="flex items-center justify-between border rounded px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">{c.name[0]}</div>
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-gray-500">{c.number}</div>
                      </div>
                    </div>
                    <div>
                      <button
                        className="px-3 py-1 rounded bg-gray-200"
                        onClick={() => toggleSelectContactForGroup(c)}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Next */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  className="px-4 py-2 rounded border"
                  onClick={() => {
                    setSelectedGroupContacts([]);
                    setShowNewGroupPicker(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-green-600 text-white"
                  onClick={proceedToGroupName}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------
          Group Name & Settings Form
          --------------------------- */}
      {showGroupNameForm && (
        <div className="fixed inset-0 bg-black/40 z-60 flex items-start justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <button
                  className="p-1"
                  onClick={() => {
                    setShowGroupNameForm(false);
                  }}
                >
                  <AiOutlineArrowLeft className="text-xl" />
                </button>
                <h3 className="font-bold text-lg">New Group</h3>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-600">Group name</label>
                <input
                  className="w-full border rounded px-3 py-2 mt-1 outline-none"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              {/* Disappearing messages */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Disappearing messages</div>
                    <div className="text-xs text-gray-500">Choose message timer</div>
                  </div>
                  <div>
                    <button
                      className="px-3 py-1 rounded bg-gray-200"
                      onClick={() => setDisappearSettingOpen(!disappearSettingOpen)}
                    >
                      {disappearTimer === "off" ? "Off" : disappearTimer}
                    </button>
                  </div>
                </div>

                {disappearSettingOpen && (
                  <div className="mt-2 flex gap-2">
                    <button className={`px-3 py-1 rounded ${disappearTimer === "24h" ? "bg-green-600 text-white" : "bg-gray-200"}`} onClick={() => setDisappearTimer("24h")}>24 hours</button>
                    <button className={`px-3 py-1 rounded ${disappearTimer === "7d" ? "bg-green-600 text-white" : "bg-gray-200"}`} onClick={() => setDisappearTimer("7d")}>7 days</button>
                    <button className={`px-3 py-1 rounded ${disappearTimer === "90d" ? "bg-green-600 text-white" : "bg-gray-200"}`} onClick={() => setDisappearTimer("90d")}>90 days</button>
                    <button className={`px-3 py-1 rounded ${disappearTimer === "off" ? "bg-green-600 text-white" : "bg-gray-200"}`} onClick={() => setDisappearTimer("off")}>Off</button>
                  </div>
                )}
              </div>

              {/* Group permissions */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Group permissions</div>
                    <div className="text-xs text-gray-500">Edit who can do what</div>
                  </div>
                  <div>
                    <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setGroupPermissionsOpen(!groupPermissionsOpen)}>
                      {groupPermissionsOpen ? "Close" : "Open"}
                    </button>
                  </div>
                </div>

                {groupPermissionsOpen && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div><BsFillPersonFill /></div>
                        <div>
                          <div className="text-sm">Edit group settings</div>
                        </div>
                      </div>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={permissions.editSettings} onChange={() => setPermissions({ ...permissions, editSettings: !permissions.editSettings })} />
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>Send new messages</div>
                      <input type="checkbox" checked={permissions.sendMessages} onChange={() => setPermissions({ ...permissions, sendMessages: !permissions.sendMessages })} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>Add other members</div>
                      <input type="checkbox" checked={permissions.addMembers} onChange={() => setPermissions({ ...permissions, addMembers: !permissions.addMembers })} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>Invite via link or QR code</div>
                      <input type="checkbox" checked={permissions.inviteViaLink} onChange={() => setPermissions({ ...permissions, inviteViaLink: !permissions.inviteViaLink })} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>Approve new members</div>
                      <input type="checkbox" checked={permissions.approveMembers} onChange={() => setPermissions({ ...permissions, approveMembers: !permissions.approveMembers })} />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded border"
                  onClick={() => {
                    setShowGroupNameForm(false);
                  }}
                >
                  Back
                </button>
                <button
                  className="px-4 py-2 rounded bg-green-600 text-white"
                  onClick={handleCreateGroup}
                >
                  Create Group
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}