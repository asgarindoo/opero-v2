import React from "react";
import { Activity, Clock } from "lucide-react";
import { useMembers } from "../context/MembersContext";
import UserAvatar from "@/components/common/UserAvatar";
import { getUserDisplayName } from "@/lib/user-identity";

export default function ActivityAuditLog() {
  const { activityLogs, members } = useMembers();

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="mb-10">
        <h2 className="font-display font-semibold text-[15px] text-on-surface mb-1">Audit Log</h2>
        <p className="font-body-sm text-[13px] text-on-surface-variant opacity-70">
          A chronological timeline of access changes, role updates, and invitations.
        </p>
      </div>

      <div className="relative pl-6 border-l border-black/[0.06]">
        {activityLogs.map((log, idx) => {
          const user = members.find(m => m.userId === log.userId || m.id === log.userId);
          const date = new Date(log.timestamp);

          return (
            <div key={log.id} className="relative mb-10 last:mb-0">
              {/* Timeline Dot */}
              <div
                className="absolute -left-[29px] w-2.5 h-2.5 rounded-full ring-4 ring-background"
                style={{ background: "var(--color-primary)" }}
              />

              <div className="ml-2">
                <div className="flex items-center gap-2 mb-1">
                  <UserAvatar user={user} size="sm" />
                  <span className="font-display font-semibold text-[13px] text-on-surface">
                    {getUserDisplayName(user, "System")}
                  </span>
                  <span className="font-body-sm text-[13px] text-on-surface-variant opacity-70">
                    {log.action}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-on-surface-variant opacity-60">
                  <Clock size={10} />
                  <span className="font-label-caps text-[9px] font-bold tracking-wider">{date.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}

        {activityLogs.length === 0 && (
          <div className="py-20 ml-2 text-on-surface-variant opacity-60 font-body-sm">
            No activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}

