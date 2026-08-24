# Role-Based Access Control

Authorization is scoped around organizations.

## Roles

### Owner

Highest organization privilege.

Can:

- manage projects,
- manage queues,
- add members,
- add admins,
- change member roles,
- remove eligible members,
- transfer ownership,
- perform protected recovery actions such as DLQ requeue.

### Admin

Can manage operational resources but cannot perform owner-only governance.

Can:

- manage projects/queues,
- add regular members,
- remove eligible regular members,
- perform authorized operational actions.

Cannot:

- assign another admin,
- change member roles,
- transfer ownership,
- remove/modify the owner.

### Member

Primarily read/usage access.

Can inspect resources available to the organization/project, such as queues, jobs, schedules, workers and monitoring data, subject to endpoint rules.

Cannot perform owner/admin mutations.

## Ownership Transfer

Only the current owner may transfer ownership.

The new owner must already be an organization member.

After a successful transfer:

```text
old owner → admin
new owner → owner
```

## Important Security Rules

- Authentication alone does not imply permission.
- Repository/service queries are scoped through organization membership.
- Owner identity is protected from ordinary role mutation.
- An admin does not have equivalent governance authority to an owner.
- Public account registration does not allow a user to choose an organization role.

Roles are assigned through organization membership, not during global registration.
