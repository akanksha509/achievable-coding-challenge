import { displayQuestion } from "./helpers.mjs";

// Returns an integer between min and max (inclusive).
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Main function to generate a randomized question about ice sculptures.
function randomizeQuestion() {
  let attempts = 0; // Counter to avoid infinite loops
  const MAX_ATTEMPTS = 1000; // Maximum allowed tries

  while (true) {
    attempts++;
    // If we exceed the limit, show a fallback message and return.
    if (attempts > MAX_ATTEMPTS) {
      console.warn("Max attempts reached. No valid scenario found.");
      const fallbackPrompt = `
        <p>We couldn't find a valid random scenario within ${MAX_ATTEMPTS} tries.</p>
        <p>Please click Randomize again or refresh the page.</p>
      `;
      displayQuestion({
        prompt: fallbackPrompt,
        choices: [],
        answer: null,
        explanation: "No valid scenario was found in time.",
      });
      return;
    }

    // Generate random counts for each event (1..10).
    const a1 = getRandomInt(1, 10);
    const b1 = getRandomInt(1, 10);
    const a2 = getRandomInt(1, 10);
    const b2 = getRandomInt(1, 100);

    // Generate base prices for small and large sculptures.
    const sPrice = getRandomInt(20, 80);
    const lPrice = sPrice + getRandomInt(20, 60);

    // Compute raw totals (unformatted) for each event.
    const c1Raw = a1 * sPrice + b1 * lPrice;
    const c2Raw = a2 * sPrice + b2 * lPrice;

    // Skip if totals exceed 5000 (too large).
    if (c1Raw > 5000 || c2Raw > 5000) continue;

    // Format totals with commas for display.
    const c1 = c1Raw.toLocaleString();
    const c2 = c2Raw.toLocaleString();

    // Solve the system of equations.
    const numerator = b2 * c1Raw - b1 * c2Raw;
    const denominator = b2 * a1 - b1 * a2;
    if (denominator === 0) continue; // Avoid degenerate scenario

    // Price of small sculpture (s).
    const s = numerator / denominator;
    if (!Number.isInteger(s) || s <= 0) continue;

    // Price of large sculpture (L).
    const L = (c2Raw - a2 * s) / b2;
    if (!Number.isInteger(L) || L <= 0) continue;

    // Difference must be positive (large > small).
    const difference = L - s;
    if (difference <= 0) continue;

    // Handle pluralization in the prompt.
    const smallPlural1 = a1 > 1 ? "sculptures" : "sculpture";
    const largePlural1 = b1 > 1 ? "sculptures" : "sculpture";
    const smallPlural2 = a2 > 1 ? "sculptures" : "sculpture";
    const largePlural2 = b2 > 1 ? "sculptures" : "sculpture";

    // Build the prompt with the random values inserted.
    const prompt = `
      An event planner routinely orders ice sculptures for the corporate events they plan.
      For an executive dinner in Summerfield, they ordered
      <b>${a1}</b> small ice ${smallPlural1}
      and <b>${b1}</b> large ice ${largePlural1},
      which cost <b>$${c1}</b>.
      Then, for a release party in Greenwood, she ordered
      <b>${a2}</b> small ice ${smallPlural2}
      and <b>${b2}</b> large ice ${largePlural2},
      which cost a total of <b>$${c2}</b>.
      What is the price difference, in dollars, between the large and small ice sculptures?
    `;

    // Generate distractors around the difference.
    const offsetRange = Math.max(20, Math.round(difference * 0.5));
    const distractors = new Set();
    while (distractors.size < 4) {
      const offset = getRandomInt(-offsetRange, offsetRange);
      if (offset === 0) continue;
      const maybe = difference + offset;
      if (Math.abs(maybe - difference) < 5) continue;
      if (maybe > 0) distractors.add(maybe);
    }
    let choicesArr = Array.from(distractors);

    // Insert the correct answer at a random position.
    const idx = getRandomInt(0, choicesArr.length);
    choicesArr.splice(idx, 0, difference);

    // Build the explanation showing how we solve for s and L.
    const explanation = `
<p>
Here we see the word "total" used which implies addition. So let's first begin with
the Summerfield total cost expression. We know that each size of sculpture has its
own price. Let's use s for small sculptures and L for large sculptures. Each sculpture
costs a price. The word each makes us think of multiplication. So we're going to multiply
the number of each type of sculpture times its price, and then add them together to get the total.
</p>

<p><b>Summerfield:</b></p>
<pre>${c1Raw} = (${a1} × s) + (${b1} × L)</pre>

<p><b>Greenwood:</b></p>
<pre>${c2Raw} = (${a2} × s) + (${b2} × L)</pre>

<p>
Now that we have two equations and two variables, we can solve them as a system of equations
using the substitution method.
</p>

<p><b>1) Solve Greenwood for L:</b></p>
<pre>
L = [${c2Raw} - (${a2} × s)] / ${b2}
</pre>

<p><b>2) Substitute L into the Summerfield equation:</b></p>
<pre>
${c1Raw} = (${a1} × s) + (${b1} × [(${c2Raw} - ${a2} × s) / ${b2}])
</pre>

<p><b>3) Multiply both sides by ${b2} to clear the denominator:</b></p>
<pre>
${b2} × ${c1Raw} = ${b2} × ${a1} × s + (${b1} × ${c2Raw}) - (${b1} × ${a2} × s)
</pre>

<p><b>4) Rearrange to isolate s:</b></p>
<pre>
${b2} × ${c1Raw} = (${b1} × ${c2Raw}) + s(${b2} × ${a1} - ${b1} × ${a2})

=> s = [${b2} × ${c1Raw} - ${b1} × ${c2Raw}] / [${b2} × ${a1} - ${b1} × ${a2}]
=> s = ${s}
</pre>

<p>
Now we know the price of the small sculptures, but we're not done! We still need
the price of the large sculptures. So let's plug our s back into Greenwood:
</p>
<pre>
${c2Raw} = (${a2} × ${s}) + (${b2} × L)
=> L = [${c2Raw} - (${a2} × ${s})] / ${b2}
=> L = ${L}
</pre>

<p><b>5) Finally, the difference between the large and small sculptures:</b></p>
<pre>
L - s = ${L} - ${s} = ${difference}
</pre>

<p>
So our answer here should be <b>${difference}</b>.
</p>
    `;

    // Display the question, choices, and explanation.
    displayQuestion({
      prompt,
      choices: choicesArr,
      answer: difference,
      explanation,
    });

    // Return after a valid scenario is displayed.
    return {
      prompt,
      choices: choicesArr,
      answer: difference,
      explanation,
    };
  }
}

// Attach randomizeQuestion to the Randomize button.
document
  .querySelector(".randomize-btn")
  .addEventListener("click", randomizeQuestion);

// Hide the refresh-message and generate an initial question.
document.querySelector(".refresh-message").hidden = true;
randomizeQuestion();
