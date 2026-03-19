package com.ayush.academicerp.projection;

public interface StudentProjection {
    Long getId();
    String getName();
    String getRollNo();
    String getDepartmentName();
    Integer getSemester();
    Boolean getExamEligible();
    Long getDepartmentId();
}
