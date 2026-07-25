package com.mittyboard.service;

import com.mittyboard.dto.WorkspaceRequest;
import com.mittyboard.dto.WorkspaceResponse;
import com.mittyboard.entity.User;
import com.mittyboard.entity.Workspace;
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
        // userId parametresini kaldırdık, işlemi yapan kişiyi token'dan alıyoruz
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
        // userId parametresini kaldırdık, anlık kullanıcıyı yakalıyoruz
        User owner = currentUserService.getAuthenticatedUser();

        List<Workspace> workspaces = workspaceRepository.findByOwnerId(owner.getId());

        return workspaces.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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