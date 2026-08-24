import {
  Crown,
  Trash2,
} from "lucide-react";

import OrganizationRoleBadge from "./OrganizationRoleBadge";

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(new Date(value));
};

const OrganizationMemberRow = ({
  member,
  currentUserId,
  currentRole,
  onRoleChange,
  onRemove,
  onTransfer,
  isUpdating,
}) => {
  const isSelf =
    member.user_id ===
    currentUserId;

  const isOwner =
    member.role === "owner";

  const canChangeRole =
    currentRole === "owner" &&
    !isOwner;

  const canTransfer =
    currentRole === "owner" &&
    !isSelf &&
    !isOwner;

  const canRemove =
    !isOwner &&
    !isSelf &&
    (
      currentRole === "owner" ||
      (
        currentRole === "admin" &&
        member.role === "member"
      )
    );

  return (
    <tr className="border-b border-line transition hover:bg-surface-muted">
      <td className="px-5 py-4">
        <p className="font-semibold text-ink">
          {member.name}

          {isSelf && (
            <span className="ml-2 text-xs font-normal text-muted">
              You
            </span>
          )}
        </p>

        <p className="mt-1 text-sm text-muted">
          {member.email}
        </p>
      </td>

      <td className="px-5 py-4">
        {canChangeRole ? (
          <select
            value={member.role}
            disabled={isUpdating}
            onChange={(event) =>
              onRoleChange(
                member,
                event.target.value
              )
            }
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:opacity-50"
          >
            <option value="member">
              Member
            </option>

            <option value="admin">
              Admin
            </option>
          </select>
        ) : (
          <OrganizationRoleBadge
            role={member.role}
          />
        )}
      </td>

      <td className="px-5 py-4 text-sm text-muted">
        {formatDate(
          member.joined_at
        )}
      </td>

      <td className="px-5 py-4">
        <div className="flex justify-end gap-1">
          {canTransfer && (
            <button
              type="button"
              onClick={() =>
                onTransfer(member)
              }
              title="Transfer ownership"
              className="rounded-lg p-2 text-accent transition hover:bg-accent-soft"
            >
              <Crown className="size-4" />
            </button>
          )}

          {canRemove && (
            <button
              type="button"
              onClick={() =>
                onRemove(member)
              }
              title="Remove member"
              className="rounded-lg p-2 text-muted transition hover:bg-danger-soft hover:text-danger"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default OrganizationMemberRow;
