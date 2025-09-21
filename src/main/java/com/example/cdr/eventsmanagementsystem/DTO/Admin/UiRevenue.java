// src/main/java/com/example/cdr/eventsmanagementsystem/DTO/Admin/UiRevenue.java
package com.example.cdr.eventsmanagementsystem.DTO.Admin;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UiRevenue {
    private String name;         // organizer name
    private BigDecimal revenue;  // net revenue (BigDecimal serialized as number)
}
