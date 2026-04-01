const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const desktopPath = path.join(process.env.USERPROFILE || process.env.HOME || '.', 'Desktop');
const outputPath = path.join(desktopPath, 'Academic_ERP_Analytics_Summary.pdf');

const doc = new PDFDocument({
  size: 'A4',
  margin: 40,
  info: {
    Title: 'Academic ERP Analytics Technical Summary',
    Author: 'GitHub Copilot',
    Subject: 'Project Stack, Analytics Formulas, and Architecture Summary'
  }
});

fs.mkdirSync(desktopPath, { recursive: true });
doc.pipe(fs.createWriteStream(outputPath));

const PAGE_WIDTH = doc.page.width - doc.page.margins.left - doc.page.margins.right;

function addTitle(text) {
  doc.moveDown(0.3);
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#0f172a').text(text, {
    width: PAGE_WIDTH,
    align: 'center'
  });
  doc.moveDown(0.4);
}

function addSubtitle(text) {
  doc.moveDown(0.15);
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#1e293b').text(text, {
    width: PAGE_WIDTH,
    align: 'center'
  });
  doc.moveDown(0.25);
}

function addParagraph(text) {
  doc.font('Helvetica').fontSize(10).fillColor('#111827').text(text, {
    width: PAGE_WIDTH,
    align: 'left',
    lineGap: 2
  });
  doc.moveDown(0.25);
}

function ensureSpace(minHeight = 100) {
  const remaining = doc.page.height - doc.y - doc.page.margins.bottom;
  if (remaining < minHeight) {
    doc.addPage();
  }
}

function drawTable(headers, rows, columnWidths) {
  const rowHeight = 22;
  const x0 = doc.page.margins.left;
  let y = doc.y;

  const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
  const widths = totalWidth > PAGE_WIDTH
    ? columnWidths.map(w => (w / totalWidth) * PAGE_WIDTH)
    : columnWidths;

  // Compute header height based on wrapped header text for cleaner alignment.
  let headerHeight = rowHeight;
  for (let i = 0; i < headers.length; i++) {
    const h = doc.heightOfString(String(headers[i]), {
      width: widths[i] - 8,
      align: 'center'
    }) + 10;
    headerHeight = Math.max(headerHeight, h);
  }

  ensureSpace(headerHeight + 30);

  // Header row
  let x = x0;
  doc.lineWidth(0.7).strokeColor('#cbd5e1').fillColor('#e2e8f0');
  for (let i = 0; i < headers.length; i++) {
    doc.rect(x, y, widths[i], headerHeight).fillAndStroke('#e2e8f0', '#cbd5e1');
    const textHeight = doc.heightOfString(String(headers[i]), {
      width: widths[i] - 8,
      align: 'center'
    });
    const textY = y + Math.max(4, (headerHeight - textHeight) / 2);
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9)
      .text(String(headers[i]), x + 4, textY, {
        width: widths[i] - 8,
        align: 'center',
        ellipsis: true
      });
    x += widths[i];
  }

  y += headerHeight;

  // Body rows
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];

    // compute max cell height for wrapped text
    let maxCellHeight = rowHeight;
    for (let c = 0; c < row.length; c++) {
      const cellText = String(row[c] ?? '');
      const h = doc.heightOfString(cellText, { width: widths[c] - 8, align: 'left' }) + 10;
      maxCellHeight = Math.max(maxCellHeight, h);
    }

    ensureSpace(maxCellHeight + 8);
    if (doc.y !== y) {
      y = doc.y;
    }

    x = x0;
    for (let c = 0; c < row.length; c++) {
      const bg = r % 2 === 0 ? '#ffffff' : '#f8fafc';
      doc.rect(x, y, widths[c], maxCellHeight).fillAndStroke(bg, '#e2e8f0');
      doc.fillColor('#111827').font('Helvetica').fontSize(8.8)
        .text(String(row[c] ?? ''), x + 4, y + 5, { width: widths[c] - 8, align: 'left' });
      x += widths[c];
    }

    y += maxCellHeight;
    doc.y = y;
  }

  doc.moveDown(0.35);
}

addTitle('Academic ERP - Technical Summary & Analytics Formula Handbook');
addParagraph('Generated on: ' + new Date().toLocaleString());
addParagraph('This document consolidates complete technical stack details, architecture, analytics formulas, implementation choices, and current gaps.');

addSubtitle('1) System Architecture Summary');
drawTable(
  ['Layer', 'Current Stack', 'Purpose', 'Notes'],
  [
    ['Frontend', 'React 18 + Vite 5 + Tailwind + Recharts', 'Analytics dashboards, visual reports, progressive loading', 'Fast UI iteration and chart rendering'],
    ['Backend', 'Spring Boot 3.2.5 (Java 17)', 'REST APIs, analytics computation, report generation', 'Not Node/Express (README outdated)'],
    ['Database', 'MySQL + Spring Data JPA', 'Attendance and academic data persistence', 'Custom JPQL queries for analytics'],
    ['Local Dev Routing', 'Vite proxy /api -> localhost:8080', 'Frontend-to-backend integration', 'Fails only when backend is down']
  ],
  [90, 150, 170, 120]
);

addSubtitle('2) Frontend-Backend Analytics Flow');
drawTable(
  ['Step', 'What Happens', 'Key Endpoint/Module'],
  [
    ['1', 'Dashboard loads in stages: overview -> charts -> risk -> secondary insights', 'ComprehensiveAnalytics progressive fetch'],
    ['2', 'Client service calls /api/analytics endpoints with caching and fallbacks', 'analyticsService.js'],
    ['3', 'Vite proxies calls to backend on port 8080', 'vite.config.js'],
    ['4', 'Controller routes requests to AnalyticsEngine methods', 'AdvancedAnalyticsController'],
    ['5', 'AnalyticsEngine computes metrics from repository aggregates and rules', 'AnalyticsEngine'],
    ['6', 'Results returned as typed DTO structures to UI', 'AnalyticsDTO classes']
  ],
  [40, 330, 160]
);

addSubtitle('3) Analytics Formulas & Rules in Use');
drawTable(
  ['Area', 'Formula / Rule', 'Type'],
  [
    ['Overall/Dept/Subject Attendance %', 'Attendance% = AVG(CASE status=PRESENT THEN 100 ELSE 0 END)', 'Data-driven SQL aggregate'],
    ['Risk Level', 'LOW if >=75, MEDIUM if >=60 and <75, HIGH if <60', 'Threshold rule'],
    ['Students Below Threshold', 'Count where riskLevel != LOW', 'Derived rule'],
    ['Descriptive Insight %', '(studentsBelowThreshold / totalStudents) * 100', 'Ratio metric'],
    ['Trend Classification', 'INCREASING if delta>2, DECREASING if delta<-2 else STABLE', 'Heuristic'],
    ['Trend Slope', 'm = (n*sum(xy)-sum(x)*sum(y)) / (n*sum(x^2)-(sum(x))^2', 'Linear regression'],
    ['Prediction Next Month', 'predicted = currentAverage + m*4', 'Forecast heuristic'],
    ['Prediction Confidence', 'confidence = min(0.9, max(0.1, 1 - abs(m/10)))', 'Bounded confidence rule'],
    ['Engagement Rate', '(students with attendance>=75 / total risk analytics students) * 100', 'Derived ratio'],
    ['Dropout Risk Score', '0.7*attendance risk component + 0.3*problematic subjects component (capped at 1.0)', 'Weighted heuristic'],
    ['Dropout Category', 'CRITICAL>=0.8, HIGH>=0.6, MEDIUM>=0.4, else LOW', 'Bucket rule'],
    ['Sentiment', 'Attendance-band-based simulated values then normalized to sum=1', 'Simulated heuristic'],
    ['Anomaly Severity', 'If high-risk students >5 severity=0.8 else 0.6 (+ occasional random subject anomaly)', 'Rule + simulated trigger']
  ],
  [130, 300, 100]
);

ensureSpace(220);
addSubtitle('4) Why These Choices Were Made');
drawTable(
  ['Decision', 'Why Used', 'Trade-off'],
  [
    ['Spring Boot + JPA', 'Fast enterprise API development and query abstraction', 'Needs tuning for very large analytical workloads'],
    ['Threshold Analytics', 'Simple, explainable, easy for academic stakeholders', 'Less adaptive than ML models'],
    ['Progressive UI Loading', 'Improves perceived performance and resilience', 'More frontend orchestration complexity'],
    ['Permissive Security in Dev', 'Unblocked integration during build phase', 'Not production-safe without JWT enforcement'],
    ['Caching on Client', 'Reduces repeated calls and improves responsiveness', 'Potential temporary staleness']
  ],
  [120, 230, 180]
);

addSubtitle('5) What Is Not Implemented Yet (Important Gaps)');
drawTable(
  ['Gap', 'Current State', 'Impact'],
  [
    ['JWT Enforcement', 'JWT service exists but requests are permitAll', 'Security risk in production'],
    ['Secret Management', 'DB and JWT secrets in properties file', 'Credential leakage risk'],
    ['Automated Tests', 'Test dependencies exist but no backend test classes found', 'Regression risk'],
    ['Analytics Purity', 'Some AI metrics are simulated/randomized', 'Business trust and consistency limitations'],
    ['API Base URL Consistency', 'Some services use proxy path; others use absolute localhost', 'Environment portability issues'],
    ['Documentation Accuracy', 'README backend stack mismatch', 'Onboarding confusion']
  ],
  [120, 240, 170]
);

addSubtitle('6) Priority Action Plan (Recommended)');
drawTable(
  ['Priority', 'Action', 'Outcome'],
  [
    ['P0', 'Enable JWT filter + role based endpoint protection', 'Secure API surface'],
    ['P0', 'Move secrets to environment variables and .env strategy', 'Safer credential handling'],
    ['P1', 'Add unit/integration tests for AnalyticsEngine and controllers', 'Stable releases'],
    ['P1', 'Unify all frontend services to /api proxy pattern', 'Consistent local/prod routing'],
    ['P2', 'Replace simulated metrics with deterministic data logic', 'Higher analytical trust'],
    ['P2', 'Update README to actual Java/Spring architecture', 'Accurate project docs']
  ],
  [60, 300, 170]
);

addParagraph('End of report.');

doc.end();

console.log('PDF generated at: ' + outputPath);
