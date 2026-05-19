// Quick modal
const quickModal = document.getElementById("quick-modal");
const quickModalTitle = document.getElementById("quick-modal-title");
const quickForm = document.getElementById("quick-form");
const quickFormSuccess = document.getElementById("quick-form-success");

if (quickModal) {
  document.querySelectorAll(".carousel-cta").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      quickModalTitle.textContent = btn.dataset.property;
      quickForm.reset();
      quickForm.hidden = false;
      quickFormSuccess.hidden = true;
      const submitBtn = quickForm.querySelector(".submit-button");
      if (submitBtn) { submitBtn.classList.remove("is-loading"); submitBtn.disabled = false; }
      quickModal.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });

  const closeQuickModal = () => {
    quickModal.hidden = true;
    document.body.style.overflow = "";
  };

  quickModal.querySelector(".quick-modal-backdrop").addEventListener("click", closeQuickModal);
  quickModal.querySelector(".quick-modal-close").addEventListener("click", closeQuickModal);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeQuickModal(); });

  quickForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!quickForm.reportValidity()) return;

    const submitBtn = quickForm.querySelector(".submit-button");
    submitBtn.classList.add("is-loading");
    submitBtn.disabled = true;

    const data = new FormData(quickForm);
    data.append("bien", quickModalTitle.textContent);
    data.append("source", "quick-form-carousel");
    data.append("page", window.location.href);

    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, { method: "POST", body: data });
      if (!res.ok) throw new Error();
      const result = await res.json();
      if (!result.success) throw new Error();

      if (localStorage.getItem("cookieConsent") === "true" && typeof gtag !== "undefined") {
        gtag("event", "conversion", { send_to: "AW-18111852112/uDkkCITJ568cENDcs7xD" });
      }

      quickForm.hidden = true;
      quickFormSuccess.hidden = false;
      quickFormSuccess.textContent = "Merci ! Nous vous recontactons sous 24h.";
      setTimeout(closeQuickModal, 2500);
    } catch {
      submitBtn.classList.remove("is-loading");
      submitBtn.disabled = false;
      quickFormSuccess.hidden = false;
      quickFormSuccess.textContent = "Erreur lors de l'envoi. Réessayez.";
    }
  });
}

// Exit intent — reuses quick modal, fires once per session
if (quickModal && !sessionStorage.getItem("exitShown")) {
  const lang = document.documentElement.lang || "fr";
  const isFR = !lang.startsWith("en");
  const exitTitle = isFR
    ? "Avant de partir — remise négociée de −2 % à Saint-Julien jusqu'au 31.05.26"
    : "Before you go — negotiated −2% discount at Saint-Julien until 31 May 2026";

  const showExitModal = () => {
    if (sessionStorage.getItem("exitShown")) return;
    sessionStorage.setItem("exitShown", "1");
    quickModalTitle.textContent = exitTitle;
    quickForm.reset();
    quickForm.hidden = false;
    quickFormSuccess.hidden = true;
    const submitBtn = quickForm.querySelector(".submit-button");
    if (submitBtn) { submitBtn.classList.remove("is-loading"); submitBtn.disabled = false; }
    quickModal.hidden = false;
    document.body.style.overflow = "hidden";
  };

  document.addEventListener("mouseleave", (e) => { if (e.clientY < 10) showExitModal(); });

  let mobileTimer = setTimeout(showExitModal, 45000);
  ["touchstart", "scroll"].forEach((ev) => {
    document.addEventListener(ev, () => {
      clearTimeout(mobileTimer);
      mobileTimer = setTimeout(showExitModal, 45000);
    }, { passive: true });
  });
}

const form = document.getElementById("lead-form");
const successMessage = document.getElementById("form-success");
const menuToggle = document.querySelector(".menu-toggle");
const siteMenu = document.getElementById("site-menu");
const carousels = document.querySelectorAll(".carousel");
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxOroPEz6Q0kjH_YFI0SrsD3QKz2AUFb0F2rxtV7wVnHnt_2pGwA3q7ubBVG5qwrnR3/exec";

if (menuToggle && siteMenu) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    siteMenu.classList.toggle("is-open", !isExpanded);
  });

  siteMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      siteMenu.classList.remove("is-open");
    });
  });
}

carousels.forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
  const dots = Array.from(carousel.querySelectorAll(".carousel-dot"));
  const controls = Array.from(carousel.querySelectorAll(".carousel-button"));
  let currentIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));

  if (!slides.length) return;
  if (currentIndex < 0) currentIndex = 0;

  const setSlide = (index) => {
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });

    currentIndex = index;
  };

  controls.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.direction;
      const nextIndex =
        direction === "next"
          ? (currentIndex + 1) % slides.length
          : (currentIndex - 1 + slides.length) % slides.length;

      setSlide(nextIndex);
    });
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const targetIndex = Number(dot.dataset.slide);
      setSlide(targetIndex);
    });
  });
});

if (form && successMessage) {
  const submitButton = form.querySelector(".submit-button");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const payload = new FormData(form);
    const firstName = (payload.get("prenom") || "").toString().trim();
    payload.append("page", window.location.href);
    payload.append("source", "netlify-form");

    if (GOOGLE_SCRIPT_URL === "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL_HERE") {
      successMessage.textContent =
        "Ajoutez d'abord l'URL Google Apps Script dans app.js pour connecter ce formulaire au Google Sheet.";
      return;
    }

    successMessage.textContent = "Envoi en cours...";
    submitButton?.classList.add("is-loading");
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Google Apps Script returned success=false");
      }

      successMessage.textContent =
        `Merci ${firstName || ""}, votre demande a bien été envoyée. ` +
        "Nous revenons vers vous rapidement.";

      form.reset();
      window.location.href = "./merci.html";
    } catch (error) {
      console.error("Form submit failed:", error);
      successMessage.textContent =
        "L'envoi a échoué. Vérifiez le script Google, la feuille Leads et le déploiement de la web app.";
      submitButton?.classList.remove("is-loading");
      if (submitButton) submitButton.disabled = false;
    }
  });
}
