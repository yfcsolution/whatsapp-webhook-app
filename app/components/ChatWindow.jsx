"use client";

import { useState, useEffect, useRef } from "react";
import TemplateButton from "./TemplateButton";
import { BsSendFill, BsMicFill, BsXCircleFill } from "react-icons/bs";

export default function ChatWindow({ contact, messages, onMessageSent }) {
  const [localMessages, setLocalMessages] = useState(messages || []);
  const [customMessage, setCustomMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const chatEndRef = useRef(null);

  // 🎤 AUDIO RECORDING STATES
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  useEffect(() => {
    setLocalMessages(messages || []);
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const sendCustomMessage = async () => {
    if (!customMessage.trim() || !contact?.number || isLoading) return;

    setIsLoading(true);
    const tempMessageId = Date.now().toString();

    try {
      const tempMessage = {
        _id: tempMessageId,
        from: "system",
        to: contact.number,
        text: customMessage,
        type: "outgoing",
        messageType: "text",
        timestamp: new Date().toISOString(),
      };

      setLocalMessages((prev) => [...prev, tempMessage]);
      setCustomMessage("");

      const response = await fetch("/api/send-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: contact.number,
          message: customMessage,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Server error: ${response.status}`);

      if (onMessageSent) onMessageSent();
    } catch (err) {
      alert(`❌ ${err.message}`);
      setLocalMessages((prev) => prev.filter((msg) => msg._id !== tempMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendCustomMessage();
    }
  };

  // 🎤 START RECORDING
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        console.log("Recorded audio:", audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
    } catch {
      alert("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) mediaRecorder.stop();
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (mediaRecorder) mediaRecorder.stop();
    setIsRecording(false);
    setAudioChunks([]);
  };

  // DROPDOWN HANDLERS
  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear this chat?")) {
      setLocalMessages([]);
      alert("✅ Chat cleared");
    }
  };
  const handleBlockContact = () => {
    if (confirm(`Are you sure you want to block ${contact.name}?`)) {
      alert(`❌ ${contact.name} has been blocked`);
    }
  };
  const handleReport = () => alert(`Reported ${contact.name}`);
  const handleMute = () => alert(`Notifications muted for ${contact.name}`);
  const handleDisappearingMessages = () => alert("Disappearing messages toggled");
  const handleChatTheme = () => alert("Open chat theme picker");
  const handleMediaLinksDocs = () => alert("Showing media, links, and docs");
  const handleExportChat = () => alert("Chat exported");
  const handleAddShortcut = () => alert("Shortcut added to home screen");
  const handleSearch = () => alert("Open search in chat");

  const handleCall = () => alert(`Calling ${contact.name}...`);
  const handleVideoCall = () => alert(`Video calling ${contact.name}...`);

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-yellow-30">
        <div className="text-center text-gray-500">
          <img src="/assets/sticker.png" alt="sticker" className="w-80 h-80 mx-auto mb-2" />
          <div>Whatsapp Business on web</div>
          <div>Grow, organise and manage your business account.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white relative">
        <div>
          <span className="font-semibold text-lg">{contact.name}</span>
          <div className="text-sm text-gray-500">
            {contact.isOnline ? (
              <span className="text-green-600">Online</span>
            ) : (
              `Last seen at ${contact.lastSeen}`
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <img src="/assets/call.png" className="w-6 h-6 cursor-pointer" onClick={handleCall} />
          <img src="/assets/video.png" className="w-6 h-6 cursor-pointer" onClick={handleVideoCall} />

          {/* 3-DOT DROPDOWN */}
          <div className="relative">
            <span className="text-2xl cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)}>
              ⋮
            </span>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-lg z-50">
                <ul className="flex flex-col">
                  <li onClick={handleSearch} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Search</li>
                  <li onClick={handleReport} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Report</li>
                  <li onClick={handleBlockContact} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Block</li>
                  <li onClick={handleMute} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Mute Notifications</li>
                  <li onClick={handleDisappearingMessages} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Disappearing Messages</li>
                  <li onClick={handleChatTheme} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Chat Theme</li>
                  <li onClick={handleMediaLinksDocs} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Media, Links, and Docs</li>
                  <li onClick={handleClearChat} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Clear Chat</li>
                  <li onClick={handleExportChat} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Export Chat</li>
                  <li onClick={handleAddShortcut} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Add Shortcut</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CHAT AREA WITH BACKGROUND */}
      <div
        className="flex-1 p-4 overflow-y-auto space-y-2"
        style={{
          backgroundImage: "url('/assets/backg.png')",
          backgroundSize: "cover",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
        }}
      >
        {localMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <img src="/assets/sticker.png" className="w-20 h-20 mx-auto mb-2" />
            <div>No messages yet. Start the conversation!</div>
          </div>
        ) : (
          <>
            {localMessages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${
                  msg.type === "outgoing" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg max-w-xs break-words ${
                    msg.type === "outgoing"
                      ? "bg-green-500 text-white rounded-br-none"
                      : "bg-white border border-gray-300 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* BOTTOM BAR */}
      <div className="p-3 border-t border-gray-300 bg-white flex items-center gap-3">
        <input
          type="text"
          placeholder="Type here..."
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 border rounded-full px-4 py-2 outline-none"
        />

        {!isRecording ? (
          <BsMicFill
            onClick={startRecording}
            className="text-2xl text-gray-700 cursor-pointer hover:text-black"
          />
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-sm">Recording...</span>
            <BsXCircleFill className="text-3xl text-red-600 cursor-pointer" onClick={cancelRecording} />
            <BsMicFill className="text-2xl text-green-600 cursor-pointer" onClick={stopRecording} />
          </div>
        )}

        <BsSendFill
          className="text-3xl text-green-600 cursor-pointer"
          onClick={sendCustomMessage}
        />
        <TemplateButton contact={contact} message={customMessage} />
      </div>
    </div>
  );
}
