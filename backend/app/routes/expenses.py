from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models import Expense
from datetime import datetime


expense = Blueprint("expense", __name__)


@expense.route("/add-expense", methods=["POST"])
@jwt_required()
def add_expense():
    data = request.get_json()

    amount = data.get("amount")
    category = data.get("category")
    description = data.get("description")
    date_str = data.get("date")   # NEW

    user_id = int(get_jwt_identity())
    
    if amount is None or category is None:
        return jsonify({"message": "Amount and category are required"}), 400

    # Convert string → datetime
    if date_str:
        date = datetime.strptime(date_str, "%Y-%m-%d")
    else:
        date = datetime.utcnow()

    new_expense = Expense(
        amount=amount,
        category=category,
        description=description,
        date=date,
        user_id=user_id
    )

    db.session.add(new_expense)
    db.session.commit()

    return jsonify({"message": "Expense added successfully"}), 201

@expense.route("/expenses", methods=["GET"])
@jwt_required()
def get_expenses():
    user_id = int(get_jwt_identity())
    expenses = Expense.query.filter_by(user_id=user_id).all()
    result = []
    for expense in expenses:
      result.append({
    "id": expense.id,
    "amount": expense.amount,
    "category": expense.category,
    "description": expense.description,
    "date": expense.date.isoformat()
})
    
    return jsonify(result), 200


@expense.route("/expense/<int:expense_id>", methods=["DELETE"])
@jwt_required()
def delete_expense(expense_id):
    expense = Expense.query.get(expense_id)
    if not expense:
        return jsonify({"message": "Expense not found"}), 404
    user_id = int(get_jwt_identity())
    if user_id != expense.user_id:
        return jsonify({"message": "You are not allowed to delete this expense"}), 403
    
    db.session.delete(expense)
    db.session.commit()

    return jsonify({"message": "Expense deleted successfully"}), 200

@expense.route("/total-expenses", methods=["GET"])
@jwt_required()
def get_total_expenses():
    user_id = int(get_jwt_identity())
    expenses = Expense.query.filter_by(user_id=user_id).all()

    total = sum(expense.amount for expense in expenses)

    return jsonify({"total": total}), 200

@expense.route("/category-summary", methods=["GET"])
@jwt_required()
def category_summary():
    user_id = int(get_jwt_identity())

    expenses = Expense.query.filter_by(user_id=user_id).all()

    category_totals = {}

    for expense in expenses:
        category_totals[expense.category] = (
            category_totals.get(expense.category, 0) + expense.amount
        )

    return jsonify(category_totals), 200

@expense.route("/expense/<int:expense_id>", methods=["PUT"])
@jwt_required()
def edit_expense(expense_id):

    user_id = get_jwt_identity()
    expense = Expense.query.get(expense_id)

    if not expense:
        return jsonify({"message": "Expense not found"}), 404

    if expense.user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()

    expense.amount = data.get("amount", expense.amount)
    expense.category = data.get("category", expense.category)
    expense.description = data.get("description", expense.description)

    if data.get("date"):
        expense.date = datetime.strptime(data.get("date"), "%Y-%m-%d")

    db.session.commit()

    return jsonify({"message": "Expense updated successfully"})