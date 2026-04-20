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
