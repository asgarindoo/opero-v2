import React, { useState, useMemo } from "react";
import { Search, ShieldAlert, Lock, Check } from "lucide-react";
import { useMembers } from "../context/MembersContext";

export default function RolesPermissions() {
  const { roles, permissions, toggleRolePermission } = useMembers();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const activeRoleId = selectedRoleId || roles[0]?.id;
  const activeRole = roles.find(r => r.id === activeRoleId);
  const isOwner = activeRole?.id === "r1";

  // Group permissions by category
  const categories = Array.from(new Set(permissions.map(p => p.category)));

  // Filter based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(cat => {
      if (cat.toLowerCase().includes(q)) return true;
      return permissions.some(p => p.category === cat && (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)));
    });
  }, [categories, permissions, searchQuery]);

  if (roles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px] bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!activeRole) return null;

  return (
    <div className="flex h-full min-h-[500px]">
      {/* ── Left Pane: Roles List ── */}
      <div
        className="w-64 shrink-0 border-r overflow-y-auto"
        style={{ borderColor: "rgba(0,0,0,0.06)", background: "rgba(0,0,0,0.01)" }}
      >
        <div className="p-5 border-b" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
          <h2 className="font-display font-semibold text-[14px] text-on-surface">Access Roles</h2>
          <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60 mt-1 uppercase tracking-wider font-bold">Select a role</p>
        </div>
        <div className="p-2 flex flex-col gap-0.5">
          {roles.map(role => {
            const isSelected = activeRoleId === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`flex flex-col items-start p-3 rounded-md transition-all ${isSelected ? "bg-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.02)]" : "hover:bg-black/[0.02]"}`}
              >
                <div className="flex items-center gap-2 mb-0.5 w-full">
                  <span className="font-display font-semibold text-[13px]" style={{ color: isSelected ? "var(--color-primary)" : "var(--color-on-surface)" }}>
                    {role.name}
                  </span>
                  {role.id === "r1" && <Lock size={10} className="text-on-surface-variant opacity-60 ml-auto" />}
                </div>
                <span className="font-body-sm text-[11px] text-on-surface-variant opacity-60 line-clamp-1 text-left w-full">
                  {role.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right Pane: Permissions Config ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Header & Search */}
        <div className="px-8 py-6 border-b shrink-0 flex items-center justify-between" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h2 className="font-display font-semibold text-[15px] text-on-surface">{activeRole.name} Permissions</h2>
              {isOwner && (
                <span className="flex items-center gap-1 font-label-caps text-[9px] font-bold px-2 py-0.5 rounded bg-black/[0.05] text-on-surface-variant opacity-60">
                  <Lock size={10} /> SYSTEM LOCKED
                </span>
              )}
            </div>
            <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60">
              {isOwner ? "Owner permissions are immutable." : "Configure module-level access and operational actions."}
            </p>
          </div>

          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all border border-black/[0.05] bg-black/[0.01]"
          >
            <Search size={14} className="text-on-surface-variant opacity-60" />
            <input
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="font-body-sm text-[12.5px] bg-transparent border-none outline-none placeholder:opacity-40 w-48"
              style={{ color: "var(--color-on-surface)" }}
            />
          </div>
        </div>

        {/* Permissions List */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-3xl space-y-10">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-20 text-on-surface-variant opacity-60 font-body-sm text-[13px]">
                No permissions found matching "{searchQuery}".
              </div>
            ) : (
              filteredCategories.map(cat => {
                const catPerms = permissions.filter(p => p.category === cat);
                const displayedPerms = searchQuery
                  ? catPerms.filter(p => cat.toLowerCase().includes(searchQuery.toLowerCase()) || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()))
                  : catPerms;

                if (displayedPerms.length === 0) return null;

                return (
                  <div key={cat} className="space-y-4">
                    <h3 className="font-label-caps text-[10px] font-bold text-primary tracking-[0.15em] uppercase border-b border-black/[0.03] pb-2.5">
                      {cat}
                    </h3>

                    <div className="flex flex-col gap-1">
                      {displayedPerms.map(perm => {
                        const hasPerm = activeRole.permissions.includes(perm.id);

                        return (
                          <div
                            key={perm.id}
                            className={`flex items-center justify-between p-3.5 rounded-lg transition-colors ${!isOwner && "hover:bg-black/[0.01]"}`}
                          >
                            <div className="flex-1 pr-8">
                              <div className="font-display font-medium text-[13px] text-on-surface mb-0.5">{perm.name}</div>
                              <div className="font-body-sm text-[12px] text-on-surface-variant opacity-60">{perm.description}</div>
                            </div>

                            {/* Custom Toggle Switch */}
                            <button
                              disabled={isOwner}
                              onClick={() => toggleRolePermission(activeRole.id, perm.id)}
                              className={`relative w-9 h-5 rounded-full transition-colors duration-300 ease-in-out shrink-0 focus:outline-none ${isOwner ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${hasPerm ? 'bg-primary' : 'bg-black/[0.12]'}`}
                            >
                              <div
                                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out flex items-center justify-center ${hasPerm ? 'translate-x-4' : 'translate-x-0'}`}
                              >
                                {hasPerm && <Check size={8} className="text-primary" strokeWidth={3} />}
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

