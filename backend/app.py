from flask import Flask, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, JWTManager,get_jwt_identity, get_jwt
from flask_cors import CORS
from mongoengine import connect
from Models.user import User
from Models.adminMsgs import UserMessage

from dotenv import load_dotenv
import os

from transformers import BertTokenizer, BertForSequenceClassification
import torch


from geopy.geocoders import Nominatim

def get_location(latitude, longitude):
    geolocator = Nominatim(user_agent="srivallikoppanapudi@gmail.com")  # Set a user-agent
    location = geolocator.reverse((latitude, longitude), exactly_one=True)
    
    if location:
        return location.address  # Returns full address
    return "Location not found"




app = Flask(__name__)

load_dotenv()
# 🔹 MongoDB Connection
connect(db="disasterManagement", host=os.getenv("MONGO_URI"))

# 🔹 Configure JWT Authentication
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

# 🔹 Enable CORS
# CORS(app, supports_credentials=True)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}}, expose_headers=["Authorization"])



@app.route("/")
def hello_world():
    return "Hello, World!"


# 🔹 REGISTER Route
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "user")  # default to 'user'




    if not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    if User.objects(email=email):
        return jsonify({"error": "Email already exists"}), 409

    new_user = User(email=email, password=password,role=role)
    new_user.hash_password()  # Hash password before saving
    new_user.save()

    return jsonify({"id": str(new_user.id), "email": new_user.email}), 201


# 🔹 LOGIN Route (Generates JWT Token)
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = User.objects(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Unauthorized Access"}), 401

    # access_token = create_access_token(identity=user.email)
    access_token = create_access_token(
    identity=user.email,
    additional_claims={"role": user.role}
    )

    

    return jsonify({"token": access_token, "email": user.email,"role": user.role}), 200


# 🔹 PROTECTED ROUTE (Only Accessible with JWT Token)
@app.route("/dashboard", methods=["GET"])
#@jwt_required()
@jwt_required()
def dashboard():
    return jsonify({"message": "Welcome to the admin dashboard!"})


# 🔹 LOCATION SUBMISSION
@app.route('/submitLocation', methods=['POST'])
@jwt_required()
def receive_location():
    print("Headers:", request.headers)
    print("JSON Payload:", request.json)
    data = request.json
    print("Received JSON:", data)
    email = data.get("email")
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    global message
    message=data.get("message")
    location=get_location(latitude,longitude)
    

    if email and latitude and longitude and message:
        print(f"Received location - Email: {email}, Latitude: {latitude}, Longitude: {longitude} location:{location}")
        # return jsonify({"message": "Location received successfully!"}), 200
        try:
            user_msg = UserMessage(email=email, message=message, location=location)
            user_msg.save()
            # return jsonify({"message": "Data saved successfully!"}), 201
        except Exception as e:
            import traceback
            print("Error occurred:", traceback.format_exc())  # Print full error trace
            return jsonify({"error": str(e)}), 500
        finally:
            inputs = tokenizer(message, return_tensors="pt", padding=True, truncation=True, max_length=96)
            with torch.no_grad():
                outputs = model(**inputs)
                probs = torch.sigmoid(outputs.logits).squeeze().numpy()
                preds = (probs > 0.5).astype(int)

            # Get predicted labels
            predicted_labels = [categories[i] for i, val in enumerate(preds) if val == 1]
            print(predicted_labels)
            

            return jsonify({
                "message": message,
                "predicted_categories": predicted_labels
            })

    else:
        return jsonify({"error": "Invalid data received"}), 400



@app.route("/get_messages", methods=["GET"])
@jwt_required()
def get_messages():
    try:
        messages = UserMessage.objects()  # Fetch all messages
        messages_list = [
        {"id": str(msg.id), "email": msg.email, "message": msg.message, "location": msg.location}
        for msg in messages
        ]

        return jsonify(messages_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🔹 DELETE MESSAGE (Admin Page)
@app.route("/delete_message/<message_id>", methods=["DELETE"])
@jwt_required()
def delete_message(message_id):
    try:
        user_msg = UserMessage.objects(id=message_id).first()
        if not user_msg:
            return jsonify({"error": "Message not found"}), 404
        
        user_msg.delete()
        return jsonify({"message": "Message deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Load model & tokenizer
model_path = "./model"
tokenizer = BertTokenizer.from_pretrained(model_path)
model = BertForSequenceClassification.from_pretrained(model_path)
model.eval()

# Category labels (example)
categories = [
    "Communication", "Electricity", "Food", "Infrastructure", "Medical",
    "Not Related", "Rescue", "Sanitation & Hygiene", "Shelter",
    "Transportation", "Water"
]


@jwt.unauthorized_loader
def unauthorized_response(callback):
    print("❌ Unauthorized:", callback)
    return jsonify({"error": "Missing or invalid JWT"}), 401

@jwt.invalid_token_loader
def invalid_token_loader(error):
    print("❌ Invalid token:", error)
    return jsonify({"error": "Invalid JWT"}), 422




if __name__ == "__main__":
    app.run(debug=False)
