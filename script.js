(() => {
  "use strict";

  const scenes = [...document.querySelectorAll(".scene")];
  let current = 0;

  const topbar = document.getElementById("topbar");
  const music = document.getElementById("bgMusic");
  const musicBtn = document.getElementById("musicBtn");
  const toast = document.getElementById("toast");

  /* -----------------------------
     Scene navigation
  ------------------------------ */
  function showScene(index) {
    current = Math.max(0, Math.min(index, scenes.length - 1));

    scenes.forEach((scene, i) => {
      scene.classList.toggle("active", i === current);
    });

    // First page intentionally has no top controls.
    topbar.classList.toggle("hidden", current === 0);

    // Falling roses are part of the ambience on every page.
    startPetals();
    if (current === 7) startFireflies();

    // Happy Birthday repeats across pages 2 and 3.
    if ((current === 1 || current === 2) && activeMusic !== "happyBirthdayMusic") {
      playTrack("happyBirthdayMusic", false);
    }

    // Start music.mp3 as soon as the final page is reached.
    // Scene indexes are 0-based, so page 8 is index 7.
    if (current === 7 && activeMusic !== "bgMusic") {
      playTrack("bgMusic", true);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll(".next-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (btn.id === "cakeNext") {
        await playTrack("bgMusic", true);
      } else if (current === 6) {
        await playTrack("newMusic", true);
      } else if (current === 7) {
        await playTrack("bgMusic", true);
      }
      showScene(current + 1);
    });
  });

  document.getElementById("watchAgain").addEventListener("click", () => {
    resetExperience();
    showScene(0);
  });

  /* -----------------------------
     Page 1: Open My Door
  ------------------------------ */
  const doorBtn = document.getElementById("doorBtn");

  doorBtn.addEventListener("click", async () => {
    doorBtn.classList.add("opening");
    await playTrack("happyBirthdayMusic", true);
    setTimeout(() => showScene(1), 1100);
  });

  /* -----------------------------
     Music
  ------------------------------ */
  const musicTracks = {
    happyBirthdayMusic: document.getElementById("happyBirthdayMusic"),
    bgMusic: document.getElementById("bgMusic"),
    smartMusic: document.getElementById("smartMusic"),
    newMusic: document.getElementById("newMusic")
  };

  musicTracks.happyBirthdayMusic.loop = true;
  musicTracks.bgMusic.loop = true;
  musicTracks.newMusic.loop = true;

  let activeMusic = null;

  async function playTrack(id, reset = true) {
    const track = musicTracks[id];
    if (!track) return false;

    Object.entries(musicTracks).forEach(([key, audio]) => {
      if (audio && key !== id) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    if (reset) track.currentTime = 0;

    try {
      await track.play();
      activeMusic = id;
      musicBtn.innerHTML = "♫ <span>Music On</span>";
      return true;
    } catch {
      showToast("Tap Music in the top-right corner to play the song 🎵");
      return false;
    }
  }

  musicBtn.addEventListener("click", async () => {
    const track = musicTracks[activeMusic] || musicTracks.bgMusic;
    try {
      if (track.paused) {
        await track.play();
        musicBtn.innerHTML = "♫ <span>Music On</span>";
      } else {
        track.pause();
        musicBtn.innerHTML = "♫ <span>Music</span>";
      }
    } catch {
      showToast("Music could not start. Check the files inside assets/");
    }
  });

  /* -----------------------------
     Page 2: Live age counter
     Birth date = 07 September 2001
  ------------------------------ */
  const birthDate = new Date(2001, 8, 7); // local time, September 7, 2001

  const ageEls = {
    years: document.getElementById("ageYears"),
    months: document.getElementById("ageMonths"),
    days: document.getElementById("ageDays"),
    hours: document.getElementById("ageHours"),
    minutes: document.getElementById("ageMinutes"),
    seconds: document.getElementById("ageSeconds")
  };

  let lastAge = null;
  let ageTimer = null;

  function daysInMonth(year, monthZeroBased) {
    return new Date(year, monthZeroBased + 1, 0).getDate();
  }

  function calculateAge(fromDate, now = new Date()) {
    if (now < fromDate) {
      return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    let years = now.getFullYear() - fromDate.getFullYear();
    let months = now.getMonth() - fromDate.getMonth();
    let days = now.getDate() - fromDate.getDate();

    if (days < 0) {
      months -= 1;
      const previousMonth = (now.getMonth() - 1 + 12) % 12;
      const previousMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      days += daysInMonth(previousMonthYear, previousMonth);
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const anchor = new Date(
      fromDate.getFullYear() + years,
      fromDate.getMonth() + months,
      fromDate.getDate(),
      fromDate.getHours(),
      fromDate.getMinutes(),
      fromDate.getSeconds()
    );

    let remainderMs = Math.max(0, now - anchor);
    const hours = Math.floor(remainderMs / 3600000);
    remainderMs %= 3600000;
    const minutes = Math.floor(remainderMs / 60000);
    remainderMs %= 60000;
    const seconds = Math.floor(remainderMs / 1000);

    return { years, months, days, hours, minutes, seconds };
  }

  function animateNumber(el, value) {
    const next = String(value);
    const currentValue = el.textContent;

    if (currentValue === next) return;

    el.animate(
      [
        { transform: "translateY(7px) scale(.84)", opacity: .25 },
        { transform: "translateY(0) scale(1)", opacity: 1 }
      ],
      {
        duration: 380,
        easing: "cubic-bezier(.2,.8,.2,1)"
      }
    );

    el.textContent = next;
  }

  function updateAge() {
    const age = calculateAge(birthDate);

    animateNumber(ageEls.years, age.years);
    animateNumber(ageEls.months, age.months);
    animateNumber(ageEls.days, age.days);
    animateNumber(ageEls.hours, age.hours);
    animateNumber(ageEls.minutes, age.minutes);
    animateNumber(ageEls.seconds, age.seconds);

    lastAge = age;
  }

  updateAge();
  ageTimer = setInterval(updateAge, 1000);

  /* -----------------------------
     Page 3: Cake
  ------------------------------ */
  const blowBtn = document.getElementById("blowBtn");
  const cutBtn = document.getElementById("cutBtn");
  const cake = document.getElementById("cake");
  const cakeStatus = document.getElementById("cakeStatus");
  const cakeNext = document.getElementById("cakeNext");

  blowBtn.addEventListener("click", () => {
    if (blowBtn.disabled) return;

    cake.classList.add("blown");
    blowBtn.disabled = true;
    cutBtn.disabled = false;

    cakeStatus.textContent = "Wish made. Now let's cut the cake! 🎂";
    createBurst(18, "✦");
  });

  cutBtn.addEventListener("click", () => {
    if (cutBtn.disabled) return;

    cake.classList.add("cut");
    cutBtn.disabled = true;
    cakeStatus.textContent = "Cake cut! Save a piece for me. 😌❤️";
    document.getElementById("cakeCutNote").hidden = false;
    cakeNext.hidden = false;

    cake.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.06) rotate(1.5deg)" },
        { transform: "scale(1.02) rotate(-1.5deg)" },
        { transform: "scale(1.03) rotate(-1.4deg)" }
      ],
      { duration: 700, easing: "cubic-bezier(.2,.8,.2,1)" }
    );

    createBurst(32, "♥");
  });

  function resetCake() {
    cake.classList.remove("blown", "cut");
    blowBtn.disabled = false;
    cutBtn.disabled = true;
    cakeNext.hidden = true;
    document.getElementById("cakeCutNote").hidden = true;
    cakeStatus.textContent = "The candle is waiting for your wish...";
  }

  /* -----------------------------
     Page 5: Gallery / lightbox
  ------------------------------ */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");

  document.querySelectorAll(".photo-card").forEach((card) => {
    card.addEventListener("click", () => {
      const img = card.querySelector("img");
      lightboxImg.alt = img.alt || "Memory";
      lightboxImg.src = img.currentSrc || img.src;
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";

      createBurst(10, "✦");
    });
  });

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.removeAttribute("src");
    document.body.style.overflow = "";
  }

  document.getElementById("closeLightbox").addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
  });

  lightboxImg.addEventListener("error", () => {
    showToast("Photo file nahi mili. assets folder me image check karo.");
    closeLightbox();
  });

  /* -----------------------------
     Page 6: Quiz
  ------------------------------ */
  const wrongAnswer = document.getElementById("wrongAnswer");
  const rightAnswer = document.getElementById("rightAnswer");
  const quizHint = document.getElementById("quizHint");

  wrongAnswer.addEventListener("click", (event) => {
    event.preventDefault();
    wrongAnswer.classList.remove("shake");
    void wrongAnswer.offsetWidth;
    wrongAnswer.classList.add("shake");
    quizHint.textContent = "Matlab... technically 4, but not in OUR universe. 😌";
  });

  rightAnswer.addEventListener("click", async () => {
    await playTrack("smartMusic", true);
    rightAnswer.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.12) rotate(-3deg)" },
        { transform: "scale(1)" }
      ],
      { duration: 450, easing: "ease-out" }
    );
    createBurst(55, "♥");
    createBurst(18, "✦");

    quizHint.textContent = "Exactly! You are officially too smart. ❤️";

    setTimeout(() => showScene(6), 900);
  });

  /* -----------------------------
     Page 7 / 8 ambience
  ------------------------------ */
  let firefliesStarted = false;

  function startFireflies() {
    if (firefliesStarted) return;
    firefliesStarted = true;

    const field = document.querySelector(".firefly-field");

    for (let i = 0; i < 25; i++) {
      const dot = document.createElement("span");
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.top = `${Math.random() * 100}%`;
      dot.style.animationDelay = `${-Math.random() * 3}s`;
      dot.style.animationDuration = `${2.3 + Math.random() * 2.4}s`;
      field.appendChild(dot);
    }
  }

  let petalsStarted = false;

  function startPetals() {
    if (petalsStarted) return;
    petalsStarted = true;

    const petals = document.getElementById("petals");

    // Roses fall continuously across the entire experience.
    setInterval(() => {
      const p = document.createElement("span");
      p.className = "petal";
      p.textContent = "🌹";
      p.style.left = `${Math.random() * 100}%`;
      p.style.setProperty("--drift", `${Math.random() * 35 - 17}vw`);
      p.style.animationDuration = `${6 + Math.random() * 5}s`;
      petals.appendChild(p);
      setTimeout(() => p.remove(), 12000);
    }, 520);
  }

  /* -----------------------------
     General effects
  ------------------------------ */
  function createBurst(count, char = "✦") {
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.textContent = char;
      el.style.position = "fixed";
      el.style.left = "50%";
      el.style.top = "50%";
      el.style.zIndex = "380";
      el.style.pointerEvents = "none";
      el.style.color = i % 2 ? "#ff8299" : "#ffd36b";
      el.style.fontSize = `${12 + Math.random() * 22}px`;

      const x = (Math.random() * 2 - 1) * 46;
      const y = (Math.random() * 2 - 1) * 38;

      el.animate(
        [
          {
            transform: "translate(-50%,-50%) scale(.4)",
            opacity: 0
          },
          {
            transform: `translate(calc(-50% + ${x}vw), calc(-50% + ${y}vh)) scale(1.2)`,
            opacity: 1
          },
          {
            transform: `translate(calc(-50% + ${x * 1.8}vw), calc(-50% + ${y * 1.8}vh)) scale(.1)`,
            opacity: 0
          }
        ],
        {
          duration: 1100 + Math.random() * 500,
          easing: "cubic-bezier(.2,.8,.2,1)"
        }
      );

      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1800);
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function initAmbient() {
    const sp = document.getElementById("sparkles");

    for (let i = 0; i < 36; i++) {
      const s = document.createElement("span");
      s.className = "spark";
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.animationDelay = `${-Math.random() * 2.4}s`;
      sp.appendChild(s);
    }
  }

  function resetExperience() {
    resetCake();
    doorBtn.classList.remove("opening");
    quizHint.textContent = "Think carefully, Shona... 😌";
    wrongAnswer.classList.remove("shake");

    Object.values(musicTracks).forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    activeMusic = null;
    musicBtn.innerHTML = "♫ <span>Music</span>";

    window.scrollTo({ top: 0, behavior: "auto" });
  }

  initAmbient();
  showScene(0);
})();
