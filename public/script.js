document.addEventListener('DOMContentLoaded', () => {
    const usdPerLbInput = document.getElementById('usd-per-lb');
    const cadPerKgInput = document.getElementById('cad-per-kg');
    const groceryItemInput = document.getElementById('grocery-item-input');
    const clearButton = document.getElementById('clear-button');
    const averagePriceElement = document.getElementById('average-price');
    const dealInfoElement = document.getElementById('deal-info');
    const groceryImage = document.getElementById('grocery-image');
    const imageContainer = document.getElementById('image-container');
    const dropdown = document.getElementById('dropdown');

    let exchangeRate = 1.25; // Default value, update dynamically
    let typingTimer;
    const typingDelay = 1000; // 1 second delay
    let validItems = [];

    async function fetchExchangeRate() {
        try {
            const response = await fetch('/api/exchange-rate');
            const data = await response.json();
            exchangeRate = data.rate;
            console.log('Exchange rate fetched:', exchangeRate);
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
        }
    }

    async function fetchDataset() {
        try {
            const response = await fetch('/api/dataset');
            const data = await response.json();
            validItems = data.map(item => item.title.toLowerCase());
            return data;
        } catch (error) {
            console.error('Error fetching dataset:', error);
            return [];
        }
    }

    async function fetchAveragePrice(item) {
        const dataset = await fetchDataset();
        const filteredItems = dataset.filter(d => d.title.toLowerCase() === item.toLowerCase());
        if (filteredItems.length > 0) {
            const total = filteredItems.reduce((acc, curr) => acc + parseFloat(curr.price.replace(/[$,]/g, '')), 0);
            return total / filteredItems.length;
        } else {
            return Math.random() * 10; // Fallback average price
        }
    }

    async function fetchGroceryImage(item) {
        const searchTerm = `${item}`;
        const url = `/api/unsplash-image?query=${encodeURIComponent(searchTerm)}`;
    
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.imageUrl;
        } catch (error) {
            console.error('Error fetching grocery image:', error);
            return '';
        }
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
        const item = groceryItemInput.value.trim().toLowerCase();

        if (!item || (isNaN(usdPerLb) && isNaN(cadPerKg)) || !validItems.includes(item)) return;

        if (!isNaN(usdPerLb) && usdPerLb >= 0) {
            cadPerKgInput.value = convertUsdToCadPerKg(usdPerLb).toFixed(2);
        } else if (!isNaN(cadPerKg) && cadPerKg >= 0) {
            usdPerLbInput.value = convertCadToUsdPerLb(cadPerKg).toFixed(2);
        }
    }

    async function updateDealInfo() {
        const item = groceryItemInput.value.trim().toLowerCase();
        const usdPerLb = parseFloat(usdPerLbInput.value);
        const cadPerKg = parseFloat(cadPerKgInput.value);

        if (!item || !validItems.includes(item)) return;

        if (!isNaN(usdPerLb) && usdPerLb >= 0) {
            const averagePrice = await fetchAveragePrice(item);
            averagePriceElement.textContent = `Average price for ${item}: $${averagePrice.toFixed(2)} per lb`;
            dealInfoElement.textContent = usdPerLb < averagePrice ? 'This is a good deal!' : 'This is not a good deal.';
            dealInfoElement.style.backgroundColor = usdPerLb < averagePrice ? '#d4edda' : '#f8d7da';
            dealInfoElement.style.color = usdPerLb < averagePrice ? '#155724' : '#721c24';
        } else if (!isNaN(cadPerKg) && cadPerKg >= 0) {
            const averagePrice = await fetchAveragePrice(item) * 2.20462; // Convert to CAD per kg
            averagePriceElement.textContent = `Average price for ${item}: $${averagePrice.toFixed(2)} per kg`;
            dealInfoElement.textContent = cadPerKg < averagePrice ? 'This is a good deal!' : 'This is not a good deal.';
            dealInfoElement.style.backgroundColor = cadPerKg < averagePrice ? '#d4edda' : '#f8d7da';
            dealInfoElement.style.color = cadPerKg < averagePrice ? '#155724' : '#721c24';
        }
    }

    function debounce(func, delay) {
        return (...args) => {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => func.apply(this, args), delay);
        };
    }

    const debouncedUpdateGroceryImage = debounce(async () => {
        const item = groceryItemInput.value;
        if (item) {
            const imageUrl = await fetchGroceryImage(item);
            if (imageUrl) {
                groceryImage.src = imageUrl;
                groceryImage.style.display = 'block';
                imageContainer.style.display = 'block';
            } else {
                groceryImage.style.display = 'none';
                imageContainer.style.display = 'none';
            }
        } else {
            groceryImage.style.display = 'none';
            imageContainer.style.display = 'none';
        }
    }, typingDelay);

    groceryItemInput.addEventListener('input', async () => {
        const item = groceryItemInput.value.trim().toLowerCase();
        updateDealInfo();
        debouncedUpdateGroceryImage();

        if (item) {
            const dataset = await fetchDataset();
            const suggestions = dataset.filter(d => d.title.toLowerCase().includes(item)).map(d => d.title);
            dropdown.innerHTML = '';
            if (suggestions.length > 0) {
                suggestions.forEach(suggestion => {
                    const li = document.createElement('li');
                    li.textContent = suggestion;
                    li.addEventListener('click', () => {
                        groceryItemInput.value = suggestion;
                        dropdown.innerHTML = '';
                        dropdown.style.display = 'none';
                        updateDealInfo();
                        debouncedUpdateGroceryImage();
                    });
                    dropdown.appendChild(li);
                });
                dropdown.style.display = 'block';
                dropdown.style.width = `${groceryItemInput.offsetWidth}px`;
            } else {
                dropdown.style.display = 'none';
            }
        } else {
            dropdown.innerHTML = '';
            dropdown.style.display = 'none';
        }
    });

    document.addEventListener('click', (event) => {
        if (!groceryItemInput.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });

    usdPerLbInput.addEventListener('input', () => {
        if (parseFloat(usdPerLbInput.value) < 0) usdPerLbInput.value = 0;
        cadPerKgInput.value = '';
        updateConversion();
        updateDealInfo();
    });

    cadPerKgInput.addEventListener('input', () => {
        if (parseFloat(cadPerKgInput.value) < 0) cadPerKgInput.value = 0;
        usdPerLbInput.value = '';
        updateConversion();
        updateDealInfo();
    });

    clearButton.addEventListener('click', () => {
        groceryItemInput.value = '';
        usdPerLbInput.value = '';
        cadPerKgInput.value = '';
        averagePriceElement.textContent = '';
        dealInfoElement.textContent = '';
        groceryImage.style.display = 'none';
        imageContainer.style.display = 'none'
    });

    fetchExchangeRate();
    fetchDataset(); // Preload the dataset to populate validItems
});