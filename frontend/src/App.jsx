import { Routes, Route } from "react-router-dom"
import { createContext, useContext, useState, useEffect } from "react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"

export const DarkModeContext = createContext()

export function useDarkMode() {
  return useContext(DarkModeContext)
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true"
  })

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode)
    document.body.classList.toggle("dark", darkMode)
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(prev => !prev)

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />
    </DarkModeContext.Provider>
  )
}

export default App