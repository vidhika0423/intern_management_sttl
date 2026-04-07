// services/dashboard/DepartmentApi.js
export async function getAllDepartments() {
    try {
        const res = await fetch('/api/departments')
        const data = await res.json()

        // Guard against unexpected shapes
        return data?.data?.departments ?? data?.departments ?? []
    } catch (error) {
        console.error('Department error:', error.message)
        return { error: error.message, ok: false }
    }
}
export const getManagerDepartment = async (userId) => {
    try {
        // Query by head_user_id (the mentor/manager's user ID), not by department UUID
        const res = await fetch(`/api/departments/by-mentor?userId=${userId}`);
        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Manager Department error:', error.message);
        return { error: error.message, success: false };
    }
};