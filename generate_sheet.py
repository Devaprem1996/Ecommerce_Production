import zipfile
import xml.etree.ElementTree as ET
import csv

def generate_csv_collection_sheet(file_path):
    print(f"Reading original sheet: {file_path}...")
    try:
        with zipfile.ZipFile(file_path, 'r') as z:
            # 1. Parse shared strings for cell values
            shared_strings = []
            if 'xl/sharedStrings.xml' in z.namelist():
                ss_data = z.read('xl/sharedStrings.xml')
                root = ET.fromstring(ss_data)
                ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
                for t in root.findall('.//ns:t', ns):
                    shared_strings.append(t.text if t.text else "")
            
            # 2. Parse sheet1.xml
            if 'xl/worksheets/sheet1.xml' in z.namelist():
                sheet_data = z.read('xl/worksheets/sheet1.xml')
                root = ET.fromstring(sheet_data)
                ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
                
                rows = []
                for row_el in root.findall('.//ns:row', ns):
                    row_data = []
                    for c_el in row_el.findall('ns:c', ns):
                        val_el = c_el.find('ns:v', ns)
                        val = ""
                        if val_el is not None:
                            val = val_el.text
                            if c_el.attrib.get('t') == 's':
                                idx = int(val)
                                val = shared_strings[idx] if idx < len(shared_strings) else val
                        row_data.append(val.strip())
                    rows.append(row_data)
                
                # 3. Structure products by category
                categories = {}
                current_category = "Uncategorized"
                
                for row in rows:
                    while row and row[-1] == "":
                        row.pop()
                    if not row:
                        continue
                    
                    if len(row) == 1:
                        current_category = row[0]
                        categories[current_category] = []
                    else:
                        eng_name = row[0]
                        tam_name = row[1] if len(row) > 1 else ""
                        variants = row[2:] if len(row) > 2 else []
                        
                        if current_category not in categories:
                            categories[current_category] = []
                            
                        categories[current_category].append({
                            "name_en": eng_name,
                            "name_ta": tam_name,
                            "variants": variants
                        })
                
                # 4. Write data collection sheet
                # UTF-8 BOM encoding ensures Excel displays Tamil characters correctly on Windows
                output_file = "Yathu_Iyarkaiyagam_Data_Collection.csv"
                headers = [
                    "Category (வகை)",
                    "Product Name [English] (பொருள் பெயர் [ஆங்கிலம்])",
                    "Product Name [Tamil] (பொருள் பெயர் [தமிழ்])",
                    "Variant / Pack Size (அளவு)",
                    "Price in INR (விலை ₹) *[REQUIRED]*",
                    "Discount Price in INR (தள்ளுபடி விலை ₹)",
                    "Description [English] (விளக்கம் [ஆங்கிலம்]) *[REQUIRED]*",
                    "Description [Tamil] (விளக்கம் [தமிழ்]) *[REQUIRED]*",
                    "Is Organic? (இயற்கையானதா?) [YES / NO]",
                    "Is Lab Tested? (ஆய்வக சோதனை செய்யப்பட்டதா?) [YES / NO]",
                    "Stock Available [Quantity] (இருப்பு அளவு) *[REQUIRED]*",
                    "Tax / GST % (வரி %)"
                ]
                
                row_count = 0
                with open(output_file, "w", encoding="utf-8-sig", newline="") as f:
                    writer = csv.writer(f)
                    writer.writerow(headers)
                    
                    for cat, products in categories.items():
                        for prod in products:
                            # If no variants are defined, add at least one default row
                            variants = prod["variants"] if prod["variants"] else ["Standard"]
                            for var in variants:
                                writer.writerow([
                                    cat,
                                    prod["name_en"],
                                    prod["name_ta"],
                                    var,
                                    "",  # Price
                                    "",  # Discount Price
                                    "",  # Description EN
                                    "",  # Description TA
                                    "YES",  # Is Organic (default YES)
                                    "YES",  # Is Lab Tested (default YES)
                                    "100",  # Stock Available (default 100)
                                    "5"  # Tax / GST (default 5)
                                ])
                                row_count += 1
                                
                print(f"\nSuccessfully generated '{output_file}' with {row_count} variant rows!")
                print("Your client can open this file directly in Microsoft Excel, Google Sheets, or LibreOffice, fill in the data, and save it back.")
            else:
                print("sheet1.xml not found in Excel archive.")
    except Exception as e:
        print(f"Error generating sheet: {e}")

if __name__ == "__main__":
    generate_csv_collection_sheet("ProductListForWebsite.xlsx")
