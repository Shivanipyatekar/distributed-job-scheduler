import test, {
  after,
} from "node:test";

import assert from "node:assert/strict";
import {
  randomUUID,
} from "node:crypto";

import request from "supertest";

import app from "../src/app.js";
import {
  pool,
} from "../src/config/database.js";

const createdEmails = [];

const createEmail = () => {
  const email =
    `test-${randomUUID()}@example.com`;

  createdEmails.push(email);

  return email;
};

const createUserData = () => ({
  name: "Automated Test User",
  email: createEmail(),
  password: "TestPassword123!",
});

/*
 * Remove users created by this
 * test file after all tests finish.
 */
after(async () => {
  if (createdEmails.length > 0) {
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
  "registers a new user successfully",
  async () => {
    const userData =
      createUserData();

    const response =
      await request(app)
        .post(
          "/api/v1/auth/register"
        )
        .send(userData);

    assert.equal(
      response.status,
      201
    );

    assert.equal(
      response.body.success,
      true
    );

    assert.equal(
      response.body.data.user.email,
      userData.email
    );

    assert.equal(
      response.body.data.user.name,
      userData.name
    );

    /*
     * Password hashes should never
     * be exposed through the API.
     */
    assert.equal(
      response.body.data.user
        .password_hash,
      undefined
    );
  }
);

test(
  "rejects duplicate email registration",
  async () => {
    const userData =
      createUserData();

    const firstResponse =
      await request(app)
        .post(
          "/api/v1/auth/register"
        )
        .send(userData);

    assert.equal(
      firstResponse.status,
      201
    );

    const duplicateResponse =
      await request(app)
        .post(
          "/api/v1/auth/register"
        )
        .send(userData);

    assert.equal(
      duplicateResponse.status,
      409
    );

    assert.equal(
      duplicateResponse.body.success,
      false
    );
  }
);

test(
  "logs in with valid credentials",
  async () => {
    const userData =
      createUserData();

    await request(app)
      .post(
        "/api/v1/auth/register"
      )
      .send(userData)
      .expect(201);

    const response =
      await request(app)
        .post(
          "/api/v1/auth/login"
        )
        .send({
          email: userData.email,
          password:
            userData.password,
        });

    assert.equal(
      response.status,
      200
    );

    assert.equal(
      response.body.success,
      true
    );

    assert.equal(
      response.body.data.user.email,
      userData.email
    );

    assert.equal(
      typeof response.body.data.token,
      "string"
    );

    assert.ok(
      response.body.data.token.length >
        20
    );
  }
);

test(
  "rejects login with incorrect password",
  async () => {
    const userData =
      createUserData();

    await request(app)
      .post(
        "/api/v1/auth/register"
      )
      .send(userData)
      .expect(201);

    const response =
      await request(app)
        .post(
          "/api/v1/auth/login"
        )
        .send({
          email: userData.email,
          password:
            "WrongPassword123!",
        });

    assert.equal(
      response.status,
      401
    );

    assert.equal(
      response.body.success,
      false
    );
  }
);

test(
  "rejects protected endpoint without authentication",
  async () => {
    const response =
      await request(app)
        .get(
          "/api/v1/organizations"
        );

    assert.equal(
      response.status,
      401
    );

    assert.equal(
      response.body.success,
      false
    );
  }
);
