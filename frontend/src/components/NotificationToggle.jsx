import React from 'react'
import { useNotification } from '../context/NotificationContext'

export default function NotificationToggle() {
  const { notifications, toggleNotifications } = useNotification()

  return (
    <button
      onClick={toggleNotifications}
      className={`px-4 py-2 rounded ${
        notifications
          ? 'bg-green-500 text-white'
          : 'bg-gray-300 text-gray-700'
      }`}
    >
      {notifications ? 'Notifications On' : 'Notifications Off'}
    </button>
  )
}
