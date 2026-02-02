const PASSWORD = "nims";

const passwordOverlay = document.getElementById("password-overlay");
const passwordInput = document.getElementById("password-input");
const passwordButton = document.getElementById("password-button");
const passwordMessage = document.getElementById("password-message");
const book = document.getElementById("book");
const floatingHeartButton = document.getElementById("floating-heart-button");
const musicPlayer = document.getElementById("music-player");
const musicToggle = document.getElementById("music-toggle");
const musicAudio = document.getElementById("bg-music");
const musicProgressFill = document.querySelector(".music-progress-fill");
const musicCurrentTime = document.querySelector(".music-current");
const musicDuration = document.querySelector(".music-duration");
const musicHandle = document.querySelector(".music-handle");
const leftArrow = document.querySelector(".page-arrow-left");
const rightArrow = document.querySelector(".page-arrow-right");
const mobilePrev = document.querySelector(".mobile-page-prev");
const mobileNext = document.querySelector(".mobile-page-next");

let currentPage = 0;

function setBookVisibility(visible) {
  if (visible) {
    book.setAttribute("aria-hidden", "false");
    passwordOverlay.style.opacity = "0";
    passwordOverlay.style.pointerEvents = "none";
    passwordOverlay.style.transform = "scale(1.02)";
    document.body.style.overflowY = "auto";
    showPage(0);
  } else {
    book.setAttribute("aria-hidden", "true");
    passwordOverlay.style.opacity = "";
    passwordOverlay.style.pointerEvents = "";
    passwordOverlay.style.transform = "";
  }
}

function handlePasswordSubmit() {
  const value = (passwordInput.value || "").trim().toLowerCase();

  if (!value) {
    passwordMessage.textContent = "Type our little secret first, my love.";
    passwordMessage.className = "error";
    passwordInput.focus();
    return;
  }

  if (value === PASSWORD) {
    passwordMessage.textContent = "Welcome in, my beautiful girl. ♡";
    passwordMessage.className = "success";
    setTimeout(() => {
      setBookVisibility(true);
    }, 500);
  } else {
    passwordMessage.textContent = "Almost there… but not quite. Think of your name, short & soft.";
    passwordMessage.className = "error";
    if (!passwordInput.classList.contains("shake")) {
      passwordInput.classList.add("shake");
      setTimeout(() => passwordInput.classList.remove("shake"), 400);
    }
    passwordInput.focus();
    passwordInput.select();
  }
}

passwordButton.addEventListener("click", handlePasswordSubmit);
passwordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handlePasswordSubmit();
  }
});

// Book navigation
const pages = Array.from(document.querySelectorAll(".page"));
const coverNextButton = document.querySelector(".next-button");
const restartButton = document.querySelector(".restart-button");

function showPage(pageIndex) {
  if (pageIndex < 0 || pageIndex >= pages.length) return;

  const leaving = pages[currentPage];
  const entering = pages[pageIndex];

  if (leaving && leaving !== entering) {
    leaving.classList.remove("active");
    leaving.classList.add("leaving");
    setTimeout(() => leaving.classList.remove("leaving"), 600);
  }

  entering.classList.add("active");
  currentPage = pageIndex;

  const atFirst = currentPage === 0;
  const atLast = currentPage === pages.length - 1;

  if (leftArrow && rightArrow) {
    if (atFirst) leftArrow.setAttribute("disabled", "true");
    else leftArrow.removeAttribute("disabled");

    if (atLast) rightArrow.setAttribute("disabled", "true");
    else rightArrow.removeAttribute("disabled");
  }

  if (mobilePrev && mobileNext) {
    if (atFirst) mobilePrev.setAttribute("disabled", "true");
    else mobilePrev.removeAttribute("disabled");

    if (atLast) mobileNext.setAttribute("disabled", "true");
    else mobileNext.removeAttribute("disabled");
  }
}

coverNextButton.addEventListener("click", () => {
  showPage(1);
});

if (leftArrow && rightArrow) {
  leftArrow.addEventListener("click", () => {
    if (currentPage > 0) showPage(currentPage - 1);
  });

  rightArrow.addEventListener("click", () => {
    if (currentPage < pages.length - 1) showPage(currentPage + 1);
  });
}

if (mobilePrev && mobileNext) {
  mobilePrev.addEventListener("click", () => {
    if (currentPage > 0) showPage(currentPage - 1);
  });

  mobileNext.addEventListener("click", () => {
    if (currentPage < pages.length - 1) showPage(currentPage + 1);
  });
}

restartButton.addEventListener("click", () => {
  showPage(0);
  if (window.innerWidth <= 700) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// Enable arrow key navigation after book is visible
window.addEventListener("keydown", (event) => {
  const isVisible = book.getAttribute("aria-hidden") === "false";
  if (!isVisible) return;

  if (event.key === "ArrowRight") {
    event.preventDefault();
    if (currentPage < pages.length - 1) showPage(currentPage + 1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    if (currentPage > 0) showPage(currentPage - 1);
  }
});

// Floating heart particles
function createHeartParticle(x, y) {
  const heart = document.createElement("div");
  heart.className = "heart-particle";
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;

  document.body.appendChild(heart);

  // Force layout so animation triggers
  // eslint-disable-next-line no-unused-expressions
  heart.offsetHeight;
  heart.classList.add("animate");

  heart.addEventListener("animationend", () => {
    heart.remove();
  });
}

function burstHearts(originElement) {
  const rect = originElement.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const radius = 30;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    setTimeout(() => createHeartParticle(x, y), i * 40);
  }
}

floatingHeartButton.addEventListener("click", () => {
  burstHearts(floatingHeartButton);
});

// Also create hearts on random clicks on the page (after unlocked)
document.addEventListener("click", (event) => {
  const isVisible = book.getAttribute("aria-hidden") === "false";
  if (!isVisible) return;

  const target = event.target;
  if (
    target === floatingHeartButton ||
    target.closest("#floating-heart-button") ||
    target.closest(".password-card")
  ) {
    return;
  }

  createHeartParticle(event.clientX, event.clientY);
});

// Focus input automatically
window.addEventListener("load", () => {
  setTimeout(() => {
    passwordInput.focus();
  }, 400);
});

// Music player controls
let isMusicDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function updateMusicTime() {
  if (!musicAudio.duration) return;
  const current = musicAudio.currentTime;
  const duration = musicAudio.duration;
  const progress = (current / duration) * 100;
  musicProgressFill.style.width = `${progress}%`;
  musicCurrentTime.textContent = formatTime(current);
  musicDuration.textContent = formatTime(duration);
}

musicAudio.addEventListener("timeupdate", updateMusicTime);
musicAudio.addEventListener("loadedmetadata", updateMusicTime);

musicToggle.addEventListener("click", () => {
  if (musicAudio.paused) {
    musicAudio
      .play()
      .then(() => {
        musicPlayer.classList.add("playing");
      })
      .catch(() => {
        // ignore autoplay errors
      });
  } else {
    musicAudio.pause();
    musicPlayer.classList.remove("playing");
  }
});

// Dragging logic for music player (desktop + touch)
function startDrag(clientX, clientY) {
  isMusicDragging = true;
  const rect = musicPlayer.getBoundingClientRect();
  dragOffsetX = clientX - rect.left;
  dragOffsetY = clientY - rect.top;
}

function moveDrag(clientX, clientY) {
  if (!isMusicDragging) return;
  const x = clientX - dragOffsetX;
  const y = clientY - dragOffsetY;

  const maxX = window.innerWidth - musicPlayer.offsetWidth - 8;
  const maxY = window.innerHeight - musicPlayer.offsetHeight - 8;
  const clampedX = Math.min(Math.max(8, x), maxX);
  const clampedY = Math.min(Math.max(8, y), maxY);

  musicPlayer.style.right = "auto";
  musicPlayer.style.bottom = "auto";
  musicPlayer.style.left = `${clampedX}px`;
  musicPlayer.style.top = `${clampedY}px`;
}

function endDrag() {
  isMusicDragging = false;
}

musicHandle.addEventListener("mousedown", (event) => {
  startDrag(event.clientX, event.clientY);
});

window.addEventListener("mousemove", (event) => {
  moveDrag(event.clientX, event.clientY);
});

window.addEventListener("mouseup", endDrag);

musicHandle.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];
  startDrag(touch.clientX, touch.clientY);
});

window.addEventListener("touchmove", (event) => {
  const touch = event.touches[0];
  moveDrag(touch.clientX, touch.clientY);
});

window.addEventListener("touchend", endDrag);
window.addEventListener("touchcancel", endDrag);

