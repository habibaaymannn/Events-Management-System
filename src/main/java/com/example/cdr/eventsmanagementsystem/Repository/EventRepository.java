package com.example.cdr.eventsmanagementsystem.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.cdr.eventsmanagementsystem.DTO.projections.EventTypeCount;
import com.example.cdr.eventsmanagementsystem.Model.Event.Event;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventStatus;
import com.example.cdr.eventsmanagementsystem.Model.Event.EventType;
import com.example.cdr.eventsmanagementsystem.Model.User.Organizer;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByType(EventType type);

    Page<Event> findByStatus(EventStatus status, Pageable pageable);

    long countByStartTimeAfterAndStatusNot(LocalDateTime now, EventStatus status);

    long countByStartTimeBeforeAndEndTimeAfterAndStatusNot(LocalDateTime startBefore,
                                                           LocalDateTime endAfter,
                                                           EventStatus status);

    long countByEndTimeBeforeAndStatusNot(LocalDateTime now, EventStatus status);

    long countByStatus(EventStatus status);

    Page<Event> findByFlaggedTrue(Pageable pageable);

    @Query("select e.type as type, count(e) as count from Event e group by e.type")
    List<EventTypeCount> countEventsByType();

    Page<Event> findByOrganizer(Organizer organizer, Pageable pageable);

    @Query("""
    SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END 
    FROM Event e 
    WHERE e.id IN :eventIds 
    AND e.startTime < :endDate 
    AND e.endTime > :startDate
    """)
    boolean existsEventWithTimeConflict(
            @Param("eventIds") List<Long> eventIds,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

}
