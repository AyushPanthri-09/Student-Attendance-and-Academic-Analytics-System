package com.ayush.academicerp.dto;

import lombok.*;
import java.util.List;

@Data
public class AnalyticsDTO {
    
    @Data
    @AllArgsConstructor
    public static class OverviewMetrics {
        private Long totalStudents;
        private Double averageAttendance;
        private Long studentsBelowThreshold;
        private Long totalSubjects;
        private Long totalDepartments;
    }
    
    @Data
    @AllArgsConstructor
    public static class DepartmentAnalytics {
        private String departmentName;
        private Double attendancePercentage;
        private Long studentCount;
        private Long subjectCount;
        private String insight;
    }
    
    @Data
    @AllArgsConstructor
    public static class SubjectAnalytics {
        private String subjectName;
        private String subjectCode;
        private String departmentName;
        private Integer semester;
        private Double attendancePercentage;
        private Long totalClasses;
        private Long presentCount;
        private String insight;
    }
    
    @Data
    @AllArgsConstructor
    public static class StudentRiskAnalytics {
        private Long studentId;
        private String studentName;
        private String rollNo;
        private String departmentName;
        private Integer semester;
        private Double attendancePercentage;
        private String riskCategory; // SAFE, WARNING, CRITICAL
        private List<String> problematicSubjects;
        private String insight;
    }

    @Data
    @AllArgsConstructor
    public static class StudentRiskPage {
        private List<StudentRiskAnalytics> items;
        private Long total;
        private Integer page;
        private Integer size;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceTrend {
        private String period; // Week 1, Week 2, etc.
        private Double attendancePercentage;
        private Long totalClasses;
        private Long presentCount;
        private String trend; // INCREASING, STABLE, DECREASING
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Insight {
        private String type; // DESCRIPTIVE, DIAGNOSTIC, PREDICTIVE
        private String title;
        private String description;
        private String recommendation;
        private Double confidence; // 0.0 to 1.0
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Prediction {
        private String metric;
        private Double currentValue;
        private Double predictedValue;
        private String timeframe; // next_week, next_month, next_semester
        private String explanation;
        private Double confidence;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DropoutPrediction {
        private Long studentId;
        private String name;
        private String rollNo;
        private Double riskScore;
        private String riskCategory;
        private List<String> riskFactors;
        private String recommendation;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RealTimeMetrics {
        private Long activeStudents;
        private Double engagementRate;
        private Double accuracy;
        private Long totalClasses;
        private Long presentToday;
        private Double averageAttendanceToday;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Anomaly {
        private String type;
        private String description;
        private Double severity;
        private String affectedEntity;
        private String recommendation;
        private Long timestamp;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Recommendation {
        private String title;
        private String description;
        private String priority;
        private String impact;
        private String category;
        private List<String> actionItems;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SentimentAnalysis {
        private Double positive;
        private Double neutral;
        private Double negative;
        private String overallSentiment;
        private Integer totalResponses;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceHeatmap {
        private String date;
        private Double attendance;
        private Long totalClasses;
        private Long presentCount;
        private String trend;
    }
}
