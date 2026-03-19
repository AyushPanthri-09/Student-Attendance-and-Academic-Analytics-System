package com.ayush.academicerp.repository;

import com.ayush.academicerp.entity.Subject;
import com.ayush.academicerp.projection.SubjectProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    
    List<Subject> findByDepartmentId(Long departmentId);
    
    @Query("SELECT s FROM Subject s WHERE s.department.id = :departmentId ORDER BY s.semester")
    List<Subject> findByDepartmentIdOrdered(Long departmentId);
    
    @Query("SELECT s FROM Subject s WHERE s.code = :code")
    Subject findByCode(String code);
    
    @Query("SELECT COUNT(s) FROM Subject s WHERE s.department.id = :departmentId")
    Long countByDepartmentId(Long departmentId);

    @Query("SELECT s.id as id, s.name as name, s.code as code, s.semester as semester, " +
           "d.name as departmentName FROM Subject s LEFT JOIN s.department d")
    List<SubjectProjection> findAllSubjectsProjection();

    List<Subject> findBySemester(Integer semester);
}
