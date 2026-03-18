package com.ayush.academicerp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.ayush.academicerp.entity.Student;
import com.ayush.academicerp.projection.StudentProjection;
import com.ayush.academicerp.dto.StudentBasicDTO;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByDepartmentId(Long departmentId);
    List<Student> findBySemester(Integer semester);
    
    boolean existsByRollNo(String rollNo);
    
    @Query(value = "SELECT s.* FROM students s LEFT JOIN departments d ON d.id = s.department_id", nativeQuery = true)
    List<Student> findAllStudentsBasic();
    
    @Query("SELECT s.id as id, s.name as name, s.rollNo as rollNo, s.semester as semester, s.examEligible as examEligible, s.department.id as departmentId FROM Student s")
    List<StudentProjection> findAllStudentProjections();
    
    @Query("SELECT s.id as id, s.name as name, s.rollNo as rollNo, s.semester as semester, s.examEligible as examEligible, s.department.id as departmentId FROM Student s WHERE s.department.id = :departmentId")
    List<StudentProjection> findStudentProjectionsByDepartmentId(Long departmentId);
    
    @Query(value = "SELECT s.* FROM students s WHERE s.department_id = :departmentId", nativeQuery = true)
    List<Student> findStudentsByDepartmentIdNative(Long departmentId);
    
    @Query("SELECT new com.ayush.academicerp.dto.StudentBasicDTO(s.id, s.name, s.rollNo, s.semester, s.department.id, s.examEligible) FROM Student s WHERE s.department.id = :departmentId")
    List<StudentBasicDTO> findStudentDTOsByDepartmentId(Long departmentId);
}

