from mongoengine import Document, StringField, EmailField

class UserMessage(Document):
    email = EmailField(required=True)  # User Email (Unique)
    message = StringField(required=True)  # Message Sent by User
    location = StringField(required=True)  # Location (Stored as String)

    meta = {'collection': 'user_messages'}  # Collection name in MongoDB
