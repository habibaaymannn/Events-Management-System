package com.example.cdr.eventsmanagementsystem.DTO.Admin;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UiRevenue {
    private String organizerName;
    private BigDecimal revenue;  // net revenue (BigDecimal serialized as number)
}
