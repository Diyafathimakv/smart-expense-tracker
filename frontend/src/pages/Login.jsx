import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { toast } from "react-toastify"
import "./Auth.css"

function FieldError({ message }) {
  if (!message) return null
  return <span className="field-error">⚠ {message}</span>
}

function Login() {
  const [email,        setEmail]        = useState("")
  const [password,     setPassword]     = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [errors,       setErrors]       = useState({})

  const navigate  = useNavigate()
  const location  = useLocation()

  // Pre-fill email coming from Register redirect
  useEffect(() => {
    if (location.state?.email) setEmail(location.state.email)
  }, [location])

  // ─── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!email.includes("@") || !email.includes("."))
      e.email = "Enter a valid email address"
    if (password.length < 1)
      e.password = "Please enter your password"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const clearError = (field) => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }))
  }

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const response = await fetch(
        "https://expense-tracker-backend-ll82.onrender.com/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        }
      )
      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.access_token)
        toast.success("Welcome back! 👋")
        setTimeout(() => navigate("/dashboard"), 600)
      } else {
        toast.error(data.message || "Invalid credentials")
      }
    } catch {
      toast.error("Server connection failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <span className="auth-logo">💰</span>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Login to your account</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin} noValidate>

          {/* Email */}
          <div className={`auth-field ${errors.email ? "has-error" : ""}`}>
            <label>Email</label>
            <input
              type="email"
              placeholder="e.g. john@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); clearError("email") }}
            />
            <FieldError message={errors.email} />
          </div>

          {/* Password */}
          <div className={`auth-field ${errors.password ? "has-error" : ""}`}>
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={e => { setPassword(e.target.value); clearError("password") }}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(p => !p)}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
            <FieldError message={errors.password} />
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>

      </div>
    </div>
  )
}

export default Login