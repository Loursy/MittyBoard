package com.mittyboard.controller;

import com.mittyboard.dto.WorkspaceRequest;
import com.mittyboard.dto.WorkspaceResponse;
import com.mittyboard.service.WorkspacesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspacesService workspacesService;

    @PostMapping
    public ResponseEntity<WorkspaceResponse> createWorkspace(
            @RequestBody WorkspaceRequest request
    ) {
        WorkspaceResponse response = workspacesService.createWorkspace(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceResponse>> getUserWorkspaces() {
        List<WorkspaceResponse> responses = workspacesService.getUserWorkSpaces();
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkspaceResponse> updateWorkspace(
            @PathVariable Long id,
            @RequestBody WorkspaceRequest request
    ) {
        WorkspaceResponse response = workspacesService.updateWorkspace(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkspace(@PathVariable Long id) {
        workspacesService.deleteWorkspace(id);
        return ResponseEntity.noContent().build();
    }
}