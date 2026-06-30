export interface BlogPost {
  slug: string;
  title: string;
  titleTamil: string;
  excerpt: string;
  excerptTamil: string;
  content: string[]; // array of paragraphs
  contentTamil: string[];
  category: 'farming' | 'nutrition' | 'recipes';
  date: string;
  dateTamil: string;
  readTime: number;
  image: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    roleTamil: string;
  };
  headings: { id: string; text: string; textTamil: string }[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'benefits-of-organic-millets',
    title: 'The Nutritional Powerhouse: Why You Should Eat Organic Millets',
    titleTamil: 'இயற்கை சிறுதானியங்களின் நன்மைகள்: ஏன் நாம் அவற்றை உண்ண வேண்டும்?',
    excerpt: 'Discover how organic millets can boost your immune system, improve digestion, and support sustainable dryland farming in South India.',
    excerptTamil: 'இயற்கை சிறுதானியங்கள் எவ்வாறு உங்கள் நோய் எதிர்ப்பு சக்தியை அதிகரிக்கும், செரிமானத்தை மேம்படுத்தும் மற்றும் தென்னிந்தியாவில் நிலையான விவசாயத்தை ஆதரிக்கும் என்பதை அறியுங்கள்.',
    category: 'nutrition',
    date: 'June 28, 2026',
    dateTamil: 'ஜூன் 28, 2026',
    readTime: 5,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=1200',
    author: {
      name: 'Dr. Abirami Selvam',
      avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=150',
      role: 'Clinical Nutritionist',
      roleTamil: 'உணவியல் நிபுணர்'
    },
    headings: [
      { id: 'introduction', text: 'Introduction to Millets', textTamil: 'சிறுதானியங்கள் அறிமுகம்' },
      { id: 'nutrition-facts', text: 'Nutritional Value', textTamil: 'ஊட்டச்சத்து மதிப்பு' },
      { id: 'health-benefits', text: 'Key Health Benefits', textTamil: 'முக்கிய ஆரோக்கிய நன்மைகள்' },
      { id: 'sustainability', text: 'Good for the Planet', textTamil: 'சுற்றுச்சூழலுக்கு உகந்தது' }
    ],
    content: [
      'Millets are traditional grains that have been cultivated in South India for thousands of years. Unlike modern hybrid wheat and white rice, organic millets are highly resilient dryland crops that require very little water and absolutely no synthetic chemical fertilizers to thrive.',
      'From a nutritional standpoint, millets are an absolute powerhouse. They are rich in complex carbohydrates, dietary fiber, essential minerals like magnesium, iron, and calcium, and are naturally gluten-free. This makes them ideal for managing diabetes, blood pressure, and cardiovascular wellness.',
      'Regular consumption of millets like Ragi (Finger Millet), Kuthiraivali (Barnyard Millet), and Samai (Little Millet) aids digestion and keeps you satiated for longer, preventing unnecessary sugar spikes. Including these grains in your daily diet is a direct step towards wholesome wellness.',
      'By choosing organic millets, you are not only taking charge of your personal health but also directly supporting dryland organic farmers who struggle with water scarcity. It is a win-win for your health and the environment.'
    ],
    contentTamil: [
      'சிறுதானியங்கள் தென்னிந்தியாவில் ஆயிரக்கணக்கான ஆண்டுகளாக பயிரிடப்பட்டு வரும் பாரம்பரிய தானியங்கள் ஆகும். நவீன கலப்பின கோதுமை மற்றும் வெள்ளை அரிசி போலல்லாமல், இயற்கை சிறுதானியங்கள் வறண்ட நிலப்பகுதிகளில் கூட மிகக் குறைந்த தண்ணீருடன், செயற்கை இரசாயன உரங்கள் ஏதுமின்றி வளரக்கூடியவை.',
      'ஊட்டச்சத்து கண்ணோட்டத்தில், சிறுதானியங்கள் ஒரு சிறந்த ஆற்றல் மையமாகும். அவை சிக்கலான கார்போஹைட்ரேட்டுகள், நார்ச்சத்து, மெக்னீசியம், இரும்பு மற்றும் கால்சியம் போன்ற அத்தியாவசிய தாதுக்கள் நிறைந்தவை. மேலும் இவை இயற்கையிலேயே குளுட்டன் இல்லாதவை என்பதால் சர்க்கரை நோய் மற்றும் இரத்த அழுத்தத்தைக் கட்டுப்படுத்த உதவுகின்றன.',
      'ராகி (கேழ்வரகு), குதிரைவாலி மற்றும் சாமை போன்ற சிறுதானியங்களை தவறாமல் உட்கொள்வது செரிமானத்திற்கு உதவுகிறது மற்றும் நீண்ட நேரம் உங்களை நிறைவாக வைத்திருக்கிறது. இந்த தானியங்களை உங்கள் தினசரி உணவில் சேர்ப்பது ஆரோக்கியத்தை நோக்கிய நேரடி அடியாகும்.',
      'இயற்கை சிறுதானியங்களை தேர்ந்தெடுப்பதன் மூலம், நீங்கள் உங்கள் ஆரோக்கியத்தை மேம்படுத்துவதோடு மட்டுமல்லாமல், தண்ணீர் பற்றாக்குறையால் தவிக்கும் வறண்ட நில இயற்கை விவசாயிகளுக்கும் நேரடியாக ஆதரவளிக்கிறீர்கள். இது உங்களுக்கும் நமது மண்ணிற்கும் நன்மை பயக்கும்.'
    ]
  },
  {
    slug: 'guide-to-zero-chemical-farming',
    title: 'A Guide to Zero-Chemical Farming in Tamil Nadu',
    titleTamil: 'தமிழ்நாட்டில் இரசாயனமற்ற இயற்கை விவசாயத்திற்கான ஒரு வழிகாட்டி',
    excerpt: 'An inside look at how our partner farmers utilize traditional organic techniques and organic composts to nurture soil health without pesticides.',
    excerptTamil: 'பூச்சிக்கொல்லிகள் இன்றி மண் வளத்தை மேம்படுத்த எங்களது கூட்டு விவசாயிகள் எவ்வாறு பாரம்பரிய இயற்கை நுட்பங்களையும் இயற்கை உரங்களையும் பயன்படுத்துகிறார்கள் என்பதைப் பற்றிய பார்வை.',
    category: 'farming',
    date: 'June 15, 2026',
    dateTamil: 'ஜூன் 15, 2026',
    readTime: 7,
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1200',
    author: {
      name: 'Ramanathan K.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      role: 'Chief Farm Sourcing Officer',
      roleTamil: 'முதன்மை பண்ணை கொள்முதல் அதிகாரி'
    },
    headings: [
      { id: 'traditional-soil', text: 'Nurturing Living Soil', textTamil: 'உயிருள்ள மண்ணை வளர்த்தல்' },
      { id: 'natural-pest', text: 'Natural Pest Controls', textTamil: 'இயற்கை பூச்சி மேலாண்மை' },
      { id: 'community-impact', text: 'Empowering Organic Farms', textTamil: 'இயற்கை பண்ணைகளை ஊக்குவித்தல்' }
    ],
    content: [
      'Chemical-based agriculture has depleted the natural microorganisms in agricultural soils over the decades, leading to lower yields and high toxic residues in foods. Zero-Chemical Farming focuses on regenerating the natural biological activity of the soil.',
      'Our partner farmers in regions like Erode, Dindigul, and Madurai utilize Jeevamrutham (a fermented organic mixture of cow dung, urine, jaggery, and pulse flour) and Panchagavya to rich-charge the soil with beneficial microbes. This increases water retention and root strength.',
      'For pest management, instead of synthetic pesticides, we use organic insect repellents made from Neem oil, ginger, garlic, and green chilies. We also practice multi-cropping, which naturally breaks pest cycles and guarantees robust plant health.',
      'Supporting these methods ensures that the food arriving at your doorstep is completely safe for children and elderly family members, free of endocrine disruptors and synthetic toxins.'
    ],
    contentTamil: [
      'இரசாயன அடிப்படையிலான விவசாயம் பல தசாப்தங்களாக விவசாய நிலங்களில் உள்ள இயற்கை நுண்ணுயிரிகளை அழித்து, குறைந்த விளைச்சலையும் உணவுகளில் அதிக நச்சு எச்சங்களையும் ஏற்படுத்தியுள்ளது. இரசாயனமற்ற விவசாயம் மண்ணின் இயற்கை உயிரியல் செயல்பாட்டை மீண்டும் உருவாக்குவதில் கவனம் செலுத்துகிறது.',
      'ஈரோடு, திண்டுக்கல், மதுரை போன்ற பகுதிகளில் உள்ள எங்களது கூட்டு விவசாயிகள் ஜீவாமிர்தம் மற்றும் பஞ்சகவ்யா ஆகியவற்றைப் பயன்படுத்தி மண்ணில் நன்மை பயக்கும் நுண்ணுயிரிகளை அதிகரிக்கிறார்கள். இது மண்ணின் நீர் தக்கவைப்புத் திறனையும் வேர்களின் வலிமையையும் அதிகரிக்கிறது.',
      'பூச்சி மேலாண்மைக்காக, செயற்கை பூச்சிக்கொல்லிகளுக்கு பதிலாக, வேப்ப எண்ணெய், இஞ்சி, பூண்டு மற்றும் பச்சை மிளகாய் ஆகியவற்றால் தயாரிக்கப்பட்ட இயற்கை பூச்சி விரட்டிகளைப் பயன்படுத்துகிறோம். மேலும் பல பயிர் சாகுபடி முறையையும் பின்பற்றுகிறோம்.',
      'இந்த முறைகளை ஆதரிப்பதன் மூலம், உங்கள் வீட்டு வாசலுக்கு வரும் உணவு குழந்தைகள் மற்றும் முதியவர்களுக்கு முற்றிலும் பாதுகாப்பானது, செயற்கை நச்சுகள் இல்லாதது என்பதை நீங்கள் உறுதியாக நம்பலாம்.'
    ]
  },
  {
    slug: 'traditional-recipes-millet-pongal',
    title: 'Traditional Recipes: Foxtail Millet (Thinai) Pongal',
    titleTamil: 'பாரம்பரிய சமையல் குறிப்புகள்: தினை வெண்பொங்கல் செய்முறை',
    excerpt: 'Bring ancient flavours back to your breakfast table with this easy, nutrient-dense Foxtail Millet Pongal recipe seasoned with organic ghee and pepper.',
    excerptTamil: 'இயற்கை நெய் மற்றும் மிளகு சேர்த்து தயாரிக்கப்படும் இந்த சத்துக்கள் நிறைந்த தினை வெண்பொங்கல் மூலம் பாரம்பரிய சுவையை உங்கள் காலை உணவில் சேர்த்துக் கொள்ளுங்கள்.',
    category: 'recipes',
    date: 'May 30, 2026',
    dateTamil: 'மே 30, 2026',
    readTime: 4,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=1200',
    author: {
      name: 'Chef Sundari Raj',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      role: 'Heritage Recipe Consultant',
      roleTamil: 'பாரம்பரிய சமையல் ஆலோசகர்'
    },
    headings: [
      { id: 'ingredients', text: 'Ingredients Needed', textTamil: 'தேவையான பொருட்கள்' },
      { id: 'steps', text: 'Step-by-Step Cooking', textTamil: 'செய்முறை படிநிலைகள்' },
      { id: 'serving-tips', text: 'Serving Suggestions', textTamil: 'பரிமாறும் முறைகள்' }
    ],
    content: [
      'Thinai (Foxtail Millet) Pongal is an incredible alternative to regular white rice Pongal. It has a lower glycemic index, higher protein content, and a delicious earthy nutty flavor that pairs beautifully with fresh coconut chutney and sambar.',
      'To prepare this, wash 1 cup of Thinai millet and 1/3 cup of yellow Moong dal thoroughly. In a pressure cooker, dry roast the Moong dal for a minute until aromatic. Add the washed Thinai millet along with 4 cups of water and a pinch of salt. Pressure cook for 4-5 whistles until soft and mushy.',
      'In a separate small pan, heat 2 tablespoons of organic A2 cow ghee. Add 1 teaspoon of whole black pepper, 1 teaspoon of cumin seeds, a pinch of asafoetida, a handful of broken cashew nuts, and fresh curry leaves. Roast until golden brown, then pour this tempering directly into the cooked millet-dal mix. Mix well.',
      'Serve hot, garnished with more curry leaves. It provides sustained energy for your workday and is an excellent, light meal option for the entire family.'
    ],
    contentTamil: [
      'தினை வெண்பொங்கல் சாதாரண அரிசி பொங்கலுக்கு ஒரு சிறந்த மாற்றாகும். இதில் குறைந்த அளவிலான சர்க்கரை குறியீடும் (glycemic index), அதிக புரதச்சத்தும், மண்ணின் சுவை கொண்ட தனித்துவமான நறுமணமும் நிறைந்துள்ளது.',
      'இதனை தயாரிக்க, 1 கப் தினை மற்றும் 1/3 கப் பாசிப்பருப்பை நன்றாகக் கழுவவும். குக்கரில் பாசிப்பருப்பை ஒரு நிமிடம் வறுக்கவும். பின்னர் கழுவி வைத்துள்ள தினையையும் சேர்த்து, 4 கப் தண்ணீர் மற்றும் ஒரு சிட்டிகை உப்பு சேர்த்து 4-5 விசில் வரும் வரை வேகவிடவும்.',
      'ஒரு சிறிய கடாயில் 2 மேஜைக்கரண்டி இயற்கை நெய்யைச் சூடாக்கவும். அதில் 1 தேக்கரண்டி மிளகு, 1 தேக்கரண்டி சீரகம், ஒரு சிட்டிகை பெருங்காயம், முந்திரி பருப்புகள் மற்றும் கறிவேப்பிலை சேர்த்து வதக்கவும். இதனை வெந்த பொங்கலில் சேர்த்து நன்றாகக் கிளறவும்.',
      'சூடான தேங்காய் சட்னி மற்றும் சாம்பாருடன் பரிமாறவும். இது நாள் முழுவதும் நீடித்த ஆற்றலை வழங்குவதோடு, முழு குடும்பத்திற்கும் ஒரு ஆரோக்கியமான காலை உணவாக அமைகிறது.'
    ]
  }
];

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

export const getRelatedPosts = (currentSlug: string, category: string, limit = 3): BlogPost[] => {
  return blogPosts
    .filter(post => post.slug !== currentSlug && post.category === category)
    .slice(0, limit);
};
