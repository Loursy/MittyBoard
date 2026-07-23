package com.mittyboard.controller;

import com.mittyboard.dto.WorkspaceRequest;
import com.mittyboard.dto.WorkspaceResponse;
import com.mittyboard.entity.Workspace;
import com.mittyboard.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @PostMapping
    public ResponseEntity<WorkspaceResponse> createWorkspace(
            @RequestBody WorkspaceRequest request,
            @RequestParam Long userId) {

        WorkspaceResponse response = workspaceService.createWorkspace(request, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    public ResponseEntity<List<WorkspaceResponse>> getUserWorkspaces(@RequestParam Long userId) {

        List<WorkspaceResponse> responses = workspaceService.getUserWorkSpaces(userId);
        return ResponseEntity.ok(responses);
    }
}
