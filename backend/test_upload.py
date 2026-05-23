import requests

url = "http://127.0.0.1:8008/api/screen"
files = {
    "file": ("test_resume.txt", "John Doe\nEmail: john.doe@example.com\nPhone: 123-456-7890\nSkills: React, Node.js, Python, AWS\nExperience:\nSenior Software Engineer at TechCorp (2020-2023)\n- Developed frontend features using React\n- Created REST APIs using Node.js and Express")
}

try:
    print("Uploading test resume...")
    r = requests.post(url, files=files)
    print("Status Code:", r.status_code)
    if r.status_code == 200:
        print("Response JSON:")
        print(r.json())
    else:
        print("Error Response:", r.text)
except Exception as e:
    print("Request failed:", e)
