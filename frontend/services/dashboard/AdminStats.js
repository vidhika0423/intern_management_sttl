export const getAdminStats = async () => {
    try {
        const res = await fetch("http://localhost:3000/api/dashboard")
        const data = await res.json()
        return data
    } catch (error) {
        console.log(error)
    }
}

export const getAllUsers = async () => {
    try {
        const res = await fetch("http://localhost:3000/api/users")
        const data = await res.json()
        return data
    } catch (error) {
        console.log(error)
    }
}
