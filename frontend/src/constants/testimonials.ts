export interface TestimonialItem {
  id: string;
  name: string;
  role?: string;
  company?: string;
  location: string;
  rating: number;
  quote: string;
  quoteTamil: string;
  initial: string;
  avatar?: string;
}

/**
 * Customer reviews rendered in the homepage Testimonials showcase
 * and Overview page Customer Reviews section.
 */
export const customerTestimonials: TestimonialItem[] = [
  {
    id: 'test-1',
    name: 'Karthik Subramanian',
    role: 'Founder, GreenRoot Tech',
    location: 'Chennai',
    rating: 5,
    quote: "After spending months trying to find truly unadulterated cold-pressed oils and raw honey that our family could trust, we switched to Yathu Arokiyagam and all that anxiety vanished. We kind of wish we’d made that decision earlier.",
    quoteTamil: 'பல மாதங்களாக எங்கள் குடும்பம் நம்பக்கூடிய தூய மரச்செக்கு எண்ணெய் மற்றும் தேனைத் தேடி அலைந்த பிறகு, யாத்து ஆரோக்கியகத்திற்கு மாறினோம். அந்த கலப்படம் குறித்த கவலைகள் அனைத்தும் விலகியது. இந்த முடிவை முன்பே எடுத்திருக்கலாம் என்று தோன்றுகிறது.',
    initial: 'K',
    avatar: '/images/testimonial-1.jpg',
  },
  {
    id: 'test-2',
    name: 'Priya Sundaresan',
    role: 'Clinical Nutritionist & Author',
    location: 'Coimbatore',
    rating: 5,
    quote: 'Seeing QR-verified lab test certificates transparently provided for each batch gave me instant confidence. The raw mountain honey and traditional wood-pressed sesame oil are unquestionably pure and rich in aroma.',
    quoteTamil: 'ஒவ்வொரு தொகுப்பிற்கும் QR மூலம் சரிபார்க்கப்பட்ட ஆய்வக சான்றிதழ்கள் வெளிப்படையாக வழங்கப்படுவதைக் கண்டு உடனடியாக நம்பிக்கை ஏற்பட்டது. மலைத் தேனும் மரச்செக்கு நல்லெண்ணெயும் மிக உயர்ந்த தரம் வாய்ந்தவை.',
    initial: 'P',
    avatar: '/images/testimonial-2.jpg',
  },
  {
    id: 'test-3',
    name: 'Aditya Ramesh',
    role: 'Design Director, Studio Kova',
    location: 'Bangalore',
    rating: 5,
    quote: 'From their heritage millets to the plastic-free eco packaging and lightning-fast delivery, the attention to detail is remarkable. It has genuinely transformed our daily lifestyle and pantry.',
    quoteTamil: 'பாரம்பரிய சிறுதானியங்கள் முதல் பிளாஸ்டிக் இல்லாத சூழல் நட்பு பேக்கேஜிங் வரை, அவர்களின் தரம் வியக்க வைக்கிறது. இது எங்கள் அன்றாட உணவு முறையை உண்மையிலேயே ஆரோக்கியமாக மாற்றியுள்ளது.',
    initial: 'A',
    avatar: '/images/testimonial-3.jpg',
  },
];