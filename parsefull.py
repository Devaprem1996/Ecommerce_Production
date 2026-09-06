import zipfile
import xml.etree.ElementTree as ET
import json

def parse_full_xlsx(file_path):
    try:
        with zipfile.ZipFile(file_path, 'r') as z:
            # Get shared strings
            shared_strings = []
            if 'xl/sharedStrings.xml' in z.namelist():
                ss_data = z.read('xl/sharedStrings.xml')
                root = ET.fromstring(ss_data)
                ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
                for t in root.findall('.//ns:t', ns):
                    shared_strings.append(t.text if t.text else "")
            
            # Read sheet1.xml
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
                
                # Let's structure the products by category
                categories = {}
                current_category = "Uncategorized"
                
                for row in rows:
                    # Clean empty columns at the end
                    while row and row[-1] == "":
                        row.pop()
                    if not row:
                        continue
                    
                    # If it's a single item in the row, it might be a new category header
                    if len(row) == 1:
                        current_category = row[0]
                        categories[current_category] = []
                    else:
                        # It's a product
                        # Format: [English Name, Tamil Name, Variant1, Variant2, ...]
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
                
                with open("parsed_products.json", "w", encoding="utf-8") as f:
                    json.dump(categories, f, ensure_ascii=False, indent=2)
                
                # Print summary
                print(f"Total categories found: {len(categories)}")
                for cat, prods in categories.items():
                    print(f"- {cat}: {len(prods)} products")
                    
            else:
                print("sheet1.xml not found")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    parse_full_xlsx("ProductListForWebsite.xlsx")
