package com.example.cdr.eventsmanagementsystem.Service.Kafka;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.example.cdr.eventsmanagementsystem.Constants.KafkaConstants;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingType;
import com.example.cdr.eventsmanagementsystem.Model.Booking.PaymentStatus;
import com.example.cdr.eventsmanagementsystem.Service.Notifications.NotificationUtil;
import com.example.cdr.eventsmanagementsystem.Util.BookingUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class BookingService {
    
    private final BookingUtil bookingUtil;
    private final NotificationUtil notificationUtil;

    public void confirmBooking(String bookingId, BookingType bookingType, String referenceId, String amount, String currency) {
        log.info(KafkaConstants.LOG_CONFIRMING_BOOKING, bookingType, bookingId, amount, currency);

        Booking booking = findBooking(bookingId, bookingType);

        if (Objects.isNull(booking)) {
            log.warn(KafkaConstants.WARN_NO_BOOKING_FOUND, bookingId, bookingType);
            return;
        }

        try {
            if (booking.getStatus() != BookingStatus.BOOKED) {
                booking.setPaymentStatus(PaymentStatus.CAPTURED);
                booking.setStatus(BookingStatus.BOOKED);
                booking.setStripePaymentId(referenceId);
                
                if (Objects.nonNull(amount) && !amount.isBlank()) {
                    booking.setAmount(new BigDecimal(amount));
                }
                if (Objects.nonNull(currency) && !currency.isBlank()) {
                    booking.setCurrency(currency);
                }

                bookingUtil.saveBooking(booking);
                notificationUtil.publishEvent(booking);
                
                log.info(KafkaConstants.LOG_CONFIRMED_BOOKING, booking.getId());
            } else {
                log.info(KafkaConstants.LOG_ALREADY_CONFIRMED, booking.getId());
            }
        } catch (Exception e) {
            log.error(KafkaConstants.ERROR_CONFIRM_BOOKING, bookingId, e);
            throw e;
        }
    }

    void failBooking(String bookingId, BookingType bookingType, CharSequence failureReason) {
        log.warn(KafkaConstants.LOG_FAILING_BOOKING, bookingType, bookingId, failureReason);

        Booking booking = findBooking(bookingId, bookingType);

        if (Objects.isNull(booking)) {
            log.warn(KafkaConstants.WARN_NO_BOOKING_FOUND, bookingId, bookingType);
            return;
        }

        try {
            booking.setStatus(BookingStatus.FAILED);
            booking.setPaymentStatus(PaymentStatus.FAILED);
            booking.setCancellationReason(failureReason != null ? failureReason.toString() : KafkaConstants.REASON_PAYMENT_FAILED);
            booking.setCancelledAt(LocalDateTime.now());

            bookingUtil.saveBooking(booking);
            
            log.info(KafkaConstants.LOG_FAILED_BOOKING, booking.getId());
        } catch (Exception e) {
            log.error(KafkaConstants.ERROR_FAIL_BOOKING, bookingId, e);
            throw e;
        }
    }

    void refundBooking(String bookingId, BookingType bookingType) {
        log.info(KafkaConstants.LOG_REFUNDING_BOOKING, bookingType, bookingId);

        Booking booking = findBooking(bookingId, bookingType);

        if (Objects.isNull(booking)) {
            log.warn(KafkaConstants.WARN_NO_BOOKING_FOUND, bookingId, bookingType);
            return;
        }

        try {
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setPaymentStatus(PaymentStatus.REFUNDED);
            booking.setRefundAmount(booking.getAmount());
            booking.setRefundProcessedAt(LocalDateTime.now());
            
            if (booking.getCancellationReason() == null) {
                booking.setCancellationReason(KafkaConstants.REASON_FULL_REFUND);
            }
            if (booking.getCancelledAt() == null) {
                booking.setCancelledAt(LocalDateTime.now());
            }

            bookingUtil.saveBooking(booking);

            log.info(KafkaConstants.LOG_REFUNDED_BOOKING, booking.getId());
        } catch (Exception e) {
            log.error(KafkaConstants.ERROR_REFUND_BOOKING, bookingId, e);
            throw e;
        }
    }

    void cancelBooking(String bookingId, BookingType bookingType) {
        log.info(KafkaConstants.LOG_CANCELLING_BOOKING, bookingType, bookingId);

        Booking booking = findBooking(bookingId, bookingType);

        if (Objects.isNull(booking)) {
            log.warn(KafkaConstants.WARN_NO_BOOKING_FOUND, bookingId, bookingType);
            return;
        }

        try {
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setPaymentStatus(PaymentStatus.VOIDED);
            booking.setCancelledAt(LocalDateTime.now());
            
            if (booking.getCancellationReason() == null) {
                booking.setCancellationReason(KafkaConstants.REASON_PAYMENT_CANCELLED);
            }

            bookingUtil.saveBooking(booking);

            log.info(KafkaConstants.LOG_CANCELLED_BOOKING, booking.getId());
        } catch (Exception e) {
            log.error(KafkaConstants.ERROR_CANCEL_BOOKING, bookingId, e);
            throw e;
        }
    }

    void updatePaymentPending(String bookingId, BookingType bookingType) {
        log.info(KafkaConstants.LOG_PAYMENT_PENDING, bookingType, bookingId);

        Booking booking = findBooking(bookingId, bookingType);

        if (Objects.isNull(booking)) {
            log.warn(KafkaConstants.WARN_NO_BOOKING_FOUND, bookingId, bookingType);
            return;
        }

        try {
            if (booking.getStatus() != BookingStatus.BOOKED && 
                booking.getStatus() != BookingStatus.FAILED && 
                booking.getStatus() != BookingStatus.CANCELLED) {
                
                booking.setPaymentStatus(PaymentStatus.PENDING);
                booking.setStatus(BookingStatus.PAYMENT_PENDING);

                bookingUtil.saveBooking(booking);
                
                log.info(KafkaConstants.LOG_UPDATED_PENDING, booking.getId());
            } else {
                log.info(KafkaConstants.LOG_FINAL_STATE, booking.getId(), booking.getStatus());
            }
        } catch (Exception e) {
            log.error(KafkaConstants.ERROR_UPDATE_PENDING, bookingId, e);
            throw e;
        }
    }

    void partialRefund(String bookingId, BookingType bookingType, CharSequence amount) {
        log.info(KafkaConstants.LOG_PARTIAL_REFUND, bookingType, bookingId, amount);

        Booking booking = findBooking(bookingId, bookingType);

        if (Objects.isNull(booking)) {
            log.warn(KafkaConstants.WARN_NO_BOOKING_FOUND, bookingId, bookingType);
            return;
        }

        try {
            BigDecimal refundAmount = new BigDecimal(amount.toString());
            
            booking.setPaymentStatus(PaymentStatus.PARTIALLY_REFUNDED);
            booking.setRefundAmount(refundAmount);
            booking.setRefundProcessedAt(LocalDateTime.now());
            
            if (booking.getCancellationReason() == null) {
                booking.setCancellationReason(KafkaConstants.REASON_PARTIAL_REFUND_PREFIX + refundAmount + " " + booking.getCurrency());
            }

            bookingUtil.saveBooking(booking);

            log.info(KafkaConstants.LOG_PARTIAL_REFUNDED, booking.getId());
        } catch (Exception e) {
            log.error(KafkaConstants.ERROR_PARTIAL_REFUND, bookingId, e);
            throw e;
        }
    }

    private Booking findBooking(String bookingId, BookingType type) {
        try {
            Long id = Long.valueOf(bookingId);
            return bookingUtil.findBookingByTypeAndId(id, type);
        } catch (NumberFormatException e) {
            log.error(KafkaConstants.ERROR_INVALID_BOOKING_ID, bookingId);
            throw new IllegalArgumentException(KafkaConstants.EXCEPTION_INVALID_BOOKING_ID + bookingId, e);
        } catch (Exception e) {
            log.error(KafkaConstants.ERROR_FINDING_BOOKING, bookingId, type, e);
            return null;
        }
    }
}
