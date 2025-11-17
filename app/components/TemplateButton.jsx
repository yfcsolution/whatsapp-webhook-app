"use client";

export default function TemplateButton({ contact }) {
  const sendTemplate = async () => {
    const res = await fetch("/api/send", {
      method: "POST",
      body: JSON.stringify({ to: contact.number })
    });
    const data = await res.json();
    alert(JSON.stringify(data));
  };

  return (
    <button
      onClick={sendTemplate}
      className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
    >
      Send Template
    </button>
  );
}
