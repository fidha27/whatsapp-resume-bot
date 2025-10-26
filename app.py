from flask import Flask, request, render_template, jsonify
from twilio.twiml.messaging_response import MessagingResponse
import requests, os, re, json
from PyPDF2 import PdfReader
from docx import Document

app = Flask(__name__)

DATA_FILE = "data.json"
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Load existing data if file exists
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "r") as f:
        messages = json.load(f)
else:
    messages = []

# ----------- Helper Functions -----------

def extract_details(text):
    email = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    phone = re.findall(r"\+?\d[\d\s\-]{7,}\d", text)
    name = None
    lines = text.split("\n")
    for l in lines:
        if "name" in l.lower():
            name = l.split(":")[-1].strip()
            break
    if not name and lines:
        name = lines[0].strip()
    return {
        "name": name or "Unknown",
        "email": email[0] if email else "Not found",
        "phone": phone[0] if phone else "Not found"
    }

def extract_text(file_path):
    text = ""
    if file_path.endswith(".pdf"):
        reader = PdfReader(file_path)
        for page in reader.pages:
            text += page.extract_text() or ""
            text += "\n"
    elif file_path.endswith(".docx"):
        doc = Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    return text.strip()

# ----------- Web Routes -----------

@app.route("/")
def index():
    return render_template("index.html", messages=messages)

@app.route("/api/messages")
def get_messages():
    return jsonify(messages)

# ----------- WhatsApp Webhook -----------

@app.route("/whatsapp", methods=["POST"])
def whatsapp_webhook():
    sender = request.form.get("From")
    msg_body = request.form.get("Body")
    num_media = int(request.form.get("NumMedia", 0))

    resp = MessagingResponse()
    print(f"📩 Message from {sender}: {msg_body}")

    # Default reply
    reply = "Hi 👋 Send me your resume (PDF/DOC) and I’ll extract your info!"

    # If user sends a file
    if num_media > 0:
        media_url = request.form.get("MediaUrl0")
        mime_type = request.form.get("MediaContentType0")
        extension = mime_type.split("/")[-1]

        filename = os.path.join(UPLOAD_DIR, f"{sender.replace(':','_')}.{extension}")
        r = requests.get(media_url)
        with open(filename, "wb") as f:
            f.write(r.content)

        text = extract_text(filename)
        details = extract_details(text)

        new_data = {
            "sender": sender,
            "name": details["name"],
            "email": details["email"],
            "phone": details["phone"],
            "file": filename
        }
        messages.append(new_data)

        # Save to JSON file
        with open(DATA_FILE, "w") as f:
            json.dump(messages, f, indent=2)

        reply = (
            f"✅ Resume received!\n"
            f"Name: {details['name']}\n"
            f"Email: {details['email']}\n"
            f"Phone: {details['phone']}\n"
            f"Data saved successfully."
        )

    resp.message(reply)
    return str(resp)

if __name__ == "__main__":
    app.run(port=5000)
