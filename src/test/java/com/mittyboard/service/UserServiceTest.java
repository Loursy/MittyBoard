package com.mittyboard.service;

import com.mittyboard.dto.UserRequest;
import com.mittyboard.dto.UserResponse;
import com.mittyboard.entity.User;
import com.mittyboard.enums.Role;
import com.mittyboard.exception.ResourceConflictException;
import com.mittyboard.repository.UserRepository;
import com.mittyboard.security.CurrentUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    // ==========================================
    // CREATE USER TESTS
    // ==========================================

    @Test
    void shouldCreateUser_whenValidRequest_andEmailDoesNotExist() {
        // GIVEN
        UserRequest request = new UserRequest();
        request.setEmail("test@mittyboard.com");
        request.setPassword("plainPassword123");
        request.setFullName("Test User");

        User savedUser = User.builder()
                .id(1L)
                .email("test@mittyboard.com")
                .password("encodedPassword123")
                .fullName("Test User")
                .role(Role.USER)
                .build();

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword123");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // WHEN
        UserResponse response = userService.createUser(request);

        // THEN
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("test@mittyboard.com", response.getEmail());
        assertEquals("Test User", response.getFullName());
        assertEquals(Role.USER, response.getRole());

        verify(userRepository, times(1)).existsByEmail("test@mittyboard.com");
        verify(passwordEncoder, times(1)).encode("plainPassword123");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void shouldThrowException_whenCreatingUser_andEmailAlreadyExists() {
        // GIVEN
        UserRequest request = new UserRequest();
        request.setEmail("existing@mittyboard.com");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        // WHEN & THEN
        ResourceConflictException exception = assertThrows(ResourceConflictException.class, () -> {
            userService.createUser(request);
        });

        assertEquals("This mail address already exists", exception.getMessage());

        // Veritabanına kayıt veya şifreleme işlemi kesinlikle yapılmamalı
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    // ==========================================
    // UPDATE CURRENT USER TESTS
    // ==========================================

    @Test
    void shouldUpdateUser_whenValidRequest() {
        // GIVEN
        User currentUser = User.builder()
                .id(1L)
                .email("old@mittyboard.com")
                .fullName("Old Name")
                .password("oldEncodedPassword")
                .role(Role.USER)
                .build();

        UserRequest updateRequest = new UserRequest();
        updateRequest.setEmail("new@mittyboard.com");
        updateRequest.setFullName("New Name");
        updateRequest.setPassword("newPlainPassword");

        when(currentUserService.getAuthenticatedUser()).thenReturn(currentUser);
        when(userRepository.existsByEmail("new@mittyboard.com")).thenReturn(false);
        when(passwordEncoder.encode("newPlainPassword")).thenReturn("newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(currentUser);

        // WHEN
        UserResponse response = userService.updateCurrentUser(updateRequest);

        // THEN
        assertNotNull(response);
        assertEquals("new@mittyboard.com", response.getEmail());
        assertEquals("New Name", response.getFullName());

        assertEquals("newEncodedPassword", currentUser.getPassword());

        verify(userRepository, times(1)).save(currentUser);
    }

    @Test
    void shouldThrowException_whenUpdatingEmail_andEmailAlreadyExists() {
        // GIVEN
        User currentUser = User.builder()
                .id(1L)
                .email("myemail@mittyboard.com")
                .build();

        UserRequest updateRequest = new UserRequest();
        updateRequest.setEmail("taken@mittyboard.com");

        when(currentUserService.getAuthenticatedUser()).thenReturn(currentUser);
        when(userRepository.existsByEmail("taken@mittyboard.com")).thenReturn(true);

        // WHEN & THEN
        ResourceConflictException exception = assertThrows(ResourceConflictException.class, () -> {
            userService.updateCurrentUser(updateRequest);
        });

        assertEquals("This email is already registered!", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldNotUpdateFields_whenFieldsAreBlankOrNull() {
        // GIVEN
        User currentUser = User.builder()
                .id(1L)
                .email("original@mittyboard.com")
                .fullName("Original Name")
                .password("originalEncodedPassword")
                .build();

        UserRequest updateRequest = new UserRequest();
        updateRequest.setEmail(null); // Değişmemeli
        updateRequest.setFullName("   "); // Boşluk olduğu için değişmemeli
        updateRequest.setPassword("   "); // Boşluk olduğu için değişmemeli

        when(currentUserService.getAuthenticatedUser()).thenReturn(currentUser);
        when(userRepository.save(any(User.class))).thenReturn(currentUser);

        // WHEN
        UserResponse response = userService.updateCurrentUser(updateRequest);

        // THEN
        assertEquals("original@mittyboard.com", response.getEmail());
        assertEquals("Original Name", response.getFullName());
        assertEquals("originalEncodedPassword", currentUser.getPassword()); // Şifre aynı kalmalı

        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).existsByEmail(anyString());
        verify(userRepository, times(1)).save(currentUser);
    }
}