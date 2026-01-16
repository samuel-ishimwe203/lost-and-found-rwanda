import React, { createContext, useContext, useState } from 'react'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const toggleNotifications = () => {
    setNotifications(!notifications)
  }

  const addNotification = (notification) => {
    setUnreadCount(unreadCount + 1)
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, toggleNotifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  return useContext(NotificationContext)
}
