package com.mittyboard.service;

import com.mittyboard.dto.TaskRequest;
import com.mittyboard.dto.TaskResponse;
import com.mittyboard.entity.Task;
import com.mittyboard.entity.TaskColumn;
import com.mittyboard.entity.User;
import com.mittyboard.repository.TaskColumnRepository;
import com.mittyboard.repository.TaskRepository;
import com.mittyboard.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskColumnRepository taskColumnRepository;
    private final CurrentUserService currentUserService;

    public TaskResponse createTask(TaskRequest request) {
        User currentUser = currentUserService.getAuthenticatedUser();

        TaskColumn column = taskColumnRepository.findById(request.getColumnId())
                .orElseThrow(() -> new RuntimeException("Kolon bulunamadı!"));

        if (!column.getBoard().getWorkspace().getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bu kolona görev ekleme yetkiniz yok!");
        }
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .column(column)
                .priority(request.getPriority())
                .status(request.getStatus())
                .position(request.getPosition())
                .build();

        Task savedTask = taskRepository.save(task);

        return mapToResponse(savedTask);
    }

    public List<TaskResponse> getTasksByColumn(Long columnId) {
        User currentUser = currentUserService.getAuthenticatedUser();

        TaskColumn column = taskColumnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Kolon bulunamadı!"));

        if (!column.getBoard().getWorkspace().getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bu kolonun görevlerini görme yetkiniz yok!");
        }

        List<Task> tasks = taskRepository.findByColumnIdOrderByPositionAsc(columnId);

        return tasks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .columnId(task.getColumn().getId())
                .priority(task.getPriority())
                .position(task.getPosition())
                .status(task.getStatus())
                .createdAt(task.getCreatedAt())
                .build();
    }
}