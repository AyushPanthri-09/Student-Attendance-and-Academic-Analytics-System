package com.ayush.academicerp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ayush.academicerp.entity.Marks;

public interface MarksRepository extends JpaRepository<Marks, Long> {}
