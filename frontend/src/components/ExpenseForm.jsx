import { useState, useEffect } from "react"
import './ExpenseForm.css'

function ExpenseForm({ fetchExpenses, editingExpense, setEditingExpense }) {

  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount)
      setCategory(editingExpense.category)
      setDescription(editingExpense.description)
      setDate(editingExpense.date.split("T")[0])
      setEditingId(editingExpense.id)
    }
  }, [editingExpense])

  const handleAddExpense = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem("token")

    if (editingId) {

      // EDIT EXPENSE
      await fetch(`https://expense-tracker-backend-ll82.onrender.com/expense/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          category,
          description,
          date
        })
      })

    } else {

      // ADD NEW EXPENSE
      await fetch("https://expense-tracker-backend-ll82.onrender.com/add-expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          category,
          description,
          date
        })
      })

    }

    setAmount("")
    setCategory("")
    setDescription("")
    setDate("")
    setEditingId(null)
    setEditingExpense(null)

    fetchExpenses()
  }

  return (
    <form className="expense-form" onSubmit={handleAddExpense}>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      >
        <option value="">Select Category</option>
        <option value="Food">Food</option>
        <option value="Travel">Travel</option>
        <option value="Shopping">Shopping</option>
        <option value="Grocery">Grocery</option>
        <option value="Bills">Bills</option>
        <option value="Others">Others</option>
      </select>

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button type="submit">
        {editingId ? "Update Expense" : "Add Expense"}
      </button>

    </form>
  )
}

export default ExpenseForm