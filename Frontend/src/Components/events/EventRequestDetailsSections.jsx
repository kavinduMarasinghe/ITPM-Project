import React from "react";
import {
  FiBookOpen,
  FiCalendar,
  FiCheck,
  FiClock,
  FiMapPin,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

function hasValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "boolean") {
    return true;
  }

  return value !== undefined && value !== null && String(value).trim() !== "";
}

function sanitizeList(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter((item) =>
    Object.values(item || {}).some((value) =>
      typeof value === "boolean" ? value : hasValue(value)
    )
  );
}

function formatFlag(value, positive = "Yes", negative = "No") {
  return value ? positive : negative;
}

function DetailsGrid({ items }) {
  const visibleItems = items.filter((item) => hasValue(item.value));

  if (!visibleItems.length) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {visibleItems.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="rounded-3xl p-4"
            style={{ backgroundColor: "#F8FAFC" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={15} style={{ color: "#F97316" }} />
              <p
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: "#64748B" }}
              >
                {item.label}
              </p>
            </div>
            <p className="font-semibold" style={{ color: "#0F172A" }}>
              {String(item.value)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function TextPanel({ title, value }) {
  if (!hasValue(value)) {
    return null;
  }

  return (
    <div
      className="rounded-3xl p-5"
      style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}
    >
      <h3 className="text-lg font-bold mb-2" style={{ color: "#0F172A" }}>
        {title}
      </h3>
      <p className="leading-7" style={{ color: "#475569" }}>
        {value}
      </p>
    </div>
  );
}

function MemberCards({ title, members, isStaff = false }) {
  const visibleMembers = sanitizeList(members);

  if (!visibleMembers.length) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-3" style={{ color: "#0F172A" }}>
        {title}
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {visibleMembers.map((member, index) => (
          <div
            key={`${title}-${index}`}
            className="rounded-3xl p-5"
            style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="font-bold text-lg" style={{ color: "#0F172A" }}>
                  {member.name || `Member ${index + 1}`}
                </p>
                <p style={{ color: "#64748B" }}>
                  {member.designation || member.year || "No role provided"}
                </p>
              </div>

              {isStaff && member.isAdvisor ? (
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "#DCFCE7", color: "#166534" }}
                >
                  Staff Advisor
                </span>
              ) : null}
            </div>

            <div className="space-y-2 text-sm" style={{ color: "#475569" }}>
              {!isStaff && hasValue(member.regNo) ? (
                <p>
                  <strong>Reg No:</strong> {member.regNo}
                </p>
              ) : null}
              {hasValue(member.year) ? (
                <p>
                  <strong>Year:</strong> {member.year}
                </p>
              ) : null}
              {hasValue(member.designation) ? (
                <p>
                  <strong>Designation:</strong> {member.designation}
                </p>
              ) : null}
              {hasValue(member.contact) ? (
                <p>
                  <strong>Contact:</strong> {member.contact}
                </p>
              ) : null}
            </div>

            <div className="mt-4">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: member.signature ? "#DBEAFE" : "#F1F5F9",
                  color: member.signature ? "#1D4ED8" : "#64748B",
                }}
              >
                {member.signature ? "Signature attached" : "No signature"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChecklistSection({ title, items }) {
  const visibleItems = items.filter((item) => item.label);

  if (!visibleItems.length) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-3" style={{ color: "#0F172A" }}>
        {title}
      </h3>
      <div className="grid gap-3 md:grid-cols-2">
        {visibleItems.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl p-4 flex items-center justify-between gap-3"
            style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}
          >
            <span style={{ color: "#0F172A" }}>{item.label}</span>
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
              style={{
                backgroundColor: item.value ? "#DCFCE7" : "#FEE2E2",
                color: item.value ? "#166534" : "#B91C1C",
              }}
            >
              {item.value ? <FiCheck size={12} /> : <FiX size={12} />}
              {formatFlag(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventRequestDetailsSections({ event }) {
  const request = event?.requestDetails || {};

  return (
    <div className="space-y-6">
      <DetailsGrid
        items={[
          { label: "Society Category", value: request.societyCategory, icon: FiBookOpen },
          { label: "Venue Type", value: request.venueType || event?.venueType, icon: FiMapPin },
          { label: "Duration", value: request.duration, icon: FiClock },
          { label: "Setup Time", value: request.setupTime, icon: FiClock },
          { label: "Clear Time", value: request.clearTime, icon: FiClock },
          {
            label: "Expected Participants",
            value: request.expectedParticipants || event?.expectedAttendees,
            icon: FiUsers,
          },
          { label: "Internal Audience", value: request.internalAudience, icon: FiUsers },
          { label: "External Audience", value: request.externalAudience, icon: FiUsers },
          { label: "Treasurer Name", value: request.seniorTreasurerName, icon: FiUser },
          { label: "Treasurer Approval Date", value: request.seniorTreasurerDate, icon: FiCalendar },
        ]}
      />

      <ChecklistSection
        title="Approvals"
        items={[
          { label: "SIS Funding Required", value: Boolean(request.sisFundsRequired) },
          { label: "Senior Treasurer Approval", value: Boolean(request.seniorTreasurerApproval) },
          { label: "Student Services Approval", value: Boolean(request.studentServicesApproval) },
          { label: "IRC Approval", value: Boolean(request.ircApproval) },
          { label: "Pro-Vice Chancellor Approval", value: Boolean(request.proVcApproval) },
        ]}
      />

      <MemberCards title="Organizing Students" members={request.organizingStudents} />
      <MemberCards title="Cleaning In Charge" members={request.cleaningInCharge} />
      <MemberCards title="Staff Members In Charge" members={request.staffMembers} isStaff />

      <ChecklistSection
        title="Compliance Confirmations"
        items={[
          { label: "Terms Accepted", value: Boolean(request.termsAccepted) },
          { label: "SLIIT Regulations Accepted", value: Boolean(request.regulationsAccepted) },
          { label: "Damage Responsibility Accepted", value: Boolean(request.damageResponsibility) },
          { label: "Cleaning Responsibility Accepted", value: Boolean(request.cleaningResponsibility) },
          { label: "Financial Transparency Accepted", value: Boolean(request.financialTransparency) },
        ]}
      />
    </div>
  );
}

export default EventRequestDetailsSections;
