package com.ayush.academicerp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EligibilityReportDto {
    private Long studentId;
    private String rollNo;
    private String name;
    private String course;
    private String department;
    private Double attendancePercentage;
    private Integer requiredClasses;
    private Integer remainingClasses;
    private String status;
}
