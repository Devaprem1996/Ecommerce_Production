import csv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def generate_costing_excel():
    excel_filename = "Hostinger_Cloudinary_Costing_Matrix.xlsx"
    csv_filename = "Hostinger_Cloudinary_Costing_Matrix.csv"

    wb = openpyxl.Workbook()
    
    # ----------------------------------------------------
    # Styling Definitions
    # ----------------------------------------------------
    font_family = "Calibri"
    
    title_font = Font(name=font_family, size=16, bold=True, color="1E3A8A")
    subtitle_font = Font(name=font_family, size=11, italic=True, color="4B5563")
    
    header_font = Font(name=font_family, size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    
    section_font = Font(name=font_family, size=12, bold=True, color="1E3A8A")
    section_fill = PatternFill(start_color="E0F2FE", end_color="E0F2FE", fill_type="solid")
    
    total_font = Font(name=font_family, size=11, bold=True, color="065F46")
    total_fill = PatternFill(start_color="D1FAE5", end_color="D1FAE5", fill_type="solid")
    
    bold_font = Font(name=font_family, size=11, bold=True)
    regular_font = Font(name=font_family, size=11)
    
    align_left = Alignment(horizontal="left", vertical="center", wrap_text=True)
    align_center = Alignment(horizontal="center", vertical="center")
    align_right = Alignment(horizontal="right", vertical="center")
    
    thin_border = Border(
        left=Side(style='thin', color='E5E7EB'),
        right=Side(style='thin', color='E5E7EB'),
        top=Side(style='thin', color='E5E7EB'),
        bottom=Side(style='thin', color='E5E7EB')
    )
    
    thick_bottom_border = Border(
        left=Side(style='thin', color='E5E7EB'),
        right=Side(style='thin', color='E5E7EB'),
        top=Side(style='thin', color='E5E7EB'),
        bottom=Side(style='medium', color='1E3A8A')
    )

    # ----------------------------------------------------
    # TAB 1: Cost Summary & Comparison
    # ----------------------------------------------------
    ws1 = wb.active
    ws1.title = "Costing Summary"
    ws1.views.sheetView[0].showGridLines = True

    ws1.cell(row=1, column=1, value="Yathu Arokiyagam - Infrastructure Costing Matrix").font = title_font
    ws1.cell(row=2, column=1, value="Cost comparison and projections for Hostinger VPS & Cloudinary Image Storage").font = subtitle_font

    headers1 = [
        "Item / Service",
        "Provider",
        "Tier / Plan Details",
        "Monthly Cost (₹ INR)",
        "Annual Cost (₹ INR)",
        "Payment Term",
        "Notes & Inclusions"
    ]

    ws1.append([]) # Row 3 empty
    
    # Write Headers at Row 4
    for col_idx, header in enumerate(headers1, start=1):
        cell = ws1.cell(row=4, column=col_idx, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = align_center

    cost_data = [
        # Hosting Section
        {"type": "section", "title": "1. Server Hosting (Hostinger VPS Options)"},
        {"item": "Hostinger VPS Option 1 (KVM 1)", "provider": "Hostinger", "details": "1 vCPU, 4GB RAM, 50GB NVMe SSD, 4TB Bandwidth", "monthly": 499, "annual": 5988, "term": "12 Months", "notes": "Ideal budget plan for launch & initial traffic (<10k visits/mo)"},
        {"item": "Hostinger VPS Option 2 (KVM 2 - Recommended)", "provider": "Hostinger", "details": "2 vCPU, 8GB RAM, 100GB NVMe SSD, 8TB Bandwidth", "monthly": 699, "annual": 8388, "term": "12 Months", "notes": "Recommended for high speed, peak traffic & database queries"},
        {"item": "Domain Name (.in)", "provider": "Hostinger / Namecheap", "details": "e.g. yathuarokiyagam.in", "monthly": 0, "annual": 0, "term": "1st Year Free", "notes": "Free domain included with Hostinger VPS 1-yr plan (Renewal ~₹599/yr)"},

        # Cloudinary Section
        {"type": "section", "title": "2. Image Storage & Delivery (Cloudinary)"},
        {"item": "Cloudinary Free Tier (Production)", "provider": "Cloudinary", "details": "25 Credits / 25GB Storage / 25k Transformations", "monthly": 0, "annual": 0, "term": "Free Forever", "notes": "Covers all 85 catalog products (~250 images / 50MB) + 10k visits/mo"},
        {"item": "Cloudinary Plus Tier (Optional Scale)", "provider": "Cloudinary", "details": "225 Credits / 225GB Storage & Bandwidth", "monthly": 7400, "annual": 88800, "term": "Monthly ($89/mo)", "notes": "Only required if website scales past 100,000 active visits/month"},

        # Database & Extras Section
        {"type": "section", "title": "3. Database, Security & Messaging"},
        {"item": "PostgreSQL 14 Database", "provider": "Self-Hosted (VPS)", "details": "Hosted on Hostinger VPS Ubuntu 22.04 LTS", "monthly": 0, "annual": 0, "term": "Included", "notes": "Zero additional database license cost"},
        {"item": "SSL Encryption Certificate", "provider": "Let's Encrypt / Hostinger", "details": "Wildcard HTTPS SSL Certificate", "monthly": 0, "annual": 0, "term": "Free Lifetime", "notes": "Auto-renewed SSL security for domain & subdomains"},
        {"item": "Transactional Email (Orders)", "provider": "Brevo / Hostinger Email", "details": "300 free emails/day for order confirmations", "monthly": 0, "annual": 0, "term": "Free Tier", "notes": "Covers customer receipts and admin notifications"},

        # Totals Section
        {"type": "total", "title": "TOTAL COST (Option 1 - KVM 1 VPS + Cloudinary Free Tier)", "monthly": 499, "annual": 5988, "notes": "Best budget start: Full e-commerce stack for ~₹5,988/year total"},
        {"type": "total", "title": "TOTAL COST (Option 2 - KVM 2 VPS + Cloudinary Free Tier)", "monthly": 699, "annual": 8388, "notes": "Recommended production setup: High performance for ~₹8,388/year total"}
    ]

    current_row = 5
    for entry in cost_data:
        if "type" in entry and entry["type"] == "section":
            cell = ws1.cell(row=current_row, column=1, value=entry["title"])
            cell.font = section_font
            cell.fill = section_fill
            ws1.merge_cells(start_row=current_row, start_column=1, end_row=current_row, end_column=7)
            current_row += 1
        elif "type" in entry and entry["type"] == "total":
            ws1.cell(row=current_row, column=1, value=entry["title"]).font = total_font
            ws1.cell(row=current_row, column=2, value="—").font = total_font
            ws1.cell(row=current_row, column=3, value="Full Production Stack").font = total_font
            
            c_m = ws1.cell(row=current_row, column=4, value=entry["monthly"])
            c_m.font = total_font
            c_m.number_format = "₹#,##0"
            c_m.alignment = align_right

            c_a = ws1.cell(row=current_row, column=5, value=entry["annual"])
            c_a.font = total_font
            c_a.number_format = "₹#,##0"
            c_a.alignment = align_right

            ws1.cell(row=current_row, column=6, value="1st Year").font = total_font
            ws1.cell(row=current_row, column=7, value=entry["notes"]).font = total_font

            for c in range(1, 8):
                ws1.cell(row=current_row, column=c).fill = total_fill
                ws1.cell(row=current_row, column=c).border = thick_bottom_border

            current_row += 1
        else:
            ws1.cell(row=current_row, column=1, value=entry["item"]).font = bold_font
            ws1.cell(row=current_row, column=2, value=entry["provider"]).font = regular_font
            ws1.cell(row=current_row, column=3, value=entry["details"]).font = regular_font
            
            c_m = ws1.cell(row=current_row, column=4, value=entry["monthly"])
            c_m.font = regular_font
            c_m.number_format = "₹#,##0"
            c_m.alignment = align_right

            c_a = ws1.cell(row=current_row, column=5, value=entry["annual"])
            c_a.font = regular_font
            c_a.number_format = "₹#,##0"
            c_a.alignment = align_right

            ws1.cell(row=current_row, column=6, value=entry["term"]).font = regular_font
            ws1.cell(row=current_row, column=7, value=entry["notes"]).font = regular_font

            for c in range(1, 8):
                ws1.cell(row=current_row, column=c).border = thin_border

            current_row += 1

    # ----------------------------------------------------
    # TAB 2: Cloudinary Capacity & Usage Estimation
    # ----------------------------------------------------
    ws2 = wb.create_sheet(title="Cloudinary Analysis")
    ws2.views.sheetView[0].showGridLines = True

    ws2.cell(row=1, column=1, value="Cloudinary Free Tier Capacity Analysis").font = title_font
    ws2.cell(row=2, column=1, value="Estimated resource consumption for Yathu Arokiyagam (85 Products Catalog)").font = subtitle_font

    headers2 = ["Metric / Parameter", "Catalog Estimate", "Cloudinary Free Tier Limit", "Free Tier Usage %", "Status & Conclusion"]
    ws2.append([])

    for col_idx, header in enumerate(headers2, start=1):
        cell = ws2.cell(row=4, column=col_idx, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = align_center

    cloud_metrics = [
        ("Total Catalog Products", "85 Products", "N/A", "N/A", "Complete Catalog Covered"),
        ("Images per Product", "3 Photos (Front, Back, Packaging)", "N/A", "N/A", "Standard E-Commerce Listing"),
        ("Total Images Stored", "255 Images", "N/A", "N/A", "Full Media Assets"),
        ("Average Image Size (Optimized WebP/JPG)", "200 KB per photo", "N/A", "N/A", "Auto-compressed by Cloudinary"),
        ("Total Image Storage Used", "51 MB (0.05 GB)", "25 GB Storage", "0.20%", "EXCELLENT (< 1% of Limit)"),
        ("Estimated Monthly Store Visitors", "10,000 Visitors / Month", "N/A", "N/A", "Initial Launch Estimate"),
        ("Monthly Image Bandwidth Transfer", "2.55 GB / Month", "25 GB Net Bandwidth", "10.20%", "VERY SAFE (Free Tier)"),
        ("Monthly Dynamic Image Transformations", "~1,000 Transformations", "25,000 Transformations", "4.00%", "SAFE (Free Tier)")
    ]

    r_idx = 5
    for metric, est, limit, usage, status in cloud_metrics:
        ws2.cell(row=r_idx, column=1, value=metric).font = bold_font
        ws2.cell(row=r_idx, column=2, value=est).font = regular_font
        ws2.cell(row=r_idx, column=3, value=limit).font = regular_font
        
        u_cell = ws2.cell(row=r_idx, column=4, value=usage)
        u_cell.font = bold_font
        u_cell.alignment = align_center
        if "0." in usage or "4." in usage or "10." in usage:
            u_cell.fill = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")

        s_cell = ws2.cell(row=r_idx, column=5, value=status)
        s_cell.font = bold_font
        s_cell.alignment = align_left

        for c in range(1, 6):
            ws2.cell(row=r_idx, column=c).border = thin_border
        r_idx += 1

    # ----------------------------------------------------
    # TAB 3: Hostinger VPS Tier Comparison
    # ----------------------------------------------------
    ws3 = wb.create_sheet(title="Hostinger VPS Comparison")
    ws3.views.sheetView[0].showGridLines = True

    ws3.cell(row=1, column=1, value="Hostinger VPS Server Specification Comparison").font = title_font
    ws3.cell(row=2, column=1, value="Evaluating server specs for Node.js Express + PostgreSQL + Next.js").font = subtitle_font

    headers3 = ["Specification / Feature", "Hostinger KVM 1 VPS", "Hostinger KVM 2 VPS (Recommended)", "Hostinger KVM 4 VPS"]
    ws3.append([])

    for col_idx, header in enumerate(headers3, start=1):
        cell = ws3.cell(row=4, column=col_idx, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = align_center

    vps_features = [
        ("vCPU Cores", "1 vCPU Core", "2 vCPU Cores", "4 vCPU Cores"),
        ("RAM (System Memory)", "4 GB RAM", "8 GB RAM", "16 GB RAM"),
        ("NVMe SSD Disk Storage", "50 GB NVMe", "100 GB NVMe", "200 GB NVMe"),
        ("Monthly Bandwidth", "4 TB", "8 TB", "16 TB"),
        ("Est. Monthly Price (1-Year Plan)", "₹499 / Month", "₹699 / Month", "₹1,299 / Month"),
        ("Est. Annual Total (1-Year Plan)", "₹5,988 / Year", "₹8,388 / Year", "₹15,588 / Year"),
        ("Domain Name (.in / .com)", "FREE (1st Year)", "FREE (1st Year)", "FREE (1st Year)"),
        ("Dedicated IP Address", "1 Dedicated IPv4 & IPv6", "1 Dedicated IPv4 & IPv6", "1 Dedicated IPv4 & IPv6"),
        ("PostgreSQL DB Performance", "Good (Basic workloads)", "Excellent (Smooth queries & caching)", "High Throughput"),
        ("Recommended Traffic Range", "< 10,000 Visitors / Mo", "10,000 – 50,000 Visitors / Mo", "50,000+ Visitors / Mo")
    ]

    r_idx = 5
    for feat, k1, k2, k4 in vps_features:
        ws3.cell(row=r_idx, column=1, value=feat).font = bold_font
        ws3.cell(row=r_idx, column=2, value=k1).font = regular_font
        
        k2_cell = ws3.cell(row=r_idx, column=3, value=k2)
        k2_cell.font = bold_font
        k2_cell.fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")

        ws3.cell(row=r_idx, column=4, value=k4).font = regular_font

        for c in range(1, 5):
            ws3.cell(row=r_idx, column=c).border = thin_border
        r_idx += 1

    # ----------------------------------------------------
    # Auto-adjust column widths across all sheets
    # ----------------------------------------------------
    for ws in [ws1, ws2, ws3]:
        for col in ws.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                if cell.value:
                    lines = str(cell.value).split("\n")
                    for line in lines:
                        if len(line) > max_len:
                            max_len = len(line)
            ws.column_dimensions[col_letter].width = max(max_len + 4, 14)

    # Save Excel file
    wb.save(excel_filename)
    print(f"Successfully generated Excel Workbook: {excel_filename}")

    # Generate CSV export of Costing Summary
    with open(csv_filename, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(["Yathu Arokiyagam - Infrastructure Costing Matrix"])
        writer.writerow(headers1)
        for entry in cost_data:
            if "type" in entry and entry["type"] == "section":
                writer.writerow([entry["title"], "", "", "", "", "", ""])
            elif "type" in entry and entry["type"] == "total":
                writer.writerow([entry["title"], "—", "Full Production Stack", f"₹{entry['monthly']}", f"₹{entry['annual']}", "1st Year", entry["notes"]])
            else:
                writer.writerow([entry["item"], entry["provider"], entry["details"], f"₹{entry['monthly']}", f"₹{entry['annual']}", entry["term"], entry["notes"]])

    print(f"Successfully generated CSV Export: {csv_filename}")

if __name__ == "__main__":
    generate_costing_excel()
