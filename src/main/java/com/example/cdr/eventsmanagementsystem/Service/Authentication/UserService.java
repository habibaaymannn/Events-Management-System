package com.example.cdr.eventsmanagementsystem.Service.Authentication;

import com.example.cdr.eventsmanagementsystem.DTO.UserDTO;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final Map<String,IUserService> strategies;

    public UserService(List<IUserService> strategyList) {
        strategies = strategyList.stream()
                .collect(Collectors.toMap(s -> s.getUserType(), s -> s));
    }

    public void registerUser(UserDTO userDTO) {
        IUserService strategy = strategies.get(userDTO.getUserType().toLowerCase());
        if (strategy == null) {
            throw new IllegalArgumentException("Invalid userType");
        }
        strategy.register(userDTO);
    }
}
