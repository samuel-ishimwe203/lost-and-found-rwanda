import React, { useState } from 'react';
import { sendMessage } from '../services/message.service';

export default function SendMessageModal({ isOpen, onClose, item, isFoundItem = false }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    try {
      setSending(true);
      setError('');

      // Debug: Log the item data
      console.log('Item data:', item);
      console.log('User ID:', item.user_id);

      // Check if receiver_id exists
      if (!item.user_id) {
        setError('⚠️ Cannot send message: Owner information is missing. Please try refreshing the page.');
        setSending(false);
        return;
      }

      const messageData = {
        receiver_id: item.user_id,
        message: message.trim()
      };

      // Add appropriate subject and item ID based on type
      if (isFoundItem) {
        messageData.subject = `Question about your found ${item.item_type || item.category}`;
        messageData.found_item_id = item.id;
      } else {
        messageData.subject = `Found item matching your ${item.item_type || item.category}`;
        messageData.lost_item_id = item.id;
      }

      console.log('Sending message data:', messageData);

      await sendMessage(messageData);

      alert('✅ Message sent successfully! The owner will be notified.');
      setMessage('');
      onClose();
    } catch (err) {
      console.error('Send message error:', err);
      
      // User-friendly error messages
      if (err.response?.status === 401) {
        setError('🔒 Please login to send messages. You need to be logged in to contact other users.');
      } else if (err.response?.status === 403) {
        setError(`🚫 ${err.response?.data?.message || 'You cannot send messages to users with the same role as you.'}`);
      } else if (err.response?.status === 404) {
        setError('❌ User not found. This post may have been removed.');
      } else if (err.response?.status === 400) {
        setError('⚠️ Invalid request. Please check your message and try again.');
      } else if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        setError('🌐 Network error. Please check your internet connection and try again.');
      } else if (err.message?.includes('authentication') || err.response?.data?.message?.includes('authentication')) {
        setError('🔒 Authentication error. Please logout and login again, then try sending the message.');
      } else {
        setError(`❌ ${err.response?.data?.message || 'Failed to send message. Please try again later.'}`);
      }
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {isFoundItem ? '📩 Contact Finder' : '📧 Contact Owner'}
              </h2>
              <p className="text-green-100 text-sm mt-1">
                {isFoundItem 
                  ? `Send a message about: ${item.item_type || item.category} (Found)`
                  : `Send a message about: ${item.item_type || item.category} (Lost)`
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start">
              <span className="text-xl mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Item Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-900 mb-2">
              {isFoundItem ? 'Found Item Details:' : 'Lost Item Details:'}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-green-700 font-medium">Type:</span>
                <span className="text-green-900 ml-2">{item.item_type || item.category}</span>
              </div>
              <div>
                <span className="text-green-700 font-medium">Location:</span>
                <span className="text-green-900 ml-2">{item.district}</span>
              </div>
              {item.reward_amount > 0 && (
                <div className="col-span-2">
                  <span className="text-green-700 font-medium">Reward:</span>
                  <span className="text-green-900 ml-2 font-bold">
                    {item.reward_amount.toLocaleString()} RWF
                  </span>
                </div>
              )}
              {item.contact_name && (
                <div className="col-span-2">
                  <span className="text-green-700 font-medium">Posted by:</span>
                  <span className="text-green-900 ml-2">{item.contact_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Message Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-green-900 mb-2">
              Your Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isFoundItem 
                ? "Hi, I think this might be my lost item...&#10;&#10;Can you provide more details about where you found it?&#10;&#10;My contact: [Your Phone Number]"
                : "I found an item matching your description at...&#10;&#10;Please provide more details to verify ownership.&#10;&#10;You can contact me at: [Your Phone Number]"
              }
              rows="6"
              className="w-full px-4 py-3 border border-green-300 bg-green-50 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-green-400"
              required
            />
            <p className="text-xs text-green-600 mt-2">
              💡 Tip: Include your contact information and relevant details
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {sending ? '📤 Sending...' : '✉️ Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
