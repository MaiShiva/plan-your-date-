
/* A Little Question — JavaScript */
"use strict";

const CONFIG = {
  GOOGLE_SCRIPT_URL: ""
};

const $ = (selector) => document.querySelector(selector);

const heartsLayer = $("#hearts");
const yesButton = $("#yes-button");
const noButton = $("#no-button");
const choiceArea = $("#choice-area");
const choiceHint = $("#choice-hint");
const planPanel = $("#plan-panel");
const resultPanel = $("#result-panel");
const dateForm = $("#date-form");
const formError = $("#form-error");
const saveButton = $("#save-button");
const resultCopy = $("#result-copy");
const shareStatus = $("#share-status");

let latestPlan = null;
let noCount = 0;
let submitInProgress = false;

function localISODate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const dateInput = $("#date");
if (dateInput) dateInput.min = localISODate();

function createHeartBurst(count = 18) {
  if (!heartsLayer) return;

  const symbols = ["♥", "♡", "✦"];

  for (let i = 0; i < count; i++) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent =
      symbols[Math.floor(Math.random() * symbols.length)];

    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${14 + Math.random() * 22}px`;
    heart.style.animationDelay = `${Math.random() * 0.8}s`;
    heart.style.animationDuration = `${3.4 + Math.random() * 2}s`;

    heartsLayer.appendChild(heart);
    heart.addEventListener("animationend", () => heart.remove(), {
      once: true
    });
  }
}

function showPanel(panelToShow) {
  [choiceArea, planPanel, resultPanel].forEach((panel) => {
    if (panel) panel.hidden = panel !== panelToShow;
  });
}

function showFormError(message) {
  if (!formError) return;
  formError.textContent = message;
  formError.hidden = false;
}

function clearFormError() {
  if (!formError) return;
  formError.textContent = "";
  formError.hidden = true;
}

function safeText(value) {
  return String(value ?? "").trim();
}

/* YES BUTTON */
if (yesButton) {
  yesButton.addEventListener("click", () => {
    showPanel(planPanel);
    createHeartBurst(24);

    const nameInput = $("#person-name");
    if (nameInput) nameInput.focus({ preventScroll: true });

    if (planPanel) {
      planPanel.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  });
}

/* NO BUTTON */
if (noButton) {
  noButton.addEventListener("click", () => {
    noCount++;

    const messages = [
      "No pressure — choose whatever feels right. 💗",
      "That's okay! No pressure at all. 😊",
      "You can take your time. Your choice matters. 🌷",
      "All good — this invitation will stay kind and respectful. 💛"
    ];

    if (choiceHint) {
      choiceHint.textContent =
        messages[Math.min(noCount, messages.length - 1)];
    }

    if (noButton.animate) {
      noButton.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(.96)" },
          { transform: "scale(1)" }
        ],
        { duration: 220, easing: "ease-out" }
      );
    }
  });
}

/* BACK BUTTON */
const backButton = $("#back-button");

if (backButton) {
  backButton.addEventListener("click", () => {
    clearFormError();
    showPanel(choiceArea);
    if (yesButton) yesButton.focus();
  });
}

function getPlanFromForm() {
  return {
    personName: safeText($("#person-name")?.value),
    date: $("#date")?.value || "",
    time: $("#time")?.value || "",
    place: safeText($("#place")?.value),
    note: safeText($("#note")?.value)
  };
}

function validatePlan(plan) {
  if (!plan.personName || !plan.date || !plan.time || !plan.place) {
    return "Please fill in your name, date, time, and place.";
  }

  if (
    plan.personName.length > 60 ||
    plan.place.length > 120 ||
    plan.note.length > 300
  ) {
    return "One of the fields is too long. Please shorten it and try again.";
  }

  if (plan.date < localISODate()) {
    return "Please choose today or a future date.";
  }

  return "";
}

function prettyDate(dateString) {
  const parsed = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) return dateString;

  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(parsed);
}

function prettyTime(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  const parsed = new Date();

  parsed.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(parsed);
}

function renderPlan(plan) {
  const lines = [
    `For: ${plan.personName}`,
    `When: ${prettyDate(plan.date)} at ${prettyTime(plan.time)}`,
    `Where: ${plan.place}`
  ];

  if (plan.note) lines.push(`Note: ${plan.note}`);

  if (resultCopy) resultCopy.textContent = lines.join("\n");
}

async function sendToGoogleSheets(plan) {
  if (!CONFIG.GOOGLE_SCRIPT_URL) {
    return { configured: false };
  }

  const payload = new URLSearchParams({
    personName: plan.personName,
    date: plan.date,
    time: plan.time,
    place: plan.place,
    note: plan.note,
    submittedAt: new Date().toISOString()
  });

  await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    body: payload
  });

  return { configured: true };
}

/* DATE FORM SUBMISSION */
if (dateForm) {
  dateForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (submitInProgress) return;
    clearFormError();

    const plan = getPlanFromForm();
    const error = validatePlan(plan);

    if (error) {
      showFormError(error);
      return;
    }

    submitInProgress = true;

    if (saveButton) {
      saveButton.disabled = true;
      saveButton.classList.add("is-loading");
      saveButton.textContent = "Saving…";
    }

    try {
      const result = await sendToGoogleSheets(plan);

      latestPlan = plan;
      renderPlan(plan);
      showPanel(resultPanel);
      createHeartBurst(28);

      if (shareStatus) {
        shareStatus.textContent = result.configured
          ? "Request sent. Check your spreadsheet to confirm it was saved."
          : "Your date plan is displayed here. Remote saving is not configured.";
      }

      if (resultPanel) {
        resultPanel.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }
    } catch (error) {
      console.error("Could not send the plan:", error);
      showFormError(
        "Couldn't send the plan. Check your connection and try again."
      );
    } finally {
      submitInProgress = false;

      if (saveButton) {
        saveButton.disabled = false;
        saveButton.classList.remove("is-loading");
        saveButton.innerHTML =
          'Save our plan <span aria-hidden="true">♡</span>';
      }
    }
  });
}

/* EDIT PLAN */
const editButton = $("#edit-button");

if (editButton) {
  editButton.addEventListener("click", () => {
    showPanel(planPanel);

    if (shareStatus) shareStatus.textContent = "";

    const nameInput = $("#person-name");
    if (nameInput) nameInput.focus({ preventScroll: true });
  });
}

/* RESTART */
const restartButton = $("#restart-button");

if (restartButton) {
  restartButton.addEventListener("click", () => {
    latestPlan = null;

    if (dateForm) dateForm.reset();
    if (dateInput) dateInput.min = localISODate();

    clearFormError();

    if (shareStatus) shareStatus.textContent = "";

    showPanel(choiceArea);

    if (choiceHint) {
      choiceHint.textContent =
        "No pressure — choose whatever feels right. 💗";
    }

    if (yesButton) yesButton.focus();
  });
}

/* SHARE PLAN */
const shareButton = $("#share-button");

if (shareButton) {
  shareButton.addEventListener("click", async () => {
    if (!latestPlan) return;

    const text = [
      "Our little date plan 💗",
      `For: ${latestPlan.personName}`,
      `When: ${prettyDate(latestPlan.date)} at ${prettyTime(latestPlan.time)}`,
      `Where: ${latestPlan.place}`,
      latestPlan.note ? `Note: ${latestPlan.note}` : ""
    ].filter(Boolean).join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Our little date plan 💗",
          text
        });

        if (shareStatus) shareStatus.textContent = "Share sheet opened.";
        return;
      }

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);

        if (shareStatus) {
          shareStatus.textContent = "Plan copied! Paste it into a message.";
        }
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);
      textarea.select();

      const copied = document.execCommand("copy");
      textarea.remove();

      if (shareStatus) {
        shareStatus.textContent = copied
          ? "Plan copied! Paste it into a message."
          : "Please copy the plan text manually.";
      }
    } catch (error) {
      if (shareStatus) {
        shareStatus.textContent =
          error?.name === "AbortError"
            ? "Sharing cancelled."
            : "Couldn't open sharing. Please try again.";
      }
    }
  });
        }
    
