const searchBox = document.getElementById("searchBox");
const suggestions = document.getElementById("suggestions");

searchBox.addEventListener("input", function () {
    const query = searchBox.value.toLowerCase();
    suggestions.innerHTML = "";

    if (query.length === 0) return;

    const filtered = searchBuildingData
        .filter((item) => item.name.toLowerCase().includes(query))
        .slice(0, 10);

    filtered.forEach((item) => {
        const regex = new RegExp(`(${query})`, "gi");
        const highlightedName = item.name.replace(regex, "<b>$1</b>");
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.innerHTML = highlightedName;
        div.addEventListener("click", () => {
            searchBox.value = item.name;
            suggestions.innerHTML = "";
        });
        suggestions.appendChild(div);
    });
});

document.addEventListener("click", (event) => {
    if (!event.target.closest("#suggestions") && event.target !== searchBox) {
        suggestions.innerHTML = "";
    }
});