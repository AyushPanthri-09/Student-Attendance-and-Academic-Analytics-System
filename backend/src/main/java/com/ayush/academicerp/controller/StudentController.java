package com.ayush.academicerp.controller;

import com.ayush.academicerp.entity.Student;
import com.ayush.academicerp.entity.Department;
import com.ayush.academicerp.repository.DepartmentRepository;
import com.ayush.academicerp.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class StudentController {
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudent(@PathVariable Long id) {
        return studentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<Student>> getStudentsByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(studentRepository.findByDepartmentId(departmentId));
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> createStudent(@RequestBody Map<String, Object> data) {
        String name = data.get("name") != null ? data.get("name").toString().trim() : "";
        String rollNo = data.get("rollNo") != null ? data.get("rollNo").toString().trim() : "";
        Object semObj = data.get("semester");
        Object deptObj = data.get("departmentId");
        
        if (name.isBlank() || rollNo.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name and roll number are required"));
        }

        if (studentRepository.existsByRollNo(rollNo)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Roll number already exists"));
        }
        
        Student student = new Student();
        student.setName(name);
        student.setRollNo(rollNo);
        
        if (semObj instanceof Integer) {
            student.setSemester((Integer) semObj);
        } else if (semObj instanceof String) {
            student.setSemester(Integer.parseInt((String) semObj));
        } else {
            student.setSemester(1);
        }

        if (deptObj != null) {
            Long departmentId = Long.parseLong(deptObj.toString());
            Department department = departmentRepository.findById(departmentId).orElse(null);
            if (department == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Department not found"));
            }
            student.setDepartment(department);
        }
        
        return ResponseEntity.ok(studentRepository.save(student));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return studentRepository.findById(id)
                .map(student -> {
                    String name = data.get("name") != null ? data.get("name").toString().trim() : student.getName();
                    String rollNo = data.get("rollNo") != null ? data.get("rollNo").toString().trim() : student.getRollNo();
                    Object semObj = data.get("semester");
                    Object deptObj = data.get("departmentId");

                    if (name == null || name.isBlank() || rollNo == null || rollNo.isBlank()) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Name and roll number are required"));
                    }

                    if (!rollNo.equalsIgnoreCase(student.getRollNo()) && studentRepository.existsByRollNo(rollNo)) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Roll number already exists"));
                    }

                    student.setName(name);
                    student.setRollNo(rollNo);

                    if (semObj instanceof Number) {
                        student.setSemester(((Number) semObj).intValue());
                    } else if (semObj instanceof String && !((String) semObj).isBlank()) {
                        student.setSemester(Integer.parseInt((String) semObj));
                    }

                    if (deptObj != null && !deptObj.toString().isBlank()) {
                        Long departmentId = Long.parseLong(deptObj.toString());
                        Department department = departmentRepository.findById(departmentId).orElse(null);
                        if (department == null) {
                            return ResponseEntity.badRequest().body(Map.of("message", "Department not found"));
                        }
                        student.setDepartment(department);
                    }

                    return ResponseEntity.ok(studentRepository.save(student));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        if (!studentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        studentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
