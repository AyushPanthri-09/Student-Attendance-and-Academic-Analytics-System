package com.ayush.academicerp.dto;

public class AttendanceEligibilityDTO {

    public Long studentId;
    public String rollNo;
    public String name;
    public String course;
    public String department;

    public double attendancePercentage;

    public int totalClasses;
    public int classesMissed;

    public int requiredClasses;
    public int remainingClasses;

    public String status;

}