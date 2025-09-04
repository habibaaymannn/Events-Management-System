package com.example.eventsmanagementsystem.Model.Booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.example.eventsmanagementsystem.Util.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
@EqualsAndHashCode(callSuper = true)
public abstract class Booking extends BaseEntity {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(unique = true)
    private String stripePaymentId;

    @Column(unique = true)
    private String stripeSessionId;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    private String currency;
    private BigDecimal amount;

    private BigDecimal refundAmount;
    private LocalDateTime refundProcessedAt;

    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private String cancelledBy;
}
