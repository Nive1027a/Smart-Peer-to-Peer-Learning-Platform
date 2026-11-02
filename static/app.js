// ============================================================
// GLOBAL USER
// ============================================================

let currentUser =
    JSON.parse(
        localStorage.getItem("peerly_user") || "null"
    );


// ============================================================
// SHORTCUT
// ============================================================

const $ = id =>
    document.getElementById(id);


// ============================================================
// API HELPER
// ============================================================

function api(url, options = {}) {

    return fetch(
        url,
        {
            headers: {
                "Content-Type":
                    "application/json"
            },

            ...options
        }
    )
    .then(async response => {

        const data =
            await response
                .json()
                .catch(() => ({}));

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Something went wrong"
            );
        }

        return data;
    });
}


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        document
            .querySelectorAll(".nav-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        showPage(
                            button.dataset.page
                        );

                    }
                );

            });


        if (currentUser) {

            await startApp();

        } else {

            $("loginScreen")
                .classList
                .remove("hidden");

            $("registerScreen")
                .classList
                .add("hidden");

        }

    }
);


// ============================================================
// START APPLICATION
// ============================================================

async function startApp() {

    $("loginScreen")
        .classList
        .add("hidden");

    $("registerScreen")
        .classList
        .add("hidden");


    $("sideName").textContent =
        currentUser.name;


    $("sideInfo").textContent =
        `${currentUser.department} · Year ${currentUser.year}`;


    $("avatar").textContent =
        currentUser.name
            .charAt(0)
            .toUpperCase();


    const hour =
        new Date().getHours();


    let greeting;


    if (hour < 12) {

        greeting = "Good morning";

    } else if (hour < 17) {

        greeting = "Good afternoon";

    } else {

        greeting = "Good evening";

    }


    $("greeting").textContent =
        `${greeting}, ${
            currentUser.name.split(" ")[0]
        }`;


    await loadSkills();

    await loadMatches();

    await loadSessions();

    await loadRooms();
}


// ============================================================
// SHOW LOGIN
// ============================================================

function showLogin() {

    $("loginScreen")
        .classList
        .remove("hidden");

    $("registerScreen")
        .classList
        .add("hidden");
}


// ============================================================
// SHOW REGISTER
// ============================================================

function showRegister() {

    $("registerScreen")
        .classList
        .remove("hidden");

    $("loginScreen")
        .classList
        .add("hidden");
}


// ============================================================
// LOGIN
// ============================================================

async function login() {

    $("loginError").textContent = "";


    try {

        const data =
            await api(
                "/api/login",
                {
                    method: "POST",

                    body: JSON.stringify(
                        {
                            email:
                                $("loginEmail").value,

                            password:
                                $("loginPassword").value
                        }
                    )
                }
            );


        currentUser =
            data.user;


        localStorage.setItem(
            "peerly_user",
            JSON.stringify(
                currentUser
            )
        );


        await startApp();

    } catch (error) {

        $("loginError")
            .textContent =
            error.message;

    }
}


// ============================================================
// REGISTER
// ============================================================

async function register() {

    $("registerError")
        .textContent = "";


    try {

        await api(
            "/api/register",
            {
                method: "POST",

                body: JSON.stringify(
                    {
                        name:
                            $("regName").value,

                        email:
                            $("regEmail").value,

                        password:
                            $("regPassword").value,

                        department:
                            $("regDept").value,

                        year:
                            $("regYear").value
                    }
                )
            }
        );


        $("loginEmail").value =
            $("regEmail").value;


        $("loginPassword").value =
            $("regPassword").value;


        showLogin();


        await login();


    } catch (error) {

        $("registerError")
            .textContent =
            error.message;

    }
}


// ============================================================
// LOGOUT
// ============================================================

function logout() {

    localStorage.removeItem(
        "peerly_user"
    );

    currentUser = null;

    location.reload();
}


// ============================================================
// PAGE NAVIGATION
// ============================================================

function showPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(pageElement => {

            pageElement
                .classList
                .add("hidden");

        });


    $(`${page}Page`)
        .classList
        .remove("hidden");


    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });


    if (page === "discover") {

        loadOffers();

    }


    if (page === "learning") {

        loadLearning();

    }


    if (page === "rooms") {

        loadRooms();

    }

}


// ============================================================
// MODALS
// ============================================================

function openModal(id) {

    $(id)
        .classList
        .add("open");
}


function closeModal(id) {

    $(id)
        .classList
        .remove("open");
}
// ============================================================
// LOAD SKILLS
// ============================================================

async function loadSkills() {

    const skills = await api("/api/skills");

    const offerSelect = $("offerSkill");
    const requestSelect = $("requestSkill");

    offerSelect.innerHTML = `
        <option value="">Select a skill</option>
    `;

    requestSelect.innerHTML = `
        <option value="">Select a skill</option>
    `;

    skills.forEach(skill => {

        const offerOption = document.createElement("option");
        offerOption.value = skill.id;
        offerOption.textContent =
            `${skill.name} · ${skill.category}`;

        offerSelect.appendChild(offerOption);


        const requestOption = document.createElement("option");

        requestOption.value = skill.id;
        requestOption.textContent =
            `${skill.name} · ${skill.category}`;

        requestSelect.appendChild(requestOption);

    });
}
// ============================================================
// CREATE OFFER
// ============================================================
async function createOffer() {
    try {
        const skillId = $("offerSkill").value;
        const description = $("offerDescription").value.trim();

        console.log("Current user:", currentUser);
        console.log("Skill ID:", skillId);
        console.log("Description:", description);

        if (!currentUser || !currentUser.id) {
            alert("Please login again.");
            return;
        }

        if (!skillId) {
            alert("Please select a skill.");
            return;
        }

        if (!description) {
            alert("Please enter a description.");
            return;
        }

        const data = {
            user_id: Number(currentUser.id),
            skill_id: Number(skillId),
            description: description,
            level: $("offerLevel").value,
            availability: $("offerAvailability").value
        };

        console.log("Sending offer:", data);

        await api("/api/offers", {
            method: "POST",
            body: JSON.stringify(data)
        });

        closeModal("offerModal");

        $("offerDescription").value = "";

        await generateMatches();
        await loadMatches();

        alert("Your teaching offer is live.");

    } catch (error) {
        console.error("Create offer error:", error);
        alert(error.message);
    }
}

// ============================================================
// CREATE REQUEST
// ============================================================
async function createRequest() {
    try {
        const skillId = $("requestSkill").value;
        const description = $("requestDescription").value.trim();

        if (!currentUser || !currentUser.id) {
            alert("Please login again.");
            return;
        }

        if (!skillId) {
            alert("Please select a skill.");
            return;
        }

        if (!description) {
            alert("Please enter a description.");
            return;
        }

        const data = {
            user_id: Number(currentUser.id),
            skill_id: Number(skillId),
            description: description,
            level: $("requestLevel").value,
            availability: $("requestAvailability").value
        };

        console.log("Sending request:", data);

        await api("/api/requests", {
            method: "POST",
            body: JSON.stringify(data)
        });

        closeModal("requestModal");

        $("requestDescription").value = "";

        await generateMatches();
        await loadMatches();

        alert("Your learning request is live.");

    } catch (error) {
        console.error("Create request error:", error);
        alert(error.message);
    }
}
// ============================================================
// GENERATE MATCHES
// ============================================================

async function generateMatches() {

    await api(
        "/api/matches/generate",
        {
            method: "POST",

            body: JSON.stringify(
                {
                    user_id:
                        currentUser.id
                }
            )
        }
    );
}


// ============================================================
// LOAD MATCHES
// ============================================================

async function loadMatches() {

    try {

        await generateMatches();


        const matches =
            await api(
                `/api/matches/${currentUser.id}`
            );


        const grid =
            $("matchGrid");


        if (!matches.length) {

            grid.innerHTML = `
                <div class="match-card">

                    <b>
                        No matches yet.
                    </b>

                    <p>
                        Create a teaching offer
                        or learning request and
                        matching will happen
                        automatically.
                    </p>

                </div>
            `;

            return;
        }


        grid.innerHTML =
            matches
                .slice(0, 6)
                .map(match => {

                    const otherName =
                        match.requester_id === currentUser.id
                            ? match.teacher_name
                            : match.requester_name;


                    const otherRole =
                        match.requester_id === currentUser.id
                            ? "They teach"
                            : "They learn";


                    const peerId =
                        match.teacher_id === currentUser.id
                            ? match.requester_id
                            : match.teacher_id;


                    return `
                        <div class="match-card">

                            <div class="match-head">

                                <div class="person">

                                    <div class="avatar">
                                        ${otherName.charAt(0)}
                                    </div>

                                    <div>

                                        <b>
                                            ${escapeHtml(otherName)}
                                        </b>

                                        <small>
                                            Peer match ·
                                            ${escapeHtml(match.skill)}
                                        </small>

                                    </div>

                                </div>


                                <div class="score">

                                    ${Math.round(
                                        match.match_score
                                    )}%

                                    <br>

                                    <small>
                                        MATCH
                                    </small>

                                </div>

                            </div>


                            <div class="skills-row">

                                <div class="skill-box">

                                    <small>
                                        ${otherRole.toUpperCase()}
                                    </small>

                                    <b>
                                        ${escapeHtml(match.skill)}
                                    </b>

                                </div>


                                <div class="skill-box">

                                    <small>
                                        STATUS
                                    </small>

                                    <b>
                                        ${escapeHtml(match.status)}
                                    </b>

                                </div>

                            </div>


                            <p>
                                Skill overlap and
                                availability indicate
                                a potential learning
                                exchange.
                            </p>


                            <div class="match-foot">

                                <span>
                                    ✦ Verified match
                                </span>


                                <button
                                    class="primary"
                                    onclick="messagePeer(${peerId})"
                                >
                                    Message →
                                </button>

                            </div>

                        </div>
                    `;

                })
                .join("");


    } catch (error) {

        console.error(error);

    }
}


// ============================================================
// LOAD TEACHING OFFERS
// ============================================================

async function loadOffers() {

    const offers =
        await api(
            "/api/offers"
        );


    $("discoverList")
        .innerHTML =

        offers
            .map(
                offer => `

                    <div class="discover-card">

                        <span class="tag">
                            ${escapeHtml(
                                offer.category
                            )}
                        </span>


                        <h3>
                            ${escapeHtml(
                                offer.skill
                            )}
                        </h3>


                        <p>
                            ${escapeHtml(
                                offer.description
                            )}
                        </p>


                        <p>

                            <b>
                                ${escapeHtml(
                                    offer.name
                                )}
                            </b>

                            ·

                            ${escapeHtml(
                                offer.department
                            )}

                            · Year

                            ${offer.year}

                        </p>


                        <span class="tag">
                            ${escapeHtml(
                                offer.level
                            )}
                        </span>


                        <span class="tag">
                            ${escapeHtml(
                                offer.availability
                            )}
                        </span>

                    </div>

                `
            )
            .join("")

        ||

        `
            <div class="discover-card">
                No open teaching offers yet.
            </div>
        `;
}


// ============================================================
// LOAD LEARNING REQUESTS
// ============================================================

async function loadRequests() {

    const requests =
        await api(
            "/api/requests"
        );


    $("discoverList")
        .innerHTML =

        requests
            .map(
                request => `

                    <div class="discover-card">

                        <span class="tag">
                            ${escapeHtml(
                                request.category
                            )}
                        </span>


                        <h3>
                            Learning
                            ${escapeHtml(
                                request.skill
                            )}
                        </h3>


                        <p>
                            ${escapeHtml(
                                request.description
                            )}
                        </p>


                        <p>

                            <b>
                                ${escapeHtml(
                                    request.name
                                )}
                            </b>

                            ·

                            ${escapeHtml(
                                request.department
                            )}

                            · Year

                            ${request.year}

                        </p>


                        <span class="tag">
                            ${escapeHtml(
                                request.level
                            )}
                        </span>


                        <span class="tag">
                            ${escapeHtml(
                                request.availability
                            )}
                        </span>

                    </div>

                `
            )
            .join("")

        ||

        `
            <div class="discover-card">
                No open learning requests yet.
            </div>
        `;
}


// ============================================================
// LOAD SESSIONS
// ============================================================

async function loadSessions() {

    const sessions =
        await api(
            `/api/sessions/${currentUser.id}`
        );


    $("sessionList")
        .innerHTML =

        sessions
            .slice(0, 4)
            .map(
                session => `

                    <div class="session-row">

                        <div>

                            <b>
                                ${escapeHtml(
                                    session.title
                                )}
                            </b>

                            <small>
                                with
                                ${escapeHtml(
                                    session.teacher_id === currentUser.id
                                        ? session.learner_name
                                        : session.teacher_name
                                )}
                            </small>

                        </div>


                        <div>

                            <small>
                                ${escapeHtml(
                                    session.scheduled_at
                                )}
                            </small>

                        </div>


                        <div>

                            <div class="progress">
                                <i></i>
                            </div>

                            <small>
                                ${session.duration_minutes}
                                min
                            </small>

                        </div>

                    </div>
                `
            )
            .join("")

        ||

        `
            <div class="session-row">

                <div>

                    <b>
                        No sessions yet
                    </b>

                    <small>
                        Create a match first.
                    </small>

                </div>

            </div>
        `;
}


// ============================================================
// LOAD LEARNING PAGE
// ============================================================

async function loadLearning() {

    const matches =
        await api(
            `/api/matches/${currentUser.id}`
        );


    const sessions =
        await api(
            `/api/sessions/${currentUser.id}`
        );


    $("learningContent")
        .innerHTML = `

            <div class="section-title">

                <div>

                    <span>
                        MATCHES
                    </span>

                    <h2>
                        ${matches.length}
                        connected peers
                    </h2>

                </div>

            </div>


            <div class="discover-list">

                ${
                    matches.map(
                        match => `

                            <div class="discover-card">

                                <span class="tag">

                                    ${Math.round(
                                        match.match_score
                                    )}%
                                    match

                                </span>


                                <h3>
                                    ${escapeHtml(
                                        match.skill
                                    )}
                                </h3>


                                <p>

                                    Teacher:
                                    ${escapeHtml(
                                        match.teacher_name
                                    )}

                                    <br>

                                    Learner:
                                    ${escapeHtml(
                                        match.requester_name
                                    )}

                                </p>


                                <button
                                    class="primary"

                                    onclick="
                                        scheduleFromMatch(
                                            ${match.id},
                                            ${match.teacher_id},
                                            ${match.requester_id},
                                            '${escapeHtml(match.skill)}'
                                        )
                                    "
                                >
                                    Schedule session
                                </button>

                            </div>
                        `
                    ).join("")

                    ||

                    `
                        <div class="discover-card">
                            No matches yet.
                        </div>
                    `
                }

            </div>


            <div class="section-title">

                <div>

                    <span>
                        SESSIONS
                    </span>

                    <h2>
                        Upcoming
                    </h2>

                </div>

            </div>


            <div class="session-list">

                ${
                    sessions.map(
                        session => `

                            <div class="session-row">

                                <div>

                                    <b>
                                        ${escapeHtml(
                                            session.title
                                        )}
                                    </b>

                                    <small>

                                        ${escapeHtml(
                                            session.teacher_name
                                        )}

                                        →

                                        ${escapeHtml(
                                            session.learner_name
                                        )}

                                    </small>

                                </div>


                                <div>

                                    <small>
                                        ${escapeHtml(
                                            session.scheduled_at
                                        )}
                                    </small>

                                </div>


                                <div>

                                    <small>
                                        ${session.duration_minutes}
                                        minutes
                                    </small>

                                </div>

                            </div>
                        `
                    ).join("")

                    ||

                    `
                        <div class="session-row">

                            <div>

                                <b>
                                    No sessions scheduled.
                                </b>

                            </div>

                        </div>
                    `
                }

            </div>

        `;
}


// ============================================================
// SCHEDULE SESSION
// ============================================================

async function scheduleFromMatch(
    matchId,
    teacherId,
    learnerId,
    skill
) {

    const scheduled =
        prompt(
            "Enter date/time (YYYY-MM-DD HH:MM):"
        );


    if (!scheduled) {

        return;
    }


    const title =
        `${skill} learning session`;


    try {

        await api(
            "/api/sessions",
            {
                method: "POST",

                body: JSON.stringify(
                    {
                        match_id:
                            matchId,

                        title:
                            title,

                        teacher_id:
                            teacherId,

                        learner_id:
                            learnerId,

                        scheduled_at:
                            scheduled,

                        duration_minutes:
                            45
                    }
                )
            }
        );


        alert(
            "Session scheduled."
        );


        loadLearning();

        loadSessions();


    } catch (error) {

        alert(
            error.message
        );

    }
}


// ============================================================
// LOAD STUDY ROOMS
// ============================================================

async function loadRooms() {

    const rooms =
        await api(
            "/api/rooms"
        );


    $("roomList")
        .innerHTML =

        rooms
            .map(
                room => `

                    <div class="room-card">

                        <div>

                            <span class="tag">

                                ${room.member_count}/
                                ${room.max_members}
                                members

                            </span>


                            <h3>
                                ${escapeHtml(
                                    room.title
                                )}
                            </h3>


                            <p>

                                ${escapeHtml(
                                    room.topic
                                )}

                                ·

                                ${escapeHtml(
                                    room.scheduled_at
                                )}

                                ·

                                ${room.duration_minutes}
                                min

                                · hosted by

                                ${escapeHtml(
                                    room.host_name
                                )}

                            </p>

                        </div>


                        <button
                            class="primary"
                            onclick="
                                joinRoom(${room.id})
                            "
                        >
                            Join room
                        </button>

                    </div>
                `
            )
            .join("")

        ||

        `
            <div class="room-card">

                <div>

                    <h3>
                        No study rooms yet
                    </h3>

                    <p>
                        Create the first
                        collaborative room.
                    </p>

                </div>

            </div>
        `;
}


// ============================================================
// CREATE STUDY ROOM
// ============================================================

async function createRoom() {

    try {

        await api(
            "/api/rooms",
            {
                method: "POST",

                body: JSON.stringify(
                    {
                        host_id:
                            currentUser.id,

                        title:
                            $("roomTitle").value,

                        topic:
                            $("roomTopic").value,

                        scheduled_at:
                            $("roomDate")
                                .value
                                .replace(
                                    "T",
                                    " "
                                ),

                        duration_minutes:
                            $("roomDuration")
                                .value,

                        max_members:
                            $("roomMax")
                                .value
                    }
                )
            }
        );


        closeModal(
            "roomModal"
        );


        await loadRooms();


        alert(
            "Study room created."
        );


    } catch (error) {

        alert(
            error.message
        );

    }
}


// ============================================================
// JOIN STUDY ROOM
// ============================================================

async function joinRoom(roomId) {

    try {

        await api(
            `/api/rooms/${roomId}/join`,
            {
                method: "POST",

                body: JSON.stringify(
                    {
                        user_id:
                            currentUser.id
                    }
                )
            }
        );


        await loadRooms();


        alert(
            "You joined the study room."
        );


    } catch (error) {

        alert(
            error.message
        );

    }
}


// ============================================================
// SEND MESSAGE
// ============================================================

async function messagePeer(peerId) {

    const text =
        prompt(
            "Enter your message:"
        );


    if (!text) {

        return;
    }


    try {

        await api(
            "/api/messages",
            {
                method: "POST",

                body: JSON.stringify(
                    {
                        sender_id:
                            currentUser.id,

                        receiver_id:
                            peerId,

                        message:
                            text
                    }
                )
            }
        );


        alert(
            "Message sent."
        );


    } catch (error) {

        alert(
            error.message
        );

    }
}


// ============================================================
// HTML SECURITY
// ============================================================

function escapeHtml(value) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}