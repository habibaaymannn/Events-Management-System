package com.example.cdr.eventsmanagementsystem.Service.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.BookingResponse;
import com.example.cdr.eventsmanagementsystem.Model.Booking.*;
import com.example.cdr.eventsmanagementsystem.Service.Notifications.NotificationUtil;
import com.example.cdr.eventsmanagementsystem.Util.BookingUtil;
import com.stripe.param.PaymentIntentConfirmParams;
import com.example.cdr.eventsmanagementsystem.DTO.Booking.Response.CheckoutSessionResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.AuthorizePaymentRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.CapturePaymentRequest;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.PaymentConfirmationResponse;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.RefundRequest;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.NotificationEvent.Payment.BookingPaymentFailed;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import com.example.cdr.eventsmanagementsystem.Service.Booking.StripeServiceInterface;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
    private final UserSyncService userSyncService;
    private final StripeServiceInterface stripeService;
    private final ApplicationEventPublisher eventPublisher;
    private final NotificationUtil notificationUtil;
    private final BookingUtil bookingUtil;

    @Transactional
    public BookingResponse authorizePayment(Long bookingId, BookingType type, AuthorizePaymentRequest request) {
        Booking booking = bookingUtil.findBookingByTypeAndId(bookingId, type);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Booking must be in PENDING status for authorization. Current status: " + booking.getStatus());
        } else if (booking.getPaymentStatus() == PaymentStatus.CAPTURED) {
            throw new IllegalStateException("Payment is already captured. Cannot authorize a completed payment.");
        }
        
        PaymentIntent intent = null;
        try {
            if (booking.getStripePaymentId() != null) {
                intent = stripeService.retrievePaymentIntent(booking.getStripePaymentId());
            }
            
            boolean needNewIntent = intent == null || intent.getCaptureMethod() == null || !"manual".equalsIgnoreCase(intent.getCaptureMethod());

            if (needNewIntent) {
                BigDecimal amount = request.getAmount() != null ? request.getAmount() : (booking.getAmount() != null ? booking.getAmount() : new BigDecimal("0"));
                String currency = request.getCurrency() != null ? request.getCurrency() : (booking.getCurrency() != null ? booking.getCurrency() : "usd");
                if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                    amount = new BigDecimal("1.00");
                }
                intent = stripeService.createManualCapturePaymentIntent(amount, currency, null, "Authorization for booking " + booking.getId());
                booking.setStripePaymentId(intent.getId());
                booking.setAmount(amount);
                booking.setCurrency(currency);
            }
            
            if (request.getPaymentMethodId() != null) {
                PaymentIntentConfirmParams confirmParams = PaymentIntentConfirmParams.builder()
                        .setPaymentMethod(request.getPaymentMethodId())
                        .build();
                intent = intent.confirm(confirmParams);
            }
            
            if ("requires_capture".equals(intent.getStatus())) {
                booking.setPaymentStatus(PaymentStatus.AUTHORIZED);
                booking.setAmount(request.getAmount() != null ? request.getAmount() : booking.getAmount());
                booking.setCurrency(request.getCurrency() != null ? request.getCurrency() : booking.getCurrency());
                bookingUtil.saveBooking(booking);
                return bookingUtil.toBookingResponse(booking);
            }
            throw new RuntimeException("Authorization failed. Status: " + intent.getStatus());
        } catch (Exception e) {
            eventPublisher.publishEvent(new BookingPaymentFailed(booking, "Authorization failed: " + e.getMessage()));
            throw new RuntimeException("Authorization failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public BookingResponse capturePayment(Long bookingId, BookingType type, CapturePaymentRequest request) {
        Booking booking = bookingUtil.findBookingByTypeAndId(bookingId, type);

        if (booking.getPaymentStatus() != PaymentStatus.AUTHORIZED) {
            throw new IllegalStateException("Payment must be AUTHORIZED to capture. Current status: " + booking.getPaymentStatus());
        }
        
        try {
            PaymentIntent captured = stripeService.capturePaymentIntent(booking.getStripePaymentId(), request.getAmount());
            if ("succeeded".equals(captured.getStatus())) {
                booking.setPaymentStatus(PaymentStatus.CAPTURED);
                booking.setStatus(BookingStatus.BOOKED);
                bookingUtil.saveBooking(booking);
                notificationUtil.publishEvent(booking);
                return bookingUtil.toBookingResponse(booking);
            }
            throw new RuntimeException("Capture failed. Status: " + captured.getStatus());
        } catch (Exception e) {
            eventPublisher.publishEvent(new BookingPaymentFailed(booking, "Capture failed: " + e.getMessage()));
            throw new RuntimeException("Capture failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public BookingResponse voidPayment(Long bookingId, BookingType type) {
        Booking booking = bookingUtil.findBookingByTypeAndId(bookingId, type);

        if (booking.getPaymentStatus() != PaymentStatus.AUTHORIZED) {
            throw new IllegalStateException("Payment must be AUTHORIZED to void. Current status: " + booking.getPaymentStatus());
        }
        
        try {
            PaymentIntent cancelled = stripeService.cancelPaymentIntent(booking.getStripePaymentId(), "requested_by_customer");
            if ("canceled".equals(cancelled.getStatus())) {
                booking.setPaymentStatus(PaymentStatus.VOIDED);
                booking.setStatus(BookingStatus.CANCELLED);
                bookingUtil.saveBooking(booking);
                return bookingUtil.toBookingResponse(booking);
            }
            throw new RuntimeException("Void failed. Status: " + cancelled.getStatus());
        } catch (Exception e) {
            eventPublisher.publishEvent(new BookingPaymentFailed(booking, "Void failed: " + e.getMessage()));
            throw new RuntimeException("Void failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public BookingResponse refundPayment(Long bookingId, BookingType type, RefundRequest request) {
        Booking booking = bookingUtil.findBookingByTypeAndId(bookingId, type);

        try {
            stripeService.createRefund(booking.getStripePaymentId(), request.getAmount(), request.getReason());
            booking.setRefundAmount(request.getAmount());
            booking.setRefundProcessedAt(LocalDateTime.now());
            booking.setPaymentStatus(request.getAmount() == null ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED);
            bookingUtil.saveBooking(booking);
            return bookingUtil.toBookingResponse(booking);
        } catch (Exception e) {
            eventPublisher.publishEvent(new BookingPaymentFailed(booking, "Refund failed: " + e.getMessage()));
            throw new RuntimeException("Refund failed: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public CheckoutSessionResponse createSetupCheckoutSessionForCurrentUser() {
        BaseRoleEntity user = userSyncService.ensureUserExists(BaseRoleEntity.class);
        if (user.getStripeCustomerId() == null) {
            Customer customer = stripeService.createCustomer(user.getEmail(), user.getFullName(), null);
            user.setStripeCustomerId(customer.getId());
            userSyncService.getHandlerForRole(userSyncService.getCurrentUserRole(SecurityContextHolder.getContext().getAuthentication())).saveUser(user);
        }
        var session = stripeService.createSetupSession(user.getStripeCustomerId(), user.getId());
        CheckoutSessionResponse response = new CheckoutSessionResponse();
        response.setSessionId(session.getId());
        response.setUrl(session.getUrl());
        return response;
    }

    @Transactional
    public void setDefaultPaymentMethodForCurrentUser(String paymentMethodId) {
        BaseRoleEntity user = userSyncService.ensureUserExists(BaseRoleEntity.class);
        if (user.getStripeCustomerId() == null) {
            Customer customer = stripeService.createCustomer(user.getEmail(), user.getFullName(), null);
            user.setStripeCustomerId(customer.getId());
        }
        stripeService.attachPaymentMethodToCustomer(paymentMethodId, user.getStripeCustomerId());
        user.setDefaultPaymentMethodId(paymentMethodId);
        userSyncService.getHandlerForRole(userSyncService.getCurrentUserRole(SecurityContextHolder.getContext().getAuthentication())).saveUser(user);
    }

    @Transactional
    public void toggleAutoPay(boolean enable) {
        BaseRoleEntity user = userSyncService.ensureUserExists(BaseRoleEntity.class);
        user.setAutoPayEnabled(enable);
        userSyncService.getHandlerForRole(userSyncService.getCurrentUserRole(SecurityContextHolder.getContext().getAuthentication())).saveUser(user);
    }

    @Transactional
    public PaymentConfirmationResponse confirmPayment(BookingType type, String sessionId, String setupSessionId, Boolean canceled, Boolean setupCanceled) {
        log.info("Processing payment confirmation - sessionId: {}, setupSessionId: {}, canceled: {}, setupCanceled: {}", 
                sessionId, setupSessionId, canceled, setupCanceled);

        if (Boolean.TRUE.equals(canceled)) {
            return PaymentConfirmationResponse.builder()
                    .status("canceled")
                    .message("Payment was canceled. No charges were made to your account.")
                    .nextAction("You can close this page and try booking again.")
                    .build();
        }

        if (Boolean.TRUE.equals(setupCanceled)) {
            return PaymentConfirmationResponse.builder()
                    .status("canceled")
                    .message("Payment method setup was canceled.")
                    .nextAction("You can close this page and try setting up your payment method again.")
                    .build();
        }

        if (setupSessionId != null) {
            try {
                Session session = stripeService.retrieveSession(setupSessionId);
                log.info("Setup session retrieved: {}, status: {}", setupSessionId, session.getPaymentStatus());
                
                return PaymentConfirmationResponse.builder()
                        .status("success")
                        .message("Payment method saved successfully!")
                        .nextAction("You can close this page. Your payment method is now ready for future bookings.")
                        .build();
            } catch (Exception e) {
                log.error("Error retrieving setup session: {}", e.getMessage(), e);
                return PaymentConfirmationResponse.builder()
                        .status("failed")
                        .message("There was an error processing your payment method setup.")
                        .nextAction("Please try again or contact support if the problem persists.")
                        .build();
            }
        }

        // Handle payment session completion
        if (sessionId != null) {
            try {
                Session session = stripeService.retrieveSession(sessionId);
                log.info("Payment session retrieved: {}, status: {}, payment_status: {}", 
                        sessionId, session.getStatus(), session.getPaymentStatus());

                Booking booking = bookingUtil.findBookingByStripeSessionIdAndType(sessionId, type);

                PaymentConfirmationResponse.PaymentDetails paymentDetails = null;
                boolean requiresCapture = false;
                boolean paymentSucceeded = false;
                
                if (session.getPaymentIntent() != null) {
                    try {
                        PaymentIntent paymentIntent = stripeService.retrievePaymentIntent(session.getPaymentIntent());
                        requiresCapture = "manual".equals(paymentIntent.getCaptureMethod()) && 
                                        "requires_capture".equals(paymentIntent.getStatus());
                        paymentSucceeded = "succeeded".equals(paymentIntent.getStatus()) || 
                                        "requires_capture".equals(paymentIntent.getStatus());
                        
                        paymentDetails = PaymentConfirmationResponse.PaymentDetails.builder()
                                .paymentIntentId(paymentIntent.getId())
                                .amount(String.valueOf(paymentIntent.getAmount() / 100.0))
                                .currency(paymentIntent.getCurrency().toUpperCase())
                                .method(paymentIntent.getPaymentMethod() != null ? "card" : "unknown")
                                .authorizationOnly(requiresCapture)
                                .build();
                        
                        log.info("Payment intent details - ID: {}, Status: {}, Capture Method: {}, Requires Capture: {}", 
                                paymentIntent.getId(), paymentIntent.getStatus(), paymentIntent.getCaptureMethod(), requiresCapture);
                        
                        if (booking.getStripePaymentId() == null) {
                            booking.setStripePaymentId(paymentIntent.getId());
                        }
                    } catch (Exception e) {
                        log.warn("Could not retrieve payment intent details: {}", e.getMessage());
                    }
                }

                boolean shouldUpdateBooking = false;
                
                if (paymentSucceeded) {
                    if (requiresCapture) {
                        // Authorization-only flow
                        if (booking.getPaymentStatus() != PaymentStatus.AUTHORIZED) {
                            booking.setPaymentStatus(PaymentStatus.AUTHORIZED);
                            booking.setStatus(BookingStatus.BOOKED);
                            shouldUpdateBooking = true;
                        }
                    } else {
                        // Immediate payment flow
                        if (booking.getPaymentStatus() != PaymentStatus.CAPTURED) {
                            booking.setPaymentStatus(PaymentStatus.CAPTURED);
                            booking.setStatus(BookingStatus.BOOKED);
                            shouldUpdateBooking = true;
                        }
                    }
                } else if ("paid".equalsIgnoreCase(session.getPaymentStatus())) {
                    // Session indicates payment was successful
                    if (booking.getPaymentStatus() != PaymentStatus.CAPTURED) {
                        booking.setPaymentStatus(PaymentStatus.CAPTURED);
                        booking.setStatus(BookingStatus.BOOKED);
                        shouldUpdateBooking = true;
                    }
                }
                
                if (shouldUpdateBooking) {
                    bookingUtil.saveBooking(booking);
                    notificationUtil.publishEvent(booking);
                    log.info("Booking {} updated with status: {} and payment status: {}",
                            booking.getId(), booking.getStatus(), booking.getPaymentStatus());
                }

                PaymentConfirmationResponse.PaymentConfirmationResponseBuilder responseBuilder = PaymentConfirmationResponse.builder()
                        .bookingReference("#" + booking.getId())
                        .bookingStatus(booking.getStatus())
                        .paymentStatus(booking.getPaymentStatus())
                        .payment(paymentDetails)
                        .requiresCapture(requiresCapture);

                if (requiresCapture) {
                    // Authorization-only flow
                    responseBuilder
                            .status("success")
                            .message("Booking confirmed! Your payment method has been authorized.")
                            .nextAction("No payment has been charged yet. You'll be charged closer to your booking date.")
                            .redirectUrl("/bookings/" + booking.getId());
                } else if (paymentSucceeded || "paid".equalsIgnoreCase(session.getPaymentStatus()) || booking.getStatus() == BookingStatus.BOOKED) {
                    // Immediate payment flow
                    responseBuilder
                            .status("success")
                            .message("Booking confirmed and payment successful!")
                            .nextAction("You should receive a confirmation email shortly with your booking details.")
                            .redirectUrl("/bookings/" + booking.getId());
                } else {
                    // Payment is processing
                    responseBuilder
                            .status("processing")
                            .message("Payment completed successfully! We're confirming your booking.")
                            .nextAction("You should receive a confirmation email within a few minutes.");
                }

                return responseBuilder.build();

            } catch (Exception e) {
                log.error("Error processing payment confirmation for session: {}", sessionId, e);
                return PaymentConfirmationResponse.builder()
                        .status("failed")
                        .message("There was an error processing your payment confirmation.")
                        .nextAction("Please check your email for booking confirmation or contact support if needed.")
                        .build();
            }
        }

        return PaymentConfirmationResponse.builder()
                .status("failed")
                .message("Invalid confirmation request.")
                .nextAction("Please check the link or contact support if you need assistance.")
                .build();
    }
}


