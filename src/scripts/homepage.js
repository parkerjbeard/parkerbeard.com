"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const ageCounter = document.getElementById("age-counter");
  let isHovered = false;
  let isTouched = false;

  function updateAge() {
    if (!ageCounter) return;

    const birthDate = new Date(Date.UTC(2002, 6, 27, 20, 40));
    const years = (new Date() - birthDate) / (1000 * 60 * 60 * 24 * 365.25);
    const yearsInt = Math.floor(years);
    const remainingDays = (years - yearsInt) * 365.25;
    const daysInt = Math.floor(remainingDays);
    const remainingHours = (remainingDays - daysInt) * 24;
    const hoursInt = Math.floor(remainingHours);
    const remainingMinutes = (remainingHours - hoursInt) * 60;
    const minutesInt = Math.floor(remainingMinutes);
    const secondsInt = Math.floor((remainingMinutes - minutesInt) * 60);

    ageCounter.dataset.detailed = `${yearsInt} years, ${daysInt} days, ${hoursInt} hours, ${minutesInt} minutes, and ${secondsInt} seconds old`;
    ageCounter.dataset.decimal = years.toFixed(10);
    ageCounter.textContent =
      isHovered || isTouched ? ageCounter.dataset.detailed : ageCounter.dataset.decimal;
  }

  if (ageCounter) {
    ageCounter.addEventListener("mouseenter", function () {
      isHovered = true;
      this.textContent = this.dataset.detailed;
    });

    ageCounter.addEventListener("mouseleave", function () {
      isHovered = false;
      if (!isTouched) this.textContent = this.dataset.decimal;
    });

    ageCounter.addEventListener("click", function () {
      isTouched = !isTouched;
      this.textContent = isTouched ? this.dataset.detailed : this.dataset.decimal;
    });

    updateAge();
    setInterval(updateAge, 50);
  }

  const randomEssayButton = document.getElementById("randomEssayBtn");
  if (randomEssayButton) {
    const essayUrls = Array.from(document.querySelectorAll(".essay-list__title a"))
      .map((link) => link.getAttribute("href"))
      .filter(Boolean);

    randomEssayButton.addEventListener("click", () => {
      const url = essayUrls[Math.floor(Math.random() * essayUrls.length)];
      if (url) window.location.href = url;
    });
  }
});
