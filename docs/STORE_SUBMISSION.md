# EVNuvora — Google Play Store Submission Package

**Application ID:** `com.EVNuvora.app`  
**Developer Name:** EVNuvora Technologies  
**Category:** Auto & Vehicles / Travel & Local  

---

## 1. Store Metadata & Copy

### App Title
**EVNuvora: EV Charging & Slots** *(30 characters)*

### Short Description
**Discover, reserve & pay for EV chargers across India. Fast DC, Type 2 & home sockets.** *(80 characters)*

### Full Description (Play Store Listing)
```markdown
EVNuvora is India’s community-driven EV charging discovery, reservation, and sharing network. Charge kar, tension chhod!

Whether you ride an electric 2-wheeler, drive a Tata Nexon EV, MG ZS EV, Mahindra XUV400, or a commercial fleet, EVNuvora helps you find verified charging spots near you in real time with zero anxiety.

⚡ KEY FEATURES FOR EV DRIVERS:
• Instant Nearby Discovery: Find compatible chargers using live PostGIS radar maps across Bengaluru, Delhi NCR, Mumbai, Hyderabad, Pune, Chennai, and national highways.
• Multi-Standard Connectors: Search and filter by CCS2 (DC Fast), Type 2 (AC), 15A Indian domestic socket, IEC 60309, and CHAdeMO.
• Guaranteed Slot Reservation: Reserve your charging slot in advance. Our smart collision-prevention engine guarantees no double-booking or waiting in long queues.
• Transparent Paise-Level Pricing: View exact rates per kWh without hidden surcharges or surprise bills.
• One-Tap GPS Navigation: Launch turn-by-turn routes directly in Google Maps.
• UPI & Instant Payments: Pay smoothly using Razorpay, Google Pay, PhonePe, Paytm, BHIM UPI, credit/debit cards, and netbanking.

🏡 FOR CHARGER HOSTS:
• Monetize Your Socket: Turn your home 15A socket, wall box, or commercial parking lot into an income generator.
• Control Your Availability: Set operating hours, toggle live availability, and manage slot requests seamlessly.
• Privacy Shield: Your residential address remains confidential and is only unlocked to drivers with confirmed bookings.

Join India's electric mobility revolution with EVNuvora!
```

---

## 2. Google Play Data Safety Form Responses

| Category | Data Type | Collected? | Shared? | Purpose | Ephemeral? |
|---|---|---|---|---|---|
| **Location** | Approximate location | Yes | No | App functionality, Charger Discovery | No |
| **Location** | Precise location | Yes | No | App functionality, Distance & Maps | No |
| **Personal Info** | Name, Email, Phone | Yes | No | Account management, Booking confirmations | No |
| **Financial Info** | Payment history / Order IDs | Yes | Shared (Razorpay) | Payment processing, Invoices | No |
| **App Info** | Crash logs, Diagnostics | Optional | No | Analytics & Bug fixes | No |

- **Security Practices**:
  - Data encrypted in transit via standard HTTPS / TLS 1.3.
  - Data encrypted at rest in managed PostgreSQL.
  - User can request data deletion directly from support or account settings.

---

## 3. Content Rating Questionnaire Guidance

- **Violence, Blood, or Gore**: No
- **Sexuality or Nudity**: No
- **Profanity or Crude Humor**: No
- **Controlled Substances**: No
- **Location Sharing**: Yes (Shows user relative distance to nearby charging stations)
- **Digital Purchases**: Yes (Digital slot booking and electricity charging fee payment)
- **Target Age Group**: Ages 18 and older (Driver license holders)

**Expected Rating:** PEGI 3 / Everyone

---

## 4. Contact & Support Details

- **Support Email:** `support@evnuvora.in`
- **Phone:** `+91 98765 43210`
- **Privacy Policy URL:** `https://evnuvora.in/privacy` (Point to hosted docs or GitHub Pages)
