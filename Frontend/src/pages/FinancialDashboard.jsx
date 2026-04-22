import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import { jsPDF } from "jspdf";
import { deletePayment, listPayments } from "../api/payment.js";
import "./FinancialDashboard.css";

const statTargets = [
  { id: "totalRevenue", value: 48250, label: "Total Revenue", delta: "+18%", className: "stat-card-1", progress: 89 },
  { id: "sponsorRevenue", value: 28500, label: "Sponsorship Revenue", delta: "+24%", className: "stat-card-2", progress: 59 },
  { id: "stallRevenue", value: 19750, label: "Stall Revenue", delta: "+9%", className: "stat-card-3", progress: 41 },
  { id: "pending", value: 6400, label: "Pending Payments", delta: "7 pending", className: "stat-card-4", progress: 13 },
];

const sponsorCards = [
  { id: 1, name: "TechCorp Sdn Bhd", email: "info@techcorp.my", amount: 5000, eventKey: "techfest2024", eventLabel: "Tech Fest 2024", package: "gold", date: "Mar 2024", status: "Completed", badgeColor: "gold" },
  { id: 2, name: "CloudVision Bhd", email: "cloud@vision.my", amount: 2500, eventKey: "techfest2024", eventLabel: "Tech Fest 2024", package: "silver", date: "Mar 2024", status: "Completed", badgeColor: "silver" },
  { id: 3, name: "Nexus Media Group", email: "nexus@media.my", amount: 5000, eventKey: "culturalnight2024", eventLabel: "Cultural Night 2024", package: "gold", date: "Jun 2024", status: "Completed", badgeColor: "gold" },
  { id: 4, name: "GreenTech Ventures", email: "green@tech.my", amount: 1000, eventKey: "culturalnight2024", eventLabel: "Cultural Night 2024", package: "bronze", date: "Jun 2024", status: "Completed", badgeColor: "bronze" },
  { id: 5, name: "DataSoft Solutions", email: "datasoftmy@email.com", amount: 5000, eventKey: "sportsgala2024", eventLabel: "Sports Gala 2024", package: "gold", date: "Sep 2024", status: "Completed", badgeColor: "gold" },
  { id: 6, name: "Pinnacle Corp", email: "pinnacle@corp.my", amount: 2500, eventKey: "sportsgala2024", eventLabel: "Sports Gala 2024", package: "silver", date: "Sep 2024", status: "Completed", badgeColor: "silver" },
  { id: 7, name: "ByteForge Labs", email: "hello@byteforge.my", amount: 5000, eventKey: "hackathon2023", eventLabel: "Hackathon 2023", package: "gold", date: "Nov 2023", status: "Completed", badgeColor: "gold" },
  { id: 8, name: "SwiftPay Fintech", email: "biz@swiftpay.my", amount: 1000, eventKey: "hackathon2023", eventLabel: "Hackathon 2023", package: "bronze", date: "Nov 2023", status: "Completed", badgeColor: "bronze" },
];

const approvals = [
  { id: 1, name: "DataSoft Solutions", amount: 5000, badge: "badge-gold", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face" },
  { id: 2, name: "CloudVision Bhd", amount: 2500, badge: "badge-silver", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=40&h=40&fit=crop&crop=face" },
  { id: 3, name: "GreenTech Ventures", amount: 1000, badge: "badge-bronze", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" },
];

// Payments will be fetched from backend API
const defaultPayments = [
  { id: "#PAY-2025-001", payer: "TechCorp Sdn Bhd", type: "Sponsorship", amount: 5000, datetime: "12 Jul 2025, 10:32 AM", status: "completed", invoice: true },
  { id: "#PAY-2025-002", payer: "Vendor – Stall A-03", type: "Stall Fee", amount: 800, datetime: "11 Jul 2025, 2:15 PM", status: "completed", invoice: true },
  { id: "#PAY-2025-003", payer: "Nexus Media Group", type: "Sponsorship", amount: 2500, datetime: "10 Jul 2025, 9:00 AM", status: "pending", invoice: false },
  { id: "#PAY-2025-004", payer: "Vendor – Stall B-07", type: "Stall Fee", amount: 450, datetime: "9 Jul 2025, 4:45 PM", status: "failed", invoice: true },
  { id: "#PAY-2025-005", payer: "DataSoft Solutions", type: "Sponsorship", amount: 5000, datetime: "Awaiting approval", status: "pending", invoice: false },
];

const requestSummary = [
  { id: "total", label: "Total Sent", value: 18, color: "text-gray-900" },
  { id: "sent", label: "Sent", value: 7, color: "#60a5fa" },
  { id: "opened", label: "Opened", value: 5, color: "#a78bfa" },
  { id: "accepted", label: "Accepted", value: 4, color: "#4ade80" },
  { id: "declined", label: "Declined", value: 2, color: "#f87171" },
];

const prospectPool = [
  { id: 1, name: "Celcom Axiata", sector: "Telecom", email: "celcom@axiata.com", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=32&h=32&fit=crop&crop=face" },
  { id: 2, name: "CIMB Foundation", sector: "Banking", email: "hello@cimbfoundation.com", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" },
  { id: 3, name: "Shopee Malaysia", sector: "E-Commerce", email: "biz@shopee.my", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" },
  { id: 4, name: "TM Berhad", sector: "Telecom", email: "partner@tm.com", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face" },
];

const templateOptions = [
  { id: "gold", title: "Gold Package Invite", description: "Premium sponsorship pitch for top-tier companies", accent: "#d97706", iconBg: "#fef3c7" },
  { id: "silver", title: "Silver Package Invite", description: "Mid-tier sponsorship for growing companies", accent: "#6b7280", iconBg: "#f3f4f6" },
  { id: "bronze", title: "Bronze Package Invite", description: "Entry-level sponsorship for SMEs & startups", accent: "#d97706", iconBg: "#fed7aa" },
  { id: "general", title: "General Inquiry", description: "Open-ended sponsorship exploration email", accent: "#7c3aed", iconBg: "#ede9fe" },
];

const timelineActivity = [
  { id: 1, title: "Axiata accepted request", time: "12 Jul 2025 · 3:42 PM", color: "#4ade80" },
  { id: 2, title: "Petronas opened email", time: "11 Jul 2025 · 10:15 AM", color: "#a78bfa" },
  { id: 3, title: "Request sent to Maxis", time: "8 Jul 2025 · 9:00 AM", color: "#60a5fa" },
  { id: 4, title: "Maybank declined", time: "4 Jul 2025 · 2:30 PM", color: "#f87171" },
];

const templateBodies = {
  gold: (company) => `Dear ${company} Team,\n\nWe are pleased to invite you to be a Gold Sponsor for EVENTAURA Tech Fest 2025, a premier university technology event hosted at Universiti Teknologi Malaysia.\n\nAs a Gold Sponsor, your organisation will receive:\n• Main stage banner placement\n• Logo on all event materials & social media\n• VIP booth in the Premium Zone\n• MC mention during the event\n\nThe event is scheduled for 15–16 August 2025. We believe this is a great opportunity to connect with over 2,000 students and industry professionals.\n\nWe would be honoured to have ${company} as our valued partner.\n\nWarm regards,\nMalith Induwara\nFinance Organizer – EVENTAURA`,
  silver: (company) => `Dear ${company} Team,\n\nWe are excited to invite you to join EVENTAURA Tech Fest 2025 as a Silver Sponsor. This tier is designed for impactful visibility at a mid-tier investment.\n\nSilver Sponsorship perks:\n• Side banner placement on main concourse\n• Logo on the official event poster\n• Standard booth in the exhibition area\n• Two social media shoutouts\n\nThe festival runs 15–16 August 2025 with over 2,000 attendees expected.\n\nWarm regards,\nMalith Induwara\nFinance Organizer – EVENTAURA`,
  bronze: (company) => `Dear ${company} Team,\n\nWe would love to have you join EVENTAURA Tech Fest 2025 as a Bronze Sponsor, perfect for brand exposure on a starter budget.\n\nBronze Sponsorship perks:\n• Logo on the event website\n• Basic booth placement\n• One social media mention\n\nWe appreciate your consideration and hope to partner with you.\n\nWarm regards,\nMalith Induwara\nFinance Organizer – EVENTAURA`,
  general: (company) => `Hi ${company} Team,\n\nI’m reaching out from EVENTAURA Tech Fest 2025 to explore a potential sponsorship partnership. We host 2,000+ students and industry professionals and would love to discuss how we can feature your brand.\n\nAre you available for a quick call this week to explore options?\n\nThanks,\nMalith Induwara\nFinance Organizer – EVENTAURA`,
};

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counters, setCounters] = useState(statTargets.map(() => 0));
  const [eventFilter, setEventFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentsFilter, setPaymentsFilter] = useState("all");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [viewingEmailRequest, setViewingEmailRequest] = useState(null);
  const [composeStep, setComposeStep] = useState(2);
  const [selectedProspect, setSelectedProspect] = useState(prospectPool[0]);
  const [selectedTemplate, setSelectedTemplate] = useState("gold");
  const [companyNameError, setCompanyNameError] = useState("");
  const [composeForm, setComposeForm] = useState({
    to: prospectPool[0].name,
    email: prospectPool[0].email,
    event: "Tech Fest 2025",
    package: "Gold – LKR 200,000",
    subject: "Sponsorship Invitation – EVENTAURA Tech Fest 2025",
    body: templateBodies.gold(prospectPool[0].name),
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showPriceUpdateToast, setShowPriceUpdateToast] = useState(false);
  const [showEditPackageModal, setShowEditPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [sponsorRequests, setSponsorRequests] = useState([]);
  const [sponsorEmails, setSponsorEmails] = useState(() => {
    const saved = localStorage.getItem("sponsorEmails");
    return saved ? JSON.parse(saved) : [];
  });
  const [newSponsorEmail, setNewSponsorEmail] = useState("");
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem("deletedApplications");
    return saved ? JSON.parse(saved) : [];
  });
  const [payments, setPayments] = useState([]);

  // Fetch sponsor applications from MongoDB
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5001/api/sponsorship-applications", {
          headers: {
            "x-dev-role": "organizer",
          },
        });
        
        if (response.ok) {
          const apps = await response.json();
          
          // Format applications for display
          const formattedApps = apps.map((app) => ({
            id: app._id,
            name: app.companyName,
            email: app.email,
            event: app.eventName,
            package: app.packageName,
            amount: { Gold: 200000, Silver: 100000, Bronze: 50000 }[app.packageName] || 0,
            applied: app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString(),
            status: app.status
          }));
          
          setApplications(formattedApps);
        }
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      }
    };

    fetchApplications();
  }, []);

  // Fetch payments from MongoDB
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        console.log("🔄 Fetching payments from API...");
        const paymentList = await listPayments();
        console.log("✅ Payments fetched successfully:", paymentList);
        
        if (!paymentList || paymentList.length === 0) {
          console.warn("⚠️ No payments returned from API, using default payments");
          setPayments(defaultPayments);
          return;
        }
        
        // Format payments for display
        const formattedPayments = paymentList.map((payment) => ({
          _id: payment._id,
          id: payment.transactionRef || payment._id,
          payer: payment.payerName,
          type: payment.purpose === "SPONSORSHIP" ? "Sponsorship" : "Stall Fee",
          amount: payment.amount,
          datetime: payment.paidAt ? new Date(payment.paidAt).toLocaleString() : payment.createdAt ? new Date(payment.createdAt).toLocaleString() : "N/A",
          status: payment.status.toLowerCase(),
          invoice: payment.invoiceNo ? true : false,
          invoiceNo: payment.invoiceNo,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
          purpose: payment.purpose,
          eventName: payment.eventId?.name || payment.eventId?.title || "Tech Fest 2025",
          paymentDetails: payment.paymentDetails || {},
        }));
        
        console.log("📋 Formatted payments for display:", formattedPayments);
        setPayments(formattedPayments);
      } catch (error) {
        console.error("❌ Failed to fetch payments:", error);
        console.log("📍 Falling back to default payments");
        // Fallback to default payments if fetch fails
        setPayments(defaultPayments);
      }
    };

    fetchPayments();
  }, []);
  
  
  // Initialize packagePrices from localStorage or use defaults
  const [packagePrices, setPackagePrices] = useState(() => {
    const saved = localStorage.getItem("packagePrices");
    return saved ? JSON.parse(saved) : {
      Gold: 200000,
      Silver: 100000,
      Bronze: 50000,
    };
  });

  // Hardcoded packages for editing (can be replaced with API fetch)
  const hardcodedPackages = [
    { _id: "gold-pkg", name: "Gold", price: packagePrices.Gold },
    { _id: "silver-pkg", name: "Silver", price: packagePrices.Silver },
    { _id: "bronze-pkg", name: "Bronze", price: packagePrices.Bronze },
  ];

  const revenueChartRef = useRef(null);
  const donutChartRef = useRef(null);
  const packageChartRef = useRef(null);
  const revenueChartInstanceRef = useRef(null);
  const donutChartInstanceRef = useRef(null);
  const packageChartInstanceRef = useRef(null);
  const particlesRef = useRef(null);

  const liveRequestSummary = useMemo(() => {
    const total = sponsorRequests.length;
    const accepted = sponsorRequests.filter((request) => request.status === "accepted").length;
    const declined = sponsorRequests.filter((request) => request.status === "rejected").length;
    const pending = sponsorRequests.filter((request) => request.status === "pending").length;

    return [
      { id: "total", label: "Total Sent", value: total, color: "text-gray-900" },
      { id: "sent", label: "Sent", value: pending, color: "#60a5fa" },
      { id: "opened", label: "Opened", value: 0, color: "#a78bfa" },
      { id: "accepted", label: "Accepted", value: accepted, color: "#4ade80" },
      { id: "declined", label: "Declined", value: declined, color: "#f87171" },
    ];
  }, [sponsorRequests]);

  const displayedSponsorRequests = useMemo(() => {
    console.log("displayedSponsorRequests memo triggered, sponsorRequests.length:", sponsorRequests.length);
    if (sponsorRequests.length === 0) return [];

    const unique = new Map();

    sponsorRequests.forEach((request) => {
      const key = [
        String(request.companyName || "").trim().toLowerCase(),
        String(request.email || "").trim().toLowerCase(),
        String(request.eventName || "").trim().toLowerCase(),
        String(request.packageName || "").trim().toLowerCase(),
        String(request.subject || "").trim().toLowerCase(),
        String(request.message || "").trim().toLowerCase(),
      ].join("|");

      if (!unique.has(key)) {
        unique.set(key, request);
      }
    });

    const result = Array.from(unique.values()).map((request) => ({
      id: request._id,
      company: request.companyName,
      email: request.email,
      industry: request.eventName,
      status: request.status === "pending" ? "sent" : request.status,
      sent: request.sentAt ? new Date(request.sentAt).toLocaleDateString() : "Just now",
      event: request.eventName,
      statusNote:
        request.status === "accepted"
          ? `Accepted on ${request.respondedAt ? new Date(request.respondedAt).toLocaleDateString() : "recently"}`
          : request.status === "rejected"
            ? `Declined on ${request.respondedAt ? new Date(request.respondedAt).toLocaleDateString() : "recently"}`
            : "Pending response",
      response: request.status,
    }));
    
    console.log("displayedSponsorRequests result:", result);
    return result;
  }, [sponsorRequests, packagePrices]);

  const visibleSponsorRequests = displayedSponsorRequests;

  const visibleRequestSummary = useMemo(() => {
    const total = visibleSponsorRequests.length;
    const accepted = visibleSponsorRequests.filter((request) => request.status === "accepted").length;
    const declined = visibleSponsorRequests.filter((request) => request.status === "rejected").length;
    const sent = visibleSponsorRequests.filter((request) => request.status === "sent").length;

    return [
      { id: "total", label: "Total Sent", value: total, color: "text-gray-900" },
      { id: "sent", label: "Sent", value: sent, color: "#60a5fa" },
      { id: "opened", label: "Opened", value: 0, color: "#a78bfa" },
      { id: "accepted", label: "Accepted", value: accepted, color: "#4ade80" },
      { id: "declined", label: "Declined", value: declined, color: "#f87171" },
    ];
  }, [visibleSponsorRequests]);

  // Handle opening edit package modal
  const handleEditPackage = (pkgName, pkgPrice) => {
    const pkg = hardcodedPackages.find(p => p.name === pkgName);
    if (!pkg) {
      alert("Package not found");
      return;
    }
    setEditingPackage(pkg);
    setEditPrice(packagePrices[pkgName].toString());
    setShowEditPackageModal(true);
  };

  // Handle saving updated package price to MongoDB
  const handleSavePackagePrice = async () => {
    if (!editPrice || parseFloat(editPrice) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    try {
      // Try to update in MongoDB using package name to find the package
      const response = await fetch(`http://localhost:5001/api/sponsor-packages/by-name/${editingPackage.name}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: parseFloat(editPrice) }),
      });

      if (response.ok) {
        // MongoDB updated successfully
        const updatedPkg = await response.json();
        console.log("Package updated in MongoDB:", updatedPkg);
      } else if (response.status === 404) {
        // Package not found in MongoDB, just update locally
        console.log("Package not found in MongoDB, updating locally only");
      } else {
        const error = await response.json();
        console.warn("Warning updating MongoDB:", error.message);
      }

      // Update local state with new price
      setPackagePrices(prev => ({
        ...prev,
        [editingPackage.name]: parseFloat(editPrice)
      }));

      // Show success message
      setShowPriceUpdateToast(true);
      setShowEditPackageModal(false);
      setTimeout(() => setShowPriceUpdateToast(false), 3000);
    } catch (error) {
      console.error("Error updating package:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Handle downloading invoice
  const handleDownloadInvoice = async (payment) => {
    if (!payment || payment.status !== "completed") {
      alert("Invoice is not available until payment is completed");
      return;
    }

    try {
      const invoiceData = {
        number: payment.invoiceNo || payment.id || payment.transactionRef,
        date: payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : new Date(payment.createdAt).toLocaleDateString(),
        amount: `LKR ${Number(payment.amount || 0).toLocaleString()}`,
        company: payment.payer,
        type: payment.paymentDetails?.description || payment.type
      };

      // Try to fetch from backend first
      let paymentId = null;
      try {
        const response = await fetch(`http://localhost:5001/api/invoices?invoiceNo=${invoiceData.number}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data._id) {
            paymentId = data._id;
          }
        }
      } catch (e) {
        console.log("Backend fetch failed, using local PDF generation");
      }

      // If payment ID found, try backend PDF first
      if (paymentId) {
        try {
          const response = await fetch(`http://localhost:5001/api/invoices/${paymentId}/pdf`);
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${invoiceData.number}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            return;
          }
        } catch (e) {
          console.log("Backend PDF generation failed, using client-side PDF");
        }
      }

      // Generate PDF client-side using jsPDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      doc.setFontSize(24);
      doc.setTextColor(139, 92, 246);
      doc.text("INVOICE", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      // Company info
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("EVENTAURA", 20, yPosition);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("University Event Management System", 20, yPosition + 5);
      doc.text("Event Sponsorship & Payment Management", 20, yPosition + 10);
      
      yPosition += 25;

      // Invoice details
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Invoice Number: ${invoiceData.number}`, 20, yPosition);
      doc.text(`Date: ${invoiceData.date}`, 120, yPosition);
      yPosition += 8;
      doc.text(`Status: PAID`, 20, yPosition);
      doc.text(`Event: ${payment.eventName || "Tech Fest 2025"}`, 120, yPosition);
      
      yPosition += 15;

      // Bill To section
      doc.setFontSize(11);
      doc.setTextColor(139, 92, 246);
      doc.text("BILL TO:", 20, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(invoiceData.company, 20, yPosition);
      yPosition += 6;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("sponsorship@techcorp.com", 20, yPosition);
      
      yPosition += 20;

      // Items table header
      doc.setFillColor(139, 92, 246);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.rect(20, yPosition - 5, pageWidth - 40, 7, "F");
      doc.text("Description", 25, yPosition + 1);
      doc.text("Qty", 120, yPosition + 1);
      doc.text("Unit Price", 140, yPosition + 1);
      doc.text("Amount", 170, yPosition + 1);
      
      yPosition += 12;

      // Items
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.text(invoiceData.type, 25, yPosition);
      doc.text("1", 120, yPosition);
      doc.text(invoiceData.amount, 140, yPosition);
      doc.text(invoiceData.amount, 170, yPosition);
      
      yPosition += 15;

      // Total
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;
      
      doc.setFontSize(11);
      doc.setTextColor(139, 92, 246);
      doc.text("TOTAL:", 140, yPosition);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(invoiceData.amount, 170, yPosition);
      
      yPosition += 20;

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for your business! This invoice is valid for sponsorship commitment.", pageWidth / 2, pageHeight - 20, { align: "center" });
      doc.text("EVENTAURA - University Event Management System", pageWidth / 2, pageHeight - 15, { align: "center" });

      // Save the PDF
      doc.save(`${invoiceData.number}.pdf`);
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice: " + error.message);
    }
  };

  // Add sponsor email
  const handleAddSponsorEmail = () => {
    if (!newSponsorEmail || !newSponsorEmail.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    if (sponsorEmails.includes(newSponsorEmail)) {
      alert("This email already exists");
      return;
    }

    const updated = [...sponsorEmails, newSponsorEmail];
    setSponsorEmails(updated);
    setNewSponsorEmail("");
    localStorage.setItem("sponsorEmails", JSON.stringify(updated));
  };

  // Remove sponsor email
  const handleRemoveSponsorEmail = (email) => {
    const updated = sponsorEmails.filter(e => e !== email);
    setSponsorEmails(updated);
    localStorage.setItem("sponsorEmails", JSON.stringify(updated));
  };

  const handleDeleteSponsorRequest = async (requestId) => {
    if (confirm("Are you sure you want to delete this sponsor request?")) {
      try {
        // Delete from backend
        const response = await fetch(`http://127.0.0.1:5001/api/sponsor-requests/${requestId}`, {
          method: "DELETE",
          headers: {
            "x-dev-role": "organizer",
          },
        });

        if (response.ok) {
          // Remove from frontend state only if backend deletion was successful
          setSponsorRequests((prev) => prev.filter((req) => req._id !== requestId));
        } else {
          alert("Failed to delete sponsor request");
        }
      } catch (error) {
        console.error("Error deleting sponsor request:", error);
        alert("Error deleting sponsor request");
      }
    }
  };

  const handleDeleteApplication = (appId) => {
    if (confirm("Are you sure you want to delete this application?")) {
      // Update state
      setApplications(applications.filter(app => app.id !== appId));

      // Delete from backend MongoDB
      fetch(`http://127.0.0.1:5001/api/sponsorship-applications/${appId}`, {
        method: "DELETE",
        headers: {
          "x-dev-role": "organizer",
        },
      }).catch(err => console.error("Failed to delete from backend:", err));
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (confirm("Are you sure you want to delete this payment record?")) {
      try {
        console.log("Deleting payment with ID:", paymentId);
        // Call backend API to delete payment
        await deletePayment(paymentId);
        
        console.log("Payment deleted successfully, removing from state");
        // Remove from frontend state after successful deletion
        setPayments((prev) => prev.filter((p) => p._id !== paymentId && p.id !== paymentId));
        alert("Payment deleted successfully");
      } catch (error) {
        console.error("Error deleting payment:", error);
        alert("Failed to delete payment: " + error.message);
      }
    }
  };

  useEffect(() => {
    // Fetch sponsor requests from backend
    const fetchSponsorRequests = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5001/api/sponsor-requests", {
          headers: {
            "x-dev-role": "organizer",
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched sponsor requests:", data);
          setSponsorRequests(data);
        } else {
          console.error("Failed to fetch sponsor requests. Status:", response.status);
          const errorData = await response.json();
          console.error("Error details:", errorData);
        }
      } catch (error) {
        console.error("Failed to fetch sponsor requests:", error);
      }
    };

    fetchSponsorRequests();
  }, []);

  // Save packagePrices to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("packagePrices", JSON.stringify(packagePrices));
  }, [packagePrices]);

  // Animate counters on mount
  useEffect(() => {
    const timers = statTargets.map((target, idx) => {
      const step = target.value / 60;
      let current = 0;
      let id = null;
      id = setInterval(() => {
        current = Math.min(current + step, target.value);
        setCounters((prev) => {
          const next = [...prev];
          next[idx] = Math.floor(current);
          return next;
        });
        if (current >= target.value && id) {
          clearInterval(id);
        }
      }, 16);
      return id;
    });
    return () => timers.forEach((t) => clearInterval(t));
  }, []);

  // Particles
  useEffect(() => {
    if (!particlesRef.current) return;
    const colors = [
      "#7c3aed",
      "#db2777",
      "#d97706",
      "#3b82f6",
      "#10b981",
    ];
    const nodes = [];
    for (let i = 0; i < 18; i += 1) {
      const size = Math.random() * 5 + 2;
      const div = document.createElement("div");
      div.className = "particle";
      div.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;background:${colors[Math.floor(Math.random() * colors.length)]};animation-duration:${Math.random() * 15 + 10}s;animation-delay:${Math.random() * 10}s;`;
      particlesRef.current.appendChild(div);
      nodes.push(div);
    }
    return () => nodes.forEach((n) => n.remove());
  }, []);

  const applyChartDefaults = () => {
    Chart.defaults.color = "#9ca3af";
    Chart.defaults.borderColor = "#e5e7eb";
  };

  const destroyChartForCanvas = (canvas) => {
    if (!canvas) return;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
  };

  // Charts (dashboard)
  useEffect(() => {
    if (revenueChartInstanceRef.current) {
      revenueChartInstanceRef.current.destroy();
      revenueChartInstanceRef.current = null;
    }
    if (donutChartInstanceRef.current) {
      donutChartInstanceRef.current.destroy();
      donutChartInstanceRef.current = null;
    }

    // Only render these charts when the dashboard section is active.
    if (activeSection !== "dashboard") return undefined;

    let cancelled = false;
    let rafId;

    const init = () => {
      if (cancelled) return;

      const revenueCanvas = revenueChartRef.current;
      const donutCanvas = donutChartRef.current;

      // Canvas refs can be null on the first effect tick depending on render timing.
      if (!revenueCanvas || !donutCanvas) {
        rafId = requestAnimationFrame(init);
        return;
      }

      // Avoid Chart.js "canvas is already in use" errors.
      destroyChartForCanvas(revenueCanvas);
      destroyChartForCanvas(donutCanvas);

      applyChartDefaults();

      const revenueCtx = revenueCanvas.getContext("2d");
      const donutCtx = donutCanvas.getContext("2d");
      if (!revenueCtx || !donutCtx) return;

      const revenueChart = new Chart(revenueCtx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
          {
            label: "Sponsorship",
            data: [0, 0, 2000, 3500, 5000, 8000, 10000, 0, 0, 0, 0, 0],
            borderColor: "#8b5cf6",
            backgroundColor: "#ede9fe",
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#8b5cf6",
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2.5,
          },
          {
            label: "Stall Revenue",
            data: [0, 0, 1500, 2000, 3500, 5000, 7750, 0, 0, 0, 0, 0],
            borderColor: "#f59e0b",
            backgroundColor: "#fef3c7",
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#f59e0b",
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "top",
            labels: { font: { size: 11, weight: "600" }, boxWidth: 10, padding: 16, color: "#6b7280" },
          },
          tooltip: {
            backgroundColor: "rgba(15,12,41,0.95)",
            borderColor: "rgba(139,92,246,0.4)",
            borderWidth: 1,
            padding: 12,
            titleColor: "#fff",
            bodyColor: "#1f2937",
            callbacks: { label: (ctx) => ` LKR ${ctx.parsed.y.toLocaleString()}` },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#e5e7eb" },
            ticks: { font: { size: 10 }, callback: (v) => `LKR ${v.toLocaleString()}`, color: "#9ca3af" },
          },
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#9ca3af" } },
        },
      },
    });

      const donutChart = new Chart(donutCtx, {
      type: "doughnut",
      data: {
        labels: ["Sponsorship", "Stall Fees"],
        datasets: [{ data: [59, 41], backgroundColor: ["#7c3aed", "#d97706"], borderWidth: 0, hoverOffset: 8 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "74%",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(15,12,41,0.95)",
            borderColor: "rgba(139,92,246,0.4)",
            borderWidth: 1,
            padding: 10,
            titleColor: "#fff",
            bodyColor: "#1f2937",
          },
        },
      },
    });

      revenueChartInstanceRef.current = revenueChart;
      donutChartInstanceRef.current = donutChart;
    };

    init();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);

      if (revenueChartInstanceRef.current) {
        revenueChartInstanceRef.current.destroy();
        revenueChartInstanceRef.current = null;
      }
      if (donutChartInstanceRef.current) {
        donutChartInstanceRef.current.destroy();
        donutChartInstanceRef.current = null;
      }
    };
  }, [activeSection]);

  // Charts (reports)
  useEffect(() => {
    if (packageChartInstanceRef.current) {
      packageChartInstanceRef.current.destroy();
      packageChartInstanceRef.current = null;
    }

    // Only render this chart when the reports section is active.
    if (activeSection !== "reports") return undefined;

    let cancelled = false;
    let rafId;

    const init = () => {
      if (cancelled) return;
      const canvas = packageChartRef.current;

      if (!canvas) {
        rafId = requestAnimationFrame(init);
        return;
      }

      destroyChartForCanvas(canvas);

      applyChartDefaults();
      const packageCtx = canvas.getContext("2d");
      if (!packageCtx) return;

      const packageChart = new Chart(packageCtx, {
      type: "bar",
      data: {
        labels: ["Gold", "Silver", "Bronze"],
        datasets: [
          {
            label: "Revenue (LKR)",
            data: [10000, 7500, 6000],
            backgroundColor: ["#d97706", "#6b7280", "#b45309"],
            borderRadius: 10,
            borderSkipped: false,
            hoverBackgroundColor: ["rgba(245,158,11,1)", "rgba(107,114,128,1)", "rgba(180,83,9,1)"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(15,12,41,0.95)",
            borderColor: "rgba(139,92,246,0.4)",
            borderWidth: 1,
            padding: 12,
            titleColor: "#fff",
            bodyColor: "#1f2937",
            callbacks: { label: (ctx) => ` LKR ${ctx.parsed.y.toLocaleString()}` },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#e5e7eb" },
            ticks: { font: { size: 10 }, callback: (v) => `LKR ${v.toLocaleString()}`, color: "#9ca3af" },
          },
          x: { grid: { display: false }, ticks: { font: { size: 13, weight: "700" }, color: "#1f2937" } },
        },
      },
    });

      packageChartInstanceRef.current = packageChart;
    };

    init();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (packageChartInstanceRef.current) {
        packageChartInstanceRef.current.destroy();
        packageChartInstanceRef.current = null;
      }
    };
  }, [activeSection]);

  const filteredSponsors = useMemo(() => {
    return sponsorCards.filter((card) => {
      const matchEvent = eventFilter === "all" || card.eventKey === eventFilter;
      const matchPkg = packageFilter === "all" || card.package === packageFilter;
      const matchSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchEvent && matchPkg && matchSearch;
    });
  }, [eventFilter, packageFilter, searchTerm]);

  const filteredPayments = useMemo(() => {
    console.log("Computing filteredPayments, payments:", payments, "filter:", paymentsFilter);
    if (paymentsFilter === "all") return payments;
    return payments.filter((p) => p.status === paymentsFilter);
  }, [paymentsFilter, payments]);

  const invoiceCards = useMemo(() => {
    return payments
      .filter((payment) => payment.purpose === "SPONSORSHIP")
      .map((payment) => {
        const invoiceNo = payment.invoiceNo || payment.id;
        const issuedDate = payment.paidAt || payment.createdAt;
        const description = payment.paymentDetails?.description || payment.type;

        return {
          payment,
          invoiceNo,
          issuedLabel: payment.status === "completed"
            ? `Issued: ${new Date(issuedDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
            : "Pending issuance",
          statusLabel: payment.status === "completed" ? "PAID" : payment.status === "pending" ? "PENDING" : payment.status.toUpperCase(),
          description: description.replace(/\s*-\s*LKR.*$/, ""),
          isPaid: payment.status === "completed",
        };
      });
  }, [payments]);

  const updateBodyForTemplate = (templateId, companyName) => {
    setSelectedTemplate(templateId);
    setComposeForm((prev) => ({
      ...prev,
      body: templateBodies[templateId](companyName || selectedProspect.name),
    }));
  };

  const handleProspectSelect = (prospect) => {
    setSelectedProspect(prospect);
    setComposeForm((prev) => ({
      ...prev,
      to: prospect.name,
      email: prospect.email,
      body: templateBodies[selectedTemplate](prospect.name),
    }));
    setComposeStep(2);
    setShowRequestModal(true);
  };

  const openComposeModal = (prospect) => {
    if (prospect) {
      handleProspectSelect(prospect);
      return;
    }
    setShowRequestModal(true);
    setComposeStep(2);
  };

  const closeComposeModal = () => setShowRequestModal(false);

  const goStep = (step) => {
    setComposeStep(step);
  };

  const handleSendRequest = async () => {
    if (isSendingRequest) return;

    if (!composeForm.to || !composeForm.email || !composeForm.event || !composeForm.subject || !composeForm.body) {
      const missing = [];
      if (!composeForm.to) missing.push("Company Name (to)");
      if (!composeForm.email) missing.push("Email");
      if (!composeForm.event) missing.push("Event");
      if (!composeForm.subject) missing.push("Subject");
      if (!composeForm.body) missing.push("Body");
      
      console.error("Missing fields:", missing);
      console.error("Current composeForm:", composeForm);
      alert("Please fill all fields before sending. Missing: " + missing.join(", "));
      return;
    }

    try {
      setIsSendingRequest(true);

      const requestData = {
        companyName: composeForm.to,
        email: composeForm.email,
        eventName: composeForm.event,
        packageName: composeForm.package ? composeForm.package.split(" ")[0] : "Gold",
        subject: composeForm.subject,
        message: composeForm.body,
      };

      console.log("Sending sponsor request with data:", requestData);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch("http://127.0.0.1:5001/api/sponsor-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dev-role": "organizer",
        },
        signal: controller.signal,
        body: JSON.stringify(requestData),
      });
      clearTimeout(timeoutId);

      const result = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", result);
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to send request");
      }

      if (result?.request) {
        setSponsorRequests((prev) => {
          const next = [result.request, ...prev];
          const seen = new Set();
          return next.filter((request) => {
            if (seen.has(request._id)) return false;
            seen.add(request._id);
            return true;
          });
        });
      }

      // Refetch sponsor requests from backend to ensure data is persisted
      try {
        const fetchResponse = await fetch("http://127.0.0.1:5001/api/sponsor-requests", {
          headers: {
            "x-dev-role": "organizer",
          },
        });
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setSponsorRequests(data);
        }
      } catch (err) {
        console.error("Failed to refetch sponsor requests:", err);
      }

      // Also refetch applications to ensure they show up
      try {
        const appResponse = await fetch("http://127.0.0.1:5001/api/sponsorship-applications", {
          headers: {
            "x-dev-role": "organizer",
          },
        });
        if (appResponse.ok) {
          const appData = await appResponse.json();
          console.log("Refetched applications:", appData);
          setApplications(appData);
        }
      } catch (err) {
        console.error("Failed to refetch applications:", err);
      }

      closeComposeModal();
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error stack:", error.stack);
      if (error.name === "AbortError") {
        alert("Request timed out. Backend may not be running on port 5001.");
      } else {
        alert(`Failed to send request: ${error.message}`);
      }
    } finally {
      setIsSendingRequest(false);
    }
  };

  const statusMeta = (status) => {
    switch (status) {
      case "accepted":
        return { badge: "status-accepted", footerColor: "#16a34a", pillBg: "#dcfce7", pillText: "#16a34a" };
      case "pending":
        return { badge: "status-sent", footerColor: "#1d4ed8", pillBg: "#dbeafe", pillText: "#1d4ed8" };
      case "opened":
        return { badge: "status-opened", footerColor: "#7c3aed", pillBg: "#ede9fe", pillText: "#7c3aed" };
      case "sent":
        return { badge: "status-sent", footerColor: "#1d4ed8", pillBg: "#dbeafe", pillText: "#1d4ed8" };
      case "declined":
        return { badge: "status-declined", footerColor: "#dc2626", pillBg: "#fee2e2", pillText: "#dc2626" };
      default:
        return { badge: "status-sent", footerColor: "#6b7280", pillBg: "#f3f4f6", pillText: "#6b7280" };
    }
  };

  const navItem = (key, label) => (
    <a
      key={key}
      href="#"
      className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-large text-sm font-medium relative ${activeSection === key ? "active" : ""}`}
      onClick={(e) => {
        e.preventDefault();
        setActiveSection(key);
        setSidebarOpen(false);
      }}
    >
      {label.icon}
      <span className="relative z-10">{label.text}</span>
      {label.badge ? (
        <span className="ml-auto relative z-10 text-xs font-bold px-2 py-0.5 rounded-small" style={{ background: "#ede9fe", color: "#7c3aed" }}>
          {label.badge}
        </span>
      ) : null}
    </a>
  );

  const navItems = [
    {
      key: "dashboard",
      text: "Dashboard",
      icon: (
        <svg className="nav-icon w-4 h-4 flex-shrink-0 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      key: "packages",
      text: "Packages",
      icon: (
        <svg className="nav-icon w-4 h-4 flex-shrink-0 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      key: "requestsponsors",
      text: "Request Sponsors",
      badge: "New",
      icon: (
        <svg className="nav-icon w-4 h-4 flex-shrink-0 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: "applications",
      text: "Applications",
      badge: "5",
      icon: (
        <svg className="nav-icon w-4 h-4 flex-shrink-0 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      key: "payments",
      text: "Payments",
      icon: (
        <svg className="nav-icon w-4 h-4 flex-shrink-0 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      key: "invoices",
      text: "Invoices",
      icon: (
        <svg className="nav-icon w-4 h-4 flex-shrink-0 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
      ),
    },
    {
      key: "reports",
      text: "Revenue Reports",
      icon: (
        <svg className="nav-icon w-4 h-4 flex-shrink-0 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  const paymentsSummary = {
    completed: payments.filter((p) => p.status === "completed").length,
    pending: payments.filter((p) => p.status === "pending").length,
    failed: payments.filter((p) => p.status === "failed").length,
    completedTotal: 41850,
    pendingTotal: 6400,
    failedTotal: 1250,
  };

  return (
    <div className="finance font-body" style={{ minHeight: "100vh" }}>
      <div id="particles" ref={particlesRef} />
      <div
        id="mobileOverlay"
        className={`mobile-overlay fixed inset-0 bg-black bg-opacity-60 z-40 ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-large"
            style={{
              background: "linear-gradient(135deg,#dcfce7,#d1fae5)",
              border: "1px solid #86efac",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="w-8 h-8 rounded-large flex items-center justify-center flex-shrink-0" style={{ background: "#dcfce7" }}>
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Request Sent!</p>
              <p className="text-xs" style={{ color: "#9ca3af" }}>
                Sponsorship invitation delivered to {composeForm.to}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View Email Modal */}
      {viewingEmailRequest && (
        <div className="modal-overlay open" onClick={() => setViewingEmailRequest(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "30px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
            }}>
              {/* Email Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #e5e7eb" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  color: "white"
                }}>
                  ✉️
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: "700", color: "#1f2937" }}>
                    {viewingEmailRequest.subject}
                  </h3>
                  <p style={{ margin: "0", fontSize: "13px", color: "#9ca3af" }}>
                    To: {viewingEmailRequest.to} · {viewingEmailRequest.package}
                  </p>
                </div>
              </div>

              {/* Email Body */}
              <div style={{ marginBottom: "30px" }}>
                <div style={{
                  padding: "20px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#1f2937",
                  lineHeight: "1.8",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  maxHeight: "400px",
                  overflowY: "auto"
                }}>
                  {viewingEmailRequest.body}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                paddingTop: "20px",
                borderTop: "1px solid #e5e7eb"
              }}>
                <button
                  onClick={() => setViewingEmailRequest(null)}
                  style={{
                    padding: "10px 24px",
                    background: "#ffffff",
                    color: "#1f2937",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.3s"
                  }}
                  onMouseOver={(e) => e.target.style.background = "#f3f4f6"}
                  onMouseOut={(e) => e.target.style.background = "#ffffff"}
                >
                  ← Back
                </button>
                <button
                  style={{
                    padding: "10px 24px",
                    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  ⚡ Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRequestModal && (
        <div
          className="modal-overlay open"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeComposeModal();
          }}
        >
          <div className="modal-box p-0" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid #e5e7eb" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-large flex items-center justify-center" style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}>
                  <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-gray-900 text-base">Send Sponsorship Request</h3>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>
                    Invite a company to sponsor your event
                  </p>
                </div>
              </div>
              <button
                onClick={closeComposeModal}
                className="w-8 h-8 rounded-large flex items-center justify-center transition-all"
                style={{ background: "#e5e7eb" }}
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 flex items-center" style={{ borderBottom: "1px solid #e5e7eb" }}>
              {[1, 2, 3].map((step) => {
                const isDone = step < composeStep;
                const isActive = step === composeStep;
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div
                      className={`step-indicator ${isDone ? "step-done" : isActive ? "step-active" : "step-inactive"}`}
                    >
                      {isDone ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step
                      )}
                    </div>
                    {step < 3 && <div className={`step-connector ${step < composeStep ? "done" : ""}`} />}
                  </div>
                );
              })}
              <div className="ml-4 flex-1">
                <p className="text-xs font-bold text-gray-900" id="stepTitle">
                  {composeStep === 1 && "Select Company"}
                  {composeStep === 2 && "Compose Message"}
                  {composeStep === 3 && "Preview & Send"}
                </p>
                <p className="text-xs" style={{ color: "#a1a5b8" }} id="stepSub">
                  Step {composeStep} of 3
                </p>
              </div>
            </div>

            {composeStep === 1 && (
              <div className="p-6">
                <p className="text-sm font-semibold text-gray-900 mb-4">Select Prospect Company</p>
                <div className="relative mb-4">
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#d1d5db" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input type="text" placeholder="Search company name or industry..." className="dark-input w-full pl-10 pr-4 py-2.5 rounded-large text-sm" />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {prospectPool.map((prospect) => (
                    <div
                      key={prospect.id}
                      className={`prospect-row rounded-large p-3 flex items-center gap-3 cursor-pointer ${selectedProspect.id === prospect.id ? "selected" : ""}`}
                      onClick={() => handleProspectSelect(prospect)}
                    >
                      <img src={prospect.avatar} alt="" className="w-9 h-9 rounded-large object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{prospect.name}</p>
                        <p className="text-xs" style={{ color: "#9ca3af" }}>
                          {prospect.sector} · {prospect.email}
                        </p>
                      </div>
                      {selectedProspect.id === prospect.id && (
                        <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
                  <button onClick={() => goStep(2)} className="shimmer-btn w-full text-gray-900 text-sm font-bold py-3 rounded-large">
                    Continue →
                  </button>
                </div>
              </div>
            )}


            {composeStep === 2 && (
              <div className="p-4">
                {sponsorEmails.length > 0 && (
                  <div className="mb-4 pb-4" style={{ borderBottom: "1.5px solid #e5e7eb" }}>
                    <label className="text-xs font-bold mb-2 block" style={{ color: "#6b7280" }}>
                      💾 Use Saved Email
                    </label>
                    <select
                      className="w-full px-3 py-2.5 rounded-large text-sm transition-all"
                      onChange={(e) => {
                        if (e.target.value) {
                          setComposeForm((prev) => ({ ...prev, email: e.target.value }));
                        }
                      }}
                      defaultValue=""
                      style={{
                        background: "#ffffff",
                        border: "1.5px solid #e5e7eb",
                        color: "#1f2937"
                      }}
                    >
                      <option value="">-- Select a saved email --</option>
                      {sponsorEmails.map((email) => (
                        <option key={email} value={email}>
                          {email}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs mt-2" style={{ color: "#9ca3af" }}>
                      {sponsorEmails.length} saved email(s) available
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-xs font-bold mb-2 block" style={{ color: "#6b7280" }}>
                      📧 To (Company)
                    </label>
                    <input
                      type="text"
                      value={composeForm.to}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow alphanumeric, spaces, hyphens, and dots
                        const isValid = /^[a-zA-Z0-9\s\-\.]*$/.test(value);
                        if (isValid || value === "") {
                          setComposeForm((prev) => ({ ...prev, to: value }));
                          setCompanyNameError("");
                        } else {
                          setCompanyNameError("❌ Special characters not allowed. Use only letters, numbers, spaces, hyphens (-), and dots (.)");
                        }
                      }}
                      placeholder="Enter company name (letters, numbers, spaces, hyphens, dots only)"
                      className="w-full px-3 py-2.5 rounded-large text-sm transition-all"
                      style={{
                        background: "#ffffff",
                        border: companyNameError ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb",
                        color: "#1f2937"
                      }}
                      onFocus={(e) => e.target.style.borderColor = companyNameError ? "#ef4444" : "#8b5cf6"}
                      onBlur={(e) => e.target.style.borderColor = companyNameError ? "#ef4444" : "#e5e7eb"}
                    />
                    {companyNameError && (
                      <p className="text-xs mt-2" style={{ color: "#ef4444", fontWeight: "500" }}>
                        {companyNameError}
                      </p>
                    )}
                    {!companyNameError && (
                      <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>
                        Special characters (@, #, ?, ") are not allowed
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold mb-2 block" style={{ color: "#6b7280" }}>
                      ✉️ Contact Email
                    </label>
                    <input
                      type="email"
                      value={composeForm.email}
                      onChange={(e) => setComposeForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-large text-sm transition-all"
                      style={{
                        background: "#ffffff",
                        border: "1.5px solid #e5e7eb",
                        color: "#1f2937"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#8b5cf6"}
                      onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold mb-2 block" style={{ color: "#6b7280" }}>
                      🎯 Event
                    </label>
                    <select
                      className="w-full px-3 py-2.5 rounded-large text-sm transition-all"
                      value={composeForm.event}
                      onChange={(e) => setComposeForm((prev) => ({ ...prev, event: e.target.value }))}
                      style={{
                        background: "#ffffff",
                        border: "1.5px solid #e5e7eb",
                        color: "#1f2937"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#8b5cf6"}
                      onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                    >
                      <option>Tech Fest 2025</option>
                      <option>Cultural Night 2025</option>
                      <option>Sports Gala 2025</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-xs font-bold mb-2 block" style={{ color: "#6b7280" }}>
                    ✏️ Email Subject
                  </label>
                  <input
                    type="text"
                    value={composeForm.subject}
                    onChange={(e) => setComposeForm((prev) => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-large text-sm transition-all"
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #e5e7eb",
                      color: "#1f2937"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#8b5cf6"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold" style={{ color: "#6b7280" }}>
                      📝 Message Body
                    </label>
                    <button
                      onClick={() => updateBodyForTemplate(selectedTemplate, composeForm.to)}
                      className="text-xs font-bold px-3 py-1 rounded-large transition-all"
                      style={{
                        background: "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(236,72,153,0.2))",
                        color: "#8b5cf6",
                        border: "1px solid rgba(139,92,246,0.3)"
                      }}
                    >
                      ✨ Use Template
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={composeForm.body}
                    onChange={(e) => setComposeForm((prev) => ({ ...prev, body: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm resize-none transition-all"
                    style={{
                      borderRadius: "var(--radius-large)",
                      background: "#ffffff",
                      border: "1.5px solid #e5e7eb",
                      color: "#1f2937",
                      fontFamily: "inherit"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#8b5cf6"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => goStep(1)}
                    className="flex-1 text-sm font-bold py-2.5 rounded-large transition-all"
                    style={{
                      border: "1.5px solid #d1d5db",
                      color: "#6b7280",
                      background: "#ffffff"
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => goStep(3)}
                    className="flex-1 text-sm font-bold py-2.5 rounded-large text-white transition-all"
                    style={{
                      background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                      boxShadow: "0 4px 15px rgba(139,92,246,0.3)"
                    }}
                  >
                    Preview & Send →
                  </button>
                </div>
              </div>
            )}

            {composeStep === 3 && (
              <div className="p-4">
                <div
                  className="rounded-large p-4 mb-4"
                  style={{ background: "#ffffff", border: "1.5px solid #e5e7eb" }}
                >
                  <div
                    className="flex items-center gap-3 mb-4 pb-4"
                    style={{ borderBottom: "1.5px solid #f3f4f6" }}
                  >
                    <div className="w-9 h-9 rounded-large flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{composeForm.subject}</p>
                      <p className="text-xs" style={{ color: "#9ca3af" }}>
                        To: {composeForm.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm space-y-3" style={{ color: "#4b5563", lineHeight: 1.6 }}>
                    {composeForm.body.split("\n").map((line, idx) => (
                      <p key={idx}>{line || "\u00a0"}</p>
                    ))}
                  </div>
                </div>
                <div
                  className="rounded-large p-3 mb-4 flex items-start gap-3"
                  style={{ background: "rgba(59,130,246,0.08)", border: "1.5px solid rgba(59,130,246,0.2)" }}
                >
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#3b82f6" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs" style={{ color: "#3b82f6", fontWeight: "500" }}>
                    This sponsorship invitation will be processed and delivered to the recipient's inbox. They can respond and manage their sponsorship directly through the EVENTAURA portal.
                  </p>
                </div>
                <div className="flex gap-3" style={{ position: "sticky", bottom: 0, background: "#f3f4f6", paddingTop: "8px", zIndex: 5 }}>
                  <button
                    onClick={() => goStep(2)}
                    className="flex-1 text-sm font-bold py-2.5 rounded-large transition-all"
                    style={{ border: "1.5px solid #d1d5db", color: "#6b7280", background: "#ffffff" }}
                  >
                    ← Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleSendRequest}
                    disabled={isSendingRequest}
                    className="flex-1 text-sm font-bold py-2.5 rounded-large text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                    style={{
                      background: isSendingRequest ? "#9ca3af" : "linear-gradient(135deg,#8b5cf6,#ec4899)",
                      boxShadow: "0 4px 15px rgba(139,92,246,0.3)",
                      pointerEvents: isSendingRequest ? "none" : "auto",
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {isSendingRequest ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="app-bg flex" id="appWrapper">
        {/* Sidebar */}
        <aside
          id="sidebar"
          className={`sidebar w-64 flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
          style={{ minHeight: "100vh" }}
        >
          <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-200">
            <div className="logo-glow w-10 h-10 rounded-large flex items-center justify-center flex-shrink-0">
              <span className="text-gray-900 font-heading font-black text-sm tracking-tight">EA</span>
            </div>
            <div>
              <p className="font-heading font-black text-gray-900 text-base tracking-tight gradient-text">EVENTAURA</p>
              <p className="text-xs" style={{ color: "#9ca3af" }}>
                Finance · Member 4
              </p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            <p className="text-xs font-heading font-semibold uppercase tracking-widest px-3 mb-3" style={{ color: "#9ca3af" }}>
              Overview
            </p>
            {navItem("dashboard", navItems[0])}

            <p className="text-xs font-heading font-semibold uppercase tracking-widest px-3 mt-5 mb-3" style={{ color: "#9ca3af" }}>
              Sponsorship
            </p>
            {navItem("packages", navItems[1])}
            {navItem("requestsponsors", navItems[2])}
            {navItem("applications", navItems[3])}

            <p className="text-xs font-heading font-semibold uppercase tracking-widest px-3 mt-5 mb-3" style={{ color: "#9ca3af" }}>
              Payments
            </p>
            {navItem("payments", navItems[4])}
            {navItem("invoices", navItems[5])}

            <p className="text-xs font-heading font-semibold uppercase tracking-widest px-3 mt-5 mb-3" style={{ color: "#9ca3af" }}>
              Reports
            </p>
            {navItem("reports", navItems[6])}
          </nav>

          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-2.5 rounded-large cursor-pointer" style={{ background: "#f3f4f6" }}>
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
                alt="User"
                className="w-9 h-9 rounded-large object-cover flex-shrink-0"
                style={{ border: "2px solid #c084fc" }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">Malith Induwara</p>
                <p className="text-xs truncate" style={{ color: "#9ca3af" }}>
                  Finance Organizer
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" style={{ boxShadow: "0 0 6px #4ade80" }} />
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0">
          <header className="top-header px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button
                className="mobile-menu-btn p-2 rounded-large hover:bg-gray-100 transition-all"
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="font-heading font-bold text-gray-900 text-lg leading-tight">
                  {activeSection === "dashboard" && "Financial Dashboard"}
                  {activeSection === "packages" && "Sponsorship Packages"}
                  {activeSection === "requestsponsors" && "Request Sponsors"}
                  {activeSection === "applications" && "Sponsor Applications"}
                  {activeSection === "payments" && "Payment Tracking"}
                  {activeSection === "invoices" && "Invoices & Receipts"}
                  {activeSection === "reports" && "Revenue Reports"}
                </h1>
                <p className="text-xs" style={{ color: "#9ca3af" }}>
                  University Tech Fest 2025 · Sponsorship & Payments
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-large"
                style={{ background: "#dcfce7", border: "1px solid #86efac" }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-100" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                <span className="text-xs font-semibold text-green-400">Live</span>
              </div>
              <button className="relative p-2 rounded-large transition-all" style={{ background: "#f3f4f6" }}>
                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full" style={{ boxShadow: "0 0 6px #ec4899" }} />
              </button>
              <button
                className="shimmer-btn hidden md:flex items-center gap-2 text-gray-900 text-sm font-bold px-5 py-2.5 rounded-large"
                onClick={() => openComposeModal()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Request Sponsor
              </button>
            </div>
          </header>

          <div className="flex-1 px-4 md:px-8 py-6 space-y-6">
            {/* Dashboard */}
            {activeSection === "dashboard" && (
              <section className="space-y-6">
                <div
                  className="rounded-large p-6 relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(124,58,237,0.85) 0%,rgba(219,39,119,0.85) 50%,rgba(217,119,6,0.75) 100%)",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background:
                        "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=300&fit=crop') center/cover no-repeat",
                    }}
                  />
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#ffffff" }}>
                        Welcome back, MALITH 👋
                      </p>
                      <h2 className="font-heading font-black text-white text-2xl md:text-3xl leading-tight">
                        EVENTAURA Finance
                        <br />
                        <span>Dashboard</span>
                      </h2>
                      <p className="text-sm mt-2" style={{ color: "#f0f0f0" }}>
                        Tech Fest 2025 · Financial Overview
                      </p>
                    </div>
                    <div className="flex gap-3">
                      {["11", "43", "89%"].map((val, idx) => (
                        <div
                          key={val}
                          className="text-center px-5 py-3 rounded-large"
                          style={{ background: "rgba(255, 255, 255, 0.15)", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                        >
                          <p className="font-heading font-black text-white text-xl">{val}</p>
                          <p className="text-xs" style={{ color: "#f0f0f0" }}>
                            {idx === 0 ? "Sponsors" : idx === 1 ? "Stalls" : "Collected"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {statTargets.map((stat, idx) => (
                    <div key={stat.id} className={`stat-card ${stat.className} rounded-large p-5`}>
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-11 h-11 rounded-large flex items-center justify-center"
                          style={{
                            background:
                              stat.className === "stat-card-1"
                                ? "linear-gradient(135deg,#8b5cf6,#6d28d9)"
                                : stat.className === "stat-card-2"
                                  ? "linear-gradient(135deg,#ec4899,#be185d)"
                                  : stat.className === "stat-card-3"
                                    ? "linear-gradient(135deg,#f59e0b,#d97706)"
                                    : "linear-gradient(135deg,#ef4444,#b91c1c)",
                          }}
                        >
                          <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {stat.id === "totalRevenue" && (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                            {stat.id === "sponsorRevenue" && (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            )}
                            {stat.id === "stallRevenue" && (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            )}
                            {stat.id === "pending" && (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                          </svg>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-small" style={{ background: stat.id === "pending" ? "#fee2e2" : "#dcfce7", color: stat.id === "pending" ? "#dc2626" : "#16a34a" }}>
                          {stat.delta}
                        </span>
                      </div>
                      <p className="font-heading font-black text-gray-900 text-2xl counter">LKR {counters[idx].toLocaleString()}</p>
                      <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
                        {stat.label}
                      </p>
                      <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "#e5e7eb" }}>
                        <div
                          className="h-full rounded-full progress-bar"
                          style={{
                            width: `${stat.progress}%`,
                            background:
                              stat.className === "stat-card-1"
                                ? "linear-gradient(90deg,#8b5cf6,#a78bfa)"
                                : stat.className === "stat-card-2"
                                  ? "linear-gradient(90deg,#ec4899,#f9a8d4)"
                                  : stat.className === "stat-card-3"
                                    ? "linear-gradient(90deg,#f59e0b,#fcd34d)"
                                    : "linear-gradient(90deg,#ef4444,#fca5a5)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="glass-card lg:col-span-2 rounded-large p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="font-heading font-bold text-gray-900 text-base">Revenue Overview</h2>
                        <p className="text-xs" style={{ color: "#9ca3af" }}>
                          Monthly breakdown – 2025
                        </p>
                      </div>
                      <select className="dark-input text-xs rounded-small px-3 py-1.5 focus:outline-none">
                        <option>2025</option>
                        <option>2024</option>
                      </select>
                    </div>
                    <div className="h-64 overflow-hidden">
                      <canvas id="revenueChart" ref={revenueChartRef} className="w-full h-full" />
                    </div>
                  </div>
                  <div className="glass-card rounded-large p-6">
                    <div className="mb-5">
                      <h2 className="font-heading font-bold text-gray-900 text-base">Revenue Split</h2>
                      <p className="text-xs" style={{ color: "#9ca3af" }}>
                        By category
                      </p>
                    </div>
                    <div className="h-44 overflow-hidden flex items-center justify-center">
                      <canvas id="donutChart" ref={donutChartRef} className="w-full h-full" />
                    </div>
                    <div className="mt-4 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full inline-block" style={{ background: "linear-gradient(90deg,#8b5cf6,#ec4899)" }} />
                          <span style={{ color: "#6b7280" }}>Sponsorship</span>
                        </div>
                        <span className="font-bold text-gray-900">59%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full inline-block" style={{ background: "linear-gradient(90deg,#f59e0b,#fcd34d)" }} />
                          <span style={{ color: "#6b7280" }}>Stall Fees</span>
                        </div>
                        <span className="font-bold text-gray-900">41%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-card rounded-large p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-heading font-bold text-gray-900 text-base">Recent Payments</h2>
                      <button
                        className="text-xs font-semibold px-3 py-1.5 rounded-small transition-all"
                        style={{ color: "#7c3aed", background: "#ede9fe" }}
                        onClick={() => setActiveSection("payments")}
                      >
                        View All →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {["TechCorp Sdn Bhd", "Stall A-03 · Vendor", "Nexus Media Group", "Stall B-07 · Vendor"].map((item, idx) => {
                        const statusStyles = [
                          { bg: "#dcfce7", border: "#86efac", text: "text-green-700", iconBg: "#bbf7d0" },
                          { bg: "#dcfce7", border: "#86efac", text: "text-green-700", iconBg: "#bbf7d0" },
                          { bg: "#fef3c7", border: "#fcd34d", text: "text-amber-700", iconBg: "#fed7aa" },
                          { bg: "#fee2e2", border: "#fca5a5", text: "text-red-700", iconBg: "#fecaca" },
                        ][idx];
                        const amounts = ["+LKR 200,000", "+LKR 800", "LKR 100,000", "LKR 450"];
                        const subtitles = [
                          "Gold Sponsorship · 12 Jul 2025",
                          "Premium Zone · 11 Jul 2025",
                          "Silver Sponsorship · Pending",
                          "Standard Zone · Failed",
                        ];
                        const iconPaths = [
                          <path key="1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />,
                          <path key="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />,
                          <path key="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
                          <path key="4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />,
                        ];
                        return (
                          <div
                            key={item}
                            className="flex items-center gap-3 p-3 rounded-large"
                            style={{ background: statusStyles.bg, border: `1px solid ${statusStyles.border}` }}
                          >
                            <div
                              className="w-9 h-9 rounded-large flex items-center justify-center flex-shrink-0"
                              style={{ background: statusStyles.iconBg }}
                            >
                              <svg className={`w-4 h-4 ${statusStyles.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {iconPaths[idx]}
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{item}</p>
                              <p className="text-xs" style={{ color: "#9ca3af" }}>
                                {subtitles[idx]}
                              </p>
                            </div>
                            <span className={`text-sm font-bold ${statusStyles.text} flex-shrink-0`}>
                              {amounts[idx]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="glass-card rounded-large p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-heading font-bold text-gray-900 text-base">Pending Approvals</h2>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-small" style={{ background: "#fbcfe8", color: "#be185d", border: "1px solid #f472b6" }}>
                        5 new
                      </span>
                    </div>
                    <div className="space-y-3">
                      {approvals.map((row) => (
                        <div key={row.id} className="approval-row flex items-center gap-3 p-3 rounded-large">
                          <img
                            src={row.avatar}
                            alt={row.name}
                            className="w-9 h-9 rounded-large object-cover flex-shrink-0"
                            style={{ border: "2px solid #fcd34d" }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{row.name}</p>
                            <span className={`${row.badge} text-xs px-2 py-0.5 rounded-small font-bold`}>
                              {row.badge.includes("gold") && "Gold"}
                              {row.badge.includes("silver") && "Silver"}
                              {row.badge.includes("bronze") && "Bronze"} · LKR {row.amount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button
                              className="w-8 h-8 rounded-small flex items-center justify-center transition-all"
                              style={{ background: "#bbf7d0" }}
                            >
                              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              className="w-8 h-8 rounded-small flex items-center justify-center transition-all"
                              style={{ background: "#fecaca" }}
                            >
                              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-large overflow-hidden">
                  <div
                    className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    style={{ borderBottom: "1px solid #e5e7eb" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-large flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}
                      >
                        <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="font-heading font-bold text-gray-900 text-base">Past Event Sponsors</h2>
                        <p className="text-xs" style={{ color: "#9ca3af" }}>
                          Sponsors from all completed university events
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={eventFilter}
                        onChange={(e) => setEventFilter(e.target.value)}
                        className="dark-input text-xs rounded-small px-3 py-2"
                      >
                        <option value="all">All Events</option>
                        <option value="techfest2024">Tech Fest 2024</option>
                        <option value="culturalnight2024">Cultural Night 2024</option>
                        <option value="sportsgala2024">Sports Gala 2024</option>
                        <option value="hackathon2023">Hackathon 2023</option>
                      </select>
                      <select
                        value={packageFilter}
                        onChange={(e) => setPackageFilter(e.target.value)}
                        className="dark-input text-xs rounded-small px-3 py-2"
                      >
                        <option value="all">All Packages</option>
                        <option value="gold">Gold</option>
                        <option value="silver">Silver</option>
                        <option value="bronze">Bronze</option>
                      </select>
                      <div className="relative">
                        <svg
                          className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2"
                          style={{ color: "#a1a5b8" }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          type="text"
                          placeholder="Search sponsor..."
                          className="dark-input text-xs rounded-small pl-8 pr-3 py-2 w-36"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4" style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <div className="px-6 py-4 text-center" style={{ borderRight: "1px solid #e5e7eb" }}>
                      <p className="font-heading font-black text-gray-900 text-2xl">32</p>
                      <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                        Total Sponsors
                      </p>
                    </div>
                    <div className="px-6 py-4 text-center" style={{ borderRight: "1px solid #e5e7eb" }}>
                      <p
                        className="font-heading font-black text-2xl"
                        style={{ background: "linear-gradient(90deg,#f59e0b,#fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                      >
                        8
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                        Gold Sponsors
                      </p>
                    </div>
                    <div className="px-6 py-4 text-center" style={{ borderRight: "1px solid #e5e7eb" }}>
                      <p
                        className="font-heading font-black text-2xl"
                        style={{ background: "linear-gradient(90deg,#9ca3af,#d1d5db)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                      >
                        12
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                        Silver Sponsors
                      </p>
                    </div>
                    <div className="px-6 py-4 text-center">
                      <p
                        className="font-heading font-black text-2xl"
                        style={{ background: "linear-gradient(90deg,#d97706,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                      >
                        12
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                        Bronze Sponsors
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div id="sponsorGrid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredSponsors.length === 0 && (
                        <div className="hidden" />
                      )}
                      {filteredSponsors.map((card) => (
                        <div key={card.id} className="sponsor-card rounded-large p-4 flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={`https://images.unsplash.com/photo-1560250097-0b93528c311a?w=48&h=48&fit=crop&crop=face&sig=${card.id}`}
                              alt={card.name}
                              className="w-11 h-11 rounded-large object-cover flex-shrink-0"
                              style={{ border: `2px solid ${card.badgeColor === "gold" ? "#fcd34d" : card.badgeColor === "silver" ? "#d1d5db" : "#d97706"}` }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-heading font-bold text-gray-900 truncate">{card.name}</p>
                              <p className="text-xs truncate" style={{ color: "#9ca3af" }}>
                                {card.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`badge-${card.badgeColor} text-xs px-2.5 py-1 rounded-small font-bold`}>
                              {card.package.charAt(0).toUpperCase() + card.package.slice(1)}
                            </span>
                            <span className="font-heading font-bold text-gray-900 text-sm">LKR{card.amount.toLocaleString()}</span>
                          </div>
                          <div
                            className="rounded-small px-3 py-2"
                            style={{ background: "#f3f4f6", border: "1px solid #e5e7eb" }}
                          >
                            <p className="text-xs" style={{ color: "#a1a5b8" }}>
                              Event
                            </p>
                            <p className="text-xs font-semibold text-gray-900 mt-0.5">{card.eventLabel}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs" style={{ color: "#a1a5b8" }}>
                              {card.date}
                            </span>
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-small"
                              style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80" }}
                            >
                              {card.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredSponsors.length === 0 && (
                      <div id="noResults" className="text-center py-12">
                        <div
                          className="w-14 h-14 rounded-large flex items-center justify-center mx-auto mb-3"
                          style={{ background: "#e5e7eb" }}
                        >
                          <svg className="w-7 h-7" style={{ color: "#e5e7eb" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: "#9ca3af" }}>
                          No sponsors found
                        </p>
                        <p className="text-xs mt-1" style={{ color: "#e5e7eb" }}>
                          Try adjusting your filters
                        </p>
                      </div>
                    )}

                    <div className="mt-6 text-center">
                      <button className="shimmer-btn text-gray-900 text-sm font-bold px-8 py-3 rounded-large">
                        View All 32 Past Sponsors →
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Request Sponsors */}
            {activeSection === "requestsponsors" && (
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-heading font-bold text-gray-900 text-xl">Request Sponsors</h2>
                    <p className="text-sm mt-0.5" style={{ color: "#9ca3af" }}>
                      Send sponsorship invitations to potential companies for your events
                    </p>
                  </div>
                  <button
                    onClick={() => openComposeModal()}
                    className="shimmer-btn flex items-center gap-2 text-gray-900 text-sm font-bold px-6 py-3 rounded-large self-start sm:self-auto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send New Request
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {visibleRequestSummary.map((item) => (
                    <div key={item.id} className="req-stat-card rounded-large p-4 text-center">
                      <p className="font-heading font-black text-gray-900 text-2xl" style={{ color: item.color }}>
                        {item.value}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-semibold text-gray-900 text-base">Sent Requests</h3>
                      <div className="flex items-center gap-2">
                        <select className="dark-input text-xs rounded-small px-3 py-1.5">
                          <option>All Events</option>
                          <option>Tech Fest 2025</option>
                          <option>Cultural Night 2025</option>
                        </select>
                        <select className="dark-input text-xs rounded-small px-3 py-1.5">
                          <option>All Status</option>
                          <option>Sent</option>
                          <option>Opened</option>
                          <option>Accepted</option>
                          <option>Declined</option>
                        </select>
                      </div>
                    </div>

                    {visibleSponsorRequests.length > 0 ? (
                      <>
                        {console.log("Rendering visibleSponsorRequests with length:", visibleSponsorRequests.length)}
                        {visibleSponsorRequests.map((card) => {
                          const meta = statusMeta(card.status);
                          return (
                        <div key={card.id} className="req-card rounded-large p-5">
                          <div className="flex items-start gap-4">
                            <img
                              src={`https://images.unsplash.com/photo-1560250097-0b93528c311a?w=44&h=44&fit=crop&crop=face&sig=${card.id}`}
                              alt=""
                              className="w-11 h-11 rounded-large object-cover flex-shrink-0"
                              style={{ border: `2px solid ${meta.footerColor}40` }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 flex-wrap">
                                <div>
                                  <p className="font-heading font-bold text-gray-900 text-sm">{card.company}</p>
                                  <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                                    {card.email} · {card.industry}
                                  </p>
                                </div>
                                <span className={`${meta.badge} text-xs font-bold px-2.5 py-1 rounded-small flex-shrink-0`}>
                                  {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-3 mt-3">
                                <div className="flex items-center gap-1.5 text-xs" style={{ color: "#9ca3af" }}>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Sent: {card.sent}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs" style={{ color: "#9ca3af" }}>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  {card.event}
                                </div>

                              </div>
                              <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid #e5e7eb" }}>
                                <div className="flex items-center gap-1.5 text-xs" style={{ color: meta.footerColor }}>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                  <button
                                    className="text-xs font-semibold px-3 py-1.5 rounded-small transition-all"
                                    style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
                                    onClick={() => handleDeleteSponsorRequest(card.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                        })}
                      </>
                    ) : (
                      <div className="req-card rounded-large p-6 text-center" style={{ border: "1px dashed #d1d5db" }}>
                        <p className="font-heading font-semibold text-gray-900">No sponsor requests yet</p>
                        <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>
                          Send a new request to see it appear here.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div className="glass-card rounded-large overflow-hidden">
                      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <div>
                          <h3 className="font-heading font-semibold text-gray-900 text-sm">Prospect Pool</h3>
                          <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                            Companies to target
                          </p>
                        </div>
                        <button className="text-xs font-bold px-3 py-1.5 rounded-small transition-all" style={{ background: "rgba(139,92,246,0.2)", color: "#c4b5fd" }}>
                          + Add
                        </button>
                      </div>
                      <div className="p-4 space-y-2.5">
                        {prospectPool.map((prospect) => (
                          <div
                            key={prospect.id}
                            className="flex items-center gap-3 p-3 rounded-large"
                            style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}
                          >
                            <img src={prospect.avatar} alt="" className="w-8 h-8 rounded-large object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate">{prospect.name}</p>
                              <p className="text-xs truncate" style={{ color: "#a1a5b8" }}>
                                {prospect.sector}
                              </p>
                            </div>
                            <button
                              onClick={() => openComposeModal(prospect)}
                              className="text-xs font-bold px-2.5 py-1 rounded-small flex-shrink-0 transition-all"
                              style={{ background: "rgba(139,92,246,0.2)", color: "#c4b5fd" }}
                            >
                              Invite
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-card rounded-large overflow-hidden">
                      <div className="px-5 py-4" style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <h3 className="font-heading font-semibold text-gray-900 text-sm">Email Templates</h3>
                        <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                          Quick-start your request
                        </p>
                      </div>
                      <div className="p-4 space-y-2.5">
                        {templateOptions.map((tpl) => (
                          <div
                            key={tpl.id}
                            className={`template-card rounded-large p-3.5 ${selectedTemplate === tpl.id ? "selected" : ""}`}
                            onClick={() => updateBodyForTemplate(tpl.id, composeForm.to)}
                          >
                            <div className="flex items-center gap-2.5 mb-1.5">
                              <div className="w-6 h-6 rounded-small flex items-center justify-center flex-shrink-0" style={{ background: tpl.iconBg }}>
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: tpl.accent }}>
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                              </div>
                              <p className="text-xs font-bold text-gray-900">{tpl.title}</p>
                            </div>
                            <p className="text-xs" style={{ color: "#9ca3af" }}>
                              {tpl.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-card rounded-large overflow-hidden">
                      <div className="px-5 py-4" style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <h3 className="font-heading font-semibold text-gray-900 text-sm">Recent Activity</h3>
                      </div>
                      <div className="p-4 space-y-0">
                        {timelineActivity.map((item, idx) => (
                          <div key={item.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="timeline-dot" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}99` }} />
                              {idx < timelineActivity.length - 1 && <div className="timeline-line h-10" />}
                            </div>
                            <div className={`flex-1 ${idx < timelineActivity.length - 1 ? "pb-4" : ""}`}>
                              <p className="text-xs font-semibold text-gray-900">{item.title}</p>
                              <p className="text-xs mt-0.5" style={{ color: "#a1a5b8" }}>
                                {item.time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Packages */}
            {activeSection === "packages" && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading font-bold text-gray-900 text-xl">Sponsorship Packages</h2>
                    <p className="text-sm" style={{ color: "#9ca3af" }}>
                      Create and manage Gold, Silver, Bronze packages
                    </p>
                  </div>
                </div>

                {/* Static cards reused from the design */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Gold */}
                  <div className="pkg-card rounded-large overflow-hidden" style={{ background: "#fef3c7", border: "2px solid #f59e0b" }}>
                    <div
                      className="p-6 relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg,rgba(217,119,6,0.5),rgba(251,191,36,0.4))" }}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: "#d97706", transform: "translate(30%,-30%)" }} />
                      <div className="flex items-center justify-between relative z-10">
                        <span className="font-heading font-black text-xl" style={{ color: "#1f2937" }}>Gold</span>
                        <div className="w-10 h-10 rounded-large flex items-center justify-center" style={{ background: "rgba(245,158,11,0.3)" }}>
                          <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                      </div>
                      <p className="font-heading font-black text-gray-900 text-3xl mt-3 relative z-10">LKR {packagePrices.Gold.toLocaleString()}</p>
                      <p className="text-xs mt-1 relative z-10" style={{ color: "#374151" }}>
                        Per event sponsorship
                      </p>
                    </div>
                    <div className="p-5">
                      <ul className="space-y-2.5 mb-5 text-sm" style={{ color: "#1f2937" }}>
                        {[
                          "Main stage banner placement",
                          "Logo on all event materials",
                          "VIP booth (Premium Zone)",
                          "Social media shoutout (5 posts)",
                          "MC mention during event",
                        ].map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between text-xs mb-4" style={{ color: "#9ca3af" }}>
                        <span>
                          Applications: <strong className="text-gray-900">3</strong>
                        </span>
                        <span>
                          Approved: <strong className="text-green-400">2</strong>
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPackage("Gold", 200000)}
                          className="flex-1 text-xs font-semibold py-2 rounded-small transition-all hover:bg-gray-100"
                          style={{ border: "1px solid #d1d5db", color: "#6b7280" }}
                        >
                          Edit
                        </button>
                        <button
                          className="flex-1 text-xs font-bold py-2 rounded-small transition-all"
                          style={{ background: "rgba(245,158,11,0.2)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)" }}
                        >
                          View Apps
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Silver */}
                  <div className="pkg-card rounded-large overflow-hidden" style={{ background: "#e5e7eb", border: "2px solid #9ca3af" }}>
                    <div
                      className="p-6 relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg,rgba(75,85,99,0.5),rgba(156,163,175,0.4))" }}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "#9ca3af", transform: "translate(30%,-30%)" }} />
                      <div className="flex items-center justify-between relative z-10">
                        <span className="font-heading font-black text-xl" style={{ color: "#1f2937" }}>Silver</span>
                        <div className="w-10 h-10 rounded-large flex items-center justify-center" style={{ background: "rgba(107,114,128,0.3)" }}>
                          <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                      </div>
                      <p className="font-heading font-black text-gray-900 text-3xl mt-3 relative z-10">LKR {packagePrices.Silver.toLocaleString()}</p>
                      <p className="text-xs mt-1 relative z-10" style={{ color: "#374151" }}>
                        Per event sponsorship
                      </p>
                    </div>
                    <div className="p-5">
                      <ul className="space-y-2.5 mb-5 text-sm" style={{ color: "#1f2937" }}>
                        {[
                          "Side banner placement",
                          "Logo on event poster",
                          "Standard booth",
                          "Social media shoutout (2 posts)",
                        ].map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            {item}
                          </li>
                        ))}
                        <li className="flex items-center gap-2" style={{ color: "#6b7280" }}>
                          <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          MC mention
                        </li>
                      </ul>
                      <div className="flex items-center justify-between text-xs mb-4" style={{ color: "#9ca3af" }}>
                        <span>
                          Applications: <strong className="text-gray-900">5</strong>
                        </span>
                        <span>
                          Approved: <strong className="text-green-400">3</strong>
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPackage("Silver", 100000)}
                          className="flex-1 text-xs font-semibold py-2 rounded-small transition-all hover:bg-gray-100"
                          style={{ border: "1px solid #d1d5db", color: "#6b7280" }}
                        >
                          Edit
                        </button>
                        <button
                          className="flex-1 text-xs font-bold py-2 rounded-small transition-all"
                          style={{ background: "rgba(107,114,128,0.2)", color: "#d1d5db", border: "1px solid rgba(107,114,128,0.3)" }}
                        >
                          View Apps
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bronze */}
                  <div className="pkg-card rounded-large overflow-hidden" style={{ background: "#fed7aa", border: "2px solid #d97706" }}>
                    <div
                      className="p-6 relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg,rgba(180,83,9,0.5),rgba(217,119,6,0.4))" }}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "#d97706", transform: "translate(30%,-30%)" }} />
                      <div className="flex items-center justify-between relative z-10">
                        <span className="font-heading font-black text-xl" style={{ color: "#1f2937" }}>Bronze</span>
                        <div className="w-10 h-10 rounded-large flex items-center justify-center" style={{ background: "rgba(180,83,9,0.3)" }}>
                          <svg className="w-6 h-6 text-orange-700" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                      </div>
                      <p className="font-heading font-black text-gray-900 text-3xl mt-3 relative z-10">LKR {packagePrices.Bronze.toLocaleString()}</p>
                      <p className="text-xs mt-1 relative z-10" style={{ color: "#374151" }}>
                        Per event sponsorship
                      </p>
                    </div>
                    <div className="p-5">
                      <ul className="space-y-2.5 mb-5 text-sm" style={{ color: "#1f2937" }}>
                        {[
                          "Logo on event website",
                          "Basic booth (Far area)",
                          "1 social media mention",
                        ].map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            {item}
                          </li>
                        ))}
                        {[
                          "Banner placement",
                          "MC mention",
                        ].map((item) => (
                          <li key={item} className="flex items-center gap-2" style={{ color: "#6b7280" }}>
                            <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between text-xs mb-4" style={{ color: "#9ca3af" }}>
                        <span>
                          Applications: <strong className="text-gray-900">8</strong>
                        </span>
                        <span>
                          Approved: <strong className="text-green-400">6</strong>
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPackage("Bronze", 50000)}
                          className="flex-1 text-xs font-semibold py-2 rounded-small transition-all hover:bg-gray-100"
                          style={{ border: "1px solid #d1d5db", color: "#6b7280" }}
                        >
                          Edit
                        </button>
                        <button
                          className="flex-1 text-xs font-bold py-2 rounded-small transition-all"
                          style={{ background: "rgba(180,83,9,0.2)", color: "#fb923c", border: "1px solid rgba(180,83,9,0.3)" }}
                        >
                          View Apps
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Applications */}
            {activeSection === "applications" && (
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-heading font-bold text-gray-900 text-xl">Sponsor Applications</h2>
                    <p className="text-sm" style={{ color: "#9ca3af" }}>
                      Review and approve sponsorship requests
                    </p>
                  </div>
                </div>

                {/* Add Sponsor Email Section */}
                <div className="glass-card rounded-large p-5">
                  <h3 className="font-heading font-bold text-gray-900 mb-4 text-base">📧 Add Sponsor Email</h3>
                  <div className="flex gap-3 mb-4">
                    <input
                      type="email"
                      placeholder="Enter sponsor email address"
                      value={newSponsorEmail}
                      onChange={(e) => setNewSponsorEmail(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-large text-sm"
                      style={{
                        background: "#ffffff",
                        border: "1.5px solid #e5e7eb",
                        color: "#1f2937"
                      }}
                      onKeyPress={(e) => e.key === "Enter" && handleAddSponsorEmail()}
                    />
                    <button
                      onClick={handleAddSponsorEmail}
                      className="px-5 py-2.5 rounded-large text-white font-bold text-sm"
                      style={{
                        background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                        boxShadow: "0 4px 12px rgba(139,92,246,0.3)"
                      }}
                    >
                      + Add
                    </button>
                  </div>

                  {sponsorEmails.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {sponsorEmails.map((email, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-2 rounded-large"
                          style={{
                            background: "rgba(139,92,246,0.1)",
                            border: "1px solid rgba(139,92,246,0.3)"
                          }}
                        >
                          <span className="text-sm text-gray-900">{email}</span>
                          <button
                            onClick={() => handleRemoveSponsorEmail(email)}
                            className="text-red-500 hover:text-red-700 font-bold"
                            style={{ fontSize: "16px" }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass-card rounded-large overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                          {["Sponsor", "Event", "Package", "Amount", "Applied", "Status", "Action"].map((h) => (
                            <th
                              key={h}
                              className="text-left px-5 py-4 font-heading font-semibold text-xs uppercase tracking-wide"
                              style={{ color: "#9ca3af" }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map((app, idx) => {
                          const pkgLabels = { Gold: "badge-gold", Silver: "badge-silver", Bronze: "badge-bronze" };
                          const pkgBadge = pkgLabels[app.package] || "badge-gold";
                          const statusColor = app.status === "Approved" ? "rgba(74,222,128,0.15)" : app.status === "Pending" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)";
                          const statusText = app.status === "Approved" ? "#4ade80" : app.status === "Pending" ? "#fbbf24" : "#f87171";
                          
                          return (
                            <tr key={app.id} className={`trow ${idx < 4 ? "pay-row" : ""}`}>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={`https://images.unsplash.com/photo-1560250097-0b93528c311a?w=32&h=32&fit=crop&crop=face&sig=${idx}`}
                                    alt=""
                                    className="w-8 h-8 rounded-large object-cover"
                                  />
                                  <div>
                                    <p className="font-semibold text-gray-900">{app.name}</p>
                                    <p className="text-xs" style={{ color: "#a1a5b8" }}>
                                      {app.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4" style={{ color: "#6b7280" }}>
                                {app.event}
                              </td>
                              <td className="px-5 py-4">
                                <span className={`${pkgBadge} text-xs px-2.5 py-1 rounded-small font-bold`}>{app.package}</span>
                              </td>
                              <td className="px-5 py-4 font-bold text-gray-900">LKR {app.amount.toLocaleString()}</td>
                              <td className="px-5 py-4 text-xs" style={{ color: "#9ca3af" }}>
                                {app.applied}
                              </td>
                              <td className="px-5 py-4">
                                <span 
                                  className="text-xs font-bold px-2.5 py-1 rounded-small"
                                  style={{
                                    background: 
                                      app.status === "Accepted" ? "rgba(74,222,128,0.15)" :
                                      app.status === "Pending" ? "rgba(245,158,11,0.15)" :
                                      app.status === "Rejected" ? "rgba(239,68,68,0.15)" :
                                      "rgba(107,114,128,0.15)",
                                    color:
                                      app.status === "Accepted" ? "#4ade80" :
                                      app.status === "Pending" ? "#fbbf24" :
                                      app.status === "Rejected" ? "#f87171" :
                                      "#6b7280"
                                  }}
                                >
                                  {app.status}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <button
                                  className="text-xs font-bold px-3 py-1.5 rounded-small transition-all"
                                  style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}
                                  onClick={() => handleDeleteApplication(app.id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* Payments */}
            {activeSection === "payments" && (
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-heading font-bold text-gray-900 text-xl">Payment Tracking</h2>
                    <p className="text-sm" style={{ color: "#9ca3af" }}>
                      Monitor all stall and sponsorship payments
                    </p>
                  </div>
                  <div className="flex rounded-large p-1 gap-1" style={{ background: "#e5e7eb" }}>
                    {["all", "completed", "pending", "failed"].map((f) => (
                      <button
                        key={f}
                        className={`tab-btn text-xs font-bold px-3 py-1.5 rounded-small ${paymentsFilter === f ? "active" : ""}`}
                        onClick={() => setPaymentsFilter(f)}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div
                    className="rounded-large p-4"
                    style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)" }}
                  >
                    <p className="text-xs font-bold text-green-400 mb-1">Completed</p>
                    <p className="font-heading font-black text-gray-900 text-2xl">{paymentsSummary.completed}</p>
                    <p className="text-xs text-green-400 mt-1">LKR {paymentsSummary.completedTotal.toLocaleString()} collected</p>
                  </div>
                  <div
                    className="rounded-large p-4"
                    style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
                  >
                    <p className="text-xs font-bold text-amber-400 mb-1">Pending</p>
                    <p className="font-heading font-black text-gray-900 text-2xl">{paymentsSummary.pending}</p>
                    <p className="text-xs text-amber-400 mt-1">LKR {paymentsSummary.pendingTotal.toLocaleString()} awaiting</p>
                  </div>
                  <div
                    className="rounded-large p-4"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    <p className="text-xs font-bold text-red-400 mb-1">Failed</p>
                    <p className="font-heading font-black text-gray-900 text-2xl">{paymentsSummary.failed}</p>
                    <p className="text-xs text-red-400 mt-1">LKR {paymentsSummary.failedTotal.toLocaleString()} lost</p>
                  </div>
                </div>

                <div className="glass-card rounded-large overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                          {["Ref #", "Payer", "Type", "Amount", "Date & Time", "Status", "Action"].map((h) => (
                            <th
                              key={h}
                              className="text-left px-5 py-4 font-heading font-semibold text-xs uppercase tracking-wide"
                              style={{ color: "#9ca3af" }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.map((row) => (
                          <tr key={row.id} className="trow pay-row">
                            <td className="px-5 py-4 text-xs font-mono" style={{ color: "#d1d5db" }}>
                              {row.id}
                            </td>
                            <td className="px-5 py-4 font-semibold text-gray-900">{row.payer}</td>
                            <td className="px-5 py-4">
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-small"
                                style={{
                                  background: row.type === "Sponsorship" ? "rgba(139,92,246,0.2)" : "rgba(245,158,11,0.2)",
                                  color: row.type === "Sponsorship" ? "#c4b5fd" : "#fbbf24",
                                }}
                              >
                                {row.type}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-bold text-gray-900">LKR {row.amount.toLocaleString()}</td>
                            <td className="px-5 py-4 text-xs" style={{ color: "#9ca3af" }}>
                              {row.datetime}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className="text-xs font-bold px-2.5 py-1 rounded-small"
                                style={{
                                  background:
                                    row.status === "completed"
                                      ? "rgba(74,222,128,0.15)"
                                      : row.status === "pending"
                                        ? "rgba(245,158,11,0.15)"
                                        : "rgba(239,68,68,0.15)",
                                  color:
                                    row.status === "completed"
                                      ? "#4ade80"
                                      : row.status === "pending"
                                        ? "#fbbf24"
                                        : "#f87171",
                                }}
                              >
                                {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <button
                                onClick={() => handleDeletePayment(row._id || row.id)}
                                className="text-xs font-bold flex items-center gap-1"
                                style={{ color: "#f87171" }}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* Invoices */}
            {activeSection === "invoices" && (
              <section className="space-y-6">
                <div>
                  <h2 className="font-heading font-bold text-gray-900 text-xl">Invoices & Receipts</h2>
                  <p className="text-sm" style={{ color: "#9ca3af" }}>
                    Auto-generated invoices for all sponsorship payments
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {invoiceCards.length > 0 ? (
                    invoiceCards.map(({ payment, invoiceNo, issuedLabel, statusLabel, description, isPaid }) => (
                      <div key={payment._id} className="invoice-card rounded-large p-6">
                        <div className="flex items-start justify-between mb-5">
                          <div>
                            <p className="font-heading font-bold text-gray-900 text-base">{invoiceNo}</p>
                            <p className="text-xs mt-0.5" style={{ color: "#a1a5b8" }}>
                              {issuedLabel}
                            </p>
                          </div>
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-small"
                            style={{
                              background: isPaid ? "rgba(74,222,128,0.15)" : "rgba(245,158,11,0.15)",
                              color: isPaid ? "#4ade80" : "#fbbf24",
                              border: isPaid ? "1px solid rgba(74,222,128,0.25)" : "1px solid rgba(245,158,11,0.25)",
                            }}
                          >
                            {statusLabel}
                          </span>
                        </div>
                        <div className="glow-divider mb-4" />
                        <div className="space-y-2.5 mb-5">
                          <div className="flex justify-between text-sm">
                            <span style={{ color: "#9ca3af" }}>Billed To</span>
                            <span className="font-semibold text-gray-900">{payment.payer}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span style={{ color: "#9ca3af" }}>Type</span>
                            <span style={{ color: "#1f2937" }}>{description}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span style={{ color: "#9ca3af" }}>Event</span>
                            <span style={{ color: "#1f2937" }}>{payment.eventName}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-2" style={{ borderTop: "1px solid #e5e7eb" }}>
                            <span className="font-heading font-bold text-gray-900">Total</span>
                            <span
                              className="font-heading font-black text-xl"
                              style={
                                isPaid
                                  ? { background: "linear-gradient(90deg,#a78bfa,#ec4899,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }
                                  : { color: "#fbbf24" }
                              }
                            >
                              LKR {Number(payment.amount || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadInvoice(payment)}
                          className="w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-large transition-all"
                          style={{
                            background: isPaid ? "linear-gradient(135deg,#10b981,#059669)" : "#f3f4f6",
                            color: isPaid ? "#ffffff" : "#bfdbfe",
                            border: isPaid ? "1px solid #059669" : "1px solid #f3f4f6",
                            cursor: isPaid ? "pointer" : "not-allowed",
                            boxShadow: isPaid ? "0 4px 12px rgba(16,185,129,0.3)" : "none"
                          }}
                          disabled={!isPaid}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {isPaid ? "Download Invoice" : "Awaiting Payment"}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-large border border-dashed border-gray-200 p-8 text-center text-gray-500 md:col-span-2">
                      No sponsorship invoices found yet.
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Reports */}
            {activeSection === "reports" && (
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-heading font-bold text-gray-900 text-xl">Revenue Reports</h2>
                    <p className="text-sm" style={{ color: "#9ca3af" }}>
                      Financial summary for Tech Fest 2025
                    </p>
                  </div>
                  <button className="shimmer-btn flex items-center gap-2 text-gray-900 text-sm font-bold px-5 py-2.5 rounded-large">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Report
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="report-stat rounded-large p-5 text-center">
                    <p className="text-xs mb-1" style={{ color: "#9ca3af" }}>
                      Total Income
                    </p>
                    <p className="font-heading font-black text-gray-900 text-2xl">LKR 48,250</p>
                    <p className="text-xs text-green-400 mt-1">↑ 18% vs last event</p>
                  </div>
                  <div className="report-stat rounded-large p-5 text-center">
                    <p className="text-xs mb-1" style={{ color: "#9ca3af" }}>
                      Sponsorship
                    </p>
                    <p
                      className="font-heading font-black text-2xl"
                      style={{ background: "linear-gradient(90deg,#8b5cf6,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                    >
                      LKR 28,500
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#a1a5b8" }}>
                      11 sponsors
                    </p>
                  </div>
                  <div className="report-stat rounded-large p-5 text-center">
                    <p className="text-xs mb-1" style={{ color: "#9ca3af" }}>
                      Stall Revenue
                    </p>
                    <p
                      className="font-heading font-black text-2xl"
                      style={{ background: "linear-gradient(90deg,#f59e0b,#fcd34d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                    >
                      LKR 19,750
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#a1a5b8" }}>
                      43 stalls booked
                    </p>
                  </div>
                  <div className="report-stat rounded-large p-5 text-center">
                    <p className="text-xs mb-1" style={{ color: "#9ca3af" }}>
                      Outstanding
                    </p>
                    <p className="font-heading font-black text-2xl text-red-400"> 6,400</p>
                    <p className="text-xs mt-1" style={{ color: "#a1a5b8" }}>
                      7 payments pending
                    </p>
                  </div>
                </div>

                <div className="glass-card rounded-large p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-heading font-bold text-gray-900 text-base">Revenue by Sponsorship Package</h3>
                      <p className="text-xs" style={{ color: "#9ca3af" }}>
                        Gold, Silver, Bronze breakdown
                      </p>
                    </div>
                  </div>
                  <div className="h-64 overflow-hidden">
                      <canvas ref={packageChartRef} className="w-full h-full" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card rounded-large p-6">
                    <h3 className="font-heading font-bold text-gray-900 text-base mb-5">Stall Revenue by Zone</h3>
                    <div className="space-y-5">
                      {[{ label: "Premium Zone", value: 9600, pct: 49, colors: "linear-gradient(90deg,#8b5cf6,#a78bfa)" }, { label: "Standard Zone", value: 6750, pct: 34, colors: "linear-gradient(90deg,#f59e0b,#fcd34d)" }, { label: "Basic Zone", value: 3400, pct: 17, colors: "linear-gradient(90deg,#10b981,#34d399)" }].map((row) => (
                        <div key={row.label}>
                          <div className="flex justify-between text-sm mb-2">
                            <span style={{ color: "#6b7280" }}>{row.label}</span>
                            <span className="font-bold text-gray-900">
                              LKR {row.value.toLocaleString()} <span style={{ color: "#a1a5b8" }}>({row.pct}%)</span>
                            </span>
                          </div>
                          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#f3f4f6" }}>
                            <div className="progress-bar h-full rounded-full" style={{ width: `${row.pct}%`, background: row.colors }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card rounded-large p-6">
                    <h3 className="font-heading font-bold text-gray-900 text-base mb-5">Financial Summary</h3>
                    <div className="space-y-2">
                      {[
                        { label: "Gold Sponsorships (2)", value: 10000 },
                        { label: "Silver Sponsorships (3)", value: 7500 },
                        { label: "Bronze Sponsorships (6)", value: 6000 },
                        { label: "Premium Stalls (12)", value: 9600 },
                        { label: "Standard Stalls (15)", value: 6750 },
                        { label: "Basic Stalls (16)", value: 3400 },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2.5" style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <span className="text-sm" style={{ color: "#9ca3af" }}>
                            {row.label}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">LKR {row.value.toLocaleString()}</span>
                        </div>
                      ))}
                      <div
                        className="flex justify-between items-center py-3 px-4 mt-2 rounded-large"
                        style={{ background: "linear-gradient(90deg,rgba(139,92,246,0.2),rgba(236,72,153,0.15))", border: "1px solid rgba(139,92,246,0.3)" }}
                      >
                        <span className="font-heading font-black text-gray-900">Grand Total</span>
                        <span className="font-heading font-black text-xl gradient-text">LKR 43,250</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          <footer className="px-8 py-4" style={{ borderTop: "1px solid #e5e7eb" }}>
            <p className="text-xs text-center" style={{ color: "#bfdbfe" }}>
              EVENTAURA · University Event Management System · Component 4 – Sponsorship & Payment Management · Member 4
            </p>
          </footer>
        </main>

        {/* Edit Package Modal */}
        {showEditPackageModal && editingPackage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-large" onClick={() => setShowEditPackageModal(false)}>
            <div className="bg-white rounded-large p-6 w-96 max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-heading font-bold text-lg mb-4">Edit {editingPackage.name} Package Price</h3>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Price (LKR)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-large"
                  placeholder="Enter new price"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditPackageModal(false)}
                  className="flex-1 py-2 rounded-large border border-gray-300"
                  style={{ color: "#6b7280" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePackagePrice}
                  className="flex-1 py-2 rounded-large text-white"
                  style={{ background: "#7c3aed" }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {showPriceUpdateToast && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-large z-50">
            {editingPackage?.name} package price update successfully!
          </div>
        )}
      </div>
    </div>
  );
}
