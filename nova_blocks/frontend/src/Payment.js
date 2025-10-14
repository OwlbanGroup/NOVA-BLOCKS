import React, { useState } from 'react';

const Payment = () => {
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount, paymentMethod }),
            });
            const data = await response.json();
            alert('Payment successful: ' + JSON.stringify(data));
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed.');
        }
    };

    return (
        <div>
            <h1>Make a Payment</h1>
            <form onSubmit={handlePayment}>
                <div>
                    <label>Amount:</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Payment Method:</label>
                    <input
                        type="text"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Pay</button>
            </form>
        </div>
    );
};

export default Payment;
