import React, { useState, useEffect, useRef } from "react"
import { Loader2, MessageCircle, Send, Trash, ChevronLeft, Search, MoreVertical } from "lucide-react"
import apiClient from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { useLanguage } from "../../context/LanguageContext"

export default function LostMessages() {
  const { t } = useLanguage()
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
    const interval = setInterval(fetchConversations, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (messages.length > 0 && selectedConversation) scrollToBottom()
  }, [messages.length])

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }

  const fetchConversations = async () => {
    try {
      const response = await apiClient.get('/messages')
      const allMessages = response.data.data || []
      if (!user?.id) return

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
        if (updatedConv) {
            setMessages(updatedConv.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)))
        }
      }
      setLoading(false)
    } catch (err) {
      setError(t("messages.syncFailed"))
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
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return "?"
    return name.trim().split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now - date) / 86400000)
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 1) return t("messages.yesterday")
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' })
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  if (loading && conversations.length === 0) {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-green-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t("messages.enteringSpace")}</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden m-1">
      {/* SIDEBAR */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-slate-100`}>
        <div className="p-6 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{t("messages.title")}</h1>
            <div className="w-8 h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center text-xs font-black">
              {conversations.length}
            </div>
          </div>
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-4 w-4" />
             <input type="text" placeholder={t("messages.searchRegistry")} className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-xs font-medium focus:border-green-500 transition-all outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="p-12 text-center space-y-4 opacity-30 mt-10">
              <MessageCircle className="w-12 h-12 mx-auto" strokeWidth={1} />
              <p className="text-xs font-bold uppercase tracking-widest">{t("messages.noActiveChannels")}</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`px-6 py-5 cursor-pointer transition-all border-b border-slate-50 flex items-center gap-4 relative group
                  ${selectedConversation?.id === conv.id ? 'bg-green-50/50' : 'hover:bg-slate-50'}`}
              >
                {selectedConversation?.id === conv.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600"></div>
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg shrink-0 ${
                   ['bg-green-600', 'bg-slate-900', 'bg-emerald-700', 'bg-teal-600'][conv.other_user.length % 4]
                }`}>
                  {getInitials(conv.other_user)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-black text-slate-900 text-sm truncate uppercase tracking-tight">{conv.other_user}</h4>
                    <span className="text-[10px] font-bold text-slate-300 whitespace-nowrap">{formatTime(conv.last_message_time)}</span>
                  </div>
                  <p className={`text-[11px] truncate ${conv.unread_count > 0 ? 'font-black text-slate-900' : 'text-slate-400 font-medium'}`}>
                    {conv.last_message}
                  </p>
                </div>
                {conv.unread_count > 0 && (
                   <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow-lg">
                      {conv.unread_count}
                   </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className={`${!selectedConversation ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white overflow-hidden`}>
        {selectedConversation ? (
          <>
            {/* CHAT HEADER */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedConversation(null)} className="md:hidden p-2 text-slate-400 hover:text-slate-900">
                  <ChevronLeft />
                </button>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-md ${
                   ['bg-green-600', 'bg-slate-900', 'bg-emerald-700', 'bg-teal-600'][selectedConversation.other_user.length % 4]
                }`}>
                  {getInitials(selectedConversation.other_user)}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight leading-none mb-1">{selectedConversation.other_user}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">{t("messages.activeChannel")}</span>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 text-slate-300 hover:text-slate-900 flex items-center justify-center">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* MESSAGES BOX */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar bg-slate-50/30">
              {messages.map((msg, idx) => {
                const isMe = msg.sender_id === user.id
                const showDate = idx === 0 || new Date(msg.created_at).toDateString() !== new Date(messages[idx-1].created_at).toDateString()
                
                return (
                  <React.Fragment key={msg.id}>
                    {showDate && (
                       <div className="flex justify-center my-8">
                          <span className="px-4 py-1.5 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-300 uppercase tracking-widest shadow-sm">
                             {new Date(msg.created_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                          </span>
                       </div>
                    )}
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[70%] space-y-2 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                         <div className={`px-5 py-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${
                           isMe ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                         }`}>
                           {msg.message}
                         </div>
                         <div className="flex items-center gap-2 group">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                               {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                               <div className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-black ${msg.is_read ? 'text-green-500' : 'text-slate-200'}`}>
                                  {msg.is_read ? '✓✓' : '✓'}
                               </div>
                            )}
                         </div>
                      </div>
                    </div>
                  </React.Fragment>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* MESSAGE INPUT */}
            <div className="p-6 bg-white border-t border-slate-100">
               <form onSubmit={handleSendReply} className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-2 focus-within:border-green-500 transition-all shadow-inner">
                  <input 
                    type="text" 
                    value={replyText} 
                    onChange={e => setReplyText(e.target.value)}
                    placeholder={t("messages.typeMessage")}
                    className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm font-medium text-slate-700 placeholder:text-slate-300"
                    disabled={sending}
                  />
                  <button 
                    type="submit" 
                    disabled={!replyText.trim() || sending}
                    className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-green-600 disabled:opacity-20 transition-all shadow-xl active:scale-95"
                  >
                    {sending ? <Loader2 className="animate-spin h-4 w-4" /> : <Send size={18} />}
                  </button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
             <div className="w-20 h-20 bg-white rounded-[32px] shadow-2xl flex items-center justify-center text-slate-100 mb-8 border border-slate-50">
                <MessageCircle size={40} strokeWidth={1} />
             </div>
             <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-2 italic">{t("messages.secureRegistryChannel")}</h2>
             <p className="text-slate-400 text-xs font-medium max-w-xs leading-relaxed italic">
                {t("messages.selectConversation")}
             </p>
          </div>
        )}
      </div>
    </div>
  )
}