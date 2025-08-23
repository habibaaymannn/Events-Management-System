package com.example.cdr.eventsmanagementsystem.Service.User;

import com.example.cdr.eventsmanagementsystem.DTO.Admin.DashboardStatisticsDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.OrganizerRevenueDto;
import com.example.cdr.eventsmanagementsystem.DTO.projections.EventTypeCount;
import com.example.cdr.eventsmanagementsystem.DTO.projections.LocalDateCount;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventStatus;
import com.example.cdr.eventsmanagementsystem.Repository.BookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.EventRepository;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.*;
import com.example.cdr.eventsmanagementsystem.Repository.VenueRepository;
import com.example.cdr.eventsmanagementsystem.Service.Booking.StripeServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service class for administrative operations related statistics.
 * Handles reporting statistics.
 */

@Service
@RequiredArgsConstructor
public class StatisticsManagementImpl implements StatisticsManagement {
    private final AdminRepository adminRepository;
    private final OrganizerRepository organizerRepository;
    private final AttendeeRepository attendeeRepository;
    private final ServiceProviderRepository serviceProviderRepository;
    private final VenueProviderRepository venueProviderRepository;
    private final VenueRepository venueRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final StripeServiceInterface stripeService;


    @Override
    public DashboardStatisticsDto getDashboardStatistics() {
        DashboardStatisticsDto dto = new DashboardStatisticsDto();
        LocalDateTime now = LocalDateTime.now();
        dto.setTotalUpcoming(eventRepository.countByStartTimeAfterAndStatusNot(now, EventStatus.CANCELLED));
        dto.setTotalOngoing(eventRepository.countByStartTimeBeforeAndEndTimeAfterAndStatusNot(now, now, EventStatus.CANCELLED));
        dto.setTotalCompleted(eventRepository.countByEndTimeBeforeAndStatusNot(now, EventStatus.CANCELLED));
        dto.setTotalCancelled(eventRepository.countByStatus(EventStatus.CANCELLED));

        dto.setNumAdmins(adminRepository.count());
        dto.setNumOrganizers(organizerRepository.count());
        dto.setNumAttendees(attendeeRepository.count());
        dto.setNumServiceProviders(serviceProviderRepository.count());
        dto.setNumVenueProviders(venueProviderRepository.count());

        dto.setVenueUtilizationRate(getVenueUtilizationRate());
        dto.setServiceProviderUtilizationRate(getServiceProviderUtilizationRate());
        return dto;
    }

    @Override
    public Map<String, Long> getEventTypeDistribution() {
        return eventRepository.countEventsByType().stream()
                .map(o -> (EventTypeCount) o)
                .collect(Collectors.toMap(
                        r -> r.getType() == null ? "UNKNOWN" : r.getType().name(),
                        EventTypeCount::getCount
                ));
    }

    @Override
    public Map<LocalDate, Long> getDailyBookingCount(LocalDate startDate, LocalDate endDate) {
        return bookingRepository.countDailyBookingsBetween(startDate, endDate).stream()
                .map(o -> (LocalDateCount) o)
                .collect(Collectors.toMap(LocalDateCount::getDate, LocalDateCount::getCount));
    }

    @Override
    public Map<LocalDate, Long> getDailyCancellationCount(LocalDate startDate, LocalDate endDate) {
        return bookingRepository.countDailyCancellationsBetween(startDate, endDate).stream()
                .map(o -> (LocalDateCount) o)
                .collect(Collectors.toMap(LocalDateCount::getDate, LocalDateCount::getCount));
    }

    @Override
    public Page<OrganizerRevenueDto> getRevenuePerOrganizer(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        Map<String, BigDecimal> totalsByOrganizer = new HashMap<>();
        Map<String, BigDecimal> paymentAmountCache = new HashMap<>();

        LocalDateTime startTs = startDate.atStartOfDay();
        LocalDateTime endTs = endDate.atTime(java.time.LocalTime.MAX);

        PageRequest scanPage = PageRequest.of(0, 500);
        Page<Booking> page;
        do {
            page = bookingRepository.findByStatusAndUpdatedAtBetweenAndStripePaymentIdIsNotNull(
                    BookingStatus.BOOKED, startTs, endTs, scanPage);

            Set<String> uniquePaymentIds = page.getContent().stream()
                    .map(Booking::getStripePaymentId)
                    .filter(id -> id != null && !id.isBlank())
                    .collect(Collectors.toCollection(HashSet::new));

            for (String paymentId : uniquePaymentIds) {
                if (!paymentAmountCache.containsKey(paymentId)) {
                    try {
                        var intent = stripeService.retrievePaymentIntent(paymentId);
                        BigDecimal amount = BigDecimal.valueOf(intent.getAmount())
                                .divide(BigDecimal.valueOf(100));
                        paymentAmountCache.put(paymentId, amount);
                    } catch (Exception e) {
                        paymentAmountCache.put(paymentId, BigDecimal.ZERO);
                    }
                }
            }

            for (Booking b : page.getContent()) {
                String organizerId = b.getEvent().getOrganizer().getId();
                String paymentId = b.getStripePaymentId();
                if (paymentId == null || paymentId.isBlank()) continue;
                BigDecimal amount = paymentAmountCache.getOrDefault(paymentId, BigDecimal.ZERO);
                totalsByOrganizer.merge(organizerId, amount, BigDecimal::add);
            }

            scanPage = scanPage.next();
        } while (page.hasNext());

        List<OrganizerRevenueDto> items = totalsByOrganizer.entrySet().stream()
                .map(e -> {
                    OrganizerRevenueDto dto = new OrganizerRevenueDto();
                    dto.setOrganizerId(e.getKey());
                    organizerRepository.findById(e.getKey()).ifPresent(org -> dto.setOrganizerName(org.getFullName()));
                    dto.setTotalRevenue(e.getValue());
                    return dto;
                })
                .sorted(Comparator.comparing(OrganizerRevenueDto::getTotalRevenue).reversed())
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), items.size());
        List<OrganizerRevenueDto> content = start > end ? List.of() : items.subList(start, end);
        return new PageImpl<>(content, pageable, items.size());
    }

    @Override
    public double getVenueUtilizationRate() {
        long venues = Math.max(1, venueRepository.count());
        long booked = bookingRepository.countByVenueIsNotNullAndStatus(BookingStatus.BOOKED);
        return (double) booked / venues;
    }

    @Override
    public double getServiceProviderUtilizationRate() {
        long providers = Math.max(1, serviceProviderRepository.count());
        long bookedProviders = serviceProviderRepository.countDistinctBookedProviders();
        return (double) bookedProviders / providers;
    }
}
