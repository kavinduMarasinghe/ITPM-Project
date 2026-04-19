import React from "react";
import { FiFilePlus, FiLogOut } from "react-icons/fi";

function OrganizerPortalHeader({
  organizationName,
  primaryActionLabel = "Create Event Request",
  primaryActionIcon: PrimaryActionIcon = FiFilePlus,
  onPrimaryAction,
  primaryActionDisabled = false,
  onLogout,
  loggingOut = false,
}) {
  return (
    <header className="bg-white border-b sticky top-0 z-40" style={{ borderColor: "#E2E8F0" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "#F97316" }}>
            Organizer Dashboard
          </p>
          <h1 className="text-xl font-bold" style={{ color: "#0F172A" }}>
            {organizationName || "Organization"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {primaryActionLabel ? (
            <button
              type="button"
              onClick={onPrimaryAction}
              disabled={primaryActionDisabled}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-white font-semibold disabled:opacity-70"
              style={{ backgroundColor: "#F97316" }}
            >
              <PrimaryActionIcon size={16} />
              {primaryActionLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-accent/90 transition-all duration-200 hover:shadow-md disabled:opacity-70"
          >
            <FiLogOut size={16} />
            {loggingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </header>
  );
}

export default OrganizerPortalHeader;
