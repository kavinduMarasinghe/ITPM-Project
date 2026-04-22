const { randomUUID } = require("crypto");

const { ROLES, USER_STATUSES } = require("../config/constants");
const userModel = require("../models/UserModel");
const { AppError } = require("../utils/errors");
const { hashPassword } = require("../utils/password");

const EMAIL_REGEX = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const STUDENT_ID_REGEX = /^STU\d{3}$/i;

class StudentService {
  async registerStudent(payload) {
    const fullName = String(payload.fullName || "").trim();
    const studentId = String(payload.studentId || "").trim().toUpperCase();
    const email = String(payload.email || "").trim().toLowerCase();
    const phone = String(payload.phone || "").trim();
    const department = String(payload.department || "").trim();
    const year = String(payload.year || "").trim();
    const semester = String(payload.semester || "").trim();
    const address = String(payload.address || "").trim();
    const password = String(payload.password || "");
    const confirmPassword = String(payload.confirmPassword || "");

    if (fullName.length < 3) {
      throw new AppError(400, "Full name must be at least 3 characters.");
    }

    if (!STUDENT_ID_REGEX.test(studentId)) {
      throw new AppError(400, "Student ID must be in format STU001.");
    }

    if (!EMAIL_REGEX.test(email)) {
      throw new AppError(400, "Please enter a valid email address.");
    }

    if (!PHONE_REGEX.test(phone)) {
      throw new AppError(400, "Phone number must be 10 digits.");
    }

    if (!department || !year || !semester) {
      throw new AppError(400, "Department, year, and semester are required.");
    }

    if (password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      throw new AppError(
        400,
        "Password must be at least 6 characters with at least one uppercase letter and one number."
      );
    }

    if (password !== confirmPassword) {
      throw new AppError(400, "Passwords do not match.");
    }

    if (await userModel.findByStudentId(studentId)) {
      throw new AppError(409, "Student ID already exists.");
    }

    if (await userModel.findByEmail(email)) {
      throw new AppError(409, "Email already exists.");
    }

    const now = new Date().toISOString();
    const user = {
      id: randomUUID(),
      role: ROLES.STUDENT,
      status: USER_STATUSES.ACTIVE,
      fullName,
      studentId,
      email,
      phone,
      department,
      year,
      semester,
      address,
      passwordHash: hashPassword(password),
      createdAt: now,
      updatedAt: now,
    };

    await userModel.createUser(user);
    return user;
  }
}

module.exports = new StudentService();
