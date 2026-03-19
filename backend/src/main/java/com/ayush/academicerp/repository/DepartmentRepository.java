                 package com.ayush.academicerp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ayush.academicerp.entity.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    
    boolean existsByName(String name);

    java.util.Optional<Department> findByName(String name);
}