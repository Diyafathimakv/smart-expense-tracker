from flask import Blueprint, request, jsonify
from .. import db, bcrypt
from ..models import User
from flask_jwt_extended import create_access_token
import re

auth = Blueprint("auth", __name__)


# ─── Register ─────────────────────────────────────────────────────────────────
@auth.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    username = (data.get("username") or "").strip()
    email    = (data.get("email")    or "").strip().lower()
    password =  data.get("password") or ""

    # Validation
    if not username or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    if len(username) < 3:
        return jsonify({"message": "Username must be at least 3 characters"}), 400

    if not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
        return jsonify({"message": "Enter a valid email address"}), 400

    if len(password) < 8:
        return jsonify({"message": "Password must be at least 8 characters"}), 400

    # Duplicate checks
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already taken"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    new_user = User(
        username=username,
        email=email,
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Account created successfully"}), 201


# ─── Login ────────────────────────────────────────────────────────────────────
@auth.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email    = (data.get("email")    or "").strip().lower()
    password =  data.get("password") or ""

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    # Same message for both "not found" and "wrong password"
    # avoids leaking which emails are registered
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Invalid email or password"}), 401

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"username": user.username}
    )

    return jsonify({
        "message":      "Login successful",
        "access_token": access_token,
        "username":     user.username
    }), 200