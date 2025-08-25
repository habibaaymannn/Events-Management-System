package com.example.cdr.eventsmanagementsystem.Constants.NotificationConstants;

public class EmailMessages {
    public static final String PAYMENT_REQUEST = """
        Hello %s,
        
        Complete your payment for booking #%d:
        %s
        
        Payment expires in 24 hours.
        
        Best regards,
        Events Team""";

    public static final String BOOKING_CONFIRMED = """
        Hello %s,
        
        Your %s booking #%d is confirmed!
        Payment ID: %s
        
        Best regavrds,
        Events Team""";

    public static final String BOOKING_CANCELLED = """
        Hello %s,
        
        Your booking #%d has been cancelled.
        Refund will be processed within 5-10 business days.
        
        Best regards,
        Events Team""";

    public static final String PAYMENT_FAILED = """
        Hello %s,
        
        Unfortunately, your payment for booking #%d could not be processed.
        
        Reason: %s
        
        Please try again or contact support if the issue persists.
        Your booking will remain pending for 24 hours.
        
        Best regards,
        Events Team""";

    public static final String NEW_BOOKING_REQUEST = """
        Hello %s,
        
        You have a new booking request for your %s '%s'.
        Booking ID: %d
        Date: %s to %s
        Booked by: %s
        
        The booking will be confirmed once payment is completed.
        
        Best regards,
        Events Team""";

    public static final String PROVIDER_CANCELLATION = """
        Hello %s,
        
        A booking for your %s '%s' has been cancelled.
        Booking ID: %d
        Original Date: %s to %s
        Booked by: %s (%s)
        Cancellation Reason: %s
        
        Best regards,
        Events Team""";
    public static final String SERVICE_STATUS_UPDATE = """
        Hello %s,
        
        Your Service Booking #%d has been %s by %s.
        
        Best regards,
        Events Team""";
    public static final String EVENT_REMINDER = """
        Hello %s,
        
        This is a reminder for your upcoming event:
        Event: %s.
        Date: %s.

        Don't miss it out!
        
        Best regards,
        Events Team""";
}
