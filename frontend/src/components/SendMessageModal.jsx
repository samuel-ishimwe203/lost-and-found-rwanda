import React, { useState } from 'react';
import { sendMessage } from '../services/message.service';
import { FiSend, FiX, FiInfo, FiUser, FiMapPin, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useLanguage } from "../context/LanguageContext";

export default function SendMessageModal({ isOpen, onClose, item, isFoundItem = false }) {
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const localizedCategory = t(`categories.${item.category?.toLowerCase()}`) || item.category;
  const localizedDistrict = t(`districts.${item.district?.toLowerCase()}`) || item.district;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError(t("messages.enterMessage"));
      return;
    }

    try {
      setSending(true);
      setError('');

      if (!item.user_id) {
        setError(t("messages.operationFailed"));
        setSending(false);
        return;
      }

      const messageData = {
        receiver_id: item.user_id,
        message: message.trim()
      };

      if (isFoundItem) {
        messageData.subject = `${t("messages.subjectFound")} ${item.item_type || localizedCategory}`;
        messageData.found_item_id = item.id;
      } else {
        messageData.subject = `${t("messages.subjectMatch")} ${item.item_type || localizedCategory}`;
        messageData.lost_item_id = item.id;
      }

      await sendMessage(messageData);
      setMessage('');
      onClose();
      alert('✅ ' + t("messages.successSent"));
    } catch (err) {
      console.error('Send message error:', err);
      if (err.response?.status === 401) setError(`🔒 ${t("messages.loginRequired")}`);
      else if (err.response?.status === 403) setError(`🚫 ${t("messages.roleMismatch")}`);
      else setError(`❌ ${err.response?.data?.message || t("messages.operationFailed")}`);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl max-w-xl w-full border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-10 pt-10 pb-6 flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#10b981] text-[10px] font-black uppercase tracking-widest mb-3">
               <FiSend /> {t("messages.portal")}
            </div>
            <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">
               {isFoundItem ? t("messages.interrogateFinder") : t("messages.contactOwner")}
            </h2>
            <p className="text-gray-400 text-xs font-medium mt-1">
               {t("messages.registryNode")}: {item.item_type || localizedCategory}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all">
             <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-8">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-top-2">
              <FiAlertCircle className="shrink-0" /> {error}
            </div>
          )}

          {/* Item Brief */}
          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 grid grid-cols-2 gap-6">
             <div className="space-y-1">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{t("messages.inventoryType")}</p>
                <div className="flex items-center gap-2">
                   <FiInfo className="text-[#10b981]" />
                   <span className="text-xs font-bold text-gray-800">{item.item_type || localizedCategory}</span>
                </div>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{t("messages.zoneLocation")}</p>
                <div className="flex items-center gap-2">
                   <FiMapPin className="text-[#10b981]" />
                   <span className="text-xs font-bold text-gray-800">{localizedDistrict}</span>
                </div>
             </div>
          </div>

          {/* Message Input */}
          <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("messages.messagePayload")}</label>
               <span className="text-[9px] font-bold text-[#10b981] uppercase tracking-wider italic">{t("messages.professionalCorrespondence")}</span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isFoundItem 
                ? t("messages.placeholderFinder")
                : t("messages.placeholderOwner")
              }
              rows="5"
              className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl focus:bg-white focus:border-[#10b981] transition-all outline-none font-bold text-gray-800 text-sm placeholder-gray-300 shadow-inner"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
             <button
               type="button"
               onClick={onClose}
               className="flex-1 px-8 py-5 border border-gray-100 text-gray-400 rounded-[28px] text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all font-sans"
             >
               {t("messages.abort")}
             </button>
             <button
               type="submit"
               disabled={sending || !message.trim()}
               className="flex-[2] px-8 py-5 bg-slate-950 text-white rounded-[28px] text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#10b981] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 group/btn font-sans"
             >
               {sending ? t("messages.transmitting") : t("messages.initiateContact")}
               {!sending && <FiSend className="transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
