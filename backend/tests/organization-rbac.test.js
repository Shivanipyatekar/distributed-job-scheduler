import {
  after,
  before,
  describe,
  test,
} from "node:test";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import request from "supertest";

import app from "../src/app.js";
import { pool } from "../src/config/database.js";

const createdEmails = [];

let owner;
let admin;
let member;

let organizationId;

const createAccount = async (name) => {
  const safeName = name
    .toLowerCase()
    .replace(/\s+/g, "-");

  const email =
    `${safeName}-${randomUUID()}@example.com`;

  const password =
    "TestPassword123!";

  createdEmails.push(email);

  const registerResponse =
    await request(app)
      .post("/api/v1/auth/register")
      .send({
        name,
        email,
        password,
      });

  assert.equal(
    registerResponse.status,
    201
  );

  const loginResponse =
    await request(app)
      .post("/api/v1/auth/login")
      .send({
        email,
        password,
      });

  assert.equal(
    loginResponse.status,
    200
  );

  return {
    id:
      loginResponse.body.data.user.id,

    email,

    token:
      loginResponse.body.data.token,
  };
}; 

describe(
  "Organization RBAC",
  () => {
    before(async () => {
      owner =
        await createAccount(
          "Owner Test"
        );

      admin =
        await createAccount(
          "Admin Test"
        );

      member =
        await createAccount(
          "Member Test"
        );

      const response =
        await request(app)
          .post(
            "/api/v1/organizations"
          )
          .set(
            "Authorization",
            `Bearer ${owner.token}`
          )
          .send({
            name:
              "Automated Test Organization",

            slug:
              `test-org-${randomUUID()}`,
          });

      assert.equal(
        response.status,
        201
      );

      organizationId =
        response.body.data
          .organization.id;
    });

    after(async () => {
      if (organizationId) {
        /*
         * Remove membership rows first.
         */
        await pool.query(
          `
            DELETE FROM organization_members
            WHERE organization_id = $1
          `,
          [organizationId]
        );

        await pool.query(
          `
            DELETE FROM organizations
            WHERE id = $1
          `,
          [organizationId]
        );
      }

      if (
        createdEmails.length > 0
      ) {
        await pool.query(
          `
            DELETE FROM users
            WHERE email = ANY($1::text[])
          `,
          [createdEmails]
        );
      }

      await pool.end();
    });

    test(
      "organization creator becomes owner",
      async () => {
        const response =
          await request(app)
            .get(
              `/api/v1/organizations/${organizationId}/members`
            )
            .set(
              "Authorization",
              `Bearer ${owner.token}`
            );

        assert.equal(
          response.status,
          200
        );

        const members =
          response.body.data
            .members;

        const ownerMembership =
          members.find(
            (item) =>
              item.user_id ===
              owner.id
          );

        assert.ok(
          ownerMembership
        );

        assert.equal(
          ownerMembership.role,
          "owner"
        );
      }
    );

    test(
      "owner can add an admin",
      async () => {
        const response =
          await request(app)
            .post(
              `/api/v1/organizations/${organizationId}/members`
            )
            .set(
              "Authorization",
              `Bearer ${owner.token}`
            )
            .send({
              email:
                admin.email,
              role: "admin",
            });

        assert.equal(
          response.status,
          201
        );

        assert.equal(
          response.body.data
            .member.role,
          "admin"
        );
      }
    );

    test(
      "owner can add a regular member",
      async () => {
        const response =
          await request(app)
            .post(
              `/api/v1/organizations/${organizationId}/members`
            )
            .set(
              "Authorization",
              `Bearer ${owner.token}`
            )
            .send({
              email:
                member.email,
              role: "member",
            });

        assert.equal(
          response.status,
          201
        );

        assert.equal(
          response.body.data
            .member.role,
          "member"
        );
      }
    );

    test(
      "admin cannot assign admin role",
      async () => {
        const extraUser =
          await createAccount(
            "Extra Test"
          );

        const response =
          await request(app)
            .post(
              `/api/v1/organizations/${organizationId}/members`
            )
            .set(
              "Authorization",
              `Bearer ${admin.token}`
            )
            .send({
              email:
                extraUser.email,
              role: "admin",
            });

        assert.equal(
          response.status,
          403
        );

        assert.equal(
          response.body.success,
          false
        );
      }
    );

    test(
      "admin cannot change member roles",
      async () => {
        const response =
          await request(app)
            .patch(
              `/api/v1/organizations/${organizationId}/members/${member.id}/role`
            )
            .set(
              "Authorization",
              `Bearer ${admin.token}`
            )
            .send({
              role: "admin",
            });

        assert.equal(
          response.status,
          403
        );
      }
    );

    test(
      "owner can promote member to admin",
      async () => {
        const response =
          await request(app)
            .patch(
              `/api/v1/organizations/${organizationId}/members/${member.id}/role`
            )
            .set(
              "Authorization",
              `Bearer ${owner.token}`
            )
            .send({
              role: "admin",
            });

        assert.equal(
          response.status,
          200
        );

        assert.equal(
          response.body.data
            .member.role,
          "admin"
        );
      }
    );

    test(
      "owner cannot have their role changed directly",
      async () => {
        const response =
          await request(app)
            .patch(
              `/api/v1/organizations/${organizationId}/members/${owner.id}/role`
            )
            .set(
              "Authorization",
              `Bearer ${owner.token}`
            )
            .send({
              role: "member",
            });

        assert.equal(
          response.status,
          400
        );
      }
    );

    test(
      "only owner can transfer ownership",
      async () => {
        const response =
          await request(app)
            .patch(
              `/api/v1/organizations/${organizationId}/ownership`
            )
            .set(
              "Authorization",
              `Bearer ${admin.token}`
            )
            .send({
              newOwnerId:
                member.id,
            });

        assert.equal(
          response.status,
          403
        );
      }
    );

    test(
      "owner can transfer ownership to an existing member",
      async () => {
        const response =
          await request(app)
            .patch(
              `/api/v1/organizations/${organizationId}/ownership`
            )
            .set(
              "Authorization",
              `Bearer ${owner.token}`
            )
            .send({
              newOwnerId:
                member.id,
            });

        assert.equal(
          response.status,
          200
        );

        assert.equal(
          response.body.data
            .organization.owner_id,
          member.id
        );

        const membersResponse =
          await request(app)
            .get(
              `/api/v1/organizations/${organizationId}/members`
            )
            .set(
              "Authorization",
              `Bearer ${member.token}`
            );

        assert.equal(
          membersResponse.status,
          200
        );

        const members =
          membersResponse.body.data
            .members;

        const oldOwner =
          members.find(
            (item) =>
              item.user_id ===
              owner.id
          );

        const newOwner =
          members.find(
            (item) =>
              item.user_id ===
              member.id
          );

        assert.equal(
          oldOwner.role,
          "admin"
        );

        assert.equal(
          newOwner.role,
          "owner"
        );
      }
    );
  }
);
