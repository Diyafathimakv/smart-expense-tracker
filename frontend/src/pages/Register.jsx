import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "react-toastify"
import "./Auth.css"

function FieldError({ message }) {
  if (!message) return null
  return <span className="field-error">⚠ {message}</span>
}

function Register() {
  const [username,        setUsername]        = useState("")
  const [email,           setEmail]           = useState("")
  const [password,        setPassword]        = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword,    setShowPassword]    = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [errors,          setErrors]          = useState({})

  const navigate = useNavigate()

  // ─── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (username.trim().length < 3)
      e.username = "Username must be at least 3 characters"
    if (!email.includes("@") || !email.includes("."))
      e.email = "Enter a valid email address"
    if (password.length < 8)
      e.password = "Password must be at least 8 characters"
    if (password !== confirmPassword)
      e.confirmPassword = "Passwords do not match"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const clearError = (field) => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }))
  }

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const response = await fetch(
        "https://expense-tracker-backend-ll82.onrender.com/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password })
        }
      )
      const data = await response.json()

      if (response.ok) {
        toast.success("Account created! Please log in.")
        navigate("/", { state: { email } })
      } else {
        toast.error(data.message || "Registration failed")
      }
    } catch {
      toast.error("Server connection failed")
    } finally {
      setLoading(false)
    }
  }

  // ─── Password strength ─────────────────────────────────────────────────────
  const getStrength = () => {
    if (password.length === 0) return null
    if (password.length < 6)   return { label: "Weak",   level: 1 }
    if (password.length < 10)  return { label: "Fair",   level: 2 }
    return                            { label: "Strong", level: 3 }
  }
  const strength = getStrength()

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <span className="auth-logo">💰</span>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Start tracking your expenses today</p>
        </div>

        <form className="auth-form" onSubmit={handleRegister} noValidate>

          {/* Username */}
          <div className={`auth-field ${errors.username ? "has-error" : ""}`}>
            <label>Username</label>
            <input
              type="text"
              placeholder="e.g. john_doe"
              value={username}
              onChange={e => { setUsername(e.target.value); clearError("username") }}
            />
            <FieldError message={errors.username} />
          </div>

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
                placeholder="Min. 8 characters"
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
            {strength && (
              <div className="strength-bar">
                <div className={`strength-fill strength-${strength.level}`} />
                <span className="strength-label">{strength.label}</span>
              </div>
            )}
            <FieldError message={errors.password} />
          </div>

          {/* Confirm Password */}
          <div className={`auth-field ${errors.confirmPassword ? "has-error" : ""}`}>
            <label>Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); clearError("confirmPassword") }}
            />
            <FieldError message={errors.confirmPassword} />
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <p className="auth-link">
          Already have an account? <Link to="/">Login</Link>
        </p>

      </div>
    </div>
  )
}

export default Register