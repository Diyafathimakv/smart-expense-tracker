import { useNavigate } from "react-router-dom"
import { useDarkMode } from "../App"
import { toast } from "react-toastify"
import "./Navbar.css"

// Pull username out of the JWT payload (no extra library needed)
function getUsernameFromToken() {
  try {
    const token = localStorage.getItem("token")
    if (!token) return null
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.username || payload.sub || null
  } catch {
    return null
  }
}

function Navbar() {
  const navigate          = useNavigate()
  const { darkMode, toggleDarkMode } = useDarkMode()
  const username          = getUsernameFromToken()

  const handleLogout = () => {
    localStorage.removeItem("token")
    toast.info("Logged out successfully")
    navigate("/")
  }

  return (
    <nav className="navbar">

      {/* ── Left: Brand ── */}
      <div className="navbar__brand">
        <span className="navbar__logo">💰</span>
        <h2 className="navbar__title">ExpenseTracker</h2>
      </div>

      {/* ── Right: Controls ── */}
      <div className="navbar__controls">

        {username && (
          <span className="navbar__greeting">
            👋 {username}
          </span>
        )}

        {/* Dark mode toggle */}
        <button
          className="navbar__toggle"
          onClick={toggleDarkMode}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle dark mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        <button className="navbar__logout" onClick={handleLogout}>
          Logout
        </button>

      </div>
    </nav>
  )
}

export default Navbar