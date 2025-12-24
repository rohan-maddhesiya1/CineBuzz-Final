// src/pages/Login.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { assets } from '../assets/assets'
import toast from 'react-hot-toast'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(formData.email, formData.password) // login now returns data
      toast.success('Login successful!')
      if (data.user?.role === 'admin') navigate('/admin')
      else navigate('/')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4'>
      <div className='w-full max-w-md'>
        <div className='bg-black/40 backdrop-blur-lg border border-gray-300/20 rounded-2xl p-8 shadow-2xl'>
          <div className='text-center mb-8'>
            <Link to='/'><img src={assets.logo} alt="CineBuzz" className='w-32 h-auto mx-auto mb-4'/></Link>
            <h2 className='text-2xl font-bold text-white'>Welcome Back</h2>
            <p className='text-gray-400 mt-2'>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label htmlFor="email" className='block text-sm font-medium text-gray-300 mb-2'>Email Address</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required
                className='w-full px-4 py-3 bg-white/10 border border-gray-300/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                placeholder='Enter your email' />
            </div>

            <div>
              <label htmlFor="password" className='block text-sm font-medium text-gray-300 mb-2'>Password</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required
                className='w-full px-4 py-3 bg-white/10 border border-gray-300/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                placeholder='Enter your password' />
            </div>

            <button type="submit" disabled={loading}
              className='w-full py-3 px-4 bg-primary hover:bg-primary-dull disabled:opacity-50 disabled:cursor-not-allowed transition rounded-lg font-medium text-white'>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-gray-400'>Don't have an account? <Link to='/register' className='text-primary hover:text-primary-dull transition'>Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
