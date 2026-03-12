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

    try {

      let response

      if (editingId) {

        // EDIT EXPENSE
        response = await fetch(
          `https://expense-tracker-backend-ll82.onrender.com/expense/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
           body: JSON.stringify({
  amount: Number(amount),
  category,
  description,
  date
})
          }
        )

      } else {

        // ADD NEW EXPENSE
        response = await fetch(
          "https://expense-tracker-backend-ll82.onrender.com/add-expense",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
           body: JSON.stringify({
  amount: Number(amount),
  category,
  description,
  date
})
          }
        )

      }

      const data = await response.json()

      if (!response.ok) {
        console.error(data)
        alert("Error adding expense")
        return
      }

      // RESET FORM
      setAmount("")
      setCategory("")
      setDescription("")
      setDate("")
      setEditingId(null)
      setEditingExpense(null)

      // REFRESH EXPENSE LIST
      fetchExpenses()

    } catch (error) {
      console.error("Add expense error:", error)
    }

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