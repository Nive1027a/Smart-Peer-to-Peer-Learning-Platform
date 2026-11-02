from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error, IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "peer_learning")
}


# ============================================================
# DATABASE CONNECTION
# ============================================================

def get_db():
    return mysql.connector.connect(**DB_CONFIG)


def fetch_one(query, params=()):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(query, params)
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


def fetch_all(query, params=()):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(query, params)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def execute_query(query, params=()):
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute(query, params)
        conn.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        conn.close()


# ============================================================
# DEFAULT SKILLS
# ============================================================

def seed_skills():
    skills = [
        ("Python", "Code"),
        ("Java", "Code"),
        ("C++", "Code"),
        ("SQL", "Code"),
        ("Data Structures", "Code"),
        ("Machine Learning", "Code"),
        ("Web Development", "Code"),
        ("Data Analysis", "Code"),
        ("Figma", "Design"),
        ("UI/UX Design", "Design"),
        ("Illustration", "Design"),
        ("Portfolio Design", "Design"),
        ("English", "Languages"),
        ("Spanish", "Languages"),
        ("Communication", "Languages"),
        ("Business", "Business"),
        ("Data Storytelling", "Business"),
        ("Public Speaking", "Business"),
        ("Aptitude", "General")
    ]

    conn = get_db()
    cursor = conn.cursor()

    try:
        for name, category in skills:
            cursor.execute(
                """
                INSERT IGNORE INTO skills (name, category)
                VALUES (%s, %s)
                """,
                (name, category)
            )

        conn.commit()

    finally:
        cursor.close()
        conn.close()


# ============================================================
# HOME
# ============================================================

@app.route("/")
def home():
    return send_from_directory("templates", "index.html")


# ============================================================
# ADMIN PAGE
# ============================================================

@app.route("/admin")
def admin_page():
    return send_from_directory("templates", "admin.html")


# ============================================================
# REGISTER
# ============================================================

@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    department = data.get("department", "CSE")
    year = data.get("year", 2)

    if not name or not email or not password:
        return jsonify({
            "error": "Name, email and password are required"
        }), 400

    hashed_password = generate_password_hash(password)

    conn = get_db()
    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO users
            (name, email, password, department, year)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                name,
                email,
                hashed_password,
                department,
                year
            )
        )

        conn.commit()

        user_id = cursor.lastrowid

        return jsonify({
            "message": "Registration successful",
            "user_id": user_id
        })

    except IntegrityError:

        return jsonify({
            "error": "Email already registered"
        }), 400

    finally:
        cursor.close()
        conn.close()


# ============================================================
# LOGIN
# ============================================================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email", "").strip()
    password = data.get("password", "")

    user = fetch_one(
        """
        SELECT
            id,
            name,
            email,
            password,
            department,
            year,
            bio,
            avatar,
            created_at
        FROM users
        WHERE email = %s
        """,
        (email,)
    )

    if not user:
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    if not check_password_hash(user["password"], password):
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    user.pop("password", None)

    return jsonify({
        "user": user
    })


# ============================================================
# USER PROFILE
# ============================================================

@app.route("/api/users/<int:user_id>", methods=["GET"])
def get_user(user_id):

    user = fetch_one(
        """
        SELECT
            id,
            name,
            email,
            department,
            year,
            bio,
            avatar,
            created_at
        FROM users
        WHERE id = %s
        """,
        (user_id,)
    )

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    teach = fetch_all(
        """
        SELECT
            s.id,
            s.name,
            s.category
        FROM user_skills us
        JOIN skills s ON us.skill_id = s.id
        WHERE us.user_id = %s
        AND us.skill_type = 'teach'
        """,
        (user_id,)
    )

    learn = fetch_all(
        """
        SELECT
            s.id,
            s.name,
            s.category
        FROM user_skills us
        JOIN skills s ON us.skill_id = s.id
        WHERE us.user_id = %s
        AND us.skill_type = 'learn'
        """,
        (user_id,)
    )

    user["teach_skills"] = teach
    user["learn_skills"] = learn

    return jsonify(user)


@app.route("/api/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):

    data = request.get_json()

    name = data.get("name")
    department = data.get("department")
    year = data.get("year")
    bio = data.get("bio")
    avatar = data.get("avatar")

    execute_query(
        """
        UPDATE users
        SET
            name = %s,
            department = %s,
            year = %s,
            bio = %s,
            avatar = %s
        WHERE id = %s
        """,
        (
            name,
            department,
            year,
            bio,
            avatar,
            user_id
        )
    )

    return jsonify({
        "message": "Profile updated"
    })


# ============================================================
# SKILLS
# ============================================================

@app.route("/api/skills", methods=["GET"])
def get_skills():

    skills = fetch_all(
        """
        SELECT id, name, category
        FROM skills
        ORDER BY category, name
        """
    )

    return jsonify(skills)


@app.route("/api/users/<int:user_id>/skills", methods=["POST"])
def add_user_skill(user_id):

    data = request.get_json()

    skill_id = data.get("skill_id")
    skill_type = data.get("skill_type")

    if skill_type not in ["teach", "learn"]:
        return jsonify({
            "error": "skill_type must be teach or learn"
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO user_skills
            (user_id, skill_id, skill_type)
            VALUES (%s, %s, %s)
            """,
            (
                user_id,
                skill_id,
                skill_type
            )
        )

        conn.commit()

        return jsonify({
            "message": "Skill added"
        })

    except IntegrityError:

        return jsonify({
            "error": "Skill already added"
        }), 400

    finally:
        cursor.close()
        conn.close()


# ============================================================
# LEARNING OFFERS
# ============================================================

@app.route("/api/offers", methods=["POST"])
def create_offer():

    data = request.get_json()

    user_id = data.get("user_id")
    skill_id = data.get("skill_id")
    description = data.get("description", "").strip()
    level = data.get("level", "Beginner")
    availability = data.get("availability", "Flexible")

    if not user_id or not skill_id or not description:
        return jsonify({
            "error": "User, skill and description are required"
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO learning_offers
            (
                user_id,
                skill_id,
                description,
                level,
                availability
            )
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                user_id,
                skill_id,
                description,
                level,
                availability
            )
        )

        conn.commit()

        return jsonify({
            "message": "Learning offer created",
            "id": cursor.lastrowid
        })

    finally:
        cursor.close()
        conn.close()


@app.route("/api/offers", methods=["GET"])
def get_offers():

    offers = fetch_all(
        """
        SELECT
            o.id,
            o.user_id,
            o.skill_id,
            o.description,
            o.level,
            o.availability,
            o.status,
            o.created_at,
            s.name AS skill,
            s.category,
            u.name,
            u.department,
            u.year
        FROM learning_offers o
        JOIN skills s ON o.skill_id = s.id
        JOIN users u ON o.user_id = u.id
        ORDER BY o.id DESC
        """
    )

    return jsonify(offers)


# ============================================================
# LEARNING REQUESTS
# ============================================================

@app.route("/api/requests", methods=["POST"])
def create_request():

    data = request.get_json()

    user_id = data.get("user_id")
    skill_id = data.get("skill_id")
    description = data.get("description", "").strip()
    level = data.get("level", "Beginner")
    availability = data.get("availability", "Flexible")

    if not user_id or not skill_id or not description:
        return jsonify({
            "error": "User, skill and description are required"
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO learning_requests
            (
                user_id,
                skill_id,
                description,
                level,
                availability
            )
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                user_id,
                skill_id,
                description,
                level,
                availability
            )
        )

        conn.commit()

        return jsonify({
            "message": "Learning request created",
            "id": cursor.lastrowid
        })

    finally:
        cursor.close()
        conn.close()


@app.route("/api/requests", methods=["GET"])
def get_requests():

    requests = fetch_all(
        """
        SELECT
            r.id,
            r.user_id,
            r.skill_id,
            r.description,
            r.level,
            r.availability,
            r.status,
            r.created_at,
            s.name AS skill,
            s.category,
            u.name,
            u.department,
            u.year
        FROM learning_requests r
        JOIN skills s ON r.skill_id = s.id
        JOIN users u ON r.user_id = u.id
        ORDER BY r.id DESC
        """
    )

    return jsonify(requests)


# ============================================================
# MATCHING
# ============================================================

@app.route("/api/matches/generate", methods=["POST"])
def generate_matches():

    requests = fetch_all(
        """
        SELECT
            r.*,
            u.name AS requester_name
        FROM learning_requests r
        JOIN users u ON r.user_id = u.id
        WHERE r.status = 'open'
        """
    )

    offers = fetch_all(
        """
        SELECT
            o.*,
            u.name AS teacher_name
        FROM learning_offers o
        JOIN users u ON o.user_id = u.id
        WHERE o.status = 'open'
        """
    )

    conn = get_db()
    cursor = conn.cursor()

    created = 0

    try:

        for req in requests:

            for offer in offers:

                if req["skill_id"] != offer["skill_id"]:
                    continue

                if req["user_id"] == offer["user_id"]:
                    continue

                score = 70

                if req["level"] == offer["level"]:
                    score += 10

                if req["availability"] == offer["availability"]:
                    score += 10

                cursor.execute(
                    """
                    SELECT id
                    FROM user_skills
                    WHERE user_id = %s
                    AND skill_id = %s
                    AND skill_type = 'teach'
                    """,
                    (
                        req["user_id"],
                        req["skill_id"]
                    )
                )

                if cursor.fetchone():
                    score += 10

                score = min(score, 100)

                cursor.execute(
                    """
                    SELECT id
                    FROM matches
                    WHERE request_id = %s
                    AND offer_id = %s
                    """,
                    (
                        req["id"],
                        offer["id"]
                    )
                )

                if cursor.fetchone():
                    continue

                cursor.execute(
                    """
                    INSERT INTO matches
                    (
                        requester_id,
                        teacher_id,
                        request_id,
                        offer_id,
                        match_score,
                        status
                    )
                    VALUES (%s, %s, %s, %s, %s, 'pending')
                    """,
                    (
                        req["user_id"],
                        offer["user_id"],
                        req["id"],
                        offer["id"],
                        score
                    )
                )

                created += 1

        conn.commit()

    finally:
        cursor.close()
        conn.close()

    return jsonify({
        "message": "Matching completed",
        "created": created
    })


@app.route("/api/matches/<int:user_id>", methods=["GET"])
def get_matches(user_id):

    matches = fetch_all(
        """
        SELECT
            m.id,
            m.requester_id,
            m.teacher_id,
            m.request_id,
            m.offer_id,
            m.match_score,
            m.status,
            m.created_at,

            s.name AS skill,

            requester.name AS requester_name,
            teacher.name AS teacher_name

        FROM matches m

        JOIN learning_requests r
            ON m.request_id = r.id

        JOIN skills s
            ON r.skill_id = s.id

        JOIN users requester
            ON m.requester_id = requester.id

        JOIN users teacher
            ON m.teacher_id = teacher.id

        WHERE
            m.requester_id = %s
            OR m.teacher_id = %s

        ORDER BY m.match_score DESC
        """,
        (
            user_id,
            user_id
        )
    )

    return jsonify(matches)


# ============================================================
# SESSIONS
# ============================================================

@app.route("/api/sessions", methods=["POST"])
def create_session():

    data = request.get_json()

    match_id = data.get("match_id")
    title = data.get("title")
    teacher_id = data.get("teacher_id")
    learner_id = data.get("learner_id")
    scheduled_at = data.get("scheduled_at")
    duration_minutes = data.get("duration_minutes", 45)

    if not title or not teacher_id or not learner_id or not scheduled_at:
        return jsonify({
            "error": "Missing session details"
        }), 400

    session_id = execute_query(
        """
        INSERT INTO sessions
        (
            match_id,
            title,
            teacher_id,
            learner_id,
            scheduled_at,
            duration_minutes
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            match_id,
            title,
            teacher_id,
            learner_id,
            scheduled_at,
            duration_minutes
        )
    )

    return jsonify({
        "message": "Session scheduled",
        "id": session_id
    })


@app.route("/api/sessions/<int:user_id>", methods=["GET"])
def get_sessions(user_id):

    sessions = fetch_all(
        """
        SELECT
            s.id,
            s.match_id,
            s.title,
            s.teacher_id,
            s.learner_id,
            s.scheduled_at,
            s.duration_minutes,
            s.status,
            s.notes,
            teacher.name AS teacher_name,
            learner.name AS learner_name
        FROM sessions s

        JOIN users teacher
            ON s.teacher_id = teacher.id

        JOIN users learner
            ON s.learner_id = learner.id

        WHERE
            s.teacher_id = %s
            OR s.learner_id = %s

        ORDER BY s.scheduled_at ASC
        """,
        (
            user_id,
            user_id
        )
    )

    return jsonify(sessions)


# ============================================================
# MESSAGES
# ============================================================

@app.route("/api/messages", methods=["POST"])
def send_message():

    data = request.get_json()

    sender_id = data.get("sender_id")
    receiver_id = data.get("receiver_id")
    message = data.get("message", "").strip()

    if not sender_id or not receiver_id or not message:
        return jsonify({
            "error": "Message details are required"
        }), 400

    message_id = execute_query(
        """
        INSERT INTO messages
        (
            sender_id,
            receiver_id,
            message
        )
        VALUES (%s, %s, %s)
        """,
        (
            sender_id,
            receiver_id,
            message
        )
    )

    return jsonify({
        "message": "Message sent",
        "id": message_id
    })


@app.route("/api/messages/<int:user1>/<int:user2>", methods=["GET"])
def get_messages(user1, user2):

    messages = fetch_all(
        """
        SELECT
            m.id,
            m.sender_id,
            m.receiver_id,
            m.message,
            m.created_at,
            m.is_read,
            sender.name AS sender_name,
            receiver.name AS receiver_name

        FROM messages m

        JOIN users sender
            ON m.sender_id = sender.id

        JOIN users receiver
            ON m.receiver_id = receiver.id

        WHERE
            (m.sender_id = %s AND m.receiver_id = %s)
            OR
            (m.sender_id = %s AND m.receiver_id = %s)

        ORDER BY m.created_at ASC
        """,
        (
            user1,
            user2,
            user2,
            user1
        )
    )

    conn = get_db()
    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            UPDATE messages
            SET is_read = 1
            WHERE sender_id = %s
            AND receiver_id = %s
            """,
            (
                user2,
                user1
            )
        )

        conn.commit()

    finally:
        cursor.close()
        conn.close()

    return jsonify(messages)


# ============================================================
# STUDY ROOMS
# ============================================================

@app.route("/api/rooms", methods=["POST"])
def create_room():

    data = request.get_json()

    host_id = data.get("host_id")
    title = data.get("title")
    topic = data.get("topic")
    scheduled_at = data.get("scheduled_at")
    duration_minutes = data.get("duration_minutes", 45)
    max_members = data.get("max_members", 8)

    if not host_id or not title or not topic or not scheduled_at:
        return jsonify({
            "error": "Room details are required"
        }), 400

    room_id = execute_query(
        """
        INSERT INTO study_rooms
        (
            host_id,
            title,
            topic,
            scheduled_at,
            duration_minutes,
            max_members
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            host_id,
            title,
            topic,
            scheduled_at,
            duration_minutes,
            max_members
        )
    )

    return jsonify({
        "message": "Study room created",
        "id": room_id
    })


@app.route("/api/rooms", methods=["GET"])
def get_rooms():

    rooms = fetch_all(
        """
        SELECT
            r.id,
            r.host_id,
            r.title,
            r.topic,
            r.scheduled_at,
            r.duration_minutes,
            r.max_members,
            r.status,
            u.name AS host_name,

            (
                SELECT COUNT(*)
                FROM room_members rm
                WHERE rm.room_id = r.id
            ) AS member_count

        FROM study_rooms r

        JOIN users u
            ON r.host_id = u.id

        ORDER BY r.scheduled_at ASC
        """
    )

    return jsonify(rooms)


@app.route("/api/rooms/<int:room_id>/join", methods=["POST"])
def join_room(room_id):

    data = request.get_json()

    user_id = data.get("user_id")

    if not user_id:
        return jsonify({
            "error": "User ID required"
        }), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                max_members,
                (
                    SELECT COUNT(*)
                    FROM room_members
                    WHERE room_id = %s
                ) AS member_count
            FROM study_rooms
            WHERE id = %s
            """,
            (
                room_id,
                room_id
            )
        )

        room = cursor.fetchone()

        if not room:
            return jsonify({
                "error": "Room not found"
            }), 404

        if room["member_count"] >= room["max_members"]:
            return jsonify({
                "error": "Room is full"
            }), 400

        cursor.execute(
            """
            INSERT INTO room_members
            (
                room_id,
                user_id
            )
            VALUES (%s, %s)
            """,
            (
                room_id,
                user_id
            )
        )

        conn.commit()

        return jsonify({
            "message": "Joined room"
        })

    except IntegrityError:

        return jsonify({
            "error": "You already joined this room"
        }), 400

    finally:
        cursor.close()
        conn.close()


# ============================================================
# DASHBOARD
# ============================================================

@app.route("/api/dashboard/<int:user_id>", methods=["GET"])
def dashboard(user_id):

    user = fetch_one(
        """
        SELECT
            id,
            name,
            email,
            department,
            year,
            bio,
            avatar
        FROM users
        WHERE id = %s
        """,
        (user_id,)
    )

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    offers = fetch_one(
        """
        SELECT COUNT(*) AS count
        FROM learning_offers
        WHERE user_id = %s
        """,
        (user_id,)
    )["count"]

    requests = fetch_one(
        """
        SELECT COUNT(*) AS count
        FROM learning_requests
        WHERE user_id = %s
        """,
        (user_id,)
    )["count"]

    matches = fetch_one(
        """
        SELECT COUNT(*) AS count
        FROM matches
        WHERE requester_id = %s
        OR teacher_id = %s
        """,
        (
            user_id,
            user_id
        )
    )["count"]

    sessions = fetch_one(
        """
        SELECT COUNT(*) AS count
        FROM sessions
        WHERE teacher_id = %s
        OR learner_id = %s
        """,
        (
            user_id,
            user_id
        )
    )["count"]

    rooms = fetch_one(
        """
        SELECT COUNT(*) AS count
        FROM room_members
        WHERE user_id = %s
        """,
        (user_id,)
    )["count"]

    return jsonify({
        "user": user,
        "offers": offers,
        "requests": requests,
        "matches": matches,
        "sessions": sessions,
        "rooms": rooms
    })


# ============================================================
# ADMIN DATA
# ============================================================

@app.route("/api/admin/data", methods=["GET"])
def admin_data():

    stats = {
        "users": fetch_one(
            "SELECT COUNT(*) AS count FROM users"
        )["count"],

        "skills": fetch_one(
            "SELECT COUNT(*) AS count FROM skills"
        )["count"],

        "offers": fetch_one(
            "SELECT COUNT(*) AS count FROM learning_offers"
        )["count"],

        "requests": fetch_one(
            "SELECT COUNT(*) AS count FROM learning_requests"
        )["count"],

        "matches": fetch_one(
            "SELECT COUNT(*) AS count FROM matches"
        )["count"],

        "sessions": fetch_one(
            "SELECT COUNT(*) AS count FROM sessions"
        )["count"],

        "messages": fetch_one(
            "SELECT COUNT(*) AS count FROM messages"
        )["count"],

        "rooms": fetch_one(
            "SELECT COUNT(*) AS count FROM study_rooms"
        )["count"]
    }

    users = fetch_all(
        """
        SELECT
            id,
            name,
            email,
            department,
            year,
            bio,
            avatar,
            created_at
        FROM users
        ORDER BY id DESC
        """
    )

    skills = fetch_all(
        """
        SELECT
            id,
            name,
            category
        FROM skills
        ORDER BY id
        """
    )

    offers = fetch_all(
        """
        SELECT
            o.id,
            u.name AS user_name,
            s.name AS skill,
            o.description,
            o.level,
            o.availability,
            o.status,
            o.created_at
        FROM learning_offers o
        JOIN users u ON o.user_id = u.id
        JOIN skills s ON o.skill_id = s.id
        ORDER BY o.id DESC
        """
    )

    requests = fetch_all(
        """
        SELECT
            r.id,
            u.name AS user_name,
            s.name AS skill,
            r.description,
            r.level,
            r.availability,
            r.status,
            r.created_at
        FROM learning_requests r
        JOIN users u ON r.user_id = u.id
        JOIN skills s ON r.skill_id = s.id
        ORDER BY r.id DESC
        """
    )

    matches = fetch_all(
        """
        SELECT
            m.id,
            requester.name AS requester,
            teacher.name AS teacher,
            s.name AS skill,
            m.match_score,
            m.status,
            m.created_at
        FROM matches m

        JOIN users requester
            ON m.requester_id = requester.id

        JOIN users teacher
            ON m.teacher_id = teacher.id

        JOIN learning_requests r
            ON m.request_id = r.id

        JOIN skills s
            ON r.skill_id = s.id

        ORDER BY m.id DESC
        """
    )

    sessions = fetch_all(
        """
        SELECT
            s.id,
            s.title,
            teacher.name AS teacher,
            learner.name AS learner,
            s.scheduled_at,
            s.duration_minutes,
            s.status
        FROM sessions s

        JOIN users teacher
            ON s.teacher_id = teacher.id

        JOIN users learner
            ON s.learner_id = learner.id

        ORDER BY s.id DESC
        """
    )

    messages = fetch_all(
        """
        SELECT
            m.id,
            sender.name AS sender,
            receiver.name AS receiver,
            m.message,
            m.created_at,
            m.is_read
        FROM messages m

        JOIN users sender
            ON m.sender_id = sender.id

        JOIN users receiver
            ON m.receiver_id = receiver.id

        ORDER BY m.id DESC
        """
    )

    rooms = fetch_all(
        """
        SELECT
            r.id,
            u.name AS host,
            r.title,
            r.topic,
            r.scheduled_at,
            r.duration_minutes,
            r.max_members,
            r.status,

            (
                SELECT COUNT(*)
                FROM room_members rm
                WHERE rm.room_id = r.id
            ) AS member_count

        FROM study_rooms r

        JOIN users u
            ON r.host_id = u.id

        ORDER BY r.id DESC
        """
    )

    return jsonify({
        "stats": stats,
        "users": users,
        "skills": skills,
        "offers": offers,
        "requests": requests,
        "matches": matches,
        "sessions": sessions,
        "messages": messages,
        "rooms": rooms
    })


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    try:

        connection = get_db()
        connection.close()

        seed_skills()

        print("")
        print("======================================")
        print("       PEERLY PLATFORM")
        print("======================================")
        print("MySQL connection successful!")
        print("Database: peer_learning")
        print("")
        print("Website : http://127.0.0.1:5000")
        print("Admin   : http://127.0.0.1:5000/admin")
        print("======================================")
        print("")

        app.run(debug=True)

    except Error as e:

        print("")
        print("MYSQL CONNECTION ERROR")
        print("--------------------------------------")
        print(e)
        print("")
        print("Check your .env file:")
        print("DB_HOST")
        print("DB_USER")
        print("DB_PASSWORD")
        print("DB_NAME")
        print("--------------------------------------")