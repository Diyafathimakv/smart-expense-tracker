import { useEffect, useState } from "react"
import ExpenseForm from "../components/ExpenseForm"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import './Dashboard.css'

function Dashboard() {

  const [expenses, setExpenses] = useState([])
  const [editingExpense, setEditingExpense] = useState(null)

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const categoryTotals = expenses.reduce((acc, expense) => {
    if (acc[expense.category]) {
      acc[expense.category] += expense.amount
    } else {
      acc[expense.category] = expense.amount
    }
    return acc
  }, {})

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  /* ---------- MONTHLY TOTALS ---------- */

  const monthlyTotals = {}

  expenses.forEach((expense) => {
    const month = new Date(expense.date).toLocaleString("default", {
      month: "long"
    })

    if (!monthlyTotals[month]) {
      monthlyTotals[month] = 0
    }

    monthlyTotals[month] += expense.amount
  })

  /* ---------- MONTHLY CHART DATA ---------- */

  const monthlyData = Object.entries(monthlyTotals).map(([month, amount]) => ({
    month,
    amount
  }))

  /* ---------- PIE CHART DATA ---------- */

  const pieData = Object.entries(categoryTotals).map(
    ([category, amount]) => ({
      name: category,
      value: amount
    })
  )

  const editExpense = (expense) => {
    setEditingExpense(expense)
  }

  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }
const fetchExpenses = async () => {

  try {

    const token = localStorage.getItem("token")

    const response = await fetch(
      "https://expense-tracker-backend-ll82.onrender.com/expenses",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = await response.json()

    console.log("EXPENSE DATA:", data)

    setExpenses(Array.isArray(data) ? data : [])

  } catch (error) {
    console.error("Fetch expenses error:", error)
  }

}

useEffect(() => {
  fetchExpenses()
}, [])

const deleteExpense = async (id) => {

  const token = localStorage.getItem("token")

  const response = await fetch(
    `https://expense-tracker-backend-ll82.onrender.com/expense/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  const data = await response.json()

  if (response.ok) {
    fetchExpenses()
  } else {
    alert(data.message)
  }

}

  const COLORS = [
    "#4CAF50",
    "#FF9800",
    "#2196F3",
    "#E91E63",
    "#9C27B0"
  ]

  return (

    <div className="dashboard">

      <Navbar />

      <div className="dashboard-container">

        <div className="summary-card">

          <div className="summary-left">

            <h2>Dashboard</h2>

            <div className="summary-stats">

              <div className="stat-box">
                <p>Total Expense</p>
                <h3>₹ {total}</h3>
              </div>

            </div>

          </div>

          {/* MONTHLY BREAKDOWN */}

          <div className="monthly-breakdown">

            <h3>Monthly Expenses</h3>

            {Object.entries(monthlyTotals).map(([month, amount]) => (
              <p key={month}>
                {month}: ₹ {amount}
              </p>
            ))}

          </div>

          {/* CATEGORY BREAKDOWN */}

          <div className="category-breakdown">

            <h3>Category Breakdown</h3>

            {Object.entries(categoryTotals).map(([category, amount]) => (
              <p key={category}>
                {category}: ₹ {amount}
              </p>
            ))}

          </div>

        </div>

        <div className="expense-form-section">

          <ExpenseForm
            fetchExpenses={fetchExpenses}
            editingExpense={editingExpense}
            setEditingExpense={setEditingExpense}
          />

        </div>

        <div className="expenses-section">

          {expenses.length === 0 ? (

            <p className="no-expenses">No expenses yet</p>

          ) : (

            expenses.map((expense) => (

              <div className="expense-card" key={expense.id}>

                <span className="expense-amount">
                  ₹ {expense.amount}
                </span>

                <span className="expense-category">
                  {expense.category}
                </span>

                <span className="expense-description">
                  {expense.description}
                </span>

                <span className="expense-date">
                 {expense.date ? new Date(expense.date).toLocaleDateString() : ""}
                </span>

                <button
                  className="delete-btn"
                  onClick={() => deleteExpense(expense.id)}
                >
                  Delete
                </button>

                <button
                  className="edit-btn"
                  onClick={() => editExpense(expense)}
                >
                  Edit
                </button>

              </div>

            ))

          )}

        </div>

        {/* PIE CHART */}

        <div className="chart-section">

          <PieChart width={400} height={300}>

            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >

              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}

            </Pie>

            <Tooltip />
            <Legend />

          </PieChart>

        </div>

        {/* BAR CHART */}
        
              {expenses.length > 0 && (

        <div className="bar-chart-section">

          <h3>Monthly Spending</h3>

          <BarChart
            width={500}
            height={300}
            data={monthlyData}
          >

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="amount"
              fill="#4CAF50"
            />

          </BarChart>
          

        </div> )}

      </div> 
      

    </div>

  )

}

export default Dashboard