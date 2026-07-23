package com.mittyboard.service;

import com.mittyboard.dto.WorkspaceRequest;
import com.mittyboard.dto.WorkspaceResponse;
import com.mittyboard.entity.User;
import com.mittyboard.entity.Workspace;
import com.mittyboard.repository.UserRepository;
import com.mittyboard.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;

    public WorkspaceResponse createWorkspace(WorkspaceRequest request, Long userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Workspace workspace = Workspace.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(owner)
                .build();

        Workspace savedWorkspace = workspaceRepository.save(workspace);

        return mapToResponse(savedWorkspace);
    }

    public List<WorkspaceResponse> getUserWorkSpaces(Long userId) {
        List<Workspace> workspaces = workspaceRepository.findByOwnerId(userId);

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
