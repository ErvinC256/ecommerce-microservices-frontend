// Define a function to initiate the PayPal button with proper configuration
function setupPayPalButton() {
    window.paypal.Buttons({
        style: {
            color: 'gold',
            shape: 'pill',
            label: 'paypal',
            height: 35
        },
        // onInit is called when the button first renders
        onInit: function(data, actions) {
            // Disable the buttons
            actions.disable();
            // Listen for changes to the checkbox
            document.querySelector('#confirm-checkbox')
            .addEventListener('change', function(event) {
                // Enable or disable the button when it is checked or unchecked
                if (event.target.checked) {
                    actions.enable();
                } else {
                    actions.disable();
                }
            });
        },    
        createOrder: async function (data, actions) {
            // Fetch and initiate the order logic
            const urlParams = new URLSearchParams(window.location.search);
            const cartItemIds = urlParams.getAll('cartItemIds');
            const amount = urlParams.get('subtotal');
            const userId = sessionStorage.getItem('userId');

            const cartItemParams = cartItemIds.map(itemId => `cartItemIds=${encodeURIComponent(itemId)}`).join('&');

            try {
                const response = await fetch(`http://localhost:8084/orders/init?userId=${userId}&amount=${amount}&${cartItemParams}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        cart: [
                            {
                                id: "YOUR_PRODUCT_ID",
                                quantity: "YOUR_PRODUCT_QUANTITY",
                            },
                        ],
                    }),
                });

                const orderData = await response.json();

                if (orderData.paypalOrderId) {
                    sessionStorage.setItem('orderId', orderData.orderId);
                    return orderData.paypalOrderId;
                } else {
                    const errorDetail = orderData?.details?.[0];
                    const errorMessage = errorDetail
                        ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                        : JSON.stringify(orderData);

                    throw new Error(errorMessage);
                }
            } catch (error) {
                console.error(error);
                resultMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
            }
        },
        onApprove: async function (data, actions) {
            const orderId = sessionStorage.getItem('orderId');

            try {
                const response = await fetch(`http://localhost:8084/orders/capture?paypalOrderId=${data.orderID}&orderId=${orderId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const orderData = await response.json();
                const errorDetail = orderData?.details?.[0];

                if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                    // Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                    return actions.restart();
                } else if (errorDetail) {
                    // Other non-recoverable errors -> Show a failure message
                    throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
                } else {
                    // Successful transaction -> Redirect to success page
                    window.location.href = 'success.html';
                }
            } catch (error) {
                console.error(error);
                resultMessage(`Sorry, your transaction could not be processed...<br><br>${error}`);
            }
        },
    }).render("#paypal-button-container"); // Render the PayPal button in the specified container
}

// Call the setup function when the window loads
window.onload = setupPayPalButton;

// Example function to show a result to the user. Your site's UI library can be used instead.
function resultMessage(message) {
    const container = document.querySelector("#result-message");
    container.innerHTML = message;
}