package com.example.cdr.eventsmanagementsystem.Model.User;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "attendees")
public class Attendee extends BaseRoleEntity {
}
