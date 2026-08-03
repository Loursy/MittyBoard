package com.mittyboard.service;

import com.mittyboard.dto.WorkspaceRequest;
import com.mittyboard.dto.WorkspaceResponse;
import com.mittyboard.entity.User;
import com.mittyboard.entity.Workspace;
import com.mittyboard.exception.ResourceNotFoundException;
import com.mittyboard.exception.UnauthorizedAccessException;
import com.mittyboard.repository.WorkspaceRepository;
import com.mittyboard.security.CurrentUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WorkspacesServiceTest {

    @Mock
    private WorkspaceRepository workspaceRepository;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private WorkspacesService workspacesService;

    // ==========================================
    // CREATE WORKSPACE TESTS
    // ==========================================

    @Test
    void shouldCreateWorkspace_whenValidRequest() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);

        WorkspaceRequest request = new WorkspaceRequest();
        request.setName("My Workspace");
        request.setDescription("Workspace Description");

        Workspace savedWorkspace = Workspace.builder()
                .id(10L)
                .name("My Workspace")
                .description("Workspace Description")
                .owner(mockOwner)
                .build();

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(workspaceRepository.save(any(Workspace.class))).thenReturn(savedWorkspace);

        // WHEN
        WorkspaceResponse response = workspacesService.createWorkspace(request);

        // THEN
        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("My Workspace", response.getName());
        assertEquals(1L, response.getOwnerId());

        verify(workspaceRepository, times(1)).save(any(Workspace.class));
    }

    // ==========================================
    // GET USER WORKSPACES TESTS
    // ==========================================

    @Test
    void shouldReturnWorkspaces_forAuthenticatedUser() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);

        Workspace ws1 = Workspace.builder().id(10L).name("WS 1").owner(mockOwner).build();
        Workspace ws2 = Workspace.builder().id(11L).name("WS 2").owner(mockOwner).build();

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(workspaceRepository.findByOwnerId(1L)).thenReturn(List.of(ws1, ws2));

        // WHEN
        List<WorkspaceResponse> responses = workspacesService.getUserWorkSpaces();

        // THEN
        assertNotNull(responses);
        assertEquals(2, responses.size());
        assertEquals("WS 1", responses.get(0).getName());
        assertEquals("WS 2", responses.get(1).getName());

        verify(workspaceRepository, times(1)).findByOwnerId(1L);
    }

    @Test
    void shouldReturnEmptyList_whenUserHasNoWorkspaces() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(workspaceRepository.findByOwnerId(1L)).thenReturn(Collections.emptyList());

        // WHEN
        List<WorkspaceResponse> responses = workspacesService.getUserWorkSpaces();

        // THEN
        assertNotNull(responses);
        assertTrue(responses.isEmpty());
    }

    // ==========================================
    // UPDATE WORKSPACE TESTS
    // ==========================================

    @Test
    void shouldUpdateWorkspace_whenValidRequest_andUserIsOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);

        Workspace existingWorkspace = Workspace.builder()
                .id(10L).name("Old Name").description("Old Desc").owner(mockOwner).build();

        WorkspaceRequest updateRequest = new WorkspaceRequest();
        updateRequest.setName("New Name");
        updateRequest.setDescription("New Desc");

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(workspaceRepository.findById(10L)).thenReturn(Optional.of(existingWorkspace));
        when(workspaceRepository.save(any(Workspace.class))).thenReturn(existingWorkspace);

        // WHEN
        WorkspaceResponse response = workspacesService.updateWorkspace(10L, updateRequest);

        // THEN
        assertNotNull(response);
        assertEquals("New Name", response.getName());
        assertEquals("New Desc", response.getDescription());
        verify(workspaceRepository, times(1)).save(existingWorkspace);
    }

    @Test
    void shouldNotUpdateName_whenNameIsBlank() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);

        Workspace existingWorkspace = Workspace.builder()
                .id(10L).name("Original Name").description("Old Desc").owner(mockOwner).build();

        WorkspaceRequest updateRequest = new WorkspaceRequest();
        updateRequest.setName("   "); // Blank name
        updateRequest.setDescription("Updated Desc");

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(workspaceRepository.findById(10L)).thenReturn(Optional.of(existingWorkspace));
        when(workspaceRepository.save(any(Workspace.class))).thenReturn(existingWorkspace);

        // WHEN
        WorkspaceResponse response = workspacesService.updateWorkspace(10L, updateRequest);

        // THEN
        assertEquals("Original Name", response.getName()); // Name must remain unchanged
        assertEquals("Updated Desc", response.getDescription()); // Description should update
    }

    @Test
    void shouldThrowException_whenUpdatingWorkspace_andWorkspaceNotFound() {
        // GIVEN
        WorkspaceRequest updateRequest = new WorkspaceRequest();
        updateRequest.setName("New Name");

        when(currentUserService.getAuthenticatedUser()).thenReturn(new User());
        when(workspaceRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN & THEN
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            workspacesService.updateWorkspace(99L, updateRequest);
        });

        assertEquals("Workspace cannot be found", exception.getMessage());
        verify(workspaceRepository, never()).save(any());
    }

    @Test
    void shouldThrowException_whenUpdatingWorkspace_andUserIsNotOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace existingWorkspace = Workspace.builder()
                .id(10L).name("My Workspace").owner(mockOwner).build();

        User unauthorizedUser = new User(); unauthorizedUser.setId(2L);
        WorkspaceRequest updateRequest = new WorkspaceRequest();
        updateRequest.setName("Hacked Name");

        when(currentUserService.getAuthenticatedUser()).thenReturn(unauthorizedUser);
        when(workspaceRepository.findById(10L)).thenReturn(Optional.of(existingWorkspace));

        // WHEN & THEN
        UnauthorizedAccessException exception = assertThrows(UnauthorizedAccessException.class, () -> {
            workspacesService.updateWorkspace(10L, updateRequest);
        });

        assertEquals("You are not authorized to update this workspace", exception.getMessage());
        verify(workspaceRepository, never()).save(any());
    }

    // ==========================================
    // DELETE WORKSPACE TESTS
    // ==========================================

    @Test
    void shouldDeleteWorkspace_whenUserIsOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace existingWorkspace = Workspace.builder()
                .id(10L).name("My Workspace").owner(mockOwner).build();

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(workspaceRepository.findById(10L)).thenReturn(Optional.of(existingWorkspace));

        // WHEN
        workspacesService.deleteWorkspace(10L);

        // THEN
        verify(workspaceRepository, times(1)).delete(existingWorkspace);
    }

    @Test
    void shouldThrowException_whenDeletingWorkspace_andWorkspaceNotFound() {
        // GIVEN
        when(currentUserService.getAuthenticatedUser()).thenReturn(new User());
        when(workspaceRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN & THEN
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            workspacesService.deleteWorkspace(99L);
        });

        assertEquals("Workspace cannot be found!", exception.getMessage());
        verify(workspaceRepository, never()).delete(any());
    }

    @Test
    void shouldThrowException_whenDeletingWorkspace_andUserIsNotOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace existingWorkspace = Workspace.builder()
                .id(10L).name("My Workspace").owner(mockOwner).build();

        User unauthorizedUser = new User(); unauthorizedUser.setId(2L);

        when(currentUserService.getAuthenticatedUser()).thenReturn(unauthorizedUser);
        when(workspaceRepository.findById(10L)).thenReturn(Optional.of(existingWorkspace));

        // WHEN & THEN
        UnauthorizedAccessException exception = assertThrows(UnauthorizedAccessException.class, () -> {
            workspacesService.deleteWorkspace(10L);
        });

        assertEquals("You are not authorized to delete this workspace", exception.getMessage());
        verify(workspaceRepository, never()).delete(any());
    }
}