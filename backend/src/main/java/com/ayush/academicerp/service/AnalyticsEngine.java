package com.ayush.academicerp.service;

import com.ayush.academicerp.dto.AnalyticsDTO;
import com.ayush.academicerp.entity.*;
import com.ayush.academicerp.repository.*;
import com.ayush.academicerp.projection.StudentProjection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsEngine {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final DepartmentRepository departmentRepository;

    // Risk thresholds
    private static final double SAFE_THRESHOLD = 75.0;
    private static final double WARNING_THRESHOLD = 60.0;

    public AnalyticsDTO.OverviewMetrics generateOverviewMetrics() {
        log.info("Generating overview metrics");

        Long totalStudents = studentRepository.count();
        Long totalSubjects = subjectRepository.count();
        Long totalDepartments = departmentRepository.count();

        // Calculate average attendance across all students (same source as student risk analytics)
        List<AnalyticsDTO.StudentRiskAnalytics> riskAnalytics = generateStudentRiskAnalytics();
        double averageAttendance = riskAnalytics.stream()
                .mapToDouble(AnalyticsDTO.StudentRiskAnalytics::getAttendancePercentage)
                .average()
                .orElse(0.0);

        // Ensure consistent risk counts between overview and detailed risk analysis
        long studentsBelowThreshold = riskAnalytics.stream()
                .filter(r -> !"LOW".equals(r.getRiskLevel()))
                .count();

        return new AnalyticsDTO.OverviewMetrics(totalStudents, averageAttendance, studentsBelowThreshold,
                totalSubjects, totalDepartments);
    }

    public List<AnalyticsDTO.DepartmentAnalytics> generateDepartmentAnalytics() {
        log.info("Generating department analytics");
        
        List<Department> departments = departmentRepository.findAll();
        List<AnalyticsDTO.DepartmentAnalytics> analytics = new ArrayList<>();
        
        for (Department department : departments) {
            List<Object[]> deptStats = attendanceRepository.findDepartmentAttendanceStats(department.getId());

            double attendancePercentage = 0.0;
            long studentCount = 0L;

            if (!deptStats.isEmpty()) {
                Object[] stat = deptStats.get(0);
                attendancePercentage = toDouble(stat[0]);
                studentCount = toLong(stat[1]);
            }

            // Count subjects assigned to this department (not just those with attendance records)
            Long subjectCount = Optional.ofNullable(
                    subjectRepository.countByDepartmentId(department.getId())
            ).orElse(0L);

            String insight = generateDepartmentInsight(department.getName(), attendancePercentage);

            analytics.add(new AnalyticsDTO.DepartmentAnalytics(
                department.getName(), attendancePercentage, studentCount,
                subjectCount, insight
            ));
        }
        
        return analytics.stream()
                .sorted((a, b) -> Double.compare(b.getAttendancePercentage(), a.getAttendancePercentage()))
                .collect(Collectors.toList());
    }

    public List<AnalyticsDTO.SubjectAnalytics> generateSubjectAnalytics() {
        log.info("Generating subject analytics");
        
        // Use regular entities to avoid projection issues
        List<Subject> subjects = subjectRepository.findAll();
        List<AnalyticsDTO.SubjectAnalytics> analytics = new ArrayList<>();
        
        // Get overall average for comparison
        Double overallAverage = Optional.ofNullable(attendanceRepository.findOverallAttendanceAverage()).orElse(0.0);
        
        for (Subject subject : subjects) {
            List<Object[]> subjectStats = attendanceRepository.findSubjectAttendanceStats(subject.getId());

            double attendancePercentage = 0.0;
            long totalClasses = 0L;
            long presentCount = 0L;

            if (!subjectStats.isEmpty()) {
                Object[] stat = subjectStats.get(0);
                attendancePercentage = toDouble(stat[0]);
                totalClasses = toLong(stat[1]);
                presentCount = toLong(stat[2]);
            }

            String departmentName = Optional.ofNullable(subject.getDepartment())
                    .map(dept -> dept.getName())
                    .orElse("Unknown");

            String insight = generateSubjectInsight(subject.getName(), attendancePercentage, overallAverage);

            analytics.add(new AnalyticsDTO.SubjectAnalytics(
                subject.getName(), subject.getCode(), departmentName,
                subject.getSemester(), attendancePercentage, totalClasses, presentCount, insight
            ));
        }
        
        return analytics.stream()
                .sorted((a, b) -> Double.compare(b.getAttendancePercentage(), a.getAttendancePercentage()))
                .collect(Collectors.toList());
    }

    public List<AnalyticsDTO.StudentRiskAnalytics> generateStudentRiskAnalytics() {
        log.info("Generating student risk analytics");
        
        List<StudentProjection> students = studentRepository.findAllStudentProjections();
        List<AnalyticsDTO.StudentRiskAnalytics> riskAnalytics = new ArrayList<>();
        
        for (StudentProjection student : students) {
            // The query returns a single scalar value (average attendance) or null if no records exist.
            Double attendancePercentage = Optional.ofNullable(attendanceRepository.findStudentAttendanceStats(student.getId()))
                    .orElse(0.0);

            String riskLevel = determineRiskLevel(attendancePercentage);
            List<String> problematicSubjects = findProblematicSubjects(student.getId());
            String insight = generateStudentRiskInsight(student.getName(), attendancePercentage, riskLevel);

            String departmentName = student.getDepartmentName() != null ? student.getDepartmentName() : "Unknown";

            riskAnalytics.add(new AnalyticsDTO.StudentRiskAnalytics(
                student.getId(), student.getName(), student.getRollNo(),
                departmentName, student.getSemester(),
                attendancePercentage, riskLevel, problematicSubjects, insight
            ));
        }
        
        return riskAnalytics.stream()
                .sorted((a, b) -> Double.compare(a.getAttendancePercentage(), b.getAttendancePercentage()))
                .collect(Collectors.toList());
    }

    // Paginated wrapper for risk analytics
    public AnalyticsDTO.StudentRiskPage generateStudentRiskAnalytics(int page, int size) {
        List<AnalyticsDTO.StudentRiskAnalytics> all = generateStudentRiskAnalytics();
        int total = all.size();

        if (size <= 0) size = 10;
        if (page < 0) page = 0;

        int fromIndex = page * size;
        if (fromIndex >= total) {
            return new AnalyticsDTO.StudentRiskPage(Collections.emptyList(), (long) total, page, size);
        }

        int toIndex = Math.min(fromIndex + size, total);
        List<AnalyticsDTO.StudentRiskAnalytics> pageItems = all.subList(fromIndex, toIndex);

        return new AnalyticsDTO.StudentRiskPage(pageItems, (long) total, page, size);
    }

    // Paginated + filtered wrapper (supports server-side search and risk-level filter)
    public AnalyticsDTO.StudentRiskPage generateStudentRiskAnalytics(int page, int size, String search, String riskFilter) {
        List<AnalyticsDTO.StudentRiskAnalytics> all = generateStudentRiskAnalytics();

        // Apply search filter (name, roll no, department)
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            all = all.stream()
                    .filter(s -> (s.getStudentName() != null && s.getStudentName().toLowerCase().contains(q))
                            || (s.getRollNo() != null && s.getRollNo().toLowerCase().contains(q))
                            || (s.getDepartmentName() != null && s.getDepartmentName().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        // Apply risk level filter (SAFE, WARNING, CRITICAL)
        if (riskFilter != null && !riskFilter.isBlank()) {
            String rf = riskFilter.toUpperCase();
            all = all.stream()
                    .filter(s -> rf.equals(s.getRiskLevel()))
                    .collect(Collectors.toList());
        }

        int total = all.size();

        if (size <= 0) size = 10;
        if (page < 0) page = 0;

        int fromIndex = page * size;
        if (fromIndex >= total) {
            return new AnalyticsDTO.StudentRiskPage(Collections.emptyList(), (long) total, page, size);
        }

        int toIndex = Math.min(fromIndex + size, total);
        List<AnalyticsDTO.StudentRiskAnalytics> pageItems = all.subList(fromIndex, toIndex);

        return new AnalyticsDTO.StudentRiskPage(pageItems, (long) total, page, size);
    }

    public List<AnalyticsDTO.AttendanceTrend> generateAttendanceTrend(int weeks) {
        log.info("Generating attendance trend for {} weeks", weeks);
        
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusWeeks(weeks);
        
        List<Object[]> weeklyStats = attendanceRepository.findWeeklyAttendanceStats(startDate, endDate);
        
        List<AnalyticsDTO.AttendanceTrend> trends = new ArrayList<>();
        Double previousPercentage = null;
        
        for (Object[] stat : weeklyStats) {
            String period = "Week " + stat[0];
            Double attendancePercentage = toDouble(stat[1]);
            Long totalClasses = toLong(stat[2]);
            Long presentCount = toLong(stat[3]);
            
            String trend = "STABLE";
            if (previousPercentage != null) {
                double difference = attendancePercentage - previousPercentage;
                if (difference > 2.0) trend = "INCREASING";
                else if (difference < -2.0) trend = "DECREASING";
            }
            
            trends.add(new AnalyticsDTO.AttendanceTrend(period, attendancePercentage, totalClasses, presentCount, trend));
            previousPercentage = attendancePercentage;
        }
        
        return trends;
    }

    public List<AnalyticsDTO.Insight> generateInsights() {
        log.info("Generating insights");
        
        List<AnalyticsDTO.Insight> insights = new ArrayList<>();
        
        // Descriptive insights
        insights.addAll(generateDescriptiveInsights());
        
        // Diagnostic insights
        insights.addAll(generateDiagnosticInsights());
        
        // Predictive insights
        insights.addAll(generatePredictiveInsights());
        
        return insights;
    }

    public List<AnalyticsDTO.Prediction> generatePredictions() {
        log.info("Generating predictions");
        
        List<AnalyticsDTO.Prediction> predictions = new ArrayList<>();
        
        // Get recent trend data
        List<AnalyticsDTO.AttendanceTrend> trends = generateAttendanceTrend(8);
        
        if (trends.size() >= 4) {
            // Calculate trend slope
            double slope = calculateTrendSlope(trends);
            Double currentAverage = Optional.ofNullable(attendanceRepository.findOverallAttendanceAverage()).orElse(0.0);
            
            // Predict next month
            Double predictedValue = currentAverage + (slope * 4);
            String explanation = generatePredictionExplanation(slope, trends);
            
            predictions.add(new AnalyticsDTO.Prediction(
                "Overall Attendance", currentAverage, predictedValue, 
                "next_month", explanation, Math.min(0.9, Math.max(0.1, 1.0 - Math.abs(slope / 10)))
            ));
        }
        
        return predictions;
    }

    // Private helper methods
    
    private String generateDepartmentInsight(String departmentName, Double attendancePercentage) {
        if (attendancePercentage < 60.0) {
            return departmentName + " department has critically low attendance at " + 
                   String.format("%.1f%%", attendancePercentage);
        } else if (attendancePercentage < 75.0) {
            return departmentName + " department attendance is below the safe threshold of 75%";
        } else {
            return departmentName + " department maintains good attendance levels";
        }
    }

    private String generateSubjectInsight(String subjectName, Double attendancePercentage, Double overallAverage) {
        double difference = attendancePercentage - overallAverage;
        
        if (difference < -10.0) {
            return subjectName + " attendance is significantly lower than average by " + 
                   String.format("%.1f%%", Math.abs(difference));
        } else if (difference > 10.0) {
            return subjectName + " attendance is significantly higher than average by " + 
                   String.format("%.1f%%", difference);
        } else {
            return subjectName + " attendance is close to the overall average";
        }
    }

    private String determineRiskLevel(Double attendancePercentage) {
        if (attendancePercentage >= SAFE_THRESHOLD) return "LOW";
        if (attendancePercentage >= WARNING_THRESHOLD) return "MEDIUM";
        return "HIGH";
    }

    private List<String> findProblematicSubjects(Long studentId) {
        List<Object[]> subjectStats = attendanceRepository.findStudentSubjectAttendance(studentId);
        
        return subjectStats.stream()
                .filter(stat -> stat != null && stat.length > 1)
                .filter(stat -> toDouble(stat[1]) < WARNING_THRESHOLD)
                .map(stat -> stat[0] != null ? stat[0].toString() : "Unknown")
                .collect(Collectors.toList());
    }

    private String generateStudentRiskInsight(String studentName, Double attendancePercentage, String riskLevel) {
        switch (riskLevel) {
            case "HIGH":
                return studentName + " is at critical risk with " + 
                       String.format("%.1f%%", attendancePercentage) + " attendance";
            case "MEDIUM":
                return studentName + " needs attention with " + 
                       String.format("%.1f%%", attendancePercentage) + " attendance";
            default:
                return studentName + " maintains good attendance at " + 
                       String.format("%.1f%%", attendancePercentage);
        }
    }

    private List<AnalyticsDTO.Insight> generateDescriptiveInsights() {
        List<AnalyticsDTO.Insight> insights = new ArrayList<>();
        
        Long totalStudents = studentRepository.count();
        Long studentsBelowThreshold = attendanceRepository.countStudentsBelowThreshold(SAFE_THRESHOLD);
        Double percentageBelowThreshold = (totalStudents > 0) ? (studentsBelowThreshold.doubleValue() / totalStudents) * 100 : 0.0;
        
        insights.add(new AnalyticsDTO.Insight(
            "DESCRIPTIVE", "Student Attendance Distribution", 
            String.format("%.1f%% of students are below the required 75%% attendance level", percentageBelowThreshold),
            "Focus on improving attendance in identified risk groups", 0.95
        ));
        
        return insights;
    }

    private List<AnalyticsDTO.Insight> generateDiagnosticInsights() {
        List<AnalyticsDTO.Insight> insights = new ArrayList<>();
        
        // Find departments with lowest attendance
        List<AnalyticsDTO.DepartmentAnalytics> deptAnalytics = generateDepartmentAnalytics();
        if (!deptAnalytics.isEmpty()) {
            AnalyticsDTO.DepartmentAnalytics worstDept = deptAnalytics.get(deptAnalytics.size() - 1);
            
            insights.add(new AnalyticsDTO.Insight(
                "DIAGNOSTIC", "Department Attendance Variance", 
                worstDept.getDepartmentName() + " has the lowest attendance at " + 
                String.format("%.1f%%", worstDept.getAttendancePercentage()),
                "Investigate department-specific issues and implement targeted interventions", 0.85
            ));
        }
        
        return insights;
    }

    private List<AnalyticsDTO.Insight> generatePredictiveInsights() {
        List<AnalyticsDTO.Insight> insights = new ArrayList<>();
        
        List<AnalyticsDTO.AttendanceTrend> trends = generateAttendanceTrend(4);
        if (!trends.isEmpty() && trends.size() >= 2) {
            AnalyticsDTO.AttendanceTrend latest = trends.get(trends.size() - 1);
            AnalyticsDTO.AttendanceTrend previous = trends.get(trends.size() - 2);
            
            if ("DECREASING".equals(latest.getTrend())) {
                double decline = previous.getAttendancePercentage() - latest.getAttendancePercentage();
                
                insights.add(new AnalyticsDTO.Insight(
                    "PREDICTIVE", "Attendance Decline Warning", 
                    "Attendance has declined by " + String.format("%.1f%%", decline) + " over recent weeks",
                    "Implement immediate interventions to reverse the declining trend", 0.75
                ));
            }
        }
        
        return insights;
    }

    private double calculateTrendSlope(List<AnalyticsDTO.AttendanceTrend> trends) {
        if (trends.size() < 2) return 0.0;
        
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        int n = trends.size();
        
        for (int i = 0; i < n; i++) {
            double x = i;
            double y = trends.get(i).getAttendancePercentage();
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }
        
        return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    }

    private String generatePredictionExplanation(double slope, List<AnalyticsDTO.AttendanceTrend> trends) {
        if (Math.abs(slope) < 0.5) {
            return "Attendance has been relatively stable over the past " + trends.size() + " weeks";
        } else if (slope > 0) {
            return "Attendance has been improving consistently with an average increase of " + 
                   String.format("%.1f%%", slope) + " per week";
        } else {
            return "Attendance has been declining with an average decrease of " + 
                   String.format("%.1f%%", Math.abs(slope)) + " per week";
        }
    }

    // Helpers
    private double toDouble(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Number) return ((Number) value).doubleValue();
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private long toLong(Object value) {
        if (value == null) return 0;
        if (value instanceof Number) return ((Number) value).longValue();
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    // AI Insights Methods
    public List<AnalyticsDTO.DropoutPrediction> generateDropoutPredictions() {
        log.info("Generating dropout predictions");
        
        List<AnalyticsDTO.StudentRiskAnalytics> riskAnalytics = generateStudentRiskAnalytics();
        List<AnalyticsDTO.DropoutPrediction> predictions = new ArrayList<>();
        
        for (AnalyticsDTO.StudentRiskAnalytics student : riskAnalytics) {
            Double riskScore = calculateRiskScore(student.getAttendancePercentage(), student.getProblematicSubjects());
            String riskCategory = getRiskCategory(riskScore);
            
            // Only include students with some risk level
            if (riskScore > 0.3) {
                AnalyticsDTO.DropoutPrediction prediction = new AnalyticsDTO.DropoutPrediction();
                prediction.setStudentId(student.getStudentId());
                prediction.setName(student.getStudentName());
                prediction.setRollNo(student.getRollNo());
                prediction.setRiskScore(riskScore);
                prediction.setRiskCategory(riskCategory);
                prediction.setRiskFactors(Arrays.asList(
                    "Low attendance: " + String.format("%.1f%%", student.getAttendancePercentage()),
                    "Problematic subjects: " + student.getProblematicSubjects().size()
                ));
                prediction.setRecommendation(generateRecommendation(riskCategory, student.getAttendancePercentage()));
                predictions.add(prediction);
            }
        }
        
        // Sort by risk score (highest first)
        predictions.sort((a, b) -> Double.compare(b.getRiskScore(), a.getRiskScore()));
        return predictions;
    }
    
    public AnalyticsDTO.RealTimeMetrics generateRealTimeMetrics() {
        log.info("Generating real-time metrics");
        
        AnalyticsDTO.OverviewMetrics overview = generateOverviewMetrics();
        List<AnalyticsDTO.StudentRiskAnalytics> riskAnalytics = generateStudentRiskAnalytics();
        
        AnalyticsDTO.RealTimeMetrics metrics = new AnalyticsDTO.RealTimeMetrics();
        metrics.setActiveStudents(overview.getTotalStudents());
        metrics.setEngagementRate(calculateEngagementRate(riskAnalytics));
        metrics.setAccuracy(85.0 + Math.random() * 10.0); // Simulated accuracy between 85-95%
        metrics.setTotalClasses(attendanceRepository.count());
        metrics.setPresentToday((long) (metrics.getTotalClasses() * 0.78)); // Simulated present today
        return metrics;
    }

    public Map<String, Object> generateRealTimeMetricsMap() {
        AnalyticsDTO.RealTimeMetrics metrics = generateRealTimeMetrics();
        Map<String, Object> map = new HashMap<>();
        map.put("activeStudents", metrics.getActiveStudents());
        map.put("engagementRate", metrics.getEngagementRate());
        map.put("accuracy", metrics.getAccuracy());
        map.put("totalClasses", metrics.getTotalClasses());
        map.put("presentToday", metrics.getPresentToday());
        return map;
    }

    public List<AnalyticsDTO.Anomaly> generateAnomalies() {
        log.info("Generating anomaly detection results");
        
        List<AnalyticsDTO.Anomaly> anomalies = new ArrayList<>();
        
        // Simulate some anomalies based on data patterns
        List<AnalyticsDTO.StudentRiskAnalytics> riskAnalytics = generateStudentRiskAnalytics();
        long criticalStudents = riskAnalytics.stream()
                .filter(s -> "HIGH".equals(s.getRiskLevel()))
                .count();
        
        if (criticalStudents > 0) {
            AnalyticsDTO.Anomaly anomaly = new AnalyticsDTO.Anomaly();
            anomaly.setType("ATTENDANCE_ANOMALY");
            anomaly.setDescription("Unusual attendance pattern detected in " + criticalStudents + " students");
            anomaly.setSeverity(criticalStudents > 5 ? 0.8 : 0.6);
            anomaly.setAffectedEntity("Student Attendance");
            anomaly.setRecommendation("Review attendance patterns and consider intervention strategies");
            anomaly.setTimestamp(System.currentTimeMillis());
            anomalies.add(anomaly);
        }
        
        // Add a subject-level anomaly if needed
        if (Math.random() > 0.7) {
            AnalyticsDTO.Anomaly subjectAnomaly = new AnalyticsDTO.Anomaly();
            subjectAnomaly.setType("SUBJECT_ANOMALY");
            subjectAnomaly.setDescription("Significant drop in attendance for Computer Networks");
            subjectAnomaly.setSeverity(0.5);
            subjectAnomaly.setAffectedEntity("Computer Networks");
            subjectAnomaly.setRecommendation("Investigate teaching methods or subject difficulty");
            subjectAnomaly.setTimestamp(System.currentTimeMillis());
            anomalies.add(subjectAnomaly);
        }
        
        return anomalies;
    }
    
    public List<AnalyticsDTO.Recommendation> generateRecommendations() {
        log.info("Generating AI recommendations");
        
        List<AnalyticsDTO.Recommendation> recommendations = new ArrayList<>();
        
        AnalyticsDTO.OverviewMetrics overview = generateOverviewMetrics();
        List<AnalyticsDTO.StudentRiskAnalytics> riskAnalytics = generateStudentRiskAnalytics();
        
        // Attendance improvement recommendation
        if (overview.getAverageAttendance() < 75.0) {
            AnalyticsDTO.Recommendation rec1 = new AnalyticsDTO.Recommendation();
            rec1.setTitle("Improve Overall Attendance");
            rec1.setDescription("Current attendance is below optimal threshold. Implement attendance improvement strategies.");
            rec1.setPriority("HIGH");
            rec1.setImpact("Medium");
            rec1.setCategory("Attendance");
            rec1.setActionItems(Arrays.asList(
                "Send attendance reminders to students",
                "Identify and address attendance barriers",
                "Implement engagement activities"
            ));
            recommendations.add(rec1);
        }
        
        // Risk intervention recommendation
        long atRiskStudents = riskAnalytics.stream()
                .filter(s -> !"LOW".equals(s.getRiskLevel()))
                .count();
        
        if (atRiskStudents > 0) {
            AnalyticsDTO.Recommendation rec2 = new AnalyticsDTO.Recommendation();
            rec2.setTitle("Student Risk Intervention");
            rec2.setDescription(atRiskStudents + " students require immediate attention due to attendance issues.");
            rec2.setPriority("CRITICAL");
            rec2.setImpact("High");
            rec2.setCategory("Student Success");
            rec2.setActionItems(Arrays.asList(
                "Schedule individual counseling sessions",
                "Provide academic support resources",
                "Monitor progress weekly"
            ));
            recommendations.add(rec2);
        }
        
        return recommendations;
    }
    
    public AnalyticsDTO.SentimentAnalysis generateSentimentAnalysis() {
        log.info("Generating sentiment analysis");
        
        // Simulate sentiment analysis based on attendance patterns
        AnalyticsDTO.OverviewMetrics overview = generateOverviewMetrics();
        double attendanceRate = overview.getAverageAttendance();
        
        AnalyticsDTO.SentimentAnalysis sentiment = new AnalyticsDTO.SentimentAnalysis();
        
        if (attendanceRate >= 80.0) {
            sentiment.setPositive(0.65 + Math.random() * 0.15);
            sentiment.setNeutral(0.20 + Math.random() * 0.10);
            sentiment.setNegative(0.10 + Math.random() * 0.10);
            sentiment.setOverallSentiment("POSITIVE");
        } else if (attendanceRate >= 65.0) {
            sentiment.setPositive(0.40 + Math.random() * 0.10);
            sentiment.setNeutral(0.35 + Math.random() * 0.10);
            sentiment.setNegative(0.20 + Math.random() * 0.10);
            sentiment.setOverallSentiment("NEUTRAL");
        } else {
            sentiment.setPositive(0.20 + Math.random() * 0.10);
            sentiment.setNeutral(0.30 + Math.random() * 0.10);
            sentiment.setNegative(0.45 + Math.random() * 0.15);
            sentiment.setOverallSentiment("NEGATIVE");
        }
        
        // Ensure they sum to 1.0
        double sum = sentiment.getPositive() + sentiment.getNeutral() + sentiment.getNegative();
        sentiment.setPositive(sentiment.getPositive() / sum);
        sentiment.setNeutral(sentiment.getNeutral() / sum);
        sentiment.setNegative(sentiment.getNegative() / sum);
        
        sentiment.setTotalResponses(25 + (int)(Math.random() * 50)); // Simulated response count
        
        return sentiment;
    }
    
    public List<AnalyticsDTO.AttendanceHeatmap> generateAttendanceHeatmaps(String timeRange) {
        log.info("Generating attendance heatmaps for time range: {}", timeRange);
        
        List<AnalyticsDTO.AttendanceHeatmap> heatmaps = new ArrayList<>();
        LocalDate endDate = LocalDate.now();
        LocalDate startDate;
        
        // Parse time range
        if (timeRange.equals("7d")) {
            startDate = endDate.minusDays(7);
        } else if (timeRange.equals("30d")) {
            startDate = endDate.minusDays(30);
        } else {
            startDate = endDate.minusDays(30); // default
        }
        
        // Generate daily attendance data
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            AnalyticsDTO.AttendanceHeatmap heatmap = new AnalyticsDTO.AttendanceHeatmap();
            heatmap.setDate(current.toString());
            
            // Simulate attendance with some variation
            double baseAttendance = 75.0 + Math.random() * 15.0;
            if (current.getDayOfWeek().getValue() >= 6) { // Weekends
                baseAttendance = Math.max(0, baseAttendance - 20.0);
            }
            
            heatmap.setAttendance(baseAttendance);
            heatmap.setTotalClasses(8L + (long)(Math.random() * 4));
            heatmap.setPresentCount((long)(heatmap.getTotalClasses() * heatmap.getAttendance() / 100.0));
            
            // Determine trend
            if (heatmaps.size() > 0) {
                double prevAttendance = heatmaps.get(heatmaps.size() - 1).getAttendance();
                if (baseAttendance > prevAttendance + 2) {
                    heatmap.setTrend("INCREASING");
                } else if (baseAttendance < prevAttendance - 2) {
                    heatmap.setTrend("DECREASING");
                } else {
                    heatmap.setTrend("STABLE");
                }
            } else {
                heatmap.setTrend("STABLE");
            }
            
            heatmaps.add(heatmap);
            current = current.plusDays(1);
        }
        
        return heatmaps;
    }

    // Helper methods for AI Insights
    private Double calculateRiskScore(Double attendance, List<String> problematicSubjects) {
        double score = 0.0;
        
        // Attendance component (70% weight)
        if (attendance < 60) score += 0.7;
        else if (attendance < 75) score += 0.4;
        else if (attendance < 85) score += 0.2;
        
        // Problematic subjects component (30% weight)
        if (problematicSubjects.size() >= 3) score += 0.3;
        else if (problematicSubjects.size() >= 2) score += 0.2;
        else if (problematicSubjects.size() >= 1) score += 0.1;
        
        return Math.min(1.0, score);
    }
    
    private String getRiskCategory(Double riskScore) {
        if (riskScore >= 0.8) return "CRITICAL";
        if (riskScore >= 0.6) return "HIGH";
        if (riskScore >= 0.4) return "MEDIUM";
        return "LOW";
    }
    
    private String generateRecommendation(String riskCategory, Double attendance) {
        switch (riskCategory) {
            case "CRITICAL":
                return "Immediate intervention required. Schedule counseling and academic support.";
            case "HIGH":
                return "Close monitoring needed. Consider tutoring and mentorship programs.";
            case "MEDIUM":
                return "Regular check-ins recommended. Provide additional study resources.";
            default:
                return "Continue monitoring attendance patterns.";
        }
    }
    
    private Double calculateEngagementRate(List<AnalyticsDTO.StudentRiskAnalytics> riskAnalytics) {
        long engagedStudents = riskAnalytics.stream()
                .filter(s -> s.getAttendancePercentage() >= 75.0)
                .count();
        if (riskAnalytics.isEmpty()) return 0.0;
        return (double) engagedStudents / riskAnalytics.size() * 100.0;
    }
}
