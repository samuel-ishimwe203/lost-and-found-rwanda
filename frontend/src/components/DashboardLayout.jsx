import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen pt-[74px]">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="hidden md:block w-72 shrink-0 border-r border-slate-100 h-[calc(100vh-74px)] sticky top-[74px]">
          <Sidebar />
        </aside>
        <main className="flex-1 p-4 md:p-8 bg-slate-50/50">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
