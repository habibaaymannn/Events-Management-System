package com.example.cdr.eventsmanagementsystem.Controller.BookingController;

import com.example.cdr.eventsmanagementsystem.Constants.ControllerConstants.BookingControllerConstants;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Base abstract controller for booking-related endpoints.
 * Provides the base URL mapping for all booking controllers.
 */
@RequestMapping(BookingControllerConstants.BOOKING_BASE_URL)
public abstract class BookingController {

}