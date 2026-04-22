const { randomBytes, scryptSync, timingSafeEqual } = require("crypto");

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) {
    return false;
  }

  const [salt, hash] = storedHash.split(":");
  const derivedKey = scryptSync(password, salt, 64);
  const hashBuffer = Buffer.from(hash, "hex");

  if (hashBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, derivedKey);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
