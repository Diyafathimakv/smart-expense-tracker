from flask import Blueprint, request, jsonify
from .. import db, bcrypt
from ..models import User
from flask_jwt_extended import create_access_token

auth = Blueprint("auth", __name__)

@auth.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    # CHECK IF USER EXISTS
    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({"message": "Email already registered"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    new_user = User(
        username=username,
        email=email,
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@auth.route('/login',methods=["POST"])
def login():

    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Incorrect password"}), 401
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
    "message": "Login successful",
    "access_token": access_token
    }), 200