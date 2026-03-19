package com.ayush.academicerp.controller;

import com.ayush.academicerp.entity.*;
import com.ayush.academicerp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import com.itextpdf.text.Document;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.Rectangle;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.ByteArrayOutputStream;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ManagementController {

    private final DepartmentRepository departmentRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final AttendanceRepository attendanceRepository;

    // ========== DEPARTMENT ENDPOINTS ==========

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @PostMapping("/departments")
    public ResponseEntity<?> createDepartment(@RequestBody Map<String, Object> data) {
        String name = data.get("name") != null ? data.get("name").toString().trim() : "";
        String code = data.get("code") != null ? data.get("code").toString().trim() : null;

        if (name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Department name is required"));
        }

        if (departmentRepository.existsByName(name)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Department already exists"));
        }

        Department department = new Department();
        department.setName(name);
        if (code != null && !code.isBlank()) {
            department.setCode(code);
        }

        try {
            return ResponseEntity.ok(departmentRepository.save(department));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", "Department code already exists"));
        }
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<?> updateDepartment(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return departmentRepository.findById(id)
                .map(existing -> {
                    String name = data.get("name") != null ? data.get("name").toString().trim() : existing.getName();
                    String code = data.get("code") != null ? data.get("code").toString().trim() : existing.getCode();

                    if (name == null || name.isBlank()) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Department name is required"));
                    }

                    existing.setName(name);
                    existing.setCode(code == null || code.isBlank() ? null : code);

                    try {
                        return ResponseEntity.ok(departmentRepository.save(existing));
                    } catch (DataIntegrityViolationException ex) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Department name/code must be unique"));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id) {
        return departmentRepository.findById(id)
                .map(dept -> {
                    long studentsInDepartment = studentRepository.countByDepartmentId(id);
                    long subjectsInDepartment = subjectRepository.countByDepartmentId(id);

                    if (studentsInDepartment > 0 || subjectsInDepartment > 0) {
                        return ResponseEntity.badRequest().body(Map.of(
                                "message", "Cannot delete department with linked students/subjects",
                                "students", studentsInDepartment,
                                "subjects", subjectsInDepartment
                        ));
                    }

                    departmentRepository.delete(dept);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ========== ATTENDANCE ENDPOINTS ==========

    @PostMapping("/attendance")
    public ResponseEntity<Map<String, Object>> markAttendance(@RequestBody Map<String, Object> data) {
        return markSingleAttendance(data);
    }

    @PostMapping("/attendance/bulk")
    public ResponseEntity<Map<String, Object>> markBulkAttendance(@RequestBody List<Map<String, Object>> dataList) {
        int count = 0;
        for (Map<String, Object> data : dataList) {
            try {
                markSingleAttendance(data);
                count++;
            } catch (Exception e) {
                // Skip errors for individual records in bulk
            }
        }
        return ResponseEntity.ok(Map.of("message", "Processed " + count + " records"));
    }

    private ResponseEntity<Map<String, Object>> markSingleAttendance(Map<String, Object> data) {
        try {
            Long studentId = Long.parseLong(data.get("studentId").toString());
            Long subjectId = Long.parseLong(data.get("subjectId").toString());
            String dateStr = data.get("date").toString();
            String statusStr = data.get("status").toString();

            Student student = studentRepository.findById(studentId).orElse(null);
            Subject subject = subjectRepository.findById(subjectId).orElse(null);

            if (student == null || subject == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Student or Subject not found"));
            }

            // Check if attendance already exists for this student, subject and date
            Attendance attendance = attendanceRepository.findByStudentIdAndSubjectIdAndDate(studentId, subjectId, LocalDate.parse(dateStr));
            if (attendance == null) {
                attendance = new Attendance();
                attendance.setStudent(student);
                attendance.setSubject(subject);
                attendance.setDate(LocalDate.parse(dateStr));
            }
            
            attendance.setStatus(Attendance.AttendanceStatus.valueOf(statusStr));
            attendanceRepository.save(attendance);

            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    @GetMapping("/attendance/subject/{subjectId}/students")
    public ResponseEntity<List<Map<String, Object>>> getStudentsBySubject(@PathVariable Long subjectId) {
        // Return all students (the frontend needs student list for attendance marking)
        List<Student> students = studentRepository.findAll();
        List<Map<String, Object>> result = students.stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("rollNo", s.getRollNo());
            map.put("name", s.getName());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // ========== ELIGIBILITY REPORT ENDPOINTS ==========

    @GetMapping("/attendance/report/department/{departmentId}/{semesterTotal}")
    public ResponseEntity<List<Map<String, Object>>> getEligibilityReport(
            @PathVariable Long departmentId,
            @PathVariable Integer semesterTotal,
            @RequestParam(required = false) Integer semester,
            @RequestParam(defaultValue = "75") Double threshold,
            @RequestParam(required = false, defaultValue = "false") Boolean perSubject) {

        Department dept = departmentRepository.findById(departmentId).orElse(null);
        String deptName = dept != null ? dept.getName() : "Unknown";

        // Get students in the department
        List<Student> students = studentRepository.findByDepartmentId(departmentId);

        List<Map<String, Object>> report = new ArrayList<>();
        for (Student student : students) {
            Double attendancePct = attendanceRepository.findStudentAttendanceStats(student.getId());
            double att = attendancePct != null ? attendancePct : 0.0;
            String status = att >= threshold ? "ELIGIBLE" : "NOT ELIGIBLE";

            int requiredClasses = (int) Math.ceil((threshold / 100.0) * semesterTotal);
            int actualPresent = (int) Math.ceil((att / 100.0) * semesterTotal);
            int remaining = Math.max(0, requiredClasses - actualPresent);

            Map<String, Object> row = new HashMap<>();
            row.put("studentId", student.getId());
            row.put("rollNo", student.getRollNo());
            row.put("name", student.getName());
            row.put("course", deptName);
            row.put("department", deptName);
            row.put("attendancePercentage", att);
            row.put("requiredClasses", requiredClasses);
            row.put("remainingClasses", remaining);
            row.put("status", status);
            report.add(row);
        }

        return ResponseEntity.ok(report);
    }

    @GetMapping("/attendance/report/pdf/department/{departmentId}/{semesterTotal}")
    public ResponseEntity<byte[]> downloadEligibilityReportByDepartment(
            @PathVariable Long departmentId,
            @PathVariable Integer semesterTotal,
            @RequestParam(defaultValue = "75") double threshold,
            @RequestParam(defaultValue = "false") boolean perSubject) {

        Department dept = departmentRepository.findById(departmentId).orElse(null);
        String deptName = dept != null ? dept.getName() : "Unknown";

        List<Student> students = studentRepository.findByDepartmentId(departmentId);

        long eligibleCount = students.stream()
                .map(s -> attendanceRepository.findStudentAttendanceStats(s.getId()))
                .mapToDouble(v -> v != null ? v : 0.0)
                .filter(att -> att >= threshold)
                .count();
        long notEligibleCount = Math.max(0, students.size() - eligibleCount);
        double eligibilityRate = students.isEmpty() ? 0.0 : (eligibleCount * 100.0 / students.size());

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 72, 54);
            PdfWriter writer = PdfWriter.getInstance(document, out);

            writer.setPageEvent(new com.ayush.academicerp.utils.HeaderFooterPageEvent());
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Font.BOLD, new BaseColor(15, 23, 42));
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Font.BOLD, new BaseColor(71, 85, 105));
            Font metaLabelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, new BaseColor(51, 65, 85));
            Font metaValueFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL, new BaseColor(15, 23, 42));
            Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, BaseColor.WHITE);
            Font tableBodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL, new BaseColor(15, 23, 42));
            Font tableBodyBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, new BaseColor(15, 23, 42));
            Font statusOkFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, new BaseColor(22, 101, 52));
            Font statusWarnFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, new BaseColor(180, 83, 9));
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Font.NORMAL, new BaseColor(100, 116, 139));

            Paragraph title = new Paragraph("Attendance Eligibility Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(6);
            document.add(title);

            Paragraph subtitle = new Paragraph("Professional Academic Compliance Summary", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(14);
            document.add(subtitle);

            PdfPTable metadataTable = new PdfPTable(2);
            metadataTable.setWidthPercentage(100);
            metadataTable.setSpacingAfter(12);
            metadataTable.setWidths(new float[] {1f, 1f});

            PdfPCell leftMeta = new PdfPCell();
            leftMeta.setBorder(Rectangle.BOX);
            leftMeta.setBorderColor(new BaseColor(226, 232, 240));
            leftMeta.setBackgroundColor(new BaseColor(248, 250, 252));
            leftMeta.setPadding(10);
            leftMeta.addElement(new Paragraph("Department", metaLabelFont));
            leftMeta.addElement(new Paragraph(deptName, metaValueFont));
            leftMeta.addElement(new Paragraph("Scope", metaLabelFont));
            leftMeta.addElement(new Paragraph("All students in department", metaValueFont));
            metadataTable.addCell(leftMeta);

            PdfPCell rightMeta = new PdfPCell();
            rightMeta.setBorder(Rectangle.BOX);
            rightMeta.setBorderColor(new BaseColor(226, 232, 240));
            rightMeta.setBackgroundColor(new BaseColor(248, 250, 252));
            rightMeta.setPadding(10);
            rightMeta.addElement(new Paragraph("Threshold", metaLabelFont));
            rightMeta.addElement(new Paragraph(String.format("%.1f%%", threshold), metaValueFont));
            rightMeta.addElement(new Paragraph("Total Classes", metaLabelFont));
            rightMeta.addElement(new Paragraph(String.valueOf(semesterTotal), metaValueFont));
            rightMeta.addElement(new Paragraph("Generated On", metaLabelFont));
            rightMeta.addElement(new Paragraph(LocalDate.now().toString(), metaValueFont));
            metadataTable.addCell(rightMeta);

            document.add(metadataTable);

            PdfPTable summaryTable = new PdfPTable(4);
            summaryTable.setWidthPercentage(100);
            summaryTable.setSpacingAfter(14);
            summaryTable.setWidths(new float[] {1f, 1f, 1f, 1f});

            PdfPCell totalCell = new PdfPCell();
            totalCell.setBackgroundColor(new BaseColor(241, 245, 249));
            totalCell.setBorderColor(new BaseColor(226, 232, 240));
            totalCell.setPadding(10);
            totalCell.addElement(new Paragraph("Total Students", metaLabelFont));
            totalCell.addElement(new Paragraph(String.valueOf(students.size()), tableBodyBold));
            summaryTable.addCell(totalCell);

            PdfPCell eligibleCell = new PdfPCell();
            eligibleCell.setBackgroundColor(new BaseColor(220, 252, 231));
            eligibleCell.setBorderColor(new BaseColor(187, 247, 208));
            eligibleCell.setPadding(10);
            eligibleCell.addElement(new Paragraph("Eligible", metaLabelFont));
            eligibleCell.addElement(new Paragraph(String.valueOf(eligibleCount), tableBodyBold));
            summaryTable.addCell(eligibleCell);

            PdfPCell actionCell = new PdfPCell();
            actionCell.setBackgroundColor(new BaseColor(255, 247, 237));
            actionCell.setBorderColor(new BaseColor(254, 215, 170));
            actionCell.setPadding(10);
            actionCell.addElement(new Paragraph("Not Eligible", metaLabelFont));
            actionCell.addElement(new Paragraph(String.valueOf(notEligibleCount), tableBodyBold));
            summaryTable.addCell(actionCell);

            PdfPCell rateCell = new PdfPCell();
            rateCell.setBackgroundColor(new BaseColor(239, 246, 255));
            rateCell.setBorderColor(new BaseColor(191, 219, 254));
            rateCell.setPadding(10);
            rateCell.addElement(new Paragraph("Eligibility Rate", metaLabelFont));
            rateCell.addElement(new Paragraph(String.format("%.1f%%", eligibilityRate), tableBodyBold));
            summaryTable.addCell(rateCell);

            document.add(summaryTable);

            PdfPTable table = new PdfPTable(8);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{0.7f, 1.4f, 2.8f, 1.6f, 1.2f, 1.0f, 1.0f, 1.3f});
            table.setHeaderRows(1);

            String[] headers = {"S.N", "Roll No", "Student Name", "Department", "Attendance %", "Required", "Remaining", "Status"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, tableHeaderFont));
                cell.setBackgroundColor(new BaseColor(30, 41, 59));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setPadding(8);
                cell.setBorderColor(new BaseColor(71, 85, 105));
                table.addCell(cell);
            }

            int sno = 1;
            int rowIndex = 0;
            for (Student student : students) {
                Double attendancePct = attendanceRepository.findStudentAttendanceStats(student.getId());
                double att = attendancePct != null ? attendancePct : 0.0;
                boolean isEligible = att >= threshold;
                String status = isEligible ? "ELIGIBLE" : "NOT ELIGIBLE";

                int requiredClasses = (int) Math.ceil((threshold / 100.0) * semesterTotal);
                int actualPresent = (int) Math.ceil((att / 100.0) * semesterTotal);
                int remainingClasses = Math.max(0, requiredClasses - actualPresent);
                BaseColor rowColor = rowIndex++ % 2 == 0 ? BaseColor.WHITE : new BaseColor(248, 250, 252);

                PdfPCell snoCell = new PdfPCell(new Phrase(String.valueOf(sno++), tableBodyFont));
                snoCell.setPadding(6);
                snoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                snoCell.setBackgroundColor(rowColor);
                table.addCell(snoCell);

                PdfPCell rollCell = new PdfPCell(new Phrase(student.getRollNo(), tableBodyFont));
                rollCell.setPadding(6);
                rollCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                rollCell.setBackgroundColor(rowColor);
                table.addCell(rollCell);

                PdfPCell nameCell = new PdfPCell(new Phrase(student.getName(), tableBodyFont));
                nameCell.setPadding(6);
                nameCell.setBackgroundColor(rowColor);
                table.addCell(nameCell);

                PdfPCell deptCell = new PdfPCell(new Phrase(deptName, tableBodyFont));
                deptCell.setPadding(6);
                deptCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                deptCell.setBackgroundColor(rowColor);
                table.addCell(deptCell);

                PdfPCell attCell = new PdfPCell(new Phrase(String.format("%.1f%%", att), isEligible ? tableBodyBold : statusWarnFont));
                attCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                attCell.setPadding(6);
                attCell.setBackgroundColor(rowColor);
                table.addCell(attCell);

                PdfPCell requiredCell = new PdfPCell(new Phrase(String.valueOf(requiredClasses), tableBodyFont));
                requiredCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                requiredCell.setPadding(6);
                requiredCell.setBackgroundColor(rowColor);
                table.addCell(requiredCell);

                PdfPCell remainingCell = new PdfPCell(new Phrase(String.valueOf(remainingClasses), tableBodyFont));
                remainingCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                remainingCell.setPadding(6);
                remainingCell.setBackgroundColor(rowColor);
                table.addCell(remainingCell);

                PdfPCell statusCell = new PdfPCell(new Phrase(status, isEligible ? statusOkFont : statusWarnFont));
                statusCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                statusCell.setPadding(6);
                if (isEligible) {
                    statusCell.setBackgroundColor(new BaseColor(220, 252, 231));
                } else {
                    statusCell.setBackgroundColor(new BaseColor(255, 247, 237));
                }
                table.addCell(statusCell);
            }

            document.add(table);

            document.add(new Paragraph("\n\n"));
            PdfPTable signatures = new PdfPTable(3);
            signatures.setWidthPercentage(100);

            String[] roles = {"Class Coordinator", "Head of Department", "Dean Academic Affairs"};
            for (String role : roles) {
                PdfPCell cell = new PdfPCell();
                cell.addElement(new Paragraph("\n\n____________________", footerFont));
                Paragraph rolePara = new Paragraph(role, subtitleFont);
                rolePara.setAlignment(Element.ALIGN_CENTER);
                cell.addElement(rolePara);
                cell.setBorder(Rectangle.NO_BORDER);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                signatures.addCell(cell);
            }
            document.add(signatures);

            Paragraph systemFooter = new Paragraph("Generated by Academic ERP Eligibility Engine", footerFont);
            systemFooter.setAlignment(Element.ALIGN_CENTER);
            systemFooter.setSpacingBefore(14);
            document.add(systemFooter);

            document.close();

            byte[] pdfBytes = out.toByteArray();

            HttpHeaders headers_http = new HttpHeaders();
            headers_http.setContentType(MediaType.APPLICATION_PDF);
            String fileName = "Eligibility_Report_" + deptName.replace(" ", "_") + "_" + LocalDate.now() + ".pdf";
            headers_http.setContentDispositionFormData("attachment", fileName);
            headers_http.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return ResponseEntity.ok()
                    .headers(headers_http)
                    .body(pdfBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Backward-compatible alias for older frontend routes that still send semester in path
    @GetMapping("/attendance/report/pdf/{departmentId}/{semesterTotal}/{semester}")
    public ResponseEntity<byte[]> downloadEligibilityReportLegacy(
            @PathVariable Long departmentId,
            @PathVariable Integer semesterTotal,
            @PathVariable Integer semester,
            @RequestParam(defaultValue = "75") double threshold,
            @RequestParam(defaultValue = "false") boolean perSubject) {
        return downloadEligibilityReportByDepartment(departmentId, semesterTotal, threshold, perSubject);
    }

}
