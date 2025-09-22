package com.example.cdr.eventsmanagementsystem.Service.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.cdr.eventsmanagementsystem.DTO.Admin.DashboardStatisticsDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.OrganizerRevenueDto;
import com.example.cdr.eventsmanagementsystem.DTO.projections.EventTypeCount;
import com.example.cdr.eventsmanagementsystem.DTO.projections.LocalDateCount;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventStatus;
import com.example.cdr.eventsmanagementsystem.Repository.EventBookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.EventRepository;
import com.example.cdr.eventsmanagementsystem.Repository.ServiceBookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.AdminRepository;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.AttendeeRepository;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.OrganizerRepository;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.ServiceProviderRepository;
import com.example.cdr.eventsmanagementsystem.Repository.UsersRepository.VenueProviderRepository;
import com.example.cdr.eventsmanagementsystem.Repository.VenueBookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.VenueRepository;
import com.example.cdr.eventsmanagementsystem.Service.Payment.StripeService;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.UiRevenue;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.time.*;

/**
 * Service class for administrative operations related statistics. Handles
 * reporting statistics.
 */

@Service
@RequiredArgsConstructor
public class StatisticsManagement {

    private final AdminRepository adminRepository;
    private final OrganizerRepository organizerRepository;
    private final AttendeeRepository attendeeRepository;
    private final ServiceProviderRepository serviceProviderRepository;
    private final VenueProviderRepository venueProviderRepository;
    private final VenueRepository venueRepository;
    private final EventRepository eventRepository;
    private final StripeService stripeService;
    private final VenueBookingRepository venueBookingRepository;
    private final EventBookingRepository eventBookingRepository;
    private final ServiceBookingRepository serviceBookingRepository;

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

        // dto.setVenueUtilizationRate(getVenueUtilizationRate());
        // dto.setServiceProviderUtilizationRate(getServiceProviderUtilizationRate());
        // dto.setRevenueByOrganizer(buildUiRevenue());
        // Venue counts + rate
        long venueTotal = venueRepository.count();
        long venueActiveNow = venueBookingRepository.countDistinctActiveVenueIdsAt(now);
        dto.setVenueTotal(venueTotal);
        dto.setVenueActiveNow(venueActiveNow);
        dto.setVenueUtilizationRate(venueTotal == 0 ? 0.0 : (double) venueActiveNow / venueTotal);

        // Service-provider counts + rate
        long svcTotal = serviceProviderRepository.count();
        long svcActiveNow = serviceBookingRepository.countDistinctActiveServiceProvidersAt(now);
        dto.setServiceProvidersTotal(svcTotal);
        dto.setServiceProvidersActiveNow(svcActiveNow);
        dto.setServiceProviderUtilizationRate(svcTotal == 0 ? 0.0 : (double) svcActiveNow / svcTotal);

        // Revenue
        dto.setRevenueByOrganizer(buildUiRevenue());
        return dto;
    }

    private java.util.List<UiRevenue> buildUiRevenue() {
        var rows = eventBookingRepository.sumRevenueByOrganizer();

        var out = new java.util.ArrayList<UiRevenue>(rows.size());
        for (var r : rows) {
            String first = r.getFirstName();
            String last = r.getLastName();
            String displayName;

            if ((first == null || first.isBlank()) && (last == null || last.isBlank())) {
                displayName = "Organizer " + r.getOrganizerId();
            } else {
                displayName = ((first == null ? "" : first) + (last == null || last.isBlank() ? "" : " " + last)).trim();
            }

            out.add(new UiRevenue(displayName, r.getRevenue()));
        }
        return out;
    }

    private static Map<LocalDate, Long> initDateRange(LocalDate start, LocalDate end) {
        Map<LocalDate, Long> map = new LinkedHashMap<>();
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            map.put(d, 0L);
        }
        return map;
    }

    private static void mergeCounts(Map<LocalDate, Long> base, List<LocalDateCount> rows) {
        for (LocalDateCount row : rows) {
            LocalDate d = row.getDate();
            if (d != null && base.containsKey(d)) {
                base.put(d, base.get(d) + row.getCount());
            }
        }
    }

    public Map<String, Long> getEventTypeDistribution() {
        return eventRepository.countEventsByType().stream()
                .collect(Collectors.toMap(
                        r -> r.getType() == null ? "UNKNOWN" : r.getType().name(),
                        EventTypeCount::getCount
                ));
    }

    public Map<LocalDate, Long> getDailyBookingCount(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startTs = startDate.atStartOfDay();
        LocalDateTime endTs = endDate.plusDays(1).atStartOfDay().minusNanos(1); // inclusive end-of-day

        Map<LocalDate, Long> result = initDateRange(startDate, endDate);

        mergeCounts(result, eventBookingRepository.countDailyBookingsBetween(startTs, endTs));
        mergeCounts(result, venueBookingRepository.countDailyBookingsBetween(startTs, endTs));
        // If you don’t have service bookings yet, comment this next line:
        mergeCounts(result, serviceBookingRepository.countDailyBookingsBetween(startTs, endTs));

        return result;
    }

    public Map<LocalDate, Long> getDailyCancellationCount(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startTs = startDate.atStartOfDay();
        LocalDateTime endTs = endDate.plusDays(1).atStartOfDay().minusNanos(1);

        Map<LocalDate, Long> result = initDateRange(startDate, endDate);

        mergeCounts(result, eventBookingRepository.countDailyCancellationsBetween(startTs, endTs));
        mergeCounts(result, venueBookingRepository.countDailyCancellationsBetween(startTs, endTs));
        // Likewise, comment if ServiceBooking isn’t in yet:
        mergeCounts(result, serviceBookingRepository.countDailyCancellationsBetween(startTs, endTs));

        return result;
    }

    public Map<String, Long> dailyBookingsBreakdown(LocalDate day) {
        var cairo = java.time.ZoneId.of("Africa/Cairo");
        var utc = java.time.ZoneOffset.UTC;

        var cairoStart = day.atStartOfDay(cairo);
        var cairoEnd = day.plusDays(1).atStartOfDay(cairo);

        var startUtc = cairoStart.withZoneSameInstant(utc).toLocalDateTime();
        var endUtc = cairoEnd.withZoneSameInstant(utc).toLocalDateTime();

        var ok = java.util.EnumSet.of(
                com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus.BOOKED,
                com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus.ACCEPTED
        );

        long events = eventBookingRepository.countCreatedBetweenForStatuses(startUtc, endUtc, ok);
        long services = serviceBookingRepository.countCreatedBetweenForStatuses(startUtc, endUtc, ok);
        long venue = venueBookingRepository.countCreatedBetweenForStatuses(startUtc, endUtc, ok);

        long total = events + services + venue;
        return java.util.Map.of("venue", venue, "services", services, "events", events, "total", total);
    }

    public Map<String, Long> dailyCancellationsBreakdown(LocalDate day) {
        ZoneId cairo = ZoneId.of("Africa/Cairo");
        ZoneId utc = ZoneOffset.UTC;

        ZonedDateTime cairoStart = day.atStartOfDay(cairo);
        ZonedDateTime cairoEnd = day.plusDays(1).atStartOfDay(cairo);

        LocalDateTime startUtc = cairoStart.withZoneSameInstant(utc).toLocalDateTime();
        LocalDateTime endUtc = cairoEnd.withZoneSameInstant(utc).toLocalDateTime();

        long events = eventBookingRepository.countCancelledBetween(BookingStatus.CANCELLED, startUtc, endUtc);
        long services = serviceBookingRepository.countCancelledBetween(BookingStatus.CANCELLED, startUtc, endUtc);
        long venue = venueBookingRepository.countCancelledBetween(BookingStatus.CANCELLED, startUtc, endUtc);

        return Map.of("venue", venue, "services", services, "events", events, "total", venue + services + events);
    }

    public Page<OrganizerRevenueDto> getRevenuePerOrganizer(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        var rows = eventBookingRepository.sumRevenueByOrganizer(); // projection: organizerId, revenue

        var items = rows.stream().map(r -> {
            var dto = new OrganizerRevenueDto();

            String organizerIdStr = String.valueOf(r.getOrganizerId());
            dto.setOrganizerId(organizerIdStr);

            String displayName = organizerRepository.findById(organizerIdStr)
                    .map(org -> org.getFullName())
                    .filter(name -> name != null && !name.isBlank())
                    .orElse("Organizer " + organizerIdStr);
            dto.setOrganizerName(displayName);

            dto.setTotalRevenue(r.getRevenue() == null ? java.math.BigDecimal.ZERO : r.getRevenue());
            return dto;
        })
                .sorted(Comparator.comparing(OrganizerRevenueDto::getTotalRevenue).reversed())
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), items.size());
        var content = start >= items.size() ? java.util.List.<OrganizerRevenueDto>of() : items.subList(start, end);
        return new PageImpl<>(content, pageable, items.size());
    }

    // public double getVenueUtilizationRate() {
    //     long totalVenues = venueRepository.count();
    //     if (totalVenues == 0) return 0.0;
    //     LocalDateTime now = LocalDateTime.now();
    //     long activeDistinctVenues = venueBookingRepository.countDistinctActiveVenueIdsAt(now);
    //     return (double) activeDistinctVenues / (double) totalVenues; // 0..1
    // }
    public double getVenueUtilizationRate() {
        long totalVenues = venueRepository.count();
        if (totalVenues == 0) {
            return 0.0;
        }

        var zone = java.time.ZoneId.of("Africa/Cairo");
        LocalDateTime now = java.time.ZonedDateTime.now(zone).toLocalDateTime();
        long active = venueBookingRepository.countDistinctActiveVenueIdsAt(now);

        // If we prefer “now..end of day”:
        // LocalDateTime eod = now.toLocalDate().atTime(23, 59, 59, 999_000_000);
        // long active = venueBookingRepository.countDistinctVenueIdsInWindow(now, eod);
        return (double) active / (double) totalVenues;
    }

    public double getServiceProviderUtilizationRate() {
        long totalProviders = serviceProviderRepository.count();
        if (totalProviders == 0) {
            return 0.0;
        }
        LocalDateTime now = LocalDateTime.now();
        long activeDistinctProviders = serviceBookingRepository.countDistinctActiveServiceProvidersAt(now);
        return (double) activeDistinctProviders / (double) totalProviders; // 0..1
    }

}
