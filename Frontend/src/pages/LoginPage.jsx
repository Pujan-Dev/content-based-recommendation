import { useState } from "react";
import {
  Eye,
  EyeOff,
  Sparkles,
  BarChart3,
  Brain,
  TrendingUp,
} from "lucide-react";
import useAuthStore from "../lib/zustand";
import { useNavigate } from "react-router-dom";
import { login, signup } from "../config/backendconnect";

export default function LoginPage() {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");

  const { setAuthState } = useAuthStore();
  const navigate = useNavigate();

const handleLogin = () => {
    setAuthState({ isLoggedIn: true, hasInterests: true })
    navigate("/feed")
}


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
        setError("Please fill in all fields");
        return;
    }
    if (!email.includes("@")) {
        setError("Please enter a valid email");
        return;
    }
    if (isSignupMode && password !== confirmPassword) {
        setError("Passwords do not match");
        return;
    }
    if (isSignupMode && password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
    }
    setIsLoading(true);
    try {
        if (isSignupMode) {
            const signupData = await signup(name, email, password)
            if (signupData.success) {
                const loginData = await login(email, password)
                if (loginData.success) {
                    setAuthState({ isLoggedIn: true, hasInterests: false })
                    navigate("/interests")
                } else {
                    setError(loginData.message)
                }
            } else {
                setError(signupData.message)
            }
        } else {
            const data = await login(email, password)
            if (data.success) {
                handleLogin()
            } else {
                setError(data.message)
            }
        }
    } catch (err) {
        setError("Something went wrong. Try again!")
    } finally {
        setIsLoading(false)
    }
};

  return (
    <div className="flex min-h-screen bg-background items-center justify-center">
      
      {/* Login Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24 animate-fade-in-left">
        
        {/* Logo */}
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            GazeFlow
          </h1>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary animate-fade-in stagger-3">
            {isSignupMode ? "SIGNUP" : "LOGIN"}
          </span>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm animate-fade-in-up stagger-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {isSignupMode && (
                <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
                )}

            {/* Password */}
            <div className="relative flex flex-col gap-2">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {isSignupMode && (
              <div className="relative flex flex-col gap-2 animate-fade-in-up">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive animate-fade-in">
                {error}
              </p>
            )}

            {/* Forgot Password */}
            {!isSignupMode && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-primary font-medium text-primary-foreground shadow-md shadow-primary/25 transition-all duration-200 hover:brightness-110 disabled:opacity-70 btn-tap"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : isSignupMode ? (
                "Create Account"
              ) : (
                "Login"
              )}
            </button>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={() => {}}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card font-medium text-foreground transition-all duration-200 hover:bg-secondary btn-tap"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>

            {/* Toggle */}
            <p className="text-center text-sm text-muted-foreground">
              {isSignupMode
                ? "Already have an account? "
                : "Don't have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsSignupMode(!isSignupMode);
                  setError("");
                  setConfirmPassword("");
                }}
                className="font-semibold text-primary hover:underline"
              >
                {isSignupMode ? "SIGNIN" : "SIGNUP"}
              </button>
            </p>

          </form>
        </div>
      </div>

    </div>
  );
}