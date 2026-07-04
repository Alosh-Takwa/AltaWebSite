import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Site Configuration storage path
const CONFIG_FILE_PATH = path.join(process.cwd(), "site-config.json");

// Default initial translations (aligned with arTranslations / enTranslations)
const defaultArTranslations = {
  navBrand: "التا للإعلان",
  navHome: "الرئيسية",
  navGenerator: "المولّد الذكي",
  navServices: "خدماتنا",
  navProcess: "منهجيتنا",
  navCalculator: "حاسبة الانتشار",
  navPortfolio: "أعمالنا",
  navContact: "اتصل بنا",

  heroTitle: "نصنع الدهشة، نقود التأثير",
  heroSub: "من قلب دمشق إلى أرجاء العالم العربي، نبتكر هويات تسويقية وحملات إعلانية تبهر العقول وتخلد العلامات التجارية بأقصى درجات الإبداع والاتقان الفني.",
  heroBtnGen: "جرب مولد الحملات بالذكاء الاصطناعي",
  heroBtnPort: "تصفح بورتفوليو الدهشة",

  statSatisfaction: "نسبة رضا شركاء النجاح",
  statSatisfactionVal: "98%",
  statCampaigns: "حملة إعلانية كبرى منطلقة",
  statCampaignsVal: "+340",
  statExperience: "عاماً من الخبرة والريادة",
  statExperienceVal: "+12",
  statBillboards: "لوحة طرقية حصرية في سوريا",
  statBillboardsVal: "+150",

  genTitle: "مبتكر الحملات الإعلانية الذكي",
  genSub: "أدخل تفاصيل نشاطك التجاري ودع عقل 'التا' الإبداعي يولد لك شعاراً مبتكراً، وسيناريو إعلان، وفكرة بيلبورد طرقية مبهرة فوراً باستخدام الذكاء الاصطناعي.",
  genLabelName: "اسم علامتك التجارية / مشروعك",
  genPlaceholderName: "مثال: شوكولا غراوي، حلويات داود، بن الحموي، تطبيق كابتن",
  genLabelType: "مجال عمل المشروع",
  genPlaceholderType: "مثال: صناعات غذائية، تكنولوجيا، مطاعم، أزياء، عقارات",
  genLabelLocation: "السوق الجغرافي المستهدف",
  genLabelTone: "نبرة وروح الحملة الإعلانية",
  genLabelAudience: "الفئة المستهدفة من الجمهور",
  genBtnSubmit: "توليد الفكرة الإعلانية المبتكرة",
  genBtnGenerating: "جاري نسج الفكرة الإبداعية...",
  genResultSlogan: "الشعار اللفظي المقترح (Slogan):",
  genResultConcept: "الفكرة الفنية المحورية (Concept):",
  genResultVideo: "سيناريو إعلان الفيديو (Storyboard):",
  genResultBillboard: "تصميم لوحة الطرق المقترح (Billboard Idea):",
  genResultStrategy: "تكتيكات استراتيجية مكملة للحملة:",
  genDemoNotice: "ملاحظة: هذا المولد متصل مباشرة بخدماتنا السحابية الذكية لإنتاج أفكار تسويقية مخصصة لسوق دمشق وحلب وباقي المدن العربية.",

  servTitle: "خدماتنا الإعلانية المتكاملة",
  servSub: "حلول إعلانية متكاملة تغطي كافة نقاط التماس لتضمن لعلامتك التجارية حضوراً استثنائياً وراسخاً في أذهان المستهلكين.",
  serv1Title: "لوحات الطرق والـ Outdoor الإعلانية",
  serv1Desc: "إدارة وتأجير وتصميم اللوحات الطرقية الضخمة (بيلبورد، يوني بول، شاشات رقمية تفاعلية) في أهم الشوارع والشرايين الحيوية بدمشق (مثل أوتستراد المزة، ساحة الأمويين، الشعلان) والمدن الكبرى.",
  serv2Title: "التسويق الرقمي والمحتوى الإبداعي",
  serv2Desc: "كتابة السيناريوهات الإعلانية الفكاهية والدرامية بالهوية السورية والروح العربية القريبة من القلب، مع إدارة استراتيجية ممولة لحسابات التواصل الاجتماعي لضمان أقصى تفاعل.",
  serv3Title: "تصميم الهويات البصرية والبراندينغ",
  serv3Desc: "صياغة شعارات وتصميم هويات بصرية متكاملة ومواد تغليف عبوات المنتجات بلمسة فنية مميزة تعكس الروح والجوهر الحقيقي لشركتك بطابع عصري جذاب.",
  serv4Title: "الإنتاج الفني والمرئي السينمائي",
  serv4Desc: "تصوير الإعلانات التلفزيونية والسينمائية ولقطات السوشال ميديا الاحترافية، مع مونتاج سينمائي مبهر، وتأثيرات بصرية وصوتية تأسر الحواس وتصنع صدى واسعاً.",

  procTitle: "منهجية العمل الإبداعي",
  procSub: "نحن لا نطلق حملات عشوائية، بل نتبع مساراً مدروساً يحول الشرارة الإبداعية إلى تأثير حقيقي مستدام.",
  proc1Title: "1. الانغماس والبحث التسويقي",
  proc1Desc: "ندرس سلوك المستهلك السوري والعربي وعاداته الشرائية، ونحلل المنافسين بعمق لنحدد الفجوة الإعلانية التي سنخترقها لصالحك.",
  proc2Title: "2. توليد الشرارة الإبداعية (الكونسبت)",
  proc2Desc: "نعقد جلسات عصف ذهني في استوديو التا لنخرج بأفكار إعلانية فريدة وغير مكررة، تمزج بين الأصالة والدهشة المعاصرة.",
  proc3Title: "3. الاتقان والإنتاج المتكامل",
  proc3Desc: "بين كتابة النصوص وصناعة التصاميم وتصوير المشاهد، يعمل مهندسو الإبداع لدينا على صياغة كل تفصيل بأعلى معايير الدقة والاتقان الفني.",
  proc4Title: "4. الإطلاق وقياس تصاعد الأثر",
  proc4Desc: "نطلق الحملة بالتوقيت المثالي عبر اللوحات الطرقية ومنصات الويب، ونتابع التفاعل المباشر وارتفاع المبيعات وصدى العلامة.",

  calcTitle: "مخطط تقدير الوصول والانتشار",
  calcSub: "حدد نوع الحملة وميزانيتك الإعلانية المقترحة لحساب مدى الانتشار والمشاهدات المقدرة في المدن السورية الكبرى.",
  calcLabelType: "قناة الإطلاق الإعلاني المفضلة",
  calcLabelBudget: "الميزانية المخصصة للحملة بالليرة السورية أو الدولار",
  calcEstReach: "الوصول التقديري المتوقع لجمهورك النشط",
  calcTargetCity: "المنطقة الجغرافية المستهدفة للتركيز",
  calcFormSponsor: "* هذه التقديرات مدروسة وفق الكثافة السكانية الحالية للشباب والعائلات في دمشق وحلب وحمص والساحل السوري.",

  portTitle: "معرض روائع الأعمال والنجاحات",
  portSub: "حملات إعلانية أيقونية صممتها ونفذتها التا، فأحدثت ضجة في الشارع السوري ونالت ثقة السوق العربي.",
  portTagOutdoor: "لوحات طرقية",
  portTagDigital: "حملة رقمية",
  portTagBrand: "هوية بصرية",
  portTagVideo: "إنتاج سينمائي",
  portItem1Title: "حملة 'ياسمين الشام' لشركة ريادة للعطور",
  portItem1Desc: "تجسيد الهوية الدمشقية العريقة في لوحات طرقية عملاقة فواحة بروائح الياسمين في شوارع دمشق، مما حقق انتشاراً وتفاعلاً غير مسبوق بالشارع السوري.",
  portItem2Title: "إعادة بناء هوية 'بن الحموي' البصرية",
  portItem2Desc: "عصرنة الهوية الكلاسيكية لواحد من أقدم بيوت القهوة السورية، مع الحفاظ على دفء التاريخ وجودة الحاضر ليتناسب مع جيل الشباب الجديد.",
  portItem3Title: "إطلاق تطبيق 'كابتن' للتوصيل الذكي",
  portItem3Desc: "حملة رقمية واسعة على تيك توك وإنستقرام تعتمد على فيديوهات طريفة ومؤثرين محليين، أدت لأكثر من 500 ألف تحميل في الشهر الأول بدمشق وحلب.",
  portItem4Title: "فيلم قصير 'نكهة بلدنا' لشركة الكونسروة السورية",
  portItem4Desc: "إعلان مرئي سينمائي دافئ يسلط الضوء على لمة العائلة السورية في رمضان، نال ملايين المشاهدات وجوائز إقليمية في التميز الإعلاني.",

  contTitle: "فلنصنع قصة نجاحك القادمة",
  contSub: "هل أنت مستعد لتجعل علامتك التجارية تتحدث بلغة الإبهار؟ املأ بياناتك وسيتواصل معك خبراؤنا الإعلانيون خلال 24 ساعة.",
  contName: "الاسم الكريم / الشركة",
  contEmail: "البريد الإلكتروني",
  contPhone: "رقم الهاتف / واتساب لتسهيل التواصل",
  contMsg: "أخبرنا باختصار عن مشروعك وتطلعاتك لحملتك القادمة",
  contBtn: "إرسال طلب استشارة إعلانية مجانية",
  contSuccess: "شكرًا لثقتك بالتا! تم استلام طلبك بنجاح، وسيقوم فريق التخطيط الإبداعي لدينا بالتواصل معك سريعاً للبدء برحلة التميز.",
  contHq: "دمشق - أوتستراد المزة، بناء الأبراج الحديثة، الطابق الخامس",
  contSyria: "سوريا - دمشق والمدن السورية والوطن العربي",
  contHours: "أوقات الدوام الرسمي",
  contHoursVal: "الأحد - الخميس: 9:00 صباحاً - 5:00 مساءً"
};

const defaultEnTranslations = {
  navBrand: "ALTA ADVERTISING",
  navHome: "Home",
  navGenerator: "AI Campaigner",
  navServices: "Services",
  navProcess: "Methodology",
  navCalculator: "Reach Planner",
  navPortfolio: "Portfolio",
  navContact: "Contact",

  heroTitle: "We Craft Awe, We Drive Impact",
  heroSub: "From the historical heart of Damascus to the entire Arab world, we innovate marketing concepts and advertising campaigns that captivate minds and immortalize brands with supreme artistic mastery.",
  heroBtnGen: "Try Our AI Campaign Generator",
  heroBtnPort: "Browse Our Portfolio",

  statSatisfaction: "Partners Satisfaction Rate",
  statSatisfactionVal: "98%",
  statCampaigns: "Major Launched Campaigns",
  statCampaignsVal: "+340",
  statExperience: "Years of Creative Leadership",
  statExperienceVal: "+12",
  statBillboards: "Exclusive Syrian Billboards",
  statBillboardsVal: "+150",

  genTitle: "Smart AI Advertising Campaign Generator",
  genSub: "Enter your business details and let Alta's creative brain instantaneously compose an original campaign slogan, video storyboard, and high-impact outdoor billboard concept using Gemini AI.",
  genLabelName: "Your Brand Name / Project",
  genPlaceholderName: "e.g., Ghraoui Chocolate, Dawoud Sweets, Captain App",
  genLabelType: "Business Sector / Industry",
  genPlaceholderType: "e.g., Food Industry, Tech Startup, Restaurant, Fashion",
  genLabelLocation: "Target Geographic Market",
  genLabelTone: "Campaign Tone & Soul",
  genLabelAudience: "Target Consumer Audience",
  genBtnSubmit: "Generate Creative Ad Concept",
  genBtnGenerating: "Weaving creative ideas...",
  genResultSlogan: "Suggested Campaign Slogan:",
  genResultConcept: "Core Artistic Concept:",
  genResultVideo: "Cinematic Video Storyboard:",
  genResultBillboard: "Suggested Outdoor Billboard Concept:",
  genResultStrategy: "Complementary Campaign Tactics:",
  genDemoNotice: "Note: This builder is directly linked to our smart cloud services optimized for Damascus, Aleppo, and general Arab markets.",

  servTitle: "Our Comprehensive Ad Services",
  servSub: "Integrated advertising solutions covering every single touchpoint to guarantee an exceptional, deep-rooted presence in consumer hearts.",
  serv1Title: "Premium Billboards & Outdoor Media",
  serv1Desc: "Booking, managing, and designing heavy-exposure outdoor billboards (unipoles, megacom, digital screens) in critical high-traffic avenues in Damascus (e.g., Mezzeh Highway, Umayyad Square, Shaalan) and other big cities.",
  serv2Title: "Digital Marketing & Copywriting",
  serv2Desc: "Crafting highly relatable commercial scenarios in local Syrian and standard Arab dialects, along with hyper-targeted paid digital marketing strategies to optimize active user engagement.",
  serv3Title: "Brand Identity & Product Design",
  serv3Desc: "Formulating modern logos, comprehensive brand identity books, and spectacular product packaging blending authentic Levantine heritage with sleek, cutting-edge world-class styles.",
  serv4Title: "TV & Cinematic Video Production",
  serv4Desc: "Directing and shooting TV commercials and premium social reels with cinematic production values, dynamic grading, and immersive audio-visual effects that make waves.",

  procTitle: "Our Creative Philosophy",
  procSub: "We don't launch random ads. We adhere to a structured, proven pathway that translates the creative spark into persistent nation-wide commercial influence.",
  proc1Title: "1. Immersion & Market Research",
  proc1Desc: "We deeply analyze Syrian and Arab consumer behaviors, purchasing patterns, and competitive landscapes to discover the perfect advertising breach.",
  proc2Title: "2. The Creative Spark (Concept)",
  proc2Desc: "We hold intensive brainstorming sessions in Alta Studio to extract unique, unprecedented concepts blending Syrian cultural authenticity with modern surprise.",
  proc3Title: "3. Precision & Unified Production",
  proc3Desc: "From copywriting to graphics and cinematic shooting, our creative engineers mold every tiny details with the highest standards of artistic craftsmanship.",
  proc4Title: "4. Launch & Amplified Influence",
  proc4Desc: "We launch at the perfect time across premium billboards and digital web networks, closely tracking live feedback, brand sentiment, and rising sales.",

  calcTitle: "Reach & Exposure Estimator",
  calcSub: "Set your preferred campaign channel and budget to estimate the potential visibility and audience reach in major Syrian metropolitan areas.",
  calcLabelType: "Primary Launch Channel",
  calcLabelBudget: "Estimated Campaign Budget",
  calcEstReach: "Potential Target Audience Reach",
  calcTargetCity: "Focus Geographic Area",
  calcFormSponsor: "* These estimations are modeled on active demographic densities of youths and families in Damascus, Aleppo, Homs, and the Syrian coast.",

  portTitle: "Our Masterpieces & Success Stories",
  portSub: "Iconic advertising campaigns designed and executed by Alta, creating a local buzz in Syria and gaining deep trust in the Arab market.",
  portTagOutdoor: "Outdoor Billboard",
  portTagDigital: "Digital Campaign",
  portTagBrand: "Visual Branding",
  portTagVideo: "Cinematic Media",
  portItem1Title: "Jasmine of Damascus - Riyada Perfumes",
  portItem1Desc: "Embodying the ancient Damascus jasmine heritage inside massive interactive billboards diffusing subtle jasmine scents in city squares, causing a viral social buzz.",
  portItem2Title: "Rebranding Hamwi Coffee - Visual Shift",
  portItem2Desc: "Modernizing the classical visual identity of a legendary Syrian coffee household, striking the perfect balance between historic warmth and the energetic youth generation.",
  portItem3Title: "Captain Smart Cab Application Launch",
  portItem3Desc: "An expansive TikTok & Instagram campaign utilizing humorous localized stories and top local influencers, triggering over 500k downloads in its first month.",
  portItem4Title: "Flavor of Our Lands - Syrian Canning Co.",
  portItem4Desc: "A warm TV commercial highlighting the emotional beauty of Syrian family gatherings during Ramadan. Broadcasted via pan-Arab satellite TV channels.",

  contTitle: "Let's Craft Your Next Milestone",
  contSub: "Ready to make your brand talk the language of awe? Fill out the brief and our advertising strategists will connect with you within 24 hours.",
  contName: "Full Name / Company Name",
  contEmail: "Email Address",
  contPhone: "Phone / WhatsApp Number",
  contMsg: "Briefly tell us about your brand and campaign expectations",
  contBtn: "Request Free Creative Consultation",
  contSuccess: "Thank you for trusting Alta! Your brief was successfully received. Our creative planning team will contact you shortly to start our journey of excellence.",
  contHq: "Damascus - Mezzeh Highway, Modern Towers, 5th Floor",
  contSyria: "Syria, Syrian Cities & Arab World Hubs",
  contHours: "Working Hours",
  contHoursVal: "Sunday - Thursday: 9:00 AM - 5:00 PM"
};

const defaultServices = [
  {
    id: "serv1",
    titleAr: "لوحات الطرق والـ Outdoor الإعلانية",
    titleEn: "Premium Billboards & Outdoor Media",
    descAr: "إدارة وتأجير وتصميم اللوحات الطرقية الضخمة (بيلبورد، يوني بول، شاشات رقمية تفاعلية) في أهم الشوارع والشرايين الحيوية بدمشق (مثل أوتستراد المزة، ساحة الأمويين، الشعلان) والمدن الكبرى.",
    descEn: "Booking, managing, and designing heavy-exposure outdoor billboards (unipoles, megacom, digital screens) in critical high-traffic avenues in Damascus (e.g., Mezzeh Highway, Umayyad Square, Shaalan) and other big cities.",
    icon: "Map",
    subtitleAr: "شوارع حيوية: المزة، الأمويين، الشعلان",
    subtitleEn: "Key Spots: Mezzeh, Umayyad, Shaalan"
  },
  {
    id: "serv2",
    titleAr: "التسويق الرقمي والمحتوى الإبداعي",
    titleEn: "Digital Marketing & Copywriting",
    descAr: "كتابة السيناريوهات الإعلانية الفكاهية والدرامية بالهوية السورية والروح العربية القريبة من القلب، مع إدارة استراتيجية ممولة لحسابات التواصل الاجتماعي لضمان أقصى تفاعل.",
    descEn: "Crafting highly relatable commercial scenarios in local Syrian and standard Arab dialects, along with hyper-targeted paid digital marketing strategies to optimize active user engagement.",
    icon: "Sparkles",
    subtitleAr: "بالهوية والروح السورية المحببة",
    subtitleEn: "Culturally Relatable Syrian Content"
  },
  {
    id: "serv3",
    titleAr: "تصميم الهويات البصرية والبراندينغ",
    titleEn: "Brand Identity & Product Design",
    descAr: "صياغة شعارات وتصميم هويات بصرية متكاملة ومواد تغليف عبوات المنتجات بلمسة فنية مميزة تعكس الروح والجوهر الحقيقي لشركتك بطابع عصري جذاب.",
    descEn: "Formulating modern logos, comprehensive brand identity books, and spectacular product packaging blending authentic Levantine heritage with sleek, cutting-edge world-class styles.",
    icon: "Layers",
    subtitleAr: "كتيب الهوية وتصاميم التغليف",
    subtitleEn: "Full Brand Books & Premium Packaging"
  },
  {
    id: "serv4",
    titleAr: "الإنتاج الفني والمرئي السينمائي",
    titleEn: "TV & Cinematic Video Production",
    descAr: "تصوير الإعلانات التلفزيونية والسينمائية ولقطات السوشال ميديا الاحترافية، مع مونتاج سينمائي مبهر، وتأثيرات بصرية وصوتية تأسر الحواس وتصنع صدى واسعاً.",
    descEn: "Directing and shooting TV commercials and premium social reels with cinematic production values, dynamic grading, and immersive audio-visual effects that make waves.",
    icon: "Tv",
    subtitleAr: "تصوير سينمائي ومونتاج احترافي",
    subtitleEn: "Cinematic Production with sound design"
  }
];

const defaultPortfolio = [
  {
    id: "yasmine",
    titleAr: "حملة 'ياسمين الشام' لشركة ريادة للعطور",
    titleEn: "Jasmine of Damascus - Riyada Perfumes",
    descAr: "تجسيد الهوية الدمشقية العريقة في لوحات طرقية عملاقة فواحة بروائح الياسمين في شوارع دمشق، مما حقق انتشاراً وتفاعلاً غير مسبوق بالشارع السوري.",
    descEn: "Embodying the ancient Damascus jasmine heritage inside massive interactive billboards diffusing subtle jasmine scents in city squares, causing a viral social buzz.",
    category: "outdoor",
    tagAr: "لوحات طرقية",
    tagEn: "Outdoor Billboard",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    statAr: "+4.2 مليون مشاهدة طرقية",
    statEn: "+4.2M road impressions",
    clientAr: "ريادة للعطور الشامية",
    clientEn: "Riyada Levantine Perfumes",
    year: "2026",
    detailsAr: "تم تركيب لوحات بيلبورد ذكية ذات تصميم ثلاثي الأبعاد في أهم تقاطعات دمشق (أوتستراد المزة، ساحة الأمويين) مجهزة بتقنية دفع الروائح الدقيقة لبث رائحة ياسمين خفيفة تجذب المارة فوراً.",
    detailsEn: "Smart 3D billboards installed in prime Damascus intersections (Mezzeh, Umayyad Square) equipped with custom scent diffusers emitting jasmine aroma to captivate citizens."
  },
  {
    id: "hamwi",
    titleAr: "إعادة بناء هوية 'بن الحموي' البصرية",
    titleEn: "Rebranding Hamwi Coffee - Visual Shift",
    descAr: "عصرنة الهوية الكلاسيكية لواحد من أقدم بيوت القهوة السورية، مع الحفاظ على دفء التاريخ وجودة الحاضر ليتناسب مع جيل الشباب الجديد.",
    descEn: "Modernizing the classical visual identity of a legendary Syrian coffee household, striking the perfect balance between historic warmth and the energetic youth generation.",
    category: "branding",
    tagAr: "هوية بصرية",
    tagEn: "Visual Branding",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    statAr: "+180% نمو في المبيعات",
    statEn: "+180% sales growth",
    clientAr: "مجموعة بن الحموي العريقة",
    clientEn: "Hamwi Coffee Group",
    year: "2025",
    detailsAr: "قمنا بإعادة صياغة الهوية البصرية للعلامة بالكامل، وتحديث تغليف أكياس القهوة السورية والعلب المعدنية الفاخرة بطابع يجمع الحداثة بعبق التاريخ، مما جذب جيل الشباب لاقتناء المنتج.",
    detailsEn: "Rebuilt the entire brand design, packaging books, and premium tin cans, combining modern styles with historical warmth to successfully target young millennials."
  },
  {
    id: "captain",
    titleAr: "إطلاق تطبيق 'كابتن' للتوصيل الذكي",
    titleEn: "Captain Smart Cab Application Launch",
    descAr: "حملة رقمية واسعة على تيك توك وإنستقرام تعتمد على فيديوهات طريفة ومؤثرين محليين، أدت لأكثر من 500 ألف تحميل في الشهر الأول بدمشق وحلب.",
    descEn: "An expansive TikTok & Instagram campaign utilizing humorous localized stories and top local influencers, triggering over 500k downloads in its first month.",
    category: "digital",
    tagAr: "حملة رقمية",
    tagEn: "Digital Campaign",
    image: "https://images.unsplash.com/photo-1549576490-b0b4831da60a?auto=format&fit=crop&w=800&q=80",
    statAr: "نصف مليون تحميل شهري",
    statEn: "500k monthly downloads",
    clientAr: "تطبيق كابتن للتوصيل",
    clientEn: "Captain Cab Tech",
    year: "2025",
    detailsAr: "حملة رقمية متكاملة شملت إنتاج فيديوهات فكاهية قصيرة مستلهمة من واقع المواطن السوري اليومي بالشارع، مع إعلانات ممولة مستهدفة بدقة حققت صدى واسعاً وتضاعف نسبة التحميل.",
    detailsEn: "Integrated digital campaign producing humorous TikTok reels inspired by real daily Syrian commuting struggles, paired with hyper-targeted mobile advertisements."
  },
  {
    id: "canning",
    titleAr: "فيلم قصير 'نكهة بلدنا' لشركة الكونسروة السورية",
    titleEn: "Flavor of Our Lands - Syrian Canning Co.",
    descAr: "إعلان مرئي سينمائي دافئ يسلط الضوء على لمة العائلة السورية في رمضان، نال ملايين المشاهدات وجوائز إقليمية في التميز الإعلاني.",
    descEn: "A warm TV commercial highlighting the emotional beauty of Syrian family gatherings during Ramadan. Broadcasted via pan-Arab satellite TV channels.",
    category: "video",
    tagAr: "إنتاج سينمائي",
    tagEn: "Cinematic Media",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
    statAr: "+8 مليون مشاهدة على الويب",
    statEn: "+8M web views",
    clientAr: "الشركة السورية للكونسروة",
    clientEn: "Syrian Canning Company",
    year: "2026",
    detailsAr: "فيلم إعلاني تلفزيوني دافئ يركز على قيمة التكاتف ولمة العائلة حول المائدة الرمضانية في الأحياء القديمة، وتم عرضه في القنوات الفضائية والويب مع موسيقى شامية أصيلة لاقت رواجاً كبيراً.",
    detailsEn: "A warm cinematic commercial emphasizing the beautiful essence of Syrian family gatherings during Ramadan. Broadcasted via pan-Arab satellite TV channels."
  }
];

const defaultTheme = {
  primaryColor: "#ff5c35",
  secondaryColor: "#e2b053",
  logoLetter: "A",
  logoNameAr: "التا للإعلان",
  logoNameEn: "ALTA ADVERTISING"
};

// Initialize configuration if it does not exist
function loadOrInitializeConfig() {
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    try {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading config file, recreating it:", e);
    }
  }

  const initialConfig = {
    adminCredentials: {
      username: "admin",
      password: "admin"
    },
    theme: defaultTheme,
    translations: {
      ar: defaultArTranslations,
      en: defaultEnTranslations
    },
    services: defaultServices,
    portfolioItems: defaultPortfolio
  };

  fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(initialConfig, null, 2), "utf8");
  return initialConfig;
}

let siteConfig = loadOrInitializeConfig();

// Helper to save current configuration
function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(siteConfig, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to save site config file:", error);
  }
}

// Endpoints for dynamic dashboard support
app.get("/api/config", (req, res) => {
  // Never expose credentials to public calls
  const { adminCredentials, ...publicConfig } = siteConfig;
  res.json(publicConfig);
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "اسم المستخدم وكلمة المرور مطلوبان." });
  }

  if (
    username === siteConfig.adminCredentials.username &&
    password === siteConfig.adminCredentials.password
  ) {
    // Generate simple token representing authorization
    return res.json({
      token: "alta-secure-super-admin-token-2026",
      username: siteConfig.adminCredentials.username
    });
  }

  return res.status(401).json({ error: "خطأ في اسم المستخدم أو كلمة المرور!" });
});

app.post("/api/config", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== "Bearer alta-secure-super-admin-token-2026") {
    return res.status(403).json({ error: "غير مصرح لك بإجراء التعديلات." });
  }

  const { theme, translations, services, portfolioItems } = req.body;

  if (theme) siteConfig.theme = theme;
  if (translations) siteConfig.translations = translations;
  if (services) siteConfig.services = services;
  if (portfolioItems) siteConfig.portfolioItems = portfolioItems;

  saveConfig();
  res.json({ message: "تم حفظ الإعدادات بنجاح!", config: { theme, translations, services, portfolioItems } });
});

app.post("/api/change-password", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== "Bearer alta-secure-super-admin-token-2026") {
    return res.status(403).json({ error: "غير مصرح لك بإجراء التعديلات." });
  }

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "المعلومات المرسلة غير كاملة." });
  }

  if (oldPassword !== siteConfig.adminCredentials.password) {
    return res.status(400).json({ error: "كلمة المرور القديمة غير صحيحة!" });
  }

  siteConfig.adminCredentials.password = newPassword;
  saveConfig();
  res.json({ message: "تم تغيير كلمة المرور للمشرف بنجاح!" });
});

// Initialize Gemini API client safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini client successfully initialized.");
  } catch (error) {
    console.error("Error initializing Gemini client:", error);
  }
} else {
  console.warn("GEMINI_API_KEY environment variable is not defined.");
}

// Campaign generator endpoint using Gemini 3.5 Flash
app.post("/api/generate-campaign", async (req, res) => {
  const { businessName, businessType, targetAudience, targetLocation, campaignTone } = req.body;

  if (!businessName || !businessType) {
    return res.status(400).json({ error: "Missing businessName or businessType parameters." });
  }

  if (!ai) {
    // Graceful fallback with mock creative response in case API key is missing during first setup
    return res.status(200).json({
      slogan: `التا تبدع لأجل ${businessName}`,
      conceptCore: "تم تفعيل وضع المعاينة التجريبي. يرجى تهيئة مفتاح GEMINI_API_KEY في الإعدادات للحصول على أفكار إبداعية مخصصة بالكامل بالذكاء الاصطناعي.",
      storyboard: "لوحة بصرية متحركة تظهر شعار شركتكم يندمج مع تطلعات عملائكم في دمشق وحلب.",
      billboardIdea: "لوحة طرقية مضيئة في أوتستراد المزة تظهر منتجكم بأسلوب ثلاثي الأبعاد مبهر.",
      strategy: [
        "إطلاق حملة تشويقية على منصات التواصل الاجتماعي (تيك توك وإنستغرام)",
        "التعاون مع مؤثرين محليين لإجراء تجربة حية ومباشرة للمنتج",
        "توزيع عينات مجانية بطرق إبداعية في المراكز التجارية الكبرى"
      ],
      isFallback: true
    });
  }

  try {
    const prompt = `
      Create a culturally intelligent, extremely creative, and powerful marketing campaign concept for this business:
      - Business Name: ${businessName}
      - Business Sector/Type: ${businessType}
      - Target Audience: ${targetAudience || 'الجميع (العائلات والشباب)'}
      - Target Location/City: ${targetLocation || 'سوريا عامة والوطن العربي'}
      - Campaign Tone: ${campaignTone || 'مزيج من العاطفة والاحترافية'}

      Please generate high-impact advertising agency deliverables for Alta Advertising (شركة التا للإعلان). 
      The campaign should incorporate local Syrian/Arab cultural vibes, street landmarks, or linguistic charm if appropriate.
      Return the output as a clean JSON object in Arabic matching the specified schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are the legendary Creative Director at Alta Advertising Agency (شركة التا للإعلان). You are famous for generating jaw-dropping, viral, and highly professional advertising campaigns that connect with the Syrian and Arab consumer's heart. Your suggestions are highly specific, detailed, actionable, and extremely creative (never generic). You always respond in elegant and creative Arabic.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slogan: {
              type: Type.STRING,
              description: "الشعار اللفظي الإعلاني المبتكر والرنان للحملة (Slogan) - يفضل أن يكون قوي جداً وقريب من لهجة الفئة المستهدفة"
            },
            conceptCore: {
              type: Type.STRING,
              description: "الفكرة المحورية والعمق الفني للحملة وشرح لماذا ستنجح وتحدث ضجة (Concept)"
            },
            storyboard: {
              type: Type.STRING,
              description: "سيناريو تفصيلي مشوق لإعلان فيديو قصير أو سينمائي (تصف المشاهد البصرية والموسيقى والتعليق الصوتي بدقة)"
            },
            billboardIdea: {
              type: Type.STRING,
              description: "فكرة بصرية وتصميم إبداعي للوحة طرقية ضخمة (Billboard) في شارع حيوي (مثل المزة أو الشعلان بدمشق، أو الموكامبو بحلب)"
            },
            strategy: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "الخطوات الاستراتيجية والخدع التسويقية الفريدة لإطلاق الحملة وإشراك الجمهور"
            }
          },
          required: ["slogan", "conceptCore", "storyboard", "billboardIdea", "strategy"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response received from Gemini.");
    }

    const campaignData = JSON.parse(resultText.trim());
    return res.status(200).json(campaignData);

  } catch (error: any) {
    console.error("Error generating campaign concept:", error);
    return res.status(500).json({ 
      error: "حدث خطأ أثناء توليد الفكرة الإعلانية. يرجى المحاولة مجدداً.",
      details: error.message 
    });
  }
});

// Configure Vite middleware or static files serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Alta full-stack server running on http://localhost:${PORT}`);
  });
}

setupServer();
