"use client";

export default function TemplateButton({ contact }) {
  const sendTemplate = async () => {
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json', // ✅ ADD THIS HEADER
        },
        body: JSON.stringify({ 
          toNumber: contact.number, // ✅ CHANGE 'to' TO 'toNumber'
          templateName: "hello_world" // ✅ ADD TEMPLATE NAME
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
      className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
    >
      Send Template
    </button>
  );
}