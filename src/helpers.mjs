export const displayQuestion = ({ prompt, choices, answer, explanation }) => {
  document.querySelector(".prompt").innerHTML = prompt;

  const choicesContainer = document.querySelector(".choices");
  choicesContainer.innerHTML = "";

  choices.forEach((choice) => {
    const choiceElement = document.createElement("li");
    choiceElement.innerHTML =
      choice === answer ? `<b>${choice} (answer)</b>` : choice;
    choicesContainer.appendChild(choiceElement);
  });

  document.querySelector(".explanation").innerHTML = explanation;

  const random = String(Math.random()).slice(2, 8);
  document.querySelector(".rand").innerHTML = `RAND: ${random}`;
};

export function generateRandomVariables(getRandomInt) {
  // Generates random sculpture counts in [1..10].
  const a1 = getRandomInt(1, 10);
  const b1 = getRandomInt(1, 10);
  const a2 = getRandomInt(1, 10);
  const b2 = getRandomInt(1, 10);

  // Creates base prices with constraints.
  const sPrice = getRandomInt(20, 80);
  const lPrice = sPrice + getRandomInt(20, 60);

  // Computes raw totals for each event.
  const c1Raw = a1 * sPrice + b1 * lPrice;
  const c2Raw = a2 * sPrice + b2 * lPrice;

  return { a1, b1, a2, b2, c1Raw, c2Raw };
}
