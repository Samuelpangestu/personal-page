const planner = document.querySelector("#planner-form");
const estimate = document.querySelector("#planner-value");
const explanation = document.querySelector("#planner-calculation");
const format = new Intl.NumberFormat("en", { maximumSignificantDigits: 6 });
const wholeNumber = new Intl.NumberFormat("en");

planner.addEventListener("submit", (event) => {
  event.preventDefault();

  const requestRate = planner.elements["request-rate"].valueAsNumber;
  const requestsPerIteration = planner.elements["requests-per-run"].valueAsNumber;
  const duration = planner.elements["run-duration"].valueAsNumber;
  const iterationRate = requestRate / requestsPerIteration;
  const concurrency = iterationRate * duration;
  const virtualUsers = Math.ceil(concurrency);
  const unit = virtualUsers === 1 ? "virtual user" : "virtual users";

  estimate.textContent = `${wholeNumber.format(virtualUsers)} ${unit}`;
  explanation.textContent = `${format.format(requestRate)} requests/s ÷ ${format.format(requestsPerIteration)} requests per iteration = ${format.format(iterationRate)} iterations/s. At ${format.format(duration)} seconds per iteration, estimated concurrency is ${format.format(concurrency)}, rounded up to size the test.`;
});

planner.hidden = false;
