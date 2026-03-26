export const createUser = async (name, email, password, role) => {
    const response = await fetch(`/api/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
    })
    return response.json()
}

export const updateUser = async (id, name, email, role) => {
    const response = await fetch(`/api/users/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, name, email, role }),
    })
    return response.json()
}

export const deleteUser = async (id) => {
    const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
    })
    return response.json()
}
