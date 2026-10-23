
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const results = document.getElementById("results");
const status = document.getElementById("result-count");
const emptyState = document.getElementById("empty-state");

const originalMessage = {
  title: "Your visual adventure starts here.",
  description:
    "Search for a topic and your discoveries will appear in this space."
};

function showEmptyState(title, description) {
  emptyState.hidden = false;
  emptyState.querySelector("strong").textContent = title;
  emptyState.querySelector("span:last-child").textContent = description;
}

function showLoading(query) {
  results.innerHTML = "";
  emptyState.hidden = true;
  status.textContent = "Searching for \"" + query + "\"...";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = input.value.trim();

  if (!query) {
    return;
  }

  const url =
    "https://commons.wikimedia.org/w/api.php?action=query" +
    "&generator=search&gsrsearch=" + encodeURIComponent(query) +
    "&gsrnamespace=6&gsrlimit=12&prop=imageinfo" +
    "&iiprop=url&iiurlwidth=300&format=json&origin=*";

  // Loading state: show feedback before fetching
  showLoading(query);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Request failed: " + response.status);
    }

    const data = await response.json();
    const items = data.query
      ? Object.values(data.query.pages)
      : [];

    results.innerHTML = "";

    const validItems = items.filter(
      (item) => item.imageinfo?.[0]?.thumburl
    );

    if (validItems.length === 0) {
      status.textContent = "No results for \"" + query + "\"";
      showEmptyState(
        "No images found.",
        "Try another search topic."
      );
      return;
    }

    validItems.forEach((item) => {
      const card = document.createElement("article");
      card.className = "card";

      const img = document.createElement("img");
      img.src = item.imageinfo[0].thumburl;
      img.alt = item.title.replace("File:", "").replace(/_/g, " ");
      img.loading = "lazy";

      const caption = document.createElement("p");
      caption.textContent = item.title
        .replace("File:", "")
        .replace(/_/g, " ");

      card.appendChild(img);
      card.appendChild(caption);
      results.appendChild(card);
    });

    status.textContent =
      "Showing " + validItems.length +
      " results for \"" + query + "\"";

    emptyState.hidden = true;
  } catch (error) {
    results.innerHTML = "";
    status.textContent = "Search failed";

    showEmptyState(
      "Something went wrong.",
      "Check your internet connection and try again."
    );

    console.error(error);
  }
});

// Category chips trigger searches
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
