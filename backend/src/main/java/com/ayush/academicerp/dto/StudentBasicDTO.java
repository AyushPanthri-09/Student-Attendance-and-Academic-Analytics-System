package com.ayush.academicerp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentBasicDTO {
    private Long id;
    private String rollNo;
    private String name;
    private Integer semester;
    private Long departmentId;
    private Boolean examEligible;
}
