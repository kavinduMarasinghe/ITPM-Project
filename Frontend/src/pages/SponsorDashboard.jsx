import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./SponsorDashboard.css";

export default function SponsorDashboard() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [cardType, setCardType] = useState("visa");
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvn, setCvn] = useState("");

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
        color: "#d97706",
        bgColor: "#fef3c7",
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
        color: "#6b7280",
        bgColor: "#f3f4f6",
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
        color: "#d97706",
        bgColor: "#fed7aa",
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

  // Payment Dashboard View
  if (showPayment) {
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
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setShowPayment(false);
                }}
                className="nav-item"
              >
                <span>📊</span> Dashboard
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setShowPayment(false);
                  setShowDetails(true);
                }}
                className="nav-item"
              >
                <span>📋</span> Details
              </a>
            </div>

            <div className="nav-section">
              <h4>PAYMENT</h4>
              <a href="#" className="nav-item active">
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
              <h1>Payment Information</h1>
              <p>Manage your payment details</p>
            </div>
            <div className="header-right">
              <button className="live-btn">🟢 Live</button>
              <button className="notify-btn">🔔</button>
            </div>
          </header>

          {/* Payment Section */}
          <section className="payment-section">
            <div className="payment-card">
              <div className="payment-details">
                <div className="payment-row">
                  <span>Package</span>
                  <strong>{getPackageDetails(selectedPackage || requestData.packageName).name}</strong>
                </div>
                <div className="payment-row">
                  <span>Amount</span>
                  <strong className="amount">{getPackageDetails(selectedPackage || requestData.packageName).price}</strong>
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

              <button className="payment-btn" onClick={() => setShowPaymentGateway(true)}>💳 Proceed to Payment</button>
            </div>
          </section>

          {/* Payment Gateway Modal */}
          {showPaymentGateway && (
            <div style={{
              position: "fixed",
              top: "0",
              left: "0",
              right: "0",
              bottom: "0",
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: "3000"
            }}>
              <div style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "40px",
                maxWidth: "500px",
                width: "90%",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
              }}>
                <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "10px", color: "#1f2937" }}>Payment Details 🔒</h2>
                <p style={{ color: "#9ca3af", marginBottom: "25px", fontSize: "14px" }}>* Required field</p>

                {/* Card Type Selection */}
                <div style={{ marginBottom: "25px" }}>
                  <label style={{ display: "block", fontSize: "15px", fontWeight: "700", color: "#1f2937", marginBottom: "12px" }}>Card Type *</label>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                      <input 
                        type="radio" 
                        name="cardType" 
                        value="visa"
                        checked={cardType === "visa"}
                        onChange={(e) => setCardType(e.target.value)}
                      />
                      <span style={{ fontWeight: "600", color: "#1f2937" }}>💳 VISA</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                      <input 
                        type="radio" 
                        name="cardType" 
                        value="mastercard"
                        checked={cardType === "mastercard"}
                        onChange={(e) => setCardType(e.target.value)}
                      />
                      <span style={{ fontWeight: "600", color: "#1f2937" }}>💳 Mastercard</span>
                    </label>
                  </div>
                </div>

                {/* Card Number */}
                <div style={{ marginBottom: "25px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>Card Number *</label>
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1.5px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Expiration and CVN */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "25px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>Expiration Month *</label>
                    <select 
                      value={expMonth}
                      onChange={(e) => setExpMonth(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1.5px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px"
                      }}
                    >
                      <option value="">Month</option>
                      <option value="01">01</option>
                      <option value="02">02</option>
                      <option value="03">03</option>
                      <option value="04">04</option>
                      <option value="05">05</option>
                      <option value="06">06</option>
                      <option value="07">07</option>
                      <option value="08">08</option>
                      <option value="09">09</option>
                      <option value="10">10</option>
                      <option value="11">11</option>
                      <option value="12">12</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>Expiration Year *</label>
                    <select 
                      value={expYear}
                      onChange={(e) => setExpYear(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1.5px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px"
                      }}
                    >
                      <option value="">Year</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                      <option value="2029">2029</option>
                      <option value="2030">2030</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>CVN *</label>
                    <input 
                      type="text" 
                      placeholder="123"
                      maxLength="4"
                      value={cvn}
                      onChange={(e) => setCvn(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1.5px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>

                {/* Your Order Section */}
                <div style={{ borderTop: "1.5px solid #e5e7eb", paddingTop: "20px", marginBottom: "25px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1f2937", marginBottom: "15px" }}>Your Order</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "15px", borderBottom: "1px solid #e5e7eb" }}>
                    <span style={{ color: "#6b7280", fontWeight: "600" }}>Total amount</span>
                    <span style={{ fontSize: "20px", fontWeight: "700", color: "#d97706" }}>
                      {getPackageDetails(selectedPackage || requestData.packageName).price}
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => setShowPaymentGateway(false)}
                    style={{
                      flex: "1",
                      padding: "12px 20px",
                      border: "1.5px solid #d1d5db",
                      background: "#ffffff",
                      color: "#6b7280",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "all 0.3s ease"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert("Payment processed successfully!");
                      setShowPaymentGateway(false);
                    }}
                    style={{
                      flex: "1",
                      padding: "12px 20px",
                      border: "none",
                      background: "#0ea5e9",
                      color: "#ffffff",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "all 0.3s ease"
                    }}
                  >
                    Pay
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Details Dashboard View
  if (showDetails) {
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
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setShowDetails(false);
                }}
                className="nav-item"
              >
                <span>📊</span> Dashboard
              </a>
              <a href="#" className="nav-item active">
                <span>📋</span> Details
              </a>
            </div>

            <div className="nav-section">
              <h4>PAYMENT</h4>
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowDetails(false);
                  setShowPayment(true);
                }}
                className="nav-item"
              >
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
              <h1>Sponsorship Details</h1>
              <p>Package benefits and event information</p>
            </div>
            <div className="header-right">
              <button className="live-btn">🟢 Live</button>
              <button className="notify-btn">🔔</button>
            </div>
          </header>

          {/* Package Benefits */}
          <section className="benefits-section">
            <div className="section-header-flex">
              <h2 className="section-title">Package Benefits</h2>
            </div>
            <div className="benefits-grid">
              {getPackageDetails(selectedPackage || requestData.packageName).benefits.map((benefit, idx) => (
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
        </main>
      </div>
    );
  }

  // Main Dashboard View
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
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setShowDetails(true);
              }}
              className="nav-item"
            >
              <span>📋</span> Details
            </a>
          </div>

          <div className="nav-section">
            <h4>PAYMENT</h4>
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowPayment(true);
              }}
              className="nav-item"
            >
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
          </div>
        </section>

        {/* Sponsorship Packages Selection */}
        <section className="packages-section" style={{ marginTop: "40px" }}>
          <h2 className="section-title">Sponsorship Packages</h2>
          <p style={{ color: "#9ca3af", marginBottom: "30px" }}>Select the package that best fits your sponsorship goals</p>
          
          <div className="packages-grid">
            {["Gold", "Silver", "Bronze"].map((packageType) => {
              const pkg = getPackageDetails(packageType);
              const isSelected = selectedPackage === packageType;
              
              return (
                <div 
                  key={packageType}
                  className="package-card"
                  onClick={() => setSelectedPackage(packageType)}
                  style={{
                    border: isSelected ? `2.5px solid ${pkg.color}` : "1.5px solid #e5e7eb",
                    background: isSelected ? pkg.bgColor : "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: isSelected ? `0 4px 20px rgba(${pkg.color}, 0.2)` : "0 1px 3px rgba(0,0,0,0.1)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                    <div>
                      <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937", margin: "0 0 8px 0" }}>{packageType}</h3>
                      <p style={{ fontSize: "24px", fontWeight: "800", color: pkg.color, margin: "0 0 3px 0" }}>{pkg.price}</p>
                      <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0" }}>Per event sponsorship</p>
                    </div>
                    <div style={{ fontSize: "24px" }}>{pkg.icon}</div>
                  </div>
                  
                  <div style={{ borderTop: `1.5px solid ${pkg.color}40`, paddingTop: "15px" }}>
                    {pkg.benefits.map((benefit, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>✓</span>
                        <p style={{ margin: "0", fontSize: "13px", color: "#1f2937", lineHeight: "1.4" }}>{benefit}</p>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    style={{
                      width: "100%",
                      marginTop: "15px",
                      padding: "10px 16px",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      background: isSelected ? pkg.color : "#f3f4f6",
                      color: isSelected ? "#ffffff" : pkg.color,
                    }}
                    onClick={() => setSelectedPackage(packageType)}
                  >
                    {isSelected ? "✓ Selected" : "Select Package"}
                  </button>
                </div>
              );
            })}
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
