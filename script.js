
const $ = (id) => document.getElementById(id);

const welcome = $("welcome");
const planner = $("planner");
const success = $("success");
const yesBtn = $("yesBtn");
const noBtn = $("noBtn");
const buttons = $("buttons");
const form = $("dateForm");
const toast = $("toast");

let yesScale = 1;
let noMoves = 0;
let toastTimer;

const noMessages = [
  "Are you sure? 🥺",
  "Ek baar aur soch lo! 💗",
  "Pleaseee? 🌷",
  "Maan bhi jao na! 🥹",
  "Yes kitna cute hai! 💖"
];

// Aaj se pehle ki date select nahi kar sakte.
const today = new Date();
const localToday = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0")
].join("-");

$("date").min = localToday;

// Floating hearts background.
const heartContainer = $("hearts");
const heartSymbols = ["💗", "💕", "♡", "💖", "🌸", "💘"];

function createHeart() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const heart = document.createElement("span");
  heart.className = "heart";
  heart.textContent =
    heartSymbols[Math.floor(Math.random() * heartSymbols.length)];

  heart.style.left = Math.random() * 100 + "%";
  heart.style.fontSize = (14 + Math.random() * 20) + "px";
  heart.style.animationDuration = (7 + Math.random() * 7) + "s";

  heartContainer.appendChild(heart);
  heart.addEventListener("animationend", () => heart.remove());
}

for (let i = 0; i < 10; i++) {
  setTimeout(createHeart, i * 250);
}

setInterval(createHeart, 900);

// Small notification.
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

// No button ko safe area mein nayi position dena.
function moveNoButton() {
  if (noMoves >= 5) {
    noBtn.textContent = "No 🙈";
    noBtn.style.display = "none";
    return;
  }

  noMoves++;

  const area = buttons.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();

  const maxX = Math.max(0, area.width - btn.width);
  const maxY = Math.max(0, area.height - btn.height);

  noBtn.style.position = "absolute";
  noBtn.style.left = Math.random() * maxX + "px";
  noBtn.style.top = Math.random() * maxY + "px";

  yesScale = Math.min(1.65, yesScale + 0.12);
  yesBtn.style.transform = `scale(${yesScale})`;

  noBtn.textContent =
    noMessages[Math.min(noMoves - 1, noMessages.length - 1)];
}

// Mouse aur touch interactions.
noBtn.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse") {
    moveNoButton();
  }
});

noBtn.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  moveNoButton();
});

// Yes click: planner kholna.
yesBtn.addEventListener("click", () => {
  welcome.hidden = true;
  planner.hidden = false;

  // Form mein naam pehla field hai.
  $("girlName").focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Date ko readable banana.
function formatDate(value) {
  const date = new Date(value + "T12:00:00");

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function formatTime(value) {
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

// Final plan create karna.
form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.reportValidity()) return;

  const selectedDate = $("date").value;

  if (selectedDate < localToday) {
    showToast("Please choose today or a future date. 💗");
    return;
  }

  const name = $("girlName").value.trim();
  const place = $("place").value.trim();
  const note = $("message").value.trim();
  const date = $("date").value;
  const time = $("time").value;

  if (!name || !place || !date || !time) {
    showToast("Please complete all required fields. 💌");
    return;
  }

  $("outName").textContent = name;
  $("outDate").textContent = formatDate(date);
  $("outPlace").textContent = place;
  $("outTime").textContent = formatTime(time);

  $("successTitle").textContent = `Yay, ${name}! 💗`;

  $("noteRow").hidden = !note;
  $("outNote").textContent = note;

  planner.hidden = true;
  success.hidden = false;

  // Celebration hearts.
  for (let i = 0; i < 16; i++) {
    setTimeout(createHeart, i * 100);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  showToast("Your date plan is ready! 💖");
});

// Details edit karne ke liye.
$("editBtn").addEventListener("click", () => {
  success.hidden = true;
  planner.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Plan ko share karna.
$("shareBtn").addEventListener("click", async () => {
  const name = $("outName").textContent;
  const date = $("outDate").textContent;
  const place = $("outPlace").textContent;
  const time = $("outTime").textContent;
  const note = $("outNote").textContent;

  let message =
    `💗 Our Date Plan 💗\n\n` +
    `Name: ${name}\n` +
    `Date: ${date}\n` +
    `Place: ${place}\n` +
    `Time: ${time}`;

  if (!$("noteRow").hidden && note) {
    message += `\nNote: ${note}`;
  }

  message += "\n\nLet's make a lovely memory! 🌷";

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Our Date Plan 💗",
        text: message
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        copyPlan(message);
      }
    }
  } else {
    copyPlan(message);
  }
});

async function copyPlan(message) {
  try {
    await navigator.clipboard.writeText(message);
    showToast("Plan copied! You can paste it into WhatsApp. 💌");
  } catch {
    // Fallback for browsers without clipboard support.
    const url =
      "https://wa.me/?text=" + encodeURIComponent(message);

    window.open(url, "_blank", "noopener,noreferrer");
  }
     }
                                                  
