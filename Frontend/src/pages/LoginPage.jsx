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

export default function LoginPage() {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { setAuthState } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = (email) => {
    localStorage.setItem(
      "postlens_user",
      JSON.stringify({ email, loggedInAt: Date.now(), isNewUser: false }),
    );
    if (!localStorage.getItem("postlens_interests")) {
      localStorage.setItem(
        "postlens_interests",
        JSON.stringify(["Photography", "Travel", "Technology"]),
      );
    }
    setAuthState({ isLoggedIn: true, hasInterests: true });
    navigate("/feed");
  };

  const handleSignup = (email) => {
    localStorage.setItem(
      "postlens_user",
      JSON.stringify({ email, loggedInAt: Date.now(), isNewUser: true }),
    );
    setAuthState({ isLoggedIn: true, hasInterests: false });
    navigate("/interests");
  };

  const handleSubmit = (e) => {
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
    setTimeout(() => {
      setIsLoading(false);
      if (isSignupMode) {
        handleSignup(email);
      } else {
        handleLogin(email);
      }
    }, 1200);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Side - Login Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24 animate-fade-in-left">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            PostLens
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

            {/* Confirm Password (Signup only) */}
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
              onClick={() => onLogin("google-user@gmail.com")}
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

            {/* Toggle Sign Up / Sign In */}
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

      {/* Right Side - Feature Showcase */}
      <div className="relative hidden w-1/2 overflow-hidden bg-secondary/50 p-12 lg:flex lg:flex-col lg:justify-center animate-fade-in-right">
        {/* Floating decorative elements */}
        <div className="absolute right-12 top-12 h-3 w-3 rounded-full bg-primary/40 animate-float" />
        <div className="absolute right-32 top-24 h-2 w-2 rounded-full bg-accent/60 animate-float-delayed" />

        {/* Badge */}
        <div className="mb-6 flex items-center gap-2 animate-fade-in stagger-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/20">
            <Sparkles className="h-3 w-3 text-accent" />
          </div>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold tracking-wider text-accent">
            SMART RECOMMENDATIONS
          </span>
        </div>

        {/* Heading */}
        <h2 className="mb-4 text-4xl font-bold leading-tight text-foreground xl:text-5xl animate-fade-in-up stagger-5">
          <span className="text-balance">{"Intelligent Content "}</span>
          <span className="text-accent">Discovery</span>
        </h2>

        {/* Description */}
        <p className="mb-8 max-w-lg text-base leading-relaxed text-muted-foreground animate-fade-in-up stagger-6">
          Our AI analyzes how you engage with content - tracking viewing
          patterns, attention duration, and preferences to deliver personalized
          post recommendations tailored just for you.
        </p>

        {/* CTA */}
        <div className="mb-10 flex items-center gap-2 text-sm font-semibold text-foreground animate-fade-in-up stagger-7">
          {"Explore Features"}
          <span className="text-lg">{"→"}</span>
        </div>

        {/* Feature Cards */}
        <div className="flex gap-4">
          <div className="flex-1 rounded-2xl border border-border bg-card p-5 animate-fade-in-up stagger-8">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Behavior Analysis
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Accuracy Level</span>
              <span className="font-mono font-semibold text-accent">97.5%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-accent animate-progress-97"
                style={{ width: 0 }}
              />
            </div>
          </div>

          <div
            className="flex-1 rounded-2xl border border-border bg-card p-5 animate-fade-in-up stagger-8"
            style={{ animationDelay: "0.9s" }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Gaze Tracking
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Active Analysis</span>
              <span className="font-mono font-semibold text-primary">24/7</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary animate-progress-85"
                style={{ width: 0 }}
              />
            </div>
          </div>
        </div>

        {/* Terminal Card */}
        <div
          className="mt-4 rounded-2xl border border-border bg-foreground p-5 animate-fade-in-up"
          style={{ animationDelay: "1s" }}
        >
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary-foreground/70" />
            <span className="text-sm font-semibold text-primary-foreground/90">
              Recommendation Engine
            </span>
            <div className="ml-auto flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
              <div className="h-2.5 w-2.5 rounded-full bg-chart-4" />
              <div className="h-2.5 w-2.5 rounded-full bg-accent" />
            </div>
          </div>
          <div className="font-mono text-xs leading-relaxed text-primary-foreground/60">
            <p className="text-primary-foreground/40">$ postlens --analyze</p>
            <p>{"User engagement: Active"}</p>
            <p className="text-accent">{"✓ Visual attention tracked"}</p>
            <p className="text-accent">{"✓ Interest patterns mapped"}</p>
            <p className="text-primary-foreground/40">{"$ _"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
