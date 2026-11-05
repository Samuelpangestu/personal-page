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

// Career timeline: size each segment by months in role, so "present" stays
// accurate without editing the HTML.
const parseMonth = (value) =>
  value === "present" ? new Date() : new Date(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, 1);
const monthsBetween = (start, end) =>
  (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
let careerMonths = 0;
document.querySelectorAll(".career-bar li").forEach((role) => {
  const months = Math.max(1, monthsBetween(parseMonth(role.dataset.start), parseMonth(role.dataset.end)));
  role.style.setProperty("--months", months);
  careerMonths += months;
});
const careerTotal = document.querySelector("[data-career-total]");
if (careerTotal && careerMonths) {
  careerTotal.textContent = `${Math.floor(careerMonths / 12)} yr ${careerMonths % 12} mo`;
}

// One-time sequences (career bar, Case 01 handoffs, Case 02 statuses) play
// when their figure enters the viewport. Without JS or with reduced motion
// the CSS shows the finished state directly.
if (!reducedMotion.matches && "IntersectionObserver" in window) {
  const root = document.documentElement;
  root.classList.add("motion");
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("in-view");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.4 });
  document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) root.classList.remove("motion");
  });
}
