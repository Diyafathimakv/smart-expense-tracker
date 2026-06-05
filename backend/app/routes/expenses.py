from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models import Expense
from datetime import datetime, date


expense = Blueprint("expense", __name__)


# ─── Helper ───────────────────────────────────────────────────────────────────
def expense_to_dict(exp):
    return {
        "id":          exp.id,
        "amount":      exp.amount,
        "category":    exp.category,
        "description": exp.description,
        "date":        exp.date.strftime("%Y-%m-%d") if exp.date else None
    }


# ─── Add Expense ──────────────────────────────────────────────────────────────
@expense.route("/add-expense", methods=["POST"])
@jwt_required()
def add_expense():
    user_id = int(get_jwt_identity())
    data    = request.get_json()

    amount      = data.get("amount")
    category    = data.get("category")
    description = data.get("description", "").strip()
    date_str    = data.get("date")

    # Validation
    if amount is None or amount <= 0:
        return jsonify({"message": "Amount must be greater than 0"}), 400
    if not category:
        return jsonify({"message": "Category is required"}), 400
    if len(description) < 3:
        return jsonify({"message": "Description must be at least 3 characters"}), 400
    if not date_str:
        return jsonify({"message": "Date is required"}), 400

    try:
        parsed_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400

    if parsed_date > date.today():
        return jsonify({"message": "Future dates are not allowed"}), 400

    new_expense = Expense(
        amount=amount,
        category=category,
        description=description,
        date=parsed_date,
        user_id=user_id
    )

    db.session.add(new_expense)
    db.session.commit()

    return jsonify({"message": "Expense added successfully", "expense": expense_to_dict(new_expense)}), 201


# ─── Get All Expenses ─────────────────────────────────────────────────────────
@expense.route("/expenses", methods=["GET"])
@jwt_required()
def get_expenses():
    user_id  = int(get_jwt_identity())
    expenses = Expense.query.filter_by(user_id=user_id)\
                            .order_by(Expense.date.desc())\
                            .all()

    return jsonify([expense_to_dict(e) for e in expenses]), 200


# ─── Edit Expense ─────────────────────────────────────────────────────────────
@expense.route("/expense/<int:expense_id>", methods=["PUT"])
@jwt_required()
def edit_expense(expense_id):
    user_id = int(get_jwt_identity())   # ✅ FIX: cast to int — was causing 403
    exp     = Expense.query.get(expense_id)

    if not exp:
        return jsonify({"message": "Expense not found"}), 404

    if exp.user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()

    amount      = data.get("amount",      exp.amount)
    category    = data.get("category",    exp.category)
    description = data.get("description", exp.description)
    date_str    = data.get("date")

    # Validation
    if amount <= 0:
        return jsonify({"message": "Amount must be greater than 0"}), 400
    if not category:
        return jsonify({"message": "Category is required"}), 400
    if len(description.strip()) < 3:
        return jsonify({"message": "Description must be at least 3 characters"}), 400

    if date_str:
        try:
            parsed_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400

        if parsed_date > date.today():
            return jsonify({"message": "Future dates are not allowed"}), 400

        exp.date = parsed_date

    exp.amount      = amount
    exp.category    = category
    exp.description = description.strip()

    db.session.commit()

    return jsonify({"message": "Expense updated successfully", "expense": expense_to_dict(exp)}), 200


# ─── Delete Expense ───────────────────────────────────────────────────────────
@expense.route("/expense/<int:expense_id>", methods=["DELETE"])
@jwt_required()
def delete_expense(expense_id):
    user_id = int(get_jwt_identity())
    exp     = Expense.query.get(expense_id)

    if not exp:
        return jsonify({"message": "Expense not found"}), 404

    if exp.user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    db.session.delete(exp)
    db.session.commit()

    return jsonify({"message": "Expense deleted successfully"}), 200


# ─── Total Expenses ───────────────────────────────────────────────────────────
@expense.route("/total-expenses", methods=["GET"])
@jwt_required()
def get_total_expenses():
    user_id = int(get_jwt_identity())
    expenses = Expense.query.filter_by(user_id=user_id).all()
    total    = sum(e.amount for e in expenses)

    return jsonify({"total": total}), 200


# ─── Category Summary ─────────────────────────────────────────────────────────
@expense.route("/category-summary", methods=["GET"])
@jwt_required()
def category_summary():
    user_id  = int(get_jwt_identity())
    expenses = Expense.query.filter_by(user_id=user_id).all()

    summary = {}
    for e in expenses:
        summary[e.category] = summary.get(e.category, 0) + e.amount

    return jsonify(summary), 200