const roleStyles = {
  owner:
    "bg-accent-soft text-accent",

  admin:
    "bg-info-soft text-info",

  member:
    "bg-surface-muted text-muted",
};

const OrganizationRoleBadge = ({
  role,
}) => {
  const normalizedRole =
    role?.toLowerCase() ??
    "member";

  return (
    <span
      className={`
        inline-flex rounded-full px-2.5 py-1
        text-xs font-bold capitalize
        ${
          roleStyles[
            normalizedRole
          ] ??
          roleStyles.member
        }
      `}
    >
      {normalizedRole}
    </span>
  );
};

export default OrganizationRoleBadge;
