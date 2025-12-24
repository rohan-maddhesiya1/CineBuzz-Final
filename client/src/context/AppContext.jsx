// src/context/AppContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export const AppContext = createContext()

export const AppProvider = ({ children })=>{

    const [isAdmin, setIsAdmin] = useState(null) // null = still checking
    const [shows, setShows] = useState([])
    const [favoriteMovies, setFavoriteMovies] = useState([])

    const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

    const { user, axios, getToken } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const fetchIsAdmin = useCallback(async ()=>{
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/admin/is-admin', { headers: { Authorization: `Bearer ${token}` }})
            setIsAdmin(data.isAdmin)

            if(!data.isAdmin && location.pathname.startsWith('/admin')){
                navigate('/')
                toast.error('You are not authorized to access admin dashboard')
            }
        } catch (error) {
            console.error("fetchIsAdmin error:", error)
            setIsAdmin(false)
        }
    }, [axios, getToken, location.pathname, navigate])

    const fetchShows = useCallback(async ()=>{
        try {
            const { data } = await axios.get('/api/show/all')
            if(data.success){
                setShows(data.shows)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.error("fetchShows error:", error)
        }
    }, [axios])

    const fetchFavoriteMovies = useCallback(async ()=>{
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/user/favorites', { headers: { Authorization: `Bearer ${token}` }})
            if(data.success){
                setFavoriteMovies(data.movies)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.error("fetchFavoriteMovies error:", error)
        }
    }, [axios, getToken])

    useEffect(()=>{
        fetchShows()
    },[fetchShows])

    useEffect(()=>{
        if(user){
            fetchIsAdmin()
            fetchFavoriteMovies()
        } else {
            // user logged out: reset admin and favorites
            setIsAdmin(false)
            setFavoriteMovies([])
        }
    },[user, fetchIsAdmin, fetchFavoriteMovies])

    const value = {
        axios,
        fetchIsAdmin,
        user, getToken, navigate, isAdmin, shows, 
        favoriteMovies, fetchFavoriteMovies, image_base_url
    }

    return (
        <AppContext.Provider value={value}>
            { children }
        </AppContext.Provider>
    )
}

export const useAppContext = ()=> useContext(AppContext)
