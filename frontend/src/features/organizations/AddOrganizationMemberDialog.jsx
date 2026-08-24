import {
  CircleAlert,
  UserPlus,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import Button from "../../components/ui/Button";
import { getApiErrorMessage } from "../../utils/apiError";

import {
  useAddOrganizationMember,
} from "./useOrganizationMemberMutations";

const AddOrganizationMemberDialog = ({
  isOpen,
  organizationId,
  currentRole,
  onClose,
}) => {
  const mutation =
    useAddOrganizationMember(
      organizationId
    );

  const [email, setEmail] =
    useState("");

  const [role, setRole] =
    useState("member");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setEmail("");
    setRole("member");
    mutation.reset();
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const canAssignAdmin =
    currentRole === "owner";

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      await mutation.mutateAsync({
        email: email.trim(),
        role,
      });

      onClose();
    } catch {
      // Error displayed below.
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-panel">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
              <UserPlus
                className="size-5"
                aria-hidden="true"
              />
            </span>

            <div>
              <h2 className="text-lg font-bold text-ink">
                Add member
              </h2>

              <p className="mt-1 text-sm text-muted">
                Add an existing
                registered user to this
                organization.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              mutation.isPending
            }
            className="rounded-lg p-2 text-muted transition hover:bg-surface-muted hover:text-ink disabled:opacity-50"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
        >
          <div className="space-y-5 px-6 py-5">
            {mutation.isError && (
              <div className="rounded-xl border border-danger/20 bg-danger-soft p-4">
                <div className="flex gap-3">
                  <CircleAlert
                    className="mt-0.5 size-5 shrink-0 text-danger"
                    aria-hidden="true"
                  />

                  <p className="text-sm leading-6 text-danger">
                    {getApiErrorMessage(
                      mutation.error
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="member-email"
                className="text-sm font-semibold text-ink"
              >
                User email
              </label>

              <input
                id="member-email"
                type="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="user@example.com"
                className="
                  mt-2 w-full rounded-xl
                  border border-line
                  bg-surface px-3.5 py-2.5
                  text-sm text-ink
                  outline-none transition
                  placeholder:text-muted
                  focus:border-brand
                  focus:ring-4
                  focus:ring-brand/10
                "
              />

              <p className="mt-2 text-xs leading-5 text-muted">
                The user must already
                have registered an
                account before they can
                be added.
              </p>
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="member-role"
                className="text-sm font-semibold text-ink"
              >
                Organization role
              </label>

              <select
                id="member-role"
                value={role}
                onChange={(event) =>
                  setRole(
                    event.target.value
                  )
                }
                className="
                  mt-2 w-full rounded-xl
                  border border-line
                  bg-surface px-3.5 py-2.5
                  text-sm font-medium
                  text-ink outline-none
                  transition
                  focus:border-brand
                  focus:ring-4
                  focus:ring-brand/10
                "
              >
                <option value="member">
                  Member
                </option>

                {canAssignAdmin && (
                  <option value="admin">
                    Admin
                  </option>
                )}
              </select>

              {currentRole ===
                "admin" && (
                <p className="mt-2 text-xs leading-5 text-muted">
                  Admins can add regular
                  members. Only the
                  organization owner can
                  assign the admin role.
                </p>
              )}

              {currentRole ===
                "owner" && (
                <p className="mt-2 text-xs leading-5 text-muted">
                  Members have regular
                  access. Admins can
                  manage organization
                  members but cannot
                  transfer ownership.
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-line bg-surface-muted px-6 py-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={
                mutation.isPending
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              isLoading={
                mutation.isPending
              }
              disabled={
                !email.trim()
              }
            >
              <UserPlus
                className="size-4"
                aria-hidden="true"
              />

              Add member
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrganizationMemberDialog;
