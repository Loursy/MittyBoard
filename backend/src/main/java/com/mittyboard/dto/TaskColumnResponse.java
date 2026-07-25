package com.mittyboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskColumnResponse {
    private Long id;
    private String title;
    private Integer position;
    private Long boardId;
    private LocalDateTime createdAt;
}