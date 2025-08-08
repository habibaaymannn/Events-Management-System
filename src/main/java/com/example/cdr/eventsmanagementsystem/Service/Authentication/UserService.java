package com.example.cdr.eventsmanagementsystem.Service.Authentication;

import com.example.cdr.eventsmanagementsystem.DTO.UserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;


@RequiredArgsConstructor
@Service
public class UserService {
    private final List<IUserService> strategies;

    public void saveUserData(UserDTO userDTO) {
        IUserService strategy = strategies.stream()
                .filter(s -> s.supports(userDTO.getUserType()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported userType: " + userDTO.getUserType()));

        strategy.saveUserData(userDTO);
    }
}
