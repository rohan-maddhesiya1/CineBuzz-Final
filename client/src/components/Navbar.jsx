import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, SearchIcon, TicketPlus, XIcon, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAppContext } from '../context/AppContext'

const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { favoriteMovies } = useAppContext()

  const [membership, setMembership] = useState(null)

  const formatDate = (date) => {
    if (!date) return "N/A";
    const utcDate = new Date(date);
    const year = utcDate.getUTCFullYear();
    const month = utcDate.getUTCMonth();
    const day = utcDate.getUTCDate();
    const safeDate = new Date(Date.UTC(year, month, day));
    return safeDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${import.meta.env.VITE_BASE_URL}api/membership/status`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMembership(data.membership);
        }
      })
  }, [user]);

  const handleLogin = () => navigate('/login');

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  };

  return (
    <div className='fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5'>
      <Link to='/' className='max-md:flex-1'>
        <img src={assets.logo} alt="" className='w-36 h-auto' />
      </Link>

      <div className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-8 min-md:px-8 py-3 max-md:h-screen min-md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/20 overflow-hidden transition-[width] duration-300 ${isOpen ? 'max-md:w-full' : 'max-md:w-0'}`}>

        <XIcon className='md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer'
          onClick={() => setIsOpen(!isOpen)}
        />

        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/'>Home</Link>
        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/movies'>Movies</Link>
        

        {(!user || (user.role === "user" && !membership?.isMember)) && (
          <Link onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/subscription'>
            Subscription
          </Link>
        )}

        {favoriteMovies.length > 0 && (
          <Link onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/favorite'>
            Favorites
          </Link>
        )}
      </div>

      <div className='flex items-center gap-8'>
        <SearchIcon className='max-md:hidden w-6 h-6 cursor-pointer' />

        {!user ? (
          <button onClick={handleLogin}
            className='px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>
            Login
          </button>
        ) : (
          <div className='relative'>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className='flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 transition rounded-full'
            >
              <User className='w-5 h-5' />

              <span className='max-sm:hidden flex items-center gap-1'>
                {user.name}

                {membership?.isMember && (
                  <span className='text-sm font-semibold'>
                    {membership.membershipType?.trim().toLowerCase() === "gold" && (
                      <span className="text-yellow-400">⭐</span>
                    )}
                    {membership.membershipType?.trim().toLowerCase() === "silver" && (
                      <span className="text-slate-300">⭐</span>
                    )}
                  </span>
                )}
              </span>
            </button>

            {showUserMenu && (
              <div className='absolute right-0 top-12 w-60 bg-black/90 backdrop-blur border border-gray-300/20 rounded-lg py-2 z-50'>

                <div className='px-4 py-3 border-b border-white/10'>
                  {user.role === "user" ? (
                    membership?.isMember ? (
                      <div>
                        <p className={`font-semibold flex items-center gap-1 ${
                          membership.membershipType?.trim().toLowerCase() === "gold"
                            ? "text-yellow-400"
                            : "text-slate-300"
                        }`}>
                          ⭐ Membership: {membership.membershipType}
                        </p>

                        <p className='text-gray-300 text-sm flex items-center gap-1'>
                          ⏳ Expires: {formatDate(membership.membershipEnd)}
                        </p>
                      </div>
                    ) : (
                      <p className='text-red-400 font-semibold'>❗ No Active Membership</p>
                    )
                  ) : (
                    <p className='text-yellow-400 font-semibold'>👑 Admin Panel</p>
                  )}
                </div>

                <button
                  onClick={() => { navigate('/my-bookings'); setShowUserMenu(false) }}
                  className='w-full px-4 py-2 text-left hover:bg-white/10 transition flex items-center gap-2'
                >
                  <TicketPlus width={15} />
                  My Bookings
                </button>

                {user.role === "user" && membership?.isMember && (
                  <button
                    onClick={() => { navigate('/subscription'); setShowUserMenu(false) }}
                    className='w-full px-4 py-2 text-left hover:bg-white/10 transition flex items-center gap-2 text-yellow-300'
                  >
                    🔄 Subscription
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className='w-full px-4 py-2 text-left hover:bg-white/10 transition flex items-center gap-2 text-red-400'
                >
                  <LogOut width={15} />
                  Logout
                </button>

              </div>
            )}
          </div>
        )}
      </div>

      <MenuIcon
        className='max-md:ml-4 md:hidden w-8 h-8 cursor-pointer'
        onClick={() => setIsOpen(!isOpen)}
      />

    </div>
  )
}

export default Navbar
