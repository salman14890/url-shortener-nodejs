const form = document.getElementById("form");
const result = document.getElementById("short-url");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const url = new FormData(form).get("url");
  const response = await fetch("/short-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });
  const data = await response.json();
  result.textContent = data.shortUrl;
});