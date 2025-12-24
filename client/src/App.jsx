import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBookings from './pages/MyBookings'
import Favorite from './pages/Favorite'
import ChatBot from './components/ChatBot'  
import Login from './pages/Login'
import Register from './pages/Register'
import { Toaster } from 'react-hot-toast'
import Footer from './components/Footer'
import Layout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import AddShows from './pages/admin/AddShows'
import ListShows from './pages/admin/ListShows'
import ListBookings from './pages/admin/ListBookings'
import ProtectedRoute from './components/ProtectedRoute'
import Loading from './components/Loading'

// ⭐ Subscription Page Import
import SubscriptionPage from "./pages/SubscriptionPage";

const App = () => {

  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register'

  return (
    <>
      <Toaster />

      {/* Show Navbar on all NON admin/auth routes */}
      {!isAdminRoute && !isAuthRoute && <Navbar />}
      {!isAdminRoute && !isAuthRoute && <ChatBot />}
      {/* ⭐ FULL PAGE BACKGROUND GRADIENT WRAPPER */}
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0c] via-[#0d0d10] to-[#09090B]">

        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/movies' element={<Movies />} />
          <Route path='/movies/:id' element={<MovieDetails />} />
          <Route path='/movies/:id/:date' element={<ProtectedRoute><SeatLayout /></ProtectedRoute>} />
          <Route path='/my-bookings' element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path='/loading/:nextUrl' element={<Loading />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          <Route path='/favorite' element={<ProtectedRoute><Favorite /></ProtectedRoute>} />

          {/* ⭐ Subscription Route */}
          <Route path="/subscription" element={<SubscriptionPage />} />

          {/* Admin Routes */}
          <Route path='/admin/*' element={
            <ProtectedRoute adminOnly={true}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="add-shows" element={<AddShows />} />
            <Route path="list-shows" element={<ListShows />} />
            <Route path="list-bookings" element={<ListBookings />} />
          </Route>
        </Routes>

      </div>

      {/* Show footer on all NON admin/auth routes */}
      {!isAdminRoute && !isAuthRoute && <Footer />}
    </>
  )
}

export default App
