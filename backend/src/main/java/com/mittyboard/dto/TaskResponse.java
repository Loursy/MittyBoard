package com.mittyboard.dto;

import com.mittyboard.enums.Priority;
import com.mittyboard.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private Long columnId;
    private Integer position;
    private Priority priority;
    private TaskStatus status;
    private LocalDateTime createdAt;
}