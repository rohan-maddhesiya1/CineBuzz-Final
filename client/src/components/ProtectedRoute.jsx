// src/components/ProtectedRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, adminOnly = false }) => {

  const { user, isAdmin, loading } = useAuth()

  const isLoading = loading ?? false

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-gray-400'>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-white mb-4'>Access Denied</h2>
          <p className='text-gray-400 mb-6'>You need admin privileges to access this area.</p>
          <button 
            onClick={() => window.location.href = '/'} 
            className='px-6 py-3 bg-primary hover:bg-primary-dull transition rounded-lg font-medium text-white'
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
