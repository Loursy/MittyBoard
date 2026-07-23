package com.mittyboard.repository;

import com.mittyboard.entity.TaskColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskColumnRepository extends JpaRepository<TaskColumn, Long> {

    List<TaskColumn> findByBoardIdOrderByPositionAsc(Long boardId);
}
