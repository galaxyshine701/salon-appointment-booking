/**
 * Atelier Beauté Lounge — Core Application Logic
 * Pure Vanilla JavaScript (No frameworks, no build tools, zero dependencies)
 */

// ==========================================================================
// 1. Single Source of Truth: Services
// ==========================================================================
const SERVICES = [
  {
    id: "haircut",
    name: "Haircut & Styling",
    duration: "45 mins",
    price: 3500.00,
    image: "assets/images/haircut.jpg",
    alt: "Professional hair stylist precision trimming and combing client's hair with gold shears",
    description: "Precision haircut, luxury wash, blowout, and personalized styling."
  },
  {
    id: "hair-color",
    name: "Hair Coloring/Highlights",
    duration: "120 mins",
    price: 9500.00,
    image: "assets/images/hair-color.jpg",
    alt: "Hair colorist applying blonde balayage highlights with foil in a luxury salon",
    description: "Full color, dimensional highlights, or balayage with conditioning gloss."
  },
  {
    id: "facial",
    name: "Facial",
    duration: "60 mins",
    price: 4500.00,
    image: "assets/images/facial.jpg",
    alt: "Esthetician applying restorative organic face mask with a brush during a relaxing facial treatment",
    description: "Deep ultrasonic cleansing, botanical exfoliation, and soothing face massage."
  },
  {
    id: "manicure",
    name: "Manicure & Pedicure",
    duration: "75 mins",
    price: 4000.00,
    image: "assets/images/manicure.jpg",
    alt: "Manicurist delicately applying soft pink polish to client's manicured fingernails",
    description: "Luxury nail shaping, cuticle therapy, sea-salt scrub, and salon polish."
  },
  {
    id: "bridal-makeup",
    name: "Bridal Makeup",
    duration: "150 mins",
    price: 25000.00,
    image: "assets/images/bridal-makeup.jpg",
    alt: "Flawless traditional bridal makeup with intricate jewelry, red lehenga, and bold crimson lips",
    description: "Flawless HD bridal transformation, bespoke contouring, and premium lashes."
  },
  {
    id: "party-makeup",
    name: "Party Makeup",
    duration: "90 mins",
    price: 8000.00,
    image: "assets/images/party-makeup.jpg",
    alt: "Glamorous evening party makeup with warm shimmer eyeshadow, defined eyeliner, and elegant jhumka earrings",
    description: "Glamorous party and gala looks designed to radiate under evening lights."
  },
  {
    id: "threading",
    name: "Threading & Waxing",
    duration: "30 mins",
    price: 1500.00,
    image: "assets/images/threading.jpg",
    alt: "Professional threading spool, scissors, wax warmer, and spatulas arranged neatly on marble counter",
    description: "Artful brow shaping, facial threading, and gentle organic waxing."
  }
];

const STORAGE_KEY = "salon_appointments";

// State
let appointments = [];

// Expose state and single source of truth for browser console inspection & testing
if (typeof window !== "undefined") {
  window.SERVICES = SERVICES;
  window.getAppointments = () => appointments;
  window.setAppointments = (newAppointments) => { appointments = newAppointments; };
}

// ==========================================================================
// 2. Helpers & Utilities
// ==========================================================================

/**
 * Format price as PKR with 2 decimal places (e.g. PKR 1500.00)
 */
function formatPrice(amount) {
  return `PKR ${Number(amount).toFixed(2)}`;
}

/**
 * Compute local date string in YYYY-MM-DD format without UTC shifts
 */
function getLocalTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Basic permissive phone validation (digits, optional +, spaces, dashes, parentheses)
 * Ensures a sensible length between 7 and 15 digits without country-specific restrictions.
 */
function isValidPhone(phone) {
  const trimmed = phone.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');
  const pattern = /^[+]?[\d\s\-()]{7,20}$/;
  return pattern.test(trimmed) && digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

/**
 * Escape HTML to prevent XSS injection
 */
function sanitizeText(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==========================================================================
// 3. Storage Synchronization
// ==========================================================================

function loadAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    appointments = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(appointments)) {
      appointments = [];
    }
  } catch (error) {
    console.error("Failed to read appointments from localStorage:", error);
    appointments = [];
  }
}

function saveAppointments() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  } catch (error) {
    console.error("Failed to persist appointments to localStorage:", error);
  }
}

// ==========================================================================
// 4. DOM Rendering
// ==========================================================================

/**
 * Populate the 7 services into the #services-grid
 */
function renderServices() {
  const container = document.getElementById("services-grid");
  if (!container) return;

  const sHaircut = SERVICES.find(s => s.id === "haircut");
  const sColor = SERVICES.find(s => s.id === "hair-color");
  const sFacial = SERVICES.find(s => s.id === "facial");
  const sMani = SERVICES.find(s => s.id === "manicure");
  const sThreading = SERVICES.find(s => s.id === "threading");
  const sBridal = SERVICES.find(s => s.id === "bridal-makeup");
  const sParty = SERVICES.find(s => s.id === "party-makeup");

  if (!sHaircut || !sColor || !sFacial || !sMani || !sThreading || !sBridal || !sParty) {
    return;
  }

  function renderImage(service, extraClass = "") {
    return `
      <div class="service-image-wrap ${extraClass}">
        <img 
          src="${service.image}" 
          alt="${sanitizeText(service.alt || service.name)}" 
          class="service-image" 
          width="1200" 
          height="900" 
          loading="lazy" 
          onerror="this.onerror=null; this.parentElement.classList.add('img-fallback'); this.style.display='none'; this.insertAdjacentHTML('afterend', '<div class=\\'fallback-placeholder-badge\\'><span>✦</span> ${sanitizeText(service.name)}</div>');"
        >
        <span class="service-duration-badge">
          <!-- Inline Clock SVG -->
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          ${sanitizeText(service.duration)}
        </span>
      </div>
    `;
  }

  function renderActions(service, isPrimary = false) {
    return `
      <div class="editorial-action-row">
        <div class="service-price-block">
          <span class="service-price-label">Price</span>
          <span class="service-price-val">${formatPrice(service.price)}</span>
        </div>
        <button 
          type="button" 
          class="btn ${isPrimary ? 'btn-primary' : 'btn-secondary'} btn-card-book" 
          data-select-service="${service.id}"
          aria-label="Book ${sanitizeText(service.name)}"
        >
          Book This Service
        </button>
      </div>
    `;
  }

  container.innerHTML = `
    <!-- CHAPTER 1: Haircut & Styling (Architectural Wide Split) -->
    <article class="editorial-service editorial-service--haircut" data-service-id="${sHaircut.id}">
      <div class="editorial-split-wrap">
        <div class="editorial-media-col">
          ${renderImage(sHaircut)}
        </div>
        <div class="editorial-content-col">
          <div class="editorial-header">
            <span class="service-number" aria-hidden="true">01</span>
            <span class="service-eyebrow">Artisanal Haircraft</span>
          </div>
          <h3 class="service-title">${sanitizeText(sHaircut.name)}</h3>
          <div class="gold-hairline" aria-hidden="true"></div>
          <p class="service-desc">${sanitizeText(sHaircut.description)}</p>
          ${renderActions(sHaircut)}
        </div>
      </div>
    </article>

    <!-- CHAPTER 2: Hair Coloring/Highlights (Reverse Layered Offset) -->
    <article class="editorial-service editorial-service--color" data-service-id="${sColor.id}">
      <div class="editorial-offset-wrap">
        <div class="editorial-offset-content">
          <div class="editorial-header">
            <span class="service-number" aria-hidden="true">02</span>
            <span class="service-eyebrow">Dimensional Tone</span>
          </div>
          <h3 class="service-title">${sanitizeText(sColor.name)}</h3>
          <div class="gold-hairline" aria-hidden="true"></div>
          <p class="service-desc">${sanitizeText(sColor.description)}</p>
          ${renderActions(sColor)}
        </div>
        <div class="editorial-offset-media">
          ${renderImage(sColor)}
        </div>
      </div>
    </article>

    <!-- CHAPTER 3: Facial (Calm Spa Sanctuary Feature) -->
    <article class="editorial-service editorial-service--facial" data-service-id="${sFacial.id}">
      <div class="spa-sanctuary-wrap">
        <div class="spa-media-arch">
          ${renderImage(sFacial)}
        </div>
        <div class="spa-content-sanctum">
          <div class="editorial-header">
            <span class="service-number" aria-hidden="true">03</span>
            <span class="service-tag-badge service-tag--spa">✦ Tranquil Holistic Sanctuary</span>
          </div>
          <h3 class="service-title spa-title">${sanitizeText(sFacial.name)}</h3>
          <p class="service-desc">${sanitizeText(sFacial.description)}</p>
          <blockquote class="spa-poetic-quote">
            "A serene pause of ultrasonic botanicals, restoring radiant calm to stressed complexions."
          </blockquote>
          ${renderActions(sFacial)}
        </div>
      </div>
    </article>

    <!-- CHAPTER 4: Manicure & Pedicure (Slender Horizontal Feature Strip) -->
    <article class="editorial-service editorial-service--manicure" data-service-id="${sMani.id}">
      <div class="horizontal-strip-wrap">
        <div class="strip-media">
          ${renderImage(sMani)}
        </div>
        <div class="strip-content">
          <div class="editorial-header">
            <span class="service-number" aria-hidden="true">04</span>
            <span class="service-eyebrow">Nail Architecture & Care</span>
          </div>
          <h3 class="service-title">${sanitizeText(sMani.name)}</h3>
          <p class="service-desc">${sanitizeText(sMani.description)}</p>
          ${renderActions(sMani)}
        </div>
      </div>
    </article>

    <!-- CHAPTER 5: Threading & Waxing (Minimalist Precision Presentation) -->
    <article class="editorial-service editorial-service--threading" data-service-id="${sThreading.id}">
      <div class="minimal-precision-wrap">
        <div class="precision-text-col">
          <div class="editorial-header">
            <span class="service-number" aria-hidden="true">05</span>
            <span class="service-eyebrow">Precision Finishing</span>
          </div>
          <h3 class="service-title">${sanitizeText(sThreading.name)}</h3>
          <p class="service-desc">${sanitizeText(sThreading.description)}</p>
          ${renderActions(sThreading)}
        </div>
        <div class="precision-divider-col" aria-hidden="true">
          <div class="vertical-gold-line"></div>
        </div>
        <div class="precision-media-col">
          ${renderImage(sThreading)}
        </div>
      </div>
    </article>

    <!-- CHAPTER 6: Bridal Makeup (Large Cinematic Royal Showcase) -->
    <article class="editorial-service editorial-service--bridal" data-service-id="${sBridal.id}">
      <div class="cinematic-showcase-wrap">
        <div class="bridal-media-showcase">
          ${renderImage(sBridal)}
        </div>
        <div class="bridal-floating-panel">
          <div class="bridal-badge-row">
            <span class="service-number bridal-number" aria-hidden="true">06</span>
            <span class="service-tag-badge service-tag--couture">✦ Haute Couture Bridal Atelier</span>
          </div>
          <h3 class="service-title bridal-grand-title">${sanitizeText(sBridal.name)}</h3>
          <div class="gold-hairline" aria-hidden="true"></div>
          <p class="service-desc bridal-grand-desc">${sanitizeText(sBridal.description)}</p>
          <div class="bridal-signature-perks">
            <span class="bridal-perk-item">HD Airbrush Setting</span>
            <span class="bridal-perk-sep">✦</span>
            <span class="bridal-perk-item">Crown & Veil Setting</span>
            <span class="bridal-perk-sep">✦</span>
            <span class="bridal-perk-item">Signature Lash Couture</span>
          </div>
          ${renderActions(sBridal, true)}
        </div>
      </div>
    </article>

    <!-- CHAPTER 7: Party Makeup (Glamorous Fashion Soirée Showcase) -->
    <article class="editorial-service editorial-service--party" data-service-id="${sParty.id}">
      <div class="fashion-glam-wrap">
        <div class="fashion-media-col">
          ${renderImage(sParty)}
        </div>
        <div class="fashion-content-col">
          <div class="editorial-header">
            <span class="service-number" aria-hidden="true">07</span>
            <span class="service-tag-badge service-tag--glam">✦ Evening Soirée Artistry</span>
          </div>
          <h3 class="service-title fashion-title">${sanitizeText(sParty.name)}</h3>
          <p class="service-desc">${sanitizeText(sParty.description)}</p>
          <div class="fashion-accent-quote">
            "Tailored for evening galas, red carpets, and camera-ready celebration."
          </div>
          ${renderActions(sParty, false)}
        </div>
      </div>
    </article>
  `;

  // Attach quick-book event handlers to cards
  container.querySelectorAll("[data-select-service]").forEach(btn => {
    btn.addEventListener("click", () => {
      const serviceId = btn.getAttribute("data-select-service");
      quickSelectService(serviceId);
    });
  });
}

/**
 * Populate <select> dropdown dynamically strictly from SERVICES array
 */
function populateServiceDropdown() {
  const select = document.getElementById("service-select");
  if (!select) return;

  // Clear existing options
  select.innerHTML = "";

  // Initial disabled placeholder
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "— Select a Salon Service —";
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  select.appendChild(placeholderOption);

  // Dynamic options from SERVICES array
  SERVICES.forEach(service => {
    const opt = document.createElement("option");
    opt.value = service.id;
    opt.textContent = `${service.name} (${service.duration} — ${formatPrice(service.price)})`;
    select.appendChild(opt);
  });
}

/**
 * Set the minimum date attribute of #booking-date to the user's LOCAL current date
 */
function setMinBookingDate() {
  const dateInput = document.getElementById("booking-date");
  if (!dateInput) return;

  const todayStr = getLocalTodayDateString();
  dateInput.min = todayStr;
}

/**
 * Update the dynamic count badge ("X appointments booked")
 */
function updateAppointmentCount() {
  const count = appointments.length;
  const label = count === 1 ? "1 appointment booked" : `${count} appointments booked`;

  const badge = document.getElementById("appointment-count");
  if (badge) {
    badge.textContent = label;
  }

  const navBadge = document.getElementById("nav-count-badge");
  if (navBadge) {
    navBadge.textContent = count;
  }
}

/**
 * Render the list of appointments or show the empty state
 */
function renderAppointments() {
  const list = document.getElementById("appointments-list");
  const emptyState = document.getElementById("empty-state");
  if (!list || !emptyState) return;

  if (appointments.length === 0) {
    emptyState.style.display = "block";
    list.innerHTML = "";
    return;
  }

  emptyState.style.display = "none";

  list.innerHTML = appointments.map(apt => `
    <article class="appointment-card" data-appointment-id="${apt.id}">
      <div class="appointment-card-body">
        <div class="appointment-info-header">
          <h3 class="appointment-client-name">${sanitizeText(apt.customerName)}</h3>
          <span class="appointment-service-name">${sanitizeText(apt.serviceName)}</span>
        </div>

        <div class="appointment-details-grid">
          <div class="appointment-detail-item">
            <!-- Calendar SVG -->
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Date: <strong>${sanitizeText(apt.date)}</strong></span>
          </div>

          <div class="appointment-detail-item">
            <!-- Clock SVG -->
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Time: <strong>${sanitizeText(apt.time)}</strong></span>
          </div>

          <div class="appointment-detail-item">
            <!-- Phone SVG -->
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>Phone: <strong>${sanitizeText(apt.phone)}</strong></span>
          </div>
        </div>
      </div>

      <div class="appointment-card-actions">
        <button 
          type="button" 
          class="btn btn-cancel" 
          data-cancel-id="${apt.id}"
          aria-label="Cancel appointment for ${sanitizeText(apt.customerName)}"
        >
          <!-- Trash SVG -->
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          Cancel Appointment
        </button>
      </div>
    </article>
  `).join("");

  // Attach cancel listeners
  list.querySelectorAll("[data-cancel-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-cancel-id");
      cancelAppointment(id);
    });
  });
}

// ==========================================================================
// 5. Booking & Cancellation Interactions
// ==========================================================================

/**
 * Handle quick booking trigger from service card
 */
function quickSelectService(serviceId) {
  const select = document.getElementById("service-select");
  if (select) {
    select.value = serviceId;
  }
  const bookingSection = document.getElementById("booking");
  if (bookingSection) {
    bookingSection.scrollIntoView({ behavior: "smooth" });
  }
}

/**
 * Cancel Appointment functionality
 * Atomically updates appointments array, localStorage, and dynamic count in the exact same operation.
 */
function cancelAppointment(appointmentId) {
  const confirmed = window.confirm("Cancel this appointment?");
  if (!confirmed) {
    return;
  }

  // 1. Update in-memory array
  appointments = appointments.filter(apt => apt.id !== appointmentId);

  // 2. Update localStorage
  saveAppointments();

  // 3. Update DOM & dynamic count in the same operation
  renderAppointments();
  updateAppointmentCount();

  showNotification("Appointment has been successfully cancelled.", "success");
}

/**
 * Clear form errors
 */
function clearFormErrors() {
  document.querySelectorAll(".form-control").forEach(input => {
    input.classList.remove("input-error");
  });
  document.querySelectorAll(".form-error").forEach(span => {
    span.textContent = "";
  });
}

/**
 * Display inline validation error
 */
function setFieldError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(errorId);
  if (field) field.classList.add("input-error");
  if (errorEl) errorEl.textContent = message;
}

/**
 * Display feedback notification banner
 */
function showNotification(message, type = "success") {
  const banner = document.getElementById("booking-notification");
  if (!banner) return;

  banner.className = `notification-banner notification-${type}`;
  banner.textContent = message;
  banner.hidden = false;

  // Auto hide after 5 seconds
  setTimeout(() => {
    banner.hidden = true;
  }, 5000);
}

/**
 * Handle Form Submission & Validation
 */
function handleBookingSubmit(e) {
  e.preventDefault();
  clearFormErrors();

  const nameInput = document.getElementById("customer-name");
  const phoneInput = document.getElementById("customer-phone");
  const serviceInput = document.getElementById("service-select");
  const dateInput = document.getElementById("booking-date");
  const timeInput = document.getElementById("booking-time");

  const name = nameInput ? nameInput.value.trim() : "";
  const phone = phoneInput ? phoneInput.value.trim() : "";
  const serviceId = serviceInput ? serviceInput.value.trim() : "";
  const date = dateInput ? dateInput.value.trim() : "";
  const time = timeInput ? timeInput.value.trim() : "";

  let isValid = true;
  let firstInvalidEl = null;

  // 1. Name validation
  if (!name) {
    setFieldError("customer-name", "name-error", "Please provide your full name.");
    isValid = false;
    firstInvalidEl = firstInvalidEl || nameInput;
  }

  // 2. Phone validation
  if (!phone) {
    setFieldError("customer-phone", "phone-error", "Please provide your phone number.");
    isValid = false;
    firstInvalidEl = firstInvalidEl || phoneInput;
  } else if (!isValidPhone(phone)) {
    setFieldError("customer-phone", "phone-error", "Please enter a valid phone number (digits, optional +, spaces, dashes).");
    isValid = false;
    firstInvalidEl = firstInvalidEl || phoneInput;
  }

  // 3. Service validation
  if (!serviceId) {
    setFieldError("service-select", "service-error", "Please select a salon service.");
    isValid = false;
    firstInvalidEl = firstInvalidEl || serviceInput;
  }

  // 4. Date validation
  const todayStr = getLocalTodayDateString();
  if (!date) {
    setFieldError("booking-date", "date-error", "Please choose a booking date.");
    isValid = false;
    firstInvalidEl = firstInvalidEl || dateInput;
  } else if (date < todayStr) {
    setFieldError("booking-date", "date-error", "Booking date cannot be in the past.");
    isValid = false;
    firstInvalidEl = firstInvalidEl || dateInput;
  }

  // 5. Time validation
  if (!time) {
    setFieldError("booking-time", "time-error", "Please select a preferred time.");
    isValid = false;
    firstInvalidEl = firstInvalidEl || timeInput;
  }

  if (!isValid) {
    if (firstInvalidEl) firstInvalidEl.focus();
    return;
  }

  // Find matching service object
  const selectedService = SERVICES.find(s => s.id === serviceId);
  const serviceName = selectedService ? selectedService.name : serviceId;
  const price = selectedService ? selectedService.price : 0;

  // Create new appointment object
  const newAppointment = {
    id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    customerName: name,
    phone: phone,
    serviceId: serviceId,
    serviceName: serviceName,
    price: price,
    date: date,
    time: time,
    createdAt: Date.now()
  };

  // Add to appointments array
  appointments.push(newAppointment);

  // Persist to localStorage
  saveAppointments();

  // Re-render appointments list and update dynamic count
  renderAppointments();
  updateAppointmentCount();

  // Reset form
  const form = document.getElementById("booking-form");
  if (form) form.reset();
  setMinBookingDate();

  // Show success notification
  showNotification(`Appointment confirmed for ${name} (${serviceName})!`, "success");

  // Smooth scroll to appointments
  const appointmentsSection = document.getElementById("appointments");
  if (appointmentsSection) {
    appointmentsSection.scrollIntoView({ behavior: "smooth" });
  }
}

// ==========================================================================
// 6. Application Initialization
// ==========================================================================
function initApp() {
  // Update footer year dynamically
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Render services and populate select dropdown strictly from SERVICES
  renderServices();
  populateServiceDropdown();
  setMinBookingDate();

  // Load persisted appointments and render
  loadAppointments();
  renderAppointments();
  updateAppointmentCount();

  // Attach form listener
  const form = document.getElementById("booking-form");
  if (form) {
    form.addEventListener("submit", handleBookingSubmit);
  }
}

// Initialize on DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
