"use client";

import { useState, useEffect, useRef } from "react";
import TemplateButton from "./TemplateButton";
import { BsSendFill, BsMicFill, BsXCircleFill } from "react-icons/bs";

export default function ChatWindow({ contact, messages, onMessageSent }) {
  const [localMessages, setLocalMessages] = useState(messages || []);
  const [customMessage, setCustomMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [pollFormOpen, setPollFormOpen] = useState(false);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [editEventFormOpen, setEditEventFormOpen] = useState(false);
  const [pollDetailsOpen, setPollDetailsOpen] = useState(false);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const chatEndRef = useRef(null);
  const plusMenuRef = useRef(null);

  // 🎤 AUDIO RECORDING STATES
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  // 📊 POLL STATES
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);

  // 📅 EVENT STATES
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventStartDate, setEventStartDate] = useState("2025-11-26");
  const [eventStartTime, setEventStartTime] = useState("23:00");
  const [eventLocation, setEventLocation] = useState("");

  // Phone number formatting function
  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    
    console.log('📞 Original phone:', phone);
    
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle different formats:
    if (cleaned.startsWith('0')) {
      // Local format: 03010813515 → 923010813515
      cleaned = '92' + cleaned.substring(1);
    } else if (cleaned.startsWith('92')) {
      // Already in correct format: 923010813515
      cleaned = cleaned;
    } else if (cleaned.startsWith('+92')) {
      // +923010813515 → 923010813515
      cleaned = cleaned.substring(1);
    } else {
      // Assume it's already in international format
      cleaned = cleaned;
    }
    
    console.log('📞 Formatted phone:', cleaned);
    return cleaned;
  };

  useEffect(() => {
    setLocalMessages(messages || []);
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  // Close plus menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target)) {
        setPlusMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🎯 NEW: Media persistence effect to prevent auto-hiding
  useEffect(() => {
    const forceMediaVisibility = () => {
      const mediaElements = document.querySelectorAll('img, video, [data-media]');
      mediaElements.forEach(el => {
        el.style.display = 'block';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
      });
    };
    
    // Run initially and set up observer for new messages
    forceMediaVisibility();
    
    const observer = new MutationObserver(forceMediaVisibility);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => observer.disconnect();
  }, [localMessages]);

  // 🟢 UPDATED: sendCustomMessage with formatted phone number
  const sendCustomMessage = async () => {
    if (!customMessage.trim() || !contact?.number || isLoading) return;

    setIsLoading(true);
    const tempMessageId = Date.now().toString();

    try {
      // Format the phone number
      const formattedNumber = formatPhoneNumber(contact.number);
      
      console.log('🔍 DEBUG - Sending message:', {
        originalNumber: contact.number,
        formattedNumber: formattedNumber,
        message: customMessage
      });

      // Create temporary message for instant UI feedback
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

      console.log("📤 Sending custom message to:", formattedNumber);
      
      // Send to API - FIXED: Using consistent API endpoint
      const response = await fetch("/api/send-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: formattedNumber, // Use formatted number
          message: customMessage,
        }),
      });

      const result = await response.json();
      console.log("📨 Custom message API response:", result);

      if (!response.ok) {
        throw new Error(result.error || `Failed to send message: ${response.status}`);
      }

      // Update message with WhatsApp ID if successful
      if (result.success) {
        setLocalMessages(prev => 
          prev.map(msg => 
            msg._id === tempMessageId 
              ? { ...msg, messageId: result.whatsappId, status: 'sent' }
              : msg
          )
        );
      }

      if (onMessageSent) onMessageSent();
    } catch (err) {
      console.error("❌ Custom message error:", err);
      alert(`❌ Failed to send message: ${err.message}`);
      // Remove failed message from UI
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

  // ➕ PLUS MENU FUNCTIONALITY - UPDATED WITH FORMATTED PHONE NUMBERS
  const handleDocumentClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const formattedNumber = formatPhoneNumber(contact.number);
        const tempMessageId = Date.now().toString();
        
        // Create temporary local message
        const tempMessage = {
          _id: tempMessageId,
          from: "system",
          to: contact.number,
          text: "",
          type: "outgoing",
          messageType: "document",
          file: file,
          fileName: file.name,
          fileSize: (file.size / 1024).toFixed(2) + " kB",
          timestamp: new Date().toISOString(),
        };

        setLocalMessages((prev) => [...prev, tempMessage]);

        try {
          // Convert file to base64 for Cloudinary upload
          const reader = new FileReader();
          reader.onload = async (event) => {
            const fileData = event.target.result;
            
            console.log("📤 Sending document to Cloudinary...");
            
            // Send to your backend API (now with Cloudinary)
            const response = await fetch("/api/send-custom", {
              method: "POST",
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                number: formattedNumber, // Use formatted number
                message: `Document: ${file.name}`,
                messageType: "document",
                fileName: file.name,
                fileData: fileData, // Base64 for Cloudinary
                mimeType: file.type
              })
            });

            const data = await response.json();
            console.log("📨 Document API response:", data);
            
            if (!response.ok) {
              throw new Error(data.error || 'Failed to send document');
            }

            // Update message with real ID from WhatsApp and Cloudinary URL
            setLocalMessages(prev => 
              prev.map(msg => 
                msg._id === tempMessageId 
                  ? { 
                      ...msg, 
                      messageId: data.whatsappId, 
                      status: 'sent',
                      mediaUrl: data.cloudinaryUrl, // Cloudinary URL
                      mediaPersistence: data.mediaPersistence // 30-day cache info
                    }
                  : msg
              )
            );

            if (onMessageSent) onMessageSent();
          };
          
          reader.readAsDataURL(file);
          
        } catch (error) {
          console.error('Error sending document:', error);
          alert(`❌ Failed to send document: ${error.message}`);
          
          // Remove failed message
          setLocalMessages(prev => prev.filter(msg => msg._id !== tempMessageId));
        }
      }
    };
    input.click();
    setPlusMenuOpen(false);
  };

  const handlePhotosVideosClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      const formattedNumber = formatPhoneNumber(contact.number);
      
      for (const file of files) {
        const tempMessageId = Date.now().toString() + Math.random();
        
        // Create temp message
        const tempMessage = {
          _id: tempMessageId,
          from: "system",
          to: contact.number,
          text: "",
          type: "outgoing",
          messageType: file.type.startsWith('image/') ? "image" : "video",
          file: file,
          fileName: file.name,
          timestamp: new Date().toISOString(),
        };

        setLocalMessages((prev) => [...prev, tempMessage]);

        try {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const fileData = event.target.result;
            
            console.log("📤 Sending media to:", formattedNumber);
            
            const response = await fetch("/api/send-custom", {
              method: "POST",
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                number: formattedNumber, // Use formatted number
                message: file.type.startsWith('image/') ? "Photo" : "Video",
                messageType: file.type.startsWith('image/') ? "image" : "video",
                fileName: file.name,
                fileSize: (file.size / 1024).toFixed(2) + " kB",
                fileData: fileData,
                mimeType: file.type
              })
            });

            const data = await response.json();
            console.log("📨 Media API response:", data);
            
            if (data.success) {
              setLocalMessages(prev => 
                prev.map(msg => 
                  msg._id === tempMessageId 
                    ? { 
                        ...msg, 
                        messageId: data.whatsappId, 
                        status: 'sent',
                        mediaPersistence: data.mediaPersistence // 30-day cache info
                      }
                    : msg
                )
              );
              if (onMessageSent) onMessageSent();
            }
          };
          
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error sending media:', error);
          alert(`❌ Failed to send media: ${error.message}`);
          setLocalMessages(prev => prev.filter(msg => msg._id !== tempMessageId));
        }
      }
    };
    input.click();
    setPlusMenuOpen(false);
  };

  const handleCameraClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      input.capture = 'environment';
    }
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const formattedNumber = formatPhoneNumber(contact.number);
        const tempMessageId = Date.now().toString();
        
        const tempMessage = {
          _id: tempMessageId,
          from: "system",
          to: contact.number,
          text: "",
          type: "outgoing",
          messageType: "image",
          file: file,
          fileName: file.name,
          timestamp: new Date().toISOString(),
        };

        setLocalMessages((prev) => [...prev, tempMessage]);

        try {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const fileData = event.target.result;
            
            console.log("📤 Sending camera image to:", formattedNumber);
            
            const response = await fetch("/api/send-custom", {
              method: "POST",
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                number: formattedNumber, // Use formatted number
                message: "Photo from camera",
                messageType: "image",
                fileName: file.name,
                fileSize: (file.size / 1024).toFixed(2) + " kB",
                fileData: fileData,
                mimeType: file.type
              })
            });

            const data = await response.json();
            console.log("📨 Camera image API response:", data);
            
            if (data.success) {
              setLocalMessages(prev => 
                prev.map(msg => 
                  msg._id === tempMessageId 
                    ? { 
                        ...msg, 
                        messageId: data.whatsappId, 
                        status: 'sent',
                        mediaPersistence: data.mediaPersistence // 30-day cache info
                      }
                    : msg
                )
              );
              if (onMessageSent) onMessageSent();
            }
          };
          
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error sending camera image:', error);
          alert(`❌ Failed to send image: ${error.message}`);
          setLocalMessages(prev => prev.filter(msg => msg._id !== tempMessageId));
        }
      }
    };
    input.click();
    setPlusMenuOpen(false);
  };

  const handleAudioClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const formattedNumber = formatPhoneNumber(contact.number);
        const tempMessageId = Date.now().toString();
        
        const tempMessage = {
          _id: tempMessageId,
          from: "system",
          to: contact.number,
          text: "",
          type: "outgoing",
          messageType: "audio",
          file: file,
          fileName: file.name,
          timestamp: new Date().toISOString(),
        };

        setLocalMessages((prev) => [...prev, tempMessage]);

        try {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const fileData = event.target.result;
            
            console.log("📤 Sending audio to:", formattedNumber);
            
            const response = await fetch("/api/send-custom", {
              method: "POST",
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                number: formattedNumber, // Use formatted number
                message: "Audio file",
                messageType: "audio",
                fileName: file.name,
                fileSize: (file.size / 1024).toFixed(2) + " kB",
                fileData: fileData,
                mimeType: file.type
              })
            });

            const data = await response.json();
            console.log("📨 Audio API response:", data);
            
            if (data.success) {
              setLocalMessages(prev => 
                prev.map(msg => 
                  msg._id === tempMessageId 
                    ? { 
                        ...msg, 
                        messageId: data.whatsappId, 
                        status: 'sent',
                        mediaPersistence: data.mediaPersistence // 30-day cache info
                      }
                    : msg
                )
              );
              if (onMessageSent) onMessageSent();
            }
          };
          
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error sending audio:', error);
          alert(`❌ Failed to send audio: ${error.message}`);
          setLocalMessages(prev => prev.filter(msg => msg._id !== tempMessageId));
        }
      }
    };
    input.click();
    setPlusMenuOpen(false);
  };

  const handleContactClick = async () => {
    const contacts = ["Laila", "CEO", "John", "Sarah"];
    const selectedContact = prompt(`Select contact to share:\n${contacts.join(', ')}`, "Laila");
    if (selectedContact && contacts.includes(selectedContact)) {
      const formattedNumber = formatPhoneNumber(contact.number);
      const tempMessageId = Date.now().toString();
      
      const tempMessage = {
        _id: tempMessageId,
        from: "system",
        to: contact.number,
        text: "",
        type: "outgoing",
        messageType: "contact",
        contactName: selectedContact,
        contactInfo: "+1 234 567 8900",
        timestamp: new Date().toISOString(),
      };

      setLocalMessages((prev) => [...prev, tempMessage]);

      try {
        console.log("📤 Sending contact to:", formattedNumber);
        
        const response = await fetch("/api/send-custom", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            number: formattedNumber, // Use formatted number
            message: `Contact: ${selectedContact}`,
            messageType: "contact",
            contactName: selectedContact,
            contactInfo: "+1 234 567 8900"
          })
        });

        const data = await response.json();
        console.log("📨 Contact API response:", data);
        
        if (data.success) {
          setLocalMessages(prev => 
            prev.map(msg => 
              msg._id === tempMessageId 
                ? { ...msg, messageId: data.whatsappId, status: 'sent' }
                : msg
            )
          );
          if (onMessageSent) onMessageSent();
        }
      } catch (error) {
        console.error('Error sending contact:', error);
        alert(`❌ Failed to send contact: ${error.message}`);
        setLocalMessages(prev => prev.filter(msg => msg._id !== tempMessageId));
      }
    }
    setPlusMenuOpen(false);
  };

  const handlePollClick = () => {
    setPollFormOpen(true);
    setPlusMenuOpen(false);
  };

  const handleEventClick = () => {
    setEventFormOpen(true);
    setPlusMenuOpen(false);
  };

  // 🎯 UPDATED: Sticker handling with media persistence
  const handleNewStickerClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const formattedNumber = formatPhoneNumber(contact.number);
        const tempMessageId = Date.now().toString();
        
        const tempMessage = {
          _id: tempMessageId,
          from: "system",
          to: contact.number,
          text: "",
          type: "outgoing",
          messageType: "sticker",
          file: file,
          fileName: file.name,
          timestamp: new Date().toISOString(),
        };

        setLocalMessages((prev) => [...prev, tempMessage]);

        try {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const fileData = event.target.result;
            
            console.log("📤 Sending sticker to:", formattedNumber);
            
            const response = await fetch("/api/send-custom", {
              method: "POST",
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                number: formattedNumber, // Use formatted number
                message: "Sticker",
                messageType: "sticker",
                fileName: file.name,
                fileSize: (file.size / 1024).toFixed(2) + " kB",
                fileData: fileData,
                mimeType: file.type
              })
            });

            const data = await response.json();
            console.log("📨 Sticker API response:", data);
            
            if (data.success) {
              setLocalMessages(prev => 
                prev.map(msg => 
                  msg._id === tempMessageId 
                    ? { 
                        ...msg, 
                        messageId: data.whatsappId, 
                        status: 'sent',
                        mediaPersistence: data.mediaPersistence // 30-day cache info
                      }
                    : msg
                )
              );
              if (onMessageSent) onMessageSent();
            }
          };
          
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error sending sticker:', error);
          alert(`❌ Failed to send sticker: ${error.message}`);
          setLocalMessages(prev => prev.filter(msg => msg._id !== tempMessageId));
        }
      }
    };
    input.click();
    setPlusMenuOpen(false);
  };

  // 📊 POLL FUNCTIONALITY
  const handleAddPollOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const handleRemovePollOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  const handlePollOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handlePollSubmit = async () => {
    if (!pollQuestion.trim()) {
      alert("Please enter a poll question");
      return;
    }
    const validOptions = pollOptions.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      alert("Please enter at least 2 poll options");
      return;
    }

    const formattedNumber = formatPhoneNumber(contact.number);
    const tempMessageId = Date.now().toString();
    
    const tempMessage = {
      _id: tempMessageId,
      from: "system",
      to: contact.number,
      text: "",
      type: "outgoing",
      messageType: "poll",
      pollData: {
        question: pollQuestion,
        options: validOptions,
        multipleAnswers: allowMultipleAnswers,
        votes: Array(validOptions.length).fill(0),
        userVotes: {
          'currentUser': [],
          'otherUsers': [
            { name: "Mana", optionIndex: 0, timestamp: new Date().toISOString() }
          ]
        }
      },
      timestamp: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, tempMessage]);

    try {
      console.log("📤 Sending poll to:", formattedNumber);
      
      const response = await fetch("/api/send-custom", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          number: formattedNumber, // Use formatted number
          message: `Poll: ${pollQuestion}`,
          messageType: "poll",
          pollData: {
            question: pollQuestion,
            options: validOptions,
            multipleAnswers: allowMultipleAnswers
          }
        })
      });

      const data = await response.json();
      console.log("📨 Poll API response:", data);
      
      if (data.success) {
        setLocalMessages(prev => 
          prev.map(msg => 
            msg._id === tempMessageId 
              ? { ...msg, messageId: data.whatsappId, status: 'sent' }
              : msg
          )
        );
        if (onMessageSent) onMessageSent();
      }
    } catch (error) {
      console.error('Error sending poll:', error);
      alert(`❌ Failed to send poll: ${error.message}`);
      setLocalMessages(prev => prev.filter(msg => msg._id !== tempMessageId));
    }

    setPollFormOpen(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
    setAllowMultipleAnswers(false);
  };

  // Handle poll voting
  const handlePollVote = (msgId, optionIndex) => {
    setLocalMessages(prev => prev.map(msg => {
      if (msg._id === msgId && msg.messageType === "poll") {
        const newVotes = [...msg.pollData.votes];
        const userVotes = { ...msg.pollData.userVotes };
        
        if (msg.pollData.multipleAnswers) {
          if (userVotes['currentUser']?.includes(optionIndex)) {
            newVotes[optionIndex] = Math.max(0, newVotes[optionIndex] - 1);
            userVotes['currentUser'] = userVotes['currentUser'].filter(i => i !== optionIndex);
          } else {
            newVotes[optionIndex] = (newVotes[optionIndex] || 0) + 1;
            userVotes['currentUser'] = [...(userVotes['currentUser'] || []), optionIndex];
          }
        } else {
          const previousVote = userVotes['currentUser']?.[0];
          if (previousVote !== undefined) {
            newVotes[previousVote] = Math.max(0, newVotes[previousVote] - 1);
          }
          newVotes[optionIndex] = (newVotes[optionIndex] || 0) + 1;
          userVotes['currentUser'] = [optionIndex];
        }

        return {
          ...msg,
          pollData: {
            ...msg.pollData,
            votes: newVotes,
            userVotes: userVotes
          }
        };
      }
      return msg;
    }));
  };

  // Handle view votes
  const handleViewVotes = (msg) => {
    setSelectedPoll(msg);
    setPollDetailsOpen(true);
  };

  // 📅 EVENT FUNCTIONALITY
  const handleEventSubmit = async () => {
    if (!eventName.trim()) {
      alert("Please enter an event name");
      return;
    }

    const formattedNumber = formatPhoneNumber(contact.number);
    const tempMessageId = Date.now().toString();
    
    const tempMessage = {
      _id: tempMessageId,
      from: "system",
      to: contact.number,
      text: "",
      type: "outgoing",
      messageType: "event",
      eventData: {
        name: eventName,
        description: eventDescription,
        startDate: eventStartDate,
        startTime: eventStartTime,
        location: eventLocation,
        attendees: 1,
        creator: "You",
        attendeesList: ["You"]
      },
      timestamp: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, tempMessage]);

    try {
      console.log("📤 Sending event to:", formattedNumber);
      
      const response = await fetch("/api/send-custom", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          number: formattedNumber, // Use formatted number
          message: `Event: ${eventName}`,
          messageType: "event",
          eventData: {
            name: eventName,
            description: eventDescription,
            startDate: eventStartDate,
            startTime: eventStartTime,
            location: eventLocation
          }
        })
      });

      const data = await response.json();
      console.log("📨 Event API response:", data);
      
      if (data.success) {
        setLocalMessages(prev => 
          prev.map(msg => 
            msg._id === tempMessageId 
              ? { ...msg, messageId: data.whatsappId, status: 'sent' }
              : msg
          )
        );
        if (onMessageSent) onMessageSent();
      }
    } catch (error) {
      console.error('Error sending event:', error);
      alert(`❌ Failed to send event: ${error.message}`);
      setLocalMessages(prev => prev.filter(msg => msg._id !== tempMessageId));
    }

    setEventFormOpen(false);
    setEventName("");
    setEventDescription("");
    setEventStartDate("2025-11-26");
    setEventStartTime("23:00");
    setEventLocation("");
  };

  // Handle edit event
  const handleEditEvent = (msg) => {
    setEditingEvent(msg);
    setEventName(msg.eventData.name);
    setEventDescription(msg.eventData.description);
    setEventStartDate(msg.eventData.startDate);
    setEventStartTime(msg.eventData.startTime);
    setEventLocation(msg.eventData.location);
    setEditEventFormOpen(true);
  };

  // Handle update event
  const handleUpdateEvent = () => {
    if (!eventName.trim()) {
      alert("Please enter an event name");
      return;
    }

    setLocalMessages(prev => prev.map(msg => {
      if (msg._id === editingEvent._id) {
        return {
          ...msg,
          eventData: {
            ...msg.eventData,
            name: eventName,
            description: eventDescription,
            startDate: eventStartDate,
            startTime: eventStartTime,
            location: eventLocation
          }
        };
      }
      return msg;
    }));

    // Add update message
    const updateMessage = {
      _id: Date.now().toString(),
      from: "system",
      to: contact.number,
      text: "",
      type: "outgoing",
      messageType: "text",
      text: `You updated ${eventName}`,
      timestamp: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, updateMessage]);

    setEditEventFormOpen(false);
    setEditingEvent(null);
    setEventName("");
    setEventDescription("");
    setEventStartDate("2025-11-26");
    setEventStartTime("23:00");
    setEventLocation("");
  };

  // Handle view event details
  const handleViewEventDetails = (msg) => {
    setSelectedEvent(msg);
    setEventDetailsOpen(true);
  };

  // 🎯 UPDATED: RENDER MESSAGE CONTENT WITH MEDIA PERSISTENCE
  const renderMessageContent = (msg) => {
    const messageType = msg.messageType || 'text';
    const pollData = msg.pollData || {};
    const eventData = msg.eventData || {};
    
    switch (messageType) {
      case "document":
        return (
          <div className="bg-white p-3 rounded-lg border border-gray-200 max-w-xs whatsapp-media" data-media="true">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-blue-600 font-bold">DOC</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{msg.fileName || "Document"}</div>
                <div className="text-xs text-gray-500">{msg.fileSize || "Unknown size"} • DOCX</div>
              </div>
            </div>
          </div>
        );

      case "image":
        return (
          <div className="max-w-xs image-container" data-media="true">
            <img 
              src={msg.file ? URL.createObjectURL(msg.file) : "/assets/default-image.png"} 
              alt={msg.fileName || "Media"}
              className="rounded-lg w-full h-auto whatsapp-media"
            />
          </div>
        );

      case "video":
        return (
          <div className="max-w-xs" data-media="true">
            <video 
              src={msg.file ? URL.createObjectURL(msg.file) : ""}
              controls
              className="rounded-lg w-full h-auto video-player whatsapp-media"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case "audio":
        return (
          <div className="bg-white p-3 rounded-lg border border-gray-200 max-w-xs whatsapp-media" data-media="true">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">▶</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Audio</div>
                <div className="text-xs text-gray-500">{msg.fileName || "Audio file"}</div>
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="bg-white p-3 rounded-lg border border-gray-200 max-w-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">C</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{msg.contactName || "Contact"}</div>
                <div className="text-xs text-gray-500">{msg.contactInfo || "+000 000 0000"}</div>
              </div>
            </div>
            <div className="text-xs text-blue-600">Message • View business</div>
          </div>
        );

      case "poll":
        const pollOptions = pollData.options || [];
        const votes = pollData.votes || Array(pollOptions.length).fill(0);
        const totalVotes = Array.isArray(votes) ? votes.reduce((a, b) => a + b, 0) : 0;
        const userVotes = pollData.userVotes?.['currentUser'] || [];
        
        return (
          <div className="bg-[#f0f0f0] p-4 rounded-lg max-w-xs border border-gray-300">
            <div className="font-medium text-sm mb-3 text-gray-800">{pollData.question || "Poll"}</div>
            
            <div className="text-xs text-gray-600 mb-3">
              {pollData.multipleAnswers ? "Select one or more" : "Select one"}
            </div>

            <div className="space-y-2 mb-3">
              {pollOptions.map((option, index) => {
                const voteCount = votes[index] || 0;
                const isSelected = userVotes.includes(index);
                
                return (
                  <div 
                    key={index} 
                    className={`p-2 rounded cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-[#d1e7dd] border border-[#0f9d58]' 
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handlePollVote(msg._id, index)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-800">{option}</span>
                      {voteCount > 0 && (
                        <span className="text-xs text-gray-600">{voteCount}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-gray-500 mb-2">{totalVotes} votes</div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">{new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })} ✓</span>
              <button 
                onClick={() => handleViewVotes(msg)}
                className="text-[#0086cc] hover:underline"
              >
                View votes
              </button>
            </div>
          </div>
        );

      case "event":
        return (
          <div className="bg-white p-3 rounded-lg border border-gray-200 max-w-xs">
            <div className="font-medium text-sm mb-2">{eventData.name || "Event"}</div>
            {eventData.description && (
              <div className="text-xs text-gray-600 mb-2">{eventData.description}</div>
            )}
            <div className="text-xs text-gray-500 mb-1">
              {eventData.startDate ? new Date(eventData.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : "Date"} • {eventData.startTime || "Time"}
            </div>
            {eventData.location && (
              <div className="text-xs text-gray-500 mb-2">{eventData.location}</div>
            )}
            <div className="text-xs text-gray-500">{eventData.attendees || 0} going</div>
            <div className="text-xs text-blue-600 mt-1 cursor-pointer" onClick={() => handleViewEventDetails(msg)}>
              Edit event
            </div>
          </div>
        );

      case "sticker":
        return (
          <div className="max-w-xs sticker-container" data-sticker="true">
            <img 
              src={msg.file ? URL.createObjectURL(msg.file) : "/assets/default-sticker.png"} 
              alt="Sticker"
              className="rounded-lg w-32 h-32 object-contain whatsapp-media"
            />
          </div>
        );

      default:
        return (
          <div className={`px-4 py-2 rounded-lg max-w-xs break-words ${
            msg.type === "outgoing"
              ? "bg-green-500 text-white rounded-br-none"
              : "bg-white border border-gray-300 rounded-bl-none"
          }`}>
            {msg.text}
          </div>
        );
    }
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
    <div className="flex-1 flex">
      {/* MAIN CHAT WINDOW */}
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
                  {renderMessageContent(msg)}
                </div>
              ))}
            </>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* BOTTOM BAR */}
        <div className="p-3 border-t border-gray-300 bg-white flex items-center gap-3 relative">
          {/* PLUS BUTTON AND MENU */}
          <div className="relative" ref={plusMenuRef}>
            <img 
              src="/assets/plus.png" 
              className="w-8 h-8 cursor-pointer hover:opacity-80"
              onClick={() => setPlusMenuOpen(!plusMenuOpen)}
              alt="Add attachment"
            />
            
            {plusMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                <div className="flex flex-col p-2">
                  {/* Document */}
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={handleDocumentClick}>
                    <img src="/assets/docs.png" className="w-8 h-8" alt="Document" />
                    <span className="text-sm">Document</span>
                  </div>
                  
                  {/* Photos & Videos */}
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={handlePhotosVideosClick}>
                    <img src="/assets/pictures.png" className="w-8 h-8" alt="Photos & Videos" />
                    <span className="text-sm">Photos & Videos</span>
                  </div>
                  
                  {/* Camera */}
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={handleCameraClick}>
                    <img src="/assets/camera.png" className="w-8 h-8" alt="Camera" />
                    <span className="text-sm">Camera</span>
                  </div>
                  
                  {/* Audio */}
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={handleAudioClick}>
                    <img src="/assets/audio.png" className="w-8 h-8" alt="Audio" />
                    <span className="text-sm">Audio</span>
                  </div>
                  
                  {/* Contact */}
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={handleContactClick}>
                    <img src="/assets/contact.png" className="w-8 h-8" alt="Contact" />
                    <span className="text-sm">Contact</span>
                  </div>
                  
                  {/* Poll */}
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={handlePollClick}>
                    <img src="/assets/poll.png" className="w-8 h-8" alt="Poll" />
                    <span className="text-sm">Poll</span>
                  </div>
                  
                  {/* Event */}
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={handleEventClick}>
                    <img src="/assets/event.png" className="w-8 h-8" alt="Event" />
                    <span className="text-sm">Event</span>
                  </div>
                  
                  {/* New Sticker */}
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={handleNewStickerClick}>
                    <img src="/assets/new sticker.png" className="w-8 h-8" alt="New Sticker" />
                    <span className="text-sm">New Sticker</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Type a message"
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

      {/* POLL DETAILS SIDEBAR */}
      {pollDetailsOpen && selectedPoll && (
        <div className="w-80 bg-white border-l border-gray-300 flex flex-col">
          {/* POLL DETAILS HEADER */}
          <div className="p-4 border-b border-gray-300">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Poll details</h2>
              <button 
                onClick={() => setPollDetailsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* POLL CONTENT */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-6">
              <div className="font-medium text-lg text-gray-800 mb-4">
                {selectedPoll.pollData.question}
              </div>

              <div className="space-y-3">
                {selectedPoll.pollData.options.map((option, index) => {
                  const voteCount = selectedPoll.pollData.votes?.[index] || 0;
                  const totalVotes = selectedPoll.pollData.votes?.reduce((a, b) => a + b, 0) || 0;
                  const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                  const isUserVoted = selectedPoll.pollData.userVotes?.['currentUser']?.includes(index);
                  const hasOtherVotes = selectedPoll.pollData.userVotes?.otherUsers?.some(user => user.optionIndex === index);

                  return (
                    <div 
                      key={index} 
                      className={`rounded-lg p-3 ${
                        isUserVoted 
                          ? 'bg-[#d1e7dd] border border-[#0f9d58]' 
                          : voteCount > 0 
                            ? 'bg-gray-100 border border-gray-300'
                            : 'bg-white border border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-medium ${
                          isUserVoted ? 'text-[#0f9d58]' : 'text-gray-800'
                        }`}>
                          {option}
                        </span>
                        <div className="flex items-center gap-2">
                          {isUserVoted && (
                            <span className="text-red-500 text-sm">✗</span>
                          )}
                          <span className={`text-sm ${
                            isUserVoted ? 'text-[#0f9d58]' : 'text-gray-600'
                          }`}>
                            {voteCount} vote{voteCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {voteCount > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                          <div 
                            className={`h-1.5 rounded-full ${
                              isUserVoted ? 'bg-[#0f9d58]' : 'bg-gray-400'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      )}

                      {/* Voter information */}
                      <div className="space-y-2 mt-2">
                        {/* Current user vote */}
                        {isUserVoted && (
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">You</span>
                            </div>
                            <span className="text-gray-500">
                              Today at {new Date().toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </span>
                          </div>
                        )}

                        {/* Other users votes */}
                        {hasOtherVotes && selectedPoll.pollData.userVotes.otherUsers
                          .filter(user => user.optionIndex === index)
                          .map((user, userIndex) => (
                            <div key={userIndex} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">{user.name}</span>
                              </div>
                              <span className="text-gray-500">
                                {new Date(user.timestamp).toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </span>
                            </div>
                          ))
                        }

                        {/* Zero votes state */}
                        {voteCount === 0 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            No votes yet
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total votes summary */}
            <div className="border-t border-gray-300 pt-4">
              <div className="text-sm text-gray-600">
                Total votes: {selectedPoll.pollData.votes?.reduce((a, b) => a + b, 0) || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EVENT DETAILS SIDEBAR */}
      {eventDetailsOpen && selectedEvent && (
        <div className="w-80 bg-white border-l border-gray-300 flex flex-col">
          {/* EVENT DETAILS HEADER */}
          <div className="p-4 border-b border-gray-300">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Event details</h2>
              <button 
                onClick={() => setEventDetailsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* EVENT CONTENT */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-6">
              <div className="font-bold text-xl text-gray-800 mb-2">
                {selectedEvent.eventData.name}
              </div>
              
              {selectedEvent.eventData.description && (
                <div className="text-sm text-gray-600 mb-4">
                  {selectedEvent.eventData.description}
                </div>
              )}

              {/* Event Details */}
              <div className="space-y-4">
                {/* Date and Time */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 text-gray-500 mt-0.5">📅</div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-800">
                      {new Date(selectedEvent.eventData.startDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedEvent.eventData.startTime}
                    </div>
                    <button className="text-[#0086cc] text-sm mt-1 hover:underline">
                      Add to calendar
                    </button>
                  </div>
                </div>

                {/* Location */}
                {selectedEvent.eventData.location && (
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 text-gray-500 mt-0.5">📍</div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-800">
                        {selectedEvent.eventData.location}
                      </div>
                      <button className="text-[#0086cc] text-sm mt-1 hover:underline">
                        View on maps
                      </button>
                    </div>
                  </div>
                )}

                {/* WhatsApp Call Link */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 text-gray-500 mt-0.5">📞</div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-800">WhatsApp call link</div>
                    <button className="text-[#0086cc] text-sm mt-1 hover:underline">
                      Join call
                    </button>
                  </div>
                </div>
              </div>

              {/* Attendees Section */}
              <div className="mt-6 pt-4 border-t border-gray-300">
                <div className="text-sm text-gray-600 mb-3">
                  {selectedEvent.eventData.attendees || 1} person responded
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-800">Going</span>
                    <span className="text-gray-600">{selectedEvent.eventData.attendees || 1} person</span>
                  </div>

                  {/* Attendees List */}
                  <div className="space-y-2">
                    {selectedEvent.eventData.attendeesList?.map((attendee, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-800">{attendee}</span>
                        <span className="text-gray-500 text-xs">
                          {attendee === "You" ? "Event creator" : "Today, 12:32 AM"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Event Button */}
            <div className="border-t border-gray-300 pt-4">
              <button 
                onClick={() => handleEditEvent(selectedEvent)}
                className="w-full py-2 bg-[#0086cc] text-white rounded-lg hover:bg-[#0077b3] transition-colors"
              >
                Edit event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POLL FORM MODAL */}
      {pollFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Create poll</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Question</label>
              <input
                type="text"
                placeholder="Ask question"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="w-full border rounded px-3 py-2 outline-none"
                maxLength={100}
              />
              <div className="text-right text-xs text-gray-500 mt-1">{pollQuestion.length}/100</div>
            </div>

            <div className="border-t mb-4"></div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Options</label>
              {pollOptions.map((option, index) => (
                <div key={index} className="flex items-center mb-2 gap-2">
                  <input
                    type="text"
                    placeholder="Add option"
                    value={option}
                    onChange={(e) => handlePollOptionChange(index, e.target.value)}
                    className="flex-1 border rounded px-3 py-2 outline-none"
                    maxLength={50}
                  />
                  {pollOptions.length > 2 && (
                    <button
                      onClick={() => handleRemovePollOption(index)}
                      className="text-red-500 text-lg"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 10 && (
                <button
                  onClick={handleAddPollOption}
                  className="text-blue-600 text-sm mt-2"
                >
                  + Add option
                </button>
              )}
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="multipleAnswers"
                checked={allowMultipleAnswers}
                onChange={(e) => setAllowMultipleAnswers(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="multipleAnswers" className="text-sm">Allow multiple answers</label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPollFormOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePollSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create Poll
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE EVENT FORM MODAL */}
      {eventFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Create event</h2>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Event name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full border rounded px-3 py-2 outline-none mb-3"
              />
              
              <input
                type="text"
                placeholder="Description (optional)"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="w-full border rounded px-3 py-2 outline-none mb-3"
              />

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Start date and time</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="flex-1 border rounded px-3 py-2 outline-none"
                  />
                  <input
                    type="time"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="flex-1 border rounded px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <button className="text-blue-600 text-sm mb-3">+ Add end time</button>

              <input
                type="text"
                placeholder="Location (optional)"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="w-full border rounded px-3 py-2 outline-none mb-2"
              />

              <div className="text-sm text-gray-600">WhatsApp call link</div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEventFormOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEventSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EVENT FORM MODAL */}
      {editEventFormOpen && editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Edit event</h2>
            
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Event name</div>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full border rounded px-3 py-2 outline-none mb-3"
              />
              
              <input
                type="text"
                placeholder="Description (optional)"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="w-full border rounded px-3 py-2 outline-none mb-3"
              />

              <div className="mb-3">
                <div className="text-sm font-medium mb-1">Start date and time</div>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="flex-1 border rounded px-3 py-2 outline-none"
                  />
                  <input
                    type="time"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="flex-1 border rounded px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <button className="text-blue-600 text-sm mb-3">+ Add end time</button>

              <input
                type="text"
                placeholder="Location (optional)"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="w-full border rounded px-3 py-2 outline-none mb-2"
              />

              <div className="text-sm text-gray-600">WhatsApp call link</div>
            </div>

            {/* Cancel Event Button */}
            <div className="mb-4">
              <button className="text-red-600 text-sm hover:underline">
                Cancel event
              </button>
              <div className="text-xs text-gray-500 mt-1">
                Attendees will be notified of your event update
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditEventFormOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEvent}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Update Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}