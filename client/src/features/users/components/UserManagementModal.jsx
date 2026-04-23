import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, Trash2, X, Users, Loader2 } from "lucide-react";
import { useAuthStore } from "../../auth/store/authStore";
import { useUserManagementStore } from "../store/userManagementStore";

const roleTone = {
  super_admin: {
    color: "var(--accent)",
    backgroundColor: "var(--accent-subtle)",
  },
  admin: {
    color: "#f59e0b",
    backgroundColor: "rgba(245,158,11,0.12)",
  },
  user: {
    color: "var(--text-secondary)",
    backgroundColor: "var(--bg-surface)",
  },
};

export default function UserManagementModal({ onClose }) {
  const currentUser = useAuthStore((state) => state.user);
  const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin);
  const {
    users,
    loading,
    error,
    actionLoadingId,
    fetchUsers,
    updateUserRole,
    deleteUser,
    reset,
  } = useUserManagementStore();

  useEffect(() => {
    if (isSuperAdmin()) {
      fetchUsers();
    }

    return () => reset();
  }, [fetchUsers, isSuperAdmin, reset]);

  if (!isSuperAdmin()) return null;

  const handleRoleChange = async (user, nextRole) => {
    if (user.role === nextRole) return;
    await updateUserRole(user.id, nextRole);
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Delete ${user.username} (${user.role})? This action cannot be undone.`
    );

    if (!confirmed) return;
    await deleteUser(user.id);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        onClick={onClose}
      />

      <div className="relative glass-card rounded-2xl w-full max-w-4xl max-h-[88vh] overflow-hidden animate-scale-in">
        <div
          className="sticky top-0 px-6 py-4 flex items-center justify-between z-10"
          style={{
            borderBottom: "1px solid var(--border-base)",
            backgroundColor: "var(--bg-base)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--accent-subtle)" }}
            >
              <Users size={18} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h2 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                User Management
              </h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Super admins can promote, demote, and delete admin/user accounts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--bg-muted)" }}
          >
            <X size={14} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(88vh-76px)]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={26} className="animate-spin" style={{ color: "var(--accent)" }} />
            </div>
          ) : error ? (
            <div
              className="rounded-xl p-4 text-sm"
              style={{
                backgroundColor: "rgba(251,113,133,0.08)",
                border: "1px solid rgba(251,113,133,0.2)",
                color: "var(--red)",
              }}
            >
              {error}
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const isSelf = user.id === currentUser?.id;
                const locked = user.role === "super_admin" || isSelf;
                const busy = actionLoadingId === user.id;

                return (
                  <div
                    key={user.id}
                    className="grid gap-4 rounded-2xl p-4 md:grid-cols-[minmax(0,1.4fr)_160px_120px]"
                    style={{
                      backgroundColor: "var(--bg-muted)",
                      border: "1px solid var(--border-base)",
                    }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>
                          {user.username}
                        </p>
                        {user.role === "super_admin" && (
                          <ShieldCheck size={14} style={{ color: "var(--accent)" }} />
                        )}
                        {isSelf && (
                          <span
                            className="text-[11px] px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: "var(--accent-subtle)",
                              color: "var(--accent)",
                            }}
                          >
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>
                        {user.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-2 py-1 rounded-full font-medium"
                        style={roleTone[user.role] ?? roleTone.user}
                      >
                        {user.role}
                      </span>
                      {user.role !== "super_admin" && (
                        <select
                          value={user.role}
                          disabled={locked || busy}
                          onChange={(event) => handleRoleChange(user, event.target.value)}
                          className="input-field h-10"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={locked || busy}
                        className="w-full md:w-auto px-3 h-10 rounded-xl flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
                        style={{
                          backgroundColor: "rgba(251,113,133,0.10)",
                          border: "1px solid rgba(251,113,133,0.2)",
                          color: "var(--red)",
                        }}
                      >
                        {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}

              {users.length === 0 && (
                <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
                  No users found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
