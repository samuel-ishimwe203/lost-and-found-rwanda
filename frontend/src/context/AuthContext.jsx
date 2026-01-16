// import React, { createContext, useContext, useState } from 'react'

// const AuthContext = createContext()

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null)
//   const [isAuthenticated, setIsAuthenticated] = useState(false)

//   const login = async (credentials) => {
//     // Login logic
//   }

//   const logout = () => {
//     setUser(null)
//     setIsAuthenticated(false)
//   }

//   return (
//     <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   return useContext(AuthContext)
// }
