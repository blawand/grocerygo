document.addEventListener('DOMContentLoaded', () => {
    const usdPerLbInput = document.getElementById('usd-per-lb');
    const cadPerKgInput = document.getElementById('cad-per-kg');
    const groceryItemInput = document.getElementById('grocery-item-input');
    const clearButton = document.getElementById('clear-button');
    const averagePriceElement = document.getElementById('average-price');
    const dealInfoElement = document.getElementById('deal-info');

    const exchangeRateApi = 'https://api.exchangerate-api.com/v4/latest/USD';
    let exchangeRate = 1.25; // Default value, update dynamically

    async function fetchExchangeRate() {
        try {
            const response = await fetch(exchangeRateApi);
            const data = await response.json();
            exchangeRate = data.rates.CAD;
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
        }
    }

    async function fetchAveragePrice(item) {
        // Placeholder for fetching average price data
        // Replace with actual API call or data source
        return Math.random() * 10; // Simulated average price
    }

    function convertUsdToCadPerKg(usdPerLb) {
        return (usdPerLb * 2.20462) * exchangeRate;
    }

    function convertCadToUsdPerLb(cadPerKg) {
        return (cadPerKg / 2.20462) / exchangeRate;
    }

    function updateConversion() {
        const usdPerLb = parseFloat(usdPerLbInput.value);
        const cadPerKg = parseFloat(cadPerKgInput.value);

        if (!isNaN(usdPerLb)) {
            cadPerKgInput.value = convertUsdToCadPerKg(usdPerLb).toFixed(2);
        } else if (!isNaN(cadPerKg)) {
            usdPerLbInput.value = convertCadToUsdPerLb(cadPerKg).toFixed(2);
        }
    }

    async function updateDealInfo() {
        const item = groceryItemInput.value;
        const usdPerLb = parseFloat(usdPerLbInput.value);
        const cadPerKg = parseFloat(cadPerKgInput.value);

        if (item && !isNaN(usdPerLb)) {
            const averagePrice = await fetchAveragePrice(item);
            averagePriceElement.textContent = `Average price for ${item}: $${averagePrice.toFixed(2)} per lb`;
            dealInfoElement.textContent = usdPerLb < averagePrice ? 'This is a good deal!' : 'This is not a good deal.';
        } else if (item && !isNaN(cadPerKg)) {
            const averagePrice = await fetchAveragePrice(item) * 2.20462; // Convert to CAD per kg
            averagePriceElement.textContent = `Average price for ${item}: $${averagePrice.toFixed(2)} per kg`;
            dealInfoElement.textContent = cadPerKg < averagePrice ? 'This is a good deal!' : 'This is not a good deal.';
        }
    }

    usdPerLbInput.addEventListener('input', () => {
        cadPerKgInput.value = '';
        updateConversion();
        updateDealInfo();
    });

    cadPerKgInput.addEventListener('input', () => {
        usdPerLbInput.value = '';
        updateConversion();
        updateDealInfo();
    });

    groceryItemInput.addEventListener('input', updateDealInfo);

    clearButton.addEventListener('click', () => {
        groceryItemInput.value = '';
        usdPerLbInput.value = '';
        cadPerKgInput.value = '';
        averagePriceElement.textContent = '';
        dealInfoElement.textContent = '';
    });

    fetchExchangeRate();
});