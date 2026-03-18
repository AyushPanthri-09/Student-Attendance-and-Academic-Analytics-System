package com.ayush.academicerp.dto;

public class AttendanceDataDTO {

    public Long studentId;
    public String studentRollNo;
    public String studentName;
    public String course;
    public String department;
    public int semester;

    public Long subjectId;
    public String subjectName;
    public String subjectCode;

    public double attendancePercentage;
    public int presentClasses;
    public int totalClasses;

    public boolean eligible;

    // Constructor
    public AttendanceDataDTO() {}

    // Getters and setters can be added if needed, but public fields work for DTOs
}