package com.ayush.academicerp.utils;

import com.ayush.academicerp.dto.AttendanceEligibilityDTO;
import com.ayush.academicerp.dto.AttendanceReportDTO;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;

import java.io.ByteArrayOutputStream;
import java.util.List;

public class AttendanceReportGenerator {

    public static byte[] generateReport(
            String department,
            String semester,
            List<AttendanceEligibilityDTO> students) throws Exception {

        Document document = new Document(PageSize.A4.rotate(),72,72,90,72);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter writer = PdfWriter.getInstance(document, out);
        writer.setPageEvent(new HeaderFooterPageEvent());

        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD,18);
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD,12);
        Font legendFont = FontFactory.getFont(FontFactory.HELVETICA,10);

        Paragraph title = new Paragraph(
                "STUDENT EXAMINATION ELIGIBILITY REPORT - SEMESTER " + semester,
                titleFont);
        title.setAlignment(Element.ALIGN_CENTER);

        Paragraph deptInfo = new Paragraph(
                "Department: " + department,
                headerFont);
        deptInfo.setAlignment(Element.ALIGN_CENTER);

        Paragraph authority = new Paragraph(
                "Office of the Controller of Examinations",
                legendFont);
        authority.setAlignment(Element.ALIGN_CENTER);

        document.add(title);
        document.add(deptInfo);
        document.add(authority);
        document.add(new Paragraph(" "));

        Paragraph legend = new Paragraph(
                "Attendance % = (Classes Attended / Total Classes) × 100\n" +
                "Minimum Required: 75% attendance for exam eligibility.\n" +
                "Status: ELIGIBLE or NOT ELIGIBLE based on attendance threshold.",
                legendFont);

        legend.setSpacingAfter(15);
        document.add(legend);

        // -------- SUMMARY BLOCK --------

int totalStudents = students.size();
int eligible = 0;
int notEligible = 0;

for (AttendanceEligibilityDTO s : students) {

    if ("ELIGIBLE".equalsIgnoreCase(s.status)) {
        eligible++;
    }
    else {
        notEligible++;
    }
}

    PdfPTable summary = new PdfPTable(2);
    summary.setWidthPercentage(40);
    summary.setSpacingAfter(15);

    summary.setWidths(new float[]{3f,1f});

    Font summaryFont =
            FontFactory.getFont(FontFactory.HELVETICA_BOLD,11);

    summary.addCell(summaryCell("Total Students", summaryFont));
    summary.addCell(summaryCell(String.valueOf(totalStudents), summaryFont));

    summary.addCell(summaryCell("Eligible", summaryFont));
    summary.addCell(summaryCell(String.valueOf(eligible), summaryFont));

    summary.addCell(summaryCell("Not Eligible", summaryFont));
    summary.addCell(summaryCell(String.valueOf(notEligible), summaryFont));

    document.add(summary);

        PdfPTable table = new PdfPTable(8);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10);
        table.setSpacingAfter(15);

        table.setWidths(new float[]{2f,4f,3f,3f,2f,2f,2f,2f});
        table.setHeaderRows(1);

        addHeader(table,"Roll No");
        addHeader(table,"Student Name");
        addHeader(table,"Program");
        addHeader(table,"Course");
        addHeader(table,"Attendance %");
        addHeader(table,"Classes Missed");
        addHeader(table,"Total Classes");
        addHeader(table,"Status");

        boolean alternate=false;

        for(AttendanceEligibilityDTO s : students){

            BaseColor rowColor =
                    alternate ? new BaseColor(245,245,245) : BaseColor.WHITE;

            table.addCell(cell(s.rollNo,rowColor));
            table.addCell(cell(s.name,rowColor));
            table.addCell(cell(s.department,rowColor));
            table.addCell(cell(s.course,rowColor));

            table.addCell(cell(
                    String.format("%.2f%%", s.attendancePercentage),
                    rowColor));

            table.addCell(cell(String.valueOf(s.classesMissed),rowColor));
            table.addCell(cell(String.valueOf(s.totalClasses),rowColor));

            table.addCell(statusCell(s.status,rowColor));

            alternate=!alternate;
        }

        document.add(table);

        document.add(new Paragraph("\n\n"));

        PdfPTable signatures = new PdfPTable(3);
        signatures.setWidthPercentage(100);

        signatures.addCell(signature("Class Coordinator"));
        signatures.addCell(signature("Head of Department"));
        signatures.addCell(signature("Dean Academic Affairs"));

        document.add(signatures);

        document.close();
        return out.toByteArray();
    }

    public static byte[] generateAttendanceAnalysisReport(
            String department,
            String semester,
            List<AttendanceReportDTO> students) throws Exception {

        Document document = new Document(PageSize.A4.rotate(),72,72,90,72);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter writer = PdfWriter.getInstance(document, out);
        writer.setPageEvent(new HeaderFooterPageEvent());

        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD,18);
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD,12);
        Font legendFont = FontFactory.getFont(FontFactory.HELVETICA,10);

        Paragraph title = new Paragraph(
                "STUDENT ATTENDANCE ANALYSIS REPORT - SEMESTER " + semester,
                titleFont);
        title.setAlignment(Element.ALIGN_CENTER);

        Paragraph deptInfo = new Paragraph(
                "Department: " + department,
                headerFont);
        deptInfo.setAlignment(Element.ALIGN_CENTER);

        Paragraph authority = new Paragraph(
                "Office of the Controller of Examinations",
                legendFont);
        authority.setAlignment(Element.ALIGN_CENTER);

        document.add(title);
        document.add(deptInfo);
        document.add(authority);
        document.add(new Paragraph(" "));

        Paragraph legend = new Paragraph(
                "Attendance % = (Classes Attended / Total Classes) × 100\n" +
                "Predictive Status: SAFE / CAN COVER / CANNOT COVER.",
                legendFont);

        legend.setSpacingAfter(15);
        document.add(legend);

        // -------- SUMMARY --------

        int totalStudents = students.size();
        int safe = 0;
        int canCover = 0;
        int cannotCover = 0;

        for (AttendanceReportDTO s : students) {
            if ("SAFE".equalsIgnoreCase(s.predictiveStatus)) safe++;
            else if ("CAN COVER".equalsIgnoreCase(s.predictiveStatus)) canCover++;
            else cannotCover++;
        }

        PdfPTable summary = new PdfPTable(2);
        summary.setWidthPercentage(40);
        summary.setSpacingAfter(15);
        summary.setWidths(new float[]{3f,1f});

        Font summaryFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD,11);

        summary.addCell(summaryCell("Total Students", summaryFont));
        summary.addCell(summaryCell(String.valueOf(totalStudents), summaryFont));

        summary.addCell(summaryCell("Safe (Eligible)", summaryFont));
        summary.addCell(summaryCell(String.valueOf(safe), summaryFont));

        summary.addCell(summaryCell("Can Cover (Conditional)", summaryFont));
        summary.addCell(summaryCell(String.valueOf(canCover), summaryFont));

        summary.addCell(summaryCell("Cannot Cover", summaryFont));
        summary.addCell(summaryCell(String.valueOf(cannotCover), summaryFont));

        document.add(summary);

        PdfPTable table = new PdfPTable(9);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10);
        table.setSpacingAfter(15);

        table.setWidths(new float[]{2f,4f,3f,3f,2f,2f,2f,2f,2f});
        table.setHeaderRows(1);

        addHeader(table,"Roll No");
        addHeader(table,"Student Name");
        addHeader(table,"Program");
        addHeader(table,"Course");
        addHeader(table,"Attendance %");
        addHeader(table,"Present");
        addHeader(table,"Total");
        addHeader(table,"Remaining");
        addHeader(table,"Status");

        boolean alternate=false;

        for(AttendanceReportDTO s : students){

            BaseColor rowColor =
                    alternate ? new BaseColor(245,245,245) : BaseColor.WHITE;

            table.addCell(cell(s.rollNo,rowColor));
            table.addCell(cell(s.name,rowColor));
            table.addCell(cell(s.department,rowColor));
            table.addCell(cell(s.course,rowColor));

            table.addCell(cell(
                    String.format("%.2f%%", s.attendancePercentage),
                    rowColor));

            table.addCell(cell(String.valueOf(s.presentClasses),rowColor));
            table.addCell(cell(String.valueOf(s.totalClasses),rowColor));
            table.addCell(cell(String.valueOf(s.remainingClasses),rowColor));

            table.addCell(analysisStatusCell(s.predictiveStatus,rowColor));

            alternate=!alternate;
        }

        document.add(table);
        document.add(new Paragraph("\n\n"));

        PdfPTable signatures = new PdfPTable(3);
        signatures.setWidthPercentage(100);

        signatures.addCell(signature("Class Coordinator"));
        signatures.addCell(signature("Head of Department"));
        signatures.addCell(signature("Dean Academic Affairs"));

        document.add(signatures);

        document.close();
        return out.toByteArray();
    }

    private static PdfPCell analysisStatusCell(String status,BaseColor rowColor){

        if(status==null) status="UNKNOWN";

        Font font=FontFactory.getFont(FontFactory.HELVETICA_BOLD,10);

        BaseColor bg=rowColor;

        if("CANNOT COVER".equalsIgnoreCase(status)){
            bg=new BaseColor(200,0,0);
            font.setColor(BaseColor.WHITE);
        }
        else if("CAN COVER".equalsIgnoreCase(status)){
            bg=new BaseColor(255,240,150);
            font.setColor(BaseColor.BLACK);
        }
        else{
            bg=new BaseColor(0,150,0);
            font.setColor(BaseColor.WHITE);
        }

        PdfPCell cell=new PdfPCell(new Phrase(status,font));

        cell.setBackgroundColor(bg);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(6);

        return cell;
    }

    private static void addHeader(PdfPTable table,String text){

        Font font=FontFactory.getFont(FontFactory.HELVETICA_BOLD,11);

        PdfPCell cell=new PdfPCell(new Phrase(text,font));

        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(new BaseColor(220,220,220));
        cell.setPadding(8);

        table.addCell(cell);
    }

    private static PdfPCell cell(String text,BaseColor color){

        if(text==null) text="-";

        PdfPCell cell=new PdfPCell(new Phrase(text));

        cell.setPadding(6);
        cell.setBackgroundColor(color);
        cell.setBorderWidth(1);

        try{
            Double.parseDouble(text.replace("%",""));
            cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        }
        catch(Exception e){
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        }

        return cell;
    }

    private static PdfPCell statusCell(String status,BaseColor rowColor){

        if(status==null) status="UNKNOWN";

        Font font=FontFactory.getFont(FontFactory.HELVETICA_BOLD,10);

        BaseColor bg=rowColor;

        if("NOT ELIGIBLE".equalsIgnoreCase(status)){
            bg=new BaseColor(200,0,0);
            font.setColor(BaseColor.WHITE);
        }
        else if("CAN COVER".equalsIgnoreCase(status)){
            bg=new BaseColor(255,240,150);
            font.setColor(BaseColor.BLACK);
        }
        else{
            bg=new BaseColor(0,150,0);
            font.setColor(BaseColor.WHITE);
        }

        PdfPCell cell=new PdfPCell(new Phrase(status,font));

        cell.setBackgroundColor(bg);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(6);

        return cell;
    }

    private static PdfPCell signature(String role){

        PdfPCell cell=new PdfPCell();

        cell.addElement(new Paragraph("\n\n\n"));
        cell.addElement(new Paragraph("________________________"));
        cell.addElement(new Paragraph(role));

        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        return cell;
    }
    private static PdfPCell summaryCell(String text, Font font) {

    PdfPCell cell = new PdfPCell(new Phrase(text, font));

    cell.setPadding(6);
    cell.setBorderWidth(1);

    return cell;
}
}