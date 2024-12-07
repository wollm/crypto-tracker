async function fetchCryptoData() {
    try {
        // Extract the 'id' parameter from the URL
        const params = new URLSearchParams(window.location.search);
        const cryptoId = params.get('cryptoId');

        if (!cryptoId) {
            alert('No cryptocurrency selected!');
            return;
        }

        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=365&interval=daily`, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    'x-cg-demo-api-key': 'CG-eQBhoMmasXLVKssJmmxeZ3A7'
                },
          }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Chart data:");
        console.log(data);

        let start = getStart(data.market_caps);
        let end = data.market_caps[data.market_caps.length - 1][1];
        let change = ((end - start) / start * 100);
        let isPositive = change >= 0;

        let icon = isPositive ? 'bi-caret-up-fill' : 'bi-caret-down-fill';
        let colorClass = isPositive ? 'text-success' : 'text-danger';

        document.querySelector('#chart-title').innerHTML = `
            Yearly Price Chart <i class="bi ${icon} ${colorClass}"></i><span class="${colorClass}">${Math.abs(change).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span>
        `;

        return data; // Return the full data object
    } catch (error) {
        console.error('Error fetching cryptocurrency data:', error);
    }
}

function getStart(data){
    var target = 0;
    let i = 0;

    while(target == 0){
        target = data[i][1];
        i++;
    }
    console.log(target);
    return target;
}

// Helper function to format the timestamp into a readable month
function formatTimestampToMonth(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString("default", { month: "short", year: "numeric" });
}

async function createYearlyChart() {
    const data = await fetchCryptoData(); // Wait for the data to be fetched
    const price = data?.prices;

    if (!price) {
        console.error("Failed to fetch data or prices array is missing.");
        return;
    }

    // Prepare labels (dates) and data (prices)
    const labels = price.map(([timestamp]) => new Date(timestamp));
    const prices = price.map(([_, price]) => price);

    const ctx = document.getElementById("yearlyChart");
    if (!ctx) {
        console.error("Canvas element with id 'yearlyChart' not found.");
        return;
    }

    new Chart(ctx.getContext("2d"), {
        type: "line",
        data: {
            labels: labels, // All data points as labels
            datasets: [
                {
                    label: "Price (USD)",
                    data: prices,
                    borderColor: "#27ae60",
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3,
                    radius: 1,
                    pointHoverRadius: 5,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                },
            },
            scales: {
                x: {
                    type: "time", // Use time scale for better handling of dates
                    time: {
                        unit: "month", // Automatically simplifies labels to show only months
                        tooltipFormat: "MMM yyyy", // Format for tooltips
                        displayFormats: {
                            month: "MMM", // Format for x-axis labels
                        },
                    },
                    title: {
                        display: true,
                        text: "Month",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "Price (USD)",
                    },
                    ticks: {
                        callback: function (value) {
                            return `$${value.toLocaleString()}`; // Format y-axis as currency
                        },
                    },
                },
            },
        },
    });
}

// Initialize Chart on Page Load
document.addEventListener("DOMContentLoaded", createYearlyChart);