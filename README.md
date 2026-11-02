# 🔗 Peerly – Smart Peer-to-Peer Learning Platform

## 📌 About the Project

**Peerly** is a Smart Peer-to-Peer Learning Platform designed to encourage collaborative learning among students by connecting individuals who want to share their knowledge with those who want to acquire new skills.

The platform allows students to offer skills they are proficient in, request skills they wish to learn, discover suitable learning partners through peer matching, and participate in collaborative study rooms.

Instead of relying entirely on traditional instructor-based learning, Peerly promotes a student-driven learning environment where knowledge is exchanged through peer-to-peer interactions.

## 🎯 Objectives

- Encourage collaborative and student-driven learning.
- Provide a platform for students to share their technical and non-technical skills.
- Connect students based on their teaching and learning interests.
- Simplify the process of finding suitable learning partners.
- Support group learning through collaborative study rooms.
- Maintain student profiles and learning activities using a database.

## ✨ Features

### 1. Student Registration and Login
- Create student accounts.
- Secure password hashing.
- Login and logout functionality.
- Store student information in MySQL.

### 2. Share a Skill
- Students can offer skills they know.
- Add descriptions of the skills they can teach.
- Specify their availability.
- Store skill offers in the database.

### 3. Request a Skill
- Students can request skills they want to learn.
- Specify their current learning level.
- Describe their learning requirements.
- Mention their availability.

### 4. Smart Peer Matching
- Discover students with matching teaching and learning interests.
- Identify potential learning partners.
- Display peer profiles and matching information.

### 5. Collaborative Study Rooms
- Create study rooms.
- Specify the learning topic.
- Add room descriptions.
- View available study rooms and their hosts.

### 6. Admin Database Dashboard
- View registered students.
- Monitor available skills.
- View learning offers and requests.
- Inspect peer matching records.
- Monitor messages, sessions, and study rooms.
- View database records directly through the browser.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, Flask |
| Database | MySQL |
| Database Connector | MySQL Connector/Python |
| Authentication | Flask Sessions |
| Password Security | Werkzeug Password Hashing |
| API Communication | REST API, JSON |
| Development Environment | Visual Studio Code |

## 🏗️ System Architecture

```text
             STUDENTS
                 |
                 v
       +--------------------+
       |   Peerly Frontend  |
       |   HTML, CSS, JS    |
       +--------------------+
                 |
                 | REST API
                 v
       +--------------------+
       |    Flask Backend   |
       |      Python        |
       +--------------------+
                 |
                 v
       +--------------------+
       |    MySQL Database  |
       |                    |
       |  - Users           |
       |  - Skills          |
       |  - Offers          |
       |  - Requests        |
       |  - Matches         |
       |  - Sessions        |
       |  - Messages        |
       |  - Study Rooms     |
       +--------------------+
                 ^
                 |
       +--------------------+
       |  Admin Dashboard   |
       |  Browser Interface |
       +--------------------+
```

## 🗄️ Database Structure

The application uses MySQL to store and manage platform information.

| Table | Purpose |
|---|---|
| users | Stores student and administrator details |
| skills | Stores available skills |
| user_skills | Stores teaching and learning preferences |
| learning_offers | Stores skills offered by students |
| learning_requests | Stores skills requested by students |
| matches | Stores peer matching records |
| sessions | Stores learning session information |
| messages | Stores student messages |
| study_rooms | Stores collaborative study rooms |
| room_members | Stores study room membership |

## 📂 Project Structure

```text
Smart-Peer-to-Peer-Learning-Platform/
│
├── app.py
├── database.sql
├── requirements.txt
├── .env
├── .gitignore
│
├── templates/
│   ├── index.html
│   └── admin.html
│
└── static/
    ├── style.css
    ├── app.js
    └── admin.js
```

## ⚙️ Installation and Setup

### Prerequisites

Install the following:

- Python 3.10 or above
- MySQL Server
- MySQL Workbench
- Visual Studio Code

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/Smart-Peer-to-Peer-Learning-Platform.git
```

Navigate to the project directory:

```bash
cd Smart-Peer-to-Peer-Learning-Platform
```

### Step 2: Create a Virtual Environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure MySQL

1. Open MySQL Workbench.
2. Connect to your MySQL server.
3. Open `database.sql`.
4. Execute the SQL script.
5. Verify that the `peer_learning` database and its tables have been created.

### Step 5: Configure Environment Variables

Create a `.env` file in the project root:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=YOUR_MYSQL_PASSWORD
MYSQL_DATABASE=peer_learning

SECRET_KEY=replace_with_a_secure_random_secret

ADMIN_EMAIL=admin@peerly.com
ADMIN_PASSWORD=CHANGE_THIS_ADMIN_PASSWORD
```

Replace the MySQL password with your actual MySQL credentials.

### Step 6: Run the Application

```bash
python app.py
```

The application will run at:

**Main Application:**
http://127.0.0.1:5000

**Admin Dashboard:**
http://127.0.0.1:5000/admin

## 🖥️ Application Usage

1. Register as a new student.
2. Log in using your registered credentials.
3. Navigate to the Share a Skill section to create a learning offer.
4. Use Request Knowledge to post a learning requirement.
5. Explore available offers and requests.
6. Discover potential peers through the matching section.
7. Create collaborative study rooms.
8. Administrators can access the database dashboard to inspect stored records.

## 🔐 Security

- Passwords are stored as hashes rather than plain text.
- Database queries use parameterized SQL statements.
- Administrator access is restricted by user roles.
- Sensitive configuration values are maintained in environment variables.

## 🚀 Future Enhancements

- Advanced peer matching using skill level, availability, and learning preferences.
- Real-time messaging between matched students.
- Accept and reject match requests.
- Join and manage collaborative study rooms.
- Schedule and track learning sessions.
- Student ratings and feedback.
- Email notifications for new matches and requests.
- Enhanced administrator controls and analytics.

## 🎓 Project Domain

- Web Application Development
- Database Management Systems
- Collaborative Learning Systems
- Peer-to-Peer Knowledge Sharing
- Student Community Platforms

## 👩‍💻 Contributors

Developed as an academic project to encourage collaborative learning and knowledge exchange among students.

## 📄 License

This project is intended for educational and academic purposes. A license can be added if the project is distributed for reuse.

---

**Peerly – Learn Together. Grow Together. Share Knowledge.** 🔗
