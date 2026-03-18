package com.ayush.academicerp.dto;

public class AttendanceReportDTO {

    public Long studentId;
    public String rollNo;
    public String name;
    public String course;
    public String department;
    public int semester;

    public double attendancePercentage;
    public int presentClasses;
    public int totalClasses;
    public int classesMissed;
    public int remainingClasses;

    public String predictiveStatus; // SAFE, CAN COVER, CANNOT COVER

    public AttendanceReportDTO() {}
}