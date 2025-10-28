package com.example.cdr.eventsmanagementsystem.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${payment.service.url:http://localhost:8082}")
    private String paymentServiceBaseUrl;

    @Bean
    public RestClient restClient() {
        return RestClient.builder()
                .baseUrl(paymentServiceBaseUrl)
                .build();
    }
    
    // Optional: If you need a builder for custom RestClient instances
    @Bean
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }
}