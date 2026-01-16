import React, { useState } from "react";

export default function Messages() {
  const [messages] = useState([
    {
      id: 1,
      senderName: "Marie Uwimana",
      senderAvatar: "MU",
      message: "I found an item matching your National ID Card description at Kimironko Market!",
      timestamp: "2024-01-15 10:30 AM",
      unread: true,
      itemRelated: "National ID Card",
      phone: "+250799123456",
    },
    {
      id: 2,
      senderName: "Pierre Nkurunziza",
      senderAvatar: "PN",
      message: "Can you provide more details about the exact location where you lost your Passport?",
      timestamp: "2024-01-14 03:45 PM",
      unread: true,
      itemRelated: "Rwandan Passport",
      phone: "+250798765432",
    },
    {
      id: 3,
      senderName: "Lost & Found Support",
      senderAvatar: "LF",
      message: "Your National ID Card posting has been successfully published and is visible to finders",
      timestamp: "2024-01-13 08:20 AM",
      unread: false,
      itemRelated: "System",
      phone: "N/A",
    },
    {
      id: 4,
      senderName: "Francoise Habimana",
      senderAvatar: "FH",
      message: "I have information about your Driving License. Can we discuss the reward?",
      timestamp: "2024-01-12 02:15 PM",
      unread: false,
      itemRelated: "Driving License",
      phone: "+250787654321",
    },
    {
      id: 5,
      senderName: "Jean Baptiste",
      senderAvatar: "JB",
      message: "Found something similar to your Bank ATM Card description near Nyabugogo",
      timestamp: "2024-01-11 05:00 PM",
      unread: false,
      itemRelated: "Bank ATM Card",
      phone: "+250799876543",
    },
  ]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold text-green-900">Messages</h1>
        <p className="text-green-700 mt-2">
          Communicate with potential finders and users
        </p>
      </div>

      {/* MESSAGES LIST */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-green-200">
        <div className="divide-y divide-green-100">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-6 hover:bg-green-50 cursor-pointer transition ${
                msg.unread ? "bg-green-50/50 border-l-4 border-green-500" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* AVATAR */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-600 to-emerald-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg">
                  {msg.senderAvatar}
                </div>

                {/* MESSAGE CONTENT */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-green-900 text-lg">
                        {msg.senderName}
                      </h3>
                      <p className="text-green-700 text-sm mt-2">{msg.message}</p>
                      
                      {/* Additional Info */}
                      <div className="flex gap-4 mt-3 text-xs text-green-600">
                        {msg.itemRelated !== "System" && (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">Item:</span>
                            <span className="bg-green-50 px-2 py-1 rounded border border-green-300">{msg.itemRelated}</span>
                          </div>
                        )}
                        {msg.phone !== "N/A" && (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">Phone:</span>
                            <span className="text-green-900 font-bold">{msg.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {msg.unread && (
                      <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold flex-shrink-0 shadow-lg animate-pulse">
                        🔔 NEW
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <p className="text-green-500 text-xs">{msg.timestamp}</p>
                    <div className="flex gap-2">
                      <button className="text-green-600 hover:text-green-800 font-semibold text-xs border border-green-300 px-2 py-1 rounded bg-green-50 hover:bg-green-100">
                        Reply
                      </button>
                      <button className="text-green-600 hover:text-green-800 font-semibold text-xs border border-green-300 px-2 py-1 rounded bg-green-50 hover:bg-green-100">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REPLY SECTION */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-200">
        <h2 className="text-lg font-bold text-green-900 mb-4">Reply to Message</h2>

        <textarea
          placeholder="Type your reply here..."
          rows="4"
          className="w-full px-4 py-2 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-green-400 mb-4"
        ></textarea>

        <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg">
          Send Reply
        </button>
      </div>
    </div>
  );
}
