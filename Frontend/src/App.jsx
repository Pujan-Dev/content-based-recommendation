import { useEffect, useState } from 'react'
import { Routes, Route, Navigate,  } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import InterestsPage from './pages/InterestsPage'
import FeedPage from './pages/FeedPage'
import PostDetailPage from './pages/PostDetailPage'
import useAuthStore from './lib/zustand'

function App() {
  const [isLoading, setIsLoading] = useState(true)
 
  const {authState, setAuthState} = useAuthStore()

  useEffect(() => {
    const user = localStorage.getItem('postlens_user')
    const interests = localStorage.getItem('postlens_interests')
    setAuthState({
      isLoggedIn: !!user,
      hasInterests: !!interests,
    })
    setIsLoading(false)
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
    </Routes>
  )
}

export default App
