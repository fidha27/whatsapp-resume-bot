# WhatsApp Resume Parser

A simple demo system to automatically read messages and files received on WhatsApp via Twilio, extract basic details from resumes (PDF/DOCX), and store the parsed data in **Google Sheets** and a local JSON file. Includes a web dashboard to view all received messages.

---

## Features

- Receive WhatsApp messages using **Twilio Sandbox**
- Detect and download **resume files** (PDF or DOCX)
- Extract **Name, Email, Phone Number** using Python regex
- Store extracted data in **Google Sheets** and local `data.json`
- Simple **web dashboard** to view all messages

---

## Technologies Used

- **Python 3** + **Flask** (web server)
- **Twilio API** (WhatsApp messaging)
- **ngrok** (expose local server to the internet)
- **PyPDF2** / **python-docx** (extract text from PDFs and DOCX)
- **gspread + Google API** (store data in Google Sheets)
- **HTML/CSS** (web dashboard)

---

## Folder Structure

whatsapp-demo/
│
├── app.py # Main Flask application
├── data.json # Stored messages (auto-generated)
├── uploads/ # Uploaded resumes (PDF/DOCX)
├── google_creds.json # Google service account credentials (ignored in git)
├── requirements.txt # Python dependencies
└── templates/
└── index.html # Web dashboard


---

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/whatsapp-resume-parser.git
cd whatsapp-resume-parser

## Create virtual environment
python -m venv venv

3. Activate virtual environment

Windows (CMD):

venv\Scripts\activate


PowerShell:

.\venv\Scripts\activate


Mac/Linux:

source venv/bin/activate

4. Install dependencies
pip install -r requirements.txt

5. Setup Google Sheets API

Create a Google Service Account (download JSON credentials).

Share your Google Sheet with the service account email (Editor access).

Save the JSON file as google_creds.json in project root.

Update SHEET_ID in app.py with your Google Sheet ID.

6. Run Flask App
python app.py

7. Start ngrok
ngrok http 5000


Copy the https URL from ngrok (e.g., https://abcd1234.ngrok.io).

8. Configure Twilio Sandbox

Go to Twilio WhatsApp Sandbox

Paste ngrok URL + /whatsapp in “WHEN A MESSAGE COMES IN” → Save.

Send the join code to Twilio sandbox number from your WhatsApp to link your number.

9. Test

Send a text or resume file (PDF/DOCX) via WhatsApp.

Check web dashboard: http://127.0.0.1:5000

Check Google Sheet: new row added automatically.

Notes

ngrok URLs change every time you restart → update Twilio webhook each time.

Do not commit google_creds.json to GitHub (sensitive info).

Uploaded resumes are stored in uploads/ folder (optional cleanup needed).

License

MIT License © 2025


---
