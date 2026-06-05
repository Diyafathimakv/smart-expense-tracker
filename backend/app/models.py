from . import db
from datetime import datetime, date


class User(db.Model):
    id       = db.Column(db.Integer,     primary_key=True)
    username = db.Column(db.String(100), nullable=False, unique=True)
    email    = db.Column(db.String(200), nullable=False, unique=True)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    expenses = db.relationship("Expense", backref="user", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id":         self.id,
            "username":   self.username,
            "email":      self.email,
            "created_at": self.created_at.strftime("%Y-%m-%d") if self.created_at else None,
            "total_expenses": len(self.expenses)
        }


class Expense(db.Model):
    id          = db.Column(db.Integer,     primary_key=True)
    amount      = db.Column(db.Float,       nullable=False)
    category    = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    date        = db.Column(db.Date,        nullable=False, default=date.today)
    created_at  = db.Column(db.DateTime,    default=datetime.utcnow, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    def to_dict(self):
        return {
            "id":          self.id,
            "amount":      self.amount,
            "category":    self.category,
            "description": self.description,
            "date":        self.date.strftime("%Y-%m-%d") if self.date else None,
            "created_at":  self.created_at.strftime("%Y-%m-%d") if self.created_at else None
        }