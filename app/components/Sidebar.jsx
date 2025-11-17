"use client";

import { useState } from "react";
import { FaComments, FaCircle, FaUsers, FaCogs, FaUser } from "react-icons/fa";
import { Tooltip } from "react-tooltip"; // optional library or custom tooltip

export default function Sidebar({ onSelect }) {
  const icons = [
    { id: "chats", icon: <FaComments />, label: "Chats" },
    { id: "status", icon: <FaCircle />, label: "Status" },
    { id: "channels", icon: <FaUsers />, label: "Channels" },
    { id: "settings", icon: <FaCogs />, label: "Settings" },
    { id: "profile", icon: <FaUser />, label: "Profile" },
  ];

  return (
    <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4">
      {icons.map((item) => (
        <div
          key={item.id}
          className="my-4 text-2xl cursor-pointer relative group"
          onClick={() => onSelect(item.id)}
        >
          {item.icon}
          <span className="absolute left-20 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
