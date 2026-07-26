package com.mittyboard.controller;

import com.mittyboard.dto.TaskRequest;
import com.mittyboard.dto.TaskResponse;
import com.mittyboard.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@RequestBody TaskRequest request) {
        TaskResponse response = taskService.createTask(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasks(@RequestParam Long columnId) {
        List<TaskResponse> responses = taskService.getTasksByColumn(columnId);
        return ResponseEntity.ok(responses);
    }
}