package com.ayush.academicerp.controller;

import com.ayush.academicerp.dto.AnalyticsDTO;
import com.ayush.academicerp.service.AnalyticsEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Collections;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AdvancedAnalyticsController {

    private final AnalyticsEngine analyticsEngine;

    // Real-time metrics
    @GetMapping("/realtime")
    public ResponseEntity<Map<String, Object>> getRealTimeMetrics() {
        return ResponseEntity.ok(analyticsEngine.generateRealTimeMetricsMap());
    }

    @GetMapping("/overview")
    public ResponseEntity<AnalyticsDTO.OverviewMetrics> getOverviewAnalytics() {
        return ResponseEntity.ok(analyticsEngine.generateOverviewMetrics());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<AnalyticsDTO.DepartmentAnalytics>> getDepartmentAnalytics() {
        return ResponseEntity.ok(analyticsEngine.generateDepartmentAnalytics());
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<AnalyticsDTO.SubjectAnalytics>> getSubjectAnalytics() {
        return ResponseEntity.ok(analyticsEngine.generateSubjectAnalytics());
    }

    @GetMapping("/risk-analysis")
    public ResponseEntity<AnalyticsDTO.StudentRiskPage> getRiskAnalysis(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false, defaultValue = "") String risk
    ) {
        String searchTerm = (search != null && !search.isBlank()) ? search.trim() : null;
        String riskFilter = (risk != null && !risk.isBlank()) ? risk.trim().toUpperCase() : null;
        return ResponseEntity.ok(analyticsEngine.generateStudentRiskAnalytics(page, size, searchTerm, riskFilter));
    }

    @GetMapping("/trends")
    public ResponseEntity<List<AnalyticsDTO.AttendanceTrend>> getTrendAnalysis(@RequestParam(defaultValue = "8") int weeks) {
        return ResponseEntity.ok(analyticsEngine.generateAttendanceTrend(weeks));
    }

    @GetMapping("/insights")
    public ResponseEntity<List<AnalyticsDTO.Insight>> getInsights() {
        return ResponseEntity.ok(analyticsEngine.generateInsights());
    }

    @GetMapping("/predictions")
    public ResponseEntity<List<AnalyticsDTO.Prediction>> getPredictions() {
        return ResponseEntity.ok(analyticsEngine.generatePredictions());
    }

    @GetMapping("/predictions/dropout")
    public ResponseEntity<?> getDropoutPredictions() {
        return ResponseEntity.ok(analyticsEngine.generateDropoutPredictions());
    }

    @GetMapping("/forecasts/performance")
    public ResponseEntity<?> getPerformanceForecasts() {
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/patterns/behavioral")
    public ResponseEntity<?> getBehavioralPatterns() {
        return ResponseEntity.ok(Collections.emptyMap());
    }

    @GetMapping("/engagement/metrics")
    public ResponseEntity<?> getEngagementMetrics() {
        return ResponseEntity.ok(Collections.emptyMap());
    }

    @PostMapping("/comparative")
    public ResponseEntity<?> getComparativeAnalysis(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(Collections.emptyMap());
    }

    @GetMapping("/anomalies")
    public ResponseEntity<?> getAnomalyDetection() {
        return ResponseEntity.ok(analyticsEngine.generateAnomalies());
    }

    @GetMapping("/reports/executive")
    public ResponseEntity<byte[]> generateExecutiveReport(
            @RequestParam(required = false, defaultValue = "30d") String timeRange) {
        return ResponseEntity.ok("PDF content placeholder".getBytes());
    }

    @GetMapping("/recommendations/{studentId}")
    public ResponseEntity<?> getRecommendations(@PathVariable Long studentId) {
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getGeneralRecommendations() {
        return ResponseEntity.ok(analyticsEngine.generateRecommendations());
    }

    @GetMapping("/sentiment")
    public ResponseEntity<?> getSentimentAnalysis() {
        return ResponseEntity.ok(analyticsEngine.generateSentimentAnalysis());
    }

    @GetMapping("/heatmaps/attendance")
    public ResponseEntity<?> getAttendanceHeatmaps(
            @RequestParam(required = false, defaultValue = "30d") String timeRange) {
        return ResponseEntity.ok(analyticsEngine.generateAttendanceHeatmaps(timeRange));
    }
}
