# EVNuvora — Privacy Policy

*Last updated: October 30, 2026*

EVNuvora ("we," "our," or "us") provides India's EV charging discovery and community socket sharing platform. This Privacy Policy details how we collect, handle, protect, and process user data across our mobile applications, web portals, and API services.

---

## 1. Information We Collect

### A. Location Information (Mandatory for Core Services)
- **Precise and Approximate Geolocation**: We collect background and foreground location data to:
  - Locate compatible EV chargers, private host sockets, and commercial fast-chargers near your current coordinates.
  - Calculate real-time geodetic distances ($km$) via PostGIS and provide turn-by-turn navigation handoff to Google Maps or Apple Maps.
- **Privacy Shield for Residential Hosts**: Private and shared residential charger addresses are masked behind an approximate neighborhood radius (~500m) to non-booking drivers. The exact physical street address is only unlocked and transmitted once a driver confirms a reservation.

### B. Account & Identity Information
- **Registration**: Name, email address, and optional phone number.
- **EV Specifications**: Vehicle make, model, year, battery capacity ($kWh$), range ($km$), and compatible Indian EV connectors (e.g. CCS2, Type 2, 15A Socket, CHAdeMO).
- **Authentication**: Passwords are saved strictly as salted cryptographic hashes (`bcrypt` 10 rounds). We never store raw passwords. Session management relies on rotating SHA-256 hashed refresh tokens.

### C. Payment & Financial Data
- **Transaction Processing**: Payments are handled securely through **Razorpay** and UPI standard rails.
- **Card and UPI Details**: All credit/debit card numbers and UPI PINs are processed directly by RBI-authorized payment aggregators under PCI-DSS Level 1 compliance. EVNuvora never stores or views raw card numbers, CVVs, or bank secrets. We only retain payment order IDs, transaction statuses, and capture timestamps for receipt generation.

---

## 2. Permissions We Request

| Android Permission | Purpose |
|---|---|
| `ACCESS_FINE_LOCATION` | Detect accurate GPS coordinates to show nearby EV charging hubs. |
| `ACCESS_COARSE_LOCATION` | Approximate city/locality estimation when low accuracy mode is enabled. |
| `INTERNET` | Secure HTTPS communication with the EVNuvora API backend. |

---

## 3. Data Safety & Third-Party Services

We do not sell, rent, or trade your personal data to advertisers. Information is only exchanged with essential operational infrastructure:
- **Cloud Infrastructure**: Render & Neon PostgreSQL (AWS US-East & PostGIS storage with encrypted data at rest).
- **Payment Rails**: Razorpay Software Private Limited (PCI-DSS compliant UPI & card settlement).
- **Navigation**: Native device map intents (Google Maps / Apple Maps).

---

## 4. User Rights & Data Deletion

You have full control over your data. You may request account deletion and profile purge at any time by contacting our Data Protection Officer at `support@evnuvora.in` or navigating to **Profile → Delete Account** in the mobile app. All associated vehicle profiles, tokens, and personal identifying records will be purged within 7 business days.

---

## 5. Contact Information

**EVNuvora Mobility Private Limited**  
Email: `support@evnuvora.in` / `compliance@evnuvora.in`  
Grievance Officer: Aayush Kanani  
Bengaluru, Karnataka, India
