# models/request_log.py
from mongoengine import Document, StringField, DateTimeField
from datetime import datetime

class RequestLog(Document):
    category = StringField(required=True)
    timestamp = DateTimeField(default=datetime.utcnow)

