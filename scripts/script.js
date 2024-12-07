// Store the current sorting direction (ascending/descending)
let currentSort = { column: 0, direction: 'asc' };

// Fetch cryptocurrency data from CoinGecko API
async function fetchCryptoData(marketValue) {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=50', {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'x-cg-demo-api-key': 'CG-eQBhoMmasXLVKssJmmxeZ3A7'
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayCryptoData(data, marketValue); // Display this data on the screen
        return data; //Return data to be used in future functions
    } catch (error) {
        console.error('Error fetching cryptocurrency data:', error);
    }
}

// Function to display cryptocurrency data in the crypto table
function displayCryptoData(data, marketValue) {
    const tbody = document.getElementById('crypto-table-body');
    tbody.innerHTML = '';

    //Cycle through each individual crypto item being pulled
    data.forEach(crypto => {
        // Assign values and handle missing or undefined values with fallbacks
        const rank = crypto.market_cap_rank || 'N/A';
        const image = crypto.image || '';
        const name = crypto.name || 'Unknown';
        const symbol = crypto.symbol ? crypto.symbol.toUpperCase() : 'N/A';
        const currentPrice = crypto.current_price !== undefined ? crypto.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 }) : 'N/A';
        const volume = crypto.total_volume !== undefined ? crypto.total_volume.toLocaleString() : 'N/A';
        const marketCap = crypto.market_cap !== undefined ? crypto.market_cap : 'N/A';
        const circulatingSupply = crypto.circulating_supply !== undefined
            ? crypto.circulating_supply.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
            : 'N/A';
        const priceChange24h = crypto.price_change_percentage_24h !== undefined ? crypto.price_change_percentage_24h : null;
        const isPositive24h = priceChange24h !== null && priceChange24h >= 0;
        const priceChange24hDisplay = priceChange24h !== null
            ? `${isPositive24h ? '▲' : '▼'} ${Math.abs(priceChange24h).toFixed(2)}%`
            : 'N/A';

        const priceChange24hClass = isPositive24h ? 'text-success' : 'text-danger';
        const marketShare = ((marketCap / marketValue) * 100).toLocaleString();

        // Construct the row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rank}</td>
            <td class="left">
                <img src="${image}" alt="${name}" class="me-2" style="width: 24px; height: 24px; object-fit: contain;">
                <a href="details.html?cryptoId=${crypto.id}" class="text-decoration-none">${name} (${symbol})</a>
            </td>
            <td>$${currentPrice}</td>
            <td class="${priceChange24hClass}">${priceChange24hDisplay}</td>
            <td>$${volume}</td>
            <td>${circulatingSupply}</td>
            <td>$${marketCap.toLocaleString()}</td>
            <td>${marketShare}%</td>
        `;

        tbody.appendChild(row);
    });
}

// Function to sort the table
function sortTable(data, column, direction) {
    const sortedData = [...data];

    sortedData.sort((a, b) => {
        let aValue, bValue;

        switch (column) {
            case 'rank':
                aValue = a.market_cap_rank;
                bValue = b.market_cap_rank;
                break;
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case 'price':
                aValue = a.current_price;
                bValue = b.current_price;
                break;
            case 'change24h':
                aValue = a.price_change_percentage_24h;
                bValue = b.price_change_percentage_24h;
                break;
            case 'volume':
                aValue = a.total_volume;
                bValue = b.total_volume;
                break;
            case 'circulatingSupply':
                aValue = a.circulating_supply;
                bValue = b.circulating_supply;
                break;
            case 'marketCap':
                aValue = a.market_cap;
                bValue = b.market_cap;
                break;
            default:
                return 0;
        }

        if (direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    return sortedData;
}

// Add listeners to the table headers to allow for them to be sorted
function addSortingListeners(data, marketValue) {
    const headers = document.querySelectorAll('th[data-sort]');

    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-sort');
            const newDirection = (currentSort.column === column && currentSort.direction === 'asc') ? 'desc' : 'asc';

            currentSort = { column, direction: newDirection };

            // Get the sorted data
            const sortedData = sortTable(data, column, newDirection);

            //Display the updated table data
            displayCryptoData(sortedData, marketValue);

            // Update the table heading icons to showcase which column is being sorted
            updateSortIcons(column, newDirection);
        });
    });
}

// Update th icons to indetify the column currently being sorted
function updateSortIcons(activeColumn, direction) {
    const headers = document.querySelectorAll('th[data-sort]');

    headers.forEach(header => {
        const column = header.getAttribute('data-sort');
        const icon = header.querySelector('.sort-icon');

        if (column === activeColumn) {
            // Update the active column icon
            icon.className = `sort-icon bi ${direction === 'asc' ? 'bi-caret-up-fill' : 'bi-caret-down-fill'}`;
        } else {
            // Reset other icons
            icon.className = 'sort-icon bi';
        }
    });
}

// Fetch crypto market data from CoinGecko API
async function fetchMarketData() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/global', {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'x-cg-demo-api-key': 'CG-eQBhoMmasXLVKssJmmxeZ3A7'
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        updateMarketInfo(data.data);
        return data.data.total_market_cap.usd;
    } catch (error) {
        console.error('Error fetching cryptocurrency data:', error);
    }
}

// Update the overall crypto market data on the page
function updateMarketInfo(data){
    console.log(data);

    //Grab the market overview container
    let market = document.querySelector('#market-overview .row');


    const priceChange = data.market_cap_change_percentage_24h_usd;
    let price = getPriceChangeDisplay(priceChange);

    const priceChangeClass = priceChange>0 ? 'text-success' : 'text-danger';

    market.children[0].innerHTML = `
    <h3 class="mb-1">${data.active_cryptocurrencies.toLocaleString()}</h3>
    <p class="mb-1"> Total Coins in Circulation</p>
    `;

    market.children[1].innerHTML = `
    <h3 class="mb-1">${data.markets.toLocaleString()}</h3>
    <p class="mb-1"> Total Markets (Unique Trading Pairs)</p>
    `;

    market.children[2].innerHTML = `
    <h3 id="market-value" class="mb-1">$${data.total_market_cap.usd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
    <p class="mb-2 ${priceChangeClass}"> Total Market Cap ${price}</p>
    <img class="market" src="https://www.coingecko.com/total_market_cap.svg" alt="Total Market Price Chart" srcset="">
    `;

    market.children[3].innerHTML = `
    <h3 class="mb-1">$${data.total_volume.usd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
    <p class="mb-2">24 Hour Trading Volume</p>
    <img class="market" src="https://www.coingecko.com/total_volume.svg" alt="Total Market Price Chart" srcset="">
    `;
}


function getPriceChangeDisplay(price){
    const isPositive = price !== null && price >= 0;
    return price !== null
        ? `${isPositive ? '▲' : '▼'} ${Math.abs(price).toFixed(2)}%`
        : 'N/A';
    
}

document.querySelector(".nav-link[href='details.html']").addEventListener("click", event => {
    event.preventDefault(); // Prevent default navigation

    // Get the last viewed crypto ID from localStorage
    const lastViewedCrypto = localStorage.getItem("lastViewedCrypto");

    // Redirect to the stored crypto or default to Bitcoin
    const cryptoId = lastViewedCrypto || "bitcoin";
    window.location.href = `details.html?cryptoId=${cryptoId}`;
});


fetchMarketData().then(marketValue => {
    fetchCryptoData(marketValue).then(data => {
        updateSortIcons('rank', 'asc');
        addSortingListeners(data, marketValue);
    });
});