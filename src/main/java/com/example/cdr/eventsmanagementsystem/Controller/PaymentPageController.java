package com.example.cdr.eventsmanagementsystem.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PaymentPageController {

    @GetMapping("/payment-page")
    public String paymentPage(
            @RequestParam("booking_id") Long bookingId,
            @RequestParam("client_secret") String clientSecret) {
        
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Complete Payment - Booking #%d</title>
                <script src="https://js.stripe.com/v3/"></script>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { text-align: center; margin-bottom: 30px; }
                    .booking-info { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 30px; }
                    .api-section { border: 1px solid #ddd; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
                    .button { background: #007cba; color: white; padding: 15px 30px; 
                             text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
                    .button:hover { background: #005a8b; }
                    .code { background: #f8f9fa; padding: 10px; border-radius: 3px; font-family: monospace; margin: 10px 0; }
                    .test-cards { background: #e8f5e8; padding: 15px; border-radius: 5px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Complete Your Payment</h1>
                        <p>Secure payment processing powered by Stripe</p>
                    </div>
                    
                    <div class="booking-info">
                        <h3>Booking Details</h3>
                        <p><strong>Booking ID:</strong> %d</p>
                        <p><strong>Status:</strong> Pending Payment</p>
                        <p><strong>Payment Method:</strong> Credit/Debit Card</p>
                    </div>
                    
                    <div class="api-section">
                        <h3>Payment Instructions</h3>
                        <p>To complete your payment, send a POST request to:</p>
                        <div class="code">POST /v1/bookings/%d/complete-payment</div>
                        
                        <p><strong>Request Body:</strong></p>
                        <div class="code">
{<br/>
&nbsp;&nbsp;"paymentMethodId": "pm_card_visa"<br/>
}
                        </div>
                        
                        <p><strong>Headers:</strong></p>
                        <div class="code">Content-Type: application/json</div>
                        
                        <a href="#" class="button" onclick="showCurlExample()">Show cURL Example</a>
                        <div id="curl-example" style="display: none; margin-top: 15px;">
                            <div class="code">
curl -X POST http://localhost:8080/v1/bookings/%d/complete-payment \\<br/>
&nbsp;&nbsp;-H "Content-Type: application/json" \\<br/>
&nbsp;&nbsp;-d '{"paymentMethodId": "pm_card_visa"}'
                            </div>
                        </div>
                    </div>
                    
                    <div class="test-cards">
                        <h4>Test Payment Methods</h4>
                        <p><strong>For Testing:</strong></p>
                        <ul>
                            <li><code>pm_card_visa</code> - Successful payment</li>
                            <li><code>pm_card_chargeDeclined</code> - Declined payment</li>
                            <li><code>pm_card_authenticationRequired</code> - Requires authentication</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; color: #666;">
                        <p>After successful payment, you will receive a confirmation email.</p>
                        <p>Need help? Contact our support team.</p>
                    </div>
                </div>

                <script>
                    function showCurlExample() {
                        const element = document.getElementById('curl-example');
                        element.style.display = element.style.display === 'none' ? 'block' : 'none';
                    }
                </script>
            </body>
            </html>
            """.formatted(bookingId, bookingId, bookingId, bookingId);
    }
}
