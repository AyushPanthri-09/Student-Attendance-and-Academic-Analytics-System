package com.ayush.academicerp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ayush.academicerp.entity.Faculty;

public interface FacultyRepository extends JpaRepository<Faculty, Long> {}