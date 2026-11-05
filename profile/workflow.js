// Scroll-linked highlight: the step being read lights up its nodes in the
// matching diagram. With reduced motion nothing is highlighted and every
// step and node stays fully readable.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const groups = Array.from(document.querySelectorAll("[data-scroll-steps]"), (root) => ({
  steps: Array.from(root.querySelectorAll("[data-step]")),
  nodes: Array.from(root.querySelectorAll("[data-stage]")),
}));
let frame = 0;

function updateStage() {
  frame = 0;
  const readingLine = window.innerHeight * 0.6;

  for (const { steps, nodes } of groups) {
    let active = null;
    if (!reducedMotion.matches) {
      const current = steps.findLast((step) => step.getBoundingClientRect().top <= readingLine);
      active = current ? current.dataset.step : null;
    }
    steps.forEach((step) => step.classList.toggle("is-active", step.dataset.step === active));
    nodes.forEach((node) => node.classList.toggle("is-active", node.dataset.stage === active));
  }
}

function scheduleUpdate() {
  if (!frame) frame = window.requestAnimationFrame(updateStage);
}

window.addEventListener("scroll", scheduleUpdate, { passive: true });
window.addEventListener("resize", scheduleUpdate);
reducedMotion.addEventListener("change", scheduleUpdate);
updateStage();
