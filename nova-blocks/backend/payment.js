const express = require('express');
const router = express.Router();
const PayFac = require('payfac-sdk'); // Importing PayFac SDK


// Route to handle payment processing
router.post('/api/payment', async (req, res) => {
    const { amount, paymentMethod } = req.body;

    // Logic to process payment with PayFac
    try {
    const paymentResponse = await PayFac.createPayment({
        amount,
        paymentMethod,
        // Additional parameters as required by PayFac
    });
    res.status(200).json(paymentResponse); // Send the payment response back

        // const response = await payFac.createPayment({ amount, paymentMethod });
        // res.status(200).json(response);
        res.status(200).send('Payment processed successfully!'); // Placeholder response
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).send('Payment processing failed.');
    }
});

module.exports = router;
