package com.ayush.academicerp.repository;

import com.ayush.academicerp.entity.StudentSubjectEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentSubjectEnrollmentRepository extends JpaRepository<StudentSubjectEnrollment, Long> {
    
    List<StudentSubjectEnrollment> findByStudentId(Long studentId);
    
    List<StudentSubjectEnrollment> findBySubjectId(Long subjectId);
    
    Optional<StudentSubjectEnrollment> findByStudentIdAndSubjectId(Long studentId, Long subjectId);
    
    @Query("SELECT sse FROM StudentSubjectEnrollment sse WHERE sse.student.department.id = :departmentId")
    List<StudentSubjectEnrollment> findByDepartmentId(Long departmentId);
    
    @Query("SELECT COUNT(sse) FROM StudentSubjectEnrollment sse WHERE sse.subject.id = :subjectId AND sse.isActive = true")
    Long countBySubjectId(Long subjectId);
    
    @Query("SELECT COUNT(DISTINCT sse.student.id) FROM StudentSubjectEnrollment sse WHERE sse.subject.department.id = :departmentId AND sse.isActive = true")
    Long countStudentsByDepartmentId(Long departmentId);
    
    @Query("SELECT sse.subject.id FROM StudentSubjectEnrollment sse WHERE sse.student.id = :studentId AND sse.isActive = true")
    List<Long> findSubjectIdsByStudentId(Long studentId);
    
    boolean existsByStudentIdAndSubjectId(Long studentId, Long subjectId);
}
