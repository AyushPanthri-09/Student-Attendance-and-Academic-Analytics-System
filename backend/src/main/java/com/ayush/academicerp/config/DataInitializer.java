package com.ayush.academicerp.config;

import com.ayush.academicerp.entity.*;
import com.ayush.academicerp.repository.AttendanceRepository;
import com.ayush.academicerp.repository.CourseRepository;
import com.ayush.academicerp.repository.DepartmentRepository;
import com.ayush.academicerp.repository.StudentRepository;
import com.ayush.academicerp.repository.StudentSubjectEnrollmentRepository;
import com.ayush.academicerp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final AttendanceRepository attendanceRepository;
    private final StudentSubjectEnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        long attendanceCount = attendanceRepository.count();
        long studentCount = studentRepository.count();
        long departmentCount = departmentRepository.count();
        long enrollmentCount = enrollmentRepository.count();
        long courseCount = courseRepository.count();
        
        log.info("Database counts - Attendance: {}, Students: {}, Departments: {}, Enrollments: {}, Courses: {}", attendanceCount, studentCount, departmentCount, enrollmentCount, courseCount);
        
        if (departmentCount == 0) {
            log.info("Initializing sample data...");
            initializeSampleData();
            log.info("Sample data initialization completed!");
        } else if (attendanceCount == 0 && studentCount > 0) {
            log.info("Generating attendance data for existing students...");
            generateAttendanceForExistingStudents();
            log.info("Attendance data generation completed! Created {} attendance records", attendanceRepository.count());
        } else {
            log.info("No data initialization needed - data already exists");
        }
    }

    private void initializeSampleData() {
        // Create departments
        Department cseDept = createDepartment("Computer Science Engineering");
        Department eceDept = createDepartment("Electronics and Communication Engineering");
        Department meDept = createDepartment("Mechanical Engineering");
        Department ceDept = createDepartment("Civil Engineering");

        // Create courses
        Course cseCourse = createCourse("B.Tech CSE", "4 Years", cseDept);
        Course eceCourse = createCourse("B.Tech ECE", "4 Years", eceDept);
        Course meCourse = createCourse("B.Tech ME", "4 Years", meDept);
        Course ceCourse = createCourse("B.Tech CE", "4 Years", ceDept);

        // Create subjects
        Subject dbms = createSubject("Database Management Systems", "CS201", cseDept, 3);
        Subject ds = createSubject("Data Structures", "CS202", cseDept, 3);
        Subject os = createSubject("Operating Systems", "CS301", cseDept, 4);
        Subject cn = createSubject("Computer Networks", "CS302", cseDept, 4);
        
        Subject edc = createSubject("Electronic Devices and Circuits", "EC201", eceDept, 3);
        Subject dc = createSubject("Digital Communication", "EC301", eceDept, 4);
        
        Subject tom = createSubject("Theory of Machines", "ME201", meDept, 3);
        Subject fm = createSubject("Fluid Mechanics", "ME301", meDept, 4);
        
        Subject sm = createSubject("Structural Mechanics", "CE201", ceDept, 3);

        // Create students
        Student[] cseStudents = createStudentsForDepartment(cseDept, 40, 3, 4, cseCourse);
        Student[] eceStudents = createStudentsForDepartment(eceDept, 30, 3, 4, eceCourse);
        Student[] meStudents = createStudentsForDepartment(meDept, 15, 3, 4, meCourse);
        Student[] ceStudents = createStudentsForDepartment(ceDept, 15, 3, 4, ceCourse);

        // Create enrollments
        createEnrollments(cseStudents, new Subject[]{dbms, ds, os, cn});
        createEnrollments(eceStudents, new Subject[]{edc, dc});
        createEnrollments(meStudents, new Subject[]{tom, fm});
        createEnrollments(ceStudents, new Subject[]{sm});

        // Generate attendance
        generateAttendanceData(cseStudents, new Subject[]{dbms, ds, os, cn});
        generateAttendanceData(eceStudents, new Subject[]{edc, dc});
        generateAttendanceData(meStudents, new Subject[]{tom, fm});
        generateAttendanceData(ceStudents, new Subject[]{sm});
        
        log.info("Created {} departments, {} subjects, {} students, {} enrollments, {} attendance records", 
                departmentRepository.count(), 
                subjectRepository.count(), 
                studentRepository.count(),
                enrollmentRepository.count(),
                attendanceRepository.count());
    }

    private void generateAttendanceForExistingStudents() {
        List<Student> allStudents = studentRepository.findAll();
        List<Subject> allSubjects = subjectRepository.findAll();
        
        for (Student student : allStudents) {
            Department dept = student.getDepartment();
            List<Subject> deptSubjects = allSubjects.stream()
                    .filter(s -> s.getDepartment() != null && s.getDepartment().getId().equals(dept.getId()))
                    .collect(Collectors.toList());
            
            for (Subject subject : deptSubjects) {
                if (!enrollmentRepository.existsByStudentIdAndSubjectId(student.getId(), subject.getId())) {
                    StudentSubjectEnrollment enrollment = new StudentSubjectEnrollment(student, subject);
                    enrollmentRepository.save(enrollment);
                }
                generateAttendanceForStudentSubject(student, subject);
            }
        }
    }
    
    private void generateAttendanceForStudentSubject(Student student, Subject subject) {
        LocalDate startDate = LocalDate.now().minusWeeks(4);
        LocalDate endDate = LocalDate.now();
        LocalDate currentDate = startDate;
        
        while (!currentDate.isAfter(endDate)) {
            if (shouldHaveClass(currentDate)) {
                Attendance.AttendanceStatus status = generateAttendanceStatus(student, subject);
                
                Attendance attendance = new Attendance();
                attendance.setStudent(student);
                attendance.setSubject(subject);
                attendance.setDate(currentDate);
                attendance.setStatus(status);
                
                attendanceRepository.save(attendance);
            }
            currentDate = currentDate.plusDays(1);
        }
    }

    // Helper methods (createDepartment, createCourse, etc. - same as in .bak file)
    private Department createDepartment(String name) {
        Department dept = Department.builder()
                .name(name)
                .build();
        return departmentRepository.save(dept);
    }

    private Course createCourse(String name, String duration, Department department) {
        Course course = Course.builder()
                .name(name)
                .duration(duration)
                .department(department)
                .build();
        return courseRepository.save(course);
    }

    private Subject createSubject(String name, String code, Department department, int semester) {
        Subject subject = Subject.builder()
                .name(name)
                .code(code)
                .department(department)
                .semester(semester)
                .build();
        return subjectRepository.save(subject);
    }

    private Student[] createStudentsForDepartment(Department department, int count, int minSemester, int maxSemester, Course course) {
        Student[] students = new Student[count];
        for (int i = 0; i < count; i++) {
            Student student = Student.builder()
                    .rollNo(generateRollNo(department.getName(), i + 1))
                    .name(generateStudentName(i + 1))
                    .department(department)
                    .course(course)
                    .semester(minSemester + random.nextInt(maxSemester - minSemester + 1))
                    .build();
            students[i] = studentRepository.save(student);
        }
        return students;
    }

    private String generateRollNo(String departmentName, int number) {
        String prefix = departmentName.replaceAll("[^A-Z]", "").substring(0, 2).toUpperCase();
        return String.format("%s%04d", prefix, number);
    }

    private String generateStudentName(int number) {
        String[] firstNames = {"Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Rohit", "Kavita", "Suresh", "Meena", "Deepak", "Pooja"};
        String[] lastNames = {"Kumar", "Sharma", "Verma", "Singh", "Gupta", "Agarwal", "Jain", "Reddy", "Patel", "Yadav"};
        
        return firstNames[number % firstNames.length] + " " + lastNames[(number / firstNames.length) % lastNames.length];
    }

    private void generateAttendanceData(Student[] students, Subject[] subjects) {
        LocalDate startDate = LocalDate.now().minusMonths(2);
        LocalDate endDate = LocalDate.now();
        
        for (Student student : students) {
            for (Subject subject : subjects) {
                LocalDate currentDate = startDate;
                while (!currentDate.isAfter(endDate)) {
                    if (shouldHaveClass(currentDate)) {
                        Attendance.AttendanceStatus status = generateAttendanceStatus(student, subject);
                        
                        Attendance attendance = new Attendance();
                        attendance.setStudent(student);
                        attendance.setSubject(subject);
                        attendance.setDate(currentDate);
                        attendance.setStatus(status);
                        
                        attendanceRepository.save(attendance);
                    }
                    currentDate = currentDate.plusDays(1);
                }
            }
        }
    }

    private boolean shouldHaveClass(LocalDate date) {
        int dayOfWeek = date.getDayOfWeek().getValue();
        if (dayOfWeek >= 6) return false;
        return random.nextDouble() < 0.5;
    }

    private Attendance.AttendanceStatus generateAttendanceStatus(Student student, Subject subject) {
        double baseProbability = 0.75;
        baseProbability += (random.nextGaussian() * 0.15);
        baseProbability = Math.max(0.4, Math.min(1.0, baseProbability));
        
        if (random.nextDouble() < baseProbability) {
            return Attendance.AttendanceStatus.PRESENT;
        } else if (random.nextDouble() < 0.15) {
            return Attendance.AttendanceStatus.LATE;
        } else {
            return Attendance.AttendanceStatus.ABSENT;
        }
    }
    
    private void createEnrollments(Student[] students, Subject[] subjects) {
        for (Student student : students) {
            for (Subject subject : subjects) {
                if (student.getSemester() >= subject.getSemester()) {
                    StudentSubjectEnrollment enrollment = new StudentSubjectEnrollment();
                    enrollment.setStudent(student);
                    enrollment.setSubject(subject);
                    enrollment.setIsActive(true);
                    enrollmentRepository.save(enrollment);
                }
            }
        }
    }
}
