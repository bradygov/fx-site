// Performance Chart
const performanceCtx = document.getElementById('performanceChart').getContext('2d');
const performanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
        label: 'Monthly Performance (Pips)',
        data: [350, 420, 380, 450, 500, 480],
        borderColor: '#00c853',
        backgroundColor: 'rgba(0, 200, 83, 0.1)',
        tension: 0.4,
        fill: true
    }]
};

new Chart(performanceCtx, {
    type: 'line',
    data: performanceData,
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: '#ffffff'
                }
            }
        },
        scales: {
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#b0b0b0'
                }
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#b0b0b0'
                }
            }
        }
    }
});

// Market Prices
const markets = [
    { symbol: 'NASDAQ 100', basePrice: 17500, decimals: 0, multiplier: 1 },
    { symbol: 'XAUUSD', basePrice: 2936.26, decimals: 2, multiplier: 1 }
];
const marketPricesContainer = document.getElementById('marketPrices');

// Function to generate random price changes
function generatePrice(market) {
    const volatility = market.symbol === 'NASDAQ 100' ? 0.002 : 0.001;
    const change = (Math.random() - 0.5) * volatility * market.basePrice;
    const newPrice = market.basePrice + change;
    return {
        price: newPrice.toFixed(market.decimals),
        change: change.toFixed(market.decimals)
    };
}

// Create market cards
markets.forEach(market => {
    const priceData = generatePrice(market);
    const isPositive = parseFloat(priceData.change) > 0;
    
    const marketCard = document.createElement('div');
    marketCard.className = 'col-md-6';
    marketCard.innerHTML = `
        <div class="market-card">
            <h3>${market.symbol}</h3>
            <p class="price">${priceData.price}</p>
            <p class="${isPositive ? 'change-up' : 'change-down'}">
                ${isPositive ? '+' : ''}${priceData.change}
            </p>
        </div>
    `;
    marketPricesContainer.appendChild(marketCard);
});

// Update prices every 2 seconds
setInterval(() => {
    const marketCards = document.querySelectorAll('.market-card');
    marketCards.forEach((card, index) => {
        const market = markets[index];
        const priceData = generatePrice(market);
        const isPositive = parseFloat(priceData.change) > 0;
        
        card.querySelector('.price').textContent = priceData.price;
        const changeElement = card.querySelector('.change-up, .change-down');
        changeElement.className = isPositive ? 'change-up' : 'change-down';
        changeElement.textContent = `${isPositive ? '+' : ''}${priceData.change}`;
    });
}, 2000);

// Form submission and payment processing
let stripe;
let elements;

// Initialize Stripe
const initializeStripe = async () => {
    stripe = await Stripe('your_publishable_key'); // Replace with your Stripe publishable key
    elements = stripe.elements();
    
    // Create payment element
    const paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');
};

// Initialize Stripe when the page loads
document.addEventListener('DOMContentLoaded', initializeStripe);

// Handle form submission
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = this;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';

    try {
        // Create the subscription
        const { error: paymentError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/subscription-success',
                payment_method_data: {
                    billing_details: {
                        name: form.querySelector('input[type="text"]').value,
                        email: form.querySelector('input[type="email"]').value,
                        phone: form.querySelector('input[type="tel"]').value
                    }
                }
            }
        });

        if (paymentError) {
            throw new Error(paymentError.message);
        }

    } catch (error) {
        alert('Payment failed: ' + error.message);
        submitButton.disabled = false;
        submitButton.textContent = 'Subscribe Now - R200/month';
    }
    form.reset();
});

// Update button text based on selected package
document.getElementById('packageSelect').addEventListener('change', function() {
    const submitButton = document.getElementById('submitButton');
    const selectedPackage = this.value;
    const price = selectedPackage === 'premium' ? 'R500' : 'R200';
    submitButton.textContent = `Subscribe Now - ${price}/month`;
});

