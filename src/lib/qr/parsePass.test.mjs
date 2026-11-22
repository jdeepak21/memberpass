import test from "node:test";
import assert from "node:assert/strict";
import { parseMembershipQrPayload } from "./parsePass.ts";

test("Valid QR payload — Basic plan", () => {
  const payload = "membrix:verify?uid=123e4567-e89b-12d3-a456-426614174000&plan=Basic";
  const result = parseMembershipQrPayload(payload);
  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.memberId, "123e4567-e89b-12d3-a456-426614174000");
    assert.equal(result.data.plan, "Basic");
  }
});

test("Valid QR payload — Premium plan with encoded spaces", () => {
  const payload = "membrix:verify?uid=123e4567-e89b-12d3-a456-426614174000&plan=Premium";
  const result = parseMembershipQrPayload(payload);
  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.plan, "Premium");
  }
});

test("Valid QR payload — Enterprise plan", () => {
  const payload = "membrix:verify?uid=123e4567-e89b-12d3-a456-426614174000&plan=Enterprise";
  const result = parseMembershipQrPayload(payload);
  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.plan, "Enterprise");
  }
});

test("Rejects empty payload", () => {
  const result = parseMembershipQrPayload("");
  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.equal(result.code, "EMPTY_INPUT");
  }
});

test("Rejects non-string input", () => {
  const result = parseMembershipQrPayload(null);
  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.equal(result.code, "EMPTY_INPUT");
  }
});

test("Rejects invalid scheme prefix", () => {
  const result = parseMembershipQrPayload("https://thendralyoga.com/verify?uid=123e4567-e89b-12d3-a456-426614174000&plan=Basic");
  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.equal(result.code, "INVALID_SCHEME");
  }
});

test("Rejects URL fragment", () => {
  const result = parseMembershipQrPayload("membrix:verify?uid=123e4567-e89b-12d3-a456-426614174000&plan=Basic#admin");
  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.equal(result.code, "HAS_FRAGMENT");
  }
});

test("Rejects repeated / duplicate query parameters", () => {
  const result = parseMembershipQrPayload("membrix:verify?uid=123e4567-e89b-12d3-a456-426614174000&plan=Basic&plan=Enterprise");
  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.equal(result.code, "DUPLICATE_PARAMS");
  }
});

test("Rejects unexpected query parameters", () => {
  const result = parseMembershipQrPayload("membrix:verify?uid=123e4567-e89b-12d3-a456-426614174000&plan=Basic&role=admin");
  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.equal(result.code, "UNEXPECTED_PARAMS");
  }
});

test("Rejects empty parameter value", () => {
  const result = parseMembershipQrPayload("membrix:verify?uid=123e4567-e89b-12d3-a456-426614174000&plan=");
  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.equal(result.code, "EMPTY_PARAM_VALUE");
  }
});

test("Rejects invalid UUID format", () => {
  const result = parseMembershipQrPayload("membrix:verify?uid=invalid-uuid-12345&plan=Basic");
  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.equal(result.code, "INVALID_UUID");
  }
});

test("Rejects unsupported plan", () => {
  const result = parseMembershipQrPayload("membrix:verify?uid=123e4567-e89b-12d3-a456-426614174000&plan=VIP");
  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.equal(result.code, "UNSUPPORTED_PLAN");
  }
});

test("Rejects malformed URI percent-encoding", () => {
  const result = parseMembershipQrPayload("membrix:verify?uid=123e4567-e89b-12d3-a456-426614174000&plan=%E0%A4%A");
  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.equal(result.code, "MALFORMED_URI");
  }
});

test("Rejects consecutive ampersands", () => {
  const result = parseMembershipQrPayload("membrix:verify?uid=123e4567-e89b-12d3-a456-426614174000&&plan=Basic");
  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.equal(result.code, "MALFORMED_URI");
  }
});

test("Rejects missing plan parameter", () => {
  const result = parseMembershipQrPayload("membrix:verify?uid=123e4567-e89b-12d3-a456-426614174000");
  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.equal(result.code, "MISSING_PARAMS");
  }
});
