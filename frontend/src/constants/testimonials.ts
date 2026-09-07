export interface TestimonialItem {
  id: string;
  name: string;
  location: string;
  rating: number;
  quote: string;
  quoteTamil: string;
  initial: string;
  avatar?: string;
}

/**
 * Customer reviews rendered in the homepage "What Our Customers Say" carousel
 * and the Overview page "Customer Reviews" section.
 *
 * IMPORTANT: these are PLACEHOLDER / SAMPLE testimonials. Replace them with
 * real customer reviews (name, location, star rating, quote in English and
 * Tamil) before launch. Pick one initial per reviewer for the fallback avatar;
 * add a real avatar URL (optional, square crop) if a photo is available.
 */
export const customerTestimonials: TestimonialItem[] = [
  {
    id: 'test-1',
    name: 'Priya Krishnan',
    location: 'Chennai',
    rating: 5,
    quote: 'The organic vegetables are so fresh, it reminds me of my grandmother’s farm. The taste is completely different from market vegetables!',
    quoteTamil: 'இயற்கை காய்கறிகள் மிகவும் புதியவை, இது எனது பாட்டியின் பண்ணையை நினைவூட்டுகிறது. சந்தை காயறிகளை விட இதன் சுவை முற்றிலும் மாறுபட்டது!',
    initial: 'P',
  },
  {
    id: 'test-2',
    name: 'Rahul Sharma',
    location: 'Coimbatore',
    rating: 5,
    quote: 'Lab testing reports on every product give me absolute peace of mind. The raw mountain honey is stellar and incredibly pure.',
    quoteTamil: 'ஒவ்வொரு பொருளின் மீதான ஆய்வக சோதனை அறிக்கைகளும் எனக்கு முழுமையான மன அமைதியைத் தருகிறது. மலைத் தேன் மிக அற்புதமானது!',
    initial: 'R',
  },
  {
    id: 'test-3',
    name: 'Anjali Mukund',
    location: 'Madurai',
    rating: 5,
    quote: 'Incredible delivery speed and fully biodegradable eco-friendly packaging. Highly recommend to anyone seeking authentic organic foods.',
    quoteTamil: 'நம்பமுடியாத விநியோக வேகம் மற்றும் முழுமையாக மட்கக்கூடிய பேக்கேஜிங். உண்மையான இயற்கை உணவுகளைத் தேடுவோருக்கு இதைப் பரிந்துரைக்கிறேன்.',
    initial: 'A',
  },
];