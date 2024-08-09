const Razorpay = require('razorpay');

const instance = new Razorpay({
    key_id: "rzp_test_gpCBVNamBYgZkc",
    key_secret: "zsoMGQfuTrHjWrV82NJuRf9k"
});

const checkout = async (req, res) => {
    const {amount} = req.body
    try {
        const options = {
            amount: amount * 100, 
            currency: "INR"
        };

        const order = await instance.orders.create(options);

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            success: false,
            message: "Unable to create order. Please try again later.",
            error: error.message
        });
    }
};

const paymentVerification = async (req, res) => {
    try {
        const { RazorpayOrderId, razorpayPaymentId } = req.body;
        res.json({
            success: true,
            RazorpayOrderId,
            razorpayPaymentId
        });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({
            success: false,
            message: "Payment verification failed. Please try again.",
            error: error.message
        });
    }
};

module.exports = { checkout, paymentVerification };
