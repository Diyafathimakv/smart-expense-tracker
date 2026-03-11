import { useState,useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import "./Auth.css"
import { useLocation } from "react-router-dom"


function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
const [isError, setIsError] = useState(false)
const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
  if (location.state?.email) {
    setEmail(location.state.email)
  }
}, [location])

const handleLogin = async (e) => {
  e.preventDefault()

  const response = await fetch("http://127.0.0.1:5000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password
    })
  })

  const data = await response.json()

  if (response.ok) {
    localStorage.setItem("token", data.access_token)

    setMessage("Login successful!")
    setIsError(false)
    setEmail("")
setPassword("")

    setTimeout(() => {
      navigate("/dashboard")
    }, 800)

  } else {
    setMessage(data.message)
    setIsError(true)
  }
}

return (
  <div className="auth-page">
    <div className="auth-card">

      <h2 className="auth-title">Login</h2>

      <form className="auth-form" onSubmit={handleLogin}>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />

        <button className="auth-btn" type="submit">
          Login
        </button>
        {message && (
  <p className={isError ? "auth-error" : "auth-success"}>
    {message}
  </p>
)}

      </form>

      <p className="auth-link">
        Don't have an account? <Link to="/register">Register</Link>
      </p>

    </div>
  </div>
)
}

export default Login