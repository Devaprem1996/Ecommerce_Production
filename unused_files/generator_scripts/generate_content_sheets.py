import csv
import json
import os

LOCALE_DIR = os.path.join(os.path.dirname(__file__), "frontend", "locales")


def load_locales():
    with open(os.path.join(LOCALE_DIR, "en.json"), encoding="utf-8") as f:
        en = json.load(f)
    with open(os.path.join(LOCALE_DIR, "ta.json"), encoding="utf-8") as f:
        ta = json.load(f)
    return en, ta


def generate_content_and_pincode_sheets():
    en, ta = load_locales()

    # 1. Generate Store Content Sheet
    content_file = "Yathu_Arokiyagam_Store_Content.csv"
    content_headers = [
        "Section / Page (பிரிவு)",
        "Field Name / Key (புலம்)",
        "Context / Instruction (விளக்கம்)",
        "English Value (ஆங்கில மதிப்பு) *[REQUIRED]*",
        "Tamil Value (தமிழ் மதிப்பு) *[REQUIRED]*"
    ]

    content_rows = [
        # Store settings
        ["General Settings", "Official Store Name", "Name of the e-commerce store", "Yathu Arokiyagam", "யது ஆரோக்கியகம்"],
        ["General Settings", "Brand Slogan", "Slogan displayed on banners", en["about"]["subtitle"], ta["about"]["subtitle"]],
        ["General Settings", "Support Phone Number", "Customer care mobile/landline", "+91-88701 59766", "+91-88701 59766"],
        ["General Settings", "WhatsApp Support Number", "WhatsApp number for orders/notifications", "+91-88701 59766", "+91-88701 59766"],
        ["General Settings", "Support Email Address", "Official email address for support", "yathuarokiyagam@gmail.com", "yathuarokiyagam@gmail.com"],
        ["General Settings", "Physical Address", "Full business/factory address", "#402, Seepalakottai Road, Chinnmanur, Theni District, TamilNadu - 625515", "அஞ்சல் எண் 402, சீப்பாலக்கோட்டை சாலை, சின்னமனூர், தேனி மாவட்டம், தமிழ்நாடு - 625515"],
        ["General Settings", "Working Hours", "Customer service hours", en["contact"]["biz_hours_val"], "திங்கள் - சனி: காலை 9:00 - மாலை 6:00"],
        ["Social Media Links", "Instagram URL", "Link to Instagram page", "", ""],
        ["Social Media Links", "Facebook URL", "Link to Facebook page", "", ""],
        ["Social Media Links", "YouTube URL", "Link to YouTube channel", "", ""],

        # About Us page
        ["About Us Page", "Our Story (Title)", "Title of story section", en["about"]["story_title"], ta["about"]["story_title"]],
        ["About Us Page", "Our Story (Paragraph)", "Brief history & description of the store", en["about"]["our_story_desc"], ta["about"]["our_story_desc"]],
        ["About Us Page", "Our Mission (Title)", "Title of mission section", en["about"]["mission_title"], ta["about"]["mission_title"]],
        ["About Us Page", "Our Mission (Paragraph)", "Core purpose of the business", en["about"]["mission_desc"], ta["about"]["mission_desc"]],

        # Core Values
        ["About Us Page - Values", "Value 1: Title", "Title of first core value", en["about"]["value_heritage"], ta["about"]["value_heritage"]],
        ["About Us Page - Values", "Value 1: Description", "Details of value 1", en["about"]["value_heritage_desc"], ta["about"]["value_heritage_desc"]],
        ["About Us Page - Values", "Value 2: Title", "Title of second core value", en["about"]["value_wisdom"], ta["about"]["value_wisdom"]],
        ["About Us Page - Values", "Value 2: Description", "Details of value 2", en["about"]["value_wisdom_desc"], ta["about"]["value_wisdom_desc"]],
        ["About Us Page - Values", "Value 3: Title", "Title of third core value", en["about"]["value_dna"], ta["about"]["value_dna"]],
        ["About Us Page - Values", "Value 3: Description", "Details of value 3", en["about"]["value_dna_desc"], ta["about"]["value_dna_desc"]],
        ["About Us Page - Values", "Value 4: Title", "Title of fourth core value", en["about"]["value_vitality"], ta["about"]["value_vitality"]],
        ["About Us Page - Values", "Value 4: Description", "Details of value 4", en["about"]["value_vitality_desc"], ta["about"]["value_vitality_desc"]],

        # Timeline
        ["About Us Page - Timeline", "Timeline 2020", "Milestone achieved in 2020", en["about"]["timeline_2020"], ta["about"]["timeline_2020"]],
        ["About Us Page - Timeline", "Timeline 2022", "Milestone achieved in 2022", en["about"]["timeline_2022"], ta["about"]["timeline_2022"]],
        ["About Us Page - Timeline", "Timeline 2024", "Milestone achieved in 2024", en["about"]["timeline_2024"], ta["about"]["timeline_2024"]],
        ["About Us Page - Timeline", "Timeline 2026", "Milestone achieved in 2026", en["about"]["timeline_2026"], ta["about"]["timeline_2026"]],

        # Policies
        ["Policies", "Shipping Timeframe Details", "Standard delivery transit times info", en["policies"]["shipping_timeframe"], ta["policies"]["shipping_timeframe"]],
        ["Policies", "Return Eligibility Days", "How many days client allows for return (Default 7)", en["policies"]["return_days"], ta["policies"]["return_days"]],
        ["Policies", "Return Policy Rules", "Acceptable reasons & refund details", en["policies"]["return_refund_rule"], ta["policies"]["return_refund_rule"]],
    ]

    with open(content_file, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(content_headers)
        writer.writerows(content_rows)
    print(f"Generated '{content_file}' successfully.")

    # 2. Generate Pincodes Setup Sheet
    pincode_file = "Yathu_Arokiyagam_Pincodes_Setup.csv"
    pincode_headers = [
        "Pincode (அஞ்சல் குறியீடு) *[REQUIRED]*",
        "City (நகரம்)",
        "State (மாநிலம்)",
        "Delivery Available? (விநியோகம் உள்ளதா?) [YES / NO]",
        "Estimated Days (மதிப்பிடப்பட்ட நாட்கள்)",
        "Shipping Charge in INR (டெலிவரி கட்டணம் ₹)",
        "Free Delivery Threshold in INR (இலவச டெலிவரி வரம்பு ₹)"
    ]

    pincode_rows = [
        ["600001", "Chennai", "Tamil Nadu", "YES", "2", "40", "499"],
        ["600002", "Chennai", "Tamil Nadu", "YES", "2", "40", "499"],
        ["625001", "Madurai", "Tamil Nadu", "YES", "3", "50", "599"],
        ["625515", "Chinnmanur", "Tamil Nadu", "YES", "2", "40", "499"],
        ["625531", "Theni", "Tamil Nadu", "YES", "2", "40", "499"],
        ["641001", "Coimbatore", "Tamil Nadu", "YES", "2", "45", "499"],
        ["620001", "Tiruchirappalli", "Tamil Nadu", "YES", "3", "45", "499"],
        ["560001", "Bengaluru", "Karnataka", "YES", "4", "70", "799"],
        ["682001", "Kochi", "Kerala", "YES", "4", "70", "799"],
    ]

    with open(pincode_file, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(pincode_headers)
        writer.writerows(pincode_rows)
        # Add empty rows for client convenience
        for _ in range(15):
            writer.writerow(["", "", "", "YES", "", "", ""])
    print(f"Generated '{pincode_file}' successfully.")


if __name__ == "__main__":
    generate_content_and_pincode_sheets()