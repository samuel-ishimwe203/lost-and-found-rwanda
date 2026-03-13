import React, { useState, useEffect, useRef } from "react"
import { Loader2, MessageCircle, Send, Trash } from "lucide-react"
import apiClient from "../../services/api"
import { useAuth } from "../../context/AuthContext"

export default function LostMessages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const markedAsReadRef = useRef(new Set())

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (messages.length > 0 && selectedConversation) scrollToBottom()
  }, [messages.length])

  const scrollToBottom = () => {
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
  }

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/messages')
      const allMessages = response.data.data || []
      if (!user?.id) return

      // Deduplicate and group as conversations
      const conversationMap = new Map()
      allMessages.forEach(msg => {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        const otherUserName = msg.sender_id === user.id ? msg.receiver_name : msg.sender_name
        const otherUserEmail = msg.sender_id === user.id ? msg.receiver_email : msg.sender_email
        const convKey = msg.match_id || `user_${otherUserId}`
        if (!conversationMap.has(convKey)) {
          conversationMap.set(convKey, {
            id: convKey,
            match_id: msg.match_id,
            other_user: otherUserName,
            other_user_id: otherUserId,
            other_user_email: otherUserEmail,
            last_message: msg.message,
            last_message_time: msg.created_at,
            unread_count: 0,
            messages: []
          })
        }
        const conv = conversationMap.get(convKey)
        conv.messages.push(msg)
        if (!msg.is_read && msg.receiver_id === user.id) conv.unread_count++
        if (new Date(msg.created_at) > new Date(conv.last_message_time)) {
          conv.last_message = msg.message
          conv.last_message_time = msg.created_at
        }
      })
      const convArray = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time))
      setConversations(convArray)
      if (selectedConversation) {
        const updatedConv = convArray.find(c => c.id === selectedConversation.id)
        if (updatedConv) setMessages(updatedConv.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)))
      }
      setError(null)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages')
      setLoading(false)
    }
  }

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation)
    setMessages(conversation.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)))
    setTimeout(() => scrollToBottom(), 100)
    const unreadMessages = conversation.messages.filter(
      msg => !msg.is_read && msg.receiver_id === user.id && !markedAsReadRef.current.has(msg.id)
    )
    if (unreadMessages.length > 0) {
      await Promise.all(unreadMessages.map(msg =>
        apiClient.patch(`/messages/${msg.id}/read`).then(() => markedAsReadRef.current.add(msg.id))
      ))
      window.dispatchEvent(new CustomEvent('messagesRead'))
    }
    setConversations(conversations.map(conv =>
      conv.id === conversation.id ? { ...conv, unread_count: 0 } : conv
    ))
  }

  const handleSendReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || !selectedConversation || sending) return
    try {
      setSending(true)
      await apiClient.post('/messages/reply', {
        receiver_id: selectedConversation.other_user_id,
        message: replyText,
        match_id: selectedConversation.match_id
      })
      setReplyText("")
      fetchConversations()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return "?"
    const parts = name.trim().split(" ")
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  const getAvatarColor = (name) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500']
    const index = (name?.charCodeAt(0) || 0) % colors.length
    return colors[index]
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const shouldShowDateSeparator = (currentMsg, prevMsg) => {
    if (!prevMsg) return true
    return new Date(currentMsg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString()
  }

  const formatDateSeparator = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const getMessageStatus = (msg) => {
    if (msg.sender_id !== user.id) return null
    if (msg.is_read) return <span className="text-blue-500 text-sm ml-1 font-bold">✓✓</span>
    return <span className="text-gray-400 text-sm ml-1">✓✓</span>
  }

  if (loading && conversations.length === 0)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 bg-green-600 text-white flex-shrink-0">
          <h2 className="text-xl font-semibold">Messages</h2>
          <p className="text-sm text-green-100">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No messages yet</p>
              <p className="text-sm mt-2">When someone messages you about a match, it will appear here</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conv.id ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-12 h-12 rounded-full ${getAvatarColor(conv.other_user)} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                    {getInitials(conv.other_user)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conv.other_user}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTime(conv.last_message_time)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {conv.last_message}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <div className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {conv.unread_count}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedConversation ? (
          <>
            <div className="bg-green-600 text-white p-4 shadow-sm flex items-center space-x-3 flex-shrink-0">
              <div className={`w-10 h-10 rounded-full ${getAvatarColor(selectedConversation.other_user)} flex items-center justify-center font-semibold`}>
                {getInitials(selectedConversation.other_user)}
              </div>
              <div>
                <h3 className="font-semibold">{selectedConversation.other_user}</h3>
                <p className="text-xs text-green-100">Online</p>
              </div>
            </div>
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, index) => {
                const isOwnMessage = msg.sender_id === user.id
                const showDateSeparator = shouldShowDateSeparator(msg, messages[index - 1])
                return (
                  <div key={msg.id}>
                    {showDateSeparator && (
                      <div className="flex justify-center my-4">
                        <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-600 shadow-sm">
                          {formatDateSeparator(msg.created_at)}
                        </span>
                      </div>
                    )}
                    <div className={`flex items-end space-x-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      {!isOwnMessage && (
                        <div className={`w-8 h-8 rounded-full ${getAvatarColor(msg.sender_name)} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                          {getInitials(msg.sender_name)}
                        </div>
                      )}
                      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                        {!isOwnMessage && (
                          <p className="text-xs text-gray-600 mb-1 ml-1">{msg.sender_name}</p>
                        )}
                        <div className={`rounded-lg px-4 py-2 ${isOwnMessage ? 'bg-green-600 text-white' : 'bg-white text-gray-900 shadow-sm'}`}>
                          <p className="break-words">{msg.message}</p>
                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <span className={`text-xs ${isOwnMessage ? 'text-green-100' : 'text-gray-500'}`}>{formatMessageTime(msg.created_at)}</span>
                            {getMessageStatus(msg)}
                          </div>
                        </div>
                      </div>
                      {isOwnMessage && (
                        <div className={`w-8 h-8 rounded-full ${getAvatarColor(user.full_name)} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 order-2`}>
                          {getInitials(user.full_name)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sending}
                  className="bg-green-600 text-white rounded-full p-3 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  {sending ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <MessageCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-2">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}