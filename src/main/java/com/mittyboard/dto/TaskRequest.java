package com.mittyboard.dto;

import com.mittyboard.enums.Priority;
import com.mittyboard.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskRequest {
    private String title;
    private String description;
    private Long columnId;
    private Integer position;
    private Priority priority;
    private TaskStatus status;  // Ex: TODO, IN_PROGRESS, DONE
}