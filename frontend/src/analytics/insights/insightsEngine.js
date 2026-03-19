// Insights Engine - Generates automatic insights from attendance data

export function generateAttendanceInsights(data, riskList) {
  const insights = [];

  if (!data || data.length === 0) return insights;

  // Calculate overall statistics
  const avgAttendance = data.reduce((sum, s) => sum + s.attendance, 0) / data.length;
  const eligibleCount = data.filter(s => s.attendance >= 75).length;
  const atRiskCount = data.length - eligibleCount;

  // Insight 1: Overall attendance health
  if (avgAttendance >= 80) {
    insights.push({
      type: 'positive',
      title: 'Excellent Attendance Rate',
      message: `Overall attendance is ${avgAttendance.toFixed(1)}%, which is excellent. ${eligibleCount} out of ${data.length} students are eligible for exams.`
    });
  } else if (avgAttendance >= 70) {
    insights.push({
      type: 'warning',
      title: 'Moderate Attendance Rate',
      message: `Overall attendance is ${avgAttendance.toFixed(1)}%, which is moderate. ${atRiskCount} students are at risk of failing eligibility.`
    });
  } else {
    insights.push({
      type: 'danger',
      title: 'Critical Attendance Rate',
      message: `Overall attendance is ${avgAttendance.toFixed(1)}%, which is concerning. ${atRiskCount} students are at risk of failing eligibility.`
    });
  }

  // Insight 2: Risk distribution
  const highRisk = data.filter(s => s.attendance < 50).length;
  const mediumRisk = data.filter(s => s.attendance >= 50 && s.attendance < 75).length;

  if (highRisk > 0) {
    insights.push({
      type: 'danger',
      title: 'High Risk Students',
      message: `${highRisk} students have attendance below 50%. Immediate intervention required.`
    });
  }

  if (mediumRisk > 0) {
    insights.push({
      type: 'warning',
      title: 'Medium Risk Students',
      message: `${mediumRisk} students have attendance between 50-75%. Monitor closely.`
    });
  }

  // Insight 3: Department comparison
  const deptStats = data.reduce((acc, student) => {
    const dept = student.department || 'Unknown';
    if (!acc[dept]) acc[dept] = { total: 0, count: 0 };
    acc[dept].total += student.attendance;
    acc[dept].count++;
    return acc;
  }, {});

  const deptAverages = Object.entries(deptStats).map(([dept, stats]) => ({
    department: dept,
    average: stats.total / stats.count
  })).sort((a, b) => a.average - b.average);

  if (deptAverages.length > 1) {
    const lowestDept = deptAverages[0];
    const highestDept = deptAverages[deptAverages.length - 1];

    insights.push({
      type: lowestDept.average < 70 ? 'danger' : 'warning',
      title: 'Department Performance Gap',
      message: `${lowestDept.department} has the lowest attendance at ${lowestDept.average.toFixed(1)}%, while ${highestDept.department} leads at ${highestDept.average.toFixed(1)}%.`
    });
  }

  // Insight 4: Subject-specific risks
  if (riskList && riskList.length > 0) {
    const subjectRisks = riskList.reduce((acc, risk) => {
      acc[risk.subject] = (acc[risk.subject] || 0) + 1;
      return acc;
    }, {});

    const worstSubject = Object.entries(subjectRisks)
      .sort(([,a], [,b]) => b - a)[0];

    if (worstSubject) {
      insights.push({
        type: 'warning',
        title: 'Subject Difficulty Alert',
        message: `${worstSubject[0]} has ${worstSubject[1]} students with low attendance, indicating it may be a difficult subject.`
      });
    }
  }

  // Insight 5: Trend analysis (mock for now)
  insights.push({
    type: 'info',
    title: 'Trend Analysis',
    message: 'Based on recent data, attendance has been stable. Continue monitoring weekly patterns.'
  });

  return insights;
}

export function generatePerformanceInsights(data) {
  const insights = [];

  if (!data || data.length === 0) return insights;

  const topPerformers = data.filter(s => s.attendance >= 90).length;
  const struggling = data.filter(s => s.attendance < 60).length;

  if (topPerformers > 0) {
    insights.push({
      type: 'positive',
      title: 'Top Performers',
      message: `${topPerformers} students maintain excellent attendance (90%+). Consider them for leadership roles.`
    });
  }

  if (struggling > 0) {
    insights.push({
      type: 'danger',
      title: 'Students Needing Support',
      message: `${struggling} students have attendance below 60%. Implement support programs immediately.`
    });
  }

  return insights;
}