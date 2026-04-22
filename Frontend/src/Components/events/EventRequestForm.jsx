import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiBookOpen,
  FiBriefcase,
  FiCamera,
  FiCalendar,
  FiCheckSquare,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiImage,
  FiMapPin,
  FiPhone,
  FiSend,
  FiShield,
  FiTag,
  FiTrash2,
  FiUser,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { api } from "../../services/api";
import { clearSession, getSession } from "../../services/session";
import OrganizerPortalHeader from "../organizers/OrganizerPortalHeader";

const EVENT_TYPES = [
  "Conference",
  "Cultural Program",
  "Exhibition",
  "Concert",
  "Workshop",
  "Seminar",
  "Sports",
  "General",
];

const SOCIETY_CATEGORIES = [
  "Student Interactive Society",
  "Faculty Student Community",
  "Faculty Specialization Based",
  "Cross Discipline or Single Event Based",
  "World Wide Membership Based",
];

const VENUE_TYPES = [
  "Auditorium",
  "Lecture Hall",
  "Conference Room",
  "Outdoor Space",
  "Lab",
  "Virtual Platform",
];

function createStudentLead() {
  return {
    name: "",
    regNo: "",
    year: "",
    designation: "",
    contact: "",
    signature: null,
  };
}

function createStaffMember() {
  return {
    name: "",
    designation: "",
    contact: "",
    signature: null,
    isAdvisor: false,
  };
}

function createInitialFormData(organizationName = "") {
  return {
    eventTitle: "",
    eventType: "",
    societyName: organizationName,
    societyCategory: "",
    eventSummary: "",
    eventDescription: "",
    imageUrl: "",
    organizingStudents: [createStudentLead()],
    cleaningInCharge: [createStudentLead()],
    internalAudience: "",
    externalAudience: "",
    eventDate: "",
    eventTime: "",
    eventEndTime: "",
    duration: "",
    setupTime: "",
    clearTime: "",
    venue: "",
    venueType: "",
    internalGuests: "",
    externalGuests: "",
    additionalParking: false,
    parkingDetails: "",
    expectedParticipants: "",
    fundraisingDetails: "",
    budgetDetails: "",
    sisFundsRequired: false,
    seniorTreasurerApproval: false,
    seniorTreasurerName: "",
    seniorTreasurerDate: "",
    assistanceExpected: "",
    virtualPlatforms: "",
    externalEquipment: "",
    staffMembers: [createStaffMember()],
    studentServicesApproval: false,
    ircApproval: false,
    proVcApproval: false,
    termsAccepted: false,
    regulationsAccepted: false,
    damageResponsibility: false,
    cleaningResponsibility: false,
    financialTransparency: false,
  };
}

function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) {
    return "";
  }

  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const diffHours = (end - start) / (1000 * 60 * 60);

  if (diffHours <= 0) {
    return "";
  }

  return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
}

function isValidRegNo(value) {
  return /^\d{4}[A-Z]{2}\d{3}$/i.test(String(value || "").trim());
}

function isValidPhone(value) {
  return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(
    String(value || "").trim()
  );
}

function EventRequestForm() {
  const navigate = useNavigate();
  const session = useMemo(() => getSession(), []);
  const organizerName = session?.user?.fullName || "Organizer";
  const organizationName = session?.user?.organizationName || "";
  const organizerEmail = session?.user?.email || "";

  const [formData, setFormData] = useState(createInitialFormData(organizationName));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedEvent, setSubmittedEvent] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [signaturePreviews, setSignaturePreviews] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    basics: true,
    details: true,
    organizers: true,
    participants: true,
    guests: true,
    budget: true,
    resources: true,
    staff: true,
    logistics: true,
    terms: true,
  });

  const fileInputRefs = useRef({});

  const handleLogout = useCallback(async () => {
    try {
      setLoggingOut(true);

      if (session?.token) {
        await api.logout();
      }
    } catch (requestError) {
      // Clear the local session even if the backend session is already gone.
    } finally {
      clearSession();
      setLoggingOut(false);
      navigate("/login", { replace: true });
    }
  }, [navigate, session?.token]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => {
      const nextValue = type === "checkbox" ? checked : value;
      const nextData = {
        ...current,
        [name]: nextValue,
      };

      if (name === "eventTime" || name === "eventEndTime") {
        nextData.duration = calculateDuration(
          name === "eventTime" ? value : current.eventTime,
          name === "eventEndTime" ? value : current.eventEndTime
        );
      }

      if (name === "additionalParking" && !checked) {
        nextData.parkingDetails = "";
      }

      if (name === "sisFundsRequired" && !checked) {
        nextData.seniorTreasurerApproval = false;
        nextData.seniorTreasurerName = "";
        nextData.seniorTreasurerDate = "";
      }

      return nextData;
    });
    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
    setSubmitError("");
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData((current) => ({
      ...current,
      [arrayName]: current[arrayName].map((item, itemIndex) => {
        if (arrayName === "staffMembers" && field === "isAdvisor" && value) {
          return {
            ...item,
            isAdvisor: itemIndex === index,
          };
        }

        return itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item;
      }),
    }));

    setErrors((current) => ({
      ...current,
      [`${arrayName}_${index}_${field}`]: "",
      staffAdvisor: arrayName === "staffMembers" && field === "isAdvisor" ? "" : current.staffAdvisor,
    }));
  };

  const addArrayItem = (arrayName) => {
    setFormData((current) => ({
      ...current,
      [arrayName]: [
        ...current[arrayName],
        arrayName === "staffMembers" ? createStaffMember() : createStudentLead(),
      ],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData((current) => {
      if (current[arrayName].length <= 1) {
        return current;
      }

      return {
        ...current,
        [arrayName]: current[arrayName].filter((_, itemIndex) => itemIndex !== index),
      };
    });

    setErrors((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([key]) => !key.startsWith(`${arrayName}_`))
      )
    );
    setSignaturePreviews((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([key]) => !key.startsWith(`${arrayName}_`))
      )
    );
  };

  const handleSignatureUpload = (arrayName, index, file) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const signatureData = reader.result;

      setFormData((current) => ({
        ...current,
        [arrayName]: current[arrayName].map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                signature: signatureData,
              }
            : item
        ),
      }));

      setSignaturePreviews((current) => ({
        ...current,
        [`${arrayName}_${index}`]: signatureData,
      }));

      setErrors((current) => ({
        ...current,
        [`${arrayName}_${index}_signature`]: "",
      }));
    };

    reader.readAsDataURL(file);
  };

  const toggleSection = (sectionName) => {
    setExpandedSections((current) => ({
      ...current,
      [sectionName]: !current[sectionName],
    }));
  };

  const validate = () => {
    const nextErrors = {};
    const trimmedImageUrl = formData.imageUrl.trim();

    if (formData.eventTitle.trim().length < 3) {
      nextErrors.eventTitle = "Event title must be at least 3 characters.";
    }

    if (!formData.eventType) {
      nextErrors.eventType = "Please select an event type.";
    }

    if (formData.societyName.trim().length < 2) {
      nextErrors.societyName = "Organization or society name is required.";
    }

    if (!formData.societyCategory) {
      nextErrors.societyCategory = "Please select a society category.";
    }

    if (formData.eventSummary.trim().length < 20) {
      nextErrors.eventSummary = "Please add a short summary with at least 20 characters.";
    }

    if (formData.eventDescription.trim().length < 50) {
      nextErrors.eventDescription = "Please add a fuller description with at least 50 characters.";
    }

    if (
      trimmedImageUrl &&
      !/^https?:\/\//i.test(trimmedImageUrl) &&
      !/^data:image\//i.test(trimmedImageUrl)
    ) {
      nextErrors.imageUrl = "Use a valid image URL that starts with http:// or https://.";
    }

    if (!formData.eventDate) {
      nextErrors.eventDate = "Please choose an event date.";
    }

    if (formData.eventDate) {
      const selectedDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const twoWeeksFromNow = new Date(today);
      twoWeeksFromNow.setDate(today.getDate() + 14);

      if (selectedDate < twoWeeksFromNow) {
        nextErrors.eventDate = "Event must be scheduled at least 2 weeks in advance.";
      }
    }

    if (!formData.eventTime) {
      nextErrors.eventTime = "Please enter a start time.";
    }

    if (!formData.eventEndTime) {
      nextErrors.eventEndTime = "Please enter an end time.";
    }

    if (
      formData.eventDate &&
      formData.eventTime &&
      formData.eventEndTime &&
      new Date(`${formData.eventDate}T${formData.eventEndTime}`) <=
        new Date(`${formData.eventDate}T${formData.eventTime}`)
    ) {
      nextErrors.eventEndTime = "End time must be after the start time.";
    }

    if (
      formData.setupTime &&
      formData.eventTime &&
      formData.setupTime >= formData.eventTime
    ) {
      nextErrors.setupTime = "Setup time must be before the event start time.";
    }

    if (
      formData.clearTime &&
      formData.eventEndTime &&
      formData.clearTime <= formData.eventEndTime
    ) {
      nextErrors.clearTime = "Clear time must be after the event end time.";
    }

    if (formData.venue.trim().length < 2) {
      nextErrors.venue = "Venue is required.";
    }

    if (
      formData.internalAudience &&
      (!/^\d+$/.test(formData.internalAudience) || Number(formData.internalAudience) < 0)
    ) {
      nextErrors.internalAudience = "Use a valid whole number.";
    }

    if (
      formData.externalAudience &&
      (!/^\d+$/.test(formData.externalAudience) || Number(formData.externalAudience) < 0)
    ) {
      nextErrors.externalAudience = "Use a valid whole number.";
    }

    if (!formData.expectedParticipants || Number(formData.expectedParticipants) <= 0) {
      nextErrors.expectedParticipants = "Expected participants must be greater than 0.";
    }

    if (
      Number(formData.expectedParticipants || 0) > 0 &&
      (Number(formData.internalAudience || 0) > 0 ||
        Number(formData.externalAudience || 0) > 0) &&
      Number(formData.internalAudience || 0) + Number(formData.externalAudience || 0) !==
        Number(formData.expectedParticipants || 0)
    ) {
      nextErrors.expectedParticipants =
        "Total participants must equal internal plus external audience.";
    }

    if (!formData.fundraisingDetails.trim()) {
      nextErrors.fundraisingDetails = "Fundraising details are required.";
    }

    if (!formData.budgetDetails.trim()) {
      nextErrors.budgetDetails = "Budget details are required.";
    }

    if (!formData.assistanceExpected.trim()) {
      nextErrors.assistanceExpected = "Please describe the assistance expected from SLIIT.";
    }

    if (formData.additionalParking && !formData.parkingDetails.trim()) {
      nextErrors.parkingDetails = "Please describe the parking requirements.";
    }

    formData.organizingStudents.forEach((student, index) => {
      if (!student.name.trim()) {
        nextErrors[`organizingStudents_${index}_name`] = "Name is required.";
      }
      if (!student.regNo.trim()) {
        nextErrors[`organizingStudents_${index}_regNo`] = "Registration number is required.";
      } else if (!isValidRegNo(student.regNo)) {
        nextErrors[`organizingStudents_${index}_regNo`] = "Use a format like 2021CS001.";
      }
      if (!student.contact.trim()) {
        nextErrors[`organizingStudents_${index}_contact`] = "Contact number is required.";
      } else if (!isValidPhone(student.contact)) {
        nextErrors[`organizingStudents_${index}_contact`] = "Enter a valid phone number.";
      }
      if (!student.signature) {
        nextErrors[`organizingStudents_${index}_signature`] = "Signature is required.";
      }
    });

    formData.cleaningInCharge.forEach((student, index) => {
      if (!student.name.trim()) {
        nextErrors[`cleaningInCharge_${index}_name`] = "Name is required.";
      }
      if (!student.regNo.trim()) {
        nextErrors[`cleaningInCharge_${index}_regNo`] = "Registration number is required.";
      } else if (!isValidRegNo(student.regNo)) {
        nextErrors[`cleaningInCharge_${index}_regNo`] = "Use a format like 2021CS001.";
      }
      if (!student.contact.trim()) {
        nextErrors[`cleaningInCharge_${index}_contact`] = "Contact number is required.";
      } else if (!isValidPhone(student.contact)) {
        nextErrors[`cleaningInCharge_${index}_contact`] = "Enter a valid phone number.";
      }
      if (!student.signature) {
        nextErrors[`cleaningInCharge_${index}_signature`] = "Signature is required.";
      }
    });

    let advisorCount = 0;
    formData.staffMembers.forEach((member, index) => {
      if (!member.name.trim()) {
        nextErrors[`staffMembers_${index}_name`] = "Staff name is required.";
      }
      if (!member.designation.trim()) {
        nextErrors[`staffMembers_${index}_designation`] = "Designation is required.";
      }
      if (member.contact && !isValidPhone(member.contact)) {
        nextErrors[`staffMembers_${index}_contact`] = "Enter a valid phone number.";
      }
      if (!member.signature) {
        nextErrors[`staffMembers_${index}_signature`] = "Signature is required.";
      }
      if (member.isAdvisor) {
        advisorCount += 1;
      }
    });

    if (advisorCount !== 1) {
      nextErrors.staffAdvisor = "Exactly one staff member must be marked as the Staff Advisor.";
    }

    if (!formData.termsAccepted) {
      nextErrors.termsAccepted = "You need to confirm the submission before sending it.";
    }

    if (!formData.regulationsAccepted) {
      nextErrors.regulationsAccepted = "You must agree to follow SLIIT regulations.";
    }

    if (!formData.damageResponsibility) {
      nextErrors.damageResponsibility = "Please accept responsibility for any damages.";
    }

    if (!formData.cleaningResponsibility) {
      nextErrors.cleaningResponsibility = "Please accept venue cleaning responsibility.";
    }

    if (!formData.financialTransparency) {
      nextErrors.financialTransparency = "Please agree to financial transparency.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      setExpandedSections({
        basics: true,
        details: true,
        organizers: true,
        participants: true,
        guests: true,
        budget: true,
        resources: true,
        staff: true,
        logistics: true,
        terms: true,
      });
      const firstError = document.querySelector(".error-message");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    try {
      setLoading(true);
      setSubmitError("");

      const response = await api.createEventRequest(formData);
      setSubmittedEvent(response.data.event);
    } catch (requestError) {
      setSubmitError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnother = () => {
    setSubmittedEvent(null);
    setSubmitError("");
    setErrors({});
    setFormData(createInitialFormData(organizationName));
    setSignaturePreviews({});
  };

  if (submittedEvent) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F4F6F9" }}>
        <OrganizerPortalHeader
          organizationName={organizationName || "Organization"}
          primaryActionLabel="Organizer Dashboard"
          primaryActionIcon={FiArrowLeft}
          onPrimaryAction={() => navigate("/organizerteamdashboard")}
          onLogout={handleLogout}
          loggingOut={loggingOut}
        />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div
            className="rounded-[32px] border bg-white shadow-sm p-8 md:p-10 text-center"
            style={{ borderColor: "#E2E8F0" }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: "#DCFCE7" }}
            >
              <FiCheckCircle size={42} style={{ color: "#16A34A" }} />
            </div>
            <p
              className="text-sm font-semibold uppercase tracking-[0.3em] mb-3"
              style={{ color: "#F97316" }}
            >
              Request Submitted
            </p>
            <h1 className="text-3xl font-bold mb-3" style={{ color: "#0F172A" }}>
              Waiting for Admin Approval
            </h1>
            <p className="text-base mb-6" style={{ color: "#64748B" }}>
              Your event request has been saved successfully. Once the admin approves it,
              you will be able to publish it from the organizer dashboard.
            </p>

            <div
              className="rounded-3xl p-6 mb-6 text-left"
              style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: "#C2410C" }}>
                Reference Number
              </p>
              <p className="text-2xl font-bold mb-4" style={{ color: "#7C2D12" }}>
                {submittedEvent.referenceNumber}
              </p>
              <div className="grid gap-3 md:grid-cols-2 text-sm" style={{ color: "#7C2D12" }}>
                <p><strong>Event:</strong> {submittedEvent.eventTitle}</p>
                <p><strong>Status:</strong> {submittedEvent.status}</p>
                <p><strong>Date:</strong> {submittedEvent.eventDate}</p>
                <p><strong>Venue:</strong> {submittedEvent.venue}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate("/organizerteamdashboard")}
                className="flex-1 px-5 py-3 rounded-2xl font-semibold text-white"
                style={{ backgroundColor: "#F97316" }}
              >
                Back to Organizer Dashboard
              </button>
              <button
                type="button"
                onClick={handleCreateAnother}
                className="flex-1 px-5 py-3 rounded-2xl font-semibold border"
                style={{ borderColor: "#E2E8F0", color: "#0F172A" }}
              >
                Create Another Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4F6F9" }}>
      <OrganizerPortalHeader
        organizationName={organizationName || "Organization"}
        primaryActionLabel="Organizer Dashboard"
        primaryActionIcon={FiArrowLeft}
        onPrimaryAction={() => navigate("/organizerteamdashboard")}
        onLogout={handleLogout}
        loggingOut={loggingOut}
      />
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        <div
          className="rounded-[32px] overflow-hidden shadow-sm border mb-8"
          style={{ borderColor: "#E2E8F0" }}
        >
          <div
            className="px-8 py-9 text-white"
            style={{ background: "linear-gradient(135deg, #F97316 0%, #0F172A 100%)" }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/80 mb-3">
              Organizer Portal
            </p>
            <h1 className="text-4xl font-bold mb-3">Create Event Request</h1>
            <p className="max-w-3xl text-white/90">
              Submit your event for admin review. After approval, you will be able to
              publish it to the student events section from your organizer dashboard.
            </p>
          </div>

          <div className="bg-white px-8 py-6 grid gap-4 md:grid-cols-3">
            {[
              { label: "Organizer", value: organizerName, icon: FiFileText },
              { label: "Organization", value: organizationName || "Use the name below", icon: FiTag },
              { label: "Contact Email", value: organizerEmail || "No email found", icon: FiSend },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-2xl p-4"
                  style={{ backgroundColor: "#F8FAFC" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} style={{ color: "#F97316" }} />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#64748B" }}>
                      {item.label}
                    </p>
                  </div>
                  <p className="font-semibold" style={{ color: "#0F172A" }}>
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6">
          <div
            className="bg-white rounded-[28px] border shadow-sm p-6 md:p-8"
            style={{ borderColor: "#E2E8F0" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "#FFF7ED", color: "#F97316" }}
              >
                <FiFileText size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
                  Event Basics
                </h2>
                <p style={{ color: "#64748B" }}>
                  These details will be reviewed by admin and later shown to students when published.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Event Title"
                name="eventTitle"
                value={formData.eventTitle}
                onChange={handleChange}
                error={errors.eventTitle}
                placeholder="Innovation Expo 2026"
              />

              <SelectField
                label="Event Type"
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                error={errors.eventType}
                options={EVENT_TYPES}
              />

              <InputField
                label="Organization or Society"
                name="societyName"
                value={formData.societyName}
                onChange={handleChange}
                error={errors.societyName}
                placeholder="Campus Events Collective"
              />

              <SelectField
                label="Society Category"
                name="societyCategory"
                value={formData.societyCategory}
                onChange={handleChange}
                error={errors.societyCategory}
                options={SOCIETY_CATEGORIES}
              />

              <SelectField
                label="Venue Type"
                name="venueType"
                value={formData.venueType}
                onChange={handleChange}
                error={errors.venueType}
                options={VENUE_TYPES}
              />

              <InputField
                label="Event Image URL"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                error={errors.imageUrl}
                placeholder="https://example.com/event-poster.jpg"
                icon={FiImage}
                className="md:col-span-2"
              />

              <TextAreaField
                label="Event Summary"
                name="eventSummary"
                value={formData.eventSummary}
                onChange={handleChange}
                error={errors.eventSummary}
                rows={3}
                className="md:col-span-2"
                placeholder="A short high-level summary of the event."
              />

              <TextAreaField
                label="Event Description"
                name="eventDescription"
                value={formData.eventDescription}
                onChange={handleChange}
                error={errors.eventDescription}
                rows={5}
                className="md:col-span-2"
                placeholder="Describe the purpose, audience, and experience of the event."
              />
            </div>
          </div>

          <div
            className="bg-white rounded-[28px] border shadow-sm overflow-hidden"
            style={{ borderColor: "#E2E8F0" }}
          >
            <button
              type="button"
              onClick={() => toggleSection("details")}
              className="w-full px-6 md:px-8 py-5 flex items-center justify-between border-b"
              style={{ borderColor: "#F1F5F9", backgroundColor: "#F0FDF4" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "#16A34A", color: "#FFFFFF" }}
                >
                  <FiCheckSquare size={22} />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
                    Cleaning In Charge
                  </h2>
                  <p style={{ color: "#64748B" }}>
                    Add the students responsible for venue cleanup and handover.
                  </p>
                </div>
              </div>
              {expandedSections.details ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>

            {expandedSections.details ? (
              <div className="p-6 md:p-8 space-y-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => addArrayItem("cleaningInCharge")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-white font-semibold"
                    style={{ backgroundColor: "#F97316" }}
                  >
                    <FiUserPlus size={16} />
                    Add Member
                  </button>
                </div>

                {formData.cleaningInCharge.map((student, index) => (
                  <div
                    key={`cleaning-${index}`}
                    className="rounded-3xl border p-5 md:p-6 relative"
                    style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}
                  >
                    {index > 0 ? (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("cleaningInCharge", index)}
                        className="absolute top-4 right-4 p-2 rounded-xl"
                        style={{ color: "#DC2626" }}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    ) : null}

                    <div className="grid gap-5 md:grid-cols-2">
                      <InputField
                        label="Full Name"
                        value={student.name}
                        onChange={(event) =>
                          handleArrayChange("cleaningInCharge", index, "name", event.target.value)
                        }
                        error={errors[`cleaningInCharge_${index}_name`]}
                        placeholder="Student full name"
                        icon={FiUser}
                      />
                      <InputField
                        label="Registration Number"
                        value={student.regNo}
                        onChange={(event) =>
                          handleArrayChange("cleaningInCharge", index, "regNo", event.target.value)
                        }
                        error={errors[`cleaningInCharge_${index}_regNo`]}
                        placeholder="2021CS001"
                        icon={FiTag}
                      />
                      <InputField
                        label="Year or Semester"
                        value={student.year}
                        onChange={(event) =>
                          handleArrayChange("cleaningInCharge", index, "year", event.target.value)
                        }
                        placeholder="3rd Year, Semester 1"
                        icon={FiBookOpen}
                      />
                      <InputField
                        label="Designation"
                        value={student.designation}
                        onChange={(event) =>
                          handleArrayChange("cleaningInCharge", index, "designation", event.target.value)
                        }
                        placeholder="Cleanup Lead"
                        icon={FiBriefcase}
                      />
                      <InputField
                        label="Contact Number"
                        value={student.contact}
                        onChange={(event) =>
                          handleArrayChange("cleaningInCharge", index, "contact", event.target.value)
                        }
                        error={errors[`cleaningInCharge_${index}_contact`]}
                        placeholder="+94 77 123 4567"
                        icon={FiPhone}
                      />
                      <div>
                        <FieldShell
                          label="Signature"
                          error={errors[`cleaningInCharge_${index}_signature`]}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={(element) => {
                              fileInputRefs.current[`cleaningInCharge_${index}`] = element;
                            }}
                            onChange={(event) =>
                              handleSignatureUpload(
                                "cleaningInCharge",
                                index,
                                event.target.files?.[0] || null
                              )
                            }
                          />
                          <div className="flex items-center gap-3 flex-wrap">
                            <button
                              type="button"
                              onClick={() =>
                                fileInputRefs.current[`cleaningInCharge_${index}`]?.click()
                              }
                              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border font-semibold"
                              style={{ borderColor: "#E2E8F0", color: "#0F172A" }}
                            >
                              <FiCamera size={16} />
                              Upload Signature
                            </button>
                            {signaturePreviews[`cleaningInCharge_${index}`] ? (
                              <img
                                src={signaturePreviews[`cleaningInCharge_${index}`]}
                                alt="Cleanup signature preview"
                                className="w-16 h-10 object-contain border rounded-xl"
                                style={{ borderColor: "#E2E8F0" }}
                              />
                            ) : null}
                          </div>
                        </FieldShell>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div
            className="bg-white rounded-[28px] border shadow-sm overflow-hidden"
            style={{ borderColor: "#E2E8F0" }}
          >
            <button
              type="button"
              onClick={() => toggleSection("organizers")}
              className="w-full px-6 md:px-8 py-5 flex items-center justify-between border-b"
              style={{ borderColor: "#F1F5F9", backgroundColor: "#FFFBEB" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "#F97316", color: "#FFFFFF" }}
                >
                  <FiUsers size={22} />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
                    Organizing Students
                  </h2>
                  <p style={{ color: "#64748B" }}>
                    Add the student leaders responsible for organizing and execution.
                  </p>
                </div>
              </div>
              {expandedSections.organizers ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>

            {expandedSections.organizers ? (
              <div className="p-6 md:p-8 space-y-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => addArrayItem("organizingStudents")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-white font-semibold"
                    style={{ backgroundColor: "#F97316" }}
                  >
                    <FiUserPlus size={16} />
                    Add Member
                  </button>
                </div>

                {formData.organizingStudents.map((student, index) => (
                  <div
                    key={`organizer-${index}`}
                    className="rounded-3xl border p-5 md:p-6 relative"
                    style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}
                  >
                    {index > 0 ? (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("organizingStudents", index)}
                        className="absolute top-4 right-4 p-2 rounded-xl"
                        style={{ color: "#DC2626" }}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    ) : null}

                    <div className="grid gap-5 md:grid-cols-2">
                      <InputField
                        label="Full Name"
                        value={student.name}
                        onChange={(event) =>
                          handleArrayChange("organizingStudents", index, "name", event.target.value)
                        }
                        error={errors[`organizingStudents_${index}_name`]}
                        placeholder="Student full name"
                        icon={FiUser}
                      />
                      <InputField
                        label="Registration Number"
                        value={student.regNo}
                        onChange={(event) =>
                          handleArrayChange("organizingStudents", index, "regNo", event.target.value)
                        }
                        error={errors[`organizingStudents_${index}_regNo`]}
                        placeholder="2021CS001"
                        icon={FiTag}
                      />
                      <InputField
                        label="Year or Semester"
                        value={student.year}
                        onChange={(event) =>
                          handleArrayChange("organizingStudents", index, "year", event.target.value)
                        }
                        placeholder="3rd Year, Semester 1"
                        icon={FiBookOpen}
                      />
                      <InputField
                        label="Designation"
                        value={student.designation}
                        onChange={(event) =>
                          handleArrayChange("organizingStudents", index, "designation", event.target.value)
                        }
                        placeholder="President, Secretary, Team Lead"
                        icon={FiBriefcase}
                      />
                      <InputField
                        label="Contact Number"
                        value={student.contact}
                        onChange={(event) =>
                          handleArrayChange("organizingStudents", index, "contact", event.target.value)
                        }
                        error={errors[`organizingStudents_${index}_contact`]}
                        placeholder="+94 77 123 4567"
                        icon={FiPhone}
                      />
                      <div>
                        <FieldShell
                          label="Signature"
                          error={errors[`organizingStudents_${index}_signature`]}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={(element) => {
                              fileInputRefs.current[`organizingStudents_${index}`] = element;
                            }}
                            onChange={(event) =>
                              handleSignatureUpload(
                                "organizingStudents",
                                index,
                                event.target.files?.[0] || null
                              )
                            }
                          />
                          <div className="flex items-center gap-3 flex-wrap">
                            <button
                              type="button"
                              onClick={() =>
                                fileInputRefs.current[`organizingStudents_${index}`]?.click()
                              }
                              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border font-semibold"
                              style={{ borderColor: "#E2E8F0", color: "#0F172A" }}
                            >
                              <FiCamera size={16} />
                              Upload Signature
                            </button>
                            {signaturePreviews[`organizingStudents_${index}`] ? (
                              <img
                                src={signaturePreviews[`organizingStudents_${index}`]}
                                alt="Organizer signature preview"
                                className="w-16 h-10 object-contain border rounded-xl"
                                style={{ borderColor: "#E2E8F0" }}
                              />
                            ) : null}
                          </div>
                        </FieldShell>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div
            className="bg-white rounded-[28px] border shadow-sm overflow-hidden"
            style={{ borderColor: "#E2E8F0" }}
          >
            <button
              type="button"
              onClick={() => toggleSection("participants")}
              className="w-full px-6 md:px-8 py-5 flex items-center justify-between border-b"
              style={{ borderColor: "#F1F5F9", backgroundColor: "#F8FAFC" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                >
                  <FiUsers size={22} />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
                    Participants & Guests
                  </h2>
                  <p style={{ color: "#64748B" }}>
                    Add attendance split, invited guests, and parking needs.
                  </p>
                </div>
              </div>
              {expandedSections.participants ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>

            {expandedSections.participants ? (
              <div className="p-6 md:p-8 space-y-6">
                <div className="grid gap-5 md:grid-cols-3">
                  <InputField
                    label="Internal Audience"
                    name="internalAudience"
                    type="number"
                    value={formData.internalAudience}
                    onChange={handleChange}
                    error={errors.internalAudience}
                    placeholder="SLIIT audience"
                    icon={FiUsers}
                  />
                  <InputField
                    label="External Audience"
                    name="externalAudience"
                    type="number"
                    value={formData.externalAudience}
                    onChange={handleChange}
                    error={errors.externalAudience}
                    placeholder="Outside audience"
                    icon={FiUsers}
                  />
                  <InputField
                    label="Expected Participants"
                    name="expectedParticipants"
                    type="number"
                    value={formData.expectedParticipants}
                    onChange={handleChange}
                    error={errors.expectedParticipants}
                    placeholder="250"
                    icon={FiUsers}
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <TextAreaField
                    label="Internal Guests"
                    name="internalGuests"
                    value={formData.internalGuests}
                    onChange={handleChange}
                    rows={2}
                    placeholder="List internal guests or supporting staff."
                  />
                  <TextAreaField
                    label="External Guests"
                    name="externalGuests"
                    value={formData.externalGuests}
                    onChange={handleChange}
                    rows={2}
                    placeholder="List external guests and affiliations."
                  />
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="additionalParking"
                      checked={formData.additionalParking}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span style={{ color: "#0F172A" }}>
                      Additional parking required for guests
                    </span>
                  </label>

                  {formData.additionalParking ? (
                    <TextAreaField
                      label="Parking Details"
                      name="parkingDetails"
                      value={formData.parkingDetails}
                      onChange={handleChange}
                      error={errors.parkingDetails}
                      rows={2}
                      placeholder="Specify vehicle count and special parking requests."
                    />
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <div
            className="bg-white rounded-[28px] border shadow-sm overflow-hidden"
            style={{ borderColor: "#E2E8F0" }}
          >
            <button
              type="button"
              onClick={() => toggleSection("budget")}
              className="w-full px-6 md:px-8 py-5 flex items-center justify-between border-b"
              style={{ borderColor: "#F1F5F9", backgroundColor: "#FEF2F2" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "#DC2626", color: "#FFFFFF" }}
                >
                  <FiDollarSign size={22} />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
                    Fundraising & Budget
                  </h2>
                  <p style={{ color: "#64748B" }}>
                    Add funding details, treasury notes, and budget breakdowns.
                  </p>
                </div>
              </div>
              {expandedSections.budget ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>

            {expandedSections.budget ? (
              <div className="p-6 md:p-8 space-y-5">
                <TextAreaField
                  label="Fundraising Details"
                  name="fundraisingDetails"
                  value={formData.fundraisingDetails}
                  onChange={handleChange}
                  error={errors.fundraisingDetails}
                  rows={3}
                  placeholder="Describe how funds will be raised and collected."
                />
                <TextAreaField
                  label="Budget Details"
                  name="budgetDetails"
                  value={formData.budgetDetails}
                  onChange={handleChange}
                  error={errors.budgetDetails}
                  rows={4}
                  placeholder="Provide the full budget breakdown including income and expenditure."
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-2xl p-4" style={{ backgroundColor: "#FFF7ED" }}>
                    <input
                      type="checkbox"
                      name="sisFundsRequired"
                      checked={formData.sisFundsRequired}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span style={{ color: "#7C2D12" }}>SIS funding required</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl p-4" style={{ backgroundColor: "#F8FAFC" }}>
                    <input
                      type="checkbox"
                      name="seniorTreasurerApproval"
                      checked={formData.seniorTreasurerApproval}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span style={{ color: "#0F172A" }}>Senior treasurer approval attached</span>
                  </label>
                </div>

                {(formData.sisFundsRequired || formData.seniorTreasurerApproval) ? (
                  <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                      label="Senior Treasurer Name"
                      name="seniorTreasurerName"
                      value={formData.seniorTreasurerName}
                      onChange={handleChange}
                      placeholder="Treasurer name"
                      icon={FiUser}
                    />
                    <InputField
                      label="Treasurer Approval Date"
                      name="seniorTreasurerDate"
                      type="date"
                      value={formData.seniorTreasurerDate}
                      onChange={handleChange}
                      icon={FiCalendar}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div
            className="bg-white rounded-[28px] border shadow-sm overflow-hidden"
            style={{ borderColor: "#E2E8F0" }}
          >
            <button
              type="button"
              onClick={() => toggleSection("resources")}
              className="w-full px-6 md:px-8 py-5 flex items-center justify-between border-b"
              style={{ borderColor: "#F1F5F9", backgroundColor: "#EFF6FF" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                >
                  <FiCheckSquare size={22} />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
                    Resources & Assistance
                  </h2>
                  <p style={{ color: "#64748B" }}>
                    Capture support requests, virtual tools, and external vendors.
                  </p>
                </div>
              </div>
              {expandedSections.resources ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>

            {expandedSections.resources ? (
              <div className="p-6 md:p-8 space-y-5">
                <TextAreaField
                  label="Assistance Expected from SLIIT"
                  name="assistanceExpected"
                  value={formData.assistanceExpected}
                  onChange={handleChange}
                  error={errors.assistanceExpected}
                  rows={3}
                  placeholder="Venue setup, AV support, power, security, volunteers, or other requirements."
                />
                <TextAreaField
                  label="Virtual Platforms"
                  name="virtualPlatforms"
                  value={formData.virtualPlatforms}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Teams, streaming platforms, or hybrid event requirements."
                />
                <TextAreaField
                  label="External Equipment or Companies"
                  name="externalEquipment"
                  value={formData.externalEquipment}
                  onChange={handleChange}
                  rows={3}
                  placeholder="List sponsors, equipment suppliers, or external vendors entering campus."
                />
              </div>
            ) : null}
          </div>

          <div
            className="bg-white rounded-[28px] border shadow-sm overflow-hidden"
            style={{ borderColor: "#E2E8F0" }}
          >
            <button
              type="button"
              onClick={() => toggleSection("staff")}
              className="w-full px-6 md:px-8 py-5 flex items-center justify-between border-b"
              style={{ borderColor: "#F1F5F9", backgroundColor: "#F0FDF4" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "#16A34A", color: "#FFFFFF" }}
                >
                  <FiShield size={22} />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
                    Staff Members in Charge
                  </h2>
                  <p style={{ color: "#64748B" }}>
                    Add supervising staff and mark one person as the Staff Advisor.
                  </p>
                </div>
              </div>
              {expandedSections.staff ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>

            {expandedSections.staff ? (
              <div className="p-6 md:p-8 space-y-4">
                {errors.staffAdvisor ? (
                  <div
                    className="rounded-2xl border p-4 error-message"
                    style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }}
                  >
                    {errors.staffAdvisor}
                  </div>
                ) : null}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => addArrayItem("staffMembers")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-white font-semibold"
                    style={{ backgroundColor: "#F97316" }}
                  >
                    <FiUserPlus size={16} />
                    Add Staff
                  </button>
                </div>

                {formData.staffMembers.map((member, index) => (
                  <div
                    key={`staff-${index}`}
                    className="rounded-3xl border p-5 md:p-6 relative"
                    style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}
                  >
                    {index > 0 ? (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("staffMembers", index)}
                        className="absolute top-4 right-4 p-2 rounded-xl"
                        style={{ color: "#DC2626" }}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    ) : null}

                    <div className="grid gap-5 md:grid-cols-2">
                      <InputField
                        label="Name"
                        value={member.name}
                        onChange={(event) =>
                          handleArrayChange("staffMembers", index, "name", event.target.value)
                        }
                        error={errors[`staffMembers_${index}_name`]}
                        placeholder="Staff full name"
                        icon={FiUser}
                      />
                      <InputField
                        label="Designation"
                        value={member.designation}
                        onChange={(event) =>
                          handleArrayChange("staffMembers", index, "designation", event.target.value)
                        }
                        error={errors[`staffMembers_${index}_designation`]}
                        placeholder="Lecturer, Coordinator, Advisor"
                        icon={FiBriefcase}
                      />
                      <InputField
                        label="Contact Number"
                        value={member.contact}
                        onChange={(event) =>
                          handleArrayChange("staffMembers", index, "contact", event.target.value)
                        }
                        error={errors[`staffMembers_${index}_contact`]}
                        placeholder="+94 77 123 4567"
                        icon={FiPhone}
                      />
                      <div>
                        <FieldShell label="Signature" error={errors[`staffMembers_${index}_signature`]}>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={(element) => {
                              fileInputRefs.current[`staffMembers_${index}`] = element;
                            }}
                            onChange={(event) =>
                              handleSignatureUpload(
                                "staffMembers",
                                index,
                                event.target.files?.[0] || null
                              )
                            }
                          />
                          <div className="flex items-center gap-3 flex-wrap">
                            <button
                              type="button"
                              onClick={() =>
                                fileInputRefs.current[`staffMembers_${index}`]?.click()
                              }
                              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border font-semibold"
                              style={{ borderColor: "#E2E8F0", color: "#0F172A" }}
                            >
                              <FiCamera size={16} />
                              Upload Signature
                            </button>
                            {signaturePreviews[`staffMembers_${index}`] ? (
                              <img
                                src={signaturePreviews[`staffMembers_${index}`]}
                                alt="Staff signature preview"
                                className="w-16 h-10 object-contain border rounded-xl"
                                style={{ borderColor: "#E2E8F0" }}
                              />
                            ) : null}
                          </div>
                        </FieldShell>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 mt-4">
                      <input
                        type="checkbox"
                        checked={member.isAdvisor}
                        onChange={(event) =>
                          handleArrayChange("staffMembers", index, "isAdvisor", event.target.checked)
                        }
                        className="w-4 h-4"
                      />
                      <span style={{ color: "#0F172A" }}>Mark as Staff Advisor</span>
                    </label>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div
            className="bg-white rounded-[28px] border shadow-sm overflow-hidden"
            style={{ borderColor: "#E2E8F0" }}
          >
            <button
              type="button"
              onClick={() => toggleSection("logistics")}
              className="w-full px-6 md:px-8 py-5 flex items-center justify-between border-b"
              style={{ borderColor: "#F1F5F9", backgroundColor: "#EFF6FF" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                >
                  <FiCalendar size={22} />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
                    Schedule & Logistics
                  </h2>
                  <p style={{ color: "#64748B" }}>
                    Add the date, venue, timing, and support logistics needed for approval.
                  </p>
                </div>
              </div>
              {expandedSections.logistics ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>

            {expandedSections.logistics ? (
              <div className="p-6 md:p-8">
                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    label="Event Date"
                    name="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={handleChange}
                    error={errors.eventDate}
                    icon={FiCalendar}
                  />
                  <InputField
                    label="Duration"
                    name="duration"
                    value={formData.duration}
                    error={errors.duration}
                    placeholder="Calculated automatically"
                    icon={FiClock}
                    readOnly
                  />
                  <InputField
                    label="Start Time"
                    name="eventTime"
                    type="time"
                    value={formData.eventTime}
                    onChange={handleChange}
                    error={errors.eventTime}
                    icon={FiClock}
                  />
                  <InputField
                    label="End Time"
                    name="eventEndTime"
                    type="time"
                    value={formData.eventEndTime}
                    onChange={handleChange}
                    error={errors.eventEndTime}
                    icon={FiClock}
                  />
                  <InputField
                    label="Setup Time"
                    name="setupTime"
                    type="time"
                    value={formData.setupTime}
                    onChange={handleChange}
                    error={errors.setupTime}
                    icon={FiClock}
                  />
                  <InputField
                    label="Clear Time"
                    name="clearTime"
                    type="time"
                    value={formData.clearTime}
                    onChange={handleChange}
                    error={errors.clearTime}
                    icon={FiClock}
                  />
                  <InputField
                    label="Venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    error={errors.venue}
                    icon={FiMapPin}
                    placeholder="Main Auditorium"
                  />
                  <SelectField
                    label="Venue Type"
                    name="venueType"
                    value={formData.venueType}
                    onChange={handleChange}
                    error={errors.venueType}
                    options={VENUE_TYPES}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div
            className="bg-white rounded-[28px] border shadow-sm overflow-hidden"
            style={{ borderColor: "#E2E8F0" }}
          >
            <button
              type="button"
              onClick={() => toggleSection("terms")}
              className="w-full px-6 md:px-8 py-5 flex items-center justify-between border-b"
              style={{ borderColor: "#F1F5F9", backgroundColor: "#FFF7ED" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "#F97316", color: "#FFFFFF" }}
                >
                  <FiShield size={22} />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
                    Approvals & Terms
                  </h2>
                  <p style={{ color: "#64748B" }}>
                    Review approvals, responsibilities, and compliance confirmations.
                  </p>
                </div>
              </div>
              {expandedSections.terms ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>

            {expandedSections.terms ? (
              <div className="p-6 md:p-8">
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  {[
                    {
                      name: "studentServicesApproval",
                      label: "Student Services approval attached",
                    },
                    {
                      name: "ircApproval",
                      label: "IRC approval attached",
                    },
                    {
                      name: "proVcApproval",
                      label: "Pro-Vice Chancellor approval attached",
                    },
                  ].map((item) => (
                    <label
                      key={item.name}
                      className="flex items-center gap-3 rounded-2xl p-4"
                      style={{ backgroundColor: "#F8FAFC" }}
                    >
                      <input
                        type="checkbox"
                        name={item.name}
                        checked={formData[item.name]}
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <span style={{ color: "#0F172A" }}>{item.label}</span>
                    </label>
                  ))}
                </div>

                <div
                  className="rounded-3xl p-5 mb-6"
                  style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}
                >
                  <p className="font-semibold mb-3" style={{ color: "#0F172A" }}>
                    Student Events - Terms and Conditions
                  </p>
                  <ul className="text-sm space-y-2" style={{ color: "#475569" }}>
                    <li>i. Clubs and societies should submit complete event details in advance.</li>
                    <li>ii. SLIIT reserves the right to stop an event if guidelines are not followed.</li>
                    <li>iii. Organizers are responsible for venue care, safety, and approved usage.</li>
                    <li>iv. Any damage caused to institute property is the responsibility of the organizers.</li>
                    <li>v. Organizers are responsible for cleaning and handover after the event.</li>
                    <li>vi. Financial sponsorships and spending must remain transparent and accountable.</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      name: "termsAccepted",
                      label:
                        "I confirm that this event request is ready for admin review and that only approved requests can be published.",
                    },
                    {
                      name: "regulationsAccepted",
                      label: "I agree to follow the general rules and regulations of SLIIT.",
                    },
                    {
                      name: "damageResponsibility",
                      label: "I accept responsibility for any damages caused to institute property.",
                    },
                    {
                      name: "cleaningResponsibility",
                      label: "I accept responsibility for venue cleaning and handover after the event.",
                    },
                    {
                      name: "financialTransparency",
                      label: "I agree to maintain financial transparency for fundraising and spending.",
                    },
                  ].map((item) => (
                    <div key={item.name}>
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          name={item.name}
                          checked={formData[item.name]}
                          onChange={handleChange}
                          className="mt-1 w-4 h-4"
                        />
                        <span className="text-sm" style={{ color: "#0F172A" }}>
                          {item.label}
                        </span>
                      </label>
                      {errors[item.name] ? (
                        <p className="text-sm mt-2 error-message" style={{ color: "#DC2626" }}>
                          {errors[item.name]}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {submitError ? (
              <div
                className="mx-6 md:mx-8 mb-6 rounded-2xl p-4 flex items-start gap-3"
                style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}
              >
                <FiAlertCircle size={18} style={{ color: "#DC2626", marginTop: 2 }} />
                <p style={{ color: "#B91C1C" }}>{submitError}</p>
              </div>
            ) : null}

            <div className="px-6 md:px-8 pb-6 md:pb-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate("/organizerteamdashboard")}
                className="px-5 py-3 rounded-2xl font-semibold border"
                style={{ borderColor: "#E2E8F0", color: "#0F172A" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-5 py-3 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-70"
                style={{ backgroundColor: "#F97316" }}
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending request...
                  </>
                ) : (
                  <>
                    Submit for Admin Approval
                    <FiSend size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldShell({ label, error, className = "", children }) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold mb-2" style={{ color: "#0F172A" }}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs mt-2 error-message" style={{ color: "#DC2626" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  icon: Icon,
  className = "",
  readOnly = false,
}) {
  return (
    <FieldShell label={label} error={error} className={className}>
      <div className="relative">
        {Icon ? (
          <Icon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#F97316" }}
          />
        ) : null}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          readOnly={readOnly}
          placeholder={placeholder}
          className="w-full rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2"
          style={{
            borderColor: error ? "#FCA5A5" : "#E2E8F0",
            backgroundColor: readOnly ? "#F8FAFC" : "#FFFFFF",
            paddingLeft: Icon ? "2.5rem" : "1rem",
          }}
        />
      </div>
    </FieldShell>
  );
}

function SelectField({ label, name, value, onChange, error, options }) {
  return (
    <FieldShell label={label} error={error}>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2"
        style={{ borderColor: error ? "#FCA5A5" : "#E2E8F0" }}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  rows,
  placeholder,
  className = "",
}) {
  return (
    <FieldShell label={label} error={error} className={className}>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2 resize-none"
        style={{ borderColor: error ? "#FCA5A5" : "#E2E8F0" }}
      />
    </FieldShell>
  );
}

export default EventRequestForm;
