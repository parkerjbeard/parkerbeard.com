"use strict";

document.addEventListener("DOMContentLoaded", function () {
  let isHovered = false;
  let isTouched = false;
  const ageCounter = document.getElementById("age-counter");

  function updateAge() {
    if (!ageCounter) return;

    const birthYear = 2002;
    const birthMonth = 6;
    const birthDay = 27;
    const birthHour = 13;
    const birthMinute = 40;
    const birthDate = new Date(
      Date.UTC(birthYear, birthMonth, birthDay, birthHour + 7, birthMinute),
    );
    const now = new Date();
    const diff = now - birthDate;
    const years = diff / (1000 * 60 * 60 * 24 * 365.25);
    const yearsInt = Math.floor(years);
    const remainingDays = (years - yearsInt) * 365.25;
    const daysInt = Math.floor(remainingDays);
    const remainingHours = (remainingDays - daysInt) * 24;
    const hoursInt = Math.floor(remainingHours);
    const remainingMinutes = (remainingHours - hoursInt) * 60;
    const minutesInt = Math.floor(remainingMinutes);
    const remainingSeconds = (remainingMinutes - minutesInt) * 60;
    const secondsInt = Math.floor(remainingSeconds);

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
    const essays = ["patriotic-for-what.html", "beyond-frontiers.html"];
    randomEssayButton.addEventListener("click", function () {
      const randomIndex = Math.floor(Math.random() * essays.length);
      window.location.href = essays[randomIndex];
    });
  }
});
