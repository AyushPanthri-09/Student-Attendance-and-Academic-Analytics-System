package com.ayush.academicerp.service;

import com.ayush.academicerp.entity.Attendance;
import com.ayush.academicerp.entity.Attendance.AttendanceStatus;
import com.ayush.academicerp.entity.Student;
import com.ayush.academicerp.entity.Department;
import com.ayush.academicerp.dto.EligibilityReportDto;
import com.ayush.academicerp.entity.Subject;
import com.ayush.academicerp.repository.AttendanceRepository;
import com.ayush.academicerp.repository.DepartmentRepository;
import com.ayush.academicerp.repository.StudentRepository;
import com.ayush.academicerp.repository.SubjectRepository;
import com.ayush.academicerp.repository.StudentSubjectEnrollmentRepository;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import lombok.extern.slf4j.Slf4j;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@SuppressWarnings("null")
@Slf4j
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final DepartmentRepository departmentRepository;
    private final StudentSubjectEnrollmentRepository enrollmentRepository;

    public Attendance markAttendance(Long studentId, Long subjectId, LocalDate date, AttendanceStatus status, String remarks) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        // Verify enrollment: student must be enrolled in subject (or be allowed via admin override)
        boolean enrolled = enrollmentRepository.existsByStudentIdAndSubjectId(studentId, subjectId);
        if (!enrolled) {
            throw new IllegalArgumentException("Student " + student.getRollNo() + " is not enrolled in subject " + subject.getName());
        }

        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setSubject(subject);
        attendance.setDate(date != null ? date : LocalDate.now());
        attendance.setStatus(status);
        attendance.setRemarks(remarks);

        return attendanceRepository.save(attendance);
    }

    public List<Attendance> markBulkAttendance(List<Attendance> attendances) {
        return attendanceRepository.saveAll(attendances);
    }

    public Map<String, Object> getAttendancePercentage(Long studentId, Long subjectId) {
        Long total = attendanceRepository.countTotalClasses(subjectId);
        Long present = attendanceRepository.countPresentClasses(studentId, subjectId);

        double percentage = total != 0 ? ((double) present / total) * 100 : 0;

        Map<String, Object> result = new HashMap<>();
        result.put("studentId", studentId);
        result.put("subjectId", subjectId);
        result.put("presentClasses", present);
        result.put("totalClasses", total);
        result.put("attendancePercentage", percentage);

        return result;
    }

    public List<Map<String, Object>> getBulkAttendanceData(Long departmentId, Long courseId, Integer semester) {
        List<Attendance> allAttendance = attendanceRepository.findAll();

        return allAttendance.stream()
                .filter(a -> a.getStudent() != null && a.getSubject() != null)
                .filter(a -> {
                    if (departmentId != null && a.getStudent().getDepartment() != null) {
                        if (!departmentId.equals(a.getStudent().getDepartment().getId())) {
                            return false;
                        }
                    }
                    if (courseId != null && a.getStudent().getCourse() != null) {
                        if (!courseId.equals(a.getStudent().getCourse().getId())) {
                            return false;
                        }
                    }
                    if (semester != null && a.getStudent().getSemester() != null) {
                        return semester.equals(a.getStudent().getSemester());
                    }
                    return true;
                })
                .collect(Collectors.groupingBy(a -> a.getStudent().getId() + "-" + a.getSubject().getId()))
                .values().stream()
                .map(attList -> {
                    Attendance sample = attList.get(0);
                    long total = attList.size();
                    long present = attList.stream().filter(a -> AttendanceStatus.PRESENT.equals(a.getStatus())).count();
                    double percentage = total == 0 ? 0.0 : ((double) present / total) * 100;

                    Map<String, Object> row = new HashMap<>();
                    row.put("studentId", sample.getStudent().getId());
                    row.put("studentName", sample.getStudent().getName());
                    row.put("studentRollNo", sample.getStudent().getRollNo());
                    row.put("department", sample.getStudent().getDepartment() != null ? sample.getStudent().getDepartment().getName() : null);
                    row.put("course", sample.getStudent().getCourse() != null ? sample.getStudent().getCourse().getName() : null);
                    row.put("semester", sample.getStudent().getSemester());
                    row.put("subjectId", sample.getSubject().getId());
                    row.put("subjectName", sample.getSubject().getName());
                    row.put("attendancePercentage", percentage);

                    return row;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> predictAttendance(Long studentId, Integer futureClassesAttended) {
        List<Attendance> attendances = attendanceRepository.findByStudentId(studentId);
        long currentPresent = attendances.stream()
                .filter(a -> AttendanceStatus.PRESENT.equals(a.getStatus()))
                .count();
        long currentTotal = attendances.size();

        double currentPercentage = currentTotal == 0 ? 0.0 : ((double) currentPresent / currentTotal) * 100;
        long predictedPresent = currentPresent + (futureClassesAttended != null ? futureClassesAttended : 0);
        long predictedTotal = currentTotal + (futureClassesAttended != null ? futureClassesAttended : 0);
        double predictedPercentage = predictedTotal == 0 ? 0.0 : ((double) predictedPresent / predictedTotal) * 100;
        boolean examEligible = predictedPercentage >= 75.0;

        Map<String, Object> result = new HashMap<>();
        result.put("currentAttendance", currentPercentage);
        result.put("predictedPercentage", predictedPercentage);
        result.put("examEligible", examEligible);
        result.put("futureClassesAttended", futureClassesAttended);
        return result;
    }

    public List<Attendance> getStudentAttendance(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<Attendance> getSubjectAttendance(Long subjectId) {
        return attendanceRepository.findBySubjectId(subjectId);
    }

    public List<Student> getStudentsForSubject(Long subjectId) {
        // Fetch enrollments and map to students
        List<com.ayush.academicerp.entity.StudentSubjectEnrollment> enrollments = enrollmentRepository.findBySubjectId(subjectId);
        return enrollments.stream()
                .filter(e -> e.getIsActive() != null ? e.getIsActive() : true)
                .map(e -> e.getStudent())
                .collect(Collectors.toList());
    }

    public double getStudentAttendancePercentage(Long studentId) {
        List<Attendance> attendances = attendanceRepository.findByStudentId(studentId);
        if (attendances.isEmpty()) return 0.0;

        long presentCount = attendances.stream()
                .filter(a -> AttendanceStatus.PRESENT.equals(a.getStatus()))
                .count();

        return ((double) presentCount / attendances.size()) * 100;
    }

    public double getSubjectAttendancePercentage(Long subjectId) {
        List<Attendance> attendances = attendanceRepository.findBySubjectId(subjectId);
        if (attendances.isEmpty()) return 0.0;

        long presentCount = attendances.stream()
                .filter(a -> AttendanceStatus.PRESENT.equals(a.getStatus()))
                .count();

        return ((double) presentCount / attendances.size()) * 100;
    }

    public List<Attendance> getAttendanceByDateRange(LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findAll().stream()
                .filter(a -> !a.getDate().isBefore(startDate) && !a.getDate().isAfter(endDate))
                .collect(Collectors.toList());
    }

    public Map<String, Long> getAttendanceStatusCounts(Long subjectId) {
        List<Attendance> attendances = attendanceRepository.findBySubjectId(subjectId);
        return attendances.stream()
                .collect(Collectors.groupingBy(a -> a.getStatus().toString(), Collectors.counting()));
    }

    public Attendance updateAttendance(Long attendanceId, AttendanceStatus status, String remarks) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));
        
        attendance.setStatus(status);
        attendance.setRemarks(remarks);
        
        return attendanceRepository.save(attendance);
    }

    public void deleteAttendance(Long attendanceId) {
        if (!attendanceRepository.existsById(attendanceId)) {
            throw new RuntimeException("Attendance record not found");
        }
        attendanceRepository.deleteById(attendanceId);
    }

    public List<EligibilityReportDto> generateEligibilityReport(Long departmentId, Integer semesterTotal, Integer semester, double threshold, boolean perSubject) {
        log.info("Generating eligibility report for department {}, semester {}, threshold {}", departmentId, semester, threshold);
        
        List<EligibilityReportDto> report = new ArrayList<>();
        
        try {
            // Simple approach: Get all students and calculate basic eligibility
            List<Student> allStudents = studentRepository.findAll();
            
            // Filter by department if specified
            if (departmentId != null) {
                allStudents = allStudents.stream()
                        .filter(s -> s.getDepartment() != null && s.getDepartment().getId().equals(departmentId))
                        .collect(Collectors.toList());
            }
            
            // Filter by semester if specified
            if (semester != null) {
                allStudents = allStudents.stream()
                        .filter(s -> semester.equals(s.getSemester()))
                        .collect(Collectors.toList());
            }
            
            log.info("Found {} students matching criteria", allStudents.size());
            
            for (Student student : allStudents) {
                try {
                    // Get attendance for this student
                    Double attendancePercentage = attendanceRepository.findStudentAttendanceStats(student.getId());
                    
                    if (attendancePercentage == null) {
                        attendancePercentage = 0.0;
                    }
                    
                    // Calculate eligibility
                    String status = attendancePercentage >= threshold ? "ELIGIBLE" : "NOT ELIGIBLE";
                    int requiredClasses = (int) Math.ceil((threshold / 100.0) * semesterTotal);
                    int presentClasses = (int) Math.ceil((attendancePercentage / 100.0) * semesterTotal);
                    int remainingClasses = Math.max(0, requiredClasses - presentClasses);
                    
                    // Create DTO
                    EligibilityReportDto dto = new EligibilityReportDto(
                        student.getId(),
                        student.getRollNo(),
                        student.getName(),
                        "N/A", // Course - simplify for now
                        student.getDepartment() != null ? student.getDepartment().getName() : "Unknown",
                        attendancePercentage,
                        requiredClasses,
                        remainingClasses,
                        status
                    );
                    
                    report.add(dto);
                    
                } catch (Exception e) {
                    log.warn("Error processing student {}: {}", student.getId(), e.getMessage());
                    // Add a basic entry for this student
                    EligibilityReportDto dto = new EligibilityReportDto(
                        student.getId(),
                        student.getRollNo(),
                        student.getName(),
                        "N/A",
                        student.getDepartment() != null ? student.getDepartment().getName() : "Unknown",
                        0.0,
                        0,
                        0,
                        "ERROR"
                    );
                    report.add(dto);
                }
            }
            
        } catch (Exception e) {
            log.error("Error generating eligibility report", e);
            // Return empty list rather than failing
            return new ArrayList<>();
        }
        
        return report;
    }

    public byte[] generateEligibilityReportPdf(Long departmentId, Integer semesterTotal, Integer semester, double threshold, boolean perSubject) {
        List<EligibilityReportDto> report = generateEligibilityReport(departmentId, semesterTotal, semester, threshold, perSubject);

        // Calculate summary statistics
        long eligibleCount = report.stream().filter(r -> "ELIGIBLE".equals(r.getStatus())).count();
        long notEligibleCount = report.size() - eligibleCount;
        double eligibilityRate = report.size() > 0 ? (eligibleCount * 100.0 / report.size()) : 0.0;
        
        // Get department name
        Department department = departmentRepository.findById(departmentId).orElse(null);
        String departmentName = department != null ? department.getName() : "Unknown Department";

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 28, 28, 34, 34);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Font.BOLD, new BaseColor(15, 23, 42));
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, Font.BOLD, new BaseColor(51, 65, 85));
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Font.BOLD, BaseColor.WHITE);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, new BaseColor(30, 41, 59));
            Font summaryNumberFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Font.BOLD, new BaseColor(15, 23, 42));
            Font summaryLabelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.BOLD, new BaseColor(71, 85, 105));
            Font greenFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD);
            greenFont.setColor(BaseColor.GREEN.darker());
            Font warningFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD);
            warningFont.setColor(new BaseColor(180, 83, 9));

            // Title
            Paragraph title = new Paragraph("Attendance Eligibility Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(15);
            document.add(title);

            Paragraph subtitle = new Paragraph("Professional Academic Compliance Snapshot", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(14);
            document.add(subtitle);

            // Report metadata
            Paragraph metadata = new Paragraph();
            metadata.add(new Chunk("Department: ", boldFont));
            metadata.add(new Chunk(departmentName + " (ID: " + departmentId + ")\n", normalFont));
            metadata.add(new Chunk("Semester: ", boldFont));
            metadata.add(new Chunk(semester + "\n", normalFont));
            metadata.add(new Chunk("Attendance Threshold: ", boldFont));
            metadata.add(new Chunk(threshold + "%\n", normalFont));
            metadata.add(new Chunk("Total Classes Required: ", boldFont));
            metadata.add(new Chunk(semesterTotal + "\n", normalFont));
            metadata.add(new Chunk("Generated on: ", boldFont));
            metadata.add(new Chunk(java.time.LocalDate.now().toString(), normalFont));
            metadata.setSpacingAfter(15);
            document.add(metadata);

            // Summary Statistics Box
            PdfPTable summaryTable = new PdfPTable(4);
            summaryTable.setWidthPercentage(100);
            summaryTable.setSpacingBefore(10);
            summaryTable.setSpacingAfter(20);
            summaryTable.setWidths(new float[] {1.2f, 1f, 1f, 1f});

            // Total Students
            PdfPCell totalCell = new PdfPCell();
            totalCell.setBackgroundColor(new BaseColor(241, 245, 249));
            totalCell.addElement(new Paragraph("Total Students", summaryLabelFont));
            totalCell.addElement(new Paragraph(String.valueOf(report.size()), summaryNumberFont));
            totalCell.setPadding(10);
            totalCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            summaryTable.addCell(totalCell);

            // Eligible Students
            PdfPCell eligibleCell = new PdfPCell();
            eligibleCell.setBackgroundColor(new BaseColor(220, 252, 231));
            eligibleCell.addElement(new Paragraph("Eligible", summaryLabelFont));
            eligibleCell.addElement(new Paragraph(String.valueOf(eligibleCount), summaryNumberFont));
            eligibleCell.addElement(new Paragraph(String.format("%.1f%%", eligibilityRate), normalFont));
            eligibleCell.setPadding(10);
            eligibleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            summaryTable.addCell(eligibleCell);

            // Not Eligible Students
            PdfPCell notEligibleCell = new PdfPCell();
            notEligibleCell.setBackgroundColor(new BaseColor(254, 243, 199));
            notEligibleCell.addElement(new Paragraph("Needs Action", summaryLabelFont));
            notEligibleCell.addElement(new Paragraph(String.valueOf(notEligibleCount), summaryNumberFont));
            notEligibleCell.addElement(new Paragraph(String.format("%.1f%%", 100.0 - eligibilityRate), normalFont));
            notEligibleCell.setPadding(10);
            notEligibleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            summaryTable.addCell(notEligibleCell);

            // Eligibility Rate
            PdfPCell rateCell = new PdfPCell();
            rateCell.setBackgroundColor(new BaseColor(219, 234, 254));
            rateCell.addElement(new Paragraph("Eligibility Rate", summaryLabelFont));
            rateCell.addElement(new Paragraph(String.format("%.1f%%", eligibilityRate), summaryNumberFont));
            rateCell.setPadding(10);
            rateCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            summaryTable.addCell(rateCell);

            document.add(summaryTable);

            // Student details table
            if (!report.isEmpty()) {
                Paragraph tableTitle = new Paragraph("Student Details", subtitleFont);
                tableTitle.setSpacingBefore(10);
                tableTitle.setSpacingAfter(5);
                document.add(tableTitle);

                PdfPTable table = new PdfPTable(8);
                table.setWidthPercentage(100);
                table.setSpacingBefore(5);
                table.setWidths(new float[] {1.1f, 1.8f, 1.3f, 1.4f, 1f, 0.9f, 0.9f, 1f});

                String[] headers = {"Roll No", "Name", "Course", "Department", "Attendance %", "Required", "Remaining", "Status"};
                for (String header : headers) {
                    PdfPCell cell = new PdfPCell(new Paragraph(header, headerFont));
                    cell.setBackgroundColor(new BaseColor(51, 65, 85));
                    cell.setPaddingTop(8);
                    cell.setPaddingBottom(8);
                    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    table.addCell(cell);
                }

                int rowIndex = 0;
                for (EligibilityReportDto item : report) {
                    BaseColor rowBg = rowIndex % 2 == 0 ? BaseColor.WHITE : new BaseColor(248, 250, 252);
                    rowIndex++;

                    PdfPCell rollCell = new PdfPCell(new Paragraph(item.getRollNo(), normalFont));
                    rollCell.setBackgroundColor(rowBg);
                    rollCell.setPadding(7);
                    table.addCell(rollCell);

                    PdfPCell nameCell = new PdfPCell(new Paragraph(item.getName(), normalFont));
                    nameCell.setBackgroundColor(rowBg);
                    nameCell.setPadding(7);
                    table.addCell(nameCell);

                    PdfPCell courseCell = new PdfPCell(new Paragraph(item.getCourse(), normalFont));
                    courseCell.setBackgroundColor(rowBg);
                    courseCell.setPadding(7);
                    table.addCell(courseCell);

                    PdfPCell deptCell = new PdfPCell(new Paragraph(item.getDepartment(), normalFont));
                    deptCell.setBackgroundColor(rowBg);
                    deptCell.setPadding(7);
                    table.addCell(deptCell);
                    
                    PdfPCell attendanceCell = new PdfPCell(new Paragraph(String.format("%.1f%%", item.getAttendancePercentage()), normalFont));
                    attendanceCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    attendanceCell.setBackgroundColor(rowBg);
                    attendanceCell.setPadding(7);
                    table.addCell(attendanceCell);
                    
                    PdfPCell requiredCell = new PdfPCell(new Paragraph(String.valueOf(item.getRequiredClasses()), normalFont));
                    requiredCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    requiredCell.setBackgroundColor(rowBg);
                    requiredCell.setPadding(7);
                    table.addCell(requiredCell);
                    
                    PdfPCell remainingCell = new PdfPCell(new Paragraph(String.valueOf(item.getRemainingClasses()), normalFont));
                    remainingCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    remainingCell.setBackgroundColor(rowBg);
                    remainingCell.setPadding(7);
                    table.addCell(remainingCell);
                    
                    PdfPCell statusCell = new PdfPCell(new Paragraph(item.getStatus(), 
                        "ELIGIBLE".equals(item.getStatus()) ? greenFont : warningFont));
                    statusCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    statusCell.setBackgroundColor("ELIGIBLE".equals(item.getStatus()) ? new BaseColor(220, 252, 231) : new BaseColor(254, 243, 199));
                    statusCell.setPadding(7);
                    table.addCell(statusCell);
                }

                document.add(table);
            }

            // Footer
            Paragraph footer = new Paragraph("Generated by Academic ERP System • Eligibility Audit Engine", normalFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(20);
            document.add(footer);

            document.close();

            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }
}
