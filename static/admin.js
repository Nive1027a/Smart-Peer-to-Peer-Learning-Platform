// ============================================================
// PEERLY ADMIN DASHBOARD
// ============================================================


// ============================================================
// API HELPER
// ============================================================

async function api(url) {

    const response =
        await fetch(url);


    const data =
        await response
            .json()
            .catch(() => ({}));


    if (!response.ok) {

        throw new Error(
            data.error ||
            "Failed to load data."
        );

    }


    return data;
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


// ============================================================
// EMPTY TABLE
// ============================================================

function emptyRow(
    columns,
    message = "No records found."
) {

    return `
        <tr>
            <td
                colspan="${columns}"
                class="empty-row"
            >
                ${escapeHtml(message)}
            </td>
        </tr>
    `;
}


// ============================================================
// LOAD STATISTICS
// ============================================================

async function loadStats() {

    const stats =
        await api(
            "/api/admin/stats"
        );


    document.getElementById(
        "usersCount"
    ).textContent =
        stats.users;


    document.getElementById(
        "skillsCount"
    ).textContent =
        stats.skills;


    document.getElementById(
        "offersCount"
    ).textContent =
        stats.learning_offers;


    document.getElementById(
        "requestsCount"
    ).textContent =
        stats.learning_requests;


    document.getElementById(
        "matchesCount"
    ).textContent =
        stats.matches;


    document.getElementById(
        "sessionsCount"
    ).textContent =
        stats.sessions;


    document.getElementById(
        "messagesCount"
    ).textContent =
        stats.messages;


    document.getElementById(
        "roomsCount"
    ).textContent =
        stats.study_rooms;
}


// ============================================================
// USERS
// ============================================================

async function loadUsers() {

    const data =
        await api(
            "/api/admin/users"
        );


    document.getElementById(
        "usersRecords"
    ).textContent =
        `${data.length} records`;


    const table =
        document.getElementById(
            "usersTable"
        );


    if (!data.length) {

        table.innerHTML =
            emptyRow(6);

        return;
    }


    table.innerHTML =
        data.map(
            user => `

                <tr>

                    <td>
                        ${user.id}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(
                                user.name
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            user.email
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            user.department
                        )}
                    </td>

                    <td>
                        Year ${user.year}
                    </td>

                    <td>
                        ${escapeHtml(
                            user.created_at
                        )}
                    </td>

                </tr>

            `
        ).join("");
}


// ============================================================
// SKILLS
// ============================================================

async function loadSkills() {

    const data =
        await api(
            "/api/admin/skills"
        );


    document.getElementById(
        "skillsRecords"
    ).textContent =
        `${data.length} records`;


    const table =
        document.getElementById(
            "skillsTable"
        );


    if (!data.length) {

        table.innerHTML =
            emptyRow(3);

        return;
    }


    table.innerHTML =
        data.map(
            skill => `

                <tr>

                    <td>
                        ${skill.id}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(
                                skill.name
                            )}
                        </strong>
                    </td>

                    <td>

                        <span class="tag">

                            ${escapeHtml(
                                skill.category
                            )}

                        </span>

                    </td>

                </tr>

            `
        ).join("");
}


// ============================================================
// OFFERS
// ============================================================

async function loadOffers() {

    const data =
        await api(
            "/api/admin/offers"
        );


    document.getElementById(
        "offersRecords"
    ).textContent =
        `${data.length} records`;


    const table =
        document.getElementById(
            "offersTable"
        );


    if (!data.length) {

        table.innerHTML =
            emptyRow(7);

        return;
    }


    table.innerHTML =
        data.map(
            offer => `

                <tr>

                    <td>
                        ${offer.id}
                    </td>

                    <td>
                        ${escapeHtml(
                            offer.user_name
                        )}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(
                                offer.skill
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            offer.category
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            offer.level
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            offer.availability
                        )}
                    </td>

                    <td>
                        <span class="status">
                            ${escapeHtml(
                                offer.status
                            )}
                        </span>
                    </td>

                </tr>

            `
        ).join("");
}


// ============================================================
// REQUESTS
// ============================================================

async function loadRequests() {

    const data =
        await api(
            "/api/admin/requests"
        );


    document.getElementById(
        "requestsRecords"
    ).textContent =
        `${data.length} records`;


    const table =
        document.getElementById(
            "requestsTable"
        );


    if (!data.length) {

        table.innerHTML =
            emptyRow(7);

        return;
    }


    table.innerHTML =
        data.map(
            item => `

                <tr>

                    <td>
                        ${item.id}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.user_name
                        )}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(
                                item.skill
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            item.category
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.level
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.availability
                        )}
                    </td>

                    <td>
                        <span class="status">
                            ${escapeHtml(
                                item.status
                            )}
                        </span>
                    </td>

                </tr>

            `
        ).join("");
}


// ============================================================
// MATCHES
// ============================================================

async function loadMatches() {

    const data =
        await api(
            "/api/admin/matches"
        );


    document.getElementById(
        "matchesRecords"
    ).textContent =
        `${data.length} records`;


    const table =
        document.getElementById(
            "matchesTable"
        );


    if (!data.length) {

        table.innerHTML =
            emptyRow(6);

        return;
    }


    table.innerHTML =
        data.map(
            match => `

                <tr>

                    <td>
                        ${match.id}
                    </td>

                    <td>
                        ${escapeHtml(
                            match.requester_name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            match.teacher_name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            match.skill
                        )}
                    </td>

                    <td>

                        <span class="score">
                            ${Math.round(
                                match.match_score
                            )}%
                        </span>

                    </td>

                    <td>
                        <span class="status">
                            ${escapeHtml(
                                match.status
                            )}
                        </span>
                    </td>

                </tr>

            `
        ).join("");
}


// ============================================================
// SESSIONS
// ============================================================

async function loadSessions() {

    const data =
        await api(
            "/api/admin/sessions"
        );


    document.getElementById(
        "sessionsRecords"
    ).textContent =
        `${data.length} records`;


    const table =
        document.getElementById(
            "sessionsTable"
        );


    if (!data.length) {

        table.innerHTML =
            emptyRow(7);

        return;
    }


    table.innerHTML =
        data.map(
            session => `

                <tr>

                    <td>
                        ${session.id}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(
                                session.title
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            session.teacher_name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            session.learner_name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            session.scheduled_at
                        )}
                    </td>

                    <td>
                        ${session.duration_minutes}
                        min
                    </td>

                    <td>
                        <span class="status">
                            ${escapeHtml(
                                session.status
                            )}
                        </span>
                    </td>

                </tr>

            `
        ).join("");
}


// ============================================================
// MESSAGES
// ============================================================

async function loadMessages() {

    const data =
        await api(
            "/api/admin/messages"
        );


    document.getElementById(
        "messagesRecords"
    ).textContent =
        `${data.length} records`;


    const table =
        document.getElementById(
            "messagesTable"
        );


    if (!data.length) {

        table.innerHTML =
            emptyRow(6);

        return;
    }


    table.innerHTML =
        data.map(
            message => `

                <tr>

                    <td>
                        ${message.id}
                    </td>

                    <td>
                        ${escapeHtml(
                            message.sender_name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            message.receiver_name
                        )}
                    </td>

                    <td class="message-cell">
                        ${escapeHtml(
                            message.message
                        )}
                    </td>

                    <td>

                        ${
                            message.is_read
                            ? "Yes"
                            : "No"
                        }

                    </td>

                    <td>
                        ${escapeHtml(
                            message.created_at
                        )}
                    </td>

                </tr>

            `
        ).join("");
}


// ============================================================
// ROOMS
// ============================================================

async function loadRooms() {

    const data =
        await api(
            "/api/admin/rooms"
        );


    document.getElementById(
        "roomsRecords"
    ).textContent =
        `${data.length} records`;


    const table =
        document.getElementById(
            "roomsTable"
        );


    if (!data.length) {

        table.innerHTML =
            emptyRow(7);

        return;
    }


    table.innerHTML =
        data.map(
            room => `

                <tr>

                    <td>
                        ${room.id}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(
                                room.title
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            room.topic
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            room.host_name
                        )}
                    </td>

                    <td>
                        ${room.member_count}
                        /
                        ${room.max_members}
                    </td>

                    <td>
                        ${escapeHtml(
                            room.scheduled_at
                        )}
                    </td>

                    <td>
                        <span class="status">
                            ${escapeHtml(
                                room.status
                            )}
                        </span>
                    </td>

                </tr>

            `
        ).join("");
}


// ============================================================
// LOAD EVERYTHING
// ============================================================

async function loadAdminData() {

    try {

        await Promise.all([

            loadStats(),

            loadUsers(),

            loadSkills(),

            loadOffers(),

            loadRequests(),

            loadMatches(),

            loadSessions(),

            loadMessages(),

            loadRooms()

        ]);


        console.log(
            "Admin data loaded successfully."
        );


    } catch (error) {

        console.error(
            error
        );

        alert(
            "Could not load admin data: "
            + error.message
        );

    }
}


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    loadAdminData
);