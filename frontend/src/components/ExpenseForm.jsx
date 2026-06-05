import { useState, useEffect, useRef } from "react"
import { toast } from "react-toastify"
import "./ExpenseForm.css"

const CATEGORY_ICONS = {
  Food: "🍔",
  Travel: "✈️",
  Shopping: "🛒",
  Grocery: "🥬",
  Bills: "💡",
  Others: "📦"
}

const CATEGORIES = ["Food", "Travel", "Shopping", "Grocery", "Bills", "Others"]

function FieldError({ message }) {
  if (!message) return null
  return <span className="field-error">⚠ {message}</span>
}

function ExpenseForm({ fetchExpenses, editingExpense, setEditingExpense }) {
  const [amount,      setAmount]      = useState("")
  const [category,    setCategory]    = useState("")
  const [description, setDescription] = useState("")
  const [date,        setDate]        = useState("")
  const [editingId,   setEditingId]   = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [errors,      setErrors]      = useState({})

  const formRef = useRef(null)

  // ─── Populate form when editing ──────────────────────────────────────────
  // FIX: use editingExpense?.id as the dependency — not the object itself.
  // This fires even if you click Edit on the same expense twice in a row.
  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount)
      setCategory(editingExpense.category)
      setDescription(editingExpense.description)
      setDate(editingExpense.date ? editingExpense.date.split("T")[0] : "")
      setEditingId(editingExpense.id)
      setErrors({})

      // FIX: scroll the form into view so user sees it fill in
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 50)
    }
  }, [editingExpense?.id, editingExpense?.amount, editingExpense?.category,
      editingExpense?.description, editingExpense?.date])
  // ↑ Watching individual fields means clicking Edit on the same expense
  //   after a cancel WILL re-trigger because setEditingExpense(expense)
  //   creates a new object reference, and we re-spread all the fields.

  // ─── Validate ─────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {}
    if (!amount || Number(amount) <= 0)   newErrors.amount = "Amount must be greater than 0"
    if (Number(amount) > 1000000)         newErrors.amount = "Amount is too large (max ₹10,00,000)"
    if (!category)                        newErrors.category = "Please select a category"
    if (description.trim().length < 3)    newErrors.description = "Description must be at least 3 characters"
    if (!date)                            newErrors.date = "Please select a date"
    if (date && new Date(date) > new Date().setHours(0,0,0,0))
                                          newErrors.date = "Future dates are not allowed"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const clearError = (field) => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }))
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    if (!validate()) return

    const token = localStorage.getItem("token")

    try {
      setLoading(true)

      const payload = {
        amount: Number(amount),
        category,
        description: description.trim(),
        date
      }

      const url = editingId
        ? `https://expense-tracker-backend-ll82.onrender.com/expense/${editingId}`
        : "https://expense-tracker-backend-ll82.onrender.com/add-expense"

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || "Something went wrong")
        return
      }

      toast.success(editingId ? "Expense updated ✅" : "Expense added ✅")
      resetForm()
      fetchExpenses()

    } catch (error) {
      console.error(error)
      toast.error("Server connection failed")
    } finally {
      setLoading(false)
    }
  }

  // ─── Reset ────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setAmount("")
    setCategory("")
    setDescription("")
    setDate("")
    setEditingId(null)
    setEditingExpense(null)
    setErrors({})
  }

  const cancelEdit = () => {
    resetForm()
    toast.info("Edit cancelled")
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="expense-form-wrapper" ref={formRef}>

      {editingId && (
        <div className="edit-banner">
          ✏️ Editing expense — make your changes below
        </div>
      )}

      <h3 className="form-title">
        {editingId ? "Update Expense" : "Add New Expense"}
      </h3>

      <form className="expense-form" onSubmit={handleSubmit} noValidate>

        <div className={`form-group ${errors.amount ? "has-error" : ""}`}>
          <label htmlFor="amount">Amount (₹)</label>
          <input
            id="amount"
            type="number"
            placeholder="e.g. 500"
            min="1"
            max="1000000"
            value={amount}
            onChange={e => { setAmount(e.target.value); clearError("amount") }}
          />
          <FieldError message={errors.amount} />
        </div>

        <div className={`form-group ${errors.category ? "has-error" : ""}`}>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={e => { setCategory(e.target.value); clearError("category") }}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {CATEGORY_ICONS[cat]} {cat}
              </option>
            ))}
          </select>
          <FieldError message={errors.category} />
        </div>

        <div className={`form-group ${errors.description ? "has-error" : ""}`}>
          <label htmlFor="description">
            Description
            <span className="char-count">{description.length}/100</span>
          </label>
          <input
            id="description"
            type="text"
            placeholder="e.g. Lunch at restaurant"
            value={description}
            maxLength={100}
            onChange={e => { setDescription(e.target.value); clearError("description") }}
          />
          <FieldError message={errors.description} />
        </div>

        <div className={`form-group ${errors.date ? "has-error" : ""}`}>
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            max={new Date().toISOString().split("T")[0]}
            onChange={e => { setDate(e.target.value); clearError("date") }}
          />
          <FieldError message={errors.date} />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading
              ? <span className="btn-spinner">⏳ Saving...</span>
              : editingId ? "✅ Update Expense" : "➕ Add Expense"
            }
          </button>

          {editingId && (
            <button type="button" className="cancel-btn" onClick={cancelEdit} disabled={loading}>
              ✕ Cancel
            </button>
          )}
        </div>

      </form>
    </div>
  )
}

export default ExpenseForm