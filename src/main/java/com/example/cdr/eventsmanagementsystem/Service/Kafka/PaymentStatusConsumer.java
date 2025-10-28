package com.example.cdr.eventsmanagementsystem.Service.Kafka;

import java.util.Map;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.cdr.eventsmanagementsystem.Constants.KafkaConstants;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingType;
import com.ittovative.ems.payment.avro.PaymentStatusEvent;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PaymentStatusConsumer {
    
    private final BookingService bookingService;

    public PaymentStatusConsumer(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @KafkaListener(
        topics = "${kafka.topic.payment-status:ems-payment-status-events}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    @Transactional
    public void consumePaymentStatus(
            ConsumerRecord<String, PaymentStatusEvent> consumerRecord,
            Acknowledgment acknowledgment) {

        log.info(KafkaConstants.LOG_CONSUMING_EVENT, 
                consumerRecord.key(), consumerRecord.partition(), consumerRecord.offset());

        String key = consumerRecord.key();
        PaymentStatusEvent event = consumerRecord.value();
        
        try {
            String systemId = event.getSystemId();
            String bookingId = event.getBookingId();
            String paymentStatus = event.getPaymentStatus().toString();
            String referenceId = event.getReferenceId();
            String amount = event.getAmount();
            String currency = event.getCurrency();
            String failureReason = event.getFailureReason();
            Map<String, String> metadata = event.getMetadata();

            log.info(KafkaConstants.LOG_RECEIVED_EVENT, 
                    key, consumerRecord.partition(), consumerRecord.offset(), paymentStatus);
            
            String[] keyParts = key.split(KafkaConstants.COMPOSITE_KEY_DELIMITER);
            if (keyParts.length != KafkaConstants.COMPOSITE_KEY_PARTS) {
                log.error(KafkaConstants.ERROR_INVALID_KEY_FORMAT, key);
                acknowledgment.acknowledge();
                return;
            }
            
            String keySystemId = keyParts[0];
            String keyBookingId = keyParts[1];
            
            if (!keySystemId.equals(systemId) || !keyBookingId.equals(bookingId)) {
                log.error(KafkaConstants.ERROR_KEY_MISMATCH, key, systemId, bookingId);
                acknowledgment.acknowledge();
                return;
            }
            
            processPaymentStatus(systemId, bookingId, paymentStatus, referenceId, amount, currency, failureReason, metadata);
            
            acknowledgment.acknowledge();
            log.info(KafkaConstants.LOG_SUCCESSFULLY_PROCESSED, systemId, bookingId, paymentStatus);
            
        } catch (Exception e) {
            log.error(KafkaConstants.LOG_ERROR_PROCESSING, 
                     key, consumerRecord.partition(), consumerRecord.offset(), e.getMessage(), e);
            throw e;
        }
    }

    private void processPaymentStatus(String systemId, String bookingId, String paymentStatus, 
                                    String referenceId, String amount, String currency, 
                                    String failureReason, Map<String, String> metadata) {
        
        BookingType bookingType = extractBookingType(metadata);
        if (bookingType == null) {
            log.error(KafkaConstants.ERROR_MISSING_BOOKING_TYPE, systemId, bookingId);
            throw new IllegalArgumentException(KafkaConstants.EXCEPTION_MISSING_BOOKING_TYPE);
        }
        
        switch (paymentStatus) {
            case "SUCCEEDED" -> handlePaymentSucceeded(bookingId, bookingType, referenceId, amount, currency);
            case "FAILED" -> handlePaymentFailed(bookingId, bookingType, failureReason);
            case "REFUNDED" -> handlePaymentRefunded(bookingId, bookingType);
            case "CANCELLED" -> handlePaymentCancelled(bookingId, bookingType);
            case "PENDING" -> handlePaymentPending(bookingId, bookingType);
            case "PARTIALLY_REFUNDED" -> handlePartialRefund(bookingId, bookingType, amount);
            default -> log.warn(KafkaConstants.WARN_UNKNOWN_PAYMENT_STATUS, paymentStatus, bookingId);
        }
    }

    private BookingType extractBookingType(Map<String, String> metadata) {
        try {
            if (metadata == null || !metadata.containsKey(KafkaConstants.BOOKING_TYPE_KEY)) {
                log.warn(KafkaConstants.WARN_MISSING_BOOKING_TYPE);
                return null;
            }
            
            String bookingTypeStr = metadata.get(KafkaConstants.BOOKING_TYPE_KEY);
            if (bookingTypeStr == null || bookingTypeStr.trim().isEmpty()) {
                log.error(KafkaConstants.ERROR_INVALID_BOOKING_TYPE, bookingTypeStr);
                return null;
            }
            
            return BookingType.valueOf(bookingTypeStr.toUpperCase());
            
        } catch (IllegalArgumentException e) {
            log.error(KafkaConstants.ERROR_INVALID_BOOKING_TYPE,
                     metadata != null ? metadata.get(KafkaConstants.BOOKING_TYPE_KEY) : "null");
            return null;
        } catch (Exception e) {
            log.error(KafkaConstants.ERROR_EXTRACTING_BOOKING_TYPE,
                     metadata != null ? metadata.get(KafkaConstants.BOOKING_TYPE_KEY) : "null", e);
            return null;
        }
    }

    private void handlePaymentSucceeded(String bookingId, BookingType bookingType, 
                                      String referenceId, String amount, String currency) {
        log.info(KafkaConstants.LOG_PAYMENT_SUCCEEDED, bookingType, bookingId, amount, currency);
        bookingService.confirmBooking(bookingId, bookingType, referenceId, amount, currency);
    }

    private void handlePaymentFailed(String bookingId, BookingType bookingType, String failureReason) {
        log.warn(KafkaConstants.LOG_PAYMENT_FAILED, bookingType, bookingId, failureReason);
        bookingService.failBooking(bookingId, bookingType, failureReason);
    }

    private void handlePaymentRefunded(String bookingId, BookingType bookingType) {
        log.info(KafkaConstants.LOG_PAYMENT_REFUNDED, bookingType, bookingId);
        bookingService.refundBooking(bookingId, bookingType);
    }

    private void handlePaymentCancelled(String bookingId, BookingType bookingType) {
        log.info(KafkaConstants.LOG_PAYMENT_CANCELLED, bookingType, bookingId);
        bookingService.cancelBooking(bookingId, bookingType);
    }

    private void handlePaymentPending(String bookingId, BookingType bookingType) {
        log.info(KafkaConstants.LOG_PAYMENT_PENDING, bookingType, bookingId);
        bookingService.updatePaymentPending(bookingId, bookingType);
    }

    private void handlePartialRefund(String bookingId, BookingType bookingType, String amount) {
        log.info(KafkaConstants.LOG_PARTIAL_REFUND, bookingType, bookingId, amount);
        bookingService.partialRefund(bookingId, bookingType, amount);
    }
}