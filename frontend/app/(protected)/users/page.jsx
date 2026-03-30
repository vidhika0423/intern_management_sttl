"use client";

import { getAllUsers } from "@/services/dashboard/AdminStats";
import { deleteUser } from "@/services/UserApi";
import { Trash2, UserRoundPen } from "lucide-react";
import React, { useEffect, useState } from "react";
import UserModal from "@/components/dashboard/UserModal";

function UsersPage() {
  const [users, setUsers] = useState();
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    getAllUsers()
      .then((res) => {
        if (res.ok) {
          const filterUsers = res.data?.filter(
            (user) => user.role !== "admin",
          );
          setUsers(filterUsers || []);
        } else {
          console.error(res.message);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Manage Users</h2>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-(--accent) text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-(--accent-2) hover:bg-(--accent-2) transition-all duration-200"
            >
              Add User
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {users?.length <= 0 ? (
              <div>No users found</div>
            ) : (
              users?.map((user) => (
              <div
                key={user.id}
                className="flex justify-between border border-gray-200 p-2 rounded-lg px-4 py-2 hover:shadow-md hover:border-[#1a3aff]/20 hover:shadow-[#1a3aff]/20 transition-all duration-200"
              >
                <div>
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-500 capitalize px-2">
                    {user.role}
                  </div>
                  <div
                    className="cursor-pointer p-1 rounded hover:scale-110 transition-all duration-200"
                    onClick={() => setEditingUser(user)}
                  >
                    <UserRoundPen className="text-blue-500" size={20} />
                  </div>
                  <div 
                    className="cursor-pointer p-1 rounded hover:scale-110 transition-all duration-200"
                    onClick={() => setConfirmDelete(user.id)}
                  >
                    <Trash2 className="text-red-500" size={20} />
                  </div>

                  {confirmDelete === user.id && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                      <div className="bg-white w-full max-w-sm p-5 rounded-2xl animate-fadeUp">
                        <h2 className="text-xl font-bold mb-2">Confirm Delete</h2>
                        <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this user?</p>
                        <div className="flex gap-3 justify-end">
                          <button
                            type="button"
                            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setConfirmDelete(null)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-red-600 transition-all duration-200"
                            onClick={() => {
                              deleteUser(user.id)
                                .then((data) => {
                                  console.log(data);
                                  setConfirmDelete(null);
                                  fetchUsers();
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
              </div>
            )))}
          </div>
        </div>
      )}

      {/* Modals placed outside mapping for performance and clean DOM tree */}
      {isAdding && (
        <UserModal 
          mode="add" 
          onClose={() => setIsAdding(false)} 
          onSuccess={() => { setIsAdding(false); fetchUsers(); }} 
        />
      )}

      {editingUser != null && (
        <UserModal 
          mode="edit" 
          initialData={editingUser}
          onClose={() => setEditingUser(null)} 
          onSuccess={() => { setEditingUser(null); fetchUsers(); }} 
        />
      )}

    </div>
  );
}

export default UsersPage;
