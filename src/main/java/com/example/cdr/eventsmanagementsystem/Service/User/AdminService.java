package com.example.cdr.eventsmanagementsystem.Service.User;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.cdr.eventsmanagementsystem.DTO.Admin.DashboardStatisticsDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.EventDetailsDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.OrganizerRevenueDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.UserCreateDto;
import com.example.cdr.eventsmanagementsystem.DTO.Admin.UserDetailsDto;
import com.example.cdr.eventsmanagementsystem.DTO.projections.EventTypeCount;
import com.example.cdr.eventsmanagementsystem.DTO.projections.LocalDateCount;
import com.example.cdr.eventsmanagementsystem.Mapper.AdminMapper;
import com.example.cdr.eventsmanagementsystem.Model.Booking.Booking;
import com.example.cdr.eventsmanagementsystem.Model.Booking.BookingStatus;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventStatus;
import com.example.cdr.eventsmanagementsystem.Model.User.Admin;
import com.example.cdr.eventsmanagementsystem.Model.User.Attendee;
import com.example.cdr.eventsmanagementsystem.Model.User.BaseRoleEntity;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;
import com.example.cdr.eventsmanagementsystem.Model.User.ServiceProvider;
import com.example.cdr.eventsmanagementsystem.Model.User.VenueProvider;
import com.example.cdr.eventsmanagementsystem.Repository.AdminRepository;
import com.example.cdr.eventsmanagementsystem.Repository.AttendeeRepository;
import com.example.cdr.eventsmanagementsystem.Repository.BookingRepository;
import com.example.cdr.eventsmanagementsystem.Repository.EventRepository;
import com.example.cdr.eventsmanagementsystem.Repository.OrganizerRepository;
import com.example.cdr.eventsmanagementsystem.Repository.ServiceProviderRepository;
import com.example.cdr.eventsmanagementsystem.Repository.VenueProviderRepository;
import com.example.cdr.eventsmanagementsystem.Repository.VenueRepository;
import com.example.cdr.eventsmanagementsystem.Service.Auth.UserSyncService;
import com.example.cdr.eventsmanagementsystem.Service.Booking.IStripeService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminService implements IAdminService {

    private final AdminRepository adminRepository;
    private final OrganizerRepository organizerRepository;
    private final AttendeeRepository attendeeRepository;
    private final ServiceProviderRepository serviceProviderRepository;
    private final VenueProviderRepository venueProviderRepository;
    private final VenueRepository venueRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final IStripeService stripeService;
    private final AdminMapper adminMapper;
    private final UserSyncService userSyncService;

    @Override
    public Page<UserDetailsDto> getAllUsers(Pageable pageable) {
        List<UserDetailsDto> items =
            adminRepository.findAll().stream().map(adminMapper::toUserDetails)
            .collect(Collectors.toList());
        items.addAll(organizerRepository.findAll().stream().map(adminMapper::toUserDetails).toList());
        items.addAll(attendeeRepository.findAll().stream().map(adminMapper::toUserDetails).toList());
        items.addAll(serviceProviderRepository.findAll().stream().map(adminMapper::toUserDetails).toList());
        items.addAll(venueProviderRepository.findAll().stream().map(adminMapper::toUserDetails).toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), items.size());
        List<UserDetailsDto> content = start > end ? List.of() : items.subList(start, end);
        return new PageImpl<>(content, pageable, items.size());
    }

    @Override
    public UserDetailsDto createUser(UserCreateDto userCreateDto) {
        BaseRoleEntity entity = switch (userCreateDto.getRole().toLowerCase()) {
            case "admin" -> new Admin();
            case "organizer" -> new Organizer();
            case "service_provider" -> new ServiceProvider();
            case "venue_provider" -> new VenueProvider();
            default -> new Attendee();
        };
        entity.setId(java.util.UUID.randomUUID().toString());
        entity.setFirstName(userCreateDto.getFirstName());
        entity.setLastName(userCreateDto.getLastName());
        entity.setEmail(userCreateDto.getEmail());
        entity.setActive(true);

        switch (entity) {
            case Admin admin -> adminRepository.save(admin);
            case Organizer organizer -> organizerRepository.save(organizer);
            case ServiceProvider serviceProvider -> serviceProviderRepository.save(serviceProvider);
            case VenueProvider venueProvider -> venueProviderRepository.save(venueProvider);
            case Attendee attendee -> attendeeRepository.save(attendee);
            default -> throw new IllegalArgumentException("Unknown user role");
        }

        return adminMapper.toUserDetails(entity);
    }

    @Override
    public UserDetailsDto updateUserRole(String userId, String role) {
        BaseRoleEntity existing = userSyncService.findUserById(userId);
        if (existing == null) {
            throw new IllegalArgumentException("User not found: " + userId);
        }

        BaseRoleEntity target = switch (role) {
            case "admin" -> new Admin();
            case "organizer" -> new Organizer();
            case "service_provider" -> new ServiceProvider();
            case "venue_provider" -> new VenueProvider();
            case "attendee" -> new Attendee();
            default -> throw new IllegalArgumentException("Unknown target role: " + role);
        };

        if (existing.getClass().equals(target.getClass())) {
            return adminMapper.toUserDetails(existing);
        }

        target.setId(existing.getId());
        target.setFirstName(existing.getFirstName());
        target.setLastName(existing.getLastName());
        target.setEmail(existing.getEmail());
        target.setActive(existing.isActive());

        if (existing instanceof Admin) {
            adminRepository.deleteById(userId);
        } else if (existing instanceof Organizer) {
            organizerRepository.deleteById(userId);
        } else if (existing instanceof ServiceProvider) {
            serviceProviderRepository.deleteById(userId);
        } else if (existing instanceof VenueProvider) {
            venueProviderRepository.deleteById(userId);
        } else if (existing instanceof Attendee) {
            attendeeRepository.deleteById(userId);
        }

        userSyncService.saveUser(target);

        return adminMapper.toUserDetails(target);
    }

    @Override
    public void deactivateUser(String userId) {
        BaseRoleEntity user = userSyncService.findUserById(userId);
        if (user == null) {
            throw new IllegalArgumentException("User not found: " + userId);
        }
        user.setActive(false);
        userSyncService.saveUser(user);
    }

    @Override
    public void resetPassword(String userId) {
        // TODO: Implement password reset
        throw new UnsupportedOperationException("Not implemented");
    }

    @Override
    public Page<EventDetailsDto> getAllEvents(Pageable pageable) {
        return eventRepository.findAll(pageable).map(adminMapper::toEventDetailsDto);
    }

    @Override
    public Page<EventDetailsDto> getEventsByStatus(EventStatus status, Pageable pageable) {
        return eventRepository.findByStatus(status, pageable).map(adminMapper::toEventDetailsDto);
    }

    @Override
    public Page<EventDetailsDto> getFlaggedEvents(Pageable pageable) {
        return eventRepository.findByFlaggedTrue(pageable).map(adminMapper::toEventDetailsDto);
    }

    @Override
    public void cancelEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));
        event.setStatus(EventStatus.CANCELLED);
        eventRepository.save(event);
    }

    @Override
    public void flagEvent(Long eventId, String reason) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));
        event.setFlagged(true);
        event.setFlagReason(reason);
        eventRepository.save(event);
    }

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

        java.time.LocalDateTime startTs = startDate.atStartOfDay();
        java.time.LocalDateTime endTs = endDate.atTime(java.time.LocalTime.MAX);

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
