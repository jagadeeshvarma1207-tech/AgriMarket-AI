'use client'
/**
 * AgriMarket AI — Internationalization (i18n) Context
 * Supports: English, Telugu (తెలుగు), Hindi (हिन्दी)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Locale = 'en' | 'te' | 'hi'

export const LOCALES: { value: Locale; label: string; nativeLabel: string; flag: string }[] = [
  { value: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { value: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', flag: '🇮🇳' },
  { value: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
]

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.browse': 'Browse',
    'nav.search': 'Search',
    'nav.categories': 'Categories',
    'nav.nearby': 'Nearby',
    'nav.orders': 'My Orders',
    'nav.favorites': 'Favorites',
    'nav.reviews': 'Reviews',
    'nav.profile': 'Profile',
    'nav.signOut': 'Sign out',
    'nav.language': 'Language',

    // Farmer Sidebar
    'sidebar.overview': 'Overview',
    'sidebar.myProducts': 'My Products',
    'sidebar.addProduct': 'Add Product',
    'sidebar.aiQuality': 'AI Quality Check',
    'sidebar.orders': 'Orders',
    'sidebar.messages': 'Messages',
    'sidebar.location': 'Location',
    'sidebar.reviews': 'Reviews',
    'sidebar.profile': 'Profile',
    'sidebar.settings': 'Settings',

    // Dashboard
    'dashboard.overview': 'Dashboard Overview',
    'dashboard.welcomeBack': 'Welcome back, farmer',
    'dashboard.activeProducts': 'Active Products',
    'dashboard.pendingOrders': 'Pending Orders',
    'dashboard.totalRevenue': 'Total Revenue',
    'dashboard.avgRating': 'Avg. Rating',
    'dashboard.recentOrders': 'Recent Orders',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.noOrders': 'No orders yet',
    'dashboard.viewAll': 'View all',

    // Products
    'product.addNew': 'Add New Product',
    'product.name': 'Product Name',
    'product.category': 'Category',
    'product.description': 'Description',
    'product.price': 'Price',
    'product.quantity': 'Quantity',
    'product.unit': 'Unit',
    'product.harvestDate': 'Harvest Date',
    'product.bestBefore': 'Best Before',
    'product.status': 'Listing Status',
    'product.published': 'Published',
    'product.draft': 'Draft',
    'product.images': 'Product Images',
    'product.save': 'Save Changes',
    'product.publish': 'Publish Product',
    'product.cancel': 'Cancel',
    'product.edit': 'Edit',
    'product.delete': 'Delete',
    'product.noProducts': 'No products yet',
    'product.addFirst': 'Add Your First Product',
    'product.available': 'available',
    'product.orders': 'orders',

    // Orders
    'order.place': 'Place Order',
    'order.status.PENDING': 'Pending',
    'order.status.ACCEPTED': 'Accepted',
    'order.status.PREPARING': 'Preparing',
    'order.status.READY': 'Ready for Pickup',
    'order.status.COMPLETED': 'Completed',
    'order.status.CANCELLED': 'Cancelled',
    'order.accept': 'Accept Order',
    'order.cancel': 'Cancel',
    'order.complete': 'Mark Complete',
    'order.noOrders': 'No orders found',
    'order.delivery': 'Delivery',
    'order.pickup': 'Pickup',
    'order.total': 'Total',
    'order.note': 'Add a note',

    // Auth
    'auth.login': 'Sign In',
    'auth.register': 'Create Account',
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.name': 'Full name',
    'auth.confirmPassword': 'Confirm password',
    'auth.farmer': 'Sell Produce',
    'auth.consumer': 'Buy Produce',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'auth.signIn': 'Sign In',
    'auth.createAccount': 'Create Account',

    // Marketplace
    'market.search': 'Search for tomatoes, mangoes, rice...',
    'market.filters': 'Filters',
    'market.sortBy': 'Sort By',
    'market.allCategories': 'All Categories',
    'market.newest': 'Newest First',
    'market.popular': 'Most Popular',
    'market.highestRated': 'Highest Rated',
    'market.priceLow': 'Price: Low to High',
    'market.priceHigh': 'Price: High to Low',
    'market.noProducts': 'No products found',
    'market.browseProducts': 'Browse Products',
    'market.nearbyFarmers': 'Nearby Farmers',

    // Location
    'location.useCurrentLocation': 'Use Current Location',
    'location.locationDenied': 'Location permission was denied',
    'location.locationError': 'Could not get your location',
    'location.nearbyFarmers': 'Nearby Farmers & Products',
    'location.radius': 'Radius',
    'location.kmAway': 'km away',
    'location.noNearby': 'No nearby farmers found',
    'location.expandRadius': 'Expand to 100km',

    // AI Quality
    'ai.title': 'AI Quality Check',
    'ai.upload': 'Upload produce photo for analysis',
    'ai.analyzing': 'Analyzing...',
    'ai.grade': 'Quality Grade',
    'ai.confidence': 'Confidence',
    'ai.notConnected': 'AI model not connected',
    'ai.modelRequired': 'Connect AI model to enable quality assessment',

    // Reviews
    'review.submit': 'Submit Review',
    'review.title': 'Review Title',
    'review.body': 'Your Review',
    'review.stars': 'Your Rating',
    'review.noReviews': 'No reviews yet',
    'review.pendingReviews': 'Pending Reviews',
    'review.pastReviews': 'Past Reviews',

    // Common
    'common.loading': 'Loading...',
    'common.saving': 'Saving...',
    'common.submitting': 'Submitting...',
    'common.error': 'Something went wrong',
    'common.success': 'Success!',
    'common.retry': 'Try Again',
    'common.back': 'Back',
    'common.viewAll': 'View all',
    'common.from': 'from',
    'common.by': 'by',
    'common.contact': 'Contact',
  },

  te: {
    // Navigation
    'nav.home': 'హోమ్',
    'nav.browse': 'బ్రౌజ్',
    'nav.search': 'వెతుకు',
    'nav.categories': 'వర్గాలు',
    'nav.nearby': 'సమీపంలో',
    'nav.orders': 'నా ఆర్డర్లు',
    'nav.favorites': 'ఇష్టాలు',
    'nav.reviews': 'సమీక్షలు',
    'nav.profile': 'ప్రొఫైల్',
    'nav.signOut': 'సైన్ అవుట్',
    'nav.language': 'భాష',

    // Farmer Sidebar
    'sidebar.overview': 'అవలోకనం',
    'sidebar.myProducts': 'నా ఉత్పత్తులు',
    'sidebar.addProduct': 'ఉత్పత్తిని జోడించండి',
    'sidebar.aiQuality': 'AI నాణ్యత తనిఖీ',
    'sidebar.orders': 'ఆర్డర్లు',
    'sidebar.messages': 'సందేశాలు',
    'sidebar.location': 'స్థానం',
    'sidebar.reviews': 'సమీక్షలు',
    'sidebar.profile': 'ప్రొఫైల్',
    'sidebar.settings': 'సెట్టింగులు',

    // Dashboard
    'dashboard.overview': 'డాష్‌బోర్డ్ అవలోకనం',
    'dashboard.welcomeBack': 'స్వాగతం, రైతు',
    'dashboard.activeProducts': 'క్రియాశీల ఉత్పత్తులు',
    'dashboard.pendingOrders': 'పెండింగ్ ఆర్డర్లు',
    'dashboard.totalRevenue': 'మొత్తం ఆదాయం',
    'dashboard.avgRating': 'సగటు రేటింగ్',
    'dashboard.recentOrders': 'ఇటీవలి ఆర్డర్లు',
    'dashboard.quickActions': 'త్వరిత చర్యలు',
    'dashboard.noOrders': 'ఆర్డర్లు లేవు',
    'dashboard.viewAll': 'అన్నీ చూడు',

    // Products
    'product.addNew': 'కొత్త ఉత్పత్తి జోడించు',
    'product.name': 'ఉత్పత్తి పేరు',
    'product.category': 'వర్గం',
    'product.description': 'వివరణ',
    'product.price': 'ధర',
    'product.quantity': 'పరిమాణం',
    'product.unit': 'యూనిట్',
    'product.harvestDate': 'కోత తేదీ',
    'product.bestBefore': 'గడువు తేదీ',
    'product.status': 'జాబితా స్థితి',
    'product.published': 'ప్రచురించబడింది',
    'product.draft': 'డ్రాఫ్ట్',
    'product.images': 'ఉత్పత్తి చిత్రాలు',
    'product.save': 'మార్పులు సేవ్ చేయి',
    'product.publish': 'ఉత్పత్తిని ప్రచురించు',
    'product.cancel': 'రద్దు చేయి',
    'product.edit': 'సవరించు',
    'product.delete': 'తొలగించు',
    'product.noProducts': 'ఉత్పత్తులు లేవు',
    'product.addFirst': 'మీ మొదటి ఉత్పత్తి జోడించండి',
    'product.available': 'అందుబాటులో',
    'product.orders': 'ఆర్డర్లు',

    // Orders
    'order.place': 'ఆర్డర్ చేయి',
    'order.status.PENDING': 'పెండింగ్',
    'order.status.ACCEPTED': 'ఆమోదించబడింది',
    'order.status.PREPARING': 'సిద్ధమవుతోంది',
    'order.status.READY': 'పికప్‌కు సిద్ధం',
    'order.status.COMPLETED': 'పూర్తయింది',
    'order.status.CANCELLED': 'రద్దు చేయబడింది',
    'order.accept': 'ఆర్డర్ ఆమోదించు',
    'order.cancel': 'రద్దు',
    'order.complete': 'పూర్తయినట్లు గుర్తించు',
    'order.noOrders': 'ఆర్డర్లు కనుగొనబడలేదు',
    'order.delivery': 'డెలివరీ',
    'order.pickup': 'పికప్',
    'order.total': 'మొత్తం',
    'order.note': 'గమనిక జోడించు',

    // Auth
    'auth.login': 'సైన్ ఇన్',
    'auth.register': 'ఖాతా సృష్టించు',
    'auth.email': 'ఇమెయిల్ చిరునామా',
    'auth.password': 'పాస్‌వర్డ్',
    'auth.name': 'పూర్తి పేరు',
    'auth.confirmPassword': 'పాస్‌వర్డ్ నిర్ధారించు',
    'auth.farmer': 'పంటను అమ్మండి',
    'auth.consumer': 'పంటను కొనండి',
    'auth.noAccount': 'ఖాతా లేదా?',
    'auth.haveAccount': 'ఇప్పటికే ఖాతా ఉందా?',
    'auth.signIn': 'సైన్ ఇన్',
    'auth.createAccount': 'ఖాతా సృష్టించు',

    // Marketplace
    'market.search': 'టమాటాలు, మామిడికాయలు, బియ్యం వెతకండి...',
    'market.filters': 'ఫిల్టర్లు',
    'market.sortBy': 'క్రమబద్ధీకరించు',
    'market.allCategories': 'అన్ని వర్గాలు',
    'market.newest': 'కొత్తవి ముందు',
    'market.popular': 'అత్యంత ప్రసిద్ధ',
    'market.highestRated': 'అత్యధిక రేటింగ్',
    'market.priceLow': 'ధర: తక్కువ నుండి ఎక్కువ',
    'market.priceHigh': 'ధర: ఎక్కువ నుండి తక్కువ',
    'market.noProducts': 'ఉత్పత్తులు కనుగొనబడలేదు',
    'market.browseProducts': 'ఉత్పత్తులు చూడు',
    'market.nearbyFarmers': 'సమీప రైతులు',

    // Location
    'location.useCurrentLocation': 'ప్రస్తుత స్థానం ఉపయోగించు',
    'location.locationDenied': 'స్థాన అనుమతి నిరాకరించబడింది',
    'location.locationError': 'మీ స్థానం పొందడం సాధ్యపడలేదు',
    'location.nearbyFarmers': 'సమీప రైతులు & ఉత్పత్తులు',
    'location.radius': 'పరిధి',
    'location.kmAway': 'కి.మీ దూరం',
    'location.noNearby': 'సమీప రైతులు కనుగొనబడలేదు',
    'location.expandRadius': '100కి.మీ వరకు విస్తరించు',

    // AI Quality
    'ai.title': 'AI నాణ్యత తనిఖీ',
    'ai.upload': 'విశ్లేషణ కోసం పంట ఫోటో అప్లోడ్ చేయండి',
    'ai.analyzing': 'విశ్లేషిస్తోంది...',
    'ai.grade': 'నాణ్యత గ్రేడ్',
    'ai.confidence': 'నమ్మకం',
    'ai.notConnected': 'AI మోడల్ కనెక్ట్ కాలేదు',
    'ai.modelRequired': 'నాణ్యత అంచనాను ప్రారంభించడానికి AI మోడల్ కనెక్ట్ చేయండి',

    // Reviews
    'review.submit': 'సమీక్ష సమర్పించు',
    'review.title': 'సమీక్ష శీర్షిక',
    'review.body': 'మీ సమీక్ష',
    'review.stars': 'మీ రేటింగ్',
    'review.noReviews': 'సమీక్షలు లేవు',
    'review.pendingReviews': 'పెండింగ్ సమీక్షలు',
    'review.pastReviews': 'గత సమీక్షలు',

    // Common
    'common.loading': 'లోడవుతోంది...',
    'common.saving': 'సేవ్ అవుతోంది...',
    'common.submitting': 'సమర్పిస్తోంది...',
    'common.error': 'ఏదో తప్పు జరిగింది',
    'common.success': 'విజయం!',
    'common.retry': 'మళ్ళీ ప్రయత్నించు',
    'common.back': 'వెనుకకు',
    'common.viewAll': 'అన్నీ చూడు',
    'common.from': 'నుండి',
    'common.by': 'వారి',
    'common.contact': 'సంప్రదించు',
  },

  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.browse': 'ब्राउज़ करें',
    'nav.search': 'खोजें',
    'nav.categories': 'श्रेणियाँ',
    'nav.nearby': 'नज़दीक',
    'nav.orders': 'मेरे ऑर्डर',
    'nav.favorites': 'पसंदीदा',
    'nav.reviews': 'समीक्षाएँ',
    'nav.profile': 'प्रोफ़ाइल',
    'nav.signOut': 'साइन आउट',
    'nav.language': 'भाषा',

    // Farmer Sidebar
    'sidebar.overview': 'अवलोकन',
    'sidebar.myProducts': 'मेरे उत्पाद',
    'sidebar.addProduct': 'उत्पाद जोड़ें',
    'sidebar.aiQuality': 'AI गुणवत्ता जाँच',
    'sidebar.orders': 'ऑर्डर',
    'sidebar.messages': 'संदेश',
    'sidebar.location': 'स्थान',
    'sidebar.reviews': 'समीक्षाएँ',
    'sidebar.profile': 'प्रोफ़ाइल',
    'sidebar.settings': 'सेटिंग्स',

    // Dashboard
    'dashboard.overview': 'डैशबोर्ड अवलोकन',
    'dashboard.welcomeBack': 'स्वागत है, किसान',
    'dashboard.activeProducts': 'सक्रिय उत्पाद',
    'dashboard.pendingOrders': 'लंबित ऑर्डर',
    'dashboard.totalRevenue': 'कुल राजस्व',
    'dashboard.avgRating': 'औसत रेटिंग',
    'dashboard.recentOrders': 'हाल के ऑर्डर',
    'dashboard.quickActions': 'त्वरित कार्य',
    'dashboard.noOrders': 'कोई ऑर्डर नहीं',
    'dashboard.viewAll': 'सभी देखें',

    // Products
    'product.addNew': 'नया उत्पाद जोड़ें',
    'product.name': 'उत्पाद का नाम',
    'product.category': 'श्रेणी',
    'product.description': 'विवरण',
    'product.price': 'मूल्य',
    'product.quantity': 'मात्रा',
    'product.unit': 'इकाई',
    'product.harvestDate': 'फसल तिथि',
    'product.bestBefore': 'सर्वोत्तम तिथि से पहले',
    'product.status': 'सूची स्थिति',
    'product.published': 'प्रकाशित',
    'product.draft': 'ड्राफ़्ट',
    'product.images': 'उत्पाद चित्र',
    'product.save': 'परिवर्तन सहेजें',
    'product.publish': 'उत्पाद प्रकाशित करें',
    'product.cancel': 'रद्द करें',
    'product.edit': 'संपादित करें',
    'product.delete': 'हटाएँ',
    'product.noProducts': 'कोई उत्पाद नहीं',
    'product.addFirst': 'अपना पहला उत्पाद जोड़ें',
    'product.available': 'उपलब्ध',
    'product.orders': 'ऑर्डर',

    // Orders
    'order.place': 'ऑर्डर करें',
    'order.status.PENDING': 'लंबित',
    'order.status.ACCEPTED': 'स्वीकृत',
    'order.status.PREPARING': 'तैयारी हो रही है',
    'order.status.READY': 'पिकअप के लिए तैयार',
    'order.status.COMPLETED': 'पूर्ण',
    'order.status.CANCELLED': 'रद्द',
    'order.accept': 'ऑर्डर स्वीकार करें',
    'order.cancel': 'रद्द करें',
    'order.complete': 'पूर्ण चिह्नित करें',
    'order.noOrders': 'कोई ऑर्डर नहीं मिला',
    'order.delivery': 'डिलीवरी',
    'order.pickup': 'पिकअप',
    'order.total': 'कुल',
    'order.note': 'नोट जोड़ें',

    // Auth
    'auth.login': 'साइन इन',
    'auth.register': 'खाता बनाएँ',
    'auth.email': 'ईमेल पता',
    'auth.password': 'पासवर्ड',
    'auth.name': 'पूरा नाम',
    'auth.confirmPassword': 'पासवर्ड की पुष्टि करें',
    'auth.farmer': 'उत्पाद बेचें',
    'auth.consumer': 'उत्पाद खरीदें',
    'auth.noAccount': 'खाता नहीं है?',
    'auth.haveAccount': 'पहले से खाता है?',
    'auth.signIn': 'साइन इन',
    'auth.createAccount': 'खाता बनाएँ',

    // Marketplace
    'market.search': 'टमाटर, आम, चावल खोजें...',
    'market.filters': 'फ़िल्टर',
    'market.sortBy': 'क्रमबद्ध करें',
    'market.allCategories': 'सभी श्रेणियाँ',
    'market.newest': 'नवीनतम पहले',
    'market.popular': 'सबसे लोकप्रिय',
    'market.highestRated': 'उच्चतम रेटेड',
    'market.priceLow': 'मूल्य: कम से अधिक',
    'market.priceHigh': 'मूल्य: अधिक से कम',
    'market.noProducts': 'कोई उत्पाद नहीं मिला',
    'market.browseProducts': 'उत्पाद देखें',
    'market.nearbyFarmers': 'नज़दीकी किसान',

    // Location
    'location.useCurrentLocation': 'वर्तमान स्थान उपयोग करें',
    'location.locationDenied': 'स्थान अनुमति अस्वीकार कर दी गई',
    'location.locationError': 'आपका स्थान प्राप्त नहीं हो सका',
    'location.nearbyFarmers': 'नज़दीकी किसान और उत्पाद',
    'location.radius': 'दायरा',
    'location.kmAway': 'किमी दूर',
    'location.noNearby': 'नज़दीक कोई किसान नहीं मिला',
    'location.expandRadius': '100 किमी तक विस्तार करें',

    // AI Quality
    'ai.title': 'AI गुणवत्ता जाँच',
    'ai.upload': 'विश्लेषण के लिए फसल की फोटो अपलोड करें',
    'ai.analyzing': 'विश्लेषण हो रहा है...',
    'ai.grade': 'गुणवत्ता ग्रेड',
    'ai.confidence': 'विश्वसनीयता',
    'ai.notConnected': 'AI मॉडल कनेक्ट नहीं है',
    'ai.modelRequired': 'गुणवत्ता मूल्यांकन सक्षम करने के लिए AI मॉडल कनेक्ट करें',

    // Reviews
    'review.submit': 'समीक्षा जमा करें',
    'review.title': 'समीक्षा शीर्षक',
    'review.body': 'आपकी समीक्षा',
    'review.stars': 'आपकी रेटिंग',
    'review.noReviews': 'कोई समीक्षा नहीं',
    'review.pendingReviews': 'लंबित समीक्षाएँ',
    'review.pastReviews': 'पिछली समीक्षाएँ',

    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.saving': 'सहेज रहा है...',
    'common.submitting': 'जमा कर रहा है...',
    'common.error': 'कुछ गलत हो गया',
    'common.success': 'सफलता!',
    'common.retry': 'पुनः प्रयास करें',
    'common.back': 'वापस',
    'common.viewAll': 'सभी देखें',
    'common.from': 'से',
    'common.by': 'द्वारा',
    'common.contact': 'संपर्क करें',
  },
}

// ─── CONTEXT ──────────────────────────────────────────────────────────────────

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, fallback?: string) => string
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
})

const STORAGE_KEY = 'agrimarket-locale'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored && translations[stored]) {
      setLocaleState(stored)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(STORAGE_KEY, newLocale)
    // Update document lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale
    }
  }

  const t = (key: string, fallback?: string): string => {
    return translations[locale]?.[key] || translations.en[key] || fallback || key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
