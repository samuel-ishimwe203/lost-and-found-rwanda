import React, { useState } from 'react'

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])

  const handleSearch = async (e) => {
    e.preventDefault()
    // Implement search logic
  }

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-4">Search Items</h2>
      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for items..."
          className="w-full px-4 py-2 border border-gray-300 rounded"
        />
        <button type="submit" className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">
          Search
        </button>
      </form>
      {/* Search results */}
    </div>
  )
}
