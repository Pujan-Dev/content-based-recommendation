import { useEffect, useState } from 'react'
import { Routes, Route, Navigate,  } from 'react-router-dom'
import axios from 'axios'
import LoginPage from './pages/LoginPage'
import InterestsPage from './pages/InterestsPage'
import CreatePostPage from './pages/CreatePostPage'
import EditPostPage from './pages/EditPostPage'
import FeedPage from './pages/FeedPage'
import PostDetailPage from './pages/PostDetailPage'
import useAuthStore from './lib/zustand'

function App() {
  const [isLoading, setIsLoading] = useState(true)
 
  const {authState, setAuthState} = useAuthStore()

  useEffect(() => {
    const checkAuth = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/backend/home`,
                { withCredentials: true }
                )
                if (res.data.success) {
                    setAuthState({
                        isLoggedIn: true,
                        hasInterests: !res.data.requiresCategory,
                        userId: res.data.user?._id 
                    })
                }
            } catch (err) {
                setAuthState({ isLoggedIn: false, hasInterests: false })
            } finally {
                setIsLoading(false)
            }
        }
        checkAuth()
    }, [])


  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          authState.isLoggedIn && authState.hasInterests ? (
            <Navigate to="/feed" replace />
          ) : authState.isLoggedIn && !authState.hasInterests ? (
            <Navigate to="/interests" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/interests"
        element={
          !authState.isLoggedIn ? (
            <Navigate to="/" replace />
          ) : authState.hasInterests ? (
            <Navigate to="/feed" replace />
          ) : (
            <InterestsPage />
          )
        }
      />
      <Route
        path="/feed"
        element={
          !authState.isLoggedIn ? (
            <Navigate to="/" replace />
          ) : !authState.hasInterests ? (
            <Navigate to="/interests" replace />
          ) : (
            <FeedPage />
          )
        }
      />
      <Route
        path="/post/:postId"
        element={
          !authState.isLoggedIn ? (
            <Navigate to="/" replace />
          ) : (
            <PostDetailPage />
          )
        }
      />
      <Route
        path="/create-post"
        element={
          !authState.isLoggedIn ? (
            <Navigate to="/" replace />
          ) : (
            <CreatePostPage />
          )
        }
      />
      <Route
        path="/edit-post/:postId"
        element={
        !authState.isLoggedIn ? (
            <Navigate to="/" replace />
        ) : (
            <EditPostPage />
          )
        }
      />
    </Routes>
    
  )
}

export default App
