import { Navigate } from "react-router-dom"
import { toast } from "react-toastify"

function isTokenValid() {
  try {
    const token = localStorage.getItem("token")
    if (!token) return false

    const payload = JSON.parse(atob(token.split(".")[1]))

    // JWT exp is in seconds; Date.now() is in milliseconds
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token")
      toast.error("Session expired. Please log in again.")
      return false
    }

    return true
  } catch {
    localStorage.removeItem("token")
    return false
  }
}

function ProtectedRoute({ children }) {
  if (!isTokenValid()) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute