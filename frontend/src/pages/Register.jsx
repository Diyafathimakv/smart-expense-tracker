import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Auth.css"
import { Link } from "react-router-dom"


function Register() {

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
const [isError, setIsError] = useState(false)
  const navigate = useNavigate()

 const handleRegister = async (e) => {
  e.preventDefault()

 if (password !== confirmPassword) {
  setMessage("Passwords do not match")
  setIsError(true)
  return
}

  const response = await fetch("https://expense-tracker-backend-ll82.onrender.com/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username,
      email,
      password
    })
  })

  const data = await response.json()

if (response.ok) {
  setMessage("Registration successful")
  navigate("/", { state: { email } })
} else {
  setMessage(data.message)
  setIsError(true)
}


 
}

 return (
  <div className="auth-page">
    <div className="auth-card">

      <h2 className="auth-title">Register</h2>

      <form className="auth-form" onSubmit={handleRegister}>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          required
        />

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
        <input
  type="password"
  placeholder="Confirm Password"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
  required
/>

        <button className="auth-btn" type="submit">
          Register
        </button>
        {message && (
  <p className={isError ? "auth-error" : "auth-success"}>
    {message}
  </p>
)}

      </form>

      <p className="auth-link">
        Already have an account? <Link to="/">Login</Link>
      </p>

    </div>
  </div>
)
}

export default Register