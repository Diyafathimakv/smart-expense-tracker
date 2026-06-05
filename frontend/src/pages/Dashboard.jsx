import { useEffect, useState, useMemo } from "react"
import ExpenseForm from "../components/ExpenseForm"
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer
} from "recharts"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { toast } from "react-toastify"
import Loader from "../components/Loader/Loader"
import "./Dashboard.css"

const CATEGORY_ICONS = {
  Food: "🍔",
  Travel: "✈️",
  Shopping: "🛒",
  Bills: "💡",
  Entertainment: "🎬",
  Health: "💊",
  Other: "📦"
}

const COLORS = ["#4CAF50", "#FF9800", "#2196F3", "#E91E63", "#9C27B0", "#00BCD4", "#FF5722"]

function StatCard({ label, value, icon, accent }) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <span className="stat-card__icon">{icon}</span>
      <div>
        <p className="stat-card__label">{label}</p>
        <h3 className="stat-card__value">{value}</h3>
      </div>
    </div>
  )
}

function Dashboard() {
  const [expenses, setExpenses]           = useState([])
  const [editingExpense, setEditingExpense] = useState(null)
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState("")
  const [filterCategory, setFilterCategory] = useState("All")
  const [filterMonth, setFilterMonth]     = useState("All")
  const [filterYear, setFilterYear]       = useState("All")
  const [currentPage, setCurrentPage]     = useState(1)
  const ITEMS_PER_PAGE = 6

  const navigate = useNavigate()

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        "https://expense-tracker-backend-ll82.onrender.com/expenses",
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await response.json()
      setExpenses(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error("Failed to load expenses")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchExpenses() }, [])

  // ─── Delete ───────────────────────────────────────────────────────────────
  const deleteExpense = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this expense?")
    if (!confirmed) return

    const token = localStorage.getItem("token")
    const response = await fetch(
      `https://expense-tracker-backend-ll82.onrender.com/expense/${id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    )
    const data = await response.json()
    if (response.ok) {
      toast.success("Expense deleted")
      fetchExpenses()
    } else {
      toast.error(data.message || "Delete failed")
    }
  }

  // ─── Derived Stats ────────────────────────────────────────────────────────
  const now = new Date()

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  const thisMonthTotal = expenses
    .filter(e => {
      const d = new Date(e.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, e) => sum + e.amount, 0)

  const highestExpense = expenses.length
    ? Math.max(...expenses.map(e => e.amount))
    : 0

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  const uniqueCategories = [...new Set(expenses.map(e => e.category))]

  const monthlyTotals = expenses.reduce((acc, e) => {
    const month = new Date(e.date).toLocaleString("default", { month: "long" })
    acc[month] = (acc[month] || 0) + e.amount
    return acc
  }, {})

  const monthlyData = Object.entries(monthlyTotals).map(([month, amount]) => ({ month, amount }))
  const pieData     = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }))

  const recentExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  // ─── All unique years in expenses ─────────────────────────────────────────
  const allYears = [...new Set(expenses.map(e => new Date(e.date).getFullYear()))].sort((a, b) => b - a)

  const MONTHS = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ]

  // ─── Filter + Search ──────────────────────────────────────────────────────
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchSearch =
        e.description?.toLowerCase().includes(search.toLowerCase()) ||
        e.category?.toLowerCase().includes(search.toLowerCase())

      const matchCategory = filterCategory === "All" || e.category === filterCategory

      const expDate = new Date(e.date)
      const matchMonth = filterMonth === "All" ||
        expDate.toLocaleString("default", { month: "long" }) === filterMonth

      const matchYear = filterYear === "All" ||
        expDate.getFullYear().toString() === filterYear

      return matchSearch && matchCategory && matchMonth && matchYear
    })
  }, [expenses, search, filterCategory, filterMonth, filterYear])

  // ─── Pagination ───────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE)
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1) }, [search, filterCategory, filterMonth, filterYear])

  // ─── CSV Export ───────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["Date", "Category", "Description", "Amount"]
    const rows = expenses.map(e => [
      new Date(e.date).toLocaleDateString(),
      e.category,
      e.description,
      e.amount
    ])
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = "expenses.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV downloaded!")
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) return <Loader />

  return (
    <div className="dashboard">
      <Navbar />

      <div className="dashboard-container">

        {/* ── STAT CARDS ── */}
        <section className="stats-grid">
          <StatCard label="Total Expenses"     value={`₹ ${total.toLocaleString()}`}              icon="💰" accent="green"  />
          <StatCard label="This Month"         value={`₹ ${thisMonthTotal.toLocaleString()}`}      icon="📅" accent="blue"   />
          <StatCard label="Highest Expense"    value={`₹ ${highestExpense.toLocaleString()}`}      icon="📈" accent="orange" />
          <StatCard label="Total Categories"   value={uniqueCategories.length}                     icon="🗂️" accent="purple" />
          <StatCard label="No. of Expenses"    value={expenses.length}                             icon="🧾" accent="pink"   />
        </section>

        {/* ── EXPENSE FORM ── */}
        <section className="expense-form-section">
          <ExpenseForm
            fetchExpenses={fetchExpenses}
            editingExpense={editingExpense}
            setEditingExpense={setEditingExpense}
          />
        </section>

        {/* ── RECENT TRANSACTIONS ── */}
        {recentExpenses.length > 0 && (
          <section className="recent-section">
            <h3 className="section-title">Recent Transactions</h3>
            <div className="recent-list">
              {recentExpenses.map(e => (
                <div className="recent-item" key={e.id}>
                  <span className="recent-icon">
                    {CATEGORY_ICONS[e.category] || "📦"}
                  </span>
                  <div className="recent-info">
                    <span className="recent-category">{e.category}</span>
                    <span className="recent-desc">{e.description}</span>
                  </div>
                  <span className="recent-date">
                    {new Date(e.date).toLocaleDateString()}
                  </span>
                  <span className="recent-amount">₹ {e.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SEARCH + FILTERS + EXPORT ── */}
        <section className="controls-section">
          <input
            className="search-input"
            placeholder="🔍  Search by description or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="filters">
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="All">All Categories</option>
              {uniqueCategories.map(c => (
                <option key={c} value={c}>{CATEGORY_ICONS[c] || "📦"} {c}</option>
              ))}
            </select>

            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              <option value="All">All Months</option>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <select value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              <option value="All">All Years</option>
              {allYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <button className="export-btn" onClick={exportCSV}>
              ⬇ Export CSV
            </button>
          </div>
        </section>

        {/* ── EXPENSE LIST ── */}
        <section className="expenses-section">
          {filteredExpenses.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📊</span>
              <h3>No expenses found</h3>
              <p>Try adjusting your filters or add your first expense above.</p>
            </div>
          ) : (
            <>
              {paginatedExpenses.map(expense => (
                <div className="expense-card" key={expense.id}>
                  <span className="expense-icon">
                    {CATEGORY_ICONS[expense.category] || "📦"}
                  </span>
                  <span className="expense-amount">₹ {expense.amount.toLocaleString()}</span>
                  <span className="expense-category">{expense.category}</span>
                  <span className="expense-description">{expense.description}</span>
                  <span className="expense-date">
                    {expense.date ? new Date(expense.date).toLocaleDateString() : ""}
                  </span>
                  <div className="expense-actions">
                    <button className="edit-btn"   onClick={() => setEditingExpense(expense)}>✏️ Edit</button>
                    <button className="delete-btn" onClick={() => deleteExpense(expense.id)}>🗑 Delete</button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                  >← Prev</button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={page === currentPage ? "page-btn active" : "page-btn"}
                      onClick={() => setCurrentPage(page)}
                    >{page}</button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >Next →</button>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── CHARTS ── */}
        {expenses.length > 0 && (
          <section className="charts-section">

            <div className="chart-box">
              <h3 className="section-title">Spending by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={val => `₹ ${val.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <h3 className="section-title">Monthly Spending</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={val => `₹ ${val.toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </section>
        )}

      </div>
    </div>
  )
}

export default Dashboard