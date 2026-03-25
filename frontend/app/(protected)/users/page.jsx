"use client";

import { getAllUsers } from "@/services/dashboard/AdminStats";
import { deleteUser, updateUser } from "@/services/UserApi";
import { useFormik } from "formik";
import { Trash2, UserRoundPen } from "lucide-react";
import React, { useEffect, useState } from "react";

function page() {
  const [users, setUsers] = useState();
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const {
    values,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    touched,
    errors,
  } = useFormik({
    initialValues: {
      name: "",
      email: "",
      role: "",
    },
    onSubmit: (values) => {
      updateUser(editingUserId, values.name, values.email, values.role)
        .then((data) => {
          console.log(data);
          setEditingUserId(null);
        })
        .catch(console.error);
    },
  });

  useEffect(() => {
    setLoading(true);
    getAllUsers()
      .then((data) => {
        const filterUsers = data?.data?.users?.filter(
          (user) => user.role !== "admin",
        );
        setUsers(filterUsers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white p-5 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6">Manage Users</h2>
          <div className="flex flex-col gap-4">
            {users?.map((user) => (
              <div
                key={user.id}
                className="flex justify-between border border-gray-200 p-2 rounded-lg px-4 py-2 hover:shadow-md hover:border-[#1a3aff]/20 hover:shadow-[#1a3aff]/20 transition-all duration-200"
              >
                <div>
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-500 capitalize">
                    {user.role}
                  </div>
                  <div
                    className="cursor-pointer p-1 rounded hover:scale-110 transition-all duration-200"
                    onClick={() => {
                      setEditingUserId(user.id);
                      setValues({
                        name: user.name,
                        email: user.email,
                        role: user.role,
                      });
                    }}
                  >
                    <UserRoundPen className="text-blue-500" size={20} />
                  </div>
                  <div onClick={() => setConfirmDelete(user.id)}>
                    <Trash2 className="text-red-500" size={20} />
                  </div>

                  {confirmDelete === user.id && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                      <div className="bg-white w-1/4 p-5 rounded-2xl">
                        <h2 className="text-2xl font-bold mb-6">Confirm Delete</h2>
                        <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this user?</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:scale-110 transition-all duration-200"
                            onClick={() => setConfirmDelete(null)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="bg-red-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:scale-110 transition-all duration-200"
                            onClick={() => {
                              deleteUser(user.id)
                                .then((data) => {
                                  console.log(data);
                                  // setUsers(users.filter((u) => u.id !== user.id));
                                  setConfirmDelete(null);
                                })
                                .catch(console.error);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {editingUserId === user.id && (
                  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white w-1/4 p-5 rounded-2xl">
                      <h2 className="text-2xl font-bold mb-6">Edit User</h2>
                      <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                      >
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold">Name</label>
                          <input
                            type="text"
                            name="name"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.name}
                            className="border border-gray-200 p-2 rounded-lg"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold">Email</label>
                          <input
                            type="email"
                            name="email"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.email}
                            className="border border-gray-200 p-2 rounded-lg"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold">Role</label>
                          <select
                            name="role"
                            id="role"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.role}
                            className="border border-gray-200 p-2 rounded-lg"
                          >
                            <option value="admin">Admin</option>
                            <option value="mentor">Mentor</option>
                            <option value="hr">HR</option>
                            <option value="intern">Intern</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:scale-110 transition-all duration-200"
                            onClick={() => setEditingUserId(null)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-green-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:scale-110 transition-all duration-200"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default page;
