import { useState } from "react";
import "./App.css";
import {
  GoogleOAuthProvider,
  GoogleLogin,
} from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const navigate = useNavigate();

  // === Manual login ===
  const handleLogin = async () => {
    if (!username || !password) {
      setMessage("Please fill in all fields");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");
    
    try {
      const { data } = await axios.post("/api/login", {
        username,
        password,
      });

      if (data.success) {
        localStorage.setItem("fullname", data.fullname);
        localStorage.setItem("role", data.role);
        setMessage("Login successful! Redirecting...");
        setMessageType("success");

        setTimeout(() => {
          if (data.role === "admin") {
            window.location.href = "/dashboard";
          } else {
            window.location.href = "/guestdashboard";
          }
        }, 1000);
      } else {
        setMessage(data.message || "Invalid credentials");
        setMessageType("error");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setMessage(error.response?.data?.message || "Server error. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // === Google login ===
  const handleGoogleLogin = async (credentialResponse: any) => {
    setIsLoading(true);
    setMessage("");
    
    try {
      if (!credentialResponse.credential) {
        setMessage("No Google credentials found");
        setMessageType("error");
        setIsLoading(false);
        return;
      }

      const res = await axios.post("/api/google-login", {
        token: credentialResponse.credential,
      });

      if (res.data.success) {
        localStorage.setItem("fullname", res.data.fullname);
        localStorage.setItem("role", res.data.role.toLowerCase());

        setMessage("Google login successful! Redirecting...");
        setMessageType("success");

        setTimeout(() => {
          if (res.data.role.toLowerCase() === "admin") {
            window.location.href = "/dashboard";
          } else {
            window.location.href = "/guestdashboard";
          }
        }, 1000);
      } else {
        setMessage(res.data.message || "Google login failed");
        setMessageType("error");
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      setMessage(err.response?.data?.message || "Google login failed");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <GoogleOAuthProvider clientId="1016616466017-03fsmris44cv89qnelaed641obt80dmh.apps.googleusercontent.com">
      <div className="login-page-new">
        {/* Animated Background */}
        <div className="login-bg-pattern">
          <div className="bg-blob blob-1"></div>
          <div className="bg-blob blob-2"></div>
          <div className="bg-blob blob-3"></div>
        </div>

        {/* Centered Content */}
        <div className="login-center-container">
          {/* Logo and Title Section */}
          <div className="login-hero-section">
            <div className="hero-logo-wrapper">
              <div className="hero-logo">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
            </div>
            <h1 className="hero-title">VolunteerLog</h1>
            <p className="hero-subtitle">Track your volunteer hours with ease</p>
          </div>

          {/* Login Card */}
          <div className="login-card-new">
            <div className="card-header-new">
              <h2>Sign In</h2>
              <p>Enter your credentials to continue</p>
            </div>

            {message && (
              <div className={`alert-box-new ${messageType}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {messageType === "success" ? (
                    <polyline points="20 6 9 17 4 12"></polyline>
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </>
                  )}
                </svg>
                <span>{message}</span>
              </div>
            )}

            <div className="form-fields-new">
              <div className="field-wrapper-new">
                <label className="field-label-new">Username</label>
                <div className="input-wrapper-new">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className={message && messageType === "error" && !username ? "input-error-new" : ""}
                  />
                </div>
              </div>

              <div className="field-wrapper-new">
                <label className="field-label-new">Password</label>
                <div className="input-wrapper-new">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className={message && messageType === "error" && !password ? "input-error-new" : ""}
                  />
                </div>
              </div>
            </div>

            <button 
              className="login-button-new" 
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="btn-loader-new">
                  <span className="loader-spinner-new"></span>
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>

            <div className="divider-new">
              <span>or</span>
            </div>

            <div className="google-auth-new">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  setMessage("Google login failed");
                  setMessageType("error");
                }}
                useOneTap
              />
            </div>

            <div className="card-footer-new">
              <p>
                Don't have an account?{" "}
                <button className="link-button-new" onClick={() => navigate("/register")}>
                  Sign up here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
