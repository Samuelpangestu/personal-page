const steps = Array.from(document.querySelectorAll(".case-steps li"));
const stages = document.querySelectorAll(".diagram li");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let frame = 0;

function updateStage() {
  frame = 0;
  let active = -1;

  if (!reducedMotion.matches) {
    const readingLine = window.innerHeight * 0.65;
    active = steps.findLastIndex((step) => step.getBoundingClientRect().top <= readingLine);
  }

  steps.forEach((step, index) => {
    step.classList.toggle("is-active", index === active);
    stages[index].classList.toggle("is-active", index === active);
  });
}

function scheduleUpdate() {
  if (!frame) frame = window.requestAnimationFrame(updateStage);
}

window.addEventListener("scroll", scheduleUpdate, { passive: true });
window.addEventListener("resize", scheduleUpdate);
reducedMotion.addEventListener("change", scheduleUpdate);
updateStage();
