import {
  CircleAlert,
  LoaderCircle,
  RefreshCw,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import Button from "../../components/ui/Button";
import { getApiErrorMessage } from "../../utils/apiError";

import useAuth from "../auth/useAuth";

import AddOrganizationMemberDialog from "./AddOrganizationMemberDialog";
import OrganizationMemberRow from "./OrganizationMemberRow";

import {
  useOrganizationMembers,
} from "./useOrganizationMembers";

import {
  useRemoveOrganizationMember,
  useTransferOrganizationOwnership,
  useUpdateOrganizationMemberRole,
} from "./useOrganizationMemberMutations";

const OrganizationMembersPanel = ({
  organizationId,
  organizationName,
  onClose,
}) => {
  const { user } = useAuth();

  const currentUserId =
    user?.id;

  const membersQuery =
    useOrganizationMembers(
      organizationId
    );

  const members =
    membersQuery.data ?? [];

  const currentMembership =
    members.find(
      (member) =>
        member.user_id ===
        currentUserId
    );

  const currentRole =
    currentMembership?.role ??
    "member";

  const updateRoleMutation =
    useUpdateOrganizationMemberRole(
      organizationId
    );

  const removeMutation =
    useRemoveOrganizationMember(
      organizationId
    );

  const transferMutation =
    useTransferOrganizationOwnership(
      organizationId
    );

  const [
    isAddOpen,
    setIsAddOpen,
  ] = useState(false);

  const [
    removingMember,
    setRemovingMember,
  ] = useState(null);

  const [
    transferMember,
    setTransferMember,
  ] = useState(null);

  const canManage =
    currentRole === "owner" ||
    currentRole === "admin";

  const handleRoleChange =
    async (
      member,
      role
    ) => {
      try {
        await updateRoleMutation
          .mutateAsync({
            userId:
              member.user_id,
            role,
          });
      } catch {
        // Error displayed below.
      }
    };

  const handleRemove =
    async () => {
      if (!removingMember) {
        return;
      }

      try {
        await removeMutation
          .mutateAsync(
            removingMember.user_id
          );

        setRemovingMember(null);
      } catch {
        // Error displayed below.
      }
    };

  const handleTransfer =
    async () => {
      if (!transferMember) {
        return;
      }

      try {
        await transferMutation
          .mutateAsync(
            transferMember.user_id
          );

        setTransferMember(null);

        /*
         * After ownership transfer our
         * own permissions changed.
         */
        membersQuery.refetch();
      } catch {
        // Error displayed below.
      }
    };

  const mutationError =
    updateRoleMutation.error ??
    removeMutation.error ??
    transferMutation.error;

  const isUpdating =
    updateRoleMutation.isPending ||
    removeMutation.isPending ||
    transferMutation.isPending;

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-panel">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[0.68rem] font-semibold tracking-[0.18em] text-brand">
              TEAM ACCESS
            </p>

            <div className="mt-2 flex items-center gap-2">
              <Users
                className="size-5 text-brand"
                aria-hidden="true"
              />

              <h2 className="text-xl font-bold text-ink">
                {organizationName}
              </h2>
            </div>

            <p className="mt-2 text-sm text-muted">
              Manage organization
              members, permissions,
              and ownership.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                membersQuery.refetch()
              }
              isLoading={
                membersQuery.isFetching
              }
            >
              <RefreshCw
                className="size-4"
                aria-hidden="true"
              />
              Refresh
            </Button>

            {canManage && (
              <Button
                onClick={() =>
                  setIsAddOpen(true)
                }
              >
                <UserPlus
                  className="size-4"
                  aria-hidden="true"
                />
                Add member
              </Button>
            )}

            <Button
              variant="secondary"
              className="px-3"
              onClick={onClose}
              aria-label="Close member management"
            >
              <X
                className="size-4"
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>

        {/* Current permission */}
        {!membersQuery.isLoading &&
          currentMembership && (
            <div className="border-b border-line bg-surface-muted px-5 py-3 text-sm text-muted">
              Your organization role is{" "}
              <span className="font-bold capitalize text-ink">
                {currentRole}
              </span>
              .
            </div>
          )}

        {mutationError && (
          <div className="border-b border-danger/20 bg-danger-soft px-5 py-4">
            <div className="flex gap-3">
              <CircleAlert
                className="mt-0.5 size-5 shrink-0 text-danger"
                aria-hidden="true"
              />

              <p className="text-sm text-danger">
                {getApiErrorMessage(
                  mutationError
                )}
              </p>
            </div>
          </div>
        )}

        {membersQuery.isLoading && (
          <div className="flex min-h-56 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-muted">
              <LoaderCircle className="size-5 animate-spin" />
              Loading members...
            </div>
          </div>
        )}

        {membersQuery.isError && (
          <div className="p-5">
            <div className="rounded-xl border border-danger/20 bg-danger-soft p-4">
              <p className="text-sm text-danger">
                {getApiErrorMessage(
                  membersQuery.error
                )}
              </p>
            </div>
          </div>
        )}

        {!membersQuery.isLoading &&
          !membersQuery.isError &&
          members.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-surface-muted">
                  <tr className="border-b border-line">
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted">
                      User
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted">
                      Role
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted">
                      Joined
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {members.map(
                    (member) => (
                      <OrganizationMemberRow
                        key={
                          member.user_id
                        }
                        member={
                          member
                        }
                        currentUserId={
                          currentUserId
                        }
                        currentRole={
                          currentRole
                        }
                        onRoleChange={
                          handleRoleChange
                        }
                        onRemove={
                          setRemovingMember
                        }
                        onTransfer={
                          setTransferMember
                        }
                        isUpdating={
                          isUpdating
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
      </section>

      <AddOrganizationMemberDialog
        isOpen={isAddOpen}
        organizationId={
          organizationId
        }
        currentRole={
          currentRole
        }
        onClose={() =>
          setIsAddOpen(false)
        }
      />

      {/* Remove confirmation */}
      {removingMember && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-panel">
            <div className="p-6">
              <h2 className="text-lg font-bold text-ink">
                Remove member
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Remove{" "}
                <span className="font-bold text-ink">
                  {removingMember.name}
                </span>{" "}
                from this organization?
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-line bg-surface-muted px-6 py-4">
              <Button
                variant="secondary"
                onClick={() =>
                  setRemovingMember(
                    null
                  )
                }
                disabled={
                  removeMutation.isPending
                }
              >
                Cancel
              </Button>

              <Button
                onClick={
                  handleRemove
                }
                isLoading={
                  removeMutation.isPending
                }
                className="bg-danger text-white hover:bg-danger/90"
              >
                Remove member
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ownership transfer */}
      {transferMember && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-panel">
            <div className="p-6">
              <h2 className="text-lg font-bold text-ink">
                Transfer ownership
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Transfer ownership to{" "}
                <span className="font-bold text-ink">
                  {transferMember.name}
                </span>
                ?
              </p>

              <div className="mt-4 rounded-xl bg-accent-soft p-4 text-sm leading-6 text-accent">
                After the transfer,
                they become the
                organization owner and
                your role becomes
                admin.
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-line bg-surface-muted px-6 py-4">
              <Button
                variant="secondary"
                onClick={() =>
                  setTransferMember(
                    null
                  )
                }
                disabled={
                  transferMutation.isPending
                }
              >
                Cancel
              </Button>

              <Button
                onClick={
                  handleTransfer
                }
                isLoading={
                  transferMutation.isPending
                }
              >
                Transfer ownership
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrganizationMembersPanel;
