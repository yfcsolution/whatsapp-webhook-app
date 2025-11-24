"use client";

export default function TemplateButton({ contact, message }) {
  const sendTemplate = async () => {
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          toNumber: contact.number,
          templateName: message || "hello world", // Use custom message if provided
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(`✅ Message sent to ${contact.name || contact.number}`);
      } else {
        alert(`❌ Failed: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  return (
    <button
      onClick={sendTemplate}
      className="bg-green-700 text-white px-4 py-2 rounded-full hover:bg-green-700"
    >
      Send 
    </button>
  );
}
