const API_URL = import.meta.env.VITE_API_URL;

async function request(url, options = {}) {
    const response = await fetch(
        `${API_URL}${url}`,
        options
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            errorText ||
            `HTTP error ${response.status}`
        );
    }

    return response.json();
}


export async function loginUser(
    nickname,
    password
) {
    return request("/api/Auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nickname,
            password
        })
    });
}


export async function registerUser(
    nickname,
    password
) {
    return request("/api/Auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nickname,
            password
        })
    });
}


export async function getChats(token) {
    return request("/api/Chats", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}


export async function getMessages(
    token,
    chatId
) {
    return request(
        `/api/Chats/${chatId}/messages`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}


export async function createPrivateChat(
    token,
    userId
) {
    return request(
        `/api/Chats/private`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                userId
            })
        }
    );
}


// ==========================================
// CREATE GROUP CHAT
// ==========================================

export async function createGroupChat(
    token,
    name,
    userIds
) {
    return request(
        "/api/Chats/group",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                userIds
            })
        }
    );
}


// ==========================================
// ADD GROUP MEMBER
// ==========================================

export async function addGroupMember(
    token,
    chatId,
    userId
) {
    return request(
        `/api/Chats/group/${chatId}/members`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                userId
            })
        }
    );
}


// ==========================================
// REMOVE GROUP MEMBER
// ==========================================

export async function removeGroupMember(
    token,
    chatId,
    userId
) {
    return request(
        `/api/Chats/group/${chatId}/members/${userId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}


// ==========================================
// DELETE CHAT / GROUP
// ==========================================

export async function deleteChat(
    token,
    chatId
) {
    return request(
        `/api/Chats/${chatId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}


// ==========================================
// SEARCH USERS
// ==========================================

export async function searchUsers(
    token,
    nickname
) {
    return request(
        `/api/Users/search?nickname=${encodeURIComponent(
            nickname
        )}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}


// ==========================================
// CHAT REQUESTS
// ==========================================

export async function getChatRequests(
    token
) {
    return request(
        "/api/Chats/requests",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}


export async function acceptChatRequest(
    token,
    requestId
) {
    return request(
        `/api/Chats/requests/${requestId}/accept`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}


export async function rejectChatRequest(
    token,
    requestId
) {
    return request(
        `/api/Chats/requests/${requestId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}


// ==========================================
// GROUP INVITATIONS
// ==========================================

export async function getGroupInvitations(
    token
) {
    return request(
        "/api/Chats/group-invitations",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}


export async function acceptGroupInvitation(
    token,
    invitationId
) {
    return request(
        `/api/Chats/group-invitations/${invitationId}/accept`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}


export async function ignoreGroupInvitation(
    token,
    invitationId
) {
    return request(
        `/api/Chats/group-invitations/${invitationId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}


export { API_URL };