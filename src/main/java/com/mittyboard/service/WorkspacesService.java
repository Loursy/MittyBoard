package com.mittyboard.service;

import com.mittyboard.dto.WorkspaceRequest;
import com.mittyboard.dto.WorkspaceResponse;
import com.mittyboard.entity.User;
import com.mittyboard.entity.Workspace;
import com.mittyboard.exception.ResourceNotFoundException;
import com.mittyboard.exception.UnauthorizedAccessException;
import com.mittyboard.repository.WorkspaceRepository;
import com.mittyboard.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkspacesService {

    private final WorkspaceRepository workspaceRepository;
    private final CurrentUserService currentUserService;

    public WorkspaceResponse createWorkspace(WorkspaceRequest request) {

        User owner = currentUserService.getAuthenticatedUser();

        Workspace workspace = Workspace.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(owner)
                .build();

        Workspace savedWorkspace = workspaceRepository.save(workspace);

        return mapToResponse(savedWorkspace);
    }

    public List<WorkspaceResponse> getUserWorkSpaces() {

        User owner = currentUserService.getAuthenticatedUser();

        List<Workspace> workspaces = workspaceRepository.findByOwnerId(owner.getId());

        return workspaces.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public WorkspaceResponse updateWorkspace(Long workspaceId, WorkspaceRequest request) {
        User currentUser = currentUserService.getAuthenticatedUser();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace cannot be found"));

        if (!workspace.getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to update this workspace");
        }

        if(request.getName() != null && !request.getName().isBlank()) {
            workspace.setName(request.getName());
        }

        if(request.getDescription() != null) {
            workspace.setDescription(request.getDescription());
        }

        Workspace updatedWorkspace = workspaceRepository.save(workspace);
        return mapToResponse(updatedWorkspace);
    }

    public void deleteWorkspace(Long workspaceId) {
        User currentUser = currentUserService.getAuthenticatedUser();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace cannot be found!"));

        if (!workspace.getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to delete this workspace");
        }

        workspaceRepository.delete(workspace);
    }

    private WorkspaceResponse mapToResponse(Workspace workspace) {
        return WorkspaceResponse.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .description(workspace.getDescription())
                .ownerId(workspace.getOwner().getId())
                .createdAt(workspace.getCreatedAt())
                .build();
    }
}