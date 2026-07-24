package com.mittyboard.service;

import com.mittyboard.dto.UserRequest;
import com.mittyboard.dto.UserResponse;
import com.mittyboard.entity.User;
import com.mittyboard.enums.Role;
import com.mittyboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("This mail address already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(request.getPassword()) // Change with Spring Security
                .fullName(request.getFullName())
                .role(Role.USER)
                .build();

        User savedUser = userRepository.save(user);

        return mapToResponse(savedUser);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
