import { useNavigate } from "react-router-dom"
import "./Navbar.css"

function Navbar(){

  const navigate = useNavigate()

  const handleLogout = () =>{
    localStorage.removeItem("token")
    navigate("/")
  }

  return(
    <div className="navbar">
      <h2>Expense Tracker</h2>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}

export default Navbar