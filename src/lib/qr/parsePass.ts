/**
 * MemberPass — Thendral Yoga Loft, Coimbatore
 * QR Pass Payload Parser and Validator
 *
 * QR payload structure:
 * membrix:verify?uid=<uuid>&plan=<plan>
 */

export const SUPPORTED_PLANS = ["Basic", "Premium", "Enterprise"] as const;
export type MembershipPlan = (typeof SUPPORTED_PLANS)[number];

export type ParsedQrPassSuccess = {
  valid: true;
  data: {
    memberId: string;
    plan: MembershipPlan;
  };
};

export type ParsedQrPassFailure = {
  valid: false;
  error: string;
  code:
    | "EMPTY_INPUT"
    | "INVALID_SCHEME"
    | "HAS_FRAGMENT"
    | "DUPLICATE_PARAMS"
    | "UNEXPECTED_PARAMS"
    | "MISSING_PARAMS"
    | "EMPTY_PARAM_VALUE"
    | "INVALID_UUID"
    | "UNSUPPORTED_PLAN"
    | "MALFORMED_URI";
};

export type ParsedQrPassResult = ParsedQrPassSuccess | ParsedQrPassFailure;

// Standard RFC 4122 UUID v4 regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Parses and strictly validates a scanned MemberPass QR payload string.
 *
 * Rules:
 * 1. Must be a non-empty string.
 * 2. Scheme must be exactly 'membrix:verify?'.
 * 3. URL fragments (#) are strictly forbidden.
 * 4. Repeated/duplicate query parameter keys are rejected.
 * 5. Only expected keys ('uid', 'plan') are permitted.
 * 6. Neither 'uid' nor 'plan' can be empty.
 * 7. 'uid' must be a valid UUID.
 * 8. 'plan' must be exactly 'Basic', 'Premium', or 'Enterprise'.
 */
export function parseMembershipQrPayload(payload: unknown): ParsedQrPassResult {
  if (typeof payload !== "string" || payload.trim() === "") {
    return {
      valid: false,
      error: "QR pass payload cannot be empty.",
      code: "EMPTY_INPUT",
    };
  }

  const trimmed = payload.trim();

  // Reject URL fragments
  if (trimmed.includes("#")) {
    return {
      valid: false,
      error: "QR pass payload contains unauthorized URL fragment.",
      code: "HAS_FRAGMENT",
    };
  }

  // Scheme must be membrix:verify?
  const SCHEME_PREFIX = "membrix:verify?";
  if (!trimmed.startsWith(SCHEME_PREFIX)) {
    return {
      valid: false,
      error: "Invalid QR pass scheme. Expected membrix:verify payload.",
      code: "INVALID_SCHEME",
    };
  }

  const queryString = trimmed.slice(SCHEME_PREFIX.length);
  if (!queryString) {
    return {
      valid: false,
      error: "QR pass payload is missing query parameters.",
      code: "MISSING_PARAMS",
    };
  }

  // Reject consecutive or leading/trailing ampersands
  if (queryString.startsWith("&") || queryString.endsWith("&") || queryString.includes("&&")) {
    return {
      valid: false,
      error: "Malformed query string with invalid separators.",
      code: "MALFORMED_URI",
    };
  }

  // Check for duplicate or unexpected parameters
  const pairs = queryString.split("&");
  const seenKeys = new Set<string>();
  const allowedKeys = new Set(["uid", "plan"]);
  const params: Record<string, string> = {};

  for (const pair of pairs) {
    if (!pair.includes("=")) {
      return {
        valid: false,
        error: "Malformed parameter in query string.",
        code: "MALFORMED_URI",
      };
    }

    const eqIndex = pair.indexOf("=");
    const rawKey = pair.slice(0, eqIndex);
    const rawValue = pair.slice(eqIndex + 1);

    let key: string;
    let value: string;

    try {
      key = decodeURIComponent(rawKey);
      value = decodeURIComponent(rawValue);
    } catch {
      return {
        valid: false,
        error: "Malformed percent-encoding in QR pass payload.",
        code: "MALFORMED_URI",
      };
    }

    if (!allowedKeys.has(key)) {
      return {
        valid: false,
        error: `Unexpected parameter in QR payload: ${key}`,
        code: "UNEXPECTED_PARAMS",
      };
    }

    if (seenKeys.has(key)) {
      return {
        valid: false,
        error: `Duplicate parameter in QR payload: ${key}`,
        code: "DUPLICATE_PARAMS",
      };
    }

    if (value.trim() === "") {
      return {
        valid: false,
        error: `Parameter ${key} cannot be empty.`,
        code: "EMPTY_PARAM_VALUE",
      };
    }

    seenKeys.add(key);
    params[key] = value.trim();
  }

  // Ensure both required keys are present
  if (!params.uid || !params.plan) {
    return {
      valid: false,
      error: "Missing required parameter(s) 'uid' or 'plan'.",
      code: "MISSING_PARAMS",
    };
  }

  // Validate UUID format
  if (!UUID_REGEX.test(params.uid)) {
    return {
      valid: false,
      error: "Invalid member UUID format in QR pass.",
      code: "INVALID_UUID",
    };
  }

  // Validate Plan
  if (!SUPPORTED_PLANS.includes(params.plan as MembershipPlan)) {
    return {
      valid: false,
      error: `Unsupported membership plan: ${params.plan}. Expected Basic, Premium, or Enterprise.`,
      code: "UNSUPPORTED_PLAN",
    };
  }

  return {
    valid: true,
    data: {
      memberId: params.uid.toLowerCase(),
      plan: params.plan as MembershipPlan,
    },
  };
}

