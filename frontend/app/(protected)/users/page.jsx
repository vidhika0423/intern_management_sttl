"use client";

import { getUsers, deleteUser } from "@/services/UserApi";
import { Search, Trash2, UserRoundPen, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import UserModal from "@/components/dashboard/UserModal";
import { useSession } from "next-auth/react";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { data: session } = useSession();

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUsers = (currentPage = page, search = searchTerm, role = selectedRole) => {
    setLoading(true);
    getUsers(currentPage, limit, search, role)
      .then((res) => {
        if (res.ok) {
          setUsers(res.data || []);
          setTotalCount(res.totalCount || 0);
          setTotalPages(res.totalPages || 0);
        } else {
          console.error(res.message);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Debounced search and pagination effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(page, searchTerm, selectedRole);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [page, searchTerm, selectedRole]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setPage(1); // Reset to first page on role change
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Manage Users</h2>
          <div className="flex flex-1 md:max-w-2xl items-center gap-3">
            <div className="relative flex-[2]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3aff]/20 focus:border-[#1a3aff] transition-all duration-200 text-sm"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            
            <div className="relative flex-1 min-w-[120px]">
              <select
                className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3aff]/20 focus:border-[#1a3aff] transition-all duration-200 text-sm bg-white appearance-none cursor-pointer"
                value={selectedRole}
                onChange={handleRoleChange}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="hr">HR</option>
                <option value="mentor">Mentor</option>
                <option value="intern">Intern</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>

            <button 
              onClick={() => setIsAdding(true)}
              className="bg-[#1a3aff] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-[#1a3aff]/20 hover:bg-[#1a3aff]/90 transition-all duration-200 whitespace-nowrap"
            >
              Add User
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 min-h-[400px]">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3aff]"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-lg font-medium text-gray-600 mb-1">No users found</p>
              <p className="text-sm">{searchTerm ? `No results for "${searchTerm}"` : "Start by adding a new user"}</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center border border-gray-100 p-4 rounded-xl hover:shadow-md hover:border-[#1a3aff]/20 transition-all duration-200 group"
                  >
                    <div>
                      <div className="font-semibold text-gray-800">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium uppercase tracking-wider text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full group-hover:bg-[#1a3aff]/5 group-hover:text-[#1a3aff] transition-colors">
                        {user.role}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => setEditingUser(user)}
                          title="Edit User"
                        >
                          <UserRoundPen size={18} />
                        </button>
                        {session?.user?.role === "admin" && (
                          <button 
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => setConfirmDelete(user.id)}
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      {confirmDelete === user.id && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                          <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete User</h2>
                            <p className="text-sm text-gray-500 mb-6 font-medium">Are you sure you want to delete this user? This action cannot be undone.</p>
                            <div className="flex gap-3 justify-end">
                              <button
                                type="button"
                                className="flex-1 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                onClick={() => setConfirmDelete(null)}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all duration-200"
                                onClick={() => {
                                  deleteUser(user.id)
                                    .then((res) => {
                                      if (res.ok) {
                                        setConfirmDelete(null);
                                        fetchUsers();
                                      }
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
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center mt-6 pt-6 border-t border-gray-100 gap-4">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 rounded-xl border border-gray-100 min-w-[100px] justify-center">
                      <span className="text-sm font-bold text-[#1a3aff]">{page}</span>
                      <span className="text-xs text-gray-400 font-medium">/</span>
                      <span className="text-sm font-medium text-gray-500">{totalPages}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 ml-1 font-bold">pages</span>
                    </div>

                    <button
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isAdding && (
        <UserModal 
          mode="add" 
          onClose={() => setIsAdding(false)} 
          onSuccess={() => { setIsAdding(false); fetchUsers(1); }} 
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
