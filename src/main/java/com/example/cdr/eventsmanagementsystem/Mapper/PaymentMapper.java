package com.example.cdr.eventsmanagementsystem.Mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.cdr.eventsmanagementsystem.DTO.Payment.PaymentIntentDto;
import com.example.cdr.eventsmanagementsystem.DTO.Payment.PaymentIntentResponse;
import com.stripe.model.PaymentIntent;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    @Mapping(source = "id", target = "paymentIntentId")
    @Mapping(source = "clientSecret", target = "clientSecret")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "amount", target = "amount")
    @Mapping(source = "currency", target = "currency")
    @Mapping(source = "customerId", target = "customerId")
    @Mapping(source = "description", target = "description")
    PaymentIntentResponse toPaymentIntentResponse(PaymentIntentDto paymentIntentDto);

    default PaymentIntentResponse fromStripePaymentIntent(PaymentIntent paymentIntent) {
        if (paymentIntent == null) return null;
        
        PaymentIntentDto dto = new PaymentIntentDto();
        dto.setId(paymentIntent.getId());
        dto.setClientSecret(paymentIntent.getClientSecret());
        dto.setStatus(paymentIntent.getStatus());
        dto.setAmount(paymentIntent.getAmount());
        dto.setCurrency(paymentIntent.getCurrency());
        dto.setCustomerId(paymentIntent.getCustomer());
        dto.setDescription(paymentIntent.getDescription());
        
        return toPaymentIntentResponse(dto);
    }
}


