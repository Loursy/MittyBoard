package com.mittyboard.service;

import com.mittyboard.dto.UserRequest;
import com.mittyboard.dto.UserResponse;
import com.mittyboard.entity.User;
import com.mittyboard.enums.Role;
import com.mittyboard.repository.UserRepository;
import com.mittyboard.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final PasswordEncoder passwordEncoder;

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

    public UserResponse updateCurrentUser(UserRequest request) {

        User currentUser = currentUserService.getAuthenticatedUser();

        if (request.getFullName() != null) {
            currentUser.setFullName(request.getFullName());
        }

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(currentUser.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("This email is already registered!");
            }
            currentUser.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            currentUser.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User updatedUser = userRepository.save(currentUser);
        return mapToResponse(updatedUser);
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
