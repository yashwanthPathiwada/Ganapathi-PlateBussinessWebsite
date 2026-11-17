/**
 * Sri Lakshmi Ganapathi - Areca Leaf Plates
 * Mobile-First Online Ordering & Management Application
 */

const APP_STATE = {
  lang: localStorage.getItem('slg_lang') || 'en',
  user: JSON.parse(localStorage.getItem('slg_user') || 'null'),
  token: localStorage.getItem('slg_token') || '',
  cart: JSON.parse(localStorage.getItem('slg_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('slg_wishlist') || '[]'),
  products: [],
  coupons: [],
  settings: {},
  currentRoute: 'home',
  appliedCoupon: null,
  appliedReferral: '',
  useWallet: false,
  activeCategory: 'all',
  searchQuery: '',
  sortBy: 'default',
  selectedProduct: null,
  ownerPollingTimer: null,
  lastKnownOrderId: null,
  deferredPrompt: null
};

// Global Feature States
let isSupportChatOpen = false;
let supportChatLoading = false;
let supportChatMessages = [
  {
    sender: 'bot',
    text: 'Namaste! 🙏 Welcome to Sri Lakshmi Ganapathi Areca Plates, Eluru.\n\nI am your 24/7 Smart Assistant. You can track your orders, ask about plate sizes, get bulk wedding recommendations, or check delivery areas in Eluru!',
    time: 'Just now',
    quick_replies: [
      'Track my order',
      'Plates for 500 guests',
      'Hot curry & sambar proof?',
      'Delivery areas in Eluru',
      'Payment options & UPI',
      'Talk to Owner Anand Majji'
    ]
  }
];
let accountActiveTab = 'orders';
let customerOrdersList = [];
let customerOrdersLoading = false;
let customerOrdersPollTimer = null;
let lastKnownOrderStatuses = {};
let checkoutSelectedAddressIndex = 0;
let checkoutGpsCoords = null;
let checkoutLocality = 'Madhepalli Road (Near SLG Factory)';
let checkoutHouseNo = '';
let checkoutLandmark = '';
let checkoutSafeInstructions = ['call_before'];

// Bilingual Strings Dictionary (English & Telugu)
const I18N = {
  en: {
    brandName: "SRI LAKSHMI GANAPATHI",
    brandSubtitle: "ARECA PLATES MANUFACTURERS",
    tagline: "Sustainable. Natural. Pure.",
    navHome: "Home",
    navShop: "Shop",
    navCart: "Cart",
    navWishlist: "Wishlist",
    navOrders: "Orders",
    navAccount: "Account",
    navOwner: "Owner Panel",
    searchPlaceholder: "Search plates, bowls, cutlery, combos...",
    heroTitle: "100% Natural Areca Palm Leaf Tableware",
    heroSubtitle: "Handcrafted directly from fallen areca leaves in Eluru, Andhra Pradesh. Pure, chemical-free & 100% biodegradable dining.",
    heroBtnShop: "Order Online",
    heroBtnBulk: "Bulk & Wedding Enquiry",
    badge1Title: "Eco-Friendly Excellence",
    badge1Sub: "Zero trees cut. Made from naturally shed leaves.",
    badge2Title: "100% Natural & Compostable",
    badge2Sub: "Decomposes in 60 days into organic manure.",
    badge3Title: "Chemical-Free and Safe",
    badge3Sub: "No bleach, waxes or plastics. 100% food grade.",
    badge4Title: "Durable and Stylish",
    badge4Sub: "Heavy-duty, leak-proof, microwave & oven safe.",
    catAll: "All Tableware",
    catRound: "Round Plates",
    catSquare: "Square Plates",
    catBowls: "Bowls",
    catCutlery: "Cutlery",
    catCombos: "Party & Wedding Combos",
    bestsellersTitle: "Bestselling Eco Plates",
    bestsellersSubtitle: "Preferred choice for weddings, catering & daily green dining in Andhra Pradesh",
    whyTitle: "Why Choose Areca Leaf Plates?",
    whyPoint1Title: "100% Tree Friendly",
    whyPoint1Desc: "Collected only from naturally shed palm leaves. No living tree is ever harmed or chopped.",
    whyPoint2Title: "Hot & Cold Resistant",
    whyPoint2Desc: "Withstands hot curries, sambar, ice creams, microwave reheating without leaking or bending.",
    whyPoint3Title: "Fast Natural Degradation",
    whyPoint3Desc: "Turns into nutrient-rich compost in home soil within 6-8 weeks, unlike plastic or styrofoam.",
    whyPoint4Title: "Factory Direct in Eluru",
    whyPoint4Desc: "Directly manufactured in Eluru. Best wholesale pricing, uncompromised hygienic heat-press quality.",
    addToCart: "ADD",
    inCart: "IN CART",
    outOfStock: "Out of Stock",
    packOf: "Pack of",
    perPiece: "per pc",
    freeDeliveryNote: "Free delivery within Eluru on orders above ₹500",
    bulkDiscountNote: "Bulk Discount: 5% extra OFF on orders above ₹2,000",
    cartTitle: "Your Cart",
    cartEmpty: "Your cart is empty",
    cartEmptySub: "Add natural areca plates, bowls or combos to begin!",
    startShopping: "Browse Products",
    orderSummary: "Bill Details",
    itemTotal: "Item Total",
    bulkDiscount: "Bulk Savings (5% Off)",
    couponDiscount: "Coupon Discount",
    walletDeduction: "Referral Credit Used",
    deliveryFee: "Delivery Partner Fee",
    free: "FREE",
    gstAmount: "Taxes (GST 5%)",
    toPay: "Grand Total",
    proceedToCheckout: "Proceed to Checkout",
    loginToCheckout: "Login to Place Order",
    applyCoupon: "Apply Coupon",
    enterCoupon: "Enter coupon code (e.g. SANKRANTI10)",
    apply: "APPLY",
    remove: "REMOVE",
    useWalletCredits: "Use Wallet Credits (Available: ₹",
    checkoutTitle: "Checkout & Delivery",
    deliveryAddress: "Delivery Address (Eluru)",
    selectAddress: "Select Saved Address",
    addNewAddress: "+ Add New Address",
    nameLabel: "Full Name",
    mobileLabel: "Mobile Number",
    addressLabel: "Complete Delivery Address",
    landmarkLabel: "Landmark / Area",
    deliveryNotesLabel: "Delivery Instructions (optional)",
    paymentMethod: "Select Payment Method",
    codTitle: "Cash on Delivery (COD)",
    codDesc: "Pay by cash or UPI to delivery agent at your doorstep in Eluru.",
    upiTitle: "Online via UPI (Instant)",
    upiDesc: "Scan QR code or click UPI App button. Fast & secure.",
    confirmOrder: "Place Order",
    upiIdNote: "Payment account: anandmajji141@axl",
    enterUtr: "Enter 12-Digit UPI Transaction ID / UTR",
    utrHelp: "After completing payment in Google Pay / PhonePe / Paytm / BHIM, enter the 12-digit transaction UTR number.",
    ordersTitle: "My Orders",
    trackOrder: "Track Order",
    orderIdLabel: "Order ID",
    placedOn: "Placed on",
    reorder: "Reorder",
    cancelOrder: "Cancel Order",
    wishlistTitle: "My Wishlist",
    wishlistEmpty: "Your wishlist is empty.",
    accountTitle: "My Account",
    myOrders: "My Orders",
    myAddresses: "Saved Addresses",
    referralProgram: "Refer & Earn",
    referralDesc: "Share Sri Lakshmi Ganapathi with friends. When their first order is delivered, you get ₹100 credit, and they get ₹50 OFF!",
    shareWhatsApp: "Share on WhatsApp",
    yourRefCode: "Your Referral Code",
    walletBalance: "Wallet Credits Balance",
    logout: "Logout",
    loginTitle: "Login to Sri Lakshmi Ganapathi",
    registerTitle: "Create New Customer Account",
    usernameLabel: "Username",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm Password",
    forgotPassword: "Forgot Password?",
    loginBtn: "Login",
    registerBtn: "Register & Verify",
    dontHaveAccount: "Don't have an account? Register here",
    alreadyHaveAccount: "Already have an account? Login",
    enquiryTitle: "Bulk & Event Orders",
    enquirySub: "Supplying weddings, caterers, temple annadanam, and corporate events across Andhra Pradesh with factory wholesale rates.",
    eventType: "Event / Function Type",
    eventDate: "Event Date",
    platesCount: "Estimated Quantity (Number of Plates)",
    specialReq: "Special Requirements / Message",
    submitEnquiry: "Submit Bulk Enquiry",
    aboutTitle: "About Sri Lakshmi Ganapathi",
    aboutStory: "Located in the historic city of Eluru, Andhra Pradesh, Sri Lakshmi Ganapathi is a dedicated manufacturer of 100% natural, biodegradable areca palm leaf plates, bowls, and cutlery. We transform discarded fallen leaf sheaths of the areca nut palm into elegant, hygienic tableware through eco-conscious steam processing.",
    contactTitle: "Factory & Contact Details",
    factoryAddress: "8-176, Block 3, Sunkaravaari Thota, Madhepalli Road, Eluru, Eluru District, Andhra Pradesh 534001",
    callUs: "Call Directly",
    whatsappUs: "Chat on WhatsApp",
    hoursLabel: "Operating Hours",
    offersTitle: "Festival Offers & Discounts"
  },
  te: {
    brandName: "శ్రీ లక్ష్మీ గణపతి",
    brandSubtitle: "అరెకా ఆకు ప్లేట్ల తయారీదారులు",
    tagline: "సుస్థిరమైనది. సహజమైనది. స్వచ్ఛమైనది.",
    navHome: "హోమ్",
    navShop: "షాప్",
    navCart: "కార్ట్",
    navWishlist: "కోరికలు",
    navOrders: "ఆర్డర్లు",
    navAccount: "ఖాతా",
    navOwner: "ఓనర్ ప్యానెల్",
    searchPlaceholder: "ప్లేట్లు, బౌల్స్, కాంబోలను వెతకండి...",
    heroTitle: "100% సహజమైన అరెకా ఆకు భోజన పాత్రలు",
    heroSubtitle: "ఏలూరులో సహజంగా రాలిన అరెకా (వక్క) ఆకులతో నేరుగా తయారు చేయబడినవి. రసాయన రహితం మరియు 100% పర్యావరణ అనుకూలం.",
    heroBtnShop: "ఇప్పుడే ఆర్డర్ చేయండి",
    heroBtnBulk: "శుభకార్యాల హోల్‌సేల్ ఎంక్వైరీ",
    badge1Title: "పర్యావరణ అనుకూలం",
    badge1Sub: "చెట్లను నరకం. రాలిన ఆకులతోనే తయారీ.",
    badge2Title: "100% సహజం & కంపోస్టబుల్",
    badge2Sub: "60 రోజుల్లో మట్టిలో కలిసిపోయి ఎరువుగా మారుతుంది.",
    badge3Title: "రసాయన రహితం & సురక్షితం",
    badge3Sub: "ఎటువంటి ప్లాస్టిక్ లేదా బ్లీచ్ ఉండదు. ఆహారానికి శ్రేష్టం.",
    badge4Title: "దృఢమైనవి & స్టైలిష్",
    badge4Sub: "వేడి సాంబార్, పులుసులను తట్టుకుంటుంది. లీక్ అవ్వదు.",
    catAll: "అన్ని రకాలు",
    catRound: "గుండ్రని ప్లేట్లు",
    catSquare: "చతురస్ర ప్లేట్లు",
    catBowls: "గిన్నెలు (బౌల్స్)",
    catCutlery: "కట్లరీ సెట్లు",
    catCombos: "పార్టీ & పెళ్లి కాంబోలు",
    bestsellersTitle: "అత్యధికంగా అమ్ముడయ్యే ప్లేట్లు",
    bestsellersSubtitle: "వివాహాలు, క్యాటరింగ్ మరియు శుభకార్యాలకు ఆంధ్రప్రదేశ్ ప్రజల మొదటి ఎంపిక",
    whyTitle: "అరెకా ఆకు ప్లేట్లనే ఎందుకు ఎంచుకోవాలి?",
    whyPoint1Title: "చెట్లకు ఎలాంటి హాని ఉండదు",
    whyPoint1Desc: "సహజంగా రాలిన వక్క చెట్టు ఆకులను సేకరించి శుభ్రపరుస్తాం. ఒక్క చెట్టును కూడా నరకము.",
    whyPoint2Title: "వేడి మరియు చల్లని పదార్థాలకు తగినది",
    whyPoint2Desc: "వేడివేడి సాంబార్, కూరలు, ఐస్ క్రీమ్‌లు వడ్డించినా వంగిపోదు, లీక్ అవ్వదు.",
    whyPoint3Title: "త్వరితగతిన మట్టిలో కలుస్తుంది",
    whyPoint3Desc: "ప్లాస్టిక్ లేదా థర్మాకోల్ లాగా కాకుండా 6-8 వారాల్లో సహజ సేంద్రియ ఎరువుగా మారుతుంది.",
    whyPoint4Title: "ఏలూరు ఫ్యాక్టరీ నుండి నేరుగా",
    whyPoint4Desc: "మధ్యవర్తులు లేకుండా ఫ్యాక్టరీ హోల్‌సేల్ ధరలకే అత్యున్నత నాణ్యతతో లభిస్తాయి.",
    addToCart: "జోడించు",
    inCart: "కార్ట్‌లో ఉంది",
    outOfStock: "స్టాక్ లేదు",
    packOf: "ప్యాక్ సంఖ్య",
    perPiece: "ఒక్కోటి",
    freeDeliveryNote: "ఏలూరు పరిధిలో ₹500 పైన ఉచిత డెలివరీ",
    bulkDiscountNote: "బల్క్ డిస్కౌంట్: ₹2,000 పైన ఆర్డర్లకు అదనంగా 5% తగ్గింపు",
    cartTitle: "మీ కార్ట్",
    cartEmpty: "మీ కార్ట్ ఖాళీగా ఉంది",
    cartEmptySub: "సహజమైన అరెకా ప్లేట్లు లేదా కాంబోలను ఎంచుకోండి!",
    startShopping: "ఉత్పత్తులను చూడండి",
    orderSummary: "బిల్లు వివరాలు",
    itemTotal: "మొత్తం ధర",
    bulkDiscount: "బల్క్ ఆదా (5% తగ్గింపు)",
    couponDiscount: "కూపన్ తగ్గింపు",
    walletDeduction: "వాలెట్ క్రెడిట్ తగ్గింపు",
    deliveryFee: "డెలివరీ ఛార్జ్",
    free: "ఉచితం",
    gstAmount: "పన్నులు (GST 5%)",
    toPay: "చెల్లించవలసిన మొత్తం",
    proceedToCheckout: "చెక్‌అవుట్‌కు వెళ్లండి",
    loginToCheckout: "ఆర్డర్ చేయడానికి లాగిన్ అవ్వండి",
    applyCoupon: "కూపన్ వర్తింపజేయండి",
    enterCoupon: "కూపన్ కోడ్ నమోదు చేయండి (ఉదా: SANKRANTI10)",
    apply: "వర్తింపజేయి",
    remove: "తొలగించు",
    useWalletCredits: "వాలెట్ క్రెడిట్ వాడండి (నిల్వ: ₹",
    checkoutTitle: "ఆర్డర్ చెక్‌అవుట్ & డెలివరీ",
    deliveryAddress: "డెలివరీ చిరునామా (ఏలూరు)",
    selectAddress: "భద్రపరిచిన చిరునామా ఎంచుకోండి",
    addNewAddress: "+ కొత్త చిరునామా చేర్చండి",
    nameLabel: "పూర్తి పేరు",
    mobileLabel: "మొబైల్ నంబర్",
    addressLabel: "పూర్తి డెలివరీ చిరునామా",
    landmarkLabel: "ల్యాండ్‌మార్క్ / ప్రాంతం",
    deliveryNotesLabel: "డెలివరీ సూచనలు (ఐచ్ఛికం)",
    paymentMethod: "చెల్లింపు పద్ధతిని ఎంచుకోండి",
    codTitle: "క్యాష్ ఆన్ డెలివరీ (COD)",
    codDesc: "మీ ఇంటి వద్ద డెలివరీ తీసుకున్నప్పుడు నగదు లేదా యూపీఐ ద్వారా చెల్లించండి.",
    upiTitle: "ఆన్‌లైన్ UPI (తక్షణ చెల్లింపు)",
    upiDesc: "క్యూఆర్ కోడ్ స్కాన్ చేయండి లేదా యూపీఐ యాప్ ద్వారా సులభంగా చెల్లించండి.",
    confirmOrder: "ఆర్డర్ ఖరారు చేయండి",
    upiIdNote: "చెల్లింపు ఖాతా: anandmajji141@axl",
    enterUtr: "12 అంకెల UPI ట్రాన్సాక్షన్ ID / UTR నంబర్",
    utrHelp: "గూగుల్ పే / ఫోన్‌పే / పేటీఎం ద్వారా చెల్లించిన తర్వాత 12 అంకెల UTR నంబర్‌ను నమోదు చేయండి.",
    ordersTitle: "నా ఆర్డర్లు",
    trackOrder: "ఆర్డర్ ట్రాక్ చేయండి",
    orderIdLabel: "ఆర్డర్ ID",
    placedOn: "ఆర్డర్ చేసిన తేదీ",
    reorder: "మళ్లీ ఆర్డర్ చేయండి",
    cancelOrder: "ఆర్డర్ రద్దు చేయండి",
    wishlistTitle: "నా కోరికల జాబితా",
    wishlistEmpty: "మీ కోరికల జాబితా ఖాళీగా ఉంది.",
    accountTitle: "నా ఖాతా",
    myOrders: "నా ఆర్డర్లు",
    myAddresses: "సేవ్ చేసిన చిరునామాలు",
    referralProgram: "స్నేహితులకు చెప్పండి - సంపాదించండి",
    referralDesc: "మీ స్నేహితులను ఆహ్వానించండి. వారి మొదటి ఆర్డర్ డెలివరీ అయినప్పుడు మీకు ₹100, వారికి ₹50 లభిస్తాయి!",
    shareWhatsApp: "వాట్సాప్‌లో షేర్ చేయండి",
    yourRefCode: "మీ రెఫరల్ కోడ్",
    walletBalance: "వాలెట్ క్రెడిట్ నిల్వ",
    logout: "లాగౌట్",
    loginTitle: "శ్రీ లక్ష్మీ గణపతి లాగిన్",
    registerTitle: "కొత్త కస్టమర్ ఖాతాను సృష్టించండి",
    usernameLabel: "యూజర్‌నేమ్",
    passwordLabel: "పాస్‌వర్డ్",
    confirmPasswordLabel: "పాస్‌వర్డ్ నిర్ధారణ",
    forgotPassword: "పాస్‌వర్డ్ మర్చిపోయారా?",
    loginBtn: "లాగిన్",
    registerBtn: "రిజిస్టర్ చేసుకోండి",
    dontHaveAccount: "ఖాతా లేదా? ఇక్కడ రిజిస్టర్ అవ్వండి",
    alreadyHaveAccount: "ఖాతా ఉందా? లాగిన్ అవ్వండి",
    enquiryTitle: "పెద్ద ఆర్డర్లు & శుభకార్యాల ఎంక్వైరీ",
    enquirySub: "వివాహాలు, క్యాటరింగ్, ఆలయ అన్నదానాలు మరియు ఫంక్షన్లకు హోల్‌సేల్ ఫ్యాక్టరీ ధరలకే సరఫరా.",
    eventType: "శుభకార్యం రకం",
    eventDate: "కార్యం తేదీ",
    platesCount: "అవసరమైన ప్లేట్ల సంఖ్య",
    specialReq: "ప్రత్యేక వివరాలు / సందేశం",
    submitEnquiry: "ఎంక్వైరీ పంపండి",
    aboutTitle: "శ్రీ లక్ష్మీ గణపతి గురించి",
    aboutStory: "ఆంధ్రప్రదేశ్ ఏలూరు కేంద్రంగా పనిచేస్తున్న శ్రీ లక్ష్మీ గణపతి సంస్థ 100% సహజ సిద్ధమైన అరెకా వక్క ఆకు ప్లేట్లు మరియు పాత్రలను తయారు చేస్తోంది. ప్రకృతికి ఎలాంటి హాని లేకుండా పరిశుభ్రమైన వాతావరణంలో ఉత్తమ భోజన పాత్రలను అందిస్తున్నాం.",
    contactTitle: "ఫ్యాక్టరీ & సంప్రదించవలసిన వివరాలు",
    factoryAddress: "8-176, బ్లాక్ 3, సుంకరవారి తోట, మాధేపల్లి రోడ్, ఏలూరు, ఏలూరు జిల్లా, ఆంధ్రప్రదేశ్ 534001",
    callUs: "ఫోన్ చేయండి",
    whatsappUs: "వాట్సాప్ మెసేజ్ చేయండి",
    hoursLabel: "పని వేళలు",
    offersTitle: "పండుగ ఆఫర్లు & తగ్గింపులు"
  }
};

function t(key) {
  const lang = APP_STATE.lang;
  return (I18N[lang] && I18N[lang][key]) || (I18N['en'] && I18N['en'][key]) || key;
}

// Simple Web Audio API Synthesizer for Owner Dashboard order notifications
function playOrderChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const playTone = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // Uplifting chime: C5 -> E5 -> G5 -> C6
    playTone(523.25, now, 0.2);
    playTone(659.25, now + 0.15, 0.2);
    playTone(783.99, now + 0.3, 0.25);
    playTone(1046.50, now + 0.45, 0.4);
  } catch (e) {
    console.log("Audio chime error:", e);
  }
}

// Toast Notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '🌿' : '⚠️'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Router and Navigation
function navigateTo(route, params = {}) {
  APP_STATE.currentRoute = route;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderApp();

  // If entering owner route, initiate owner live polling
  if (route === 'owner') {
    startOwnerPolling();
  } else {
    stopOwnerPolling();
  }

  // If entering orders or account route, initiate customer orders polling
  if (route === 'orders' || (route === 'account' && accountActiveTab === 'orders')) {
    loadCustomerOrders().then(() => renderApp());
    startCustomerOrdersPolling();
  } else {
    stopCustomerOrdersPolling();
  }
}

// API Helper
async function apiRequest(endpoint, options = {}) {
  const headers = options.headers || {};
  if (APP_STATE.token) {
    headers['Authorization'] = `Bearer ${APP_STATE.token}`;
  }
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  try {
    const res = await fetch(endpoint, { credentials: 'omit', ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Server error occurred');
    }
    return data;
  } catch (err) {
    console.error("API Request Error:", err);
    throw err;
  }
}

// Language Switcher
function setLanguage(lang) {
  APP_STATE.lang = lang;
  localStorage.setItem('slg_lang', lang);
  renderApp();
}

// Cart Management
function addToCart(product, packMultiplier = 1) {
  const existingIndex = APP_STATE.cart.findIndex(it => it.id === product.id);
  const packSize = product.pack_size || 25;
  const price = product.price;

  if (existingIndex > -1) {
    APP_STATE.cart[existingIndex].qty += 1;
  } else {
    APP_STATE.cart.push({
      id: product.id,
      name: product.name,
      name_te: product.name_te,
      size: product.size,
      pack: packSize,
      price: price,
      qty: 1,
      image_url: product.image_url
    });
  }
  saveCart();
  
  // Pulse animation on cart badges
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.classList.add('cart-pulse');
    setTimeout(() => el.classList.remove('cart-pulse'), 500);
  });

  const displayName = APP_STATE.lang === 'te' && product.name_te ? product.name_te : product.name;
  showToast(`✅ ${displayName} added to your cart!`, 'success');
  showCartFloatingPill(product);
  renderApp();
}

function showCartFloatingPill(product) {
  let pill = document.getElementById('cart-floating-pill');
  if (!pill) {
    pill = document.createElement('div');
    pill.id = 'cart-floating-pill';
    document.body.appendChild(pill);
  }
  const totals = calculateCartTotals();
  const count = APP_STATE.cart.reduce((sum, it) => sum + it.qty, 0);
  pill.className = 'fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1F6B3A] text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-bold border border-[#7DB545] cursor-pointer';
  pill.onclick = () => navigateTo('cart');
  pill.innerHTML = `
    <span>🛒</span>
    <span>${count} Item${count > 1 ? 's' : ''} in Cart • ₹${totals.subtotal}</span>
    <span class="bg-[#7DB545] hover:bg-[#6CA239] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full ml-1">View Cart ➔</span>
  `;

  clearTimeout(window.cartPillTimeout);
  window.cartPillTimeout = setTimeout(() => {
    if (pill) pill.remove();
  }, 4500);
}

function updateCartQty(id, delta) {
  const item = APP_STATE.cart.find(it => it.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    APP_STATE.cart = APP_STATE.cart.filter(it => it.id !== id);
  }
  saveCart();
  renderApp();
}

function removeFromCart(id) {
  APP_STATE.cart = APP_STATE.cart.filter(it => it.id !== id);
  saveCart();
  renderApp();
}

function saveCart() {
  localStorage.setItem('slg_cart', JSON.stringify(APP_STATE.cart));
  renderNavbarBadges();
}

function toggleWishlist(productId) {
  const idx = APP_STATE.wishlist.indexOf(productId);
  if (idx > -1) {
    APP_STATE.wishlist.splice(idx, 1);
    showToast("Removed from Wishlist");
  } else {
    APP_STATE.wishlist.push(productId);
    showToast("Added to Wishlist ❤️");
  }
  localStorage.setItem('slg_wishlist', JSON.stringify(APP_STATE.wishlist));
  renderApp();
}

// Cart Calculations
function calculateCartTotals() {
  const subtotal = APP_STATE.cart.reduce((sum, it) => sum + (it.price * it.qty), 0);
  const bulkThreshold = APP_STATE.settings.bulk_discount_threshold || 2000;
  const bulkPct = APP_STATE.settings.bulk_discount_pct || 5;
  const bulkDiscount = subtotal >= bulkThreshold ? Math.round((subtotal * bulkPct) / 100) : 0;

  let couponDiscount = 0;
  if (APP_STATE.appliedCoupon) {
    if (APP_STATE.appliedCoupon.discount_type === 'percent') {
      couponDiscount = Math.round(((subtotal - bulkDiscount) * APP_STATE.appliedCoupon.discount_value) / 100);
    } else {
      couponDiscount = Math.min(subtotal - bulkDiscount, APP_STATE.appliedCoupon.discount_value);
    }
  }

  const effectiveAfterDiscount = subtotal - bulkDiscount - couponDiscount;
  const freeThreshold = APP_STATE.settings.free_delivery_threshold || 500;
  const stdDelivery = APP_STATE.settings.delivery_fee || 40;
  const deliveryFee = (subtotal === 0 || effectiveAfterDiscount >= freeThreshold) ? 0 : stdDelivery;

  let walletDeduction = 0; // Credit wallet removed per reliable COD/UPI business requirement

  let gstAmount = 0;
  if (APP_STATE.settings.gst_enabled) {
    const gstRate = APP_STATE.settings.gst_rate || 5;
    gstAmount = Math.round(((effectiveAfterDiscount - walletDeduction) * gstRate) / 100);
  }

  const grandTotal = Math.max(0, effectiveAfterDiscount - walletDeduction + deliveryFee + gstAmount);

  return {
    subtotal,
    bulkDiscount,
    couponDiscount,
    deliveryFee,
    walletDeduction,
    gstAmount,
    grandTotal,
    freeThreshold,
    amountNeededForFreeDelivery: Math.max(0, freeThreshold - effectiveAfterDiscount)
  };
}

// Initial Data Loading
async function loadInitialData() {
  try {
    const [prodRes, couponRes, settRes] = await Promise.all([
      apiRequest('/api/products').catch(() => ({ products: [] })),
      apiRequest('/api/coupons/active').catch(() => ({ coupons: [] })),
      apiRequest('/api/settings').catch(() => ({ settings: {} }))
    ]);
    APP_STATE.products = prodRes.products || [];
    APP_STATE.coupons = couponRes.coupons || [];
    APP_STATE.settings = settRes.settings || {};
  } catch (err) {
    console.error("Failed to load initial data", err);
  } finally {
    renderApp();
  }
}

// Owner Polling for Live Notifications & Sound Alert
function startOwnerPolling() {
  if (APP_STATE.ownerPollingTimer) return;
  APP_STATE.ownerPollingTimer = setInterval(async () => {
    if (APP_STATE.currentRoute !== 'owner' || !APP_STATE.user || APP_STATE.user.role !== 'owner') {
      stopOwnerPolling();
      return;
    }
    try {
      const res = await apiRequest('/api/owner/notifications');
      if (res.success && res.notifications.length > 0) {
        const latest = res.notifications[0];
        if (latest.id !== APP_STATE.lastKnownOrderId) {
          APP_STATE.lastKnownOrderId = latest.id;
          if (latest.type === 'order_placed') {
            playOrderChime();
            showToast(`🔔 ${latest.title}: ${latest.message.split('\n')[1] || ''}`, 'success');
            refreshOwnerDashboard();
          }
        }
      }
    } catch (e) {
      // background poll fail silent
    }
  }, 10000);
}

function stopOwnerPolling() {
  if (APP_STATE.ownerPollingTimer) {
    clearInterval(APP_STATE.ownerPollingTimer);
    APP_STATE.ownerPollingTimer = null;
  }
}

// PWA Install Event Listener
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  APP_STATE.deferredPrompt = e;
  const pwaBtn = document.getElementById('pwa-install-banner');
  if (pwaBtn) pwaBtn.classList.remove('hidden');
});

function triggerPwaInstall() {
  if (APP_STATE.deferredPrompt) {
    APP_STATE.deferredPrompt.prompt();
    APP_STATE.deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast("Sri Lakshmi Ganapathi app installed! Check your home screen.");
      }
      APP_STATE.deferredPrompt = null;
      const banner = document.getElementById('pwa-install-banner');
      if (banner) banner.classList.add('hidden');
    });
  }
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('SLG ServiceWorker registered successfully:', reg.scope);
    }).catch((err) => {
      console.log('SLG ServiceWorker registration failed:', err);
    });
  });
}

// UI View Rendering Engine
function renderNavbarBadges() {
  const cartCount = APP_STATE.cart.reduce((sum, it) => sum + it.qty, 0);
  const cartBadges = document.querySelectorAll('.cart-badge');
  cartBadges.forEach(el => {
    el.textContent = cartCount;
    el.style.display = cartCount > 0 ? 'inline-flex' : 'none';
  });

  const wishlistCount = APP_STATE.wishlist.length;
  const wishBadges = document.querySelectorAll('.wishlist-badge');
  wishBadges.forEach(el => {
    el.textContent = wishlistCount;
    el.style.display = wishlistCount > 0 ? 'inline-flex' : 'none';
  });
}

function renderApp() {
  const root = document.getElementById('app-root');
  if (!root) return;

  const user = APP_STATE.user;
  const isOwner = user && user.role === 'owner';

  // Build the complete shell
  root.innerHTML = `
    <!-- Top Sticky Bar (Zomato/Blinkit Style) -->
    <header class="sticky top-0 z-40 glass-header border-b border-[#E5DFD3] px-3 sm:px-6 py-2.5">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        <!-- Logo & Brand -->
        <div class="flex items-center gap-2 cursor-pointer" onclick="navigateTo('home')">
          <div class="relative w-10 h-10 rounded-full overflow-hidden bg-[#FAF8F2] border border-[#7DB545] p-0.5 shadow-sm shrink-0">
            <img src="/static/assets/images/leaf_emblem.png" alt="SLG Emblem" class="w-full h-full object-contain">
          </div>
          <div class="leading-tight">
            <div class="flex items-center gap-1.5">
              <span class="font-extrabold text-[#1F6B3A] text-sm sm:text-base tracking-tight font-serif">${t('brandName')}</span>
              <img src="/static/assets/images/ganesha.png" alt="Ganesha" class="h-4 w-auto object-contain hidden sm:inline-block">
            </div>
            <p class="text-[10px] text-[#7DB545] font-semibold tracking-wider uppercase hidden xs:block">${t('tagline')}</p>
          </div>
        </div>

        <!-- Quick Search Bar -->
        <div class="flex-1 max-w-md mx-1 sm:mx-4 relative">
          <input 
            type="text" 
            id="global-search-input"
            value="${APP_STATE.searchQuery}"
            placeholder="${t('searchPlaceholder')}" 
            class="w-full pl-9 pr-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-[#FAF8F2] border border-[#E5DFD3] rounded-full focus:outline-none focus:border-[#1F6B3A] focus:bg-white transition-all text-[#1A2E1F]"
            oninput="handleSearchInput(this.value)"
            onkeydown="if(event.key==='Enter') navigateTo('shop')"
          >
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          ${APP_STATE.searchQuery ? `<button onclick="clearSearch()" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>` : ''}
        </div>

        <!-- Top Right Phone Numbers (Owner 9642677869 & 9849052800) -->
        <div class="hidden xl:flex items-center gap-2.5 text-xs bg-[#FAF8F2] px-3 py-1 rounded-full border border-[#E5DFD3]">
          <a href="tel:9642677869" class="text-gray-800 hover:text-[#1F6B3A] flex items-center gap-1 font-bold">
            <span class="text-amber-600">👑</span> 9642677869 <span class="text-[10px] text-gray-500 font-normal">(Owner)</span>
          </a>
          <span class="text-gray-300">|</span>
          <a href="tel:9849052800" class="text-gray-800 hover:text-[#1F6B3A] flex items-center gap-1 font-semibold">
            📞 9849052800
          </a>
          <a href="https://api.whatsapp.com/send?phone=919642677869&text=Hello%20Sri%20Lakshmi%20Ganapathi,%20I%20would%20like%20to%20order%20areca%20plates." target="_blank" class="bg-[#25D366] text-white p-1 rounded-full hover:opacity-90" title="Chat on WhatsApp">
            <span class="text-[11px] px-0.5">💬</span>
          </a>
        </div>

        <!-- Top Right Actions -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <!-- Language Toggle -->
          <div class="flex bg-[#EBF5E9] rounded-full p-0.5 border border-[#CDE3CE] text-xs font-bold">
            <button onclick="setLanguage('en')" class="px-2 py-1 rounded-full transition-all ${APP_STATE.lang === 'en' ? 'bg-[#1F6B3A] text-white shadow-sm' : 'text-[#1F6B3A] hover:opacity-80'}">EN</button>
            <button onclick="setLanguage('te')" class="px-2 py-1 rounded-full transition-all ${APP_STATE.lang === 'te' ? 'bg-[#1F6B3A] text-white shadow-sm' : 'text-[#1F6B3A] hover:opacity-80'}">తెలుగు</button>
          </div>

          <!-- Wishlist Button (Desktop & Tablet) -->
          <button onclick="navigateTo('wishlist')" class="hidden sm:flex relative p-2 text-gray-700 hover:text-[#1F6B3A] rounded-full hover:bg-gray-100 transition-colors" title="${t('navWishlist')}">
            <span class="text-lg">🤍</span>
            <span class="wishlist-badge absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
          </button>

          <!-- Cart Button with Pill Subtotal -->
          <button onclick="navigateTo('cart')" class="flex items-center gap-1.5 bg-[#1F6B3A] hover:bg-[#18532D] text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm transition-all relative">
            <span>🛒</span>
            <span class="cart-badge bg-[#7DB545] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full">0</span>
            <span class="hidden md:inline font-bold">₹${calculateCartTotals().subtotal}</span>
          </button>

          <!-- User / Owner Profile Button -->
          ${user ? `
            <div class="relative group">
              <button onclick="navigateTo('${isOwner ? 'owner' : 'account'}')" class="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full ${isOwner ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-gray-100 text-gray-800'}">
                <span>${isOwner ? '👑' : '👤'}</span>
                <span class="hidden md:inline truncate max-w-[100px]">${user.full_name.split(' ')[0]}</span>
              </button>
            </div>
          ` : `
            <button onclick="openAuthModal('login')" class="text-xs font-bold text-[#1F6B3A] hover:bg-[#EBF5E9] px-3 py-1.5 rounded-full border border-[#1F6B3A] transition-all">
              ${t('loginBtn')}
            </button>
          `}
        </div>
      </div>
    </header>

    <!-- Sub-Header Navigation Links (Desktop) -->
    <nav class="hidden md:flex bg-white border-b border-[#E5DFD3] px-6 py-2">
      <div class="max-w-7xl mx-auto w-full flex items-center justify-between text-xs sm:text-sm font-medium text-gray-700">
        <div class="flex items-center gap-6">
          <button onclick="navigateTo('home')" class="hover:text-[#1F6B3A] ${APP_STATE.currentRoute === 'home' ? 'text-[#1F6B3A] font-bold border-b-2 border-[#1F6B3A] pb-1' : ''}">${t('navHome')}</button>
          <button onclick="navigateTo('shop')" class="hover:text-[#1F6B3A] ${APP_STATE.currentRoute === 'shop' ? 'text-[#1F6B3A] font-bold border-b-2 border-[#1F6B3A] pb-1' : ''}">${t('navShop')}</button>
          <button onclick="navigateTo('offers')" class="hover:text-[#1F6B3A] flex items-center gap-1 ${APP_STATE.currentRoute === 'offers' ? 'text-[#1F6B3A] font-bold border-b-2 border-[#1F6B3A] pb-1' : ''}">🏷️ ${t('offersTitle')}</button>
          <button onclick="navigateTo('enquiry')" class="hover:text-[#1F6B3A] ${APP_STATE.currentRoute === 'enquiry' ? 'text-[#1F6B3A] font-bold border-b-2 border-[#1F6B3A] pb-1' : ''}">${t('heroBtnBulk')}</button>
          <button onclick="navigateTo('about')" class="hover:text-[#1F6B3A] ${APP_STATE.currentRoute === 'about' ? 'text-[#1F6B3A] font-bold border-b-2 border-[#1F6B3A] pb-1' : ''}">${t('aboutTitle')}</button>
        </div>
        <div class="flex items-center gap-3 text-xs">
          <span class="text-[#7DB545] font-semibold flex items-center gap-1">📍 Eluru Factory Direct</span>
          <span class="text-gray-300">|</span>
          <a href="tel:9642677869" class="text-gray-800 hover:text-[#1F6B3A] flex items-center gap-1 font-bold">
            👑 9642677869 <span class="text-[10px] text-gray-500 font-normal">(Owner)</span>
          </a>
          <span class="text-gray-300">|</span>
          <a href="tel:9849052800" class="text-gray-700 hover:text-[#1F6B3A] flex items-center gap-1 font-semibold">
            📞 9849052800
          </a>
        </div>
      </div>
    </nav>

    <!-- Active Festival Offer Banner Strip -->
    ${renderActiveBannerStrip()}

    <!-- PWA Install Prompt Banner -->
    <div id="pwa-install-banner" class="hidden bg-[#1F6B3A] text-white px-4 py-2 text-xs flex items-center justify-between shadow-md">
      <div class="flex items-center gap-2">
        <span class="text-base">📲</span>
        <span>Install Sri Lakshmi Ganapathi App on your phone for instant 1-tap ordering!</span>
      </div>
      <button onclick="triggerPwaInstall()" class="bg-[#7DB545] hover:bg-[#6CA239] text-white px-3 py-1 rounded-full font-bold shadow-sm">Install App</button>
    </div>

    <!-- Main Content Area -->
    <main class="min-h-screen pb-24 md:pb-12">
      ${renderCurrentRouteView()}
    </main>

    <!-- Mobile Bottom Navigation (Zomato / Blinkit Style) -->
    <nav class="bottom-nav md:hidden flex items-center justify-around py-2 px-1 text-[11px] font-semibold text-gray-600">
      <button onclick="navigateTo('home')" class="flex flex-col items-center gap-0.5 ${APP_STATE.currentRoute === 'home' ? 'text-[#1F6B3A]' : ''}">
        <span class="text-lg">🏠</span>
        <span>${t('navHome')}</span>
      </button>

      <button onclick="navigateTo('shop')" class="flex flex-col items-center gap-0.5 ${APP_STATE.currentRoute === 'shop' ? 'text-[#1F6B3A]' : ''}">
        <span class="text-lg">🍃</span>
        <span>${t('navShop')}</span>
      </button>

      <button onclick="navigateTo('cart')" class="flex flex-col items-center gap-0.5 relative ${APP_STATE.currentRoute === 'cart' ? 'text-[#1F6B3A]' : ''}">
        <span class="text-lg">🛒</span>
        <span class="cart-badge absolute -top-1 right-2 bg-[#7DB545] text-white text-[10px] font-bold px-1 rounded-full">0</span>
        <span>${t('navCart')}</span>
      </button>

      <button onclick="navigateTo('wishlist')" class="flex flex-col items-center gap-0.5 relative ${APP_STATE.currentRoute === 'wishlist' ? 'text-[#1F6B3A]' : ''}">
        <span class="text-lg">🤍</span>
        <span class="wishlist-badge absolute -top-1 right-2 bg-red-500 text-white text-[10px] font-bold px-1 rounded-full">0</span>
        <span>${t('navWishlist')}</span>
      </button>

      <button onclick="navigateTo('orders')" class="flex flex-col items-center gap-0.5 ${APP_STATE.currentRoute === 'orders' ? 'text-[#1F6B3A]' : ''}">
        <span class="text-lg">📦</span>
        <span>${t('navOrders')}</span>
      </button>

      <button onclick="navigateTo('${isOwner ? 'owner' : 'account'}')" class="flex flex-col items-center gap-0.5 ${APP_STATE.currentRoute === 'account' || APP_STATE.currentRoute === 'owner' ? 'text-[#1F6B3A]' : ''}">
        <span class="text-lg">${isOwner ? '👑' : '👤'}</span>
        <span>${isOwner ? t('navOwner') : t('navAccount')}</span>
      </button>
    </nav>

    <!-- Floating AI Support Chat Button (Flipkart/Zomato style) -->
    ${renderSupportChatLauncher()}

    <!-- Floating AI Support Chat Drawer -->
    <div id="ai-support-drawer-container">
      ${renderSupportChatDrawer()}
    </div>

    <!-- Modals Container -->
    <div id="modal-container"></div>
  `;

  renderNavbarBadges();
}

function renderActiveBannerStrip() {
  const activeBanners = APP_STATE.coupons.filter(c => c.show_banner && c.banner_text);
  if (activeBanners.length === 0) return '';
  const banner = activeBanners[0];
  return `
    <div class="bg-gradient-to-r from-[#1F6B3A] to-[#2D8A4E] text-white px-3 py-1.5 text-xs text-center flex items-center justify-center gap-2 cursor-pointer shadow-inner" onclick="applyBannerCoupon('${banner.code}')">
      <span class="animate-pulse">✨</span>
      <span class="font-medium">${banner.banner_text}</span>
      <span class="bg-white text-[#1F6B3A] text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm ml-1 hover:bg-[#FAF8F2]">APPLY CODE</span>
    </div>
  `;
}

function applyBannerCoupon(code) {
  APP_STATE.appliedCoupon = APP_STATE.coupons.find(c => c.code === code) || null;
  showToast(`Coupon ${code} applied to your cart!`);
  navigateTo('cart');
}

function handleSearchInput(query) {
  APP_STATE.searchQuery = query;
  if (APP_STATE.currentRoute !== 'shop') {
    navigateTo('shop');
  } else {
    renderShopViewContent();
  }
}

function clearSearch() {
  APP_STATE.searchQuery = '';
  if (APP_STATE.currentRoute === 'shop') {
    renderShopViewContent();
  } else {
    renderApp();
  }
}

// Route View Router
function renderCurrentRouteView() {
  switch (APP_STATE.currentRoute) {
    case 'home':
      return renderHomeView();
    case 'shop':
      return renderShopView();
    case 'offers':
      return renderOffersView();
    case 'enquiry':
      return renderEnquiryView();
    case 'about':
      return renderAboutView();
    case 'cart':
      return renderCartView();
    case 'checkout':
      return renderCheckoutView();
    case 'order-success':
      return renderOrderSuccessView();
    case 'orders':
      accountActiveTab = 'orders';
      return renderAccountView();
    case 'wishlist':
      return renderWishlistView();
    case 'account':
      return renderAccountView();
    case 'owner':
      return renderOwnerDashboardView();
    default:
      return renderHomeView();
  }
}

// ----------------- HOME VIEW -----------------
function renderHomeView() {
  const bestsellers = APP_STATE.products.filter(p => p.is_bestseller);

  return `
    <div class="max-w-7xl mx-auto px-3 sm:px-6 pt-4 space-y-6 sm:space-y-8">
      
      <!-- Hero Banner -->
      <section class="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1F6B3A] via-[#267C46] to-[#124B25] text-white p-6 sm:p-10 shadow-lg">
        <div class="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none flex items-center justify-end overflow-hidden">
          <img src="/static/assets/images/leaf_emblem.png" alt="Leaf Background" class="w-96 h-96 object-contain -mr-16">
        </div>

        <div class="relative z-10 max-w-xl space-y-4">
          <div class="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold tracking-wide border border-white/20">
            <span>🌿</span>
            <span>Direct from Eluru Factory • 100% Biodegradable</span>
          </div>

          <h1 class="text-2xl sm:text-4xl font-extrabold font-serif leading-tight">
            ${t('heroTitle')}
          </h1>

          <p class="text-xs sm:text-sm text-green-50 leading-relaxed font-normal">
            ${t('heroSubtitle')}
          </p>

          <div class="flex flex-wrap items-center gap-3 pt-2">
            <button onclick="navigateTo('shop')" class="bg-[#7DB545] hover:bg-[#6CA239] text-white font-bold px-6 py-2.5 rounded-full text-sm shadow-md transition-all transform hover:scale-105">
              ${t('heroBtnShop')} ➔
            </button>
            <button onclick="navigateTo('enquiry')" class="bg-white/20 hover:bg-white/30 text-white font-semibold px-5 py-2.5 rounded-full text-sm backdrop-blur-sm border border-white/30 transition-all">
              ${t('heroBtnBulk')}
            </button>
          </div>

          <!-- Free delivery & minimum order callout -->
          <div class="pt-3 flex flex-wrap items-center gap-4 text-[11px] text-green-200">
            <span class="flex items-center gap-1">⚡ ${t('freeDeliveryNote')}</span>
            <span class="flex items-center gap-1">🏷️ ${t('bulkDiscountNote')}</span>
          </div>
        </div>
      </section>

      <!-- Category Quick Tiles -->
      <section class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-base sm:text-lg font-bold text-[#1A2E1F] font-serif">Categories</h2>
          <button onclick="navigateTo('shop')" class="text-xs font-bold text-[#1F6B3A] hover:underline">See All ➔</button>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-4">
          ${renderCategoryTile('round_plates', t('catRound'), '/static/assets/images/round_plate_set.jpg', '4 Sizes (6"-12")')}
          ${renderCategoryTile('square_plates', t('catSquare'), '/static/assets/images/square_plates_nested.jpg', '4 Sizes (4"-10")')}
          ${renderCategoryTile('bowls', t('catBowls'), '/static/assets/images/square_bowls_stack.jpg', '3 Deep Sizes')}
          ${renderCategoryTile('cutlery', t('catCutlery'), '/static/assets/images/combo_wedding_tray.jpg', 'Smooth Birchwood')}
          ${renderCategoryTile('combos', t('catCombos'), '/static/assets/images/combo_wedding_tray.jpg', '50 & 100 Guest Sets')}
        </div>
      </section>

      <!-- 4 Trust Badges Strip (from user asset) -->
      <section class="py-2">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="badge-card p-3 sm:p-4 flex items-center gap-3">
            <img src="/static/assets/images/badge_eco_friendly.png" alt="Eco Friendly" class="w-12 h-12 object-contain shrink-0">
            <div>
              <h4 class="text-xs sm:text-sm font-bold text-[#1F6B3A]">${t('badge1Title')}</h4>
              <p class="text-[11px] text-gray-500 leading-snug">${t('badge1Sub')}</p>
            </div>
          </div>

          <div class="badge-card p-3 sm:p-4 flex items-center gap-3">
            <img src="/static/assets/images/badge_100_natural.png" alt="100% Natural" class="w-12 h-12 object-contain shrink-0">
            <div>
              <h4 class="text-xs sm:text-sm font-bold text-[#1F6B3A]">${t('badge2Title')}</h4>
              <p class="text-[11px] text-gray-500 leading-snug">${t('badge2Sub')}</p>
            </div>
          </div>

          <div class="badge-card p-3 sm:p-4 flex items-center gap-3">
            <img src="/static/assets/images/badge_chemical_free.png" alt="Chemical Free" class="w-12 h-12 object-contain shrink-0">
            <div>
              <h4 class="text-xs sm:text-sm font-bold text-[#1F6B3A]">${t('badge3Title')}</h4>
              <p class="text-[11px] text-gray-500 leading-snug">${t('badge3Sub')}</p>
            </div>
          </div>

          <div class="badge-card p-3 sm:p-4 flex items-center gap-3">
            <img src="/static/assets/images/badge_durable.png" alt="Durable & Stylish" class="w-12 h-12 object-contain shrink-0">
            <div>
              <h4 class="text-xs sm:text-sm font-bold text-[#1F6B3A]">${t('badge4Title')}</h4>
              <p class="text-[11px] text-gray-500 leading-snug">${t('badge4Sub')}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Bestsellers Section -->
      <section class="space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base sm:text-xl font-bold text-[#1A2E1F] font-serif">${t('bestsellersTitle')}</h2>
            <p class="text-xs text-gray-500">${t('bestsellersSubtitle')}</p>
          </div>
          <button onclick="navigateTo('shop')" class="text-xs font-bold text-[#1F6B3A] hover:underline">View All (${APP_STATE.products.length}) ➔</button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          ${bestsellers.map(product => renderProductCard(product)).join('')}
        </div>
      </section>

      <!-- Why Areca Leaf? Educational Comparison -->
      <section class="bg-white rounded-2xl border border-[#E5DFD3] p-5 sm:p-8 space-y-6">
        <div class="text-center max-w-xl mx-auto space-y-1">
          <span class="text-xs font-bold text-[#7DB545] uppercase tracking-wider">Natural Heritage</span>
          <h2 class="text-lg sm:text-2xl font-bold font-serif text-[#1F6B3A]">${t('whyTitle')}</h2>
          <p class="text-xs text-gray-500">How naturally fallen areca leaves beat paper and single-use plastic in every measure.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl bg-[#FAF8F2] border border-[#E5DFD3] space-y-2">
            <div class="w-8 h-8 rounded-full bg-[#EBF5E9] text-[#1F6B3A] flex items-center justify-center font-bold text-sm">🌳</div>
            <h4 class="text-sm font-bold text-[#1A2E1F]">${t('whyPoint1Title')}</h4>
            <p class="text-xs text-gray-600 leading-relaxed">${t('whyPoint1Desc')}</p>
          </div>

          <div class="p-4 rounded-xl bg-[#FAF8F2] border border-[#E5DFD3] space-y-2">
            <div class="w-8 h-8 rounded-full bg-[#EBF5E9] text-[#1F6B3A] flex items-center justify-center font-bold text-sm">🍲</div>
            <h4 class="text-sm font-bold text-[#1A2E1F]">${t('whyPoint2Title')}</h4>
            <p class="text-xs text-gray-600 leading-relaxed">${t('whyPoint2Desc')}</p>
          </div>

          <div class="p-4 rounded-xl bg-[#FAF8F2] border border-[#E5DFD3] space-y-2">
            <div class="w-8 h-8 rounded-full bg-[#EBF5E9] text-[#1F6B3A] flex items-center justify-center font-bold text-sm">🌱</div>
            <h4 class="text-sm font-bold text-[#1A2E1F]">${t('whyPoint3Title')}</h4>
            <p class="text-xs text-gray-600 leading-relaxed">${t('whyPoint3Desc')}</p>
          </div>

          <div class="p-4 rounded-xl bg-[#FAF8F2] border border-[#E5DFD3] space-y-2">
            <div class="w-8 h-8 rounded-full bg-[#EBF5E9] text-[#1F6B3A] flex items-center justify-center font-bold text-sm">🏭</div>
            <h4 class="text-sm font-bold text-[#1A2E1F]">${t('whyPoint4Title')}</h4>
            <p class="text-xs text-gray-600 leading-relaxed">${t('whyPoint4Desc')}</p>
          </div>
        </div>

        <!-- Comparative Table for eco buyers -->
        <div class="overflow-x-auto pt-2">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="bg-[#FAF8F2] border-b border-[#E5DFD3] text-[#1F6B3A] font-bold">
                <th class="py-2.5 px-3">Feature</th>
                <th class="py-2.5 px-3 bg-[#EBF5E9]">Areca Leaf Plates (SLG)</th>
                <th class="py-2.5 px-3">Plastic Tableware</th>
                <th class="py-2.5 px-3">Paper / Bagasse</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E5DFD3] text-gray-700">
              <tr>
                <td class="py-2 px-3 font-semibold">Tree Friendly</td>
                <td class="py-2 px-3 bg-[#EBF5E9]/50 text-[#1F6B3A] font-bold">✅ 100% Fallen Leaves</td>
                <td class="py-2 px-3 text-red-600">❌ Petroleum Based</td>
                <td class="py-2 px-3 text-amber-600">⚠️ Trees / Crops</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-semibold">Hot Gravy / Sambar Safe</td>
                <td class="py-2 px-3 bg-[#EBF5E9]/50 text-[#1F6B3A] font-bold">✅ Heavy Duty & Rigid</td>
                <td class="py-2 px-3 text-red-600">❌ Leaches microplastics</td>
                <td class="py-2 px-3 text-amber-600">⚠️ Becomes soggy fast</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-semibold">Decomposition Time</td>
                <td class="py-2 px-3 bg-[#EBF5E9]/50 text-[#1F6B3A] font-bold">✅ 60 Days (Nutrient Manure)</td>
                <td class="py-2 px-3 text-red-600">❌ 450+ Years</td>
                <td class="py-2 px-3">90 - 180 Days</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-semibold">Chemicals & Coatings</td>
                <td class="py-2 px-3 bg-[#EBF5E9]/50 text-[#1F6B3A] font-bold">✅ 0% Chemical, Zero Wax</td>
                <td class="py-2 px-3 text-red-600">❌ Toxic Polymers</td>
                <td class="py-2 px-3 text-amber-600">⚠️ Plastic / Wax Lined</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Bulk Function Banner -->
      <section class="rounded-2xl bg-[#EBF5E9] border border-[#CDE3CE] p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="space-y-1.5 text-center sm:text-left">
          <div class="inline-block bg-[#1F6B3A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Wholesale Supply</div>
          <h3 class="text-lg sm:text-xl font-bold text-[#1F6B3A] font-serif">Planning a Wedding, Function, or Catering in Eluru?</h3>
          <p class="text-xs text-gray-600">Direct factory supply of 500 to 50,000+ plates with free transport assistance.</p>
        </div>
        <button onclick="navigateTo('enquiry')" class="shrink-0 bg-[#1F6B3A] hover:bg-[#18532D] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow transition-all">
          Request Bulk Quote ➔
        </button>
      </section>

    </div>
  `;
}

function renderCategoryTile(catKey, label, imgUrl, subtitle) {
  return `
    <div onclick="selectCategory('${catKey}')" class="cursor-pointer group bg-white border border-[#E5DFD3] rounded-xl p-2.5 sm:p-3 text-center transition-all hover:border-[#1F6B3A] hover:shadow-md">
      <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-lg overflow-hidden bg-[#FAF8F2] p-1 mb-2">
        <img src="${imgUrl}" alt="${label}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
      </div>
      <h4 class="text-xs font-bold text-[#1A2E1F] group-hover:text-[#1F6B3A] line-clamp-1">${label}</h4>
      <p class="text-[10px] text-gray-500 mt-0.5">${subtitle}</p>
    </div>
  `;
}

function selectCategory(catKey) {
  APP_STATE.activeCategory = catKey;
  navigateTo('shop');
}

// ----------------- SHOP VIEW -----------------
function renderShopView() {
  return `
    <div class="max-w-7xl mx-auto px-3 sm:px-6 pt-4 space-y-4">
      <!-- Breadcrumb & Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DFD3] pb-3">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold font-serif text-[#1F6B3A]">${t('navShop')}</h1>
          <p class="text-xs text-gray-500">Order factory-direct naturally pressed areca palm leaf plates, bowls & combos.</p>
        </div>

        <!-- Sort dropdown -->
        <div class="flex items-center gap-2 text-xs">
          <span class="text-gray-500 font-medium">Sort by:</span>
          <select id="sort-select" onchange="handleSortChange(this.value)" class="bg-white border border-[#E5DFD3] rounded-lg px-2.5 py-1.5 text-xs text-[#1A2E1F] focus:outline-none focus:border-[#1F6B3A]">
            <option value="default" ${APP_STATE.sortBy === 'default' ? 'selected' : ''}>Featured / Popular</option>
            <option value="price_asc" ${APP_STATE.sortBy === 'price_asc' ? 'selected' : ''}>Price: Low to High</option>
            <option value="price_desc" ${APP_STATE.sortBy === 'price_desc' ? 'selected' : ''}>Price: High to Low</option>
            <option value="rating" ${APP_STATE.sortBy === 'rating' ? 'selected' : ''}>Customer Rating</option>
          </select>
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        ${renderFilterPill('all', t('catAll'))}
        ${renderFilterPill('round_plates', t('catRound'))}
        ${renderFilterPill('square_plates', t('catSquare'))}
        ${renderFilterPill('bowls', t('catBowls'))}
        ${renderFilterPill('cutlery', t('catCutlery'))}
        ${renderFilterPill('combos', t('catCombos'))}
      </div>

      <!-- Products Grid Container -->
      <div id="shop-products-grid">
        ${renderFilteredProductGrid()}
      </div>
    </div>
  `;
}

function renderFilterPill(catKey, label) {
  const isActive = APP_STATE.activeCategory === catKey;
  return `
    <button 
      onclick="setShopCategory('${catKey}')"
      class="shrink-0 px-3.5 py-1.5 rounded-full transition-all border ${
        isActive 
          ? 'bg-[#1F6B3A] text-white border-[#1F6B3A] shadow-sm' 
          : 'bg-white text-gray-700 border-[#E5DFD3] hover:border-[#1F6B3A]'
      }"
    >
      ${label}
    </button>
  `;
}

function setShopCategory(catKey) {
  APP_STATE.activeCategory = catKey;
  renderShopViewContent();
}

function handleSortChange(sortVal) {
  APP_STATE.sortBy = sortVal;
  renderShopViewContent();
}

function renderShopViewContent() {
  const container = document.getElementById('shop-products-grid');
  if (container) {
    container.innerHTML = renderFilteredProductGrid();
  } else {
    renderApp();
  }
}

function renderFilteredProductGrid() {
  let list = [...APP_STATE.products];

  // Category filter
  if (APP_STATE.activeCategory !== 'all') {
    list = list.filter(p => p.category === APP_STATE.activeCategory);
  }

  // Search filter
  if (APP_STATE.searchQuery && APP_STATE.searchQuery.trim()) {
    const q = APP_STATE.searchQuery.toLowerCase();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.name_te && p.name_te.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      p.size.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (APP_STATE.sortBy === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (APP_STATE.sortBy === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (APP_STATE.sortBy === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  }

  if (list.length === 0) {
    return `
      <div class="text-center py-12 space-y-3 bg-white rounded-2xl border border-[#E5DFD3] p-6">
        <span class="text-4xl">🔍</span>
        <h3 class="text-base font-bold text-gray-800">No products match your search</h3>
        <p class="text-xs text-gray-500">Try changing filters or searching with another keyword.</p>
        <button onclick="clearSearch()" class="bg-[#1F6B3A] text-white px-4 py-2 rounded-full text-xs font-bold">Clear Filters</button>
      </div>
    `;
  }

  return `
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      ${list.map(p => renderProductCard(p)).join('')}
    </div>
  `;
}

// Product Card (Blinkit / Zomato Clean Mobile Card)
function renderProductCard(p) {
  const isWishlisted = APP_STATE.wishlist.includes(p.id);
  const cartItem = APP_STATE.cart.find(it => it.id === p.id);
  const displayName = APP_STATE.lang === 'te' && p.name_te ? p.name_te : p.name;
  const isOutOfStock = !p.in_stock;

  return `
    <div class="product-card rounded-xl p-2.5 sm:p-3 flex flex-col justify-between relative group">
      <!-- Top badges & Wishlist -->
      <div class="flex items-center justify-between w-full mb-1.5">
        ${p.badge ? `
          <span class="bg-[#EBF5E9] text-[#1F6B3A] text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
            ${p.badge}
          </span>
        ` : '<span></span>'}
        
        <button 
          onclick="event.stopPropagation(); toggleWishlist(${p.id})" 
          class="text-sm p-1 rounded-full hover:bg-gray-100 transition-colors"
          title="Add to Wishlist"
        >
          ${isWishlisted ? '❤️' : '🤍'}
        </button>
      </div>

      <!-- Image (Click opens Detail Modal) -->
      <div onclick="openProductModal(${p.id})" class="cursor-pointer w-full h-32 sm:h-40 bg-[#FAF8F2] rounded-lg overflow-hidden flex items-center justify-center p-1 relative">
        <img 
          src="${p.image_url}" 
          alt="${p.name}" 
          class="w-full h-full object-cover rounded group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        >
        ${isOutOfStock ? `
          <div class="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
            <span class="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">${t('outOfStock')}</span>
          </div>
        ` : ''}
      </div>

      <!-- Details -->
      <div onclick="openProductModal(${p.id})" class="cursor-pointer pt-2 space-y-1 flex-1">
        <div class="flex items-center gap-1 text-[11px] text-gray-500">
          <span class="bg-gray-100 px-1.5 py-0.2 rounded text-[10px] font-semibold">${p.size}</span>
          <span>•</span>
          <span>${t('packOf')} ${p.pack_size}</span>
        </div>

        <h3 class="text-xs sm:text-sm font-bold text-[#1A2E1F] line-clamp-2 leading-tight group-hover:text-[#1F6B3A] transition-colors">
          ${displayName}
        </h3>

        <!-- Rating & Per piece price -->
        <div class="flex items-center justify-between text-[11px] pt-0.5">
          <span class="text-gray-500 font-medium">₹${p.price_per_piece.toFixed(2)} ${t('perPiece')}</span>
          <span class="text-amber-600 font-bold flex items-center gap-0.5">⭐ ${p.rating || 4.9}</span>
        </div>
      </div>

      <!-- Bottom Price & Add to Cart Stepper -->
      <div class="flex items-center justify-between pt-3 mt-1 border-t border-gray-100">
        <div>
          <span class="text-sm sm:text-base font-extrabold text-[#1F6B3A]">₹${p.price}</span>
        </div>

        ${isOutOfStock ? `
          <button disabled class="bg-gray-200 text-gray-400 text-xs font-bold px-3 py-1.5 rounded-lg cursor-not-allowed">
            ${t('outOfStock')}
          </button>
        ` : cartItem ? `
          <!-- Stepper -->
          <div class="qty-stepper">
            <button onclick="event.stopPropagation(); updateCartQty(${p.id}, -1)" class="qty-btn">−</button>
            <span class="qty-val">${cartItem.qty}</span>
            <button onclick="event.stopPropagation(); updateCartQty(${p.id}, 1)" class="qty-btn">+</button>
          </div>
        ` : `
          <!-- Large Add Button -->
          <button 
            onclick="event.stopPropagation(); addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})" 
            class="bg-[#1F6B3A] hover:bg-[#18532D] text-white text-xs font-extrabold px-3.5 py-1.5 rounded-lg transition-all shadow-sm active:scale-95"
          >
            + ${t('addToCart')}
          </button>
        `}
      </div>
    </div>
  `;
}

// ----------------- PRODUCT DETAIL MODAL -----------------
function openProductModal(productId) {
  const p = APP_STATE.products.find(it => it.id === productId);
  if (!p) return;
  APP_STATE.selectedProduct = p;

  const modalContainer = document.getElementById('modal-container');
  const displayName = APP_STATE.lang === 'te' && p.name_te ? p.name_te : p.name;
  const displayDesc = APP_STATE.lang === 'te' && p.description_te ? p.description_te : p.description;
  const isWishlisted = APP_STATE.wishlist.includes(p.id);

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 modal-backdrop flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn" onclick="closeModal(event)">
      <div class="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl relative" onclick="event.stopPropagation()">
        
        <!-- Close Button -->
        <button onclick="closeModal()" class="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10">✕</button>

        <!-- Product Image -->
        <div class="w-full h-52 sm:h-64 bg-[#FAF8F2] rounded-xl overflow-hidden relative mb-4">
          <img src="${p.image_url}" alt="${p.name}" class="w-full h-full object-cover">
          ${p.badge ? `
            <span class="absolute top-3 left-3 bg-[#1F6B3A] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
              ${p.badge}
            </span>
          ` : ''}
        </div>

        <!-- Product Header -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#7DB545] uppercase tracking-wider">${p.category.replace('_', ' ')}</span>
            <button onclick="toggleWishlist(${p.id}); openProductModal(${p.id})" class="text-base p-1 rounded-full hover:bg-gray-100">
              ${isWishlisted ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
            </button>
          </div>

          <h2 class="text-lg sm:text-xl font-bold font-serif text-[#1A2E1F] leading-snug">
            ${displayName}
          </h2>

          <div class="flex items-center gap-3 text-xs text-gray-600">
            <span class="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">⭐ ${p.rating} (${p.reviews_count || 45} reviews)</span>
            <span>Size: <strong class="text-gray-900">${p.size}</strong></span>
            <span>Per Piece: <strong class="text-[#1F6B3A]">₹${p.price_per_piece.toFixed(2)}</strong></span>
          </div>

          <p class="text-xs sm:text-sm text-gray-600 leading-relaxed pt-1">
            ${displayDesc}
          </p>

          <!-- Pack Options Selector -->
          <div class="pt-3 border-t border-gray-100 space-y-2">
            <label class="text-xs font-bold text-gray-800">Choose Pack Quantity:</label>
            <div class="grid grid-cols-3 gap-2">
              <div onclick="setModalPack(1)" id="pack-opt-1" class="cursor-pointer border-2 border-[#1F6B3A] bg-[#EBF5E9] p-2.5 rounded-xl text-center">
                <span class="block text-xs font-bold text-[#1F6B3A]">25 Pcs</span>
                <span class="block text-sm font-extrabold text-[#1A2E1F] mt-0.5">₹${p.price}</span>
                <span class="block text-[10px] text-gray-500">Base Pack</span>
              </div>
              <div onclick="setModalPack(2)" id="pack-opt-2" class="cursor-pointer border border-[#E5DFD3] hover:border-[#1F6B3A] p-2.5 rounded-xl text-center">
                <span class="block text-xs font-bold text-gray-800">50 Pcs (2 Pks)</span>
                <span class="block text-sm font-extrabold text-[#1A2E1F] mt-0.5">₹${p.price * 2}</span>
                <span class="block text-[10px] text-[#7DB545] font-semibold">Save ₹10</span>
              </div>
              <div onclick="setModalPack(4)" id="pack-opt-4" class="cursor-pointer border border-[#E5DFD3] hover:border-[#1F6B3A] p-2.5 rounded-xl text-center">
                <span class="block text-xs font-bold text-gray-800">100 Pcs (4 Pks)</span>
                <span class="block text-sm font-extrabold text-[#1A2E1F] mt-0.5">₹${p.price * 4}</span>
                <span class="block text-[10px] text-[#1F6B3A] font-bold">Bulk Value</span>
              </div>
            </div>
          </div>

          <!-- Bulk Savings Callout -->
          <div class="bg-[#FAF8F2] border border-[#E5DFD3] p-2.5 rounded-lg text-[11px] text-[#1F6B3A] flex items-center gap-2">
            <span class="text-sm">🏷️</span>
            <span><strong>Bulk Discount Available:</strong> Orders above ₹2,000 get an automatic 5% instant discount at checkout!</span>
          </div>

          <!-- Bottom Action -->
          <div class="pt-4 flex items-center justify-between gap-3">
            <div>
              <span class="block text-[10px] text-gray-500 uppercase font-semibold">Total Price</span>
              <span id="modal-total-price" class="text-xl font-extrabold text-[#1F6B3A]">₹${p.price}</span>
            </div>

            <button 
              id="modal-add-btn"
              onclick="addModalProductToCart()"
              class="flex-1 bg-[#1F6B3A] hover:bg-[#18532D] text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-md transition-all text-center"
            >
              + ${t('addToCart')}
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}

let modalCurrentMultiplier = 1;

function setModalPack(multiplier) {
  modalCurrentMultiplier = multiplier;
  const p = APP_STATE.selectedProduct;
  if (!p) return;

  [1, 2, 4].forEach(m => {
    const el = document.getElementById(`pack-opt-${m}`);
    if (el) {
      if (m === multiplier) {
        el.className = 'cursor-pointer border-2 border-[#1F6B3A] bg-[#EBF5E9] p-2.5 rounded-xl text-center';
      } else {
        el.className = 'cursor-pointer border border-[#E5DFD3] hover:border-[#1F6B3A] p-2.5 rounded-xl text-center';
      }
    }
  });

  const priceEl = document.getElementById('modal-total-price');
  if (priceEl) {
    priceEl.textContent = `₹${p.price * multiplier}`;
  }
}

function addModalProductToCart() {
  const p = APP_STATE.selectedProduct;
  if (!p) return;
  for (let i = 0; i < modalCurrentMultiplier; i++) {
    addToCart(p);
  }
  closeModal();
}

function closeModal(event) {
  if (event && event.target !== event.currentTarget) return;
  const modalContainer = document.getElementById('modal-container');
  if (modalContainer) modalContainer.innerHTML = '';
}

// ----------------- OFFERS VIEW -----------------
function renderOffersView() {
  return `
    <div class="max-w-4xl mx-auto px-3 sm:px-6 pt-4 space-y-6">
      <div class="border-b border-[#E5DFD3] pb-3">
        <h1 class="text-xl sm:text-2xl font-bold font-serif text-[#1F6B3A] flex items-center gap-2">
          <span>🏷️</span> ${t('offersTitle')}
        </h1>
        <p class="text-xs text-gray-500">Active festival discounts, coupon codes & bulk ordering benefits for Sri Lakshmi Ganapathi customers.</p>
      </div>

      ${APP_STATE.coupons.length === 0 ? `
        <div class="bg-white rounded-2xl border border-[#E5DFD3] p-8 text-center space-y-3 shadow-sm">
          <span class="text-3xl">🌿</span>
          <h3 class="text-sm font-bold text-gray-800">No Active Festival Coupons Right Now</h3>
          <p class="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
            Sri Lakshmi Ganapathi offers everyday factory wholesale prices in Eluru. Check back during upcoming festivals for exclusive discount codes!
          </p>
          <button onclick="navigateTo('shop')" class="bg-[#1F6B3A] text-white text-xs font-bold px-5 py-2 rounded-full">
            Browse Products ➔
          </button>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${APP_STATE.coupons.map(c => `
            <div class="bg-white rounded-2xl border-2 border-dashed border-[#7DB545] p-5 shadow-sm space-y-3 relative overflow-hidden">
              <div class="flex items-start justify-between">
                <div>
                  <span class="inline-block bg-[#EBF5E9] text-[#1F6B3A] text-xs font-extrabold px-3 py-1 rounded-md tracking-wider">
                    ${c.code}
                  </span>
                  <h3 class="text-sm font-bold text-gray-800 mt-2">${c.description || c.code}</h3>
                </div>
                <span class="text-2xl">🎉</span>
              </div>
              <p class="text-xs text-gray-600">
                ${c.discount_type === 'percent' ? `Get <strong>${c.discount_value}% OFF</strong> on orders above ₹${c.min_order}` : `Get <strong>Flat ₹${c.discount_value} OFF</strong> on orders above ₹${c.min_order}`}
              </p>
              <div class="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span class="text-gray-400 text-[11px]">Valid Until: ${c.end_date || 'Festival End'}</span>
                <button onclick="applyBannerCoupon('${c.code}')" class="bg-[#1F6B3A] hover:bg-[#18532D] text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors">
                  Apply & Shop ➔
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}

      <!-- Bulk Discount Guide -->
      <div class="bg-[#FAF8F2] rounded-2xl border border-[#E5DFD3] p-5 space-y-3">
        <h3 class="text-sm font-bold text-[#1F6B3A] flex items-center gap-1.5">
          <span>📦</span> Automatic Bulk Discount
        </h3>
        <p class="text-xs text-gray-700 leading-relaxed">
          Order areca plates, bowls or combos worth ₹2,000 or more, and your cart will automatically receive a <strong>5% flat bulk discount</strong> without needing any coupon code!
        </p>
        <div class="pt-1 flex items-center gap-3">
          <button onclick="navigateTo('shop')" class="bg-[#7DB545] hover:bg-[#6CA239] text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm">
            Shop Products ➔
          </button>
        </div>
      </div>
    </div>
  `;
}

// ----------------- BULK & EVENT ENQUIRY VIEW -----------------
function renderEnquiryView() {
  return `
    <div class="max-w-3xl mx-auto px-3 sm:px-6 pt-4 space-y-6">
      <div class="text-center max-w-xl mx-auto space-y-2 border-b border-[#E5DFD3] pb-4">
        <div class="w-12 h-12 mx-auto rounded-full bg-[#EBF5E9] text-[#1F6B3A] flex items-center justify-center text-xl">🎉</div>
        <h1 class="text-xl sm:text-2xl font-bold font-serif text-[#1F6B3A]">${t('enquiryTitle')}</h1>
        <p class="text-xs text-gray-600 leading-relaxed">${t('enquirySub')}</p>
      </div>

      <div class="bg-white rounded-2xl border border-[#E5DFD3] p-5 sm:p-8 shadow-sm">
        <form id="bulk-enquiry-form" onsubmit="handleEnquirySubmit(event)" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">${t('nameLabel')} *</label>
              <input type="text" id="enq-name" required placeholder="e.g. Anand Varma / Bhavani Caterers" class="w-full text-xs sm:text-sm p-2.5 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]">
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">${t('mobileLabel')} *</label>
              <input type="tel" id="enq-mobile" required placeholder="10-digit mobile number" class="w-full text-xs sm:text-sm p-2.5 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">${t('eventType')} *</label>
              <select id="enq-type" required class="w-full text-xs sm:text-sm p-2.5 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]">
                <option value="Wedding / Reception">Wedding / Reception (వివాహం / రిసెప్షన్)</option>
                <option value="Birthday / Housewarming">Birthday / Housewarming (గృహప్రవేశం / పుట్టినరోజు)</option>
                <option value="Temple / Annadanam">Temple / Annadanam (ఆలయ అన్నదానం)</option>
                <option value="Catering Regular Supply">Catering Regular Supply (క్యాటరింగ్ సరఫరా)</option>
                <option value="Corporate / Institution">Corporate Event / College Function</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">${t('eventDate')} *</label>
              <input type="date" id="enq-date" required class="w-full text-xs sm:text-sm p-2.5 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">${t('platesCount')} *</label>
            <input type="text" id="enq-qty" required placeholder="e.g. 1500 Round Plates, 500 Bowls, 1000 Cutlery" class="w-full text-xs sm:text-sm p-2.5 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">${t('specialReq')}</label>
            <textarea id="enq-msg" rows="3" placeholder="Tell us if you require custom packaging, venue delivery location in Eluru, or sample inspection..." class="w-full text-xs sm:text-sm p-2.5 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]"></textarea>
          </div>

          <div class="pt-2">
            <button type="submit" id="enq-submit-btn" class="w-full bg-[#1F6B3A] hover:bg-[#18532D] text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all">
              ${t('submitEnquiry')} ➔
            </button>
          </div>
        </form>

        <!-- Direct WhatsApp button -->
        <div class="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span class="text-gray-500">Need immediate quotation over WhatsApp?</span>
          <a href="https://api.whatsapp.com/send?phone=919642677869&text=Hello%20Sri%20Lakshmi%20Ganapathi,%20I%20am%20looking%20for%20bulk%20areca%20leaf%20plates%20for%20an%20event." target="_blank" class="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
            <span>💬</span> Chat with Owner on WhatsApp
          </a>
        </div>
      </div>
    </div>
  `;
}

async function handleEnquirySubmit(event) {
  event.preventDefault();
  const btn = document.getElementById('enq-submit-btn');
  btn.disabled = true;
  btn.textContent = "Sending enquiry...";

  try {
    const payload = {
      name: document.getElementById('enq-name').value,
      mobile: document.getElementById('enq-mobile').value,
      event_type: document.getElementById('enq-type').value,
      event_date: document.getElementById('enq-date').value,
      quantity: document.getElementById('enq-qty').value,
      message: document.getElementById('enq-msg').value
    };

    const res = await apiRequest('/api/enquiries', {
      method: 'POST',
      body: payload
    });

    showToast("Bulk enquiry submitted! The owner will contact you shortly.");
    if (res.owner_whatsapp_url) {
      window.open(res.owner_whatsapp_url, '_blank');
    }
    navigateTo('home');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = t('submitEnquiry');
  }
}

// ----------------- ABOUT & CONTACT VIEW -----------------
function renderAboutView() {
  const phones = ["9849052800", "9642677869", "9346326432", "8309729149"];

  return `
    <div class="max-w-4xl mx-auto px-3 sm:px-6 pt-4 space-y-6">
      
      <!-- Brand Story -->
      <section class="bg-white rounded-2xl border border-[#E5DFD3] p-5 sm:p-8 space-y-4 shadow-sm">
        <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-[#FAF8F2] border-2 border-[#7DB545] p-1 shrink-0">
            <img src="/static/assets/images/brand_logo.png" alt="SLG Logo" class="w-full h-full object-contain">
          </div>
          <div>
            <div class="inline-block bg-[#EBF5E9] text-[#1F6B3A] text-xs font-bold px-2 py-0.5 rounded uppercase">Eluru, Andhra Pradesh</div>
            <h1 class="text-xl sm:text-2xl font-bold font-serif text-[#1F6B3A] mt-1">${t('brandName')}</h1>
            <p class="text-xs text-[#7DB545] font-semibold uppercase tracking-wider">${t('brandSubtitle')}</p>
          </div>
        </div>

        <p class="text-xs sm:text-sm text-gray-700 leading-relaxed">
          ${t('aboutStory')}
        </p>

        <!-- Process Highlights -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
          <div class="p-3 rounded-xl bg-[#FAF8F2] border border-[#E5DFD3] text-center space-y-1">
            <span class="text-xl">🍂</span>
            <h4 class="text-xs font-bold text-gray-800">1. Natural Fallen Sheaths</h4>
            <p class="text-[10px] text-gray-500">Zero green leaves or trees cut</p>
          </div>

          <div class="p-3 rounded-xl bg-[#FAF8F2] border border-[#E5DFD3] text-center space-y-1">
            <span class="text-xl">🚿</span>
            <h4 class="text-xs font-bold text-gray-800">2. High Pressure Wash</h4>
            <p class="text-[10px] text-gray-500">Pure water spring cleaning</p>
          </div>

          <div class="p-3 rounded-xl bg-[#FAF8F2] border border-[#E5DFD3] text-center space-y-1">
            <span class="text-xl">♨️</span>
            <h4 class="text-xs font-bold text-gray-800">3. Thermal Hydraulic Press</h4>
            <p class="text-[10px] text-gray-500">180°C sterilized steam shaping</p>
          </div>

          <div class="p-3 rounded-xl bg-[#FAF8F2] border border-[#E5DFD3] text-center space-y-1">
            <span class="text-xl">📦</span>
            <h4 class="text-xs font-bold text-gray-800">4. Shrink Packed</h4>
            <p class="text-[10px] text-gray-500">Hygienic dust-free dispatch</p>
          </div>
        </div>
      </section>

      <!-- Contact Details & Map -->
      <section class="bg-white rounded-2xl border border-[#E5DFD3] p-5 sm:p-8 space-y-5 shadow-sm">
        <h2 class="text-lg sm:text-xl font-bold font-serif text-[#1F6B3A]">${t('contactTitle')}</h2>

        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <span class="text-xl text-[#1F6B3A]">📍</span>
            <div>
              <h4 class="text-xs font-bold text-gray-800">Factory & Office Address:</h4>
              <p class="text-xs text-gray-600 mt-0.5 leading-relaxed">
                8-176, Block 3, Sunkaravaari Thota, Madhepalli Road, Eluru, Eluru District, Andhra Pradesh 534001
              </p>
              <a 
                href="https://maps.google.com/?q=8-176,+Block+3,+Sunkaravaari+Thota,+Madhepalli+Road,+Eluru,+Andhra+Pradesh+534001" 
                target="_blank" 
                class="inline-flex items-center gap-1 text-xs font-bold text-[#1F6B3A] hover:underline mt-1"
              >
                🗺️ Open in Google Maps ➔
              </a>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <span class="text-xl text-[#1F6B3A]">⏰</span>
            <div>
              <h4 class="text-xs font-bold text-gray-800">${t('hoursLabel')}:</h4>
              <p class="text-xs text-gray-600 mt-0.5">
                ${APP_STATE.settings.opening_hours || '7:30 AM - 9:00 PM (Monday - Sunday)'}
              </p>
            </div>
          </div>
        </div>

        <!-- Click to Call & WhatsApp Grid for all 4 phones -->
        <div class="pt-2 border-t border-gray-100 space-y-2">
          <h4 class="text-xs font-bold text-gray-800">Phone & WhatsApp Support (Click to Call or Chat):</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${phones.map(phone => `
              <div class="p-3 rounded-xl bg-[#FAF8F2] border border-[#E5DFD3] flex items-center justify-between">
                <div>
                  <span class="block text-xs font-extrabold text-[#1A2E1F] tracking-wide">📞 +91 ${phone}</span>
                  <span class="block text-[10px] text-gray-500">Sales & Customer Orders</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <a href="tel:${phone}" class="bg-[#1F6B3A] text-white p-2 rounded-lg text-xs font-bold hover:bg-[#18532D]" title="Call Now">
                    📞
                  </a>
                  <a href="https://api.whatsapp.com/send?phone=91${phone}&text=Hello%20Sri%20Lakshmi%20Ganapathi,%20I%20would%20like%20to%20order%20areca%20plates." target="_blank" class="bg-[#25D366] text-white p-2 rounded-lg text-xs font-bold hover:bg-[#20bd5a]" title="WhatsApp">
                    💬
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </section>

    </div>
  `;
}

// ----------------- CART VIEW -----------------
function renderCartView() {
  const totals = calculateCartTotals();

  if (APP_STATE.cart.length === 0) {
    return `
      <div class="max-w-md mx-auto px-4 pt-12 text-center space-y-4">
        <div class="w-20 h-20 mx-auto rounded-full bg-[#FAF8F2] border border-[#E5DFD3] flex items-center justify-center text-3xl">🛒</div>
        <h2 class="text-lg font-bold text-gray-800 font-serif">${t('cartEmpty')}</h2>
        <p class="text-xs text-gray-500">${t('cartEmptySub')}</p>
        <button onclick="navigateTo('shop')" class="bg-[#1F6B3A] hover:bg-[#18532D] text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-md">
          ${t('startShopping')} ➔
        </button>
      </div>
    `;
  }

  return `
    <div class="max-w-4xl mx-auto px-3 sm:px-6 pt-4 space-y-5">
      <div class="border-b border-[#E5DFD3] pb-3 flex items-center justify-between">
        <h1 class="text-xl sm:text-2xl font-bold font-serif text-[#1F6B3A]">${t('cartTitle')} (${APP_STATE.cart.length})</h1>
        <button onclick="navigateTo('shop')" class="text-xs font-bold text-[#1F6B3A] hover:underline">+ Add More Items</button>
      </div>

      <!-- Free Delivery Progress Bar -->
      <div class="bg-white rounded-xl border border-[#E5DFD3] p-3 space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-[#1F6B3A]">
            ${totals.amountNeededForFreeDelivery === 0 
              ? '🎉 You unlocked FREE Delivery within Eluru!' 
              : `Add ₹${totals.amountNeededForFreeDelivery} more for FREE Delivery!`}
          </span>
          <span class="text-gray-500 text-[11px]">Free above ₹${totals.freeThreshold}</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div 
            class="bg-[#7DB545] h-2 rounded-full transition-all duration-300" 
            style="width: ${Math.min(100, Math.round(((totals.freeThreshold - totals.amountNeededForFreeDelivery) / totals.freeThreshold) * 100))}%"
          ></div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        <!-- Cart Items List -->
        <div class="lg:col-span-2 space-y-3">
          ${APP_STATE.cart.map(item => `
            <div class="bg-white rounded-xl border border-[#E5DFD3] p-3 flex items-center gap-3">
              <img src="${item.image_url}" alt="${item.name}" class="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover bg-[#FAF8F2] shrink-0">
              <div class="flex-1 space-y-1">
                <h3 class="text-xs sm:text-sm font-bold text-gray-800 leading-tight">
                  ${APP_STATE.lang === 'te' && item.name_te ? item.name_te : item.name}
                </h3>
                <div class="text-[11px] text-gray-500">
                  <span>${item.size}</span> • <span>Pack of ${item.pack}</span>
                </div>
                <div class="text-xs font-extrabold text-[#1F6B3A]">
                  ₹${item.price} <span class="text-[10px] text-gray-400 font-normal">per pack</span>
                </div>
              </div>

              <!-- Stepper & Subtotal -->
              <div class="flex flex-col items-end gap-2 shrink-0">
                <span class="text-xs sm:text-sm font-extrabold text-[#1A2E1F]">₹${item.price * item.qty}</span>
                <div class="qty-stepper">
                  <button onclick="updateCartQty(${item.id}, -1)" class="qty-btn">−</button>
                  <span class="qty-val">${item.qty}</span>
                  <button onclick="updateCartQty(${item.id}, 1)" class="qty-btn">+</button>
                </div>
              </div>
            </div>
          `).join('')}

          <!-- Coupon Input Field -->
          <div class="bg-white rounded-xl border border-[#E5DFD3] p-3 space-y-2">
            <label class="block text-xs font-bold text-gray-800">${t('applyCoupon')}</label>
            ${APP_STATE.appliedCoupon ? `
              <div class="flex items-center justify-between bg-[#EBF5E9] p-2.5 rounded-lg border border-[#CDE3CE]">
                <div class="flex items-center gap-2">
                  <span class="text-sm">🎉</span>
                  <span class="text-xs font-extrabold text-[#1F6B3A]">${APP_STATE.appliedCoupon.code} Applied</span>
                </div>
                <button onclick="removeCoupon()" class="text-xs font-bold text-red-600 hover:underline">${t('remove')}</button>
              </div>
            ` : `
              <div class="flex gap-2">
                <input 
                  type="text" 
                  id="coupon-input" 
                  placeholder="${t('enterCoupon')}" 
                  class="flex-1 text-xs p-2.5 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg uppercase tracking-wider font-semibold focus:outline-none focus:border-[#1F6B3A]"
                >
                <button onclick="handleApplyCoupon()" class="bg-[#1F6B3A] hover:bg-[#18532D] text-white text-xs font-bold px-4 rounded-lg shadow-sm">
                  ${t('apply')}
                </button>
              </div>
            `}
          </div>



        </div>

        <!-- Bill Details Summary -->
        <div class="space-y-4">
          <div class="bg-white rounded-xl border border-[#E5DFD3] p-4 space-y-3 shadow-sm">
            <h3 class="text-sm font-bold text-[#1A2E1F] border-b border-gray-100 pb-2 font-serif">${t('orderSummary')}</h3>
            
            <div class="space-y-2 text-xs">
              <div class="flex justify-between text-gray-600">
                <span>${t('itemTotal')}</span>
                <span>₹${totals.subtotal}</span>
              </div>

              ${totals.bulkDiscount > 0 ? `
                <div class="flex justify-between text-[#7DB545] font-semibold">
                  <span>${t('bulkDiscount')}</span>
                  <span>-₹${totals.bulkDiscount}</span>
                </div>
              ` : ''}

              ${totals.couponDiscount > 0 ? `
                <div class="flex justify-between text-[#7DB545] font-semibold">
                  <span>${t('couponDiscount')} (${APP_STATE.appliedCoupon.code})</span>
                  <span>-₹${totals.couponDiscount}</span>
                </div>
              ` : ''}

              ${totals.walletDeduction > 0 ? `
                <div class="flex justify-between text-[#7DB545] font-semibold">
                  <span>${t('walletDeduction')}</span>
                  <span>-₹${totals.walletDeduction}</span>
                </div>
              ` : ''}

              <div class="flex justify-between text-gray-600">
                <span>${t('deliveryFee')}</span>
                <span>${totals.deliveryFee === 0 ? `<strong class="text-[#7DB545] font-bold">${t('free')}</strong>` : `₹${totals.deliveryFee}`}</span>
              </div>

              ${totals.gstAmount > 0 ? `
                <div class="flex justify-between text-gray-600">
                  <span>${t('gstAmount')}</span>
                  <span>₹${totals.gstAmount}</span>
                </div>
              ` : ''}

              <div class="border-t border-gray-100 pt-2 flex justify-between text-sm font-extrabold text-[#1F6B3A]">
                <span>${t('toPay')}</span>
                <span>₹${totals.grandTotal}</span>
              </div>
            </div>

            <!-- Proceed to Checkout Button -->
            <div class="pt-2">
              <button 
                onclick="handleProceedToCheckout()"
                class="w-full bg-[#1F6B3A] hover:bg-[#18532D] text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all text-center flex items-center justify-center gap-2"
              >
                <span>${APP_STATE.user ? t('proceedToCheckout') : t('loginToCheckout')}</span>
                <span>➔</span>
              </button>
            </div>
          </div>

          <!-- Trust callout -->
          <div class="text-[11px] text-gray-500 text-center space-y-1">
            <p>🛡️ 100% Secure Checkout • Cash on Delivery Available</p>
            <p>Direct manufacturer guarantee from Eluru, AP</p>
          </div>
        </div>

      </div>
    </div>
  `;
}

function handleApplyCoupon() {
  const code = (document.getElementById('coupon-input').value || '').trim().toUpperCase();
  if (!code) return;
  const coupon = APP_STATE.coupons.find(c => c.code === code);
  if (!coupon) {
    showToast("Invalid coupon code", "error");
    return;
  }
  const subtotal = APP_STATE.cart.reduce((sum, it) => sum + (it.price * it.qty), 0);
  if (subtotal < coupon.min_order) {
    showToast(`Order must be at least ₹${coupon.min_order} for code ${code}`, "error");
    return;
  }
  APP_STATE.appliedCoupon = coupon;
  showToast(`Coupon ${code} applied successfully!`);
  renderApp();
}

function removeCoupon() {
  APP_STATE.appliedCoupon = null;
  renderApp();
}

function toggleUseWallet(checked) {
  APP_STATE.useWallet = checked;
  renderApp();
}

function handleProceedToCheckout() {
  if (!APP_STATE.user) {
    // Preserve cart, prompt login, and return back automatically!
    openAuthModal('login', 'checkout');
    return;
  }
  navigateTo('checkout');
}

// ----------------- CHECKOUT VIEW -----------------
let checkoutPaymentMode = 'COD'; // COD is default and most visible

function renderCheckoutView() {
  const totals = calculateCartTotals();
  const user = APP_STATE.user;
  if (!user) {
    navigateTo('cart');
    return '';
  }

  const addresses = user.addresses || [];
  // Default to first saved address if available, or -1 (new address) if none
  if (addresses.length === 0) {
    checkoutSelectedAddressIndex = -1;
  } else if (checkoutSelectedAddressIndex >= addresses.length && checkoutSelectedAddressIndex !== -1) {
    checkoutSelectedAddressIndex = 0;
  }

  const eluruLocalities = [
    'Madhepalli Road (Near SLG Factory)',
    'Sunkaravaari Thota',
    'Tangellamudi',
    'Sanivarapupeta',
    'Vatluru',
    'Powerpet',
    'R.R. Pet (Ramachandra Rao Pet)',
    'Fire Station Center',
    'Ashok Nagar',
    'Chodimella',
    'GNT Road / Bypass',
    'Satrampadu',
    'Ponangi',
    'Vasantapeta / Agraharam',
    'Eluru Old Bus Stand / Railway Station',
    'Other Eluru Area / Mandal'
  ];

  return `
    <div class="max-w-3xl mx-auto px-3 sm:px-6 pt-4 space-y-5">
      <div class="border-b border-[#E5DFD3] pb-3">
        <h1 class="text-xl sm:text-2xl font-bold font-serif text-[#1F6B3A]">${t('checkoutTitle')}</h1>
        <p class="text-xs text-gray-500">Fast, safe doorstep delivery across Eluru city and surrounding mandals.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <!-- Left: Address & Payment Selection -->
        <div class="md:col-span-2 space-y-4">
          
          <!-- Delivery Address & Safe Location Block -->
          <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 sm:p-5 space-y-3.5 shadow-sm">
            <div class="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h3 class="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1.5 font-serif">
                <span>📍</span> Delivery Location (Eluru Doorstep Delivery)
              </h3>
              <button type="button" onclick="openAddAddressModal()" class="text-xs font-bold text-[#1F6B3A] hover:underline flex items-center gap-1">
                <span>+</span> Add Address to Profile
              </button>
            </div>

            <!-- GPS Current Location Detection -->
            <div class="p-3 bg-[#FAF8F2] border border-[#E5DFD3] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-sm">🎯</span>
                  <span class="text-xs font-bold text-gray-800">Pinpoint Exact GPS Location</span>
                </div>
                <p class="text-[11px] text-gray-500 mt-0.5">Helps our delivery agent reach your exact doorstep without repeated calls.</p>
              </div>
              <button 
                type="button" 
                onclick="detectCurrentLocationForCheckout()" 
                class="bg-[#1F6B3A] hover:bg-[#18532D] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95 transition-all"
              >
                <span>📍</span> Use Current Location
              </button>
            </div>

            ${checkoutGpsCoords ? `
              <div class="p-2.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-base">✅</span>
                  <div>
                    <span class="font-bold">GPS Location Attached:</span>
                    <span class="font-mono">${checkoutGpsCoords.lat}° N, ${checkoutGpsCoords.lng}° E</span>
                    <span class="text-[10px] text-green-700 block">High Accuracy GPS coordinates mapped to order</span>
                  </div>
                </div>
                <button onclick="checkoutGpsCoords=null;renderApp();" class="text-xs text-gray-400 hover:text-red-500">✕</button>
              </div>
            ` : ''}

            <!-- Saved Addresses Selector -->
            ${addresses.length > 0 ? `
              <div class="space-y-2 pt-1">
                <div class="flex items-center justify-between">
                  <span class="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">Select Delivery Address:</span>
                  <button type="button" onclick="selectCheckoutAddress(-1)" class="text-xs font-bold text-[#1F6B3A] hover:underline flex items-center gap-1">
                    <span>➕</span> Enter New Address
                  </button>
                </div>
                <div class="grid grid-cols-1 gap-2.5">
                  ${addresses.map((addr, idx) => `
                    <div 
                      onclick="selectCheckoutAddress(${idx})"
                      class="cursor-pointer p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 ${
                        checkoutSelectedAddressIndex === idx 
                          ? 'border-[#1F6B3A] bg-[#EBF5E9] shadow-xs' 
                          : 'border-[#E5DFD3] hover:border-[#1F6B3A] bg-white'
                      }"
                    >
                      <input type="radio" name="checkout_addr" value="${idx}" ${checkoutSelectedAddressIndex === idx ? 'checked' : ''} class="mt-1 w-4 h-4 text-[#1F6B3A]">
                      <div class="space-y-0.5 text-xs w-full">
                        <div class="flex items-center justify-between">
                          <span class="font-bold text-gray-900">${addr.type || 'Home'}: ${addr.name || user.full_name}</span>
                          ${addr.is_default ? '<span class="text-[9px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">Default Address</span>' : ''}
                        </div>
                        <p class="text-gray-700 leading-snug mt-0.5">${addr.address}</p>
                        <p class="text-gray-500 text-[11px] mt-1">📞 Contact: ${addr.mobile || user.mobile}</p>
                      </div>
                    </div>
                  `).join('')}

                  <!-- Option: Enter a New Address -->
                  <div 
                    onclick="selectCheckoutAddress(-1)"
                    class="cursor-pointer p-3 rounded-xl border-2 border-dashed transition-all flex items-center gap-2.5 ${
                      checkoutSelectedAddressIndex === -1 
                        ? 'border-[#1F6B3A] bg-[#EBF5E9]' 
                        : 'border-[#E5DFD3] hover:border-[#1F6B3A] bg-[#FAF8F2]'
                    }"
                  >
                    <input type="radio" name="checkout_addr" value="-1" ${checkoutSelectedAddressIndex === -1 ? 'checked' : ''} class="w-4 h-4 text-[#1F6B3A]">
                    <div class="text-xs font-bold ${checkoutSelectedAddressIndex === -1 ? 'text-[#1F6B3A]' : 'text-gray-700'}">
                      ➕ Deliver to a Different / New Address in Eluru
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- Dedicated Doorstep Delivery Address Form (Always shown if no saved address or selecting new address) -->
            ${(checkoutSelectedAddressIndex === -1 || addresses.length === 0) ? `
              <div id="checkout-new-address-form" class="mt-3 p-4 bg-[#FAF8F2] rounded-xl border border-[#E5DFD3] space-y-3.5 animate-fadeIn">
                <div class="border-b border-[#E5DFD3]/80 pb-2">
                  <h4 class="text-xs sm:text-sm font-bold text-[#1F6B3A] font-serif flex items-center gap-1.5">
                    <span>📍</span> Enter Doorstep Delivery Address in Eluru
                  </h4>
                  <p class="text-[11px] text-gray-600">Please provide your complete address details so our delivery team can deliver safely.</p>
                </div>

                <!-- Contact Person & Mobile -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label class="block text-[11px] font-bold text-gray-700 mb-1">Recipient Name <span class="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      id="checkout-contact-name" 
                      value="${user.full_name}" 
                      placeholder="e.g. Anand Majji" 
                      required 
                      class="w-full text-xs p-2.5 bg-white border border-[#E5DFD3] rounded-xl focus:border-[#1F6B3A] focus:outline-none"
                    >
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-gray-700 mb-1">Contact Mobile Number <span class="text-red-500">*</span></label>
                    <div class="flex items-center">
                      <span class="bg-gray-100 border border-r-0 border-[#E5DFD3] text-gray-600 px-2.5 py-2.5 rounded-l-xl text-xs font-bold">+91</span>
                      <input 
                        type="tel" 
                        id="checkout-contact-mobile" 
                        value="${user.mobile}" 
                        maxlength="10" 
                        placeholder="10-digit mobile number" 
                        required 
                        class="w-full text-xs p-2.5 bg-white border border-[#E5DFD3] rounded-r-xl focus:border-[#1F6B3A] focus:outline-none"
                      >
                    </div>
                  </div>
                </div>

                <!-- Door/House No & Street -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label class="block text-[11px] font-bold text-gray-700 mb-1">
                      Door / Flat / House Number <span class="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="checkout-door-no" 
                      placeholder="e.g. D.No 8-176, Flat 204, Block 3" 
                      required 
                      class="w-full text-xs p-2.5 bg-white border border-[#E5DFD3] rounded-xl focus:border-[#1F6B3A] focus:outline-none"
                    >
                    <span class="text-[10px] text-gray-500">House, flat, shop, or plot number</span>
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-gray-700 mb-1">
                      Street / Colony / Road Name <span class="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="checkout-street" 
                      placeholder="e.g. Sunkaravaari Thota, 2nd Cross Road" 
                      required 
                      class="w-full text-xs p-2.5 bg-white border border-[#E5DFD3] rounded-xl focus:border-[#1F6B3A] focus:outline-none"
                    >
                    <span class="text-[10px] text-gray-500">Colony, apartment or road name</span>
                  </div>
                </div>

                <!-- Locality Dropdown & Landmark -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label class="block text-[11px] font-bold text-gray-700 mb-1">
                      Area / Locality in Eluru <span class="text-red-500">*</span>
                    </label>
                    <select id="checkout-locality-select" class="w-full text-xs p-2.5 bg-white border border-[#E5DFD3] rounded-xl focus:border-[#1F6B3A] focus:outline-none">
                      ${eluruLocalities.map(loc => `<option value="${loc}">${loc}</option>`).join('')}
                    </select>
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-gray-700 mb-1">
                      Nearby Landmark <span class="text-gray-400 font-normal">(Helpful for delivery)</span>
                    </label>
                    <input 
                      type="text" 
                      id="checkout-landmark" 
                      placeholder="e.g. Near Ramalayam Temple / Water Tank" 
                      class="w-full text-xs p-2.5 bg-white border border-[#E5DFD3] rounded-xl focus:border-[#1F6B3A] focus:outline-none"
                    >
                  </div>
                </div>

                <!-- City & Pincode -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label class="block text-[11px] font-bold text-gray-700 mb-1">City & District</label>
                    <input 
                      type="text" 
                      value="Eluru, West Godavari / Eluru District, AP" 
                      readonly 
                      class="w-full text-xs p-2.5 bg-gray-100 border border-[#E5DFD3] rounded-xl text-gray-600 font-semibold cursor-not-allowed"
                    >
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-gray-700 mb-1">Pincode *</label>
                    <input 
                      type="text" 
                      id="checkout-pincode" 
                      value="534001" 
                      maxlength="6" 
                      class="w-full text-xs p-2.5 bg-white border border-[#E5DFD3] rounded-xl font-mono focus:border-[#1F6B3A] focus:outline-none"
                    >
                  </div>
                </div>

                <!-- Address Type & Save to Account -->
                <div class="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div class="flex items-center gap-3 text-xs">
                    <span class="font-bold text-gray-700 text-[11px]">Type:</span>
                    <label class="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="checkout_addr_type" value="Home" checked class="text-[#1F6B3A]">
                      <span>🏠 Home</span>
                    </label>
                    <label class="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="checkout_addr_type" value="Work" class="text-[#1F6B3A]">
                      <span>🏢 Work</span>
                    </label>
                    <label class="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="checkout_addr_type" value="Event / Function" class="text-[#1F6B3A]">
                      <span>🎉 Event</span>
                    </label>
                  </div>

                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" id="checkout-save-address" ${addresses.length === 0 ? 'checked' : ''} class="w-4 h-4 text-[#1F6B3A] rounded">
                    <span class="text-xs text-gray-700 font-medium">Save to My Addresses for future orders</span>
                  </label>
                </div>
              </div>
            ` : ''}

            <!-- Safe Delivery Instructions (Flipkart / Blinkit Style) -->
            <div class="pt-3 border-t border-gray-100 space-y-2">
              <label class="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <span>🛡️</span> Safe Delivery Instructions
              </label>
              <div class="flex flex-wrap gap-1.5 text-[11px]">
                ${renderSafeInstructionChip('call_before', '📞 Call before arriving')}
                ${renderSafeInstructionChip('leave_door', '🚪 Leave at doorstep / gate')}
                ${renderSafeInstructionChip('leave_guard', '🛡️ Leave with watchman / security')}
                ${renderSafeInstructionChip('dont_ring_bell', '🔔 Do not ring bell (sleeping)')}
                ${renderSafeInstructionChip('reception_drop', '🏢 Drop at reception / event hall')}
              </div>
            </div>

            <!-- Delivery Instructions / Notes -->
            <div>
              <label class="block text-[11px] font-semibold text-gray-600 mb-1">Additional Delivery Notes</label>
              <input 
                type="text" 
                id="checkout-notes" 
                placeholder="e.g. White gate on right, please deliver before 5 PM"
                class="w-full text-xs p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]"
              >
            </div>
          </div>

          <!-- Payment Options Block -->
          <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 sm:p-5 space-y-3.5 shadow-sm">
            <h3 class="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1.5 font-serif border-b border-gray-100 pb-2">
              <span>💳</span> ${t('paymentMethod')}
            </h3>

            <!-- 1. Cash on Delivery (COD) -->
            <div 
              onclick="setPaymentMode('COD')"
              class="cursor-pointer p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 ${
                checkoutPaymentMode === 'COD' 
                  ? 'border-[#1F6B3A] bg-[#EBF5E9]' 
                  : 'border-[#E5DFD3] hover:border-[#1F6B3A] bg-white'
              }"
            >
              <input type="radio" name="payment_mode" ${checkoutPaymentMode === 'COD' ? 'checked' : ''} class="mt-1 w-4 h-4 text-[#1F6B3A]">
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <span class="text-xs sm:text-sm font-bold text-gray-900">${t('codTitle')}</span>
                  <span class="bg-[#1F6B3A] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase">Recommended</span>
                </div>
                <p class="text-xs text-gray-600">${t('codDesc')}</p>
              </div>
            </div>

            <!-- 2. Online via UPI -->
            <div 
              onclick="setPaymentMode('UPI')"
              class="cursor-pointer p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 ${
                checkoutPaymentMode === 'UPI' 
                  ? 'border-[#1F6B3A] bg-[#EBF5E9]' 
                  : 'border-[#E5DFD3] hover:border-[#1F6B3A] bg-white'
              }"
            >
              <input type="radio" name="payment_mode" ${checkoutPaymentMode === 'UPI' ? 'checked' : ''} class="mt-1 w-4 h-4 text-[#1F6B3A]">
              <div class="space-y-1 w-full">
                <div class="flex items-center gap-2">
                  <span class="text-xs sm:text-sm font-bold text-gray-900">${t('upiTitle')}</span>
                  <span class="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase">GPay / PhonePe / Paytm</span>
                </div>
                <p class="text-xs text-gray-600">${t('upiDesc')}</p>

                ${checkoutPaymentMode === 'UPI' ? `
                  <div class="mt-3 pt-3 border-t border-green-200 space-y-3 bg-[#FAF8F2] p-3 rounded-xl border border-green-200">
                    <div class="text-xs text-[#1F6B3A] font-bold">
                      Official UPI ID: <span class="bg-white px-2 py-0.5 rounded border border-[#E5DFD3] text-gray-900 font-mono">anandmajji141@axl</span>
                    </div>

                    <!-- Dynamic UPI QR Code -->
                    <div class="flex flex-col sm:flex-row items-center gap-3">
                      <div class="w-32 h-32 bg-white p-1.5 rounded-xl border border-[#E5DFD3] shrink-0 shadow-sm">
                        <img 
                          src="/api/upi/qr?amount=${totals.grandTotal}&order_id=SLG-PAY" 
                          alt="UPI QR Code" 
                          class="w-full h-full object-contain"
                        >
                      </div>
                      <div class="text-xs text-gray-600 space-y-1">
                        <p class="font-bold text-gray-900">Scan using any UPI App</p>
                        <p class="text-[11px]">Google Pay, PhonePe, Paytm, BHIM, Cred or Any Bank App.</p>
                        <a 
                          href="upi://pay?pa=anandmajji141@axl&pn=Sri%20Lakshmi%20Ganapathi&am=${totals.grandTotal}&cu=INR&tn=SLG-ARECA-ORDER" 
                          class="inline-block bg-[#1F6B3A] hover:bg-[#18532D] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm mt-1"
                        >
                          📲 Pay with UPI App (₹${totals.grandTotal})
                        </a>
                      </div>
                    </div>

                    <!-- 12-Digit Transaction UTR Input -->
                    <div class="space-y-1 pt-2">
                      <label class="block text-xs font-bold text-gray-800">${t('enterUtr')} *</label>
                      <input 
                        type="text" 
                        id="checkout-utr" 
                        maxlength="12" 
                        placeholder="12-digit UPI Reference / UTR Number" 
                        class="w-full text-xs sm:text-sm p-2.5 bg-white border border-[#E5DFD3] rounded-lg font-mono tracking-wider focus:outline-none focus:border-[#1F6B3A]"
                      >
                      <p class="text-[10px] text-gray-500">${t('utrHelp')}</p>
                    </div>
                  </div>
                ` : ''}

              </div>
            </div>

          </div>

        </div>

        <!-- Right: Order Review & Confirm Button -->
        <div class="space-y-4">
          <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 sm:p-5 space-y-3 shadow-sm">
            <h3 class="text-sm font-bold text-[#1A2E1F] border-b border-gray-100 pb-2 font-serif">${t('orderSummary')}</h3>
            
            <div class="space-y-1.5 text-xs text-gray-600">
              <div class="flex justify-between">
                <span>Items (${APP_STATE.cart.length})</span>
                <span>₹${totals.subtotal}</span>
              </div>
              ${totals.bulkDiscount > 0 ? `
                <div class="flex justify-between text-[#7DB545]">
                  <span>Bulk Discount</span>
                  <span>-₹${totals.bulkDiscount}</span>
                </div>
              ` : ''}
              ${totals.couponDiscount > 0 ? `
                <div class="flex justify-between text-[#7DB545]">
                  <span>Coupon</span>
                  <span>-₹${totals.couponDiscount}</span>
                </div>
              ` : ''}
              <div class="flex justify-between">
                <span>Delivery</span>
                <span>${totals.deliveryFee === 0 ? 'FREE' : '₹' + totals.deliveryFee}</span>
              </div>
              <div class="border-t border-gray-100 pt-2 flex justify-between text-base font-extrabold text-[#1F6B3A]">
                <span>${t('toPay')}</span>
                <span>₹${totals.grandTotal}</span>
              </div>
            </div>

            <!-- Confirm Order Button -->
            <button 
              id="confirm-order-btn"
              onclick="submitFinalOrder()"
              class="w-full bg-[#1F6B3A] hover:bg-[#18532D] text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all text-center flex items-center justify-center gap-2 active:scale-95"
            >
              <span>${t('confirmOrder')}</span>
              <span>➔</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}

function selectCheckoutAddress(idx) {
  checkoutSelectedAddressIndex = idx;
  renderApp();
}

function renderSafeInstructionChip(key, label) {
  const isSelected = checkoutSafeInstructions.includes(key);
  return `
    <button 
      type="button"
      onclick="toggleSafeInstruction('${key}')"
      class="px-2.5 py-1 rounded-full border transition-all ${
        isSelected 
          ? 'bg-[#1F6B3A] text-white border-[#1F6B3A] font-bold shadow-xs' 
          : 'bg-[#FAF8F2] text-gray-700 border-[#E5DFD3] hover:border-[#1F6B3A]'
      }"
    >
      ${label}
    </button>
  `;
}

function toggleSafeInstruction(key) {
  if (checkoutSafeInstructions.includes(key)) {
    checkoutSafeInstructions = checkoutSafeInstructions.filter(k => k !== key);
  } else {
    checkoutSafeInstructions.push(key);
  }
  renderApp();
}

function detectCurrentLocationForCheckout() {
  if (!navigator.geolocation) {
    showToast("GPS Geolocation is not supported by your browser.", "error");
    return;
  }
  showToast("Detecting GPS location...", "info");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude.toFixed(4);
      const lng = pos.coords.longitude.toFixed(4);
      checkoutGpsCoords = { lat, lng };
      showToast(`📍 Location Pinpointed: ${lat}° N, ${lng}° E`);
      renderApp();
    },
    (err) => {
      console.warn("GPS error:", err);
      // Fallback coordinates for Eluru Madhepalli
      checkoutGpsCoords = { lat: "16.7107", lng: "81.0952" };
      showToast("📍 Attached Eluru factory location coordinates: 16.7107, 81.0952");
      renderApp();
    },
    { timeout: 8000 }
  );
}

function setPaymentMode(mode) {
  checkoutPaymentMode = mode;
  renderApp();
}

async function submitFinalOrder() {
  const user = APP_STATE.user;
  if (!user) {
    openAuthModal('login', 'checkout');
    return;
  }

  const totals = calculateCartTotals();
  let utr = null;
  if (checkoutPaymentMode === 'UPI') {
    const utrInput = document.getElementById('checkout-utr');
    utr = utrInput ? utrInput.value.trim() : '';
    if (!utr || utr.length < 8) {
      showToast("Please enter the 12-digit UPI Transaction ID / UTR", "error");
      return;
    }
  }

  const addresses = user.addresses || [];
  let deliveryAddressText = '';
  let contactName = '';
  let contactMobile = '';

  if (addresses.length > 0 && checkoutSelectedAddressIndex >= 0 && addresses[checkoutSelectedAddressIndex]) {
    const selected = addresses[checkoutSelectedAddressIndex];
    contactName = selected.name || user.full_name;
    contactMobile = selected.mobile || user.mobile;
    deliveryAddressText = `${selected.type || 'Home'}: ${selected.address} (Contact: ${contactName}, ${contactMobile})`;
  } else {
    // New Address Form validation
    const nameInput = document.getElementById('checkout-contact-name');
    const mobileInput = document.getElementById('checkout-contact-mobile');
    const doorInput = document.getElementById('checkout-door-no');
    const streetInput = document.getElementById('checkout-street');
    const localitySelect = document.getElementById('checkout-locality-select');
    const landmarkInput = document.getElementById('checkout-landmark');
    const pincodeInput = document.getElementById('checkout-pincode');
    const typeSelect = document.querySelector('input[name="checkout_addr_type"]:checked');

    contactName = nameInput ? nameInput.value.trim() : user.full_name;
    contactMobile = mobileInput ? mobileInput.value.trim() : user.mobile;
    const door = doorInput ? doorInput.value.trim() : '';
    const street = streetInput ? streetInput.value.trim() : '';
    const locality = localitySelect ? localitySelect.value : 'Madhepalli Road';
    const landmark = landmarkInput ? landmarkInput.value.trim() : '';
    const pincode = pincodeInput ? pincodeInput.value.trim() : '534001';
    const addrType = typeSelect ? typeSelect.value : 'Home';

    // Clear previous error borders
    [nameInput, mobileInput, doorInput, streetInput].forEach(el => el && el.classList.remove('border-red-500', 'ring-2', 'ring-red-200'));

    if (!contactName) {
      showToast("Please enter the contact person's name for delivery", "error");
      if (nameInput) {
        nameInput.classList.add('border-red-500', 'ring-2', 'ring-red-200');
        nameInput.focus();
      }
      return;
    }

    if (!contactMobile || contactMobile.length < 10) {
      showToast("Please enter a valid 10-digit mobile number for delivery updates", "error");
      if (mobileInput) {
        mobileInput.classList.add('border-red-500', 'ring-2', 'ring-red-200');
        mobileInput.focus();
      }
      return;
    }

    if (!door) {
      showToast("Please enter your Door / Flat / House Number to deliver safely!", "error");
      if (doorInput) {
        doorInput.classList.add('border-red-500', 'ring-2', 'ring-red-200');
        doorInput.focus();
      }
      return;
    }

    if (!street) {
      showToast("Please enter your Street / Colony / Road in Eluru to deliver safely!", "error");
      if (streetInput) {
        streetInput.classList.add('border-red-500', 'ring-2', 'ring-red-200');
        streetInput.focus();
      }
      return;
    }

    let fullAddressPart = `${door}, ${street}, ${locality}`;
    if (landmark) fullAddressPart += `, Near ${landmark}`;
    fullAddressPart += `, Eluru, AP - ${pincode}`;

    deliveryAddressText = `${addrType}: ${fullAddressPart} (Contact: ${contactName}, ${contactMobile})`;

    // Check if user wants to save this address to their account
    const saveCheckbox = document.getElementById('checkout-save-address');
    if (saveCheckbox && saveCheckbox.checked) {
      try {
        await apiRequest('/api/user/addresses', {
          method: 'POST',
          body: {
            type: addrType,
            name: contactName,
            mobile: contactMobile,
            address: fullAddressPart,
            is_default: false
          }
        });
        const userRes = await apiRequest('/api/auth/me');
        if (userRes && userRes.user) APP_STATE.user = userRes.user;
      } catch (err) {
        console.warn("Could not save address to account:", err);
      }
    }
  }

  // Attach GPS coordinates if captured
  if (checkoutGpsCoords) {
    deliveryAddressText += ` [📍 GPS: ${checkoutGpsCoords.lat}, ${checkoutGpsCoords.lng}]`;
  }

  const btn = document.getElementById('confirm-order-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>Placing order...</span>`;
  }

  try {
    const notesInput = document.getElementById('checkout-notes');
    let customNotes = notesInput ? notesInput.value.trim() : '';
    
    const safeLabels = {
      call_before: 'Call before arriving',
      leave_door: 'Leave at doorstep',
      leave_guard: 'Leave with watchman',
      dont_ring_bell: 'Do not ring bell',
      reception_drop: 'Drop at event hall/reception'
    };
    const safeSelectedText = checkoutSafeInstructions.map(k => safeLabels[k]).filter(Boolean).join(', ');
    
    let combinedNotes = '';
    if (safeSelectedText) {
      combinedNotes += `[Safe Delivery: ${safeSelectedText}] `;
    }
    if (customNotes) {
      combinedNotes += customNotes;
    }

    const payload = {
      customer_name: contactName,
      customer_mobile: contactMobile,
      customer_address: deliveryAddressText,
      delivery_notes: combinedNotes.trim(),
      items: APP_STATE.cart,
      payment_mode: checkoutPaymentMode,
      upi_ref_id: utr,
      coupon_code: APP_STATE.appliedCoupon ? APP_STATE.appliedCoupon.code : null,
      use_wallet: APP_STATE.useWallet
    };

    const res = await apiRequest('/api/orders', {
      method: 'POST',
      body: payload
    });

    // Clear cart and state
    APP_STATE.cart = [];
    APP_STATE.appliedCoupon = null;
    APP_STATE.useWallet = false;
    checkoutGpsCoords = null;
    saveCart();

    // Store completed order for success view
    APP_STATE.lastPlacedOrder = res;

    // Immediately reload customer orders list
    await loadCustomerOrders(true);

    showToast(`Order ${res.order_id} placed successfully!`);
    navigateTo('order-success');
  } catch (err) {
    showToast(err.message, 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>${t('confirmOrder')} ➔</span>`;
    }
  }
}

// ----------------- ORDER SUCCESS VIEW -----------------
function renderOrderSuccessView() {
  const o = APP_STATE.lastPlacedOrder || { order_id: 'SLG-2611-0001', total_amount: 500, payment_mode: 'COD' };

  return `
    <div class="max-w-md mx-auto px-4 pt-8 text-center space-y-5">
      <div class="w-20 h-20 mx-auto rounded-full bg-[#EBF5E9] border-4 border-[#7DB545] flex items-center justify-center text-3xl animate-bounce">
        ✅
      </div>

      <div class="space-y-1">
        <h1 class="text-xl sm:text-2xl font-bold font-serif text-[#1F6B3A]">Order Placed Successfully!</h1>
        <p class="text-xs text-gray-500">Thank you for dining sustainably with Sri Lakshmi Ganapathi.</p>
      </div>

      <div class="bg-white rounded-2xl border border-[#E5DFD3] p-5 text-left space-y-3 shadow-sm text-xs">
        <div class="flex justify-between border-b border-gray-100 pb-2">
          <span class="text-gray-500">Order ID:</span>
          <span class="font-mono font-extrabold text-[#1F6B3A] text-sm">${o.order_id}</span>
        </div>
        <div class="flex justify-between border-b border-gray-100 pb-2">
          <span class="text-gray-500">Total Amount:</span>
          <span class="font-extrabold text-gray-900">₹${o.total_amount}</span>
        </div>
        <div class="flex justify-between border-b border-gray-100 pb-2">
          <span class="text-gray-500">Payment Mode:</span>
          <span class="font-bold text-gray-800">${o.payment_mode}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Expected Delivery:</span>
          <span class="font-bold text-[#7DB545]">Within 2-4 Hours in Eluru</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-2">
        <button onclick="navigateTo('orders')" class="w-full bg-[#1F6B3A] hover:bg-[#18532D] text-white font-bold py-3 rounded-xl text-xs shadow-md transition-all">
          📦 Track Order Status ➔
        </button>

        ${o.owner_whatsapp_url ? `
          <a href="${o.owner_whatsapp_url}" target="_blank" class="block w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 rounded-xl text-xs shadow-sm">
            💬 Send Order Details to Owner on WhatsApp
          </a>
        ` : ''}

        <button onclick="navigateTo('shop')" class="w-full bg-white border border-[#E5DFD3] text-gray-700 hover:text-[#1F6B3A] font-bold py-2.5 rounded-xl text-xs">
          Continue Shopping
        </button>
      </div>
    </div>
  `;
}

// ----------------- ORDERS VIEW & TRACKER -----------------

async function loadCustomerOrders(silent = false) {
  if (!APP_STATE.user) return [];
  if (!silent) customerOrdersLoading = true;
  try {
    const res = await apiRequest('/api/orders/my-orders');
    const newOrders = res.orders || [];

    // Detect status updates for live alerts
    newOrders.forEach(newO => {
      const oldStatus = lastKnownOrderStatuses[newO.id];
      if (oldStatus && oldStatus !== newO.order_status) {
        showToast(`📦 Order #${newO.id} status updated to: ${newO.order_status}!`, 'info');
      }
      lastKnownOrderStatuses[newO.id] = newO.order_status;
    });

    customerOrdersList = newOrders;
    return customerOrdersList;
  } catch (e) {
    console.error("Failed to load customer orders:", e);
    return [];
  } finally {
    customerOrdersLoading = false;
  }
}

function startCustomerOrdersPolling() {
  stopCustomerOrdersPolling();
  customerOrdersPollTimer = setInterval(async () => {
    if (!APP_STATE.user) {
      stopCustomerOrdersPolling();
      return;
    }
    // Only continue polling if on account or orders view and on orders tab
    if (APP_STATE.currentRoute !== 'account' && APP_STATE.currentRoute !== 'orders') {
      stopCustomerOrdersPolling();
      return;
    }
    if (accountActiveTab !== 'orders') {
      stopCustomerOrdersPolling();
      return;
    }

    try {
      const res = await apiRequest('/api/orders/my-orders');
      if (res && res.orders) {
        let hasStatusChange = false;
        res.orders.forEach(newO => {
          const oldStatus = lastKnownOrderStatuses[newO.id];
          if (oldStatus && oldStatus !== newO.order_status) {
            hasStatusChange = true;
            showToast(`🔔 Order #${newO.id} status updated to: ${newO.order_status}!`, 'info');
          }
          lastKnownOrderStatuses[newO.id] = newO.order_status;
        });

        if (hasStatusChange || res.orders.length !== customerOrdersList.length) {
          customerOrdersList = res.orders;
          renderApp();
        }
      }
    } catch (e) {
      console.warn("Poll orders error:", e);
    }
  }, 3500);
}

function stopCustomerOrdersPolling() {
  if (customerOrdersPollTimer) {
    clearInterval(customerOrdersPollTimer);
    customerOrdersPollTimer = null;
  }
}

async function refreshSingleOrderStatus(orderId) {
  try {
    showToast(`Checking live status for order #${orderId}...`, 'info');
    const res = await apiRequest(`/api/orders/${orderId}`);
    if (res && res.order) {
      const updatedOrder = res.order;
      const idx = customerOrdersList.findIndex(x => x.id === orderId);
      if (idx !== -1) {
        customerOrdersList[idx] = updatedOrder;
      } else {
        customerOrdersList.unshift(updatedOrder);
      }
      lastKnownOrderStatuses[orderId] = updatedOrder.order_status;
      renderApp();
      showToast(`Order #${orderId} is currently: ${updatedOrder.order_status}`, 'success');
    }
  } catch (err) {
    showToast(`Could not refresh status: ${err.message}`, 'error');
  }
}

async function manualRefreshCustomerOrders() {
  showToast("Checking live status from Sri Lakshmi Ganapathi factory...", "info");
  await loadCustomerOrders();
  renderApp();
  showToast("Orders refreshed with live status!", "success");
}

function renderOrdersView() {
  accountActiveTab = 'orders';
  startCustomerOrdersPolling();
  loadCustomerOrders().then(() => renderApp());
  return renderAccountView();
}

function renderCustomerOrderCard(o) {
  const steps = ['Placed', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered'];
  const currentStepIdx = steps.indexOf(o.order_status);
  const isCancelled = o.order_status === 'Cancelled';

  let statusDetail = '📦 Handcrafted & inspected at our Madhepalli Road factory';
  if (o.order_status === 'Placed') {
    statusDetail = '📝 Order placed successfully! Sri Lakshmi Ganapathi factory team is reviewing your items.';
  } else if (o.order_status === 'Confirmed') {
    statusDetail = '👍 Order Confirmed! Manufacturing & batch allocation underway in Eluru.';
  } else if (o.order_status === 'Packed') {
    statusDetail = '🎁 Order Packed! Freshly inspected, sanitized & packed in protective areca crates at our Madhepalli Road unit.';
  } else if (o.order_status === 'Out for Delivery') {
    statusDetail = '🛵 Out for Delivery! Our delivery executive is en route to your doorstep in Eluru.';
  } else if (o.order_status === 'Delivered') {
    statusDetail = '✅ Safely Delivered! Thank you for choosing eco-friendly dinnerware from Sri Lakshmi Ganapathi.';
  } else if (isCancelled) {
    statusDetail = '❌ This order was cancelled.';
  }

  return `
    <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 sm:p-5 shadow-sm space-y-4">
      <!-- Order Header Row -->
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-mono font-extrabold text-[#1F6B3A] text-sm">${o.id}</span>
            <span class="text-[10px] bg-[#FAF8F2] border border-[#E5DFD3] text-gray-600 px-2 py-0.5 rounded font-medium">${o.created_at}</span>
          </div>
          <p class="text-[11px] text-gray-500 mt-0.5">
            ${o.payment_mode} • 
            <span class="${o.payment_status === 'Received' || o.payment_status === 'Verified' ? 'text-green-700 font-bold' : 'text-amber-700 font-semibold'}">${o.payment_status}</span>
          </p>
        </div>

        <div class="text-right">
          <span class="text-base font-extrabold text-gray-900">₹${o.total_amount}</span>
          <div class="mt-1 flex items-center justify-end gap-1.5">
            ${!isCancelled && o.order_status !== 'Delivered' ? `
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1F6B3A] opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[#1F6B3A]"></span>
              </span>
            ` : ''}
            <span class="inline-block text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
              isCancelled 
                ? 'text-red-700 bg-red-50 border border-red-200' 
                : (o.order_status === 'Delivered' 
                  ? 'text-green-800 bg-green-100 border border-green-300' 
                  : 'text-[#1F6B3A] bg-[#EBF5E9] border border-[#1F6B3A]/30')
            }">
              ${o.order_status}
            </span>
          </div>
        </div>
      </div>

      <!-- Live 5-Step Visual Progress Tracker (Flipkart / Blinkit Style) -->
      ${!isCancelled ? `
        <div class="py-3 px-2 sm:px-4 bg-[#FAF8F2] rounded-xl border border-[#E5DFD3]/80 space-y-2.5">
          <div class="flex items-center justify-between relative text-[9px] sm:text-[10px] font-semibold text-gray-500 px-2 sm:px-4">
            <div class="absolute top-2.5 left-6 right-6 h-1 bg-gray-200 -z-0 rounded-full"></div>
            <div 
              class="absolute top-2.5 left-6 h-1 bg-[#1F6B3A] -z-0 transition-all duration-700 rounded-full" 
              style="width: ${Math.max(0, (Math.max(0, currentStepIdx) / (steps.length - 1)) * 88)}%"
            ></div>

            ${steps.map((st, idx) => {
              const isPastOrCurrent = idx <= currentStepIdx;
              const isCurrentActive = idx === currentStepIdx && o.order_status !== 'Delivered';
              return `
                <div class="flex flex-col items-center gap-1.5 z-10">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all duration-500 shadow-sm ${
                    isCurrentActive 
                      ? 'bg-[#1F6B3A] text-white ring-4 ring-[#7DB545]/50 animate-pulse scale-110' 
                      : (isPastOrCurrent 
                        ? 'bg-[#1F6B3A] text-white ring-2 ring-[#EBF5E9]' 
                        : 'bg-white border-2 border-gray-300 text-gray-400')
                  }">
                    ${isPastOrCurrent ? '✓' : idx + 1}
                  </div>
                  <span class="text-center font-bold transition-colors ${
                    isCurrentActive 
                      ? 'text-[#1F6B3A] underline' 
                      : (isPastOrCurrent ? 'text-[#1F6B3A]' : 'text-gray-400')
                  }">${st}</span>
                </div>
              `;
            }).join('')}
          </div>
          <div class="text-center pt-1 text-xs text-gray-700 font-medium bg-white/70 rounded-lg p-2 border border-gray-100 flex items-center justify-center gap-2">
            <span>${o.order_status === 'Packed' ? '🎁' : (o.order_status === 'Delivered' ? '✅' : (o.order_status === 'Out for Delivery' ? '🛵' : 'ℹ️'))}</span>
            <span>${statusDetail}</span>
          </div>
        </div>
      ` : `
        <div class="bg-red-50 text-red-700 text-xs p-2.5 rounded-lg border border-red-200 flex items-center gap-2">
          <span>❌</span>
          <span>This order was cancelled.</span>
        </div>
      `}

      <!-- Delivery Location & Notes Preview -->
      <div class="p-3 bg-white rounded-xl border border-gray-100 space-y-1 text-xs">
        <div class="flex items-start gap-1.5 text-gray-700">
          <span class="text-[#1F6B3A] font-bold shrink-0">📍 Delivery To:</span>
          <span class="text-gray-800">${o.customer_address}</span>
        </div>
        ${o.delivery_notes ? `
          <div class="flex items-start gap-1.5 text-amber-800 text-[11px] pt-0.5">
            <span class="font-bold shrink-0">🛡️ Notes:</span>
            <span>${o.delivery_notes}</span>
          </div>
        ` : ''}
      </div>

      <!-- Itemized list preview -->
      <div class="bg-[#FAF8F2] rounded-xl p-3 space-y-1 text-xs">
        <span class="block text-[10px] font-bold text-gray-500 uppercase">Items (${(o.items || []).length}):</span>
        ${(o.items || []).map(it => `
          <div class="flex items-center justify-between text-gray-700">
            <span>• ${it.name} (${it.size}) × ${it.qty}</span>
            <span class="font-semibold text-gray-900">₹${it.total || (it.price * it.qty)}</span>
          </div>
        `).join('')}
      </div>

      <!-- Action Buttons Row -->
      <div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs border-t border-gray-100">
        <div class="flex items-center gap-2">
          <button onclick="refreshSingleOrderStatus('${o.id}')" class="text-xs font-bold text-[#1F6B3A] bg-[#EBF5E9] hover:bg-green-100 border border-[#1F6B3A]/30 px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-all active:scale-95">
            <span>🔄</span> Refresh Status
          </button>
          ${o.order_status === 'Placed' ? `
            <button onclick="handleCancelOrder('${o.id}')" class="text-red-600 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg font-bold">
              ${t('cancelOrder')}
            </button>
          ` : ''}
          <button onclick="openOrderInvoiceModal('${o.id}')" class="text-gray-700 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1">
            <span>📄</span> View Invoice
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="askAiAboutOrder('${o.id}')" class="text-[#1F6B3A] bg-[#EBF5E9] hover:bg-green-100 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
            <span>💬</span> Track with AI
          </button>
          <button onclick="handleReorder(${JSON.stringify(o.items).replace(/"/g, '&quot;')})" class="bg-[#1F6B3A] hover:bg-[#18532D] text-white font-bold px-4 py-1.5 rounded-lg flex items-center gap-1 shadow-xs active:scale-95 transition-all">
            <span>🔄</span> ${t('reorder')}
          </button>
        </div>
      </div>
    </div>
  `;
}

function askAiAboutOrder(orderId) {
  toggleSupportChat(true);
  sendSupportChatMessage(`Track order ${orderId}`);
}

function openOrderInvoiceModal(orderId) {
  const o = customerOrdersList.find(x => x.id === orderId);
  if (!o) return;

  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4" onclick="closeModal(event)">
      <div class="bg-white rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <button onclick="closeModal()" class="absolute top-4 right-4 text-gray-500 font-bold text-sm">✕</button>

        <!-- Printable Invoice Content -->
        <div id="printable-invoice" class="space-y-4 text-xs text-gray-800">
          <div class="text-center border-b border-gray-200 pb-3">
            <h2 class="text-base font-bold text-[#1F6B3A] font-serif">SRI LAKSHMI GANAPATHI</h2>
            <p class="text-[10px] text-gray-500">ARECA PLATES MANUFACTURERS • ELURU, AP</p>
            <p class="text-[10px] text-gray-400">Madhepalli Road, Sunkaravaari Thota, Eluru - 534001</p>
            <p class="text-[10px] text-gray-500 font-bold mt-1">TAX INVOICE / PACKING SLIP</p>
          </div>

          <div class="flex justify-between border-b border-gray-100 pb-2">
            <div>
              <p class="font-bold">Order ID: <span class="font-mono text-[#1F6B3A]">${o.id}</span></p>
              <p class="text-gray-500 text-[10px]">Date: ${o.created_at}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-green-700">Status: ${o.order_status}</p>
              <p class="text-[10px] text-gray-500">${o.payment_mode} • ${o.payment_status}</p>
            </div>
          </div>

          <div class="p-2.5 bg-[#FAF8F2] rounded-lg border border-[#E5DFD3]">
            <p class="font-bold text-[11px] text-gray-900">Billed & Delivered To:</p>
            <p class="font-semibold">${o.customer_name} (📞 ${o.customer_mobile})</p>
            <p class="text-gray-600 mt-0.5">${o.customer_address}</p>
            ${o.delivery_notes ? `<p class="text-amber-800 italic mt-0.5">Note: ${o.delivery_notes}</p>` : ''}
          </div>

          <div class="space-y-1 border-b border-gray-100 pb-3">
            <span class="block font-bold text-gray-700 text-[11px] mb-1">Ordered Items:</span>
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-gray-200 text-gray-500 text-[10px]">
                  <th class="py-1">Item Description</th>
                  <th class="py-1 text-center">Qty</th>
                  <th class="py-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${(o.items || []).map(it => `
                  <tr class="border-b border-gray-50">
                    <td class="py-1.5 font-medium">${it.name} (${it.size})</td>
                    <td class="py-1.5 text-center">${it.qty}</td>
                    <td class="py-1.5 text-right font-bold">₹${it.total || (it.price * it.qty)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="space-y-1 text-right font-medium">
            <div class="flex justify-between"><span>Subtotal:</span><span>₹${o.subtotal}</span></div>
            ${o.bulk_discount > 0 ? `<div class="flex justify-between text-[#7DB545]"><span>Bulk Discount (5%):</span><span>-₹${o.bulk_discount}</span></div>` : ''}
            ${o.coupon_discount > 0 ? `<div class="flex justify-between text-[#7DB545]"><span>Coupon Discount:</span><span>-₹${o.coupon_discount}</span></div>` : ''}
            <div class="flex justify-between"><span>Delivery:</span><span>${o.delivery_fee === 0 ? 'FREE' : '₹' + o.delivery_fee}</span></div>
            <div class="flex justify-between text-sm font-extrabold text-[#1F6B3A] border-t border-gray-200 pt-1.5">
              <span>Grand Total:</span>
              <span>₹${o.total_amount}</span>
            </div>
          </div>

          <div class="text-center text-[10px] text-gray-400 pt-2 border-t border-gray-100">
            Thank you for dining sustainably with 100% natural areca palm leaf plates!
          </div>
        </div>

        <div class="pt-4 flex items-center justify-end gap-2 no-print">
          <button onclick="window.print()" class="bg-[#1F6B3A] hover:bg-[#18532D] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm">
            <span>🖨️</span> Print Invoice
          </button>
          <button onclick="closeModal()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl">
            Close
          </button>
        </div>
      </div>
    </div>
  `;
}

// ----------------- WISHLIST VIEW -----------------
function renderWishlistView() {
  const wishlistedProducts = APP_STATE.products.filter(p => APP_STATE.wishlist.includes(p.id));

  return `
    <div class="max-w-4xl mx-auto px-3 sm:px-6 pt-4 space-y-5">
      <div class="border-b border-[#E5DFD3] pb-3">
        <h1 class="text-xl sm:text-2xl font-bold font-serif text-[#1F6B3A] flex items-center gap-2">
          <span>❤️</span> ${t('wishlistTitle')} (${wishlistedProducts.length})
        </h1>
        <p class="text-xs text-gray-500">Your saved areca plates and bowls ready to order.</p>
      </div>

      ${wishlistedProducts.length === 0 ? `
        <div class="max-w-md mx-auto text-center py-12 space-y-3">
          <span class="text-4xl">🤍</span>
          <h3 class="text-base font-bold text-gray-800">${t('wishlistEmpty')}</h3>
          <p class="text-xs text-gray-500">Click the heart icon on any plate to save for later.</p>
          <button onclick="navigateTo('shop')" class="bg-[#1F6B3A] text-white px-5 py-2 rounded-full text-xs font-bold">
            ${t('startShopping')} ➔
          </button>
        </div>
      ` : `
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          ${wishlistedProducts.map(p => renderProductCard(p)).join('')}
        </div>
      `}
    </div>
  `;
}

// ----------------- UNIFIED MODERN ACCOUNT HUB -----------------

function renderAccountView() {
  const user = APP_STATE.user;
  if (!user) {
    return `
      <div class="max-w-md mx-auto px-4 pt-12 text-center space-y-4">
        <span class="text-4xl">👤</span>
        <h2 class="text-lg font-bold text-gray-800 font-serif">Login to Manage Your Account</h2>
        <p class="text-xs text-gray-500">Track live orders, edit your profile, manage saved delivery addresses, and refer friends.</p>
        <button onclick="openAuthModal('login', 'account')" class="bg-[#1F6B3A] text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-md">
          ${t('loginBtn')} ➔
        </button>
      </div>
    `;
  }

  // Maintain live customer orders tracking
  if (accountActiveTab === 'orders') {
    startCustomerOrdersPolling();
    if (customerOrdersList.length === 0 && !customerOrdersLoading) {
      loadCustomerOrders().then(() => renderApp());
    }
  }

  return `
    <div class="max-w-4xl mx-auto px-3 sm:px-6 pt-4 space-y-5">
      
      <!-- Profile Header Card (Flipkart/Blinkit Style) -->
      <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 rounded-full bg-[#EBF5E9] border-2 border-[#1F6B3A] flex items-center justify-center text-2xl font-bold text-[#1F6B3A] shadow-xs shrink-0">
            ${user.full_name.charAt(0).toUpperCase()}
          </div>
          <div class="text-center sm:text-left">
            <div class="flex items-center gap-2 justify-center sm:justify-start">
              <h2 class="text-base sm:text-lg font-bold text-gray-900">${user.full_name}</h2>
              <span class="text-[10px] bg-[#EBF5E9] text-[#1F6B3A] font-bold px-2 py-0.5 rounded-full">Customer</span>
            </div>
            <p class="text-xs text-gray-500 mt-0.5">📞 +91 ${user.mobile} • @${user.username} ${user.email ? '• ' + user.email : ''}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="toggleSupportChat(true)" class="text-xs font-bold text-[#1F6B3A] hover:bg-[#EBF5E9] border border-[#1F6B3A] px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-xs">
            <span>💬</span> AI Help
          </button>
          <button onclick="handleLogout()" class="text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-xl transition-colors">
            🚪 ${t('logout')}
          </button>
        </div>
      </div>

      <!-- Account Navigation Tabs (Pills Bar) -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
        ${renderAccountTabBtn('orders', '📦 My Orders', customerOrdersList.length)}
        ${renderAccountTabBtn('profile', '👤 Edit Profile')}
        ${renderAccountTabBtn('addresses', '📍 Saved Addresses', (user.addresses || []).length)}
        ${renderAccountTabBtn('referrals', '🎁 Refer & Earn')}
        ${renderAccountTabBtn('help', '💬 Help & Support')}
      </div>

      <!-- Tab Content Area -->
      <div>
        ${renderAccountActiveTabContent(user)}
      </div>

    </div>
  `;
}

function renderAccountTabBtn(key, label, badgeCount = null) {
  const isActive = accountActiveTab === key;
  return `
    <button 
      onclick="setAccountActiveTab('${key}')"
      class="px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 border ${
        isActive 
          ? 'bg-[#1F6B3A] text-white border-[#1F6B3A] shadow-sm' 
          : 'bg-white text-gray-700 border-[#E5DFD3] hover:border-[#1F6B3A]'
      }"
    >
      <span>${label}</span>
      ${badgeCount !== null && badgeCount > 0 ? `
        <span class="px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white text-[#1F6B3A]' : 'bg-[#EBF5E9] text-[#1F6B3A]'} font-extrabold">
          ${badgeCount}
        </span>
      ` : ''}
    </button>
  `;
}

function setAccountActiveTab(tab) {
  accountActiveTab = tab;
  renderApp();
  if (tab === 'orders') {
    loadCustomerOrders().then(() => renderApp());
    startCustomerOrdersPolling();
  } else {
    stopCustomerOrdersPolling();
  }
}

function renderAccountActiveTabContent(user) {
  switch (accountActiveTab) {
    case 'orders':
      return renderAccountOrdersTab();
    case 'profile':
      return renderAccountProfileTab(user);
    case 'addresses':
      return renderAccountAddressesTab(user);
    case 'referrals':
      return renderAccountReferralsTab(user);
    case 'help':
      return renderAccountHelpTab();
    default:
      return renderAccountOrdersTab();
  }
}

// 1. ORDERS TAB
function renderAccountOrdersTab() {
  if (customerOrdersList.length === 0) {
    return `
      <div class="bg-white rounded-2xl border border-[#E5DFD3] p-10 text-center space-y-3 shadow-sm">
        <span class="text-4xl">📦</span>
        <h3 class="text-base font-bold text-gray-800">No Orders Placed Yet</h3>
        <p class="text-xs text-gray-500 max-w-sm mx-auto">Discover 100% natural, biodegradable areca palm leaf dinnerware manufactured directly in Eluru.</p>
        <button onclick="navigateTo('shop')" class="bg-[#1F6B3A] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md">
          Start Shopping ➔
        </button>
      </div>
    `;
  }

  return `
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-2xl border border-[#E5DFD3] shadow-xs">
        <div class="flex items-center gap-2">
          <span class="text-lg">📦</span>
          <div>
            <span class="text-xs sm:text-sm font-bold text-gray-900 block">Past & Active Orders (${customerOrdersList.length})</span>
            <span class="text-[10px] text-gray-500">Live order status synchronizes automatically with Eluru factory</span>
          </div>
        </div>
        <button onclick="manualRefreshCustomerOrders()" class="text-xs font-bold text-[#1F6B3A] bg-[#EBF5E9] hover:bg-green-100 border border-[#1F6B3A]/30 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs transition-all active:scale-95">
          <span>🔄</span> Check Live Status
        </button>
      </div>
      <div class="space-y-4">
        ${customerOrdersList.map(order => renderCustomerOrderCard(order)).join('')}
      </div>
    </div>
  `;
}

// 2. EDIT PROFILE TAB
function renderAccountProfileTab(user) {
  return `
    <div class="bg-white rounded-2xl border border-[#E5DFD3] p-5 sm:p-6 shadow-sm space-y-5">
      <div class="border-b border-gray-100 pb-3">
        <h3 class="text-sm font-bold text-gray-900 font-serif flex items-center gap-1.5">
          <span>👤</span> Personal Details & Preferences
        </h3>
        <p class="text-xs text-gray-500">Update your name, contact phone and email for seamless order delivery.</p>
      </div>

      <form onsubmit="saveUserProfile(event)" class="space-y-4 text-xs max-w-lg">
        <div>
          <label class="block font-bold text-gray-700 mb-1">Full Name *</label>
          <input 
            type="text" 
            id="profile-name" 
            required 
            value="${user.full_name}" 
            class="w-full p-2.5 bg-[#FAF8F2] border border-[#E5DFD3] rounded-xl focus:outline-none focus:border-[#1F6B3A]"
          >
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Mobile Number (Login & Delivery Notifications) *</label>
          <div class="flex items-center gap-2">
            <span class="bg-[#FAF8F2] border border-[#E5DFD3] px-3 py-2.5 rounded-xl font-bold text-gray-600">+91</span>
            <input 
              type="tel" 
              id="profile-mobile" 
              required 
              maxlength="10"
              value="${user.mobile}" 
              class="w-full p-2.5 bg-[#FAF8F2] border border-[#E5DFD3] rounded-xl focus:outline-none focus:border-[#1F6B3A]"
            >
          </div>
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Email Address (Optional)</label>
          <input 
            type="email" 
            id="profile-email" 
            value="${user.email || ''}" 
            placeholder="e.g. name@example.com"
            class="w-full p-2.5 bg-[#FAF8F2] border border-[#E5DFD3] rounded-xl focus:outline-none focus:border-[#1F6B3A]"
          >
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Username (Permanent Account ID)</label>
          <input 
            type="text" 
            disabled 
            value="@${user.username}" 
            class="w-full p-2.5 bg-gray-100 border border-gray-200 text-gray-500 rounded-xl font-mono cursor-not-allowed"
          >
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1.5">Preferred Language</label>
          <div class="flex items-center gap-3">
            <button 
              type="button" 
              onclick="toggleLanguage('en')" 
              class="px-4 py-2 rounded-xl border text-xs font-bold ${APP_STATE.language === 'en' ? 'bg-[#1F6B3A] text-white border-[#1F6B3A]' : 'bg-[#FAF8F2] text-gray-700 border-[#E5DFD3]'}"
            >
              English
            </button>
            <button 
              type="button" 
              onclick="toggleLanguage('te')" 
              class="px-4 py-2 rounded-xl border text-xs font-bold ${APP_STATE.language === 'te' ? 'bg-[#1F6B3A] text-white border-[#1F6B3A]' : 'bg-[#FAF8F2] text-gray-700 border-[#E5DFD3]'}"
            >
              తెలుగు (Telugu)
            </button>
          </div>
        </div>

        <div class="pt-2">
          <button 
            type="submit" 
            id="save-profile-btn"
            class="bg-[#1F6B3A] hover:bg-[#18532D] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
          >
            💾 Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  `;
}

async function saveUserProfile(event) {
  event.preventDefault();
  const nameInput = document.getElementById('profile-name');
  const mobileInput = document.getElementById('profile-mobile');
  const emailInput = document.getElementById('profile-email');

  const fullName = nameInput ? nameInput.value.trim() : '';
  const mobile = mobileInput ? mobileInput.value.trim().replace(/\s+/g, '') : '';
  const email = emailInput ? emailInput.value.trim() : '';

  if (!fullName || mobile.length !== 10) {
    showToast("Please enter a valid full name and 10-digit mobile number.", "error");
    return;
  }

  const btn = document.getElementById('save-profile-btn');
  if (btn) btn.innerHTML = "Saving...";

  try {
    const res = await apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: {
        full_name: fullName,
        mobile: mobile,
        email: email
      }
    });

    if (res.user) {
      APP_STATE.user = res.user;
      localStorage.setItem('slg_user', JSON.stringify(res.user));
    } else {
      APP_STATE.user.full_name = fullName;
      APP_STATE.user.mobile = mobile;
      APP_STATE.user.email = email;
      localStorage.setItem('slg_user', JSON.stringify(APP_STATE.user));
    }

    showToast("Profile updated successfully!");
    renderApp();
  } catch (err) {
    showToast(err.message, "error");
    if (btn) btn.innerHTML = "💾 Save Profile Changes";
  }
}

// 3. SAVED ADDRESSES TAB
function renderAccountAddressesTab(user) {
  const addresses = user.addresses || [];

  return `
    <div class="bg-white rounded-2xl border border-[#E5DFD3] p-5 sm:p-6 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h3 class="text-sm font-bold text-gray-900 font-serif flex items-center gap-1.5">
            <span>📍</span> Saved Delivery Locations (${addresses.length})
          </h3>
          <p class="text-xs text-gray-500">Fast 1-tap checkout for your home, catering hall, or office in Eluru.</p>
        </div>
        <button onclick="openAddAddressModal()" class="bg-[#1F6B3A] hover:bg-[#18532D] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-sm">
          <span>+</span> Add Address
        </button>
      </div>

      ${addresses.length === 0 ? `
        <div class="text-center py-8 text-gray-500 text-xs space-y-2">
          <span class="text-3xl block">🏠</span>
          <p class="font-bold text-gray-700">No delivery addresses saved</p>
          <p class="text-gray-400">Save your Eluru address for fast 1-click checkout.</p>
          <button onclick="openAddAddressModal()" class="text-[#1F6B3A] font-bold underline">Add an address now</button>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          ${addresses.map((addr, idx) => `
            <div class="p-4 bg-[#FAF8F2] border border-[#E5DFD3] rounded-2xl space-y-2 relative text-xs flex flex-col justify-between">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-gray-900 flex items-center gap-1">
                    <span>${addr.type === 'Work' ? '🏢' : (addr.type === 'Event Venue' ? '🎉' : '🏠')}</span>
                    ${addr.type || 'Home'}
                  </span>
                  ${addr.is_default ? `
                    <div class="flex items-center gap-1.5">
                      <span class="bg-green-100 text-green-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">✓ Default</span>
                      <button onclick="removeDefaultAddress(${idx})" class="text-[10px] text-gray-400 hover:text-red-500 underline" title="Remove default status">Unset</button>
                    </div>
                  ` : `
                    <button onclick="setDefaultAddress(${idx})" class="text-[10px] text-[#1F6B3A] font-bold hover:underline bg-[#EBF5E9] hover:bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors">
                      <span>⭐</span> Make Default
                    </button>
                  `}
                </div>
                <p class="font-semibold text-gray-800">${addr.name} (📞 ${addr.mobile})</p>
                <p class="text-gray-600 leading-snug">${addr.address}</p>
                ${addr.gps ? `
                  <p class="text-[10px] text-green-700 font-mono flex items-center gap-1">
                    <span>📍</span> GPS: ${addr.gps.lat}, ${addr.gps.lng}
                  </p>
                ` : ''}
              </div>

              <div class="flex items-center justify-end gap-2 pt-2 border-t border-gray-200/50">
                <button onclick="deleteAddress(${idx})" class="text-red-600 hover:underline text-[11px] font-bold">
                  🗑️ Delete
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function setDefaultAddress(idx) {
  if (!APP_STATE.user || !APP_STATE.user.addresses) return;
  APP_STATE.user.addresses.forEach((a, i) => a.is_default = (i === idx));
  saveUserAddresses(APP_STATE.user.addresses);
}

function removeDefaultAddress(idx) {
  if (!APP_STATE.user || !APP_STATE.user.addresses) return;
  if (APP_STATE.user.addresses[idx]) {
    APP_STATE.user.addresses[idx].is_default = false;
    saveUserAddresses(APP_STATE.user.addresses);
  }
}

function deleteAddress(idx) {
  if (!confirm("Are you sure you want to delete this delivery address?")) return;
  if (!APP_STATE.user || !APP_STATE.user.addresses) return;
  APP_STATE.user.addresses.splice(idx, 1);
  saveUserAddresses(APP_STATE.user.addresses);
}

function saveUserAddresses(addresses) {
  localStorage.setItem('slg_user', JSON.stringify(APP_STATE.user));
  apiRequest('/api/auth/profile', {
    method: 'PUT',
    body: { addresses: addresses }
  }).then(() => {
    showToast("Addresses updated!");
    renderApp();
  }).catch(err => showToast(err.message, "error"));
}

// 4. REFERRALS TAB
function renderAccountReferralsTab(user) {
  const referralShareText = encodeURIComponent(
    `Namaste! I use 100% natural and compostable areca leaf plates from Sri Lakshmi Ganapathi, Eluru. Use my referral code *${user.referral_code}* to get ₹50 OFF on your first order! Order here: ${window.location.origin}`
  );

  return `
    <div class="bg-gradient-to-br from-[#1F6B3A] to-[#2D8A4E] text-white rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
      <div class="flex items-start justify-between">
        <div>
          <span class="inline-block bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Referral Program
          </span>
          <h3 class="text-lg sm:text-xl font-bold font-serif mt-1">${t('referralProgram')}</h3>
          <p class="text-xs text-green-100 max-w-md mt-1 leading-relaxed">
            Invite friends, relatives, caterers, and function hall organizers. When their first order is delivered, you get ₹100 credit and they get ₹50 OFF!
          </p>
        </div>
        <span class="text-3xl">🎁</span>
      </div>

      <!-- Referral Code & WhatsApp Share -->
      <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span class="text-[11px] text-green-200 block">${t('yourRefCode')}</span>
          <span class="text-lg font-mono font-extrabold tracking-widest text-white">${user.referral_code}</span>
        </div>

        <a 
          href="https://api.whatsapp.com/send?text=${referralShareText}" 
          target="_blank" 
          class="bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-transform active:scale-95"
        >
          <span>💬</span> ${t('shareWhatsApp')}
        </a>
      </div>

      <!-- Wallet Balance Display -->
      <div class="flex items-center justify-between text-xs pt-1">
        <span>${t('walletBalance')}:</span>
        <span class="text-base font-extrabold text-[#FAF8F2] bg-white/20 px-3 py-1 rounded-lg">₹${user.wallet_balance || 0}</span>
      </div>
    </div>
  `;
}

// 5. HELP & SUPPORT TAB
function renderAccountHelpTab() {
  return `
    <div class="space-y-4">
      <!-- AI Assistant Promo Card -->
      <div class="bg-gradient-to-r from-[#1F6B3A] to-[#18532D] text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="space-y-1 text-center sm:text-left">
          <span class="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase">24/7 Smart Assistant</span>
          <h3 class="text-base font-bold font-serif">Sri Lakshmi Ganapathi AI Help Desk</h3>
          <p class="text-xs text-green-100 max-w-md">Get instant answers about order tracking, catering plate calculations, microwave safety, and Eluru delivery.</p>
        </div>
        <button onclick="toggleSupportChat(true)" class="bg-white text-[#1F6B3A] hover:bg-green-50 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shrink-0 flex items-center gap-1.5 active:scale-95 transition-all">
          <span>💬</span> Start AI Chat Now
        </button>
      </div>

      <!-- Factory & Owner Direct Contact Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 shadow-sm space-y-2 text-xs">
          <div class="flex items-center gap-2 text-sm font-bold text-gray-900">
            <span class="text-base">👑</span>
            <span>Business Owner: Anand Majji</span>
          </div>
          <p class="text-gray-500">For bulk catering discounts, custom plate sizes & dealership enquiries.</p>
          <div class="pt-2 flex items-center gap-2 font-bold">
            <a href="tel:9642677869" class="bg-[#1F6B3A] text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
              <span>📞</span> Call 9642677869
            </a>
            <a href="https://api.whatsapp.com/send?phone=919642677869&text=Namaste%20Anand%20garu,%20I%20have%20an%20enquiry%20about%20areca%20plates" target="_blank" class="bg-[#25D366] text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
              <span>💬</span> WhatsApp
            </a>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 shadow-sm space-y-2 text-xs">
          <div class="flex items-center gap-2 text-sm font-bold text-gray-900">
            <span class="text-base">🏭</span>
            <span>Eluru Factory & Dispatch</span>
          </div>
          <p class="text-gray-500">8-176, Block 3, Sunkaravaari Thota, Madhepalli Road, Eluru - 534001</p>
          <div class="pt-2 flex items-center gap-2 font-bold">
            <a href="tel:9849052800" class="bg-[#FAF8F2] border border-[#E5DFD3] text-gray-800 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <span>📞</span> Call 9849052800
            </a>
            <a href="https://maps.google.com/?q=8-176+Sunkaravaari+Thota+Madhepalli+Road+Eluru+534001" target="_blank" class="bg-[#FAF8F2] border border-[#E5DFD3] text-[#1F6B3A] px-3 py-1.5 rounded-lg flex items-center gap-1">
              <span>📍</span> Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function handleLogout() {
  APP_STATE.user = null;
  APP_STATE.token = '';
  localStorage.removeItem('slg_user');
  localStorage.removeItem('slg_token');
  showToast("Logged out successfully");
  navigateTo('home');
}


// ----------------- AUTH MODAL (LOGIN & REGISTER WITH OTP) -----------------
let currentAuthTab = 'login';
let returnRouteAfterAuth = 'home';
let otpRequested = false;

function openAuthModal(initialTab = 'login', returnTo = 'home') {
  currentAuthTab = initialTab;
  returnRouteAfterAuth = returnTo;
  otpRequested = false;
  renderAuthModalContent();
}

function renderAuthModalContent() {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fadeIn" onclick="closeModal(event)">
      <div class="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative" onclick="event.stopPropagation()">
        
        <!-- Header -->
        <div class="bg-[#1F6B3A] text-white p-5 text-center relative">
          <button onclick="closeModal()" class="absolute top-4 right-4 text-white/80 hover:text-white font-bold text-sm">✕</button>
          <img src="/static/assets/images/leaf_emblem.png" alt="SLG" class="w-12 h-12 mx-auto rounded-full bg-white p-1 mb-2">
          <h2 class="text-base font-bold font-serif">${currentAuthTab === 'login' ? t('loginTitle') : t('registerTitle')}</h2>
          <p class="text-[11px] text-green-200 mt-0.5">${t('tagline')}</p>
        </div>

        <!-- Tab Switcher -->
        <div class="flex border-b border-[#E5DFD3] text-xs font-bold text-gray-600">
          <button 
            onclick="switchAuthTab('login')" 
            class="flex-1 py-3 text-center transition-colors ${currentAuthTab === 'login' ? 'text-[#1F6B3A] border-b-2 border-[#1F6B3A] bg-[#FAF8F2]' : 'hover:text-gray-900'}"
          >
            ${t('loginBtn')}
          </button>
          <button 
            onclick="switchAuthTab('register')" 
            class="flex-1 py-3 text-center transition-colors ${currentAuthTab === 'register' ? 'text-[#1F6B3A] border-b-2 border-[#1F6B3A] bg-[#FAF8F2]' : 'hover:text-gray-900'}"
          >
            ${t('registerBtn')}
          </button>
        </div>

        <div class="p-5 sm:p-6">
          ${currentAuthTab === 'login' ? renderLoginForm() : renderRegisterForm()}
        </div>

      </div>
    </div>
  `;
}

function switchAuthTab(tab) {
  currentAuthTab = tab;
  renderAuthModalContent();
}

function renderLoginForm() {
  return `
    <form onsubmit="handleLoginSubmit(event)" class="space-y-3.5">
      <div>
        <label class="block text-xs font-bold text-gray-700 mb-1">${t('usernameLabel')} / Mobile Number *</label>
        <input 
          type="text" 
          id="login-username" 
          required 
          placeholder="e.g. AnandMajji or 9848012345" 
          class="w-full text-xs sm:text-sm p-2.5 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]"
        >
      </div>

      <div>
        <div class="flex justify-between items-center mb-1">
          <label class="block text-xs font-bold text-gray-700">${t('passwordLabel')} *</label>
          <button type="button" onclick="handleForgotPassword()" class="text-[11px] text-[#1F6B3A] hover:underline font-semibold">${t('forgotPassword')}</button>
        </div>
        <input 
          type="password" 
          id="login-password" 
          required 
          placeholder="••••••••" 
          class="w-full text-xs sm:text-sm p-2.5 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]"
        >
      </div>



      <div class="pt-2">
        <button type="submit" id="login-submit-btn" class="w-full bg-[#1F6B3A] hover:bg-[#18532D] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all">
          ${t('loginBtn')} ➔
        </button>
      </div>
    </form>
  `;
}

function renderRegisterForm() {
  return `
    <form onsubmit="handleRegisterSubmit(event)" class="space-y-3">
      <div>
        <label class="block text-xs font-bold text-gray-700 mb-1">${t('nameLabel')} *</label>
        <input type="text" id="reg-name" required placeholder="Full Name" class="w-full text-xs p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]">
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">${t('usernameLabel')} *</label>
          <input type="text" id="reg-username" required placeholder="Unique username" class="w-full text-xs p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">${t('mobileLabel')} *</label>
          <input type="tel" id="reg-mobile" required placeholder="10-digit mobile" class="w-full text-xs p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]">
        </div>
      </div>



      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">${t('passwordLabel')} (min 8) *</label>
          <input type="password" id="reg-pass" required minlength="8" placeholder="••••••••" class="w-full text-xs p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">${t('confirmPasswordLabel')} *</label>
          <input type="password" id="reg-confirm-pass" required minlength="8" placeholder="••••••••" class="w-full text-xs p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]">
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-gray-700 mb-1">Referral Code (Optional - Get ₹50 Welcome Credit)</label>
        <input type="text" id="reg-ref" placeholder="e.g. SLG-ANAND or friend's code" class="w-full text-xs p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg uppercase font-mono focus:outline-none focus:border-[#1F6B3A]">
      </div>

      <div class="pt-2">
        <button type="submit" id="reg-submit-btn" class="w-full bg-[#1F6B3A] hover:bg-[#18532D] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all">
          ${t('registerBtn')} ➔
        </button>
      </div>
    </form>
  `;
}

function requestMockOtp() {
  otpRequested = true;
  showToast("6-Digit OTP sent to mobile! (Entered 123456 for instant testing)");
  renderAuthModalContent();
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-submit-btn');

  btn.disabled = true;
  btn.textContent = "Logging in...";

  try {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { username, password }
    });

    APP_STATE.user = res.user;
    APP_STATE.token = res.token;
    localStorage.setItem('slg_user', JSON.stringify(res.user));
    localStorage.setItem('slg_token', res.token);

    closeModal();
    showToast(`Welcome back, ${res.user.full_name}!`);

    // "The owner logs in on the same login page and goes straight to the Owner Dashboard. Customers cannot access owner pages."
    if (res.user.role === 'owner') {
      navigateTo('owner');
    } else {
      navigateTo(returnRouteAfterAuth);
    }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = t('loginBtn');
    const msg = (err.message || '').toLowerCase();
    if (msg.includes('account not found') || msg.includes('register')) {
      showToast(APP_STATE.lang === 'te' ? "ఖాతా కనుగొనబడలేదు. దయచేసి లాగిన్ చేయడానికి రిజిస్టర్ అవ్వండి." : "Account not found. Please register to login.", 'error');
    } else if (msg.includes('incorrect password')) {
      showToast(APP_STATE.lang === 'te' ? "పాస్‌వర్డ్ తప్పు. దయచేసి మళ్లీ ప్రయత్నించండి." : "Incorrect password. Please try again.", 'error');
    } else {
      showToast(err.message, 'error');
    }
  }
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const mobile = document.getElementById('reg-mobile').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const confirmPass = document.getElementById('reg-confirm-pass').value;
  const refCode = (document.getElementById('reg-ref').value || '').trim();

  if (pass !== confirmPass) {
    showToast("Passwords do not match", 'error');
    return;
  }

  const btn = document.getElementById('reg-submit-btn');
  btn.disabled = true;
  btn.textContent = "Creating account...";

  try {
    const res = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: {
        full_name: name,
        username: username,
        password: pass,
        mobile: mobile,
        referral_code: refCode
      }
    });

    APP_STATE.user = res.user;
    APP_STATE.token = res.token;
    localStorage.setItem('slg_user', JSON.stringify(res.user));
    localStorage.setItem('slg_token', res.token);

    closeModal();
    showToast("Account created successfully!");
    navigateTo(returnRouteAfterAuth);
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
    btn.textContent = t('registerBtn');
  }
}

function handleForgotPassword() {
  const mobile = prompt("Enter your registered mobile number for password reset:");
  if (!mobile) return;
  const newPass = prompt("Enter your new password (minimum 8 characters):");
  if (!newPass || newPass.length < 8) {
    showToast("Password must be at least 8 characters", 'error');
    return;
  }
  apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: { mobile: mobile.trim(), otp: "123456", new_password: newPass }
  }).then(res => {
    showToast(res.message);
  }).catch(err => {
    showToast(err.message, 'error');
  });
}

function openAddAddressModal() {
  const user = APP_STATE.user;
  const modalContainer = document.getElementById('modal-container');
  const eluruLocalities = [
    'Madhepalli Road (Near SLG Factory)',
    'Sunkaravaari Thota',
    'Tangellamudi',
    'Sanivarapupeta',
    'Vatluru',
    'Powerpet',
    'R.R. Pet',
    'Fire Station Center',
    'Ashok Nagar',
    'Chodimella',
    'GNT Road',
    'Other Eluru Area / Mandal'
  ];

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4" onclick="closeModal(event)">
      <div class="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <button onclick="closeModal()" class="absolute top-4 right-4 text-gray-500 font-bold text-sm">✕</button>
        <h3 class="text-sm font-bold text-gray-900 mb-1 font-serif">Add New Delivery Location</h3>
        <p class="text-[11px] text-gray-500 mb-3">Save your home, function hall, or catering venue in Eluru.</p>

        <!-- GPS Current Location Detection -->
        <div class="p-3 bg-[#FAF8F2] border border-[#E5DFD3] rounded-xl flex items-center justify-between gap-2 mb-3">
          <div>
            <span class="text-xs font-bold text-gray-800 block">Use Device GPS</span>
            <span class="text-[10px] text-gray-500" id="addr-modal-gps-text">Pinpoint exact delivery coordinates</span>
          </div>
          <button 
            type="button" 
            onclick="detectCurrentLocationForAddressModal()" 
            class="bg-[#1F6B3A] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs shrink-0"
          >
            <span>📍</span> Auto-Detect
          </button>
        </div>
        <input type="hidden" id="new-addr-gps" value="">
        
        <form onsubmit="saveNewAddress(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Recipient Name *</label>
            <input type="text" id="new-addr-name" required value="${user ? user.full_name : ''}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]">
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Contact Mobile Number *</label>
            <input type="tel" id="new-addr-mobile" required maxlength="10" value="${user ? user.mobile : ''}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]">
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Locality / Area in Eluru *</label>
            <select id="new-addr-locality" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]">
              ${eluruLocalities.map(loc => `<option value="${loc}">${loc}</option>`).join('')}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold text-gray-700 mb-1">Door / Flat No *</label>
              <input type="text" id="new-addr-door" required placeholder="e.g. 4-18/1" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]">
            </div>
            <div>
              <label class="block font-bold text-gray-700 mb-1">Landmark *</label>
              <input type="text" id="new-addr-landmark" required placeholder="e.g. Ramalayam" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]">
            </div>
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Address Label</label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="addr_type" value="Home" checked> 🏠 Home</label>
              <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="addr_type" value="Work"> 🏢 Work</label>
              <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="addr_type" value="Event Venue"> 🎉 Venue</label>
            </div>
          </div>
          <div class="flex items-center gap-2 pt-1">
            <input type="checkbox" id="new-addr-default" class="w-4 h-4 text-[#1F6B3A]">
            <label for="new-addr-default" class="text-gray-700 font-medium">Set as default delivery address (optional)</label>
          </div>
          <button type="submit" class="w-full bg-[#1F6B3A] text-white font-bold py-2.5 rounded-xl shadow-md mt-2">
            Save Delivery Address
          </button>
        </form>
      </div>
    </div>
  `;
}

function detectCurrentLocationForAddressModal() {
  const gpsText = document.getElementById('addr-modal-gps-text');
  const gpsHidden = document.getElementById('new-addr-gps');
  if (!navigator.geolocation) {
    showToast("Geolocation not supported", "error");
    return;
  }
  if (gpsText) gpsText.innerHTML = "Fetching coordinates...";
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude.toFixed(4);
      const lng = pos.coords.longitude.toFixed(4);
      if (gpsHidden) gpsHidden.value = `${lat},${lng}`;
      if (gpsText) gpsText.innerHTML = `✅ Attached GPS: ${lat}° N, ${lng}° E`;
      showToast(`GPS Pinpointed: ${lat}, ${lng}`);
    },
    err => {
      if (gpsHidden) gpsHidden.value = "16.7107,81.0952";
      if (gpsText) gpsText.innerHTML = "✅ Attached Eluru Factory: 16.7107, 81.0952";
    },
    { timeout: 8000 }
  );
}

function saveNewAddress(event) {
  event.preventDefault();
  if (!APP_STATE.user) return;
  const name = document.getElementById('new-addr-name').value.trim();
  const mobile = document.getElementById('new-addr-mobile').value.trim();
  const locality = document.getElementById('new-addr-locality').value;
  const door = document.getElementById('new-addr-door').value.trim();
  const landmark = document.getElementById('new-addr-landmark').value.trim();
  const typeRadio = document.querySelector('input[name="addr_type"]:checked');
  const type = typeRadio ? typeRadio.value : 'Home';
  const isDefault = document.getElementById('new-addr-default').checked;
  const gpsVal = document.getElementById('new-addr-gps').value;

  const fullText = `${door}, ${locality}, Near ${landmark}, Eluru, Andhra Pradesh - 534001`;

  const currentAddrs = APP_STATE.user.addresses || [];
  if (isDefault) {
    currentAddrs.forEach(a => a.is_default = false);
  }

  const newEntry = {
    id: Date.now(),
    type: type,
    name: name,
    mobile: mobile,
    address: fullText,
    is_default: Boolean(isDefault)
  };
  if (gpsVal) {
    const parts = gpsVal.split(',');
    newEntry.gps = { lat: parts[0], lng: parts[1] };
  }

  currentAddrs.unshift(newEntry);
  APP_STATE.user.addresses = currentAddrs;
  saveUserAddresses(currentAddrs);
  closeModal();
}


// ----------------- OWNER DASHBOARD VIEW & LOGIC -----------------
let ownerActiveTab = 'overview'; // overview, orders, products, coupons, referrals, customers, enquiries, settings
let ownerOverviewData = null;
let ownerOrdersList = [];
let ownerOrdersFilter = 'all';
let ownerSearchQuery = '';
let ownerDateFrom = '';
let ownerDateTo = '';
let dailyChartInstance = null;
let productsChartInstance = null;

async function refreshOwnerDashboard() {
  if (!APP_STATE.user || APP_STATE.user.role !== 'owner') {
    navigateTo('home');
    return;
  }

  try {
    const overviewRes = await apiRequest('/api/owner/overview');
    ownerOverviewData = overviewRes.metrics;
    
    // If on orders tab, reload orders
    if (ownerActiveTab === 'orders') {
      await loadOwnerOrders();
    }
    renderApp();
  } catch (err) {
    console.error("Owner dashboard fetch error:", err);
  }
}

async function loadOwnerOrders() {
  try {
    let url = `/api/owner/orders?filter_type=${ownerOrdersFilter}`;
    if (ownerSearchQuery) url += `&search=${encodeURIComponent(ownerSearchQuery)}`;
    if (ownerDateFrom) url += `&date_from=${ownerDateFrom}`;
    if (ownerDateTo) url += `&date_to=${ownerDateTo}`;

    const res = await apiRequest(url);
    ownerOrdersList = res.orders || [];
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderOwnerDashboardView() {
  const user = APP_STATE.user;
  if (!user || user.role !== 'owner') {
    return `
      <div class="max-w-md mx-auto px-4 pt-12 text-center space-y-4">
        <span class="text-4xl">🔒</span>
        <h2 class="text-lg font-bold text-gray-800">Restricted Access</h2>
        <p class="text-xs text-gray-500">This area is reserved for Sri Lakshmi Ganapathi business owner only.</p>
        <button onclick="openAuthModal('login')" class="bg-[#1F6B3A] text-white px-6 py-2.5 rounded-full text-xs font-bold">
          Owner Login ➔
        </button>
      </div>
    `;
  }

  // Load metrics initially if null
  if (!ownerOverviewData) {
    refreshOwnerDashboard();
  }

  const m = ownerOverviewData || {
    today_orders_count: 0,
    today_orders_value: 0,
    to_be_delivered: 0,
    delivered_today: 0,
    today_earnings: 0,
    this_month_earnings: 0,
    lifetime_earnings: 0,
    cod_to_collect: 0,
    upi_pending_verification: 0,
    unread_notifications: 0
  };

  return `
    <div class="max-w-7xl mx-auto px-3 sm:px-6 pt-4 space-y-5">
      
      <!-- Owner Top Navigation Bar -->
      <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-xl">
            👑
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base sm:text-lg font-bold text-gray-900 font-serif">Owner Control Hub</h1>
              <span class="bg-[#1F6B3A] text-white text-[10px] font-bold px-2 py-0.2 rounded-full uppercase">Anand Majji</span>
            </div>
            <p class="text-xs text-gray-500">Sri Lakshmi Ganapathi • Eluru Manufacturing Unit</p>
          </div>
        </div>

        <!-- Live Controls & Notification Bell -->
        <div class="flex items-center gap-2">
          <!-- Notification Bell with sound chime -->
          <button 
            onclick="playOrderChime(); showToast('Live sound alert working! New orders chime automatically.')"
            class="relative p-2 bg-[#FAF8F2] hover:bg-gray-100 rounded-full border border-[#E5DFD3] text-gray-700" 
            title="Test Sound Alert"
          >
            <span class="text-base">🔔</span>
            ${m.unread_notifications > 0 ? `
              <span class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                ${m.unread_notifications}
              </span>
            ` : ''}
          </button>

          <!-- Refresh -->
          <button onclick="refreshOwnerDashboard()" class="bg-[#EBF5E9] text-[#1F6B3A] text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-100 flex items-center gap-1">
            🔄 Refresh
          </button>

          <button onclick="handleLogout()" class="text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
            Logout
          </button>
        </div>
      </div>

      <!-- Owner Sub-Tabs Navigation -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
        ${renderOwnerTabBtn('overview', '📊 Overview & Charts')}
        ${renderOwnerTabBtn('orders', `📦 Orders (${m.to_be_delivered} Pending)`)}
        ${renderOwnerTabBtn('products', `🍃 Products (${APP_STATE.products.length})`)}
        ${renderOwnerTabBtn('coupons', `🏷️ Coupons (${APP_STATE.coupons.length})`)}
        ${renderOwnerTabBtn('referrals', '🎁 Referrals')}
        ${renderOwnerTabBtn('customers', '👥 Customers')}
        ${renderOwnerTabBtn('enquiries', '📝 Bulk Enquiries')}
        ${renderOwnerTabBtn('settings', '⚙️ Store Settings')}
      </div>

      <!-- Active Owner Sub-View Content -->
      <div id="owner-tab-content">
        ${renderActiveOwnerTabContent(m)}
      </div>

    </div>
  `;
}

function renderOwnerTabBtn(tabKey, label) {
  const isActive = ownerActiveTab === tabKey;
  return `
    <button 
      onclick="setOwnerActiveTab('${tabKey}')"
      class="shrink-0 px-3.5 py-2 rounded-xl transition-all border ${
        isActive 
          ? 'bg-[#1F6B3A] text-white border-[#1F6B3A] shadow-sm' 
          : 'bg-white text-gray-700 border-[#E5DFD3] hover:border-[#1F6B3A]'
      }"
    >
      ${label}
    </button>
  `;
}

async function setOwnerActiveTab(tabKey) {
  ownerActiveTab = tabKey;
  if (tabKey === 'orders') {
    await loadOwnerOrders();
  }
  renderApp();
}

function renderActiveOwnerTabContent(m) {
  switch (ownerActiveTab) {
    case 'overview':
      return renderOwnerOverviewTab(m);
    case 'orders':
      return renderOwnerOrdersTab();
    case 'products':
      return renderOwnerProductsTab();
    case 'coupons':
      return renderOwnerCouponsTab();
    case 'referrals':
      return renderOwnerReferralsTab();
    case 'customers':
      return renderOwnerCustomersTab();
    case 'enquiries':
      return renderOwnerEnquiriesTab();
    case 'settings':
      return renderOwnerSettingsTab();
    default:
      return renderOwnerOverviewTab(m);
  }
}

// ----------------- 1. OWNER OVERVIEW & CHARTS -----------------
function renderOwnerOverviewTab(m) {
  setTimeout(() => initOwnerCharts(), 100);

  return `
    <div class="space-y-5">
      <!-- 8 Key Metrics Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 space-y-1 shadow-sm">
          <div class="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Today's Orders</span>
            <span class="text-base">📦</span>
          </div>
          <div class="text-xl sm:text-2xl font-extrabold text-[#1F6B3A]">${m.today_orders_count}</div>
          <div class="text-[11px] text-gray-500 font-medium">Value: <strong>₹${m.today_orders_value}</strong></div>
        </div>

        <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 space-y-1 shadow-sm">
          <div class="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>To Be Delivered</span>
            <span class="text-base">🚚</span>
          </div>
          <div class="text-xl sm:text-2xl font-extrabold text-amber-600">${m.to_be_delivered}</div>
          <div class="text-[11px] text-amber-700 font-medium">Pending fulfillment</div>
        </div>

        <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 space-y-1 shadow-sm">
          <div class="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Delivered Today</span>
            <span class="text-base">✅</span>
          </div>
          <div class="text-xl sm:text-2xl font-extrabold text-green-600">${m.delivered_today}</div>
          <div class="text-[11px] text-green-700 font-medium">Completed orders</div>
        </div>

        <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 space-y-1 shadow-sm">
          <div class="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Today's Earnings</span>
            <span class="text-base">💰</span>
          </div>
          <div class="text-xl sm:text-2xl font-extrabold text-gray-900">₹${m.today_earnings}</div>
          <div class="text-[11px] text-gray-500 font-medium">Revenue collected</div>
        </div>

        <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 space-y-1 shadow-sm">
          <div class="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>This Month</span>
            <span class="text-base">📈</span>
          </div>
          <div class="text-xl sm:text-2xl font-extrabold text-[#1F6B3A]">₹${m.this_month_earnings}</div>
          <div class="text-[11px] text-gray-500 font-medium">Nov 2026 month</div>
        </div>

        <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 space-y-1 shadow-sm">
          <div class="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Lifetime Earnings</span>
            <span class="text-base">🏆</span>
          </div>
          <div class="text-xl sm:text-2xl font-extrabold text-gray-900">₹${m.lifetime_earnings}</div>
          <div class="text-[11px] text-gray-500 font-medium">All completed orders</div>
        </div>

        <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 space-y-1 shadow-sm">
          <div class="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>COD To Collect</span>
            <span class="text-base">💵</span>
          </div>
          <div class="text-xl sm:text-2xl font-extrabold text-amber-600">₹${m.cod_to_collect}</div>
          <div class="text-[11px] text-amber-700 font-medium">Cash with delivery agent</div>
        </div>

        <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 space-y-1 shadow-sm">
          <div class="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>UPI Pending UTR</span>
            <span class="text-base">🔍</span>
          </div>
          <div class="text-xl sm:text-2xl font-extrabold ${m.upi_pending_verification > 0 ? 'text-red-600 animate-pulse' : 'text-gray-900'}">${m.upi_pending_verification}</div>
          <div class="text-[11px] text-red-700 font-medium">Waiting verification</div>
        </div>

      </div>

      <!-- Charts Section (Daily Earnings 30 Days + Top Selling Plates) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        <!-- Daily Earnings 30 Days (Line/Bar Chart) -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-[#E5DFD3] p-5 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-gray-100 pb-2">
            <div>
              <h3 class="text-sm font-bold text-gray-900 font-serif">Daily Earnings (Last 30 Days)</h3>
              <p class="text-[11px] text-gray-500">Day-by-day revenue from Eluru retail and catering deliveries</p>
            </div>
            <span class="text-xs font-bold text-[#1F6B3A] bg-[#EBF5E9] px-2.5 py-1 rounded-full">₹ INR</span>
          </div>
          <div class="h-64 sm:h-72 w-full">
            <canvas id="dailyEarningsChart"></canvas>
          </div>
        </div>

        <!-- Top Selling Plates (Doughnut / Bar Chart) -->
        <div class="bg-white rounded-2xl border border-[#E5DFD3] p-5 shadow-sm space-y-3">
          <div class="border-b border-gray-100 pb-2">
            <h3 class="text-sm font-bold text-gray-900 font-serif">Top Selling Plates</h3>
            <p class="text-[11px] text-gray-500">Highest volume items sold</p>
          </div>
          <div class="h-64 sm:h-72 w-full flex items-center justify-center">
            <canvas id="topProductsChart"></canvas>
          </div>
        </div>

      </div>
    </div>
  `;
}

async function initOwnerCharts() {
  const dailyCanvas = document.getElementById('dailyEarningsChart');
  const prodCanvas = document.getElementById('topProductsChart');
  if (!dailyCanvas || !prodCanvas) return;

  try {
    const res = await apiRequest('/api/owner/charts');
    if (!res.success) return;

    if (dailyChartInstance) dailyChartInstance.destroy();
    if (productsChartInstance) productsChartInstance.destroy();

    // Chart.js 30 Days Daily Earnings
    dailyChartInstance = new Chart(dailyCanvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: res.daily_earnings.labels,
        datasets: [{
          label: 'Daily Revenue (₹)',
          data: res.daily_earnings.values,
          backgroundColor: '#1F6B3A',
          hoverBackgroundColor: '#7DB545',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => '₹' + value
            }
          }
        }
      }
    });

    // Chart.js Top Selling Products
    const prodContainer = prodCanvas.parentElement;
    if (!res.top_products.values || res.top_products.values.length === 0) {
      if (prodContainer) {
        prodContainer.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
            <span class="text-3xl mb-2">🌿</span>
            <p class="text-xs font-semibold text-gray-600">No Sales Data Yet</p>
            <p class="text-[11px] text-gray-400 mt-1 max-w-xs">Top-selling areca plates will appear here automatically when customer orders are placed.</p>
          </div>
        `;
      }
    } else {
      productsChartInstance = new Chart(prodCanvas.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: res.top_products.labels.map(l => l.replace('Plate', '').trim()),
          datasets: [{
            data: res.top_products.values,
            backgroundColor: ['#1F6B3A', '#7DB545', '#C98A2C', '#267C46', '#88D49E']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, font: { size: 10 } }
            }
          }
        }
      });
    }

  } catch (e) {
    console.error("Chart load error:", e);
  }
}

// ----------------- 2. OWNER ORDERS TAB -----------------
function renderOwnerOrdersTab() {
  return `
    <div class="space-y-4">
      <!-- Filters and Search Toolbar -->
      <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 shadow-sm space-y-3">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <!-- Filter buttons -->
          <div class="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            ${renderOwnerOrderFilterBtn('all', 'All Orders')}
            ${renderOwnerOrderFilterBtn('today', 'Today')}
            ${renderOwnerOrderFilterBtn('pending', 'Pending Delivery')}
            ${renderOwnerOrderFilterBtn('delivered', 'Delivered')}
            ${renderOwnerOrderFilterBtn('cancelled', 'Cancelled')}
          </div>

          <!-- Export CSV Button -->
          <button onclick="handleExportOrdersCsv()" class="bg-[#1F6B3A] hover:bg-[#18532D] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shrink-0">
            <span>📥</span> Export to Excel / CSV
          </button>
        </div>

        <!-- Search and Date Range Inputs -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-gray-100 text-xs">
          <div>
            <input 
              type="text" 
              id="owner-search" 
              value="${ownerSearchQuery}"
              placeholder="Search Order ID, Customer Name, Mobile, UTR..." 
              class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg focus:outline-none focus:border-[#1F6B3A]"
              oninput="handleOwnerSearchInput(this.value)"
            >
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-500 font-medium shrink-0">From:</span>
            <input 
              type="date" 
              id="owner-date-from" 
              value="${ownerDateFrom}" 
              onchange="handleOwnerDateChange()" 
              class="w-full p-1.5 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg"
            >
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-500 font-medium shrink-0">To:</span>
            <input 
              type="date" 
              id="owner-date-to" 
              value="${ownerDateTo}" 
              onchange="handleOwnerDateChange()" 
              class="w-full p-1.5 bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg"
            >
          </div>
        </div>
      </div>

      <!-- Orders List -->
      <div class="space-y-3">
        ${ownerOrdersList.length === 0 ? `
          <div class="bg-white rounded-2xl border border-[#E5DFD3] p-8 text-center text-xs text-gray-500">
            No orders match the selected filters.
          </div>
        ` : ownerOrdersList.map(order => renderOwnerOrderCard(order)).join('')}
      </div>

    </div>
  `;
}

function renderOwnerOrderFilterBtn(key, label) {
  const isActive = ownerOrdersFilter === key;
  return `
    <button 
      onclick="setOwnerOrdersFilter('${key}')"
      class="px-3 py-1.5 rounded-lg transition-colors border ${
        isActive 
          ? 'bg-[#1F6B3A] text-white border-[#1F6B3A]' 
          : 'bg-[#FAF8F2] text-gray-700 border-[#E5DFD3] hover:border-[#1F6B3A]'
      }"
    >
      ${label}
    </button>
  `;
}

async function setOwnerOrdersFilter(key) {
  ownerOrdersFilter = key;
  await loadOwnerOrders();
  renderApp();
}

function handleOwnerSearchInput(query) {
  ownerSearchQuery = query;
  clearTimeout(window.ownerSearchTimeout);
  window.ownerSearchTimeout = setTimeout(async () => {
    await loadOwnerOrders();
    renderApp();
  }, 400);
}

async function handleOwnerDateChange() {
  ownerDateFrom = document.getElementById('owner-date-from').value;
  ownerDateTo = document.getElementById('owner-date-to').value;
  await loadOwnerOrders();
  renderApp();
}

function handleExportOrdersCsv() {
  let url = `/api/owner/export-orders?filter_type=${ownerOrdersFilter}`;
  if (ownerDateFrom) url += `&date_from=${ownerDateFrom}`;
  if (ownerDateTo) url += `&date_to=${ownerDateTo}`;
  window.open(url, '_blank');
}

function renderOwnerOrderCard(o) {
  const isCancelled = o.order_status === 'Cancelled';
  const isDelivered = o.order_status === 'Delivered';

  return `
    <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 sm:p-5 shadow-sm space-y-3">
      <!-- Order Header Row -->
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5 text-xs">
        <div class="flex items-center gap-2">
          <span class="font-mono font-extrabold text-[#1F6B3A] text-sm">${o.id}</span>
          <span class="text-gray-500 font-medium">${o.created_at}</span>
          <span class="px-2 py-0.5 rounded font-bold ${
            o.payment_mode === 'COD' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
          }">${o.payment_mode}</span>
          <span class="px-2 py-0.5 rounded font-semibold ${
            o.payment_status === 'Received' || o.payment_status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
          }">${o.payment_status}</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-base font-extrabold text-gray-900">₹${o.total_amount}</span>
        </div>
      </div>

      <!-- Customer & Delivery Info -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <span class="text-gray-400 block text-[10px] uppercase font-semibold">Customer Details</span>
          <p class="font-bold text-gray-800">${o.customer_name} (<a href="tel:${o.customer_mobile}" class="text-[#1F6B3A] underline">${o.customer_mobile}</a>)</p>
          <p class="text-gray-600 mt-0.5 leading-snug">📍 ${o.customer_address}</p>
          ${o.delivery_notes ? `<p class="text-amber-700 italic mt-0.5">Note: ${o.delivery_notes}</p>` : ''}
        </div>

        <div>
          <span class="text-gray-400 block text-[10px] uppercase font-semibold">Ordered Items</span>
          <div class="space-y-0.5 mt-0.5 text-gray-700">
            ${(o.items || []).map(it => `
              <div class="flex justify-between">
                <span>• ${it.name} (${it.size}) × ${it.qty}</span>
                <span class="font-semibold text-gray-900">₹${it.total || (it.price * it.qty)}</span>
              </div>
            `).join('')}
          </div>
          ${o.upi_ref_id ? `
            <div class="mt-2 p-1.5 bg-[#FAF8F2] border border-[#E5DFD3] rounded text-[11px] text-[#1F6B3A]">
              <strong>UPI UTR / Ref:</strong> <span class="font-mono">${o.upi_ref_id}</span>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Actions Toolbar -->
      <div class="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <!-- Order Status Dropdown -->
        <div class="flex items-center gap-2">
          <span class="font-bold text-gray-700">Status:</span>
          <select 
            onchange="handleUpdateOrderStatus('${o.id}', this.value)"
            class="bg-[#FAF8F2] border border-[#E5DFD3] rounded-lg px-2.5 py-1 text-xs font-bold text-[#1F6B3A] focus:outline-none"
          >
            <option value="Placed" ${o.order_status === 'Placed' ? 'selected' : ''}>Placed</option>
            <option value="Confirmed" ${o.order_status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Packed" ${o.order_status === 'Packed' ? 'selected' : ''}>Packed</option>
            <option value="Out for Delivery" ${o.order_status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
            <option value="Delivered" ${o.order_status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${o.order_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>

          ${o.payment_mode === 'UPI' && o.payment_status !== 'Verified' && o.payment_status !== 'Received' ? `
            <button onclick="handleVerifyUpiPayment('${o.id}')" class="bg-green-600 hover:bg-green-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs">
              ✓ Verify UPI UTR
            </button>
          ` : ''}
        </div>

        <!-- Print Slip & WhatsApp -->
        <div class="flex items-center gap-2">
          <button onclick="printOrderInvoice('${o.id}')" class="bg-[#FAF8F2] hover:bg-gray-100 text-gray-800 border border-[#E5DFD3] font-bold px-3 py-1 rounded-lg flex items-center gap-1">
            🖨️ Print Packing Slip / Invoice
          </button>
          
          <a 
            href="https://api.whatsapp.com/send?phone=91${o.customer_mobile}&text=Namaste%20${encodeURIComponent(o.customer_name)},%20your%20Sri%20Lakshmi%20Ganapathi%20order%20${o.id}%20status%20is%20${o.order_status}." 
            target="_blank" 
            class="bg-[#25D366] text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1"
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
    </div>
  `;
}

async function handleUpdateOrderStatus(orderId, newStatus) {
  try {
    const res = await apiRequest(`/api/owner/orders/${orderId}/status`, {
      method: 'PUT',
      body: { status: newStatus }
    });
    showToast(`Order ${orderId} status set to ${newStatus}`);
    await refreshOwnerDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleVerifyUpiPayment(orderId) {
  try {
    await apiRequest(`/api/owner/orders/${orderId}/verify-payment`, {
      method: 'PUT',
      body: { payment_status: 'Verified' }
    });
    showToast(`Payment for order ${orderId} verified as received`);
    await refreshOwnerDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ----------------- PRINT PACKING SLIP / TAX INVOICE -----------------
async function printOrderInvoice(orderId) {
  try {
    const res = await apiRequest(`/api/owner/orders/${orderId}/invoice`);
    const o = res.order;
    const b = res.business;

    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `
      <div class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4" onclick="closeModal(event)">
        <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 shadow-2xl relative" onclick="event.stopPropagation()">
          <button onclick="closeModal()" class="no-print absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</button>
          
          <div id="printable-invoice" class="space-y-4 text-xs font-sans">
            <!-- Letterhead -->
            <div class="flex items-center justify-between border-b-2 border-[#1F6B3A] pb-3">
              <div class="flex items-center gap-3">
                <img src="/static/assets/images/leaf_emblem.png" alt="SLG" class="w-14 h-14 object-contain">
                <div>
                  <h1 class="text-base font-extrabold text-[#1F6B3A] font-serif uppercase tracking-tight">${b.name}</h1>
                  <p class="text-[10px] text-gray-500 font-semibold">${b.tagline}</p>
                  <p class="text-[10px] text-gray-600 leading-tight mt-0.5">${b.address}</p>
                  <p class="text-[10px] text-gray-600 font-medium">Phone: ${b.phones} • UPI: ${b.upi_id}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="inline-block bg-[#1F6B3A] text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">TAX INVOICE / PACKING SLIP</span>
                <p class="font-mono font-extrabold text-[#1F6B3A] text-sm mt-1">${o.id}</p>
                <p class="text-[10px] text-gray-500 font-medium">Date: ${o.created_at}</p>
              </div>
            </div>

            <!-- Customer & Delivery Info -->
            <div class="grid grid-cols-2 gap-4 bg-[#FAF8F2] p-3 rounded-xl border border-[#E5DFD3]">
              <div>
                <span class="text-[10px] text-gray-400 font-bold uppercase block">Billed & Delivered To:</span>
                <p class="font-bold text-gray-900">${o.customer_name}</p>
                <p class="text-gray-600 mt-0.5">${o.customer_address}</p>
                <p class="text-gray-600 mt-0.5">📞 +91 ${o.customer_mobile}</p>
              </div>
              <div>
                <span class="text-[10px] text-gray-400 font-bold uppercase block">Payment & Fulfillment:</span>
                <p>Payment Mode: <strong>${o.payment_mode}</strong></p>
                <p>Payment Status: <strong>${o.payment_status}</strong></p>
                ${o.upi_ref_id ? `<p>UPI Reference: <strong class="font-mono">${o.upi_ref_id}</strong></p>` : ''}
                <p>Order Status: <strong class="text-[#1F6B3A]">${o.order_status}</strong></p>
              </div>
            </div>

            <!-- Itemized Table -->
            <table class="w-full text-left border-collapse border border-[#E5DFD3]">
              <thead>
                <tr class="bg-[#FAF8F2] text-[#1F6B3A] font-bold text-[11px] border-b border-[#E5DFD3]">
                  <th class="p-2 border border-[#E5DFD3]">#</th>
                  <th class="p-2 border border-[#E5DFD3]">Item Description</th>
                  <th class="p-2 border border-[#E5DFD3]">Size</th>
                  <th class="p-2 border border-[#E5DFD3] text-center">Pack Qty</th>
                  <th class="p-2 border border-[#E5DFD3] text-right">Unit Price (₹)</th>
                  <th class="p-2 border border-[#E5DFD3] text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#E5DFD3] text-gray-700">
                ${(o.items || []).map((it, idx) => `
                  <tr>
                    <td class="p-2 border border-[#E5DFD3] text-center">${idx + 1}</td>
                    <td class="p-2 border border-[#E5DFD3] font-semibold">${it.name}</td>
                    <td class="p-2 border border-[#E5DFD3]">${it.size}</td>
                    <td class="p-2 border border-[#E5DFD3] text-center">${it.qty}</td>
                    <td class="p-2 border border-[#E5DFD3] text-right">₹${it.price}</td>
                    <td class="p-2 border border-[#E5DFD3] text-right font-bold">₹${it.total || (it.price * it.qty)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- Totals calculation -->
            <div class="flex justify-end pt-1">
              <div class="w-64 space-y-1 text-xs">
                <div class="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹${o.subtotal}</span>
                </div>
                ${o.bulk_discount > 0 ? `
                  <div class="flex justify-between text-green-700">
                    <span>Bulk Discount (5%):</span>
                    <span>-₹${o.bulk_discount}</span>
                  </div>
                ` : ''}
                ${o.coupon_discount > 0 ? `
                  <div class="flex justify-between text-green-700">
                    <span>Coupon Discount (${o.coupon_code || ''}):</span>
                    <span>-₹${o.coupon_discount}</span>
                  </div>
                ` : ''}
                ${o.referral_credit_used > 0 ? `
                  <div class="flex justify-between text-green-700">
                    <span>Referral Credit Applied:</span>
                    <span>-₹${o.referral_credit_used}</span>
                  </div>
                ` : ''}
                <div class="flex justify-between text-gray-600">
                  <span>Delivery Fee:</span>
                  <span>${o.delivery_fee === 0 ? 'FREE' : '₹' + o.delivery_fee}</span>
                </div>
                ${o.gst_amount > 0 ? `
                  <div class="flex justify-between text-gray-600">
                    <span>GST (5%):</span>
                    <span>₹${o.gst_amount}</span>
                  </div>
                ` : ''}
                <div class="border-t-2 border-[#1F6B3A] pt-1 flex justify-between font-extrabold text-sm text-[#1F6B3A]">
                  <span>Total Amount Paid / Payable:</span>
                  <span>₹${o.total_amount}</span>
                </div>
              </div>
            </div>

            <!-- Footer Signatures -->
            <div class="pt-8 flex items-end justify-between text-[11px] text-gray-500">
              <div>
                <p>• 100% Natural Areca Palm Leaf Ware</p>
                <p>• Compostable, Biodegradable & Eco-Friendly</p>
                <p>• Thank you for choosing green dining!</p>
              </div>
              <div class="text-right">
                <div class="w-36 border-b border-gray-400 mb-1"></div>
                <p class="font-bold text-gray-800">For Sri Lakshmi Ganapathi</p>
                <p class="text-[10px]">Authorized Signatory</p>
              </div>
            </div>
          </div>

          <!-- Print button -->
          <div class="no-print mt-6 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button onclick="window.print()" class="bg-[#1F6B3A] hover:bg-[#18532D] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2">
              <span>🖨️</span> Print Invoice / Slip
            </button>
          </div>

        </div>
      </div>
    `;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ----------------- 3. OWNER PRODUCTS TAB -----------------
function renderOwnerProductsTab() {
  return `
    <div class="space-y-4">
      <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-gray-800 font-serif">Product Catalog Management</h3>
          <p class="text-xs text-gray-500">Edit prices, pack sizes, stock availability and add new products.</p>
        </div>
        <button onclick="openProductEditModal()" class="bg-[#1F6B3A] hover:bg-[#18532D] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 shadow-sm">
          <span>+</span> Add New Product
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${APP_STATE.products.map(p => `
          <div class="bg-white rounded-2xl border border-[#E5DFD3] p-3 sm:p-4 shadow-sm flex items-center gap-3">
            <img src="${p.image_url}" alt="${p.name}" class="w-16 h-16 rounded-xl object-cover bg-[#FAF8F2] shrink-0">
            <div class="flex-1 space-y-0.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-gray-900">${p.name}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded ${p.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                  ${p.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <p class="text-[11px] text-gray-500">${p.size} • Pack of ${p.pack_size} • ₹${p.price_per_piece}/pc</p>
              <p class="text-xs font-extrabold text-[#1F6B3A]">₹${p.price} <span class="text-[10px] text-gray-400 font-normal">per pack</span></p>
            </div>
            <div class="flex flex-col gap-1.5 shrink-0">
              <button onclick="openProductEditModal(${p.id})" class="bg-[#FAF8F2] hover:bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded border border-[#E5DFD3]">
                ✏️ Edit
              </button>
              <button onclick="handleToggleStock(${p.id}, ${p.in_stock ? 0 : 1})" class="text-[10px] font-bold ${p.in_stock ? 'text-amber-600 hover:underline' : 'text-green-600 hover:underline'}">
                ${p.in_stock ? 'Mark Out' : 'Mark In'}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

async function handleToggleStock(productId, newStatus) {
  const p = APP_STATE.products.find(it => it.id === productId);
  if (!p) return;
  try {
    p.in_stock = newStatus;
    await apiRequest(`/api/products/${productId}`, {
      method: 'PUT',
      body: p
    });
    showToast(`Product ${p.name} stock status updated`);
    await loadInitialData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openProductEditModal(productId = null) {
  const p = productId ? APP_STATE.products.find(it => it.id === productId) : {
    name: '',
    name_te: '',
    category: 'round_plates',
    size: '10 Inch',
    pack_size: 25,
    price: 220,
    price_per_piece: 8.80,
    description: '',
    description_te: '',
    image_url: '/static/assets/images/round_plate_set.jpg',
    badge: 'Popular Choice',
    is_bestseller: 0,
    in_stock: 1
  };

  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4" onclick="closeModal(event)">
      <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 shadow-2xl relative" onclick="event.stopPropagation()">
        <button onclick="closeModal()" class="absolute top-4 right-4 text-gray-500 font-bold">✕</button>
        <h3 class="text-sm font-bold text-gray-900 mb-3 font-serif">${productId ? 'Edit Product' : 'Add New Product'}</h3>
        
        <form onsubmit="handleSaveProduct(event, ${productId})" class="space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold text-gray-700 mb-1">Product Name (English)</label>
              <input type="text" id="edit-p-name" required value="${p.name}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded">
            </div>
            <div>
              <label class="block font-bold text-gray-700 mb-1">Product Name (Telugu)</label>
              <input type="text" id="edit-p-name-te" required value="${p.name_te || ''}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold text-gray-700 mb-1">Category</label>
              <select id="edit-p-cat" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded">
                <option value="round_plates" ${p.category === 'round_plates' ? 'selected' : ''}>Round Plates</option>
                <option value="square_plates" ${p.category === 'square_plates' ? 'selected' : ''}>Square Plates</option>
                <option value="bowls" ${p.category === 'bowls' ? 'selected' : ''}>Bowls</option>
                <option value="cutlery" ${p.category === 'cutlery' ? 'selected' : ''}>Cutlery</option>
                <option value="combos" ${p.category === 'combos' ? 'selected' : ''}>Combos</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-gray-700 mb-1">Size Specification</label>
              <input type="text" id="edit-p-size" required value="${p.size}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded">
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block font-bold text-gray-700 mb-1">Pack Size</label>
              <input type="number" id="edit-p-pack" required value="${p.pack_size}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded">
            </div>
            <div>
              <label class="block font-bold text-gray-700 mb-1">Pack Price (₹)</label>
              <input type="number" step="0.5" id="edit-p-price" required value="${p.price}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded">
            </div>
            <div>
              <label class="block font-bold text-gray-700 mb-1">Per Piece (₹)</label>
              <input type="number" step="0.1" id="edit-p-piece" required value="${p.price_per_piece}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded">
            </div>
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">Badge (e.g. Best Seller #1, Save ₹160)</label>
            <input type="text" id="edit-p-badge" value="${p.badge || ''}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded">
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">Image URL</label>
            <input type="text" id="edit-p-img" value="${p.image_url}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded">
          </div>

          <div>
            <label class="block font-bold text-gray-700 mb-1">Description (English)</label>
            <textarea id="edit-p-desc" rows="2" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded">${p.description || ''}</textarea>
          </div>

          <button type="submit" class="w-full bg-[#1F6B3A] text-white font-bold py-2.5 rounded-xl shadow-md">
            Save Product
          </button>
        </form>
      </div>
    </div>
  `;
}

async function handleSaveProduct(event, productId) {
  event.preventDefault();
  const payload = {
    name: document.getElementById('edit-p-name').value.trim(),
    name_te: document.getElementById('edit-p-name-te').value.trim(),
    category: document.getElementById('edit-p-cat').value,
    size: document.getElementById('edit-p-size').value.trim(),
    pack_size: parseInt(document.getElementById('edit-p-pack').value),
    price: parseFloat(document.getElementById('edit-p-price').value),
    price_per_piece: parseFloat(document.getElementById('edit-p-piece').value),
    badge: document.getElementById('edit-p-badge').value.trim(),
    image_url: document.getElementById('edit-p-img').value.trim(),
    description: document.getElementById('edit-p-desc').value.trim(),
    description_te: document.getElementById('edit-p-desc').value.trim(),
    in_stock: 1,
    is_bestseller: 1
  };

  try {
    if (productId) {
      await apiRequest(`/api/products/${productId}`, { method: 'PUT', body: payload });
      showToast("Product updated successfully");
    } else {
      await apiRequest('/api/products', { method: 'POST', body: payload });
      showToast("New product created");
    }
    closeModal();
    await loadInitialData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ----------------- 4. OWNER COUPONS TAB -----------------
function renderOwnerCouponsTab() {
  return `
    <div class="space-y-4">
      <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-gray-800 font-serif">Festival Offers & Coupons</h3>
          <p class="text-xs text-gray-500">Create festival discounts (e.g. SANKRANTI10, DIWALI15) and home banners.</p>
        </div>
        <button onclick="openCouponCreateModal()" class="bg-[#1F6B3A] hover:bg-[#18532D] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 shadow-sm">
          <span>+</span> Create Coupon
        </button>
      </div>

      ${APP_STATE.coupons.length === 0 ? `
        <div class="bg-white rounded-2xl border border-[#E5DFD3] p-8 text-center space-y-2 shadow-sm text-xs">
          <span class="text-3xl">🏷️</span>
          <p class="font-bold text-gray-800">No festival offers currently active.</p>
          <p class="text-gray-500">Click "+ Create Coupon" above to add a festival discount (e.g. SANKRANTI10, DIWALI15, VINAYAKA25) anytime!</p>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${APP_STATE.coupons.map(c => `
            <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 shadow-sm space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-mono font-extrabold text-[#1F6B3A] text-sm bg-[#EBF5E9] px-2.5 py-0.5 rounded">${c.code}</span>
                <span class="font-bold px-2 py-0.5 rounded ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}">
                  ${c.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p class="font-bold text-gray-800">${c.description || ''}</p>
              <p class="text-gray-600">
                Discount: <strong>${c.discount_type === 'percent' ? c.discount_value + '%' : '₹' + c.discount_value}</strong> • Min Order: <strong>₹${c.min_order}</strong> • Used: <strong>${c.times_used} times</strong>
              </p>
              ${c.banner_text ? `<p class="text-[#7DB545] italic">Banner: "${c.banner_text}"</p>` : ''}
              
              <!-- Owner Controls: Toggle Active & Delete -->
              <div class="pt-2 border-t border-gray-100 flex items-center justify-between">
                <button onclick="handleToggleCoupon(${c.id}, ${c.is_active})" class="text-xs font-bold text-[#1F6B3A] hover:underline">
                  ${c.is_active ? 'Turn Off (Deactivate)' : 'Turn On (Activate)'}
                </button>
                <button onclick="handleDeleteCoupon(${c.id}, '${c.code}')" class="text-xs font-bold text-red-600 hover:underline">
                  🗑️ Delete Offer
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function openCouponCreateModal() {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4" onclick="closeModal(event)">
      <div class="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl relative" onclick="event.stopPropagation()">
        <button onclick="closeModal()" class="absolute top-4 right-4 text-gray-500 font-bold">✕</button>
        <h3 class="text-sm font-bold text-gray-900 mb-3 font-serif">Create Festival Offer / Coupon</h3>
        
        <form onsubmit="handleSaveCoupon(event)" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Coupon Code (Uppercase)</label>
            <input type="text" id="new-c-code" required placeholder="e.g. SANKRANTI10" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded uppercase font-mono">
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Description</label>
            <input type="text" id="new-c-desc" required placeholder="e.g. Sankranti 10% Festival Discount" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded">
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold text-gray-700 mb-1">Type</label>
              <select id="new-c-type" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded">
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Cash (₹)</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-gray-700 mb-1">Discount Value</label>
              <input type="number" id="new-c-val" required placeholder="10 or 50" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded">
            </div>
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Minimum Order Amount (₹)</label>
            <input type="number" id="new-c-min" required value="500" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded">
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Homepage Banner Text</label>
            <input type="text" id="new-c-banner" placeholder="e.g. 🌾 Festive Special: 10% OFF above ₹500!" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded">
          </div>
          <button type="submit" class="w-full bg-[#1F6B3A] text-white font-bold py-2.5 rounded-xl shadow-md">
            Save Coupon
          </button>
        </form>
      </div>
    </div>
  `;
}

async function handleSaveCoupon(event) {
  event.preventDefault();
  const payload = {
    code: document.getElementById('new-c-code').value.trim().toUpperCase(),
    description: document.getElementById('new-c-desc').value.trim(),
    discount_type: document.getElementById('new-c-type').value,
    discount_value: parseFloat(document.getElementById('new-c-val').value),
    min_order: parseFloat(document.getElementById('new-c-min').value),
    banner_text: document.getElementById('new-c-banner').value.trim(),
    show_banner: 1,
    is_active: 1
  };

  try {
    await apiRequest('/api/coupons', { method: 'POST', body: payload });
    showToast("Coupon created successfully");
    closeModal();
    await loadInitialData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ----------------- 5. OWNER REFERRALS TAB -----------------
let ownerReferralsData = null;

async function loadOwnerReferrals() {
  try {
    const res = await apiRequest('/api/owner/referrals');
    ownerReferralsData = res;
    return res;
  } catch (e) {
    console.error(e);
  }
}

function renderOwnerReferralsTab() {
  if (!ownerReferralsData) {
    loadOwnerReferrals().then(() => renderApp());
    return `<div class="p-8 text-center text-xs">Loading referrals...</div>`;
  }

  const s = ownerReferralsData.settings || { referrer_reward: 100, friend_reward: 50 };
  const referrals = ownerReferralsData.referrals || [];

  return `
    <div class="space-y-4">
      <!-- Edit Rewards Box -->
      <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 sm:p-5 shadow-sm space-y-3">
        <h3 class="text-sm font-bold text-gray-800 font-serif">Referral Program Reward Settings</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-end">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Referrer Reward (₹ on friend first order)</label>
            <input type="number" id="ref-setting-referrer" value="${s.referrer_reward}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded font-bold">
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">New Friend Discount (₹ on first order)</label>
            <input type="number" id="ref-setting-friend" value="${s.friend_reward}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded font-bold">
          </div>
          <button onclick="handleUpdateReferralSettings()" class="bg-[#1F6B3A] text-white font-bold py-2 px-4 rounded-lg">
            Save Rewards
          </button>
        </div>
      </div>

      <!-- Referrals Table -->
      <div class="bg-white rounded-2xl border border-[#E5DFD3] overflow-hidden shadow-sm">
        <div class="p-4 border-b border-[#E5DFD3]">
          <h4 class="text-xs font-bold text-gray-800">Referrals History & Credits Given</h4>
        </div>
        <div class="overflow-x-auto text-xs">
          <table class="w-full text-left">
            <thead class="bg-[#FAF8F2] text-[#1F6B3A] font-bold border-b border-[#E5DFD3]">
              <tr>
                <th class="p-3">Referrer User</th>
                <th class="p-3">Friend Invited</th>
                <th class="p-3">Status</th>
                <th class="p-3">Reward Given</th>
                <th class="p-3">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-gray-700">
              ${referrals.length === 0 ? `
                <tr><td colspan="5" class="p-6 text-center text-gray-400">No customer referrals yet.</td></tr>
              ` : referrals.map(r => `
                <tr>
                  <td class="p-3 font-bold">${r.referrer_name} (${r.referrer_mobile})</td>
                  <td class="p-3">${r.friend_name} (${r.friend_mobile})</td>
                  <td class="p-3"><span class="px-2 py-0.5 rounded font-bold ${r.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}">${r.status}</span></td>
                  <td class="p-3 font-bold">₹${r.referrer_reward}</td>
                  <td class="p-3 text-gray-400">${r.created_at.split('T')[0]}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function handleUpdateReferralSettings() {
  const ref = parseFloat(document.getElementById('ref-setting-referrer').value);
  const friend = parseFloat(document.getElementById('ref-setting-friend').value);
  try {
    await apiRequest('/api/owner/referrals/settings', {
      method: 'PUT',
      body: { referrer_reward_amt: ref, friend_reward_amt: friend }
    });
    showToast("Referral rewards updated!");
    await loadOwnerReferrals();
    renderApp();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// ----------------- 6. OWNER CUSTOMERS TAB -----------------
let ownerCustomersList = [];

async function loadOwnerCustomers() {
  try {
    const res = await apiRequest('/api/owner/customers');
    ownerCustomersList = res.customers || [];
    return ownerCustomersList;
  } catch (e) {
    console.error(e);
  }
}

function renderOwnerCustomersTab() {
  if (ownerCustomersList.length === 0) {
    loadOwnerCustomers().then(() => renderApp());
  }

  return `
    <div class="bg-white rounded-2xl border border-[#E5DFD3] overflow-hidden shadow-sm space-y-3">
      <div class="p-4 border-b border-[#E5DFD3]">
        <h3 class="text-sm font-bold text-gray-800 font-serif">Customer Base (${ownerCustomersList.length})</h3>
        <p class="text-xs text-gray-500">Retail & catering buyers in Eluru district with lifetime spending.</p>
      </div>

      <div class="overflow-x-auto text-xs">
        <table class="w-full text-left">
          <thead class="bg-[#FAF8F2] text-[#1F6B3A] font-bold border-b border-[#E5DFD3]">
            <tr>
              <th class="p-3">Customer Name</th>
              <th class="p-3">Mobile Number</th>
              <th class="p-3">Referral Code</th>
              <th class="p-3">Wallet Credits</th>
              <th class="p-3">Total Orders</th>
              <th class="p-3">Lifetime Spent</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-gray-700">
            ${ownerCustomersList.map(c => `
              <tr>
                <td class="p-3 font-bold text-gray-900">${c.full_name}</td>
                <td class="p-3"><a href="tel:${c.mobile}" class="text-[#1F6B3A] underline">${c.mobile}</a></td>
                <td class="p-3 font-mono">${c.referral_code}</td>
                <td class="p-3">₹${c.wallet_balance}</td>
                <td class="p-3 font-bold">${c.order_count}</td>
                <td class="p-3 font-extrabold text-[#1F6B3A]">₹${c.total_spent}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ----------------- 7. OWNER ENQUIRIES TAB -----------------
let ownerEnquiriesList = [];

async function loadOwnerEnquiries() {
  try {
    const res = await apiRequest('/api/owner/enquiries');
    ownerEnquiriesList = res.enquiries || [];
    return ownerEnquiriesList;
  } catch (e) {
    console.error(e);
  }
}

function renderOwnerEnquiriesTab() {
  if (ownerEnquiriesList.length === 0) {
    loadOwnerEnquiries().then(() => renderApp());
  }

  return `
    <div class="space-y-4">
      <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 shadow-sm">
        <h3 class="text-sm font-bold text-gray-800 font-serif">Bulk & Function Enquiries (${ownerEnquiriesList.length})</h3>
        <p class="text-xs text-gray-500">Weddings, temple functions and catering orders from prospective buyers.</p>
      </div>

      <div class="space-y-3">
        ${ownerEnquiriesList.map(e => `
          <div class="bg-white rounded-2xl border border-[#E5DFD3] p-4 shadow-sm text-xs space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-bold text-sm text-gray-900">${e.name}</span>
                <span class="text-gray-500 ml-2">📞 <a href="tel:${e.mobile}" class="text-[#1F6B3A] underline">${e.mobile}</a></span>
              </div>
              <span class="px-2 py-0.5 rounded font-bold ${e.status === 'New' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}">${e.status}</span>
            </div>

            <p class="text-gray-700">
              Event: <strong>${e.event_type}</strong> • Date: <strong>${e.event_date}</strong> • Required Quantity: <strong>${e.quantity}</strong>
            </p>
            ${e.message ? `<p class="text-gray-600 bg-[#FAF8F2] p-2 rounded italic">Note: ${e.message}</p>` : ''}

            <div class="pt-2 flex items-center justify-between border-t border-gray-100">
              <span class="text-gray-400 text-[10px]">${e.created_at}</span>
              <div class="flex items-center gap-2">
                <button onclick="handleUpdateEnquiryStatus(${e.id}, '${e.status === 'New' ? 'Contacted' : 'Closed'}')" class="text-xs text-[#1F6B3A] font-bold hover:underline">
                  Mark as ${e.status === 'New' ? 'Contacted' : 'Closed'}
                </button>
                <a href="https://api.whatsapp.com/send?phone=91${e.mobile}&text=Namaste%20${encodeURIComponent(e.name)},%20Sri%20Lakshmi%20Ganapathi%20Areca%20Plates%20here%20regarding%20your%20bulk%20enquiry." target="_blank" class="bg-[#25D366] text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1">
                  💬 Reply on WhatsApp
                </a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

async function handleUpdateEnquiryStatus(enquiryId, status) {
  try {
    await apiRequest(`/api/owner/enquiries/${enquiryId}/status`, {
      method: 'PUT',
      body: { status }
    });
    showToast("Enquiry status updated");
    await loadOwnerEnquiries();
    renderApp();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ----------------- 8. OWNER SETTINGS TAB -----------------
function renderOwnerSettingsTab() {
  const s = APP_STATE.settings;

  return `
    <div class="max-w-2xl bg-white rounded-2xl border border-[#E5DFD3] p-5 sm:p-6 shadow-sm space-y-5 text-xs">
      <div class="border-b border-[#E5DFD3] pb-3">
        <h3 class="text-sm font-bold text-gray-800 font-serif">Store Configuration & Business Settings</h3>
        <p class="text-[11px] text-gray-500">Configure delivery rules, bulk discounts, tax settings, and business details.</p>
      </div>

      <form onsubmit="handleSaveStoreSettings(event)" class="space-y-4">
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Standard Delivery Fee (₹)</label>
            <input type="number" id="set-deliv-fee" value="${s.delivery_fee || 40}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded font-bold">
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Free Delivery Above (₹)</label>
            <input type="number" id="set-free-threshold" value="${s.free_delivery_threshold || 500}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded font-bold">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Minimum Order Amount (₹)</label>
            <input type="number" id="set-min-order" value="${s.min_order_amount || 100}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded font-bold">
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Bulk Discount Percentage (%)</label>
            <input type="number" id="set-bulk-pct" value="${s.bulk_discount_pct || 5}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded font-bold">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Bulk Discount Threshold (₹)</label>
            <input type="number" id="set-bulk-threshold" value="${s.bulk_discount_threshold || 2000}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded font-bold">
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">GST Optional Line Item (0 or 1)</label>
            <select id="set-gst-enabled" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded font-bold">
              <option value="0" ${!s.gst_enabled ? 'selected' : ''}>GST Disabled</option>
              <option value="1" ${s.gst_enabled ? 'selected' : ''}>GST Enabled (5%)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Business Opening Hours</label>
          <input type="text" id="set-hours" value="${s.opening_hours || '7:30 AM - 9:00 PM (Monday - Sunday)'}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded">
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Official UPI ID for Online Payments</label>
          <input type="text" id="set-upi" value="${s.upi_id || 'anandmajji141@axl'}" class="w-full p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded font-mono font-bold text-[#1F6B3A]">
        </div>

        <button type="submit" class="w-full bg-[#1F6B3A] text-white font-bold py-2.5 rounded-xl shadow-md">
          Save Settings
        </button>
      </form>

      <!-- Change Password -->
      <div class="pt-4 border-t border-gray-100 space-y-3">
        <h4 class="font-bold text-gray-800">Change Owner Password</h4>
        <div class="grid grid-cols-2 gap-2">
          <input type="password" id="owner-old-pw" placeholder="Current Password" class="p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded">
          <input type="password" id="owner-new-pw" placeholder="New Password (min 8)" class="p-2 bg-[#FAF8F2] border border-[#E5DFD3] rounded">
        </div>
        <button onclick="handleChangeOwnerPassword()" class="bg-gray-800 text-white font-bold px-4 py-2 rounded-lg text-xs">
          Update Password
        </button>
      </div>

    </div>
  `;
}

async function handleSaveStoreSettings(event) {
  event.preventDefault();
  const settingsObj = {
    delivery_fee: document.getElementById('set-deliv-fee').value,
    free_delivery_threshold: document.getElementById('set-free-threshold').value,
    min_order_amount: document.getElementById('set-min-order').value,
    bulk_discount_pct: document.getElementById('set-bulk-pct').value,
    bulk_discount_threshold: document.getElementById('set-bulk-threshold').value,
    gst_enabled: document.getElementById('set-gst-enabled').value,
    opening_hours: document.getElementById('set-hours').value,
    upi_id: document.getElementById('set-upi').value.trim()
  };

  try {
    await apiRequest('/api/owner/settings', {
      method: 'PUT',
      body: { settings: settingsObj }
    });
    showToast("Store settings saved successfully!");
    await loadInitialData();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function handleChangeOwnerPassword() {
  const oldPw = document.getElementById('owner-old-pw').value;
  const newPw = document.getElementById('owner-new-pw').value;
  if (!oldPw || !newPw || newPw.length < 8) {
    showToast("Password must be at least 8 characters", 'error');
    return;
  }
  try {
    await apiRequest('/api/owner/change-password', {
      method: 'POST',
      body: { current_password: oldPw, new_password: newPw }
    });
    showToast("Owner password updated successfully!");
    document.getElementById('owner-old-pw').value = '';
    document.getElementById('owner-new-pw').value = '';
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// ----------------- APPLICATION BOOTSTRAP -----------------
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadInitialData);
} else {
  loadInitialData();
}



// ----------------- FLIPKART/ZOMATO STYLE AI SUPPORT CHATBOT -----------------

function renderSupportChatLauncher() {
  return `
    <button 
      type="button"
      id="floating-help-btn"
      onclick="toggleSupportChat()"
      class="support-chat-btn bg-gradient-to-r from-[#1F6B3A] to-[#2D8A4E] text-white px-4 py-2.5 rounded-full flex items-center gap-2 shadow-2xl border border-white/20 active:scale-95 transition-all cursor-pointer"
      title="Ask Sri Lakshmi Ganapathi AI Assistant"
    >
      <span class="text-base sm:text-lg">💬</span>
      <span class="text-xs font-bold font-sans">Need Help? / సహాయం</span>
      <span class="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping"></span>
    </button>
  `;
}

function renderSupportChatDrawer() {
  if (!isSupportChatOpen) return '';

  return `
    <div class="support-drawer">
      <!-- Drawer Header -->
      <div class="bg-gradient-to-r from-[#1F6B3A] to-[#267C46] text-white p-3.5 flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-white p-0.5 border border-white/30 shrink-0">
            <img src="/static/assets/images/leaf_emblem.png" class="w-full h-full object-contain">
          </div>
          <div>
            <h4 class="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>SLG Smart Assistant</span>
              <span class="w-2 h-2 rounded-full bg-green-400"></span>
            </h4>
            <p class="text-[10px] text-green-100 font-medium">Online • Instant replies in English & Telugu</p>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <button onclick="toggleSupportChat(false)" class="text-white/80 hover:text-white p-1 rounded-lg text-sm font-bold">
            ✕
          </button>
        </div>
      </div>

      <!-- Messages Body -->
      <div id="support-chat-messages-container" class="flex-1 p-3.5 space-y-3 overflow-y-auto text-xs bg-[#FAF8F2]/60">
        ${supportChatMessages.map(msg => `
          <div class="space-y-1">
            <div class="flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}">
              ${msg.sender === 'bot' ? `
                <div class="w-6 h-6 rounded-full bg-[#1F6B3A] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                  🌿
                </div>
              ` : ''}
              <div class="p-3 max-w-[85%] whitespace-pre-line leading-relaxed shadow-xs ${
                msg.sender === 'user' ? 'chat-bubble-user text-xs' : 'chat-bubble-bot text-xs'
              }">
                ${msg.text}

                ${msg.order_data ? `
                  <div class="mt-2.5 p-2 bg-white rounded-lg border border-[#E5DFD3] text-[11px] space-y-1">
                    <div class="flex justify-between font-bold text-gray-900">
                      <span>Order #${msg.order_data.id}</span>
                      <span class="text-[#1F6B3A]">${msg.order_data.order_status}</span>
                    </div>
                    <p class="text-gray-500">Total: ₹${msg.order_data.total_amount} (${msg.order_data.payment_mode})</p>
                    <button onclick="navigateTo('orders');toggleSupportChat(false);" class="text-[#1F6B3A] font-bold underline mt-1 block">
                      Track Live Progress ➔
                    </button>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Quick replies pills -->
            ${msg.quick_replies && msg.quick_replies.length > 0 ? `
              <div class="flex flex-wrap gap-1.5 pl-8 pt-1">
                ${msg.quick_replies.map(qr => `
                  <button 
                    onclick="quickReplyClick('${qr.replace(/'/g, "\'")}')" 
                    class="bg-white hover:bg-[#EBF5E9] text-[#1F6B3A] border border-[#1F6B3A]/30 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-2xs transition-all active:scale-95"
                  >
                    ${qr}
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}

        ${supportChatLoading ? `
          <div class="flex items-center gap-2 text-gray-400 text-xs pl-8">
            <div class="w-2 h-2 rounded-full bg-[#1F6B3A] animate-ping"></div>
            <span>Assistant is typing...</span>
          </div>
        ` : ''}
      </div>

      <!-- Quick Escalation Strip -->
      <div class="px-3 py-1.5 bg-[#EBF5E9] border-t border-green-200 text-[10px] flex items-center justify-between text-gray-700">
        <span class="flex items-center gap-1 font-semibold">
          <span>👑</span> Talk with Owner Anand Majji:
        </span>
        <div class="flex items-center gap-2 font-bold">
          <a href="tel:9642677869" class="text-[#1F6B3A] hover:underline">9642677869</a>
          <span>•</span>
          <a href="https://api.whatsapp.com/send?phone=919642677869&text=Namaste%20Anand%20garu,%20I%20have%20a%20question%20about%20Sri%20Lakshmi%20Ganapathi%20plates" target="_blank" class="text-green-700 hover:underline">WhatsApp</a>
        </div>
      </div>

      <!-- Chat Input Footer -->
      <form onsubmit="handleSupportChatSubmit(event)" class="p-2.5 bg-white border-t border-gray-100 flex items-center gap-2">
        <input 
          type="text" 
          id="support-chat-input"
          placeholder="Ask in English or తెలుగు (orders, prices, bulk)..." 
          class="flex-1 text-xs p-2.5 bg-[#FAF8F2] border border-[#E5DFD3] rounded-xl focus:outline-none focus:border-[#1F6B3A]"
          autocomplete="off"
        >
        <button 
          type="submit" 
          class="bg-[#1F6B3A] hover:bg-[#18532D] text-white p-2.5 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 active:scale-95 transition-all"
        >
          <span>➤</span>
        </button>
      </form>
    </div>
  `;
}

function toggleSupportChat(forced = null) {
  if (forced !== null) {
    isSupportChatOpen = forced;
  } else {
    isSupportChatOpen = !isSupportChatOpen;
  }
  const drawerContainer = document.getElementById('ai-support-drawer-container');
  if (drawerContainer) {
    drawerContainer.innerHTML = renderSupportChatDrawer();
  } else {
    renderApp();
  }
  if (isSupportChatOpen) {
    setTimeout(() => {
      const container = document.getElementById('support-chat-messages-container');
      if (container) container.scrollTop = container.scrollHeight;
      const input = document.getElementById('support-chat-input');
      if (input) input.focus();
    }, 100);
  }
}

function handleSupportChatSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('support-chat-input');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  sendSupportChatMessage(msg);
}

function quickReplyClick(text) {
  if (text === 'WhatsApp Owner') {
    window.open('https://api.whatsapp.com/send?phone=919642677869&text=Namaste%20Anand%20garu,%20I%20need%20assistance%20with%20Sri%20Lakshmi%20Ganapathi%20plates', '_blank');
    return;
  }
  if (text === 'Bulk Enquiry Form') {
    toggleSupportChat(false);
    navigateTo('enquiry');
    return;
  }
  if (text === 'View My Orders' || text === 'Track my order') {
    if (APP_STATE.user) {
      sendSupportChatMessage('Track my order');
      return;
    }
  }
  sendSupportChatMessage(text);
}

async function sendSupportChatMessage(userText) {
  if (!userText || !userText.trim()) return;

  // Add User message
  supportChatMessages.push({
    sender: 'user',
    text: userText,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  supportChatLoading = true;
  toggleSupportChat(true);

  try {
    const res = await apiRequest('/api/support/chat', {
      method: 'POST',
      body: {
        message: userText,
        language: APP_STATE.language
      }
    });

    supportChatMessages.push({
      sender: 'bot',
      text: res.reply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quick_replies: res.quick_replies || [],
      order_data: res.order_data || null
    });
  } catch (err) {
    supportChatMessages.push({
      sender: 'bot',
      text: 'Sorry, I had trouble connecting. For immediate assistance, please call Owner Anand Majji directly at 9642677869.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quick_replies: ['WhatsApp Owner', 'Talk to Owner']
    });
  } finally {
    supportChatLoading = false;
    toggleSupportChat(true);
  }
}
