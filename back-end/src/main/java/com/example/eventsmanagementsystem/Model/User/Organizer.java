package com.example.eventsmanagementsystem.Model.User;

import java.util.ArrayList;
import java.util.List;

import com.example.eventsmanagementsystem.Model.Event.Event;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "organizers")
public class Organizer extends BaseRoleEntity {

    @OneToMany(mappedBy = "organizer")
    private List<Event> events = new ArrayList<>();
}
