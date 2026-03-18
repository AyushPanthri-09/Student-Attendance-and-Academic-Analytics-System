package com.ayush.academicerp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SubjectDto {
    private Long id;
    private String name;
    private String code;
    private Integer semester;
    private String departmentName;
}
