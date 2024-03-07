window.paypal
    .Buttons({
        async createOrder() {

            const urlParams = new URLSearchParams(window.location.search);
            // Get specific parameters
            const cartItemIds = urlParams.getAll('cartItemIds');
            const subtotal = urlParams.get('subtotal');

            try {
                const response = await fetch(`http://localhost:8080/orders/init?amount=${subtotal}`, {
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
        async onApprove(data, actions) {

            const orderId = sessionStorage.getItem('orderId');

            try {
                const response = await fetch(`http://localhost:8080/orders/capture?paypalOrderId=${data.orderID}&orderId=${orderId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const orderData = await response.json();
                // Three cases to handle:
                //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                //   (2) Other non-recoverable errors -> Show a failure message
                //   (3) Successful transaction -> Show confirmation or thank you message

                const errorDetail = orderData?.details?.[0];

                if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                    // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                    // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
                    return actions.restart();
                } else if (errorDetail) {
                    // (2) Other non-recoverable errors -> Show a failure message
                    throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
                } else {
                    // (3) Successful transaction -> Show confirmation or thank you message
                    // Or go to another URL:  actions.redirect('thank_you.html');
                    
                    // console.log(orderData);
                    window.location.href = 'success.html';
                    
                }
            } catch (error) {
                console.error(error);
                resultMessage(
                    `Sorry, your transaction could not be processed...<br><br>${error}`,
                );
            }
        },
    })
    .render("#paypal-button-container");

// Example function to show a result to the user. Your site's UI library can be used instead.
function resultMessage(message) {
    const container = document.querySelector("#result-message");
    container.innerHTML = message;
}