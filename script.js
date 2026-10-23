
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const results = document.getElementById("results");
const status = document.getElementById("result-count");
const emptyState = document.getElementById("empty-state");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = input.value.trim();

  // Ignore empty searches
  if (!query) {
    return;
  }

  // Build the API URL
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query" +
    "&generator=search&gsrsearch=" + encodeURIComponent(query) +
    "&gsrnamespace=6&gsrlimit=12&prop=imageinfo" +
    "&iiprop=url&iiurlwidth=300&format=json&origin=*";

  try {
    const response = await fetch(url);

    // Check whether the request succeeded
    if (!response.ok) {
      throw new Error("Request failed: " + response.status);
    }

    const data = await response.json();

    // Convert the API results into an array
    const items = data.query
      ? Object.values(data.query.pages)
      : [];

    // Clear old results before displaying new ones
    results.innerHTML = "";
    emptyState.hidden = true;

    // Enhancement: display the result count
    status.textContent =
      "Showing " + items.length + " results for \"" + query + "\"";

    if (items.length === 0) {
      emptyState.hidden = false;
      emptyState.querySelector("strong").textContent =
        "No images found.";
      emptyState.querySelector("span:last-child").textContent =
        "Try another search topic.";
      return;
    }

    // Create one card for each image
    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "card";

      const imageUrl = item.imageinfo?.[0]?.thumburl;

if (!imageUrl) {
  return;
}

const img = document.createElement("img");
img.src = imageUrl;
img.alt = item.title;
img.loading = "lazy";

      const caption = document.createElement("p");
      caption.textContent = item.title
        .replace("File:", "")
        .replace(/_/g, " ");

      card.appendChild(img);
      card.appendChild(caption);
      results.appendChild(card);
    });
  } catch (error) {
    results.innerHTML = "";
    status.textContent = "Unable to load images.";
    emptyState.hidden = false;
    emptyState.querySelector("strong").textContent =
      "Something went wrong.";
    emptyState.querySelector("span:last-child").textContent =
      "Check your internet connection and try again.";
    console.error(error);
  }
});

// Make the category chips perform searches
const chips = document.querySelectorAll(".category-chip");

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    input.value = chip.textContent.trim();
    form.requestSubmit();
  });
});

// Clear the search input
const clearButton = document.getElementById("clear-button");

clearButton.addEventListener("click", () => {
  input.value = "";
  input.focus();
});
