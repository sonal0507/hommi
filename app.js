// Cordova Device Ready Handler
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Device is ready');
    initializePushNotifications();
    requestLocationPermission();
    
    // Initialize app
    showScreen('splash');
    setTimeout(() => {
        showScreen('intro1');
    }, 3000);
}

// Mobile Features Initialization
function initializePushNotifications() {
    if (window.PushNotification) {
        const push = PushNotification.init({
            android: {
                senderID: "YOUR_SENDER_ID", // Replace with your FCM Sender ID
                icon: 'notification_icon',
                iconColor: '#2196F3'
            }
        });

        push.on('registration', (data) => {
            console.log('Push registration token:', data.registrationId);
            // Store this token on your server
        });

        push.on('notification', (data) => {
            console.log('Push notification received:', data);
            if (data.additionalData.foreground) {
                // App is in foreground
                navigator.notification.alert(data.message, null, data.title, 'OK');
            }
        });

        push.on('error', (e) => {
            console.log('Push notification error:', e.message);
        });
    }
}

function requestLocationPermission() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('Location permission granted');
                window.currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
            },
            (error) => {
                console.log('Location permission denied or error:', error);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 600000 }
        );
    }
}

// Enhanced Camera Functions for Mobile
function capturePhoto() {
    if (navigator.camera) {
        const options = {
            quality: 75,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 800,
            targetHeight: 600,
            allowEdit: true,
            correctOrientation: true
        };

        navigator.camera.getPicture(onCameraSuccess, onCameraError, options);
    } else {
        // Fallback to HTML5 file input
        document.getElementById('camera-input').click();
    }
}

function selectFromGallery() {
    if (navigator.camera) {
        const options = {
            quality: 75,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 800,
            targetHeight: 600,
            allowEdit: true
        };

        navigator.camera.getPicture(onCameraSuccess, onCameraError, options);
    } else {
        // Fallback to HTML5 file input
        document.getElementById('gallery-input').click();
    }
}

function onCameraSuccess(imageData) {
    const imageUrl = "data:image/jpeg;base64," + imageData;
    uploadedPhotos.push({
        id: Date.now(),
        url: imageUrl,
        timestamp: new Date().toISOString()
    });
    updatePhotoDisplay();
    navigator.notification.alert('Photo captured successfully!', null, 'Success', 'OK');
}

function onCameraError(message) {
    console.log('Camera error: ' + message);
    navigator.notification.alert('Failed to capture photo: ' + message, null, 'Camera Error', 'OK');
}

// Enhanced GPS Functions
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                window.currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                
                if (navigator.notification) {
                    navigator.notification.alert(
                        `Location captured: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
                        null,
                        'Location Found',
                        'OK'
                    );
                }
                
                // Update any location-dependent features
                updateNearbyArchitects();
            },
            (error) => {
                let errorMessage = 'Unable to get location: ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Permission denied';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Position unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Request timeout';
                        break;
                }
                
                if (navigator.notification) {
                    navigator.notification.alert(errorMessage, null, 'Location Error', 'OK');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
        );
    }
}

function updateNearbyArchitects() {
    // Update architect distances based on current location
    if (window.currentLocation) {
        console.log('Updating architect distances based on location:', window.currentLocation);
        // Implement distance calculation logic here
    }
}

// Send Push Notification (for testing)
function sendTestNotification() {
    if (navigator.notification) {
        navigator.notification.alert(
            'This is a test notification from Homii app!',
            null,
            'Test Notification',
            'OK'
        );
    }
}

// AI Expert System - Home Planning & Design Consultant
let chatMessages = [];
let isTyping = false;
let chatInitialized = false;
let conversationState = {
    currentFlow: null,
    step: 0,
    userResponses: {},
    context: {},
    projectData: {}
};

// Expert Knowledge Base - Home Design & Planning
const homeDesignExpertise = {
    roomPlanning: {
        bedroom: {
            minSize: "10x10 feet",
            idealSize: "12x12 feet",
            essentials: ["bed", "wardrobe", "study area", "ventilation"],
            designPrinciples: ["natural light", "cross ventilation", "privacy", "storage optimization"]
        },
        livingRoom: {
            minSize: "12x14 feet", 
            idealSize: "16x18 feet",
            essentials: ["seating area", "entertainment unit", "coffee table", "lighting"],
            designPrinciples: ["focal point", "conversation areas", "natural light", "circulation space"]
        },
        kitchen: {
            minSize: "8x10 feet",
            idealSize: "10x12 feet", 
            essentials: ["cooking area", "prep area", "storage", "washing area"],
            designPrinciples: ["work triangle", "storage accessibility", "ventilation", "counter space"]
        },
        bathroom: {
            minSize: "5x7 feet",
            idealSize: "6x8 feet",
            essentials: ["toilet", "basin", "shower/bathtub", "storage"],
            designPrinciples: ["waterproofing", "ventilation", "safety", "accessibility"]
        }
    },
    
    houseSizes: {
        "1BHK": { area: "400-600 sqft", rooms: 1, bathrooms: 1, ideal: "young professionals, couples" },
        "2BHK": { area: "600-900 sqft", rooms: 2, bathrooms: 2, ideal: "small families, couples" },
        "3BHK": { area: "900-1200 sqft", rooms: 3, bathrooms: 2, ideal: "families with children" },
        "4BHK": { area: "1200-1600 sqft", rooms: 4, bathrooms: 3, ideal: "large families" },
        "Villa": { area: "1500+ sqft", rooms: "3-5", bathrooms: "3-4", ideal: "luxury living" }
    },
    
    budgetEstimates: {
        basic: { perSqft: 1200, quality: "Basic materials, simple finishes" },
        standard: { perSqft: 1800, quality: "Good quality materials, standard finishes" },
        premium: { perSqft: 2500, quality: "High-quality materials, premium finishes" },
        luxury: { perSqft: 3500, quality: "Luxury materials, designer finishes" }
    },
    
    constructionPhases: {
        structure: { percentage: 40, description: "Foundation, walls, roof", duration: "3-4 months" },
        plumbing: { percentage: 10, description: "Water supply, drainage", duration: "2-3 weeks" },
        electrical: { percentage: 10, description: "Wiring, connections", duration: "2-3 weeks" },
        flooring: { percentage: 15, description: "Tiles, marble, wood", duration: "3-4 weeks" },
        painting: { percentage: 8, description: "Primer, paint, finishes", duration: "2-3 weeks" },
        fixtures: { percentage: 12, description: "Doors, windows, fittings", duration: "2-3 weeks" },
        finishing: { percentage: 5, description: "Final touches, cleanup", duration: "1-2 weeks" }
    },
    
    vaastuPrinciples: {
        entrance: "North, East, or Northeast direction",
        kitchen: "Southeast corner",
        masterBedroom: "Southwest corner", 
        puja: "Northeast corner",
        bathrooms: "Northwest or Southeast",
        staircase: "South, Southwest, or West"
    },
    
    climateConsiderations: {
        hot: {
            features: ["Cross ventilation", "High ceilings", "Sun shading", "Light colors"],
            materials: ["Hollow blocks", "Reflective roofing", "Insulation"]
        },
        humid: {
            features: ["Moisture control", "Ventilation", "Elevated foundation"],
            materials: ["Moisture-resistant materials", "Anti-fungal treatments"]
        },
        cold: {
            features: ["Insulation", "South-facing windows", "Thermal mass"],
            materials: ["Double glazing", "Insulated walls", "Carpeting"]
        }
    }
};

// Comprehensive Professional Database
const professionalDatabase = {
    architects: [
        {
            id: 'arch_001',
            name: "Priya Sharma",
            profession: "Architect",
            location: "Mumbai, India",
            distance: "2.6 km",
            rating: 4.9,
            reviews: 12,
            experience: "8+ years",
            specializations: ["Residential Design", "Modern Architecture", "Sustainable Design", "Interior Planning"],
            styles: ["Modern", "Traditional", "Contemporary", "Minimalist"],
            budget: "150k-300k",
            phone: "+91 98765 43210",
            email: "priya.architect@example.com",
            verified: true,
            portfolio: ["Modern Villa", "Traditional Bungalow", "Eco-friendly Apartment"],
            expertise: ["Kitchen Design", "Bathroom Planning", "Living Room Layout", "Bedroom Design"]
        },
        {
            id: 'arch_002',
            name: "Rajesh Kumar",
            profession: "Architect", 
            location: "Pune, India",
            distance: "1.2 km",
            rating: 4.7,
            reviews: 8,
            experience: "6 years",
            specializations: ["Sustainable Architecture", "Commercial Design", "Renovation", "Space Planning"],
            styles: ["Sustainable", "Modern", "Industrial"],
            budget: "50k-150k",
            phone: "+91 98765 43211",
            email: "rajesh.architect@example.com",
            verified: true,
            portfolio: ["Green Building", "Office Complex", "Home Renovation"],
            expertise: ["Energy Efficiency", "Natural Lighting", "Space Optimization", "Green Materials"]
        },
        {
            id: 'arch_003',
            name: "Ananya Patel",
            profession: "Architect",
            location: "Bangalore, India", 
            distance: "3.8 km",
            rating: 4.8,
            reviews: 15,
            experience: "10+ years",
            specializations: ["Luxury Homes", "Villa Design", "Landscape Architecture", "Smart Homes"],
            styles: ["Luxury", "Contemporary", "Colonial", "Mediterranean"],
            budget: "300k-600k",
            phone: "+91 98765 43212",
            email: "ananya.architect@example.com",
            verified: true,
            portfolio: ["Luxury Villa", "Smart Home", "Garden Villa"],
            expertise: ["Smart Home Integration", "Luxury Finishes", "Landscape Design", "Pool Design"]
        }
    ],
    carpenters: [
        {
            id: 'carp_001',
            name: "Suresh Yadav",
            profession: "Carpenter",
            location: "Mumbai, India",
            distance: "1.8 km",
            rating: 4.6,
            reviews: 25,
            experience: "12+ years",
            specializations: ["Custom Furniture", "Kitchen Cabinets", "Wardrobes", "Wooden Flooring"],
            styles: ["Modern", "Traditional", "Custom"],
            budget: "20k-80k",
            phone: "+91 98765 43213",
            email: "suresh.carpenter@example.com",
            verified: true,
            portfolio: ["Modular Kitchen", "Walk-in Wardrobe", "Study Table"],
            expertise: ["Cupboard Design", "Kitchen Cabinets", "Bedroom Furniture", "Living Room Furniture", "Custom Storage"]
        },
        {
            id: 'carp_002',
            name: "Ramesh Singh",
            profession: "Carpenter",
            location: "Pune, India",
            distance: "2.1 km", 
            rating: 4.5,
            reviews: 18,
            experience: "8 years",
            specializations: ["Modular Furniture", "Office Furniture", "Repair Work", "Installation"],
            styles: ["Modular", "Contemporary", "Office"],
            budget: "15k-50k",
            phone: "+91 98765 43214",
            email: "ramesh.carpenter@example.com",
            verified: true,
            portfolio: ["Office Desk", "Modular Shelves", "Repair Work"],
            expertise: ["Modular Cupboards", "Office Furniture", "Furniture Repair", "Installation Services"]
        },
        {
            id: 'carp_003',
            name: "Vikram Joshi",
            profession: "Carpenter",
            location: "Delhi, India",
            distance: "5.2 km",
            rating: 4.8,
            reviews: 30,
            experience: "15+ years",
            specializations: ["Luxury Furniture", "Antique Restoration", "Custom Designs", "Wooden Interiors"],
            styles: ["Luxury", "Antique", "Custom", "Traditional"],
            budget: "40k-120k",
            phone: "+91 98765 43215",
            email: "vikram.carpenter@example.com",
            verified: true,
            portfolio: ["Luxury Bedroom Set", "Antique Cabinet", "Custom Dining Table"],
            expertise: ["Luxury Cupboards", "Antique Restoration", "Custom Woodwork", "Traditional Designs"]
        }
    ],
    plumbers: [
        {
            id: 'plumb_001',
            name: "Anil Kumar",
            profession: "Plumber",
            location: "Mumbai, India",
            distance: "1.5 km",
            rating: 4.4,
            reviews: 22,
            experience: "10 years",
            specializations: ["Bathroom Fitting", "Kitchen Plumbing", "Water Heater Installation", "Pipe Repair"],
            styles: ["Modern", "Standard"],
            budget: "5k-25k",
            phone: "+91 98765 43216",
            email: "anil.plumber@example.com",
            verified: true,
            portfolio: ["Bathroom Renovation", "Kitchen Plumbing", "Water System"],
            expertise: ["Bathroom Plumbing", "Kitchen Sinks", "Water Heaters", "Drainage Systems", "Pipe Installation"]
        },
        {
            id: 'plumb_002',
            name: "Mahesh Gupta",
            profession: "Plumber",
            location: "Pune, India",
            distance: "2.8 km",
            rating: 4.3,
            reviews: 16,
            experience: "7 years",
            specializations: ["Drainage Systems", "Water Supply", "Leak Repair", "Fixture Installation"],
            styles: ["Standard", "Emergency"],
            budget: "3k-15k",
            phone: "+91 98765 43217",
            email: "mahesh.plumber@example.com",
            verified: true,
            portfolio: ["Drainage Work", "Water Supply", "Leak Fixing"],
            expertise: ["Emergency Repairs", "Drainage Solutions", "Water Supply Systems", "Leak Detection"]
        },
        {
            id: 'plumb_003',
            name: "Deepak Sharma",
            profession: "Plumber",
            location: "Bangalore, India",
            distance: "4.1 km",
            rating: 4.7,
            reviews: 28,
            experience: "12+ years",
            specializations: ["Luxury Bathroom", "Smart Plumbing", "Solar Water Systems", "Swimming Pool"],
            styles: ["Luxury", "Smart", "Eco-friendly"],
            budget: "15k-60k",
            phone: "+91 98765 43218",
            email: "deepak.plumber@example.com",
            verified: true,
            portfolio: ["Luxury Bathroom", "Smart Home Plumbing", "Solar System"],
            expertise: ["Luxury Fixtures", "Smart Water Systems", "Solar Installations", "Pool Plumbing"]
        }
    ],
    painters: [
        {
            id: 'paint_001',
            name: "Ravi Verma",
            profession: "Painter",
            location: "Mumbai, India",
            distance: "2.2 km",
            rating: 4.5,
            reviews: 20,
            experience: "9 years",
            specializations: ["Interior Painting", "Exterior Painting", "Texture Work", "Wallpaper"],
            styles: ["Modern", "Traditional", "Textured"],
            budget: "8k-30k",
            phone: "+91 98765 43219",
            email: "ravi.painter@example.com",
            verified: true,
            portfolio: ["Living Room Paint", "Exterior House", "Textured Wall"],
            expertise: ["Wall Painting", "Ceiling Paint", "Texture Designs", "Color Consultation", "Wallpaper Installation"]
        },
        {
            id: 'paint_002',
            name: "Santosh Patil",
            profession: "Painter",
            location: "Pune, India",
            distance: "1.9 km",
            rating: 4.4,
            reviews: 14,
            experience: "6 years",
            specializations: ["Residential Painting", "Commercial Painting", "Wood Polishing", "Metal Painting"],
            styles: ["Residential", "Commercial"],
            budget: "5k-20k",
            phone: "+91 98765 43220",
            email: "santosh.painter@example.com",
            verified: true,
            portfolio: ["Home Painting", "Office Paint", "Wood Polish"],
            expertise: ["Room Painting", "Office Spaces", "Wood Finishes", "Metal Coatings"]
        },
        {
            id: 'paint_003',
            name: "Ajay Singh",
            profession: "Painter",
            location: "Delhi, India",
            distance: "6.8 km",
            rating: 4.6,
            reviews: 35,
            experience: "14+ years",
            specializations: ["Decorative Painting", "Artistic Work", "Restoration", "Specialty Finishes"],
            styles: ["Artistic", "Decorative", "Luxury"],
            budget: "15k-50k",
            phone: "+91 98765 43221",
            email: "ajay.painter@example.com",
            verified: true,
            portfolio: ["Artistic Mural", "Decorative Wall", "Restoration Work"],
            expertise: ["Artistic Designs", "Decorative Techniques", "Wall Art", "Specialty Coatings", "Restoration"]
        }
    ],
    electricians: [
        {
            id: 'elec_001',
            name: "Mohan Lal",
            profession: "Electrician",
            location: "Mumbai, India",
            distance: "1.7 km",
            rating: 4.6,
            reviews: 18,
            experience: "11 years",
            specializations: ["Home Wiring", "LED Installation", "Fan Installation", "Switch Boards"],
            styles: ["Modern", "Standard"],
            budget: "3k-18k",
            phone: "+91 98765 43222",
            email: "mohan.electrician@example.com",
            verified: true,
            portfolio: ["Home Wiring", "LED Setup", "Fan Installation"],
            expertise: ["Electrical Wiring", "Lighting Solutions", "Fan Installation", "Switch Installation", "Safety Systems"]
        },
        {
            id: 'elec_002',
            name: "Prakash Jain",
            profession: "Electrician",
            location: "Pune, India",
            distance: "3.1 km",
            rating: 4.5,
            reviews: 21,
            experience: "8 years",
            specializations: ["Smart Home", "Security Systems", "Solar Installation", "Automation"],
            styles: ["Smart", "Automated"],
            budget: "8k-35k",
            phone: "+91 98765 43223",
            email: "prakash.electrician@example.com",
            verified: true,
            portfolio: ["Smart Home Setup", "Security System", "Solar Panel"],
            expertise: ["Smart Lighting", "Home Automation", "Security Installation", "Solar Systems"]
        }
    ]
};

// App State Management
let currentUser = null;
let currentProject = null;
let selectedArchitects = [];
let uploadedPhotos = [];
let propertyAuditData = {};
let shortlistedProfessionals = [];
let selectedForComparison = [];
let currentPhotoIndex = 0;
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];

// Mock architect data
const mockArchitects = [
    {
        id: 1,
        name: "Priya Sharma",
        location: "Mumbai, India",
        distance: "2.6 km",
        rating: 4.9,
        reviews: 12,
        bio: "Passionate about creating homes that blend modern aesthetics with traditional Indian architecture.",
        specialization: "Residential Design",
        experience: "8+ years",
        styles: ["Modern", "Traditional", "Contemporary"],
        budget: "150k-300k",
        avatar: "👩‍💼",
        portfolio: ["🏠", "🏡", "🏢"],
        services: ["Architecture Design", "Interior Design", "Project Management", "3D Visualization"],
        about: "With over 8 years of experience in residential architecture, I specialize in creating homes that perfectly balance functionality with aesthetic appeal. My designs incorporate sustainable practices and respect for Indian building traditions.",
        verified: true
    },
    {
        id: 2,
        name: "Rajesh Kumar",
        location: "Pune, India", 
        distance: "5.2 km",
        rating: 4.7,
        reviews: 8,
        bio: "Expert in sustainable architecture and energy-efficient design solutions for modern Indian homes.",
        specialization: "Sustainable Architecture",
        experience: "6 years",
        styles: ["Sustainable", "Modern", "Minimalist"],
        budget: "50k-150k",
        avatar: "👨‍💼",
        portfolio: ["🌿", "🏘️", "🏗️"],
        services: ["Sustainable Design", "Energy Consultation", "Green Building Certification"],
        about: "I focus on creating environmentally conscious designs that reduce energy consumption while maintaining comfort and style. Every project is an opportunity to build a better future.",
        verified: true
    },
    {
        id: 3,
        name: "Arun Mehta",
        location: "Mumbai, India",
        distance: "3.8 km", 
        rating: 4.8,
        reviews: 15,
        bio: "Specializing in luxury residential projects with a focus on contemporary Indian design.",
        specialization: "Luxury Residential",
        experience: "10+ years",
        styles: ["Contemporary", "Modern", "Luxury"],
        budget: "above-300k",
        avatar: "👨‍💻",
        portfolio: ["🏰", "🏖️", "🌆"],
        services: ["Luxury Design", "Custom Architecture", "High-end Interiors"],
        about: "With a decade of experience in luxury residential projects, I create bespoke architectural solutions that reflect my clients' lifestyle and aspirations.",
        verified: true
    }
];

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    console.log('App loaded successfully');
    
    // Initialize the app
    initializeApp();
    
    // Add click handlers for all buttons
    setupEventListeners();
    
    // Add specific event listener for splash screen
    const splashScreen = document.getElementById('splash');
    if (splashScreen) {
        splashScreen.addEventListener('click', function() {
            console.log('Splash screen clicked');
            showScreen('intro1');
        });
    }
});

// Initialize Application
function initializeApp() {
    // Load saved data from localStorage
    loadUserData();
    loadProjectData();
    loadShortlistData();
    
    // Setup form validation
    setupFormValidation();
    
    // Initialize any required components
    initializeComponents();
}

// Simple, reliable navigation function
function showScreen(screenId) {
    console.log('Navigating to:', screenId);
    
    // Hide all screens
    const allScreens = document.querySelectorAll('.screen');
    console.log('Found screens:', allScreens.length);
    allScreens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        window.scrollTo(0, 0);
        
        // Update dashboard with user data when showing dashboard
        if (screenId === 'dashboard') {
            console.log('Updating dashboard names...');
            updateDashboardNames();
        }
        
        // Load notes list when showing notes list screen
        if (screenId === 'notes-list') {
            loadNotesList();
        }
        
        // Load architects when showing architect listing screen
        if (screenId === 'architect-listing') {
            loadProfessionals('architects');
        }
        
        console.log('Successfully navigated to:', screenId);
        console.log('Target screen classes:', targetScreen.className);
    } else {
        console.error('Screen not found:', screenId);
        console.log('Available screen IDs:', Array.from(document.querySelectorAll('.screen')).map(s => s.id));
    }
}

// Navigation Functions
function goToWelcome() {
    showScreen('welcome');
}

function goToLogin() {
    showScreen('login');
}

function goToSignup() {
    showScreen('signup');
}

function goToOnboarding() {
    showScreen('intro1');
}

function goToDashboard() {
    showScreen('dashboard');
}

function goToMainMenu() {
    showScreen('dashboard');
}

function goToStartProject() {
    showScreen('start-new-project');
}

function goToFindProfessionals() {
    showScreen('find-professionals-main');
}

function goToTrackProgress() {
    showScreen('track-progress-main');
}

// New Project Flow Functions
function goToProjectDetails() {
    showScreen('project-details-form');
}

function goToUploadPhotos() {
    showScreen('upload-photos');
}

function goToHomePathway() {
    showScreen('home-pathway');
}

function goToFindArchitect() {
    showScreen('find-professionals-main');
}

// Form Handling
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (email && password) {
        // Simulate login
        currentUser = {
            email: email,
            name: email.split('@')[0]
        };
        saveUserData();
        showScreen('dashboard');
    }
}

function handleSignup(event) {
    event.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    if (email && password && password === confirmPassword) {
        // Simulate signup
        currentUser = {
            email: email,
            name: email.split('@')[0]
        };
        saveUserData();
        showScreen('onboarding1');
    }
}

// Step 1: Home Name Handling
function handleStep1(event) {
    event.preventDefault();
    const homeName = document.getElementById('home-name-step1').value;
    
    // Save step 1 data
    if (!currentProject) currentProject = {};
    currentProject.step1 = { homeName };
    saveProjectData();
    
    console.log('Step 1 completed, home name:', homeName);
    
    // Navigate to step 2
    showScreen('home-details-step2');
}

// Step 2: Home Details Handling
function handleStep2(event) {
    event.preventDefault();
    const formData = {
        homeType: document.getElementById('home-type-step2').value,
        bedrooms: document.getElementById('bedrooms-step2').value,
        squareFeet: document.getElementById('square-feet-step2').value,
        bathrooms: document.getElementById('bathrooms-step2').value,
        homeLocation: document.getElementById('home-location-step2').value
    };
    
    // Save step 2 data
    currentProject.step2 = formData;
    saveProjectData();
    
    // Navigate to step 3
    showScreen('home-details-step3');
}

// Step 3: Family Invitation Handling
function handleStep3(event) {
    event.preventDefault();
    const familyInvite = document.getElementById('family-invite-step3').value;
    
    // Save step 3 data
    currentProject.step3 = { familyInvite };
    saveProjectData();
    
    // Navigate to step 4
    showScreen('home-details-step4');
}

// Step 4: Budget Handling
function handleStep4(event) {
    event.preventDefault();
    const budget = document.getElementById('budget-step4').value;
    
    // Save step 4 data
    currentProject.step4 = { budget };
    saveProjectData();
    
    console.log('Step 4 completed, project setup finished');
    
    // Show congratulations and navigate to pathway
    showCongratulations();
}

// BOQ Upload Handling
function handleBOQUpload(input) {
    const file = input.files[0];
    const statusDiv = document.getElementById('boq-status');
    
    if (file) {
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            statusDiv.textContent = 'File too large. Please choose a file under 10MB.';
            statusDiv.className = 'upload-status error';
            return;
        }
        
        // Success
        statusDiv.textContent = `✓ ${file.name} uploaded successfully`;
        statusDiv.className = 'upload-status success';
        
        // Store file reference
        if (!currentProject.step4) currentProject.step4 = {};
        currentProject.step4.boqFile = {
            name: file.name,
            size: file.size,
            type: file.type
        };
        saveProjectData();
    }
}

// Congratulations handler
function showCongratulations() {
    // For now, directly navigate to dashboard then pathway
    // This ensures the dashboard names are updated first
    console.log('Setup completed, navigating to dashboard then pathway');
    showScreen('dashboard');
    
    // Small delay to ensure dashboard loads before going to pathway
    setTimeout(() => {
        showScreen('home-pathway');
    }, 100);
}

// Phase selection handler
function selectPhase(phaseNumber) {
    console.log('Phase selected:', phaseNumber);
    
    // Update active tab
    const tabs = document.querySelectorAll('.phase-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    tabs[phaseNumber - 1]?.classList.add('active');
    
    // In a real app, this would load different phase content
    // For now, we'll just log the selection
}

// Step details handler
function showStepDetails(stepId) {
    console.log('Step details requested for:', stepId);
    // In a real app, this would show detailed step information
}

// Property audit screen placeholder
function showPropertyAudit() {
    console.log('Property audit screen - to be implemented');
    // This will be implemented with the detailed property audit flow
}

// Login Functions
function handleGoogleLogin() {
    // Simulate Google login
    console.log('Google login clicked');
    currentUser = {
        email: 'user@gmail.com',
        name: 'User',
        loginMethod: 'google'
    };
    saveUserData();
    showScreen('home-setup');
}

function handleEmailLogin() {
    const email = document.getElementById('welcome-email').value;
    if (email && email.includes('@')) {
        // Simulate email login
        currentUser = {
            email: email,
            name: email.split('@')[0],
            loginMethod: 'email'
        };
        saveUserData();
        showScreen('home-setup');
    } else {
        alert('Please enter a valid email address');
    }
}

function showOtherOptions() {
    // This could show additional login options like Apple, Facebook, etc.
    console.log('Show other login options');
    // For now, just show the existing login screen
    showScreen('login');
}

// Data Management for Shortlist
function loadShortlistData() {
    const saved = localStorage.getItem('homii-shortlist');
    if (saved) {
        shortlistedProfessionals = JSON.parse(saved);
    }
}

function saveShortlistData() {
    localStorage.setItem('homii-shortlist', JSON.stringify(shortlistedProfessionals));
}

// Data Management
function loadUserData() {
    const saved = localStorage.getItem('homii-user');
    if (saved) {
        currentUser = JSON.parse(saved);
        console.log('Loaded user data:', currentUser);
    }
}

function saveUserData() {
    localStorage.setItem('homii-user', JSON.stringify(currentUser));
    console.log('Saved user data:', currentUser);
}

function loadProjectData() {
    const saved = localStorage.getItem('homii-project');
    if (saved) {
        currentProject = JSON.parse(saved);
        console.log('Loaded project data:', currentProject);
    }
}

function saveProjectData() {
    localStorage.setItem('homii-project', JSON.stringify(currentProject));
    console.log('Saved project data:', currentProject);
}

// Update Dashboard Names
function updateDashboardNames() {
    try {
        // Get user name - try multiple sources
        let userName = 'User';
        if (currentUser && currentUser.name) {
            userName = currentUser.name;
        } else if (currentUser && currentUser.email) {
            userName = currentUser.email.split('@')[0];
        }
        
        // Get home name from project data
        let homeName = 'User\'s Home';
        if (currentProject && currentProject.step1 && currentProject.step1.homeName) {
            homeName = currentProject.step1.homeName;
        }
        
        // Update the dashboard elements
        const userNameElement = document.getElementById('dashboard-user-name');
        const homeNameElements = document.querySelectorAll('#dashboard-home-name');
        
        if (userNameElement) {
            userNameElement.textContent = userName + '!';
        }
        
        homeNameElements.forEach(element => {
            if (element) {
                element.textContent = homeName;
            }
        });
        
        console.log('Dashboard updated with user:', userName, 'home:', homeName);
    } catch (error) {
        console.error('Error updating dashboard names:', error);
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Add any additional event listeners here
    console.log('Event listeners setup complete');
}

// Form Validation
function setupFormValidation() {
    // Add form validation logic here
    console.log('Form validation setup complete');
}

// Initialize Components
function initializeComponents() {
    // Initialize any additional components as needed
    console.log('Components initialized successfully');
}

// Back Navigation
function goBack() {
    // Simple back navigation - in a real app you'd maintain a navigation history
    window.history.back();
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('homii-user');
    showScreen('welcome');
}

// Site Survey Photo Functions
function openPhotoOptions() {
    document.getElementById('photo-modal').style.display = 'block';
}

function closePhotoModal() {
    document.getElementById('photo-modal').style.display = 'none';
}

function takePhoto() {
    document.getElementById('camera-input').click();
    closePhotoModal();
}

function selectFromGallery() {
    document.getElementById('gallery-input').click();
    closePhotoModal();
}

function handlePhotoCapture(input) {
    const files = input.files;
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = function(e) {
                currentPhotoIndex = uploadedPhotos.length;
                showPhotoDetailModal(e.target.result, file);
            };
            reader.readAsDataURL(file);
        }
    }
    input.value = ''; // Reset input
}

function showPhotoDetailModal(imageSrc, file) {
    const modal = document.getElementById('photo-detail-modal');
    const preview = document.getElementById('photo-preview');
    preview.innerHTML = `<img src="${imageSrc}" alt="Photo preview">`;
    modal.style.display = 'block';
}

function closePhotoDetailModal() {
    document.getElementById('photo-detail-modal').style.display = 'none';
    document.getElementById('room-tag').value = '';
    document.getElementById('photo-notes').value = '';
}

function savePhotoDetails() {
    const roomTag = document.getElementById('room-tag').value;
    const notes = document.getElementById('photo-notes').value;
    const imageSrc = document.querySelector('#photo-preview img').src;
    
    const photo = {
        id: Date.now(),
        src: imageSrc,
        roomTag: roomTag || 'Untagged',
        notes: notes,
        timestamp: new Date().toLocaleString()
    };
    
    uploadedPhotos.push(photo);
    updatePhotoDisplay();
    closePhotoDetailModal();
    updateNextButton();
}

function updatePhotoDisplay() {
    const photoCount = document.getElementById('photo-count');
    const syncStatus = document.getElementById('sync-status');
    const photoGrid = document.getElementById('photo-grid');
    
    photoCount.textContent = `${uploadedPhotos.length} Photos Uploaded`;
    syncStatus.textContent = uploadedPhotos.length > 0 ? '✅ All synced' : '📤 Ready to sync';
    
    photoGrid.innerHTML = '';
    uploadedPhotos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.innerHTML = `
            <img src="${photo.src}" alt="Site photo">
            <div class="photo-tag">${photo.roomTag}</div>
            <button class="photo-delete" onclick="deletePhoto(${index})">×</button>
        `;
        photoItem.onclick = () => viewPhotoDetail(index);
        photoGrid.appendChild(photoItem);
    });
}

function deletePhoto(index) {
    uploadedPhotos.splice(index, 1);
    updatePhotoDisplay();
    updateNextButton();
}

function viewPhotoDetail(index) {
    const photo = uploadedPhotos[index];
    alert(`Room: ${photo.roomTag}\nNotes: ${photo.notes || 'No notes'}\nTime: ${photo.timestamp}`);
}

function updateNextButton() {
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.disabled = uploadedPhotos.length === 0;
    }
}

function goToNext() {
    if (uploadedPhotos.length > 0) {
        // Save photos to project data
        if (!currentProject) currentProject = {};
        currentProject.sitePhotos = uploadedPhotos;
        saveProjectData();
        
        showScreen('home-pathway');
    }
}

function toggleVoiceRecording() {
    const voiceIcon = document.getElementById('voice-icon');
    const voiceText = document.getElementById('voice-text');
    const voiceStatus = document.getElementById('voice-status');
    
    if (!isRecording) {
        // Start recording
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    mediaRecorder = new MediaRecorder(stream);
                    audioChunks = [];
                    
                    mediaRecorder.ondataavailable = event => {
                        audioChunks.push(event.data);
                    };
                    
                    mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                        voiceStatus.textContent = '✅ Voice note recorded';
                    };
                    
                    mediaRecorder.start();
                    isRecording = true;
                    voiceIcon.textContent = '⏹️';
                    voiceText.textContent = 'Stop Recording';
                    voiceStatus.textContent = '🔴 Recording...';
                })
                .catch(err => {
                    voiceStatus.textContent = '❌ Could not access microphone';
                });
        }
    } else {
        // Stop recording
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        isRecording = false;
        voiceIcon.textContent = '🎤';
        voiceText.textContent = 'Add Voice Note';
    }
}

// Architect Listing Functions
function selectProfessionalTab(tabName) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // Load professionals based on tab
    loadProfessionals(tabName);
}

function loadProfessionals(type = 'architects') {
    const list = document.getElementById('professionals-list');
    list.innerHTML = '';
    
    if (type === 'architects') {
        mockArchitects.forEach(architect => {
            const card = createProfessionalCard(architect);
            list.appendChild(card);
        });
    } else {
        list.innerHTML = `<div style="text-align: center; padding: 40px; color: #666;">
            ${type.charAt(0).toUpperCase() + type.slice(1)} coming soon!
        </div>`;
    }
}

function createProfessionalCard(architect) {
    const card = document.createElement('div');
    card.className = 'professional-card';
    const isArchitectShortlisted = isShortlisted(architect.id);
    
    card.innerHTML = `
        <div class="professional-header">
            <div class="professional-avatar">
                <div style="font-size: 30px; display: flex; align-items: center; justify-content: center; height: 100%;">
                    ${architect.avatar}
                </div>
            </div>
            <div class="professional-info">
                <div class="professional-name">${architect.name}</div>
                <div class="professional-location">${architect.location} | ${architect.distance}</div>
                <div class="professional-rating">
                    ⭐ ${architect.rating} (${architect.reviews} reviews)
                </div>
            </div>
        </div>
        <div class="professional-bio">${architect.bio}</div>
        <div class="professional-actions">
            <button class="btn btn-outline ${isArchitectShortlisted ? 'shortlisted' : ''}" 
                    onclick="shortlistArchitect(${architect.id})" 
                    style="${isArchitectShortlisted ? 'background-color: #4CAF50; color: white;' : ''}">
                ${isArchitectShortlisted ? 'Shortlisted' : 'Shortlist'}
            </button>
            <button class="btn btn-primary" onclick="viewArchitectProfile(${architect.id})">View work</button>
        </div>
    `;
    return card;
}

function isShortlisted(architectId) {
    return shortlistedProfessionals.some(p => p.id === architectId);
}

function shortlistArchitect(architectId) {
    const architect = mockArchitects.find(a => a.id === architectId);
    
    if (architect) {
        if (!isShortlisted(architectId)) {
            // Add to shortlist
            shortlistedProfessionals.push(architect);
            saveShortlistData();
            
            // Update all shortlist buttons for this architect
            updateShortlistButtons(architectId, true);
            
            // Show feedback
            showToast('Added to shortlist!');
        } else {
            // Remove from shortlist
            shortlistedProfessionals = shortlistedProfessionals.filter(p => p.id !== architectId);
            saveShortlistData();
            
            // Update all shortlist buttons for this architect
            updateShortlistButtons(architectId, false);
            
            // Show feedback
            showToast('Removed from shortlist!');
        }
    }
}

function updateShortlistButtons(architectId, isShortlisted) {
    // Find all shortlist buttons for this architect and update them
    const buttons = document.querySelectorAll(`button[onclick="shortlistArchitect(${architectId})"]`);
    buttons.forEach(button => {
        if (isShortlisted) {
            button.textContent = 'Shortlisted';
            button.classList.add('shortlisted');
            button.style.backgroundColor = '#4CAF50';
            button.style.color = 'white';
        } else {
            button.textContent = 'Shortlist';
            button.classList.remove('shortlisted');
            button.style.backgroundColor = '';
            button.style.color = '';
        }
    });
}

function viewArchitectProfile(architectId) {
    const architect = mockArchitects.find(a => a.id === architectId);
    if (architect) {
        displayArchitectProfile(architect);
        showScreen('architect-profile');
    }
}

function displayArchitectProfile(architect) {
    const content = document.getElementById('architect-profile-content');
    content.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">
                <div style="font-size: 50px; display: flex; align-items: center; justify-content: center; height: 100%;">
                    ${architect.avatar}
                </div>
            </div>
            <div class="profile-name">${architect.name}</div>
            <div class="profile-specialization">${architect.specialization}</div>
            <div class="profile-rating">
                ⭐ ${architect.rating} (${architect.reviews} reviews) ${architect.verified ? '✅' : ''}
            </div>
            <div class="profile-location">${architect.location}</div>
        </div>
        
        <div class="profile-tabs">
            <button class="profile-tab active" onclick="showProfileTab('about')">About</button>
            <button class="profile-tab" onclick="showProfileTab('portfolio')">Portfolio</button>
            <button class="profile-tab" onclick="showProfileTab('services')">Services</button>
            <button class="profile-tab" onclick="showProfileTab('reviews')">Reviews</button>
        </div>
        
        <div id="profile-tab-content">
            <div class="profile-section">
                <h4>About</h4>
                <p>${architect.about}</p>
                <p><strong>Experience:</strong> ${architect.experience}</p>
                <p><strong>Specializes in:</strong> ${architect.styles.join(', ')}</p>
            </div>
        </div>
        
        <div class="profile-actions">
            <button class="btn btn-outline ${isShortlisted(architect.id) ? 'shortlisted' : ''}" 
                    onclick="shortlistArchitect(${architect.id})" 
                    style="${isShortlisted(architect.id) ? 'background-color: #4CAF50; color: white;' : ''}">
                ${isShortlisted(architect.id) ? 'Shortlisted' : 'Shortlist'}
            </button>
            <button class="btn btn-primary" onclick="contactArchitect(${architect.id})">Contact</button>
        </div>
    `;
}

function showProfileTab(tabName) {
    const tabs = document.querySelectorAll('.profile-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const content = document.getElementById('profile-tab-content');
    const architect = mockArchitects.find(a => a.id === parseInt(document.querySelector('.profile-actions .btn-primary').onclick.toString().match(/\d+/)[0]));
    
    switch(tabName) {
        case 'about':
            content.innerHTML = `
                <div class="profile-section">
                    <h4>About</h4>
                    <p>${architect.about}</p>
                    <p><strong>Experience:</strong> ${architect.experience}</p>
                    <p><strong>Specializes in:</strong> ${architect.styles.join(', ')}</p>
                </div>
            `;
            break;
        case 'portfolio':
            content.innerHTML = `
                <div class="profile-section">
                    <h4>Portfolio</h4>
                    <div class="portfolio-grid">
                        ${architect.portfolio.map(item => `
                            <div class="portfolio-item">
                                <div style="height: 120px; display: flex; align-items: center; justify-content: center; font-size: 48px;">
                                    ${item}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            break;
        case 'services':
            content.innerHTML = `
                <div class="profile-section">
                    <h4>Services Offered</h4>
                    <div class="services-list">
                        ${architect.services.map(service => `
                            <span class="service-tag">${service}</span>
                        `).join('')}
                    </div>
                </div>
            `;
            break;
        case 'reviews':
            content.innerHTML = `
                <div class="profile-section">
                    <h4>Client Reviews</h4>
                    <div style="text-align: center; padding: 20px; color: #666;">
                        Reviews coming soon!
                    </div>
                </div>
            `;
            break;
    }
}

function contactArchitect(architectId) {
    showToast('Contact feature coming soon!');
}

// Filter Functions
function showFilterModal() {
    document.getElementById('filter-modal').style.display = 'block';
}

function closeFilterModal() {
    document.getElementById('filter-modal').style.display = 'none';
}

function updateRadiusValue(value) {
    document.getElementById('radius-value').textContent = value;
}

function toggleStyle(button) {
    button.classList.toggle('selected');
}

function resetFilters() {
    // Reset all filter inputs
    document.getElementById('location-filter').value = '';
    document.getElementById('radius-slider').value = 25;
    updateRadiusValue(25);
    
    document.querySelectorAll('input[name="experience"]').forEach(input => input.checked = false);
    document.querySelectorAll('input[name="budget"]').forEach(input => input.checked = false);
    document.querySelectorAll('.style-btn').forEach(btn => btn.classList.remove('selected'));
}

function applyFilters() {
    // Collect filter values
    const location = document.getElementById('location-filter').value;
    const radius = document.getElementById('radius-slider').value;
    const experience = document.querySelector('input[name="experience"]:checked')?.value;
    const budget = document.querySelector('input[name="budget"]:checked')?.value;
    const styles = Array.from(document.querySelectorAll('.style-btn.selected')).map(btn => btn.textContent);
    
    // Update active filters display
    updateActiveFilters({ location, radius, experience, budget, styles });
    
    // Filter and display results
    filterArchitects({ location, radius, experience, budget, styles });
    
    closeFilterModal();
}

function updateActiveFilters(filters) {
    const container = document.getElementById('active-filters');
    container.innerHTML = '';
    
    if (filters.location) {
        container.innerHTML += `<span class="filter-chip">${filters.location} <span onclick="removeFilter(this)">×</span></span>`;
    }
    if (filters.experience) {
        container.innerHTML += `<span class="filter-chip">${filters.experience} Level <span onclick="removeFilter(this)">×</span></span>`;
    }
    if (filters.budget) {
        const budgetLabels = {
            'under-50k': 'Under ₹50K',
            '50k-150k': '₹50K-1.5L',
            '150k-300k': '₹1.5L-3L',
            'above-300k': 'Above ₹3L'
        };
        container.innerHTML += `<span class="filter-chip">${budgetLabels[filters.budget]} <span onclick="removeFilter(this)">×</span></span>`;
    }
    if (filters.styles && filters.styles.length > 0) {
        filters.styles.forEach(style => {
            container.innerHTML += `<span class="filter-chip">${style} <span onclick="removeFilter(this)">×</span></span>`;
        });
    }
}

function removeFilter(element) {
    element.parentElement.remove();
    // Re-apply remaining filters
    loadProfessionals('architects');
}

function filterArchitects(filters) {
    let filteredArchitects = [...mockArchitects];
    
    if (filters.budget) {
        filteredArchitects = filteredArchitects.filter(architect => architect.budget === filters.budget);
    }
    
    if (filters.styles && filters.styles.length > 0) {
        filteredArchitects = filteredArchitects.filter(architect => 
            filters.styles.some(style => architect.styles.includes(style))
        );
    }
    
    // Display filtered results
    const list = document.getElementById('professionals-list');
    list.innerHTML = '';
    
    if (filteredArchitects.length === 0) {
        list.innerHTML = `<div style="text-align: center; padding: 40px; color: #666;">
            No architects found matching your criteria. Try adjusting your filters.
        </div>`;
    } else {
        filteredArchitects.forEach(architect => {
            const card = createProfessionalCard(architect);
            list.appendChild(card);
        });
    }
}

// Utility Functions
function showToast(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        z-index: 10000;
        font-size: 14px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

// Write Notes functionality
function writeNotes() {
    showScreen('write-notes');
}

function saveNote() {
    const noteTitle = document.getElementById('note-title').value;
    const noteContent = document.getElementById('note-content').value;
    
    if (noteTitle.trim() === '' || noteContent.trim() === '') {
        showToast('Please enter both title and content for the note');
        return;
    }
    
    const note = {
        id: Date.now(),
        title: noteTitle,
        content: noteContent,
        timestamp: new Date().toLocaleString(),
        project: currentProject?.step1?.homeName || 'Current Project'
    };
    
    // Load existing notes
    let notes = JSON.parse(localStorage.getItem('homii-notes') || '[]');
    notes.unshift(note); // Add to beginning of array
    
    // Save to localStorage
    localStorage.setItem('homii-notes', JSON.stringify(notes));
    
    // Show success message
    showToast('Note saved successfully!');
    
    // Clear form
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    
    // Update notes list if visible
    loadNotesList();
}

function loadNotesList() {
    const notesList = document.getElementById('notes-list');
    if (!notesList) return;
    
    const notes = JSON.parse(localStorage.getItem('homii-notes') || '[]');
    
    if (notes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state">
                <span style="font-size: 48px;">📝</span>
                <h3>No notes yet</h3>
                <p>Start writing your thoughts and ideas</p>
            </div>
        `;
        return;
    }
    
    notesList.innerHTML = notes.map(note => `
        <div class="note-item">
            <div class="note-header">
                <h4 class="note-title">${note.title}</h4>
                <span class="note-date">${note.timestamp}</span>
            </div>
            <p class="note-content">${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</p>
            <div class="note-footer">
                <span class="note-project">${note.project}</span>
                <button class="btn-delete" onclick="deleteNote(${note.id})" title="Delete note">🗑️</button>
            </div>
        </div>
    `).join('');
}

function deleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        let notes = JSON.parse(localStorage.getItem('homii-notes') || '[]');
        notes = notes.filter(note => note.id !== noteId);
        localStorage.setItem('homii-notes', JSON.stringify(notes));
        loadNotesList();
        showToast('Note deleted');
    }
}

function goToDesignBrief() {
    showScreen('design-brief');
}

// Initialize architect listing when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProfessionals('architects');
});

// Make functions globally available for onclick handlers
window.showScreen = showScreen;
window.goToWelcome = goToWelcome;
window.goToLogin = goToLogin;
window.goToSignup = goToSignup;
window.goToOnboarding = goToOnboarding;
window.goToDashboard = goToDashboard;
window.goToMainMenu = goToMainMenu;
window.goToStartProject = goToStartProject;
window.goToFindProfessionals = goToFindProfessionals;
window.goToTrackProgress = goToTrackProgress;
window.goToProjectDetails = goToProjectDetails;
window.goToUploadPhotos = goToUploadPhotos;
window.goToHomePathway = goToHomePathway;
window.goToFindArchitect = goToFindArchitect;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleStep1 = handleStep1;
window.handleStep2 = handleStep2;
window.handleStep3 = handleStep3;
window.handleStep4 = handleStep4;
window.handleBOQUpload = handleBOQUpload;
window.selectPhase = selectPhase;
window.showStepDetails = showStepDetails;
window.showPropertyAudit = showPropertyAudit;
window.handleGoogleLogin = handleGoogleLogin;
window.handleEmailLogin = handleEmailLogin;
window.showOtherOptions = showOtherOptions;
window.goBack = goBack;
window.logout = logout;

// Site Survey Functions
window.openPhotoOptions = openPhotoOptions;
window.closePhotoModal = closePhotoModal;
window.takePhoto = takePhoto;
window.selectFromGallery = selectFromGallery;
window.handlePhotoCapture = handlePhotoCapture;
window.showPhotoDetailModal = showPhotoDetailModal;
window.closePhotoDetailModal = closePhotoDetailModal;
window.savePhotoDetails = savePhotoDetails;
window.deletePhoto = deletePhoto;
window.viewPhotoDetail = viewPhotoDetail;
window.goToNext = goToNext;
window.toggleVoiceRecording = toggleVoiceRecording;

// Architect Functions  
window.selectProfessionalTab = selectProfessionalTab;
window.shortlistArchitect = shortlistArchitect;
window.viewArchitectProfile = viewArchitectProfile;
window.showProfileTab = showProfileTab;
window.contactArchitect = contactArchitect;
window.showFilterModal = showFilterModal;
window.closeFilterModal = closeFilterModal;
window.updateRadiusValue = updateRadiusValue;
window.toggleStyle = toggleStyle;
window.resetFilters = resetFilters;
window.applyFilters = applyFilters;
window.removeFilter = removeFilter;

// AI Chatbot System
function initializeChatbot() {
    if (!chatInitialized) {
        chatMessages = [
            {
                sender: 'bot',
                message: "👋 Hello! I'm your Homii AI Assistant. I'm here to help you with all your home construction, design, and planning needs. You can ask me about:\n\n🏗️ Finding professionals (architects, carpenters, plumbers, painters)\n🏠 Home design advice\n📐 Planning guidance\n💡 Construction tips\n\nWhat would you like to know?",
                timestamp: new Date().toLocaleTimeString()
            }
        ];
        chatInitialized = true;
    }
    displayChatMessages();
}

function displayChatMessages() {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;
    
    chatContainer.innerHTML = '';
    
    chatMessages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.sender}-message`;
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${msg.message}</div>
                <div class="message-time">${msg.timestamp}</div>
            </div>
        `;
        
        chatContainer.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function sendMessage() {
    const messageInput = document.getElementById('chat-input');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    chatMessages.push({
        sender: 'user',
        message: message,
        timestamp: new Date().toLocaleTimeString()
    });
    
    messageInput.value = '';
    displayChatMessages();
    
    // Show typing indicator
    showTypingIndicator();
    
    // Process message and generate response
    setTimeout(() => {
        const response = processUserMessage(message);
        hideTypingIndicator();
        
        chatMessages.push({
            sender: 'bot',
            message: response,
            timestamp: new Date().toLocaleTimeString()
        });
        
        displayChatMessages();
    }, 1000 + Math.random() * 2000); // Simulate thinking time
}

function showTypingIndicator() {
    isTyping = true;
    const chatContainer = document.getElementById('chat-messages');
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'message bot-message typing';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function hideTypingIndicator() {
    isTyping = false;
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function processUserMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    // If we're in the middle of a conversation flow, continue it
    if (conversationState.currentFlow) {
        return continueConversationFlow(message);
    }
    
    // Home planning and design flows
    if (lowerMessage.includes('plan') && (lowerMessage.includes('home') || lowerMessage.includes('house'))) {
        return startHomePlanningFlow();
    }
    
    if (lowerMessage.includes('design') && (lowerMessage.includes('home') || lowerMessage.includes('house') || lowerMessage.includes('interior'))) {
        return startHomeDesignFlow();
    }
    
    // Budget planning flow
    if (lowerMessage.includes('budget') || lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('estimate')) {
        return startBudgetConsultationFlow();
    }
    
    // Room-specific design
    if (lowerMessage.includes('kitchen')) {
        return startKitchenDesignFlow();
    }
    
    if (lowerMessage.includes('bedroom')) {
        return startBedroomDesignFlow();
    }
    
    if (lowerMessage.includes('bathroom')) {
        return startBathroomDesignFlow();
    }
    
    if (lowerMessage.includes('living room') || lowerMessage.includes('hall')) {
        return startLivingRoomDesignFlow();
    }
    
    // Professional consultation flows
    if (lowerMessage.includes('carpenter') || lowerMessage.includes('cupboard') || lowerMessage.includes('furniture')) {
        return startCarpenterConsultationFlow();
    }
    
    if (lowerMessage.includes('architect')) {
        return startArchitectConsultationFlow();
    }
    
    if (lowerMessage.includes('plumber')) {
        return startPlumberConsultationFlow();
    }
    
    if (lowerMessage.includes('painter') || lowerMessage.includes('paint')) {
        return startPainterConsultationFlow();
    }
    
    if (lowerMessage.includes('electrician') || lowerMessage.includes('electrical')) {
        return startElectricianConsultationFlow();
    }
    
    // Construction advice
    if (lowerMessage.includes('construction') || lowerMessage.includes('building')) {
        return startConstructionAdviceFlow();
    }
    
    // Vastu consultation
    if (lowerMessage.includes('vastu') || lowerMessage.includes('direction')) {
        return startVastuConsultationFlow();
    }
    
    // Material advice
    if (lowerMessage.includes('material') || lowerMessage.includes('tiles') || lowerMessage.includes('flooring')) {
        return startMaterialAdviceFlow();
    }
    
    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "🏠 **Welcome! I'm your Master Home Planning & Design Expert** 🏗️\n\nI have **20+ years of virtual expertise** in:\n\n🎯 **Complete Home Planning**\n📐 **Architectural Design** \n🎨 **Interior Design**\n💰 **Budget Optimization**\n🔧 **Construction Guidance**\n🧭 **Vastu Consultation**\n📏 **Space Planning**\n🏗️ **Material Selection**\n\n**What would you like to plan or design today?**\n\n💡 Try: \"Plan my 3BHK home\", \"Design my kitchen\", \"Budget for construction\"";
    }
    
    // Thank you responses
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return "You're very welcome! 😊 As your dedicated home design expert, I'm always here to help you create your dream home. Feel free to ask about any planning, design, or construction needs!";
    }
    
    // Default expert response
    return `🏠 **I'm your Master Home Design & Planning Expert!** 🏗️\n\nI can help you with comprehensive consultation:\n\n🎯 **\"Plan my home\"** - Complete house planning from scratch\n📐 **\"Design my [room]\"** - Detailed room design consultation  \n💰 **\"Budget planning\"** - Accurate cost estimation\n🔧 **\"Construction advice\"** - Step-by-step building guidance\n🧭 **\"Vastu consultation\"** - Direction and placement advice\n🎨 **\"Interior design\"** - Style and decor recommendations\n📏 **\"Space planning\"** - Optimize your layout\n🏗️ **\"Material advice\"** - Best materials for your needs\n\n**Just tell me what you want to plan or design, and I'll guide you through every detail!**`;
}

// Expert Consultation Flow Functions

function continueConversationFlow(message) {
    const flow = conversationState.currentFlow;
    const step = conversationState.step;
    
    // Store user response
    conversationState.userResponses[`step${step}`] = message;
    
    switch (flow) {
        case 'homePlanning':
            return continueHomePlanningFlow(message, step);
        case 'budgetConsultation':
            return continueBudgetConsultationFlow(message, step);
        case 'kitchenDesign':
            return continueKitchenDesignFlow(message, step);
        case 'bedroomDesign':
            return continueBedroomDesignFlow(message, step);
        case 'bathroomDesign':
            return continueBathroomDesignFlow(message, step);
        case 'carpenterConsultation':
            return continueCarpenterConsultationFlow(message, step);
        case 'architectConsultation':
            return continueArchitectConsultationFlow(message, step);
        default:
            return resetConversation();
    }
}

function startHomePlanningFlow() {
    conversationState.currentFlow = 'homePlanning';
    conversationState.step = 1;
    conversationState.userResponses = {};
    
    return `🏠 **Welcome to Complete Home Planning Consultation!** 🏗️\n\nAs your expert architect, I'll help you plan your entire home from scratch. Let's start with the basics:\n\n**Question 1/9: What type of home are you planning?**\n\nA) 1BHK (400-600 sqft) - Young professionals\nB) 2BHK (600-900 sqft) - Small families  \nC) 3BHK (900-1200 sqft) - Families with children\nD) 4BHK (1200-1600 sqft) - Large families\nE) Villa (1500+ sqft) - Luxury living\nF) Other - Tell me your specific requirements\n\nJust type A, B, C, D, E, or F, or describe your needs!`;
}

function continueHomePlanningFlow(message, step) {
    const lowerMessage = message.toLowerCase();
    
    switch (step) {
        case 1:
            conversationState.step = 2;
            let houseType = '';
            if (lowerMessage.includes('a') || lowerMessage.includes('1bhk')) houseType = '1BHK';
            else if (lowerMessage.includes('b') || lowerMessage.includes('2bhk')) houseType = '2BHK';
            else if (lowerMessage.includes('c') || lowerMessage.includes('3bhk')) houseType = '3BHK';
            else if (lowerMessage.includes('d') || lowerMessage.includes('4bhk')) houseType = '4BHK';
            else if (lowerMessage.includes('e') || lowerMessage.includes('villa')) houseType = 'Villa';
            else houseType = 'Custom';
            
            conversationState.projectData.houseType = houseType;
            
            return `✅ Great choice! **${houseType}** is perfect for your needs.\n\n**Question 2/9: What's your total plot/carpet area in square feet?**\n\n💡 **Expert Tip:** \n• 1BHK needs 400-600 sqft\n• 2BHK needs 600-900 sqft  \n• 3BHK needs 900-1200 sqft\n• 4BHK needs 1200+ sqft\n\nPlease tell me your available area (e.g., "1000 sqft" or "50x40 feet")`;
            
        case 2:
            conversationState.step = 3;
            const area = extractAreaFromMessage(message);
            conversationState.projectData.area = area;
            
            return `📏 **${area} sqft** - Perfect! That's a good size for your ${conversationState.projectData.houseType}.\n\n**Question 3/9: How many family members will live in this home?**\n\n👨‍👩‍👧‍👦 This helps me plan:\n• Bedroom requirements\n• Bathroom needs\n• Storage space\n• Common areas\n\nJust tell me the number (e.g., "4 members" or "family of 5")`;
            
        case 3:
            conversationState.step = 4;
            conversationState.projectData.familySize = extractNumberFromMessage(message);
            
            return `👪 **${conversationState.projectData.familySize} family members** - Got it!\n\n**Question 4/9: What's your budget range for construction?**\n\nA) ₹8-15 Lakhs (Basic quality)\nB) ₹15-25 Lakhs (Standard quality)  \nC) ₹25-40 Lakhs (Premium quality)\nD) ₹40+ Lakhs (Luxury quality)\nE) Tell me your specific budget\n\n💰 **Expert Note:** Budget includes structure, finishes, but excludes furniture & land cost.`;
            
        case 4:
            conversationState.step = 5;
            let budgetRange = extractBudgetFromMessage(message);
            conversationState.projectData.budget = budgetRange;
            
            return `💰 **Budget: ${budgetRange}** - Excellent! I can work with this budget effectively.\n\n**Question 5/9: Which city/climate are you building in?**\n\n🌍 This is crucial for:\n• Material selection\n• Ventilation planning  \n• Weather protection\n• Energy efficiency\n\nTell me your city or climate type (hot, humid, cold, moderate)`;
            
        case 5:
            conversationState.step = 6;
            conversationState.projectData.location = message;
            
            return `🏙️ **Location: ${message}** - Perfect! I'll consider climate factors.\n\n**Question 6/9: Do you want Vastu compliance in your home design?**\n\nA) Yes, strict Vastu compliance\nB) Partial Vastu (where practical)\nC) No Vastu requirements\nD) Not sure, please advise\n\n🧭 **Expert Insight:** Vastu can be balanced with modern design principles for optimal results.`;
            
        case 6:
            conversationState.step = 7;
            conversationState.projectData.vastu = message;
            
            return `🧭 **Vastu preference noted!**\n\n**Question 7/9: What are your priority rooms/areas?**\n\n🏠 **Common priorities:**\n• Large kitchen for cooking lovers\n• Spacious living room for entertaining\n• Master bedroom with attached bathroom\n• Study/work from home space\n• Dining area\n• Prayer room\n• Storage areas\n\nTell me your top 3 priorities!`;
            
        case 7:
            conversationState.step = 8;
            conversationState.projectData.priorities = message;
            
            return `🎯 **Priorities noted!** These will be the focus of my design.\n\n**Question 8/9: What style & aesthetics do you prefer for your home?**\n\nA) **Modern Minimalist** - Clean lines, neutral colors, clutter-free\nB) **Classic Traditional** - Warm wood, rich colors, ornate details\nC) **Industrial** - Exposed brick, metal fixtures, urban vibe\nD) **Bohemian** - Eclectic colors, artistic elements, cozy textures\nE) **Contemporary** - Latest trends, smart features, sleek finishes\nF) **Rustic** - Natural materials, earthy tones, country charm\n\n🎨 **Expert Tip:** Your style choice affects material selection, color schemes, and finishing details!\n\nJust type A, B, C, D, E, or F!`;
            
        case 8:
            conversationState.step = 9;
            conversationState.projectData.style = message;
            
            let selectedStyle = '';
            const lowerMessage = message.toLowerCase();
            if (lowerMessage.includes('a') || lowerMessage.includes('modern minimalist')) selectedStyle = 'Modern Minimalist';
            else if (lowerMessage.includes('b') || lowerMessage.includes('classic traditional')) selectedStyle = 'Classic Traditional';
            else if (lowerMessage.includes('c') || lowerMessage.includes('industrial')) selectedStyle = 'Industrial';
            else if (lowerMessage.includes('d') || lowerMessage.includes('bohemian')) selectedStyle = 'Bohemian';
            else if (lowerMessage.includes('e') || lowerMessage.includes('contemporary')) selectedStyle = 'Contemporary';
            else if (lowerMessage.includes('f') || lowerMessage.includes('rustic')) selectedStyle = 'Rustic';
            else selectedStyle = 'Custom Style';
            
            conversationState.projectData.selectedStyle = selectedStyle;
            
            return `🎨 **${selectedStyle}** - Excellent choice! This style will beautifully complement your home design.\n\n**Final Question 9/9: When do you plan to start construction?**\n\nA) Immediately (within 1 month)\nB) Soon (1-3 months)\nC) Planning phase (3-6 months)\nD) Future planning (6+ months)\n\n⏰ **Timeline affects:** Permit processing, material procurement, seasonal considerations.`;
            
        case 9:
            conversationState.projectData.timeline = message;
            return generateCompleteHomePlan();
            
        default:
            return resetConversation();
    }
}

function getStyleSpecificRecommendations(style) {
    const styleGuides = {
        'Modern Minimalist': `\n• Color Palette: White, grey, black with minimal accent colors\n• Materials: Glass, steel, concrete, smooth finishes\n• Furniture: Clean lines, built-in storage, minimal décor\n• Lighting: Recessed LED lights, pendant lighting\n• Flooring: Polished concrete, large tiles, or hardwood`,
        
        'Classic Traditional': `\n• Color Palette: Warm browns, deep reds, gold, cream tones\n• Materials: Natural wood, brass fittings, marble accents\n• Furniture: Ornate details, wooden furniture, rich fabrics\n• Lighting: Chandeliers, table lamps, warm lighting\n• Flooring: Hardwood, traditional tiles, area rugs`,
        
        'Industrial': `\n• Color Palette: Greys, blacks, raw metal tones, brick red\n• Materials: Exposed brick, metal beams, concrete, steel\n• Furniture: Metal fixtures, leather seating, functional design\n• Lighting: Track lighting, Edison bulbs, metal fixtures\n• Flooring: Polished concrete, metal gratings, industrial tiles`,
        
        'Bohemian': `\n• Color Palette: Rich jewel tones, earth colors, vibrant patterns\n• Materials: Natural textiles, woven fabrics, mixed materials\n• Furniture: Low seating, floor cushions, eclectic mix\n• Lighting: String lights, colorful lampshades, natural light\n• Flooring: Natural wood, colorful rugs, textured tiles`,
        
        'Contemporary': `\n• Color Palette: Neutral base with bold accent colors\n• Materials: Mixed materials, smart home integration\n• Furniture: Sleek designs, multi-functional pieces\n• Lighting: Smart lighting systems, modern fixtures\n• Flooring: Luxury vinyl, modern tiles, smart surfaces`,
        
        'Rustic': `\n• Color Palette: Earth tones, natural browns, forest greens\n• Materials: Natural wood, stone, wrought iron\n• Furniture: Handcrafted pieces, natural textures\n• Lighting: Warm ambient lighting, lantern-style fixtures\n• Flooring: Natural wood, stone tiles, rustic finishes`
    };
    
    return styleGuides[style] || '\n• Custom style elements will be designed based on your preferences\n• Natural materials and neutral colors recommended\n• Functional and aesthetic balance maintained';
}

function generateCompleteHomePlan() {
    const data = conversationState.projectData;
    const houseInfo = homeDesignExpertise.houseSizes[data.houseType] || {};
    
    resetConversation();
    
    return `🏠 **COMPLETE HOME PLANNING REPORT** 🏗️\n\n**═══════════════════════════════════**\n\n📋 **PROJECT SUMMARY:**\n• House Type: ${data.houseType}\n• Area: ${data.area} sqft\n• Family: ${data.familySize} members\n• Budget: ${data.budget}\n• Location: ${data.location}\n• Design Style: ${data.selectedStyle || 'Not specified'}\n• Timeline: ${data.timeline}\n\n🎯 **EXPERT RECOMMENDATIONS:**\n\n**🏗️ STRUCTURAL PLANNING:**\n• Foundation: RCC with waterproofing\n• Walls: 6" for external, 4" for internal  \n• Roof: RCC slab with insulation\n• Ventilation: Cross-ventilation in all rooms\n\n**📐 ROOM LAYOUT SUGGESTIONS:**\n• Living Room: 14x16 ft (focal point)\n• Master Bedroom: 12x14 ft (SW corner)\n• Kitchen: 10x12 ft (SE corner) \n• Bathrooms: 6x8 ft (proper ventilation)\n\n**🎨 STYLE-SPECIFIC DESIGN FEATURES:**${getStyleSpecificRecommendations(data.selectedStyle)}\n\n**💰 DETAILED BUDGET BREAKDOWN:**\n• Structure (40%): ₹${Math.round(parseFloat(data.budget.split('-')[0]) * 0.4)} Lakhs\n• Plumbing (10%): ₹${Math.round(parseFloat(data.budget.split('-')[0]) * 0.1)} Lakhs\n• Electrical (10%): ₹${Math.round(parseFloat(data.budget.split('-')[0]) * 0.1)} Lakhs\n• Flooring (15%): ₹${Math.round(parseFloat(data.budget.split('-')[0]) * 0.15)} Lakhs\n• Finishing (25%): ₹${Math.round(parseFloat(data.budget.split('-')[0]) * 0.25)} Lakhs\n\n**⏰ CONSTRUCTION TIMELINE:**\n• Total Duration: 8-10 months\n• Structure: 4 months\n• Finishing: 4 months\n• Final touches: 2 months\n\n**🎨 GENERAL DESIGN FEATURES:**\n• Natural lighting in all rooms\n• Efficient storage solutions\n• Energy-efficient design\n• Climate-appropriate materials\n\n**👥 RECOMMENDED PROFESSIONALS:**\n\nWould you like me to recommend specific architects, contractors, or other professionals for your project?\n\nOr would you like detailed advice on any specific aspect of this plan?`;
}

function startBudgetConsultationFlow() {
    conversationState.currentFlow = 'budgetConsultation';
    conversationState.step = 1;
    conversationState.userResponses = {};
    
    return `💰 **Professional Budget Consultation** 📊\n\nAs your expert cost consultant, I'll create an accurate budget estimate. Let me ask the right questions:\n\n**Question 1/5: What type of project are you budgeting for?**\n\nA) New construction (ground up)\nB) Complete home renovation\nC) Partial renovation (specific rooms)\nD) Interior design only\nE) Specific work (kitchen, bathroom, etc.)\n\nPlease select A, B, C, D, or E!`;
}

function continueBudgetConsultationFlow(message, step) {
    const lowerMessage = message.toLowerCase();
    
    switch (step) {
        case 1:
            conversationState.step = 2;
            let projectType = '';
            if (lowerMessage.includes('a') || lowerMessage.includes('new')) projectType = 'New Construction';
            else if (lowerMessage.includes('b') || lowerMessage.includes('complete')) projectType = 'Complete Renovation';
            else if (lowerMessage.includes('c') || lowerMessage.includes('partial')) projectType = 'Partial Renovation';
            else if (lowerMessage.includes('d') || lowerMessage.includes('interior')) projectType = 'Interior Design';
            else if (lowerMessage.includes('e') || lowerMessage.includes('specific')) projectType = 'Specific Work';
            
            conversationState.projectData.projectType = projectType;
            
            return `✅ **${projectType}** - Perfect!\n\n**Question 2/5: What's the total area in square feet?**\n\n📏 **Be specific for accurate estimates:**\n• Total carpet area for new construction\n• Renovation area for existing homes\n• Room area for specific work\n\nExample: "1200 sqft" or "10x12 kitchen"`;
            
        case 2:
            conversationState.step = 3;
            conversationState.projectData.area = extractAreaFromMessage(message);
            
            return `📐 **${conversationState.projectData.area} sqft** - Got it!\n\n**Question 3/5: What quality level are you targeting?**\n\nA) **Basic** (₹1,200/sqft) - Standard materials, simple finishes\nB) **Standard** (₹1,800/sqft) - Good quality, decent finishes  \nC) **Premium** (₹2,500/sqft) - High quality, premium finishes\nD) **Luxury** (₹3,500/sqft) - Top materials, designer finishes\n\n💡 **Expert Tip:** Quality affects durability and long-term costs!`;
            
        case 3:
            conversationState.step = 4;
            let qualityLevel = '';
            let costPerSqft = 0;
            
            if (lowerMessage.includes('a') || lowerMessage.includes('basic')) {
                qualityLevel = 'Basic';
                costPerSqft = 1200;
            } else if (lowerMessage.includes('b') || lowerMessage.includes('standard')) {
                qualityLevel = 'Standard';
                costPerSqft = 1800;
            } else if (lowerMessage.includes('c') || lowerMessage.includes('premium')) {
                qualityLevel = 'Premium';
                costPerSqft = 2500;
            } else if (lowerMessage.includes('d') || lowerMessage.includes('luxury')) {
                qualityLevel = 'Luxury';
                costPerSqft = 3500;
            }
            
            conversationState.projectData.quality = qualityLevel;
            conversationState.projectData.costPerSqft = costPerSqft;
            
            return `⭐ **${qualityLevel} Quality** - Excellent choice!\n\n**Question 4/5: Any special requirements?**\n\n🔧 **Common additions:**\n• Modular kitchen\n• Designer bathrooms\n• Wooden flooring\n• False ceiling\n• Landscaping\n• Smart home features\n• Swimming pool\n• Solar panels\n\nTell me what special features you want, or type "none" for standard work.`;
            
        case 4:
            conversationState.step = 5;
            conversationState.projectData.specialRequirements = message;
            
            return `🎯 **Special requirements noted!**\n\n**Final Question 5/5: What's your preferred timeline?**\n\nA) Fast track (20% extra cost)\nB) Normal timeline\nC) Flexible timeline (cost savings possible)\nD) Seasonal timing (monsoon considerations)\n\n⏰ **Timeline affects:** Material costs, labor availability, weather factors.`;
            
        case 5:
            conversationState.projectData.timeline = message;
            return generateDetailedBudgetEstimate();
            
        default:
            return resetConversation();
    }
}

function generateDetailedBudgetEstimate() {
    const data = conversationState.projectData;
    const area = parseFloat(data.area);
    const baseRate = data.costPerSqft;
    const baseCost = area * baseRate;
    
    // Calculate various components
    const structure = baseCost * 0.40;
    const plumbing = baseCost * 0.10;
    const electrical = baseCost * 0.10;
    const flooring = baseCost * 0.15;
    const painting = baseCost * 0.08;
    const fixtures = baseCost * 0.12;
    const finishing = baseCost * 0.05;
    
    // Add special requirements cost (estimate 10-20% extra)
    const specialCost = data.specialRequirements && data.specialRequirements !== 'none' ? baseCost * 0.15 : 0;
    
    const totalCost = baseCost + specialCost;
    const contingency = totalCost * 0.10; // 10% contingency
    const finalCost = totalCost + contingency;
    
    resetConversation();
    
    return `💰 **DETAILED BUDGET ESTIMATE REPORT** 📊\n\n**═══════════════════════════════════**\n\n📋 **PROJECT DETAILS:**\n• Type: ${data.projectType}\n• Area: ${data.area} sqft\n• Quality: ${data.quality}\n• Rate: ₹${baseRate}/sqft\n\n💸 **DETAILED COST BREAKDOWN:**\n\n**🏗️ STRUCTURAL WORK (40%)**\n• Foundation & Structure: ₹${Math.round(structure/100000*100)/100} Lakhs\n\n**🔧 MEP WORK (20%)**\n• Plumbing & Sanitary: ₹${Math.round(plumbing/100000*100)/100} Lakhs\n• Electrical & Lighting: ₹${Math.round(electrical/100000*100)/100} Lakhs\n\n**🎨 FINISHING WORK (40%)**\n• Flooring & Tiles: ₹${Math.round(flooring/100000*100)/100} Lakhs\n• Painting & Polish: ₹${Math.round(painting/100000*100)/100} Lakhs\n• Doors & Fixtures: ₹${Math.round(fixtures/100000*100)/100} Lakhs\n• Final Finishing: ₹${Math.round(finishing/100000*100)/100} Lakhs\n\n**✨ SPECIAL FEATURES:**\n• Additional Work: ₹${Math.round(specialCost/100000*100)/100} Lakhs\n\n**📊 SUMMARY:**\n• Base Cost: ₹${Math.round(baseCost/100000*100)/100} Lakhs\n• Special Features: ₹${Math.round(specialCost/100000*100)/100} Lakhs\n• Contingency (10%): ₹${Math.round(contingency/100000*100)/100} Lakhs\n\n**🎯 TOTAL PROJECT COST: ₹${Math.round(finalCost/100000*100)/100} LAKHS**\n\n**⏰ PAYMENT SCHEDULE:**\n• Advance: 20% (₹${Math.round(finalCost*0.2/100000*100)/100} Lakhs)\n• Structure: 40% (₹${Math.round(finalCost*0.4/100000*100)/100} Lakhs)\n• Finishing: 35% (₹${Math.round(finalCost*0.35/100000*100)/100} Lakhs)\n• Final: 5% (₹${Math.round(finalCost*0.05/100000*100)/100} Lakhs)\n\n**💡 EXPERT COST-SAVING TIPS:**\n• Buy materials in bulk for 10-15% savings\n• Plan work during off-season for labor savings\n• Focus budget on structural quality\n• Consider phased execution to spread costs\n\n**🏗️ TIMELINE ESTIMATE:**\n• ${data.projectType}: 6-10 months\n• Monthly spend: ₹${Math.round(finalCost/8/100000*100)/100} Lakhs average\n\nWould you like me to recommend professionals who can execute this project within your budget?`;
}

function startKitchenDesignFlow() {
    conversationState.currentFlow = 'kitchenDesign';
    conversationState.step = 1;
    conversationState.userResponses = {};
    
    return `🍳 **Expert Kitchen Design Consultation** 👨‍🍳\n\nAs your specialized kitchen designer, I'll create the perfect cooking space for you!\n\n**Question 1/6: What's your kitchen area/size?**\n\n📏 **Common kitchen sizes:**\n• Small: 6x8 feet (48 sqft)\n• Medium: 8x10 feet (80 sqft)\n• Large: 10x12 feet (120 sqft)\n• Extra Large: 12x14+ feet (168+ sqft)\n\nTell me your kitchen dimensions (e.g., "8x10 feet" or "80 sqft")`;
}

function continueKitchenDesignFlow(message, step) {
    switch (step) {
        case 1:
            conversationState.step = 2;
            conversationState.projectData.kitchenSize = message;
            
            return `📐 **Kitchen size: ${message}** - Perfect!\n\n**Question 2/6: What's your cooking style?**\n\nA) **Heavy cooking** - Full Indian meals, multiple dishes\nB) **Moderate cooking** - Regular home cooking\nC) **Light cooking** - Basic meals, minimal frying\nD) **Occasional cooking** - Mostly reheating, simple dishes\n\n👨‍🍳 **This determines:** Storage needs, ventilation, countertop space, appliance requirements.`;
            
        case 2:
            conversationState.step = 3;
            conversationState.projectData.cookingStyle = message;
            
            return `👨‍🍳 **Cooking style noted!**\n\n**Question 3/6: How many people regularly cook in your kitchen?**\n\nA) Single person cooking\nB) 2 people (couple cooking together)\nC) Multiple family members\nD) Professional cook/helper\n\n🏃‍♀️ **This affects:** Work triangle, counter space, storage accessibility, traffic flow.`;
            
        case 3:
            conversationState.step = 4;
            conversationState.projectData.cookingPeople = message;
            
            return `👥 **Kitchen users noted!**\n\n**Question 4/6: What kitchen layout do you prefer?**\n\nA) **L-Shaped** - Corner utilization, good for medium kitchens\nB) **Straight/Gallery** - Single wall, space-efficient\nC) **U-Shaped** - Maximum storage, large kitchens\nD) **Island Kitchen** - Central workspace, spacious kitchens\nE) **Parallel/Galley** - Two opposite walls\n\n📐 **Expert tip:** Layout depends on your space and workflow!`;
            
        case 4:
            conversationState.step = 5;
            conversationState.projectData.kitchenLayout = message;
            
            return `🏗️ **Layout preference saved!**\n\n**Question 5/6: What's your kitchen budget range?**\n\nA) ₹1-2 Lakhs (Basic modular)\nB) ₹2-4 Lakhs (Standard quality)\nC) ₹4-6 Lakhs (Premium finish)\nD) ₹6-10 Lakhs (Luxury kitchen)\nE) ₹10+ Lakhs (Ultra-premium)\n\n💰 **Includes:** Cabinets, countertop, appliances, plumbing, electrical work.`;
            
        case 5:
            conversationState.step = 6;
            conversationState.projectData.kitchenBudget = message;
            
            return `💰 **Budget range confirmed!**\n\n**Final Question 6/6: Any special requirements?**\n\n🔧 **Popular additions:**\n• Breakfast counter/dining area\n• Built-in appliances (OTG, microwave)\n• Modular storage solutions\n• Granite/quartz countertops\n• Under-cabinet lighting\n• Chimney and ventilation\n• Water purifier space\n• Dishwasher area\n\nTell me your special needs, or type "standard" for basic requirements.`;
            
        case 6:
            conversationState.projectData.specialKitchenNeeds = message;
            return generateKitchenDesignPlan();
            
        default:
            return resetConversation();
    }
}

function generateKitchenDesignPlan() {
    const data = conversationState.projectData;
    resetConversation();
    
    return `🍳 **COMPLETE KITCHEN DESIGN PLAN** 🏗️\n\n**═══════════════════════════════════**\n\n📋 **YOUR KITCHEN PROFILE:**\n• Size: ${data.kitchenSize}\n• Cooking Style: ${data.cookingStyle}\n• Users: ${data.cookingPeople}\n• Layout: ${data.kitchenLayout}\n• Budget: ${data.kitchenBudget}\n\n🎯 **EXPERT DESIGN RECOMMENDATIONS:**\n\n**📐 OPTIMAL WORK TRIANGLE:**\n• Sink ↔ Stove: 4-6 feet\n• Stove ↔ Fridge: 4-7 feet\n• Fridge ↔ Sink: 4-9 feet\n• Total triangle: 12-23 feet\n\n**🏗️ LAYOUT SPECIFICATIONS:**\n• Counter height: 32-34 inches\n• Counter depth: 24 inches\n• Upper cabinet height: 12-15 inches\n• Counter to upper cabinet: 18 inches\n\n**🎨 DESIGN FEATURES:**\n• **Countertop:** Granite/Quartz for durability\n• **Backsplash:** Tiles for easy cleaning\n• **Storage:** Pull-out drawers, corner solutions\n• **Lighting:** Under-cabinet LED + ceiling lights\n• **Ventilation:** 90cm chimney for Indian cooking\n\n**⚡ ELECTRICAL PLANNING:**\n• 15A point for chimney\n• 5A points for appliances (4-5 nos.)\n• Microwave dedicated point\n• Under-cabinet lighting points\n• GFCI protection for wet areas\n\n**🔧 PLUMBING LAYOUT:**\n• Hot & cold water lines to sink\n• Waste water connection\n• Water purifier provision\n• Dishwasher connection (if planned)\n\n**📦 STORAGE SOLUTIONS:**\n• Base cabinets: Pots, heavy items\n• Upper cabinets: Daily use items\n• Tall units: Groceries, appliances\n• Corner units: Maximum space utilization\n\n**🏷️ MATERIAL RECOMMENDATIONS:**\n• **Cabinets:** BWR plywood/MDF\n• **Shutters:** Laminate/Acrylic finish\n• **Hardware:** Soft-close hinges & slides\n• **Countertop:** 20mm granite/quartz\n\n**💰 BUDGET BREAKDOWN:**\n• Cabinets (60%): ₹${Math.round(parseFloat(data.kitchenBudget.split('-')[0]) * 0.6)} Lakhs\n• Appliances (25%): ₹${Math.round(parseFloat(data.kitchenBudget.split('-')[0]) * 0.25)} Lakhs\n• Labor & Misc (15%): ₹${Math.round(parseFloat(data.kitchenBudget.split('-')[0]) * 0.15)} Lakhs\n\n**⏰ EXECUTION TIMELINE:**\n• Design & approval: 1 week\n• Manufacturing: 3-4 weeks\n• Installation: 1 week\n• Total duration: 5-6 weeks\n\n**👥 RECOMMENDED PROFESSIONALS:**\n\nWould you like me to recommend specific kitchen designers and carpenters who can execute this plan within your budget?\n\nOr need more details on any specific aspect?`;
}

function extractAreaFromMessage(message) {
    const numbers = message.match(/\d+/g);
    if (numbers && numbers.length >= 1) {
        if (numbers.length >= 2) {
            return `${numbers[0]}x${numbers[1]} feet (${numbers[0] * numbers[1]} sqft)`;
        } else {
            return `${numbers[0]} sqft`;
        }
    }
    return message;
}

function extractNumberFromMessage(message) {
    const numbers = message.match(/\d+/);
    return numbers ? numbers[0] : message;
}

function extractBudgetFromMessage(message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('a') || lowerMessage.includes('8-15')) return '8-15 Lakhs';
    if (lowerMessage.includes('b') || lowerMessage.includes('15-25')) return '15-25 Lakhs';
    if (lowerMessage.includes('c') || lowerMessage.includes('25-40')) return '25-40 Lakhs';
    if (lowerMessage.includes('d') || lowerMessage.includes('40+')) return '40+ Lakhs';
    return message;
}

function resetConversation() {
    conversationState.currentFlow = null;
    conversationState.step = 0;
    conversationState.userResponses = {};
    conversationState.projectData = {};
    
    return "🏠 **Consultation completed!** Thank you for the detailed discussion.\n\nFeel free to start a new consultation anytime. I'm here to help with:\n\n• Complete home planning\n• Room-specific design\n• Budget estimation\n• Construction advice\n• Professional recommendations\n\nWhat would you like to discuss next?";
}

function startCarpenterConsultationFlow() {
    conversationState.currentFlow = 'carpenterConsultation';
    conversationState.step = 1;
    conversationState.userResponses = {};
    
    return `🔨 **Virtual Carpenter Consultation** 🪵\n\nAs your expert carpenter, I'll understand your exact needs and recommend the perfect solution!\n\n**Question 1/5: What type of carpentry work do you need?**\n\nA) **Cupboard/Wardrobe** - Bedroom storage\nB) **Kitchen Cabinets** - Modular kitchen work\nC) **Custom Furniture** - Tables, chairs, beds\nD) **Storage Solutions** - Shelves, drawers\nE) **Wooden Flooring** - Hardwood, laminate\nF) **Doors & Windows** - Wooden installations\nG) **Other** - Tell me your specific need\n\nWhich option matches your requirement?`;
}

function continueCarpenterConsultationFlow(message, step) {
    const lowerMessage = message.toLowerCase();
    
    switch (step) {
        case 1:
            conversationState.step = 2;
            let workType = '';
            if (lowerMessage.includes('a') || lowerMessage.includes('cupboard') || lowerMessage.includes('wardrobe')) {
                workType = 'Cupboard/Wardrobe';
            } else if (lowerMessage.includes('b') || lowerMessage.includes('kitchen')) {
                workType = 'Kitchen Cabinets';
            } else if (lowerMessage.includes('c') || lowerMessage.includes('furniture')) {
                workType = 'Custom Furniture';
            } else if (lowerMessage.includes('d') || lowerMessage.includes('storage')) {
                workType = 'Storage Solutions';
            } else if (lowerMessage.includes('e') || lowerMessage.includes('flooring')) {
                workType = 'Wooden Flooring';
            } else if (lowerMessage.includes('f') || lowerMessage.includes('doors') || lowerMessage.includes('windows')) {
                workType = 'Doors & Windows';
            } else {
                workType = 'Custom Work';
            }
            
            conversationState.projectData.workType = workType;
            
            return `🔨 **${workType}** - Great choice!\n\n**Question 2/5: What are the dimensions/size requirements?**\n\n📏 **Be specific for accurate costing:**\n• Length x Width x Height\n• Room size (for flooring)\n• Number of pieces needed\n\nExample: "6 feet wardrobe", "8x10 kitchen", "4 chairs + 1 table"`;
            
        case 2:
            conversationState.step = 3;
            conversationState.projectData.dimensions = message;
            
            return `📐 **Size: ${message}** - Perfect!\n\n**Question 3/5: What type of wood/material do you prefer?**\n\nA) **Teak Wood** - Premium, durable, ₹800-1200/sqft\nB) **Sheesham** - Good quality, ₹400-600/sqft\nC) **Pine Wood** - Economical, ₹300-500/sqft\nD) **Plywood + Veneer** - Modern, ₹200-400/sqft\nE) **MDF + Laminate** - Budget-friendly, ₹150-300/sqft\nF) **Let carpenter suggest** - Based on budget & use\n\n🌳 **Expert tip:** Wood choice affects durability, appearance, and cost!`;
            
        case 3:
            conversationState.step = 4;
            conversationState.projectData.material = message;
            
            return `🌳 **Material preference noted!**\n\n**Question 4/5: What's your budget range?**\n\nA) ₹10,000 - 25,000 (Basic work)\nB) ₹25,000 - 50,000 (Standard quality)\nC) ₹50,000 - 1,00,000 (Premium work)\nD) ₹1,00,000+ (Luxury/Custom)\nE) Tell me your specific budget\n\n💰 **Budget includes:** Material, labor, hardware, and finishing.`;
            
        case 4:
            conversationState.step = 5;
            conversationState.projectData.budget = message;
            
            return `💰 **Budget confirmed!**\n\n**Final Question 5/5: When do you need this completed?**\n\nA) **Urgent** - Within 1 week (rush charges apply)\nB) **Soon** - 1-2 weeks\nC) **Standard** - 2-4 weeks\nD) **Flexible** - 1-2 months (better pricing)\n\n⏰ **Timeline affects:** Material procurement, workshop scheduling, installation planning.`;
            
        case 5:
            conversationState.projectData.timeline = message;
            return generateCarpenterRecommendation();
            
        default:
            return resetConversation();
    }
}

function generateCarpenterRecommendation() {
    const data = conversationState.projectData;
    
    // Find matching carpenters based on work type and budget
    let matchingCarpenters = professionalDatabase.carpenters.filter(carpenter => {
        const workTypeMatch = carpenter.expertise.some(exp => 
            exp.toLowerCase().includes(data.workType.toLowerCase().split('/')[0]) ||
            data.workType.toLowerCase().includes(exp.toLowerCase())
        );
        return workTypeMatch;
    });
    
    resetConversation();
    
    let recommendation = `🔨 **CARPENTER CONSULTATION REPORT** 🪵\n\n**═══════════════════════════════════**\n\n📋 **YOUR REQUIREMENTS:**\n• Work Type: ${data.workType}\n• Dimensions: ${data.dimensions}\n• Material: ${data.material}\n• Budget: ${data.budget}\n• Timeline: ${data.timeline}\n\n🎯 **EXPERT RECOMMENDATIONS:**\n\n**🏗️ WORK SPECIFICATIONS:**\n• Material thickness: 18-20mm for main structure\n• Hardware: Soft-close hinges and slides recommended\n• Finish: Polish + protective coating\n• Installation: Professional mounting required\n\n**💰 COST BREAKDOWN:**\n• Material (60%): ${Math.round(parseFloat(data.budget.split('-')[0].replace(/[₹,]/g, '')) * 0.6).toLocaleString()}\n• Labor (30%): ${Math.round(parseFloat(data.budget.split('-')[0].replace(/[₹,]/g, '')) * 0.3).toLocaleString()}\n• Hardware (10%): ${Math.round(parseFloat(data.budget.split('-')[0].replace(/[₹,]/g, '')) * 0.1).toLocaleString()}\n\n**⏰ EXECUTION TIMELINE:**\n• Design approval: 1-2 days\n• Material procurement: 3-5 days\n• Workshop work: 1-2 weeks\n• Installation: 1-2 days\n\n**👨‍🔧 PERFECT CARPENTER MATCHES:**\n\n`;
    
    matchingCarpenters.slice(0, 2).forEach((carpenter, index) => {
        recommendation += `**${index + 1}. ${carpenter.name}** ${carpenter.verified ? '✅' : ''}\n`;
        recommendation += `📍 ${carpenter.location} (${carpenter.distance})\n`;
        recommendation += `⭐ ${carpenter.rating}/5 (${carpenter.reviews} reviews)\n`;
        recommendation += `🔨 ${carpenter.experience} experience\n`;
        recommendation += `🎯 Expert in: ${carpenter.expertise.join(', ')}\n`;
        recommendation += `💰 Budget range: ₹${carpenter.budget}\n`;
        recommendation += `📞 Contact: ${carpenter.phone}\n`;
        recommendation += `📧 Email: ${carpenter.email}\n\n`;
    });
    
    recommendation += `💡 **EXPERT TIPS:**\n• Always see previous work samples\n• Confirm material quality before starting\n• Get detailed written quotation\n• Plan for 10% extra budget for contingencies\n• Ensure proper ventilation during work\n\n**🎯 NEXT STEPS:**\n1. Contact recommended carpenters\n2. Share your requirements\n3. Get detailed quotes\n4. Check references and past work\n5. Finalize timeline and start work\n\nWould you like more specific advice on materials or design details?`;
    
    return recommendation;
}

function startArchitectConsultationFlow() {
    conversationState.currentFlow = 'architectConsultation';
    conversationState.step = 1;
    conversationState.userResponses = {};
    
    return `🏗️ **Virtual Architect Consultation** 📐\n\nAs your expert architect, I'll understand your vision and create the perfect design solution!\n\n**Question 1/6: What type of architectural service do you need?**\n\nA) **Complete house design** - Full architectural planning\nB) **House renovation** - Modify existing structure\nC) **Interior layout** - Space planning and design\nD) **Specific room design** - Kitchen, bedroom, etc.\nE) **2D/3D drawings** - Plans and visualization\nF) **Construction supervision** - Site monitoring\nG) **Consultation only** - Expert advice\n\nWhich service matches your need?`;
}

function continueArchitectConsultationFlow(message, step) {
    // Similar implementation for architect consultation
    // ... (implementation would follow same pattern)
    return "Architect consultation flow - implementation in progress...";
}

function handleLocationQuery(message) {
    let location = '';
    let profession = '';
    
    // Extract location
    const locationWords = ['mumbai', 'pune', 'bangalore', 'delhi', 'hyderabad', 'chennai'];
    for (const loc of locationWords) {
        if (message.includes(loc)) {
            location = loc.charAt(0).toUpperCase() + loc.slice(1);
            break;
        }
    }
    
    // Extract profession
    if (message.includes('architect')) profession = 'architects';
    else if (message.includes('carpenter')) profession = 'carpenters';
    else if (message.includes('plumber')) profession = 'plumbers';
    else if (message.includes('painter')) profession = 'painters';
    else if (message.includes('electrician')) profession = 'electricians';
    
    if (location && profession) {
        const professionals = searchProfessionalsByLocation(profession, location);
        return formatProfessionalRecommendations(professionals, `${profession} in ${location}`);
    }
    
    return "I can help you find professionals in Mumbai, Pune, Bangalore, Delhi, and other major cities. Please specify both the location and type of professional you're looking for!";
}

function formatProfessionalRecommendations(professionals, title) {
    if (professionals.length === 0) {
        return `I couldn't find any ${title} in your specified criteria. Let me show you our best professionals who might be able to help you:\n\n${formatProfessionalRecommendations(getAllTopProfessionals(), "top-rated professionals")}`;
    }
    
    let response = `🔍 **EXPERT RECOMMENDATIONS: ${title.toUpperCase()}**\n\n`;
    
    professionals.slice(0, 2).forEach((prof, index) => {
        response += `**${index + 1}. ${prof.name}** ${prof.verified ? '✅' : ''}\n`;
        response += `📍 ${prof.location} (${prof.distance})\n`;
        response += `⭐ ${prof.rating}/5 (${prof.reviews} reviews)\n`;
        response += `💼 ${prof.experience} experience\n`;
        response += `🎯 Specializes in: ${prof.specializations.slice(0, 2).join(', ')}\n`;
        response += `🔧 Expert in: ${prof.expertise.slice(0, 3).join(', ')}\n`;
        response += `💰 Budget: ₹${prof.budget}\n`;
        response += `📞 ${prof.phone}\n`;
        response += `📧 ${prof.email}\n\n`;
    });
    
    if (professionals.length > 2) {
        response += `*And ${professionals.length - 2} more qualified professionals available!*\n\n`;
    }
    
    response += `💡 **NEXT STEPS:**\n`;
    response += `1. Contact them with your specific requirements\n`;
    response += `2. Ask for detailed quotations\n`;
    response += `3. Check their previous work portfolio\n`;
    response += `4. Compare proposals and select best fit\n\n`;
    response += `**Need help with requirements?** Ask me "How to brief a ${title.split(' ')[0]}" for expert tips!`;
    
    return response;
}

function handleCarpenterQuery(message) {
    let carpenters = professionalDatabase.carpenters;
    
    if (message.includes('cupboard') || message.includes('wardrobe')) {
        carpenters = carpenters.filter(c => 
            c.expertise.some(exp => exp.toLowerCase().includes('cupboard') || exp.toLowerCase().includes('wardrobe'))
        );
        return formatProfessionalList(carpenters, "carpenters specializing in cupboards and wardrobes");
    }
    
    if (message.includes('kitchen')) {
        carpenters = carpenters.filter(c => 
            c.expertise.some(exp => exp.toLowerCase().includes('kitchen'))
        );
        return formatProfessionalList(carpenters, "carpenters specializing in kitchen work");
    }
    
    if (message.includes('furniture')) {
        carpenters = carpenters.filter(c => 
            c.expertise.some(exp => exp.toLowerCase().includes('furniture'))
        );
        return formatProfessionalList(carpenters, "carpenters specializing in furniture");
    }
    
    return formatProfessionalList(carpenters, "carpenters");
}

function handleArchitectQuery(message) {
    let architects = professionalDatabase.architects;
    
    if (message.includes('luxury') || message.includes('villa')) {
        architects = architects.filter(a => 
            a.specializations.some(spec => spec.toLowerCase().includes('luxury') || spec.toLowerCase().includes('villa'))
        );
        return formatProfessionalList(architects, "architects specializing in luxury homes and villas");
    }
    
    if (message.includes('sustainable') || message.includes('eco') || message.includes('green')) {
        architects = architects.filter(a => 
            a.specializations.some(spec => spec.toLowerCase().includes('sustainable') || spec.toLowerCase().includes('eco'))
        );
        return formatProfessionalList(architects, "architects specializing in sustainable design");
    }
    
    return formatProfessionalList(architects, "architects");
}

function handlePlumberQuery(message) {
    let plumbers = professionalDatabase.plumbers;
    
    if (message.includes('bathroom')) {
        plumbers = plumbers.filter(p => 
            p.expertise.some(exp => exp.toLowerCase().includes('bathroom'))
        );
        return formatProfessionalList(plumbers, "plumbers specializing in bathroom work");
    }
    
    if (message.includes('kitchen')) {
        plumbers = plumbers.filter(p => 
            p.expertise.some(exp => exp.toLowerCase().includes('kitchen'))
        );
        return formatProfessionalList(plumbers, "plumbers specializing in kitchen plumbing");
    }
    
    if (message.includes('luxury') || message.includes('smart')) {
        plumbers = plumbers.filter(p => 
            p.specializations.some(spec => spec.toLowerCase().includes('luxury') || spec.toLowerCase().includes('smart'))
        );
        return formatProfessionalList(plumbers, "plumbers specializing in luxury and smart plumbing");
    }
    
    return formatProfessionalList(plumbers, "plumbers");
}

function handlePainterQuery(message) {
    let painters = professionalDatabase.painters;
    
    if (message.includes('interior')) {
        painters = painters.filter(p => 
            p.specializations.some(spec => spec.toLowerCase().includes('interior'))
        );
        return formatProfessionalList(painters, "painters specializing in interior work");
    }
    
    if (message.includes('exterior')) {
        painters = painters.filter(p => 
            p.specializations.some(spec => spec.toLowerCase().includes('exterior'))
        );
        return formatProfessionalList(painters, "painters specializing in exterior work");
    }
    
    if (message.includes('artistic') || message.includes('decorative')) {
        painters = painters.filter(p => 
            p.specializations.some(spec => spec.toLowerCase().includes('artistic') || spec.toLowerCase().includes('decorative'))
        );
        return formatProfessionalList(painters, "painters specializing in artistic and decorative work");
    }
    
    return formatProfessionalList(painters, "painters");
}

function handleElectricianQuery(message) {
    let electricians = professionalDatabase.electricians;
    
    if (message.includes('smart') || message.includes('automation')) {
        electricians = electricians.filter(e => 
            e.specializations.some(spec => spec.toLowerCase().includes('smart') || spec.toLowerCase().includes('automation'))
        );
        return formatProfessionalList(electricians, "electricians specializing in smart home systems");
    }
    
    return formatProfessionalList(electricians, "electricians");
}

function handleBudgetQuery(message) {
    return `💰 **Budget Planning Guide:**

**Architects:**
• Basic Design: ₹50k - ₹150k
• Premium Design: ₹150k - ₹300k
• Luxury Projects: ₹300k - ₹600k

**Carpenters:**
• Basic Furniture: ₹15k - ₹50k
• Custom Work: ₹20k - ₹80k
• Luxury Furniture: ₹40k - ₹120k

**Plumbers:**
• Basic Work: ₹3k - ₹15k
• Standard Fitting: ₹5k - ₹25k
• Luxury Installation: ₹15k - ₹60k

**Painters:**
• Standard Painting: ₹5k - ₹20k
• Quality Work: ₹8k - ₹30k
• Artistic/Decorative: ₹15k - ₹50k

**Tips:**
• Get multiple quotes
• Check reviews and past work
• Plan for 10-15% extra budget
• Consider material costs separately

Would you like specific quotes for your project?`;
}

function handleAdviceQuery(message) {
    return `🏠 **Expert Home Construction Advice:**

**Planning Phase:**
1. Define your requirements clearly
2. Set a realistic budget (add 15% buffer)
3. Get necessary approvals/permits
4. Choose professionals carefully

**Design Phase:**
1. Focus on functionality first
2. Plan for natural light and ventilation
3. Consider future needs
4. Don't compromise on structural elements

**Construction Tips:**
• Quality materials save money long-term
• Regular site visits are essential
• Document everything with photos
• Weather-proof your timelines

**Professional Selection:**
• Check credentials and past work
• Get detailed written quotes
• Verify insurance and licenses
• Ask for client references

**Common Mistakes to Avoid:**
❌ Choosing cheapest quotes without quality check
❌ Changing plans during construction
❌ Skipping quality materials for structure
❌ Not planning for storage space

What specific aspect would you like more advice on?`;
}

function searchProfessionalsByLocation(profession, location) {
    return professionalDatabase[profession].filter(professional => 
        professional.location.toLowerCase().includes(location.toLowerCase())
    );
}

function formatProfessionalList(professionals, title) {
    if (professionals.length === 0) {
        return `I couldn't find any ${title} in your specified criteria. Let me show you our best professionals who might be able to help you:\n\n${formatProfessionalList(getAllTopProfessionals(), "top-rated professionals")}`;
    }
    
    let response = `🔍 **Here are the best ${title}:**\n\n`;
    
    professionals.slice(0, 3).forEach((prof, index) => {
        response += `**${index + 1}. ${prof.name}** ${prof.verified ? '✅' : ''}\n`;
        response += `📍 ${prof.location} (${prof.distance})\n`;
        response += `⭐ ${prof.rating}/5 (${prof.reviews} reviews)\n`;
        response += `💼 ${prof.experience} experience\n`;
        response += `🎯 Specializes in: ${prof.specializations.slice(0, 2).join(', ')}\n`;
        response += `💰 Budget: ₹${prof.budget}\n`;
        response += `📞 ${prof.phone}\n\n`;
    });
    
    if (professionals.length > 3) {
        response += `And ${professionals.length - 3} more professionals available!\n\n`;
    }
    
    response += `💡 **Want to:**\n`;
    response += `• See more professionals? Ask "show more ${title}"\n`;
    response += `• Get specific help? Ask "who can help with [specific work]"\n`;
    response += `• Compare options? Ask "compare these professionals"\n`;
    
    return response;
}

function getAllTopProfessionals() {
    const allProfessionals = [
        ...professionalDatabase.architects,
        ...professionalDatabase.carpenters,
        ...professionalDatabase.plumbers,
        ...professionalDatabase.painters,
        ...professionalDatabase.electricians
    ];
    
    return allProfessionals
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
}

function showChatbot() {
    initializeChatbot();
    showScreen('ai-chatbot-screen');
}

function sendChatMessage() {
    sendMessage();
}

function handleChatInputKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Notes Functions
window.writeNotes = writeNotes;
window.saveNote = saveNote;
window.loadNotesList = loadNotesList;
window.deleteNote = deleteNote;
window.goToDesignBrief = goToDesignBrief;

// AI Chatbot Functions
window.showChatbot = showChatbot;
window.sendChatMessage = sendChatMessage;
window.handleChatInputKeyPress = handleChatInputKeyPress;