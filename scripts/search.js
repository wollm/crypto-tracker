document.addEventListener("DOMContentLoaded", () => {
    const searchBox = document.getElementById("search-box");
    const searchBtn = document.getElementById("search-btn");
    const errorMsg = document.getElementById("error-msg");
    const suggestionsList = document.getElementById("crypto-suggestions");
    let cryptoList = [];

    // Fetch top cryptocurrencies sorted by market cap
    async function fetchCryptoList() {
        try {
            const response = await fetch(
                "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1", {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        'x-cg-demo-api-key': 'CG-eQBhoMmasXLVKssJmmxeZ3A7'
                    },
              }
            );
            cryptoList = await response.json();
        } catch (error) {
            console.error("Error fetching cryptocurrency list:", error);
            errorMsg.textContent = "Failed to load suggestions. Please try again later.";
            errorMsg.style.display = "block";
        }
    }

    fetchCryptoList();

    // Function to handle search and redirect
    function handleSearch(query) {
        if (!query) {
            errorMsg.textContent = "Please enter a cryptocurrency name or symbol.";
            errorMsg.style.display = "block";
            return;
        }

        // Find the selected cryptocurrency
        const crypto = cryptoList.find(c =>
            `${c.name.toLowerCase()} (${c.symbol.toLowerCase()})` === query ||
            c.name.toLowerCase() === query ||
            c.symbol.toLowerCase() === query
        );

        if (crypto) {
            // Redirect to details page
            window.location.href = `details.html?cryptoId=${crypto.id}`;
        } else {
            errorMsg.textContent = "Cryptocurrency not found. Please try again.";
            errorMsg.style.display = "block";
        }
    }

    // Display suggestions dynamically
    searchBox.addEventListener("input", () => {
        const query = searchBox.value.trim().toLowerCase();
        errorMsg.style.display = "none";
        suggestionsList.innerHTML = ""; // Clear previous suggestions

        if (query) {
            const filteredCryptos = cryptoList.filter(c =>
                c.name.toLowerCase().includes(query) || c.symbol.toLowerCase().includes(query)
            );

            if (filteredCryptos.length > 0) {
                suggestionsList.style.display = "block"; // Show suggestions
                filteredCryptos.forEach(crypto => {
                    const li = document.createElement("li");
                    li.className = "list-group-item";
                    li.textContent = `${crypto.name} (${crypto.symbol.toUpperCase()})`;
                    li.addEventListener("click", () => {
                        searchBox.value = `${crypto.name} (${crypto.symbol.toUpperCase()})`;
                        suggestionsList.style.display = "none"; // Hide suggestions
                        handleSearch(searchBox.value.trim().toLowerCase());
                    });
                    suggestionsList.appendChild(li);
                });
            } else {
                suggestionsList.style.display = "none"; // Hide suggestions if none match
            }
        } else {
            suggestionsList.style.display = "none"; // Hide suggestions for empty input
        }
    });

    // Submit form on "Enter" key press
    searchBox.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent the default form submission behavior
            suggestionsList.style.display = "none"; // Hide suggestions
            handleSearch(searchBox.value.trim().toLowerCase());
        }
    });

    // Trigger search button click on submit
    searchBtn.addEventListener("click", () => {
        handleSearch(searchBox.value.trim().toLowerCase());
    });

    // Hide suggestions when clicking outside
    document.addEventListener("click", event => {
        if (!searchBox.contains(event.target) && !suggestionsList.contains(event.target)) {
            suggestionsList.style.display = "none";
        }
    });
});

document.querySelector(".nav-link[href='details.html']").addEventListener("click", event => {
    event.preventDefault(); // Prevent default navigation

    // Get the last viewed crypto ID from localStorage
    const lastViewedCrypto = localStorage.getItem("lastViewedCrypto");

    // Redirect to the stored crypto or default to Bitcoin
    const cryptoId = lastViewedCrypto || "bitcoin";
    window.location.href = `details.html?cryptoId=${cryptoId}`;
});