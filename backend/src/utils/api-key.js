import crypto from "crypto";

export const generateApiKey = () => {
  const randomValue = crypto.randomBytes(32).toString("hex");

  return `djs_${randomValue}`;
};

export const hashApiKey = (apiKey) => {
  return crypto
    .createHash("sha256")
    .update(apiKey)
    .digest("hex");
};

export const verifyApiKey = (apiKey, storedHash) => {
  const providedHash = hashApiKey(apiKey);

  const providedBuffer = Buffer.from(providedHash, "hex");
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (providedBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, storedBuffer);
};
