package com.ayush.academicerp.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.*;
import java.util.Date;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class SimpleController {

    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getStudents() {
        List<Map<String, Object>> students = new ArrayList<>();
        for (int i = 1; i <= 250; i++) {
            Map<String, Object> student = new HashMap<>();
            student.put("id", (long) i);
            student.put("rollNo", "CS" + String.format("%04d", i));
            student.put("name", "Student " + i);
            student.put("semester", 1 + (i % 8));
            student.put("examEligible", i % 5 != 0);
            students.add(student);
        }
        return ResponseEntity.ok(students);
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Map<String, Object>>> getDepartments() {
        List<Map<String, Object>> departments = new ArrayList<>();
        departments.add(Map.of("id", 1L, "name", "Computer Science Engineering"));
        departments.add(Map.of("id", 2L, "name", "Electronics and Communication Engineering"));
        departments.add(Map.of("id", 3L, "name", "Mechanical Engineering"));
        departments.add(Map.of("id", 4L, "name", "Civil Engineering"));
        return ResponseEntity.ok(departments);
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<Map<String, Object>>> getSubjects() {
        List<Map<String, Object>> subjects = new ArrayList<>();
        subjects.add(Map.of("id", 1L, "name", "Data Structures", "code", "CS101", "semester", 3, "departmentName", "Computer Science Engineering"));
        subjects.add(Map.of("id", 2L, "name", "Algorithms", "code", "CS102", "semester", 4, "departmentName", "Computer Science Engineering"));
        subjects.add(Map.of("id", 3L, "name", "Database Systems", "code", "CS103", "semester", 5, "departmentName", "Computer Science Engineering"));
        subjects.add(Map.of("id", 4L, "name", "Machine Learning", "code", "CS104", "semester", 6, "departmentName", "Computer Science Engineering"));
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("students", 250);
        stats.put("teachers", 0);
        stats.put("courses", 4);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/attendance/report/department/{departmentId}/{semesterTotal}")
    public ResponseEntity<List<Map<String, Object>>> getEligibilityReport(
            @PathVariable Long departmentId,
            @PathVariable Integer semesterTotal,
            @RequestParam(required = false) Integer semester,
            @RequestParam(defaultValue = "75") Double threshold,
            @RequestParam(required = false, defaultValue = "false") Boolean perSubject) {
        
        List<Map<String, Object>> report = new ArrayList<>();
        
        // Generate sample eligibility report
        for (int i = 1; i <= 50; i++) {
            Map<String, Object> student = new HashMap<>();
            student.put("studentId", (long) i);
            student.put("rollNo", "CS" + String.format("%04d", i));
            student.put("name", "Student " + i);
            student.put("course", "Computer Science");
            student.put("department", "Computer Science Engineering");
            
            double attendance = 60 + Math.random() * 40; // 60-100%
            String status = attendance >= threshold ? "ELIGIBLE" : "NOT ELIGIBLE";
            
            student.put("attendancePercentage", attendance);
            student.put("requiredClasses", (int) Math.ceil((threshold / 100.0) * semesterTotal));
            student.put("remainingClasses", Math.max(0, (int) Math.ceil((threshold / 100.0) * semesterTotal) - (int) Math.ceil((attendance / 100.0) * semesterTotal)));
            student.put("status", status);
            
            report.add(student);
        }
        
        return ResponseEntity.ok(report);
    }

    // ========== STUDENT CRUD ENDPOINTS ==========
    
    @GetMapping("/students/{id}")
    public ResponseEntity<Map<String, Object>> getStudent(@PathVariable Long id) {
        Map<String, Object> student = new HashMap<>();
        student.put("id", id);
        student.put("rollNo", "CS" + String.format("%04d", id));
        student.put("name", "Student " + id);
        student.put("semester", 1 + (id % 8));
        student.put("examEligible", id % 5 != 0);
        student.put("department", "Computer Science Engineering");
        student.put("email", "student" + id + "@college.edu");
        student.put("phone", "+91-9876543" + String.format("%02d", id % 100));
        return ResponseEntity.ok(student);
    }

    @PostMapping("/students")
    public ResponseEntity<Map<String, Object>> createStudent(@RequestBody Map<String, Object> student) {
        // Generate a new ID
        long newId = System.currentTimeMillis() % 10000;
        student.put("id", newId);
        student.put("examEligible", true);
        return ResponseEntity.ok(student);
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<Map<String, Object>> updateStudent(@PathVariable Long id, @RequestBody Map<String, Object> student) {
        student.put("id", id);
        return ResponseEntity.ok(student);
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/students/department/{departmentId}")
    public ResponseEntity<List<Map<String, Object>>> getStudentsByDepartment(@PathVariable Long departmentId) {
        List<Map<String, Object>> students = new ArrayList<>();
        String deptName = getDepartmentName(departmentId);
        
        for (int i = 1; i <= 62; i++) { // ~62 students per department
            Map<String, Object> student = new HashMap<>();
            student.put("id", (long) i);
            student.put("rollNo", getDeptCode(departmentId) + String.format("%04d", i));
            student.put("name", "Student " + i);
            student.put("semester", 1 + (i % 8));
            student.put("examEligible", i % 5 != 0);
            student.put("department", deptName);
            students.add(student);
        }
        return ResponseEntity.ok(students);
    }

    // ========== SUBJECT CRUD ENDPOINTS ==========
    
    @GetMapping("/subjects/{id}")
    public ResponseEntity<Map<String, Object>> getSubject(@PathVariable Long id) {
        Map<String, Object> subject = new HashMap<>();
        subject.put("id", id);
        subject.put("name", "Subject " + id);
        subject.put("code", "SUB" + String.format("%03d", id));
        subject.put("semester", 1 + (id % 8));
        subject.put("departmentName", "Computer Science Engineering");
        subject.put("credits", 4);
        subject.put("description", "Description for Subject " + id);
        return ResponseEntity.ok(subject);
    }

    @PostMapping("/subjects")
    public ResponseEntity<Map<String, Object>> createSubject(@RequestBody Map<String, Object> subject) {
        long newId = System.currentTimeMillis() % 10000;
        subject.put("id", newId);
        return ResponseEntity.ok(subject);
    }

    @PutMapping("/subjects/{id}")
    public ResponseEntity<Map<String, Object>> updateSubject(@PathVariable Long id, @RequestBody Map<String, Object> subject) {
        subject.put("id", id);
        return ResponseEntity.ok(subject);
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/subjects/department/{departmentId}")
    public ResponseEntity<List<Map<String, Object>>> getSubjectsByDepartment(@PathVariable Long departmentId) {
        List<Map<String, Object>> subjects = new ArrayList<>();
        String deptName = getDepartmentName(departmentId);
        String deptCode = getDeptCode(departmentId);
        
        for (int i = 1; i <= 12; i++) {
            Map<String, Object> subject = new HashMap<>();
            subject.put("id", (long) i);
            subject.put("name", deptCode + " Subject " + i);
            subject.put("code", deptCode + String.format("%03d", i));
            subject.put("semester", 1 + (i % 8));
            subject.put("departmentName", deptName);
            subject.put("credits", 4);
            subjects.add(subject);
        }
        return ResponseEntity.ok(subjects);
    }

    // ========== ATTENDANCE ENDPOINTS ==========
    
    @PostMapping("/attendance")
    public ResponseEntity<Map<String, Object>> markAttendance(@RequestBody Map<String, Object> attendanceData) {
        attendanceData.put("id", System.currentTimeMillis() % 10000);
        attendanceData.put("date", new Date().toString());
        return ResponseEntity.ok(attendanceData);
    }

    @GetMapping("/attendance/student/{studentId}")
    public ResponseEntity<List<Map<String, Object>>> getStudentAttendance(@PathVariable Long studentId) {
        List<Map<String, Object>> attendance = new ArrayList<>();
        
        for (int i = 1; i <= 30; i++) {
            Map<String, Object> record = new HashMap<>();
            record.put("id", (long) i);
            record.put("studentId", studentId);
            record.put("subjectId", (long) (1 + (i % 4)));
            record.put("date", "2024-03-" + String.format("%02d", i));
            record.put("present", Math.random() > 0.2);
            record.put("subjectName", "Subject " + (1 + (i % 4)));
            attendance.add(record);
        }
        return ResponseEntity.ok(attendance);
    }

    @GetMapping("/attendance/subject/{subjectId}")
    public ResponseEntity<List<Map<String, Object>>> getSubjectAttendance(@PathVariable Long subjectId) {
        List<Map<String, Object>> attendance = new ArrayList<>();
        
        for (int i = 1; i <= 62; i++) {
            Map<String, Object> record = new HashMap<>();
            record.put("id", (long) i);
            record.put("studentId", (long) i);
            record.put("subjectId", subjectId);
            record.put("studentName", "Student " + i);
            record.put("rollNo", "CS" + String.format("%04d", i));
            record.put("present", Math.random() > 0.15);
            record.put("totalClasses", 30);
            record.put("presentCount", (int) (Math.random() * 30));
            attendance.add(record);
        }
        return ResponseEntity.ok(attendance);
    }

    @GetMapping("/attendance/percentage/{studentId}/{subjectId}")
    public ResponseEntity<Map<String, Object>> getAttendancePercentage(@PathVariable Long studentId, @PathVariable Long subjectId) {
        Map<String, Object> percentage = new HashMap<>();
        percentage.put("studentId", studentId);
        percentage.put("subjectId", subjectId);
        percentage.put("percentage", 75 + Math.random() * 20);
        percentage.put("totalClasses", 30);
        percentage.put("presentCount", (int) (22 + Math.random() * 8));
        return ResponseEntity.ok(percentage);
    }

    @GetMapping("/attendance/student/{studentId}/percentage")
    public ResponseEntity<Map<String, Object>> getStudentAttendancePercentage(@PathVariable Long studentId) {
        Map<String, Object> percentage = new HashMap<>();
        percentage.put("studentId", studentId);
        percentage.put("overallPercentage", 75 + Math.random() * 20);
        percentage.put("totalClasses", 120);
        percentage.put("presentCount", (int) (90 + Math.random() * 30));
        return ResponseEntity.ok(percentage);
    }

    @GetMapping("/attendance/subject/{subjectId}/percentage")
    public ResponseEntity<Map<String, Object>> getSubjectAttendancePercentage(@PathVariable Long subjectId) {
        Map<String, Object> percentage = new HashMap<>();
        percentage.put("subjectId", subjectId);
        percentage.put("averagePercentage", 75 + Math.random() * 20);
        percentage.put("totalStudents", 62);
        percentage.put("averagePresent", (int) (46 + Math.random() * 16));
        return ResponseEntity.ok(percentage);
    }

    @PutMapping("/attendance/{attendanceId}")
    public ResponseEntity<Map<String, Object>> updateAttendance(@PathVariable Long attendanceId, @RequestBody Map<String, Object> attendanceData) {
        attendanceData.put("id", attendanceId);
        return ResponseEntity.ok(attendanceData);
    }

    @DeleteMapping("/attendance/{attendanceId}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long attendanceId) {
        return ResponseEntity.ok().build();
    }

    // PDF Report Download
    @GetMapping("/attendance/report/pdf/{departmentId}/{semesterTotal}/{semester}")
    public ResponseEntity<byte[]> downloadEligibilityReport(
            @PathVariable Long departmentId,
            @PathVariable Integer semesterTotal,
            @PathVariable Integer semester,
            @RequestParam(defaultValue = "75") double threshold,
            @RequestParam(defaultValue = "false") boolean perSubject) {
        
        // Generate a simple PDF report
        String reportContent = "ATTENDANCE ELIGIBILITY REPORT\n" +
                           "=================================\n\n" +
                           "Department: " + getDepartmentName(departmentId) + "\n" +
                           "Semester: " + semester + "\n" +
                           "Total Classes: " + semesterTotal + "\n" +
                           "Eligibility Threshold: " + threshold + "%\n\n" +
                           "Generated on: " + new Date() + "\n\n" +
                           "This is a sample PDF report.\n" +
                           "In a production environment, this would contain\n" +
                           "detailed student eligibility information.";
        
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=eligibility_report.pdf")
                .body(reportContent.getBytes());
    }

    // ========== UTILITY METHODS ==========
    
    private String getDepartmentName(Long departmentId) {
        switch (departmentId.intValue()) {
            case 1: return "Computer Science Engineering";
            case 2: return "Electronics and Communication Engineering";
            case 3: return "Mechanical Engineering";
            case 4: return "Civil Engineering";
            default: return "Unknown Department";
        }
    }
    
    private String getDeptCode(Long departmentId) {
        switch (departmentId.intValue()) {
            case 1: return "CS";
            case 2: return "EC";
            case 3: return "ME";
            case 4: return "CE";
            default: return "UN";
        }
    }
}
