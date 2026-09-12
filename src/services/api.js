const API_URL = "https://localhost:7211";

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
        `/api/Chats/private/${userId}`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

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

export { API_URL };