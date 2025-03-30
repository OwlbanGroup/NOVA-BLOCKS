const express = require('express');
const router = express.Router();
const PayFac = require('payfac-sdk'); // Importing PayFac SDK

// Route to handle payment processing
router.post('/api/payment', async (req, res) => {
    const { jewelryId, amount, paymentMethod } = req.body; // Added jewelryId to the request

    // Logic to process payment with PayFac
    try {
        const paymentResponse = await PayFac.createPayment({
            jewelryId, // Include jewelryId in the payment request
            amount,
            paymentMethod,
            // Additional parameters as required by PayFac
        });
        res.status(200).json(paymentResponse); // Send the payment response back
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).send('Payment processing failed.');
    }
});

module.exports = router;
