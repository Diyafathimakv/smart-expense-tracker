from . import db
from datetime import datetime

class User(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    username=db.Column(db.String(100),nullable=False)
    email=db.Column(db.String(200),nullable=False,unique=True)
    password=db.Column(db.String(200),nullable=False)

    expenses = db.relationship('Expense', backref='user', lazy=True)

class Expense(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    amount=db.Column(db.Float,nullable=False)
    category=db.Column(db.String(100),nullable=False)
    description=db.Column(db.String(200))
    date=db.Column(db.DateTime,default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)