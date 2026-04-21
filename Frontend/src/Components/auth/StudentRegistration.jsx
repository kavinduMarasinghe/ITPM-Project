import React, { useState } from "react";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiHash,
  FiLock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { api } from "../../services/api";
import { getDashboardRouteForRole, saveSession } from "../../services/session";

function StudentRegistration() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    email: "",
    phone: "",
    department: "",
    year: "",
    semester: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const departments = [
    "Computer Science",
    "Information Technology",
    "Business Administration",
    "Engineering",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Economics",
    "Psychology",
  ];

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const semesters = [
    "Semester 1",
    "Semester 2",
    "Semester 3",
    "Semester 4",
    "Semester 5",
    "Semester 6",
    "Semester 7",
    "Semester 8",
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    const studentIdRegex = /^STU\d{3}$/i;
    const phoneRegex = /^[0-9]{10}$/;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Name must be at least 3 characters";
    }

    if (!formData.studentId.trim()) {
      newErrors.studentId = "Student ID is required";
    } else if (!studentIdRegex.test(formData.studentId)) {
      newErrors.studentId = "Student ID must be in format STU001";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.department) {
      newErrors.department = "Please select a department";
    }

    if (!formData.year) {
      newErrors.year = "Please select your year";
    }

    if (!formData.semester) {
      newErrors.semester = "Please select your semester";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const response = await api.registerStudent(formData);
      saveSession(response.data);
      setRegistrationSuccess(true);

      setTimeout(() => {
        navigate(getDashboardRouteForRole(response.data.user.role), {
          replace: true,
        });
      }, 1500);
    } catch (requestError) {
      setErrors({ submit: requestError.message });
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: "#F4F6F9" }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
            style={{ backgroundColor: "#22C55E" }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
            style={{ backgroundColor: "#F97316" }}
          />
        </div>

        <div className="relative z-10 w-full max-w-md px-4 text-center animate-slide-up">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle size={48} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#0F172A" }}>
              Registration Successful!
            </h2>
            <p className="text-gray-500 mb-6">
              Welcome to EventAura, {formData.fullName}!
            </p>
            <button
              type="button"
              className="w-full text-white py-3 rounded-xl font-semibold transition-all duration-300"
              style={{ backgroundColor: "#F97316" }}
            >
              Redirecting to Student Portal...
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden py-8"
      style={{ backgroundColor: "#F4F6F9" }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
          style={{ backgroundColor: "#F97316" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
          style={{ backgroundColor: "#0F172A" }}
        />
        <div
          className="absolute top-40 left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
          style={{ backgroundColor: "#22C55E" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-4">
        <div className="text-center mb-6 animate-fade-in">
          <button
            type="button"
            onClick={() => navigate("/student/login")}
            className="absolute left-4 top-0 flex items-center gap-2 text-sm hover:opacity-70 transition-all"
            style={{ color: "#F97316" }}
          >
            <FiArrowLeft size={18} />
            Back to Login
          </button>
          <h1 className="text-4xl font-bold mb-2 tracking-tight" style={{ color: "#0F172A" }}>
            Event<span style={{ color: "#F97316" }}>Aura</span>
          </h1>
          <p className="text-sm" style={{ color: "#64748B" }}>
            Create your student account
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 animate-slide-up shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="group md:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "#F97316" }} size={18} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: errors.fullName ? "#EF4444" : "#E2E8F0",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                    }}
                    placeholder="John Doe"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#EF4444" }}>
                    <FiAlertCircle size={12} /> {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                  Student ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "#F97316" }} size={18} />
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: errors.studentId ? "#EF4444" : "#E2E8F0",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                    }}
                    placeholder="STU001"
                  />
                </div>
                {errors.studentId && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#EF4444" }}>
                    <FiAlertCircle size={12} /> {errors.studentId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "#F97316" }} size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: errors.email ? "#EF4444" : "#E2E8F0",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                    }}
                    placeholder="student@university.edu"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#EF4444" }}>
                    <FiAlertCircle size={12} /> {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "#F97316" }} size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: errors.phone ? "#EF4444" : "#E2E8F0",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                    }}
                    placeholder="9876543210"
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#EF4444" }}>
                    <FiAlertCircle size={12} /> {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiBookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "#F97316" }} size={18} />
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none"
                    style={{
                      borderColor: errors.department ? "#EF4444" : "#E2E8F0",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                    }}
                  >
                    <option value="">Select Department</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.department && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#EF4444" }}>
                    <FiAlertCircle size={12} /> {errors.department}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                  Year <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "#F97316" }} size={18} />
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none"
                    style={{
                      borderColor: errors.year ? "#EF4444" : "#E2E8F0",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                    }}
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.year && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#EF4444" }}>
                    <FiAlertCircle size={12} /> {errors.year}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                  Semester <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "#F97316" }} size={18} />
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none"
                    style={{
                      borderColor: errors.semester ? "#EF4444" : "#E2E8F0",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                    }}
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((semester) => (
                      <option key={semester} value={semester}>
                        {semester}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.semester && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#EF4444" }}>
                    <FiAlertCircle size={12} /> {errors.semester}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                  Address
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-3" style={{ color: "#F97316" }} size={18} />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none"
                    style={{
                      borderColor: "#E2E8F0",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                    }}
                    placeholder="Your address (optional)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "#F97316" }} size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: errors.password ? "#EF4444" : "#E2E8F0",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                    }}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70"
                    style={{ color: "#64748B" }}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#EF4444" }}>
                    <FiAlertCircle size={12} /> {errors.password}
                  </p>
                )}
                <p className="text-xs mt-1" style={{ color: "#64748B" }}>
                  Must be 6+ chars with 1 uppercase & 1 number
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#0F172A" }}>
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: "#F97316" }} size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: errors.confirmPassword ? "#EF4444" : "#E2E8F0",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                    }}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70"
                    style={{ color: "#64748B" }}
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#EF4444" }}>
                    <FiAlertCircle size={12} /> {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {errors.submit && (
              <div
                className="rounded-xl p-3 animate-shake"
                style={{ backgroundColor: "#FEE2E2", border: "1px solid #EF4444" }}
              >
                <p
                  className="text-sm text-center flex items-center justify-center gap-2"
                  style={{ color: "#EF4444" }}
                >
                  <FiAlertCircle size={16} /> {errors.submit}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#F97316" }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Register as Student
                  <FiCheckCircle size={18} />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs" style={{ color: "#64748B" }}>
                By registering, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.5s ease-out; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}

export default StudentRegistration;
