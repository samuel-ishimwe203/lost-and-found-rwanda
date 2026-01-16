import React, { useState } from 'react'

export default function PostLostItem() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    date: '',
    image: null
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Submit lost item
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Post Lost Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields */}
      </form>
    </div>
  )
}
