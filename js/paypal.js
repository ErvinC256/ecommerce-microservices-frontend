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
            
            // Check if isTherePrimary session variable is true
            if (sessionStorage.getItem('isTherePrimary') === 'true') {
                // Enable PayPal since there's a primary address
                actions.enable();
            }
            document.querySelector('#address-checkbox').addEventListener('change', function(event) {
                // Enable or disable the button when it is checked or unchecked
                if (event.target.checked) {
                    actions.enable();
                } else {
                    actions.disable();
                }
            });

        },    
        onClick: function(data, actions) {
            
            const userId = sessionStorage.getItem('userId');
            const amount = parseInt(sessionStorage.getItem('amount')).toFixed(2);
            const productQuantityMap = JSON.parse(sessionStorage.getItem('productQuantityMap'));

            // create local order
            fetch(`http://localhost:8080/orders/init`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    amount: amount,
                    productQuantityMap: productQuantityMap
                })
            })
                .then(response => {
                    return response.json();
                })
                .then(orderId => {
                    sessionStorage.setItem('orderId', orderId);
                })
                .catch(error => {
                    console.error(error);
                });
        },
        createOrder: async function (data, actions) {
            const amount = parseInt(sessionStorage.getItem('amount')).toFixed(2);

            try {
                const response = await fetch(`http://localhost:8080/payments/init?amount=${amount}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const orderData = await response.json();

                if (orderData.paypalOrderId) {
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
            const userId = sessionStorage.getItem('userId');
            const urlParams = new URLSearchParams(window.location.search);
            const cartItemIds = urlParams.getAll('selectedCartItemIds');
            const productQuantityMap = JSON.parse(sessionStorage.getItem('productQuantityMap'));

            try {
                
                const response = await fetch(`http://localhost:8080/payments/capture?paypalOrderId=${data.orderID}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        orderId: orderId,
                        userId: userId,
                        cartItemIds: cartItemIds,
                        productQuantityMap: productQuantityMap
                    }) 
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
                    $('#processingModal').modal('show');

                    // Successful transaction -> Redirect to success page
                    const orderNumber = orderData.orderNumber;
                    setTimeout(function(){
                        $('#processingModal').modal('hide');
                        window.location.href = `order-success.html?fromCheckout=true&orderId=${orderData.orderId}`;
                    }, 3000); // Redirect after 2 seconds
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