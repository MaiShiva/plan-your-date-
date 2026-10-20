
"use strict";

/* =========================================
   PLAN YOUR DATE — FRESH JAVASCRIPT
   ========================================= */

const welcomePanel = document.getElementById("welcome-panel");
const planPanel = document.getElementById("plan-panel");
const resultPanel = document.getElementById("result-panel");

const yesButton = document.getElementById("yes-button");
const noButton = document.getElementById("no-button");
const choiceHint = document.getElementById("choice-hint");

const dateForm = document.getElementById("date-form");
const dateInput = document.getElementById("date-input");
const timeInput = document.getElementById("time-input");
const locationInput = document.getElementById("location-input");
const activityInput = document.getElementById("activity-input");
const messageInput = document.getElementById("message-input");

const formError = document.getElementById("form-error");
const backButton = document.getElementById("back-button");
const saveButton = document.getElementById("save-button");

const resultDate = document.getElementById("result-date");
const resultTime = document.getElementById("result-time");
const resultLocation = document.getElementById("result-location");
const resultActivity = document.getElementById("result-activity");
const personalNoteWrap = document.getElementById("personal-note-wrap");
const resultMessage = document.getElementById("result-message");

const shareButton = document.getElementById("share-button");
const copyButton = document.getElementById("copy-button");
const shareStatus = document.getElementById("share-status");
const editButton = document.getElementById("edit-button");
const restartButton = document.getElementById("restart-button");
const toast = document.getElementById("toast");

let toastTimeout;
let noButtonMoveCount = 0;

/* ---------- SCREEN NAVIGATION ---------- */

function showPanel(panelToShow) {
  [welcomePanel, planPanel, resultPanel].forEach((panel) => {
    panel.classList.add("hidden");
  });

  panelToShow.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* ---------- HELPERS ---------- */

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(toastTimeout);

  toastTimeout = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

function getPlanText() {
  const dateText = resultDate.textContent;
  const timeText = resultTime.textContent;
  const locationText = resultLocation.textContent;
  const activityText = resultActivity.textContent;
  const noteText = resultMessage.textContent.trim();

  let text = [
    "♡ OUR LITTLE DATE PLAN ♡",
    "",
    `Date: ${dateText}`,
    `Time: ${timeText}`,
    `Place: ${locationText}`,
    `Date idea: ${activityText}`
  ].join("\n");

  if (noteText) {
    text += `\n\nA little note: ${noteText}`;
  }

  text += "\n\nGood company. Good memories. Just us. ♡";

  return text;
}

/* ---------- LITTLE HEART ANIMATION ---------- */

function createHeartBurst() {
  const symbols = ["♡", "♥", "✦", "♥", "♡"];
  const originX = window.innerWidth / 2;
  const originY = Math.min(window.innerHeight * 0.48, 390);

  for (let i = 0; i < 14; i += 1) {
    const heart = document.createElement("span");

    heart.className = "heart-particle";
    heart.textContent = symbols[i % symbols.length];

    heart.style.left = `${originX + (Math.random() * 180 - 90)}px`;
    heart.style.top = `${originY + (Math.random() * 60 - 30)}px`;
    heart.style.animationDelay = `${Math.random() * 0.35}s`;
    heart.style.fontSize = `${14 + Math.random() * 13}px`;

    document.body.appendChild(heart);

    window.setTimeout(() => {
      heart.remove();
    }, 1900);
  }
}

/* ---------- YES BUTTON ---------- */

yesButton.addEventListener("click", () => {
  createHeartBurst();
  showPanel(planPanel);
  showToast("Yay! Let's make a lovely plan. ♡");

  window.setTimeout(() => {
    dateInput.focus({ preventScroll: true });
  }, 350);
});

/* ---------- PLAYFUL NO BUTTON ---------- */

function dodgeNoButton() {
  const maxX = 34;
  const maxY = 15;

  let x = Math.round(Math.random() * maxX * 2 - maxX);
  let y = Math.round(Math.random() * maxY * 2 - maxY);

  if (Math.abs(x) < 18) {
    x = x < 0 ? -25 : 25;
  }

  const rotation = Math.round(Math.random() * 14 - 7);
  const nextTransform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;

  noButtonMoveCount += 1;

  noButton.animate(
    [
      { transform: noButton.style.transform || "translate(0, 0) rotate(0deg)" },
      { transform: `translate(${x * 1.2}px, ${y - 5}px) rotate(${rotation * 1.4}deg)` },
      { transform: nextTransform }
    ],
    {
      duration: 360,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      fill: "forwards"
    }
  );

  noButton.style.transform = nextTransform;

  const hints = [
    "Oops, missed me! Try the cute button. 😜",
    "That little 'Yes' is looking pretty good, right? 💗",
    "I'm shy. Are you sure about that? 🙈",
    "One more try? I believe in happy endings. ✨",
    "The 'Yes' button is right there, just saying. 😉"
  ];

  choiceHint.textContent = hints[(noButtonMoveCount - 1) % hints.length];
}

noButton.addEventListener("pointerenter", (event) => {
  // Dodge on mouse/pen hover. Touch devices dodge when tapped.
  if (event.pointerType !== "touch") {
    dodgeNoButton();
  }
});

noButton.addEventListener("click", () => {
  dodgeNoButton();
});

/* ---------- DATE FORM DEFAULTS ---------- */

dateInput.min = getLocalDateString();
dateInput.value = getLocalDateString();

/* ---------- BUILD THE FINAL DATE CARD ---------- */

dateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formError.textContent = "";

  const chosenDate = dateInput.value;
  const chosenTime = timeInput.value;
  const chosenLocation = locationInput.value.trim();
  const chosenActivity = activityInput.value;
  const chosenMessage = messageInput.value.trim();

  if (!chosenDate || !chosenTime || !chosenLocation) {
    formError.textContent = "Please fill in the date, time, and location.";
    return;
  }

  if (chosenDate < getLocalDateString()) {
    formError.textContent = "Choose today or a future date for your plan.";
    dateInput.focus();
    return;
  }

  if (chosenLocation.length > 100 || chosenMessage.length > 240) {
    formError.textContent = "Please shorten your details and try again.";
    return;
  }

  resultDate.textContent = formatDate(chosenDate);
  resultTime.textContent = formatTime(chosenTime);
  resultLocation.textContent = chosenLocation;
  resultActivity.textContent = chosenActivity;

  resultMessage.textContent = chosenMessage;
  personalNoteWrap.classList.toggle("hidden", !chosenMessage);

  shareStatus.textContent = "";

  showPanel(resultPanel);
  createHeartBurst();
  showToast("Your date plan is ready! ♡");
});

/* ---------- BACK TO THE PLANNER ---------- */

backButton.addEventListener("click", () => {
  formError.textContent = "";
  showPanel(welcomePanel);
});

/* ---------- EDIT THE DATE ---------- */

editButton.addEventListener("click", () => {
  formError.textContent = "";
  showPanel(planPanel);
});

/* ---------- RESET AND START AGAIN ---------- */

restartButton.addEventListener("click", () => {
  dateForm.reset();

  dateInput.min = getLocalDateString();
  dateInput.value = getLocalDateString();

  formError.textContent = "";
  shareStatus.textContent = "";
  choiceHint.textContent = "Psst... there's a right answer. Just saying. 🙂";

  noButtonMoveCount = 0;
  noButton.getAnimations().forEach((animation) => animation.cancel());
  noButton.style.transform = "";

  showPanel(welcomePanel);
  showToast("A fresh start. Maybe another lovely plan? ♡");
});

/* ---------- COPY TEXT FALLBACK ---------- */

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const temporaryField = document.createElement("textarea");

  temporaryField.value = text;
  temporaryField.setAttribute("readonly", "");
  temporaryField.style.position = "fixed";
  temporaryField.style.opacity = "0";
  temporaryField.style.pointerEvents = "none";

  document.body.appendChild(temporaryField);
  temporaryField.select();

  const copied = document.execCommand("copy");
  temporaryField.remove();

  if (!copied) {
    throw new Error("Copy is not supported in this browser.");
  }
}

/* ---------- COPY DATE DETAILS ---------- */

copyButton.addEventListener("click", async () => {
  try {
    await copyText(getPlanText());
    shareStatus.textContent = "Copied! Send your little plan to someone special. ♡";
    showToast("Date details copied! ♡");
  } catch (error) {
    shareStatus.textContent = "Copy wasn't available. You can select the details manually.";
    showToast("Copy isn't supported in this browser.");
  }
});

/* ---------- SHARE DATE DETAILS ---------- */

shareButton.addEventListener("click", async () => {
  const shareData = {
    title: "Our Little Date Plan ♡",
    text: getPlanText()
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      shareStatus.textContent = "Your plan is ready to share. ♡";
    } catch (error) {
      // Closing the native share sheet is not an error worth showing.
      if (error.name !== "AbortError") {
        shareStatus.textContent = "Sharing wasn't available. Try copying the details instead.";
      }
    }

    return;
  }

  try {
    await copyText(getPlanText());
    shareStatus.textContent = "Sharing isn't supported here, so your plan was copied instead. ♡";
    showToast("Plan copied — paste it into your chat!");
  } catch (error) {
    shareStatus.textContent = "Sharing isn't supported in this browser. Try copying the details manually.";
  }
});
                           
