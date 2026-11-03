// Demo content for the clickable prototype. Names and businesses are fictional.
window.UAHUB = (() => {
  const CITIES = {
    Alicante: { lon: -0.48, lat: 38.35 },
    Valencia: { lon: -0.38, lat: 39.47 },
    Madrid: { lon: -3.70, lat: 40.42 },
    Barcelona: { lon: 2.17, lat: 41.39 },
    Málaga: { lon: -4.42, lat: 36.72 },
    Sevilla: { lon: -5.98, lat: 37.39 },
    Torrevieja: { lon: -0.68, lat: 37.98 },
    Bilbao: { lon: -2.93, lat: 43.26 },
  };

  // Calibrated to img/map-spain-white.png (mainland Spain, equirectangular crop).
  const toMap = (lon, lat) => ({ x: ((lon + 9.3) / 12.6) * 100, y: ((43.8 - lat) / 7.8) * 100 });

  const CATEGORIES = [
    { id: "beauty", label: "Beauty & wellness" },
    { id: "legal", label: "Legal & documents" },
    { id: "learning", label: "Learning" },
    { id: "health", label: "Health & therapy" },
    { id: "home", label: "Home services" },
    { id: "photo", label: "Photo & creative" },
    { id: "food", label: "Food & cafés" },
  ];

  const GALLERY_NAILS = ["nails-salon", "gallery-chrome", "gallery-red", "gallery-denim", "gallery-mint"];

  const SPECIALISTS = [
    {
      id: "mariia-koval", name: "Mariia Koval", title: "Gel manicure & nail art", cat: "beauty",
      city: "Alicante", area: "Centro", km: 0.8, rating: 4.9, reviews: 128, price: 25, unit: "",
      img: "nails-salon", avatar: "avatar-2", verified: true, years: 6, replies: "within 1 hour",
      langs: ["Ukrainian", "Spanish", "English"], gallery: GALLERY_NAILS,
      about: "Certified nail master from Kharkiv, in Alicante since 2022. Clean, minimal designs that last three weeks — and a studio where you can finally relax in your own language.",
      services: [
        { name: "Manicure + gel polish", mins: 90, price: 35 },
        { name: "Classic manicure", mins: 60, price: 25 },
        { name: "Gel removal", mins: 30, price: 15 },
        { name: "Nail art, per set", mins: 30, price: 10, from: true },
      ],
    },
    {
      id: "anna-bondar", name: "Anna Bondar", title: "Psychologist — adaptation & anxiety", cat: "health",
      city: "Alicante", area: "Online or San Blas", km: 1.6, rating: 5.0, reviews: 64, price: 55, unit: "/ session",
      img: "psychologist", avatar: "avatar-3", verified: true, years: 9, replies: "within 3 hours",
      langs: ["Ukrainian", "English"], gallery: ["psychologist", "yoga", "community"],
      about: "Clinical psychologist working with people who moved abroad: adaptation, burnout, anxiety and family relationships. Sessions in person or online.",
      services: [
        { name: "First consultation", mins: 50, price: 40 },
        { name: "Individual session", mins: 50, price: 55 },
        { name: "Couples session", mins: 80, price: 80 },
      ],
    },
    {
      id: "olena-savchuk", name: "Olena Savchuk", title: "Apartment & after-rent cleaning", cat: "home",
      city: "Alicante", area: "Playa San Juan", km: 2.4, rating: 4.7, reviews: 39, price: 15, unit: "/ hour",
      img: "cleaning", avatar: "avatar-7", verified: false, years: 3, replies: "same day",
      langs: ["Ukrainian", "Russian"], gallery: ["cleaning"],
      about: "Regular and deep cleaning, end-of-lease cleaning so you get your deposit back. Own eco products.",
      services: [
        { name: "Regular cleaning, 3 hours", mins: 180, price: 45 },
        { name: "Deep cleaning", mins: 300, price: 90 },
        { name: "End-of-lease cleaning", mins: 360, price: 120, from: true },
      ],
    },
    {
      id: "maksym-tkachenko", name: "Maksym Tkachenko", title: "Family & golden-hour photo sessions", cat: "photo",
      city: "Alicante", area: "Coast & old town", km: 3.1, rating: 4.9, reviews: 87, price: 120, unit: "",
      img: "photographer", avatar: "avatar-4", verified: true, years: 8, replies: "within 2 hours",
      langs: ["Ukrainian", "Spanish", "English"], gallery: ["photographer", "community", "fair"],
      about: "Relaxed outdoor sessions on the Costa Blanca. 40+ edited photos in a week, printed album on request.",
      services: [
        { name: "Mini session, 30 min", mins: 30, price: 120 },
        { name: "Family session, 1 hour", mins: 60, price: 190 },
        { name: "Wedding day", mins: 480, price: 950, from: true },
      ],
    },
    {
      id: "iryna-melnyk", name: "Iryna Melnyk", title: "Immigration lawyer — NIE, TIE, residency", cat: "legal",
      city: "Valencia", area: "Ruzafa", km: 1.2, rating: 4.9, reviews: 212, price: 60, unit: "",
      img: "lawyer", avatar: "avatar-1", verified: true, years: 12, replies: "within 1 hour",
      langs: ["Ukrainian", "Spanish"], gallery: ["lawyer", "meeting"],
      about: "Spanish-licensed abogada (ICAV). Temporary protection renewals, residency, family reunification and homologation of diplomas — explained in plain Ukrainian.",
      services: [
        { name: "Consultation", mins: 45, price: 60 },
        { name: "TIE renewal, full support", mins: 60, price: 150 },
        { name: "Residency application", mins: 60, price: 350, from: true },
      ],
    },
    {
      id: "sofia-lysenko", name: "Sofia Lysenko", title: "Bridal & evening makeup", cat: "beauty",
      city: "Valencia", area: "El Carmen", km: 2.0, rating: 4.8, reviews: 76, price: 45, unit: "",
      img: "makeup", avatar: "avatar-8", verified: true, years: 7, replies: "within 2 hours",
      langs: ["Ukrainian", "Spanish"], gallery: ["makeup", "nails-salon"],
      about: "Makeup that looks like you on your best day. Studio in El Carmen or on location.",
      services: [
        { name: "Evening makeup", mins: 60, price: 45 },
        { name: "Bridal makeup + trial", mins: 150, price: 180 },
      ],
    },
    {
      id: "daria-moroz", name: "Daria Moroz", title: "Spanish for adults & kids, A1–B2", cat: "learning",
      city: "Alicante", area: "Online or Benalúa", km: 1.1, rating: 5.0, reviews: 58, price: 20, unit: "/ lesson",
      img: "tutor", avatar: "avatar-6", verified: true, years: 5, replies: "within 1 hour",
      langs: ["Ukrainian", "Spanish", "English"], gallery: ["tutor", "meeting"],
      about: "DELE examiner-trained teacher. Lessons built around real life here: the doctor, the bank, the school chat.",
      services: [
        { name: "Trial lesson", mins: 30, price: 10 },
        { name: "Individual lesson", mins: 60, price: 20 },
        { name: "DELE prep pack, 8 lessons", mins: 60, price: 150 },
      ],
    },
    {
      id: "yulia-romanenko", name: "Yulia Romanenko", title: "Yoga & mobility classes", cat: "health",
      city: "Barcelona", area: "Gràcia", km: 0.9, rating: 4.9, reviews: 101, price: 12, unit: "/ class",
      img: "yoga", avatar: "avatar-5", verified: true, years: 10, replies: "within 4 hours",
      langs: ["Ukrainian", "English"], gallery: ["yoga", "community"],
      about: "Small-group hatha and mobility classes in Gràcia, plus a Sunday class on the beach.",
      services: [
        { name: "Group class", mins: 60, price: 12 },
        { name: "Private class", mins: 60, price: 45 },
      ],
    },
    {
      id: "taras-hnatiuk", name: "Taras Hnatiuk", title: "Personal training & nutrition", cat: "health",
      city: "Madrid", area: "Chamberí", km: 1.4, rating: 4.8, reviews: 44, price: 35, unit: "/ session",
      img: "trainer", avatar: null, verified: true, years: 6, replies: "within 2 hours",
      langs: ["Ukrainian", "Spanish"], gallery: ["trainer"],
      about: "Strength training for beginners, with a simple meal plan you can actually shop for in Mercadona.",
      services: [
        { name: "Personal session", mins: 60, price: 35 },
        { name: "10 sessions + plan", mins: 60, price: 300 },
      ],
    },
    {
      id: "viktoriia-nails", name: "Viktoriia Shevchuk", title: "Nail studio — chrome & minimal", cat: "beauty",
      city: "Málaga", area: "Soho", km: 0.6, rating: 4.9, reviews: 93, price: 30, unit: "",
      img: "nails-denim", avatar: null, verified: true, years: 4, replies: "within 1 hour",
      langs: ["Ukrainian", "Spanish"], gallery: ["nails-denim", "gallery-chrome", "gallery-mint"],
      about: "Chrome, milky and soft-square sets in the heart of Soho.",
      services: [
        { name: "Manicure + gel polish", mins: 90, price: 30 },
        { name: "Chrome set", mins: 105, price: 40 },
      ],
    },
    {
      id: "kyiv-cafe", name: "Kyiv Café Valencia", title: "Ukrainian kitchen & bakery", cat: "food",
      city: "Valencia", area: "Benimaclet", km: 2.6, rating: 4.8, reviews: 311, price: 12, unit: "avg. bill",
      img: "cafe", avatar: null, verified: true, years: 3, replies: "within 1 hour",
      langs: ["Ukrainian", "Spanish", "English"], gallery: ["cafe", "fair"],
      about: "Borscht, varenyky and syrnyky like at home. Table booking and catering for events.",
      services: [
        { name: "Table for 2", mins: 90, price: 0 },
        { name: "Table for 4–6", mins: 120, price: 0 },
      ],
    },
    {
      id: "andrii-business", name: "Andrii Kravets", title: "Autónomo setup & accounting", cat: "legal",
      city: "Madrid", area: "Online", km: 0, rating: 4.9, reviews: 67, price: 50, unit: "/ month",
      img: "meeting", avatar: null, verified: true, years: 11, replies: "within 1 hour",
      langs: ["Ukrainian", "Spanish"], gallery: ["meeting", "lawyer"],
      about: "Register as autónomo, quarterly taxes and the yearly renta — without surprises from Hacienda.",
      services: [
        { name: "Free 20-min call", mins: 20, price: 0 },
        { name: "Autónomo registration", mins: 60, price: 90 },
        { name: "Monthly accounting", mins: 30, price: 50 },
      ],
    },
  ];

  const REVIEWS = [
    { name: "Olena H.", city: "Alicante", text: "Booked in two minutes, everything in Ukrainian. Finally I don't have to translate my own nails.", stars: 5, when: "2 weeks ago" },
    { name: "Kateryna P.", city: "Elche", text: "Very careful work and a calm atmosphere. The design held for almost four weeks.", stars: 5, when: "1 month ago" },
    { name: "Natalia V.", city: "Alicante", text: "On time, honest price, reminded me the day before. Coming back.", stars: 5, when: "1 month ago" },
    { name: "Svitlana R.", city: "San Vicente", text: "Booked for a Saturday through the site — got a confirmation right away.", stars: 4, when: "2 months ago" },
  ];

  const img = (name) => `img/${name}.jpg`;
  const byId = (id) => SPECIALISTS.find((s) => s.id === id);
  const catLabel = (id) => (CATEGORIES.find((c) => c.id === id) || {}).label || "";

  return { CITIES, CATEGORIES, SPECIALISTS, REVIEWS, toMap, img, byId, catLabel };
})();
