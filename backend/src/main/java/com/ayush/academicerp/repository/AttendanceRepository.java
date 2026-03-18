package com.ayush.academicerp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.ayush.academicerp.entity.Attendance;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    // STUDENT ATTENDANCE
    @Query("SELECT a FROM Attendance a JOIN FETCH a.subject WHERE a.student.id = :studentId")
    List<Attendance> findByStudentId(Long studentId);

    // SUBJECT ATTENDANCE
    List<Attendance> findBySubjectId(Long subjectId);

    // DATE FILTER
    List<Attendance> findByDate(LocalDate date);

    // STUDENT + SUBJECT
    List<Attendance> findByStudentIdAndSubjectId(Long studentId, Long subjectId);

    // BULK FETCH FOR ANALYTICS
    List<Attendance> findByStudentIdInAndSubjectIdIn(List<Long> studentIds, List<Long> subjectIds);

    // STUDENT LIST
    List<Attendance> findByStudentIdIn(List<Long> studentIds);

    // SUBJECT LIST
    List<Attendance> findBySubjectIdIn(List<Long> subjectIds);

    // COUNT TOTAL CLASSES FOR SUBJECT
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.subject.id = :subjectId")
    Long countTotalClasses(Long subjectId);

    // COUNT PRESENT CLASSES FOR STUDENT
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.subject.id = :subjectId AND a.status='PRESENT'")
    Long countPresentClasses(Long studentId, Long subjectId);

    // LOW ATTENDANCE DETECTION
    @Query("SELECT a FROM Attendance a WHERE a.student.id = :studentId AND a.status='ABSENT'")
    List<Attendance> findStudentAbsences(Long studentId);

    // ANALYTICS QUERIES
    
    // Overall attendance statistics
    @Query("SELECT AVG(CASE WHEN a.status = 'PRESENT' THEN 100.0 ELSE 0.0 END) as avgAttendance, " +
           "COUNT(DISTINCT a.student.id) as studentCount " +
           "FROM Attendance a " +
           "WHERE EXISTS (SELECT 1 FROM StudentSubjectEnrollment sse " +
           "WHERE sse.student.id = a.student.id AND sse.subject.id = a.subject.id AND sse.isActive = true)")
    List<Object[]> findAttendanceStats();
    
    // Department attendance statistics
    @Query("SELECT AVG(CASE WHEN a.status = 'PRESENT' THEN 100.0 ELSE 0.0 END), " +
           "COUNT(DISTINCT a.student.id) " +
           "FROM Attendance a " +
           "WHERE a.student.department.id = :departmentId " +
           "AND EXISTS (SELECT 1 FROM StudentSubjectEnrollment sse " +
           "WHERE sse.student.id = a.student.id AND sse.subject.id = a.subject.id AND sse.isActive = true)")
    List<Object[]> findDepartmentAttendanceStats(Long departmentId);

    // Count distinct subjects that have attendance records for a given department
    @Query("SELECT COUNT(DISTINCT a.subject.id) " +
           "FROM Attendance a " +
           "WHERE a.student.department.id = :departmentId " +
           "AND EXISTS (SELECT 1 FROM StudentSubjectEnrollment sse " +
           "WHERE sse.student.id = a.student.id AND sse.subject.id = a.subject.id AND sse.isActive = true)")
    Long countDistinctSubjectsForDepartment(Long departmentId);
    
    // Subject attendance statistics
    @Query("SELECT AVG(CASE WHEN a.status = 'PRESENT' THEN 100.0 ELSE 0.0 END), " +
           "COUNT(a), " +
           "SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) " +
           "FROM Attendance a " +
           "WHERE a.subject.id = :subjectId " +
           "AND EXISTS (SELECT 1 FROM StudentSubjectEnrollment sse " +
           "WHERE sse.student.id = a.student.id AND sse.subject.id = a.subject.id AND sse.isActive = true)")
    List<Object[]> findSubjectAttendanceStats(Long subjectId);
    
    // Student attendance statistics
    @Query("SELECT AVG(CASE WHEN a.status = 'PRESENT' THEN 100.0 ELSE 0.0 END) " +
           "FROM Attendance a " +
           "WHERE a.student.id = :studentId " +
           "AND EXISTS (SELECT 1 FROM StudentSubjectEnrollment sse " +
           "WHERE sse.student.id = a.student.id AND sse.subject.id = a.subject.id AND sse.isActive = true)")
    Double findStudentAttendanceStats(Long studentId);
    
    // Student subject-wise attendance
    @Query("SELECT s.name, " +
           "AVG(CASE WHEN a.status = 'PRESENT' THEN 100.0 ELSE 0.0 END) " +
           "FROM Attendance a " +
           "JOIN a.subject s " +
           "WHERE a.student.id = :studentId " +
           "AND EXISTS (SELECT 1 FROM StudentSubjectEnrollment sse " +
           "WHERE sse.student.id = a.student.id AND sse.subject.id = a.subject.id AND sse.isActive = true) " +
           "GROUP BY s.id, s.name")
    List<Object[]> findStudentSubjectAttendance(Long studentId);
    
    // Overall attendance average
    @Query("SELECT AVG(CASE WHEN a.status = 'PRESENT' THEN 100.0 ELSE 0.0 END) " +
           "FROM Attendance a " +
           "WHERE EXISTS (SELECT 1 FROM StudentSubjectEnrollment sse " +
           "WHERE sse.student.id = a.student.id AND sse.subject.id = a.subject.id AND sse.isActive = true)")
    Double findOverallAttendanceAverage();
    
    // Count students below threshold
    @Query("SELECT COUNT(DISTINCT a.student.id) " +
           "FROM Attendance a " +
           "WHERE EXISTS (SELECT 1 FROM StudentSubjectEnrollment sse " +
           "WHERE sse.student.id = a.student.id AND sse.subject.id = a.subject.id AND sse.isActive = true) " +
           "AND a.student.id IN (" +
           "  SELECT a2.student.id FROM Attendance a2 " +
           "  WHERE EXISTS (SELECT 1 FROM StudentSubjectEnrollment sse2 " +
           "    WHERE sse2.student.id = a2.student.id AND sse2.subject.id = a2.subject.id AND sse2.isActive = true) " +
           "  GROUP BY a2.student.id " +
           "  HAVING AVG(CASE WHEN a2.status = 'PRESENT' THEN 100.0 ELSE 0.0 END) < :threshold" +
           ")")
    Long countStudentsBelowThreshold(Double threshold);
    
    // Weekly attendance statistics
    @Query("SELECT FUNCTION('WEEK', a.date) as week, " +
           "AVG(CASE WHEN a.status = 'PRESENT' THEN 100.0 ELSE 0.0 END) as attendance, " +
           "COUNT(a) as totalClasses, " +
           "SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) as presentCount " +
           "FROM Attendance a " +
           "WHERE a.date BETWEEN :startDate AND :endDate " +
           "AND EXISTS (SELECT 1 FROM StudentSubjectEnrollment sse " +
           "WHERE sse.student.id = a.student.id AND sse.subject.id = a.subject.id AND sse.isActive = true) " +
           "GROUP BY FUNCTION('WEEK', a.date) " +
           "ORDER BY FUNCTION('WEEK', a.date)")
    List<Object[]> findWeeklyAttendanceStats(LocalDate startDate, LocalDate endDate);

    // Advanced analytics methods
    
    // Find distinct students with attendance after a specific date
    @Query("SELECT DISTINCT a.student.id FROM Attendance a WHERE a.date > :date")
    List<Long> findDistinctStudentsByDateAfter(LocalDate date);
    
    // Count attendance by student after a specific date
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.date > :date")
    Long countByStudentIdAndDateAfter(Long studentId, LocalDate date);

}