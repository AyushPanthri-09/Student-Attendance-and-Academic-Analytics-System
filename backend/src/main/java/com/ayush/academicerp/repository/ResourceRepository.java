package com.ayush.academicerp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ayush.academicerp.entity.Resource;

public interface ResourceRepository extends JpaRepository<Resource, Long> {}
