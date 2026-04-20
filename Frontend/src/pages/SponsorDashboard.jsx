import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./SponsorDashboard.css";

export default function SponsorDashboard() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("SponsorDashboard component loaded with requestId:", requestId);
    
    const fetchRequestData = async () => {
      try {
        console.log("Fetching request data from:", `http://127.0.0.1:5001/api/sponsor-requests/${requestId}`);
        
        const response = await fetch(`http://127.0.0.1:5001/api/sponsor-requests/${requestId}`, {
          headers: {
            "x-dev-role": "sponsor",
          },
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error("Failed to load sponsorship details");
        }

        const data = await response.json();
        console.log("Request data received:", data);
        setRequestData(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchRequestData();
    }
  }, [requestId]);

  const getPackageDetails = (packageName) => {
    const packages = {
      Gold: {
        name: "Gold Package",
        price: "LKR 200,000",
        icon: "✨",
        benefits: [
          "Main stage banner placement",
          "Logo on all event materials & social media",
          "VIP booth in the Premium Zone",
          "MC mention during the event",
          "Exclusive networking sessions",
        ],
      },
      Silver: {
        name: "Silver Package",
        price: "LKR 100,000",
        icon: "🌟",
        benefits: [
          "Side banner placement on main concourse",
          "Logo on the official event poster",
          "Standard booth in the exhibition area",
          "Two social media shoutouts",
        ],
      },
      Bronze: {
        name: "Bronze Package",
        price: "LKR 50,000",
        icon: "⭐",
        benefits: [
          "Logo on the event website",
          "Basic booth placement",
          "One social media mention",
        ],
      },
    };

    return packages[packageName] || packages.Gold;
  };

  if (loading) {
    return (
      <div className="sponsor-dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading sponsorship details...</p>
        </div>
      </div>
    );
  }

  if (error || !requestData) {
    return (
      <div className="sponsor-dashboard-container">
        <div className="error-state">
          <h2>Error Loading Sponsorship Details</h2>
          <p>{error || "Sponsorship details not found"}</p>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "10px" }}>
            Request ID: {requestId}
          </p>
          <button 
            onClick={() => navigate("/")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#8b5cf6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            ← Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const packageDetails = getPackageDetails(requestData.packageName);

  return (
    <div className="sponsor-dashboard-container">
      {/* Sidebar */}
      <aside className="sponsor-sidebar">
        <div className="sidebar-logo">
          <div className="logo-circle">EA</div>
          <div>
            <h3>EVENTAURA</h3>
            <p>Sponsor</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h4>SPONSORSHIP</h4>
            <a href="#" className="nav-item active">
              <span>📊</span> Dashboard
            </a>
            <a href="#" className="nav-item">
              <span>📋</span> Details
            </a>
          </div>

          <div className="nav-section">
            <h4>PAYMENT</h4>
            <a href="#" className="nav-item">
              <span>💳</span> Payment
            </a>
            <a href="#" className="nav-item">
              <span>📄</span> Invoice
            </a>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="sponsor-main">
        {/* Top Header */}
        <header className="sponsor-top-header">
          <div className="header-left">
            <h1>Sponsorship Dashboard</h1>
            <p>Welcome Back • Sponsorship Details</p>
          </div>
          <div className="header-right">
            <button className="live-btn">🟢 Live</button>
            <button className="notify-btn">🔔</button>
          </div>
        </header>

        {/* Welcome Banner */}
        <section className="welcome-banner">
          <div className="banner-content">
            <h2>Welcome to EVENTAURA 👋</h2>
            <h3>Sponsor Portal</h3>
            <p>{requestData.eventName} • Your Sponsorship Journey</p>
          </div>
          <div className="banner-stats">
            <div className="stat">
              <div className="stat-value">✓</div>
              <div className="stat-label">Status: Accepted</div>
            </div>
            <div className="stat">
              <div className="stat-value">{packageDetails.icon}</div>
              <div className="stat-label">{packageDetails.name}</div>
            </div>
            <div className="stat">
              <div className="stat-value">📅</div>
              <div className="stat-label">15–16 Aug 2025</div>
            </div>
          </div>
        </section>

        {/* Sponsorship Details Cards */}
        <section className="details-section">
          <h2 className="section-title">Sponsorship Details</h2>
          <div className="details-cards-grid">
            <div className="detail-card">
              <div className="card-icon">🏢</div>
              <div className="card-content">
                <h4>Company</h4>
                <p>{requestData.companyName}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="card-icon">📧</div>
              <div className="card-content">
                <h4>Contact Email</h4>
                <p>{requestData.email}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="card-icon">🎁</div>
              <div className="card-content">
                <h4>Package Type</h4>
                <p>{packageDetails.name}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h4>Investment</h4>
                <p>{packageDetails.price}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Package Benefits */}
        <section className="benefits-section">
          <div className="section-header-flex">
            <h2 className="section-title">Package Benefits</h2>
            <span className="package-badge">{packageDetails.name}</span>
          </div>
          <div className="benefits-grid">
            {packageDetails.benefits.map((benefit, idx) => (
              <div key={idx} className="benefit-card">
                <div className="benefit-icon">✓</div>
                <p>{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Event Information */}
        <section className="event-section">
          <h2 className="section-title">Event Information</h2>
          <div className="event-cards-grid">
            <div className="event-card">
              <h4>📅 Event Name</h4>
              <p>{requestData.eventName}</p>
            </div>

            <div className="event-card">
              <h4>🕐 Date & Time</h4>
              <p>15–16 August 2025</p>
            </div>

            <div className="event-card">
              <h4>👥 Expected Attendance</h4>
              <p>2,000+ participants</p>
            </div>

            <div className="event-card">
              <h4>📍 Venue</h4>
              <p>Universiti Teknologi Malaysia</p>
            </div>
          </div>
        </section>

        {/* Payment Section */}
        <section className="payment-section">
          <h2 className="section-title">Payment Information</h2>
          <div className="payment-card">
            <div className="payment-details">
              <div className="payment-row">
                <span>Package</span>
                <strong>{packageDetails.name}</strong>
              </div>
              <div className="payment-row">
                <span>Amount</span>
                <strong className="amount">{packageDetails.price}</strong>
              </div>
              <div className="payment-row">
                <span>Status</span>
                <strong className="status-pending">Pending</strong>
              </div>
            </div>

            <div className="payment-steps">
              <h4>Next Steps:</h4>
              <ol>
                <li>Review your sponsorship benefits</li>
                <li>Invoice will be sent to your email</li>
                <li>Complete payment through the invoice link</li>
                <li>Receive confirmation once processed</li>
              </ol>
            </div>

            <button className="payment-btn">💳 Proceed to Payment</button>
          </div>
        </section>

        {/* Contact Support */}
        <section className="contact-section">
          <h2 className="section-title">Need Help?</h2>
          <div className="contact-card">
            <p>For any questions about your sponsorship, reach out to our team:</p>
            <div className="contact-details">
              <div>
                <strong>Email:</strong>
                <a href="mailto:sponsor@eventaura.com">sponsor@eventaura.com</a>
              </div>
              <div>
                <strong>Phone:</strong>
                <a href="tel:+94112345678">+94-11-2345-678</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
