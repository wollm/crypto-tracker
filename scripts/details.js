function setExchangeRate(price, label){
  const coinInput = document.getElementById("coinInput");
  const usdInput = document.getElementById("usdInput");
  document.querySelector('#convert').textContent = `${label} Converter`;
  let boxes = document.querySelectorAll('span.input-group-text');
  boxes[0].textContent = label;
  coinInput.value = 1;
  usdInput.value = price;

  coinInput.addEventListener("input", () => {
    const coinValue = parseFloat(coinInput.value) || 0;
    usdInput.value = (coinValue * price).toFixed(2);
  });

  usdInput.addEventListener("input", () => {
    const usdValue = parseFloat(usdInput.value) || 0;
    coinInput.value = (usdValue / price).toFixed(8);
  });
}

// Function to handle "View Details" button click
function logDetails(cryptoId) {
  // Save the most recently viewed crypto ID in localStorage
  localStorage.setItem("lastViewedCrypto", cryptoId);
  console.log("set item");
}

function showDetails(cryptoId){
  window.location.href = `details.html?cryptoId=${cryptoId}`;
}

// Utility function to fetch and display crypto details
async function fetchCryptoDetails() {
  try {
      // Extract the 'id' parameter from the URL
      const params = new URLSearchParams(window.location.search);
      const cryptoId = params.get('cryptoId');

      if (!cryptoId) {
          alert('No cryptocurrency selected!');
          return;
      }

      // Fetch data from CoinGecko API
      const response = await fetch(`https://cors-anywhere.herokuapp.com/https://api.coingecko.com/api/v3/coins/${cryptoId}`, {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-cg-demo-api-key': 'CG-eQBhoMmasXLVKssJmmxeZ3A7'
        },
  });
      const data = await response.json();

      // Extract current price
      const currentPrice = data.market_data.current_price.usd.toFixed(2);

      // Call setExchangeRate with the current price
      setExchangeRate(currentPrice, data.symbol.toUpperCase());

      // Update the page with the fetched data
      document.getElementById('crypto-name').textContent = data.name;
      document.querySelector('h1').textContent = `${data.name} (${data.symbol.toUpperCase()})`;
      document.querySelector('.hero-section p').innerHTML = data.description.en.split('.')[0];

      logDetails(cryptoId);

      // Prepare HTML for the details
      const detailsHTML = `
          <div class="col-md-8">
              <a href="https://cors-anywhere.herokuapp.com/https://www.coingecko.com/en/coins/${data.id}" target="_blank">
                <img src="${data.image.large}" alt="${data.name}" class="img-fluid mb-3 mx-auto d-block">
              </a>
              <p><strong>Symbol:</strong> ${data.symbol.toUpperCase()}</p>
              <p><strong>Current Price:</strong> $${data.market_data.current_price.usd.toLocaleString()}</p>
              <p><strong>Market Cap:</strong> $${data.market_data.market_cap.usd.toLocaleString()}</p>
              <p><strong>24h High:</strong> $${data.market_data.high_24h.usd.toLocaleString()}</p>
              <p><strong>24h Low:</strong> $${data.market_data.low_24h.usd.toLocaleString()}</p>
              <p><strong>All-Time High:</strong> $${data.market_data.ath.usd.toLocaleString()}</p>
              <p><strong>Price Change (24h):</strong> ${data.market_data.price_change_percentage_24h.toFixed(2)}%</p>
              <p><strong>Description:</strong> ${data.description.en ? data.description.en.split('.').slice(0, 2).join('.') + '.' : 'No description available.'}</p>
          </div>
      `;

      document.querySelector('#supply-details').innerHTML = `
        <p><strong>Total Supply:</strong> ${data.market_data.total_supply ? data.market_data.total_supply.toLocaleString() : 'N/A'}</p>
              <p><strong>Circulating Supply:</strong> ${data.market_data.circulating_supply.toLocaleString()}</p>
      `;



      // Insert details into the page
      document.getElementById('crypto-details').innerHTML = detailsHTML;

  } catch (error) {
      console.error('Error fetching cryptocurrency details:', error);
  }
}

async function fetchTrendingCryptos() {
  try {
      const response = await fetch('https://cors-anywhere.herokuapp.com/https://api.coingecko.com/api/v3/search/trending', {
          method: 'GET',
          headers: {
              accept: 'application/json',
              'x-cg-demo-api-key': 'CG-eQBhoMmasXLVKssJmmxeZ3A7'
          },
      });
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const relatedContainer = document.getElementById('related-cryptos');
      const data = await response.json();
      const trending = data.coins.slice(0,4);

      trending.forEach(crypto => {
        let change = crypto.item.data.price_change_percentage_24h.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        let isPositive = change >= 0;

        let icon = isPositive ? 'bi-caret-up-fill' : 'bi-caret-down-fill';
        let colorClass = isPositive ? 'text-success' : 'text-danger';
          const cryptoHTML = `
              <div class="card text-center col-sm-2.5">
                  <div class="card-body">
                      <img src="${crypto.item.large}" class="card-img-top mb-4" alt="${crypto.item.name}">
                      <h5>${crypto.item.name}</h5>
                      <p>(${crypto.item.symbol.toUpperCase()}) <i class="bi ${icon} ${colorClass}"></i><span class="${colorClass}">${Math.abs(change)}%</span></p>
                      <div class="price">$${crypto.item.data.price.toFixed(5)}</div>
                  </div>
                  <div class="card-footer text-center">
                    <button onClick="showDetails('${crypto.item.id}')" class="btn bg-dark text-white">View Details</button>
                </div>
              </div>
          `;
          relatedContainer.innerHTML += cryptoHTML;
      });
  } catch (error) {
      console.error('Error fetching trending cryptocurrency data:', error);
  }
}

// Call the functions when the page loads
fetchCryptoDetails();
fetchTrendingCryptos();