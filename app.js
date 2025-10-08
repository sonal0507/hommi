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
            specializations: ["Home Wiring", "LED Installation", "Fan Installation", "Switch Board"],
            styles: ["Residential", "Commercial"],
            budget: "10k-40k",
            phone: "+91 98765 43222",
            email: "mohan.electrician@example.com",
            verified: true,
            portfolio: ["Home Wiring", "LED Setup", "Switch Installation"],
            expertise: ["Electrical Wiring", "Lighting Systems", "Ceiling Fans", "Power Outlets", "Safety Systems"]
        },
        {
            id: 'elec_002',
            name: "Ravi Gupta",
            profession: "Electrician",
            location: "Pune, India",
            distance: "2.3 km",
            rating: 4.4,
            reviews: 15,
            experience: "7 years",
            specializations: ["Smart Home", "Security Systems", "Solar Setup", "Appliance Installation"],
            styles: ["Smart", "Modern"],
            budget: "15k-60k",
            phone: "+91 98765 43223",
            email: "ravi.electrician@example.com",
            verified: true,
            portfolio: ["Smart Home Setup", "Security System", "Solar Installation"],
            expertise: ["Smart Switches", "Home Automation", "Solar Systems", "Security Cameras", "Inverter Setup"]
        },
        {
            id: 'elec_003',
            name: "Sunil Sharma",
            profession: "Electrician",
            location: "Delhi, India",
            distance: "4.5 km",
            rating: 4.8,
            reviews: 32,
            experience: "13+ years",
            specializations: ["Industrial Wiring", "High Voltage", "Maintenance", "Emergency Services"],
            styles: ["Industrial", "Commercial", "Emergency"],
            budget: "20k-80k",
            phone: "+91 98765 43224",
            email: "sunil.electrician@example.com",
            verified: true,
            portfolio: ["Industrial Setup", "Commercial Wiring", "Emergency Repair"],
            expertise: ["Industrial Systems", "High Voltage Work", "Emergency Repairs", "Maintenance Services", "Power Distribution"]
        }
    ]
};

// Global variables for project data
let projectData = {
    step1: {},
    step2: {},
    step3: {},
    step4: {},
    homePhotos: []
};

let uploadedPhotos = [];

// Screen Navigation Function - CORE NAVIGATION SYSTEM
function showScreen(screenId) {
    console.log('Navigating to screen:', screenId);
    
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('Successfully showed screen:', screenId);
        
        // Initialize screen-specific functionality
        initializeScreen(screenId);
    } else {
        console.error('Screen not found:', screenId);
    }
}

// Initialize screen-specific functionality
function initializeScreen(screenId) {
    console.log('Initializing screen:', screenId);
    
    switch(screenId) {
        case 'dashboard':
            initializeDashboard();
            break;
        case 'chat':
            if (!chatInitialized) {
                initializeChat();
                chatInitialized = true;
            }
            break;
        case 'photo-upload':
            initializePhotoUpload();
            break;
        case 'site-survey':
            initializeSiteSurvey();
            break;
        case 'professionals-screen':
            initializeProfessionals();
            break;
        case 'architect-details':
            initializeArchitectDetails();
            break;
        case 'property-audit':
            initializePropertyAudit();
            break;
        case 'find-professionals':
            initializeFindProfessionals();
            break;
        case 'professional-details':
            initializeProfessionalDetails();
            break;
        case 'filter-architects':
            initializeFilterArchitects();
            break;
        case 'ai-assistant':
            initializeAIAssistant();
            break;
        case 'track':
            initializeTrackScreen();
            break;
        case 'shortlisted-architects':
            initializeShortlistedArchitects();
            break;
    }
}

// Initialize new screen functions
function initializePropertyAudit() {
    console.log('Property Audit screen initialized');
    // Load any saved photos or progress
    loadPropertyAuditProgress();
}

function initializeFindProfessionals() {
    console.log('Find Professionals screen initialized');
    // Load professionals data
    loadProfessionalsData();
}

function initializeProfessionalDetails() {
    console.log('Professional Details screen initialized');
    // Load professional profile data
}

function initializeFilterArchitects() {
    console.log('Filter Architects screen initialized');
    // Set up filter controls
    setupFilterControls();
}

function initializeAIAssistant() {
    console.log('AI Assistant screen initialized');
    // Load previous chat history if any
    loadChatHistory();
    // Load saved notes
    loadSavedNotes();
}

function initializeTrackScreen() {
    console.log('Track screen initialized');
    // Load project progress data
    loadProjectProgress();
}

function initializeShortlistedArchitects() {
    console.log('Shortlisted Architects screen initialized');
    // Load shortlisted architects
    loadShortlistedArchitects();
}

// Helper functions for screen initialization
function loadPropertyAuditProgress() {
    // Load any saved property audit progress
    const savedProgress = localStorage.getItem('property_audit_progress');
    if (savedProgress) {
        console.log('Loading saved property audit progress');
    }
}

function loadProfessionalsData() {
    // In a real app, this would load from an API
    console.log('Loading professionals data');
}

function setupFilterControls() {
    // Set up range slider listener
    const slider = document.querySelector('.radius-slider');
    if (slider) {
        slider.addEventListener('input', function() {
            const value = this.value;
            const valueDisplay = document.querySelector('.radius-value');
            if (valueDisplay) {
                valueDisplay.textContent = value + ' km';
            }
        });
    }
    
    // Set up style tag selection
    document.querySelectorAll('.style-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });
}

function loadChatHistory() {
    // Load previous AI chat messages if any
    const savedChat = localStorage.getItem('ai_chat_history');
    if (savedChat) {
        console.log('Loading saved chat history');
        // Would restore previous messages here
    }
}

function loadSavedNotes() {
    const savedNotes = localStorage.getItem('homii_notes');
    const notesArea = document.getElementById('notesArea');
    if (savedNotes && notesArea) {
        notesArea.value = savedNotes;
    }
}

function loadProjectProgress() {
    // Load project progress data
    console.log('Loading project progress data');
}

function loadShortlistedArchitects() {
    // Load shortlisted architects data
    console.log('Loading shortlisted architects');
}

// FORM HANDLERS - Step by step project creation
function handleStep1(event) {
    event.preventDefault();
    console.log('Processing Step 1');
    
    const homeName = document.getElementById('home-name-step1').value.trim();
    
    if (!homeName) {
        alert('Please enter a home name');
        return;
    }
    
    // Store data
    projectData.step1.homeName = homeName;
    console.log('Step 1 data saved:', projectData.step1);
    
    // Navigate to next step
    showScreen('home-details-step2');
}

function handleStep2(event) {
    event.preventDefault();
    console.log('Processing Step 2');
    
    const homeType = document.getElementById('home-type-step2').value;
    const bedrooms = document.getElementById('bedrooms-step2').value;
    const squareFeet = document.getElementById('square-feet-step2').value;
    const bathrooms = document.getElementById('bathrooms-step2').value;
    const location = document.getElementById('home-location-step2').value.trim();
    
    if (!homeType || !bedrooms || !squareFeet || !bathrooms || !location) {
        alert('Please fill in all fields');
        return;
    }
    
    // Store data
    projectData.step2 = {
        homeType,
        bedrooms,
        squareFeet,
        bathrooms,
        location
    };
    console.log('Step 2 data saved:', projectData.step2);
    
    // Navigate to next step
    showScreen('home-details-step3');
}

function handleStep3(event) {
    event.preventDefault();
    console.log('Processing Step 3');
    
    const familyEmail = document.getElementById('family-invite-step3').value.trim();
    
    // Store data (email is optional)
    projectData.step3 = {
        familyEmail: familyEmail || null
    };
    console.log('Step 3 data saved:', projectData.step3);
    
    // Navigate to next step
    showScreen('home-details-step4');
}

function handleStep4(event) {
    event.preventDefault();
    console.log('Processing Step 4 - Final Step');
    
    const budget = document.getElementById('budget-step4').value.trim();
    
    if (!budget) {
        alert('Please enter your budget');
        return;
    }
    
    // Store data
    projectData.step4 = {
        budget
    };
    console.log('Step 4 data saved:', projectData.step4);
    console.log('Complete project data:', projectData);
    
    // Project creation complete - navigate to dashboard
    showScreen('dashboard');
}

// Enhanced Login Functions
function handleGoogleLogin() {
    console.log('Google login initiated');
    // Simulate successful login
    setTimeout(() => {
        showScreen('home-setup');
    }, 1000);
}

function handleEmailLogin() {
    const email = document.getElementById('welcome-email').value.trim();
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    console.log('Email login with:', email);
    // Simulate successful login
    setTimeout(() => {
        showScreen('home-setup');
    }, 1000);
}

function showOtherOptions() {
    console.log('Showing other login options');
    // Could expand to show phone login, social logins, etc.
    alert('Additional login options coming soon!');
}

// BOQ File Upload Handler
function handleBOQUpload(input) {
    const file = input.files[0];
    const statusDiv = document.getElementById('boq-status');
    
    if (file) {
        console.log('BOQ file selected:', file.name);
        statusDiv.innerHTML = `<span style="color: green;">✓ ${file.name} uploaded successfully</span>`;
        
        // Store file reference
        projectData.step4.boqFile = {
            name: file.name,
            size: file.size,
            type: file.type
        };
    }
}

// Dashboard Initialization
function initializeDashboard() {
    console.log('Initializing dashboard');
    
    // Update dashboard with project data
    if (projectData.step1 && projectData.step1.homeName) {
        const projectNameElement = document.querySelector('.project-header h3');
        if (projectNameElement) {
            projectNameElement.textContent = projectData.step1.homeName;
        }
    }
    
    // Set current date for streak
    updateBuildStreak();
    
    // Update project stats
    updateProjectStats();
}

function updateBuildStreak() {
    const days = document.querySelectorAll('.day');
    const today = new Date().getDate();
    
    days.forEach((day, index) => {
        const dayNumber = index + today - 3; // Show 3 days before and after today
        day.querySelector('span').textContent = dayNumber > 0 ? dayNumber : '';
        
        if (index === 3) { // Middle day is today
            day.classList.add('current');
        }
    });
}

function updateProjectStats() {
    // Update days remaining (mock calculation)
    const daysElement = document.querySelector('.days');
    if (daysElement) {
        daysElement.textContent = '45';
    }
    
    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = '25%';
    }
}

// Navigation Functions
function navigateToChat() {
    console.log('Navigating to chat');
    showScreen('chat');
}

function navigateToPathway() {
    console.log('Navigating to pathway');
    showScreen('pathway');
}

function navigateToProfessionals() {
    console.log('Navigating to professionals');
    showScreen('professionals-screen');
}

function navigateToSiteSurvey() {
    console.log('Navigating to site survey');
    showScreen('site-survey');
}

function startPhotoUpload() {
    console.log('Starting photo upload');
    showScreen('photo-upload');
}

// Professional Database Functions
function initializeProfessionals() {
    console.log('Initializing professionals screen');
    displayProfessionalsGrid();
}

function displayProfessionalsGrid() {
    const professionalsContainer = document.getElementById('professionals-grid');
    if (!professionalsContainer) {
        console.log('Professionals container not found');
        return;
    }
    
    // Clear existing content
    professionalsContainer.innerHTML = '';
    
    // Combine all professionals
    const allProfessionals = [
        ...professionalDatabase.architects,
        ...professionalDatabase.carpenters,
        ...professionalDatabase.plumbers,
        ...professionalDatabase.painters,
        ...professionalDatabase.electricians
    ];
    
    allProfessionals.forEach(professional => {
        const professionalCard = createProfessionalCard(professional);
        professionalsContainer.appendChild(professionalCard);
    });
}

function createProfessionalCard(professional) {
    const card = document.createElement('div');
    card.className = 'professional-card';
    card.onclick = () => showProfessionalDetails(professional);
    
    card.innerHTML = `
        <div class="professional-header">
            <div class="professional-avatar">
                ${professional.profession === 'Architect' ? '👩‍💼' : 
                  professional.profession === 'Carpenter' ? '🔨' :
                  professional.profession === 'Plumber' ? '🔧' :
                  professional.profession === 'Painter' ? '🎨' : '⚡'}
            </div>
            <div class="professional-info">
                <h4>${professional.name}</h4>
                <p>${professional.profession}</p>
                <div class="rating">
                    <span>⭐ ${professional.rating}</span>
                    <span>(${professional.reviews} reviews)</span>
                </div>
            </div>
        </div>
        <div class="professional-details">
            <p><strong>📍 ${professional.location}</strong></p>
            <p><strong>📏 ${professional.distance}</strong></p>
            <p><strong>💼 ${professional.experience}</strong></p>
            <p><strong>💰 ${professional.budget}</strong></p>
            <div class="specializations">
                ${professional.specializations.slice(0, 2).map(spec => 
                    `<span class="spec-tag">${spec}</span>`
                ).join('')}
            </div>
        </div>
    `;
    
    return card;
}

function showProfessionalDetails(professional) {
    console.log('Showing details for:', professional.name);
    
    // Store selected professional for detail view
    window.selectedProfessional = professional;
    
    // Navigate to details screen
    if (professional.profession === 'Architect') {
        showScreen('architect-details');
    } else {
        // For other professionals, you can create similar detail screens
        showProfessionalModal(professional);
    }
}

function showProfessionalModal(professional) {
    // Create and show a modal with professional details
    const modal = document.createElement('div');
    modal.className = 'professional-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${professional.name}</h3>
                <button onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>Profession:</strong> ${professional.profession}</p>
                <p><strong>Location:</strong> ${professional.location}</p>
                <p><strong>Distance:</strong> ${professional.distance}</p>
                <p><strong>Experience:</strong> ${professional.experience}</p>
                <p><strong>Rating:</strong> ⭐ ${professional.rating} (${professional.reviews} reviews)</p>
                <p><strong>Budget Range:</strong> ${professional.budget}</p>
                <p><strong>Phone:</strong> ${professional.phone}</p>
                <p><strong>Email:</strong> ${professional.email}</p>
                
                <h4>Specializations:</h4>
                <div class="specializations">
                    ${professional.specializations.map(spec => 
                        `<span class="spec-tag">${spec}</span>`
                    ).join('')}
                </div>
                
                <h4>Portfolio:</h4>
                <ul>
                    ${professional.portfolio.map(item => `<li>${item}</li>`).join('')}
                </ul>
                
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="contactProfessional('${professional.id}')">
                        📞 Contact ${professional.name}
                    </button>
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function contactProfessional(professionalId) {
    console.log('Contacting professional:', professionalId);
    
    // Find professional by ID
    const allProfessionals = [
        ...professionalDatabase.architects,
        ...professionalDatabase.carpenters,
        ...professionalDatabase.plumbers,
        ...professionalDatabase.painters,
        ...professionalDatabase.electricians
    ];
    
    const professional = allProfessionals.find(p => p.id === professionalId);
    
    if (professional) {
        // Simulate contact action
        if (navigator.notification) {
            navigator.notification.alert(
                `Connecting you with ${professional.name}. They will contact you within 24 hours.`,
                null,
                'Contact Initiated',
                'OK'
            );
        } else {
            alert(`Connecting you with ${professional.name}. They will contact you within 24 hours.`);
        }
        
        // Close modal
        const modal = document.querySelector('.professional-modal');
        if (modal) {
            modal.remove();
        }
    }
}

// Architect Details Screen
function initializeArchitectDetails() {
    console.log('Initializing architect details');
    
    if (window.selectedProfessional) {
        const architect = window.selectedProfessional;
        
        // Update architect details on screen
        updateArchitectDetailsScreen(architect);
    }
}

function updateArchitectDetailsScreen(architect) {
    // Update architect name
    const nameElement = document.querySelector('#architect-details .architect-name');
    if (nameElement) {
        nameElement.textContent = architect.name;
    }
    
    // Update other details as needed
    console.log('Updated architect details for:', architect.name);
}

// Photo Upload Functions
function initializePhotoUpload() {
    console.log('Initializing photo upload');
    setupPhotoUploadHandlers();
}

function setupPhotoUploadHandlers() {
    // Setup drag and drop for photo upload
    const uploadArea = document.querySelector('.photo-upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handlePhotoDrop);
        uploadArea.addEventListener('click', () => {
            document.getElementById('photo-input').click();
        });
    }
    
    // Setup file input handler
    const photoInput = document.getElementById('photo-input');
    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoSelect);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}

function handlePhotoDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    handlePhotoFiles(files);
}

function handlePhotoSelect(event) {
    const files = event.target.files;
    handlePhotoFiles(files);
}

function handlePhotoFiles(files) {
    console.log('Processing photo files:', files.length);
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            processPhotoFile(file);
        }
    });
}

function processPhotoFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const photoData = {
            id: Date.now() + Math.random(),
            url: e.target.result,
            name: file.name,
            timestamp: new Date().toISOString(),
            type: 'manual_upload'
        };
        
        uploadedPhotos.push(photoData);
        updatePhotoDisplay();
        console.log('Photo processed:', photoData.name);
    };
    reader.readAsDataURL(file);
}

function updatePhotoDisplay() {
    const photoGrid = document.querySelector('.photo-grid');
    const photoStatus = document.querySelector('.photo-status');
    
    if (photoGrid) {
        photoGrid.innerHTML = '';
        
        uploadedPhotos.forEach(photo => {
            const photoElement = createPhotoElement(photo);
            photoGrid.appendChild(photoElement);
        });
    }
    
    if (photoStatus) {
        photoStatus.textContent = `${uploadedPhotos.length} photos uploaded`;
    }
}

function createPhotoElement(photo) {
    const photoDiv = document.createElement('div');
    photoDiv.className = 'photo-item';
    photoDiv.innerHTML = `
        <img src="${photo.url}" alt="${photo.name}">
        <div class="photo-tag">${photo.type.replace('_', ' ')}</div>
        <button class="photo-delete" onclick="deletePhoto('${photo.id}')">&times;</button>
    `;
    return photoDiv;
}

function deletePhoto(photoId) {
    uploadedPhotos = uploadedPhotos.filter(photo => photo.id !== photoId);
    updatePhotoDisplay();
    console.log('Photo deleted:', photoId);
}

// Site Survey Functions
function initializeSiteSurvey() {
    console.log('Initializing site survey');
    setupSurveySteps();
}

function setupSurveySteps() {
    // Initialize survey step indicators
    const steps = document.querySelectorAll('.audit-step');
    if (steps.length > 0) {
        steps[0].classList.add('active');
    }
}

function nextSurveyStep() {
    const activeStep = document.querySelector('.audit-step.active');
    const nextStep = activeStep ? activeStep.nextElementSibling : null;
    
    if (nextStep && nextStep.classList.contains('audit-step')) {
        activeStep.classList.remove('active');
        nextStep.classList.add('active');
        console.log('Advanced to next survey step');
    } else {
        // Survey complete
        console.log('Site survey completed');
        showScreen('dashboard');
    }
}

// Chat Functions
function initializeChat() {
    console.log('Initializing chat system');
    
    // Add welcome message
    addChatMessage('ai', "Hello! I'm your AI home planning assistant. I can help you with room layouts, material selection, budget planning, and connecting with the right professionals. What would you like to discuss about your home project?");
    
    // Setup input handler
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-message');
    
    if (chatInput && sendButton) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
        
        sendButton.addEventListener('click', sendChatMessage);
    }
}

function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage('user', message);
    chatInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Process message and generate AI response
    setTimeout(() => {
        hideTypingIndicator();
        const aiResponse = generateAIResponse(message);
        addChatMessage('ai', aiResponse);
    }, 1000 + Math.random() * 2000);
}

function addChatMessage(sender, message) {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageDiv.innerHTML = `
        <div class="message-content">${message}</div>
        <div class="message-time">${timestamp}</div>
    `;
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    chatMessages.push({ sender, message, timestamp });
}

function showTypingIndicator() {
    if (isTyping) return;
    
    isTyping = true;
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message ai-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span><span></span><span></span>
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

function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Home Planning Responses
    if (message.includes('budget') || message.includes('cost') || message.includes('money')) {
        return generateBudgetAdvice(message);
    }
    
    if (message.includes('room') || message.includes('bedroom') || message.includes('kitchen') || message.includes('bathroom')) {
        return generateRoomPlanningAdvice(message);
    }
    
    if (message.includes('architect') || message.includes('contractor') || message.includes('professional')) {
        return generateProfessionalAdvice(message);
    }
    
    if (message.includes('vastu') || message.includes('vaastu')) {
        return generateVastuAdvice();
    }
    
    if (message.includes('material') || message.includes('cement') || message.includes('brick') || message.includes('tile')) {
        return generateMaterialAdvice(message);
    }
    
    if (message.includes('timeline') || message.includes('duration') || message.includes('time')) {
        return generateTimelineAdvice();
    }
    
    // Default response
    return "I'd be happy to help you with that! I can assist you with:\n\n🏠 Room planning and layouts\n💰 Budget estimation and cost breakdown\n👷 Finding qualified professionals\n📐 Vastu and design principles\n🧱 Material selection and quality\n⏰ Construction timeline planning\n\nWhat specific aspect would you like to explore?";
}

function generateBudgetAdvice(message) {
    const sqft = extractNumber(message, ['sqft', 'sq ft', 'square feet']);
    const rooms = extractNumber(message, ['bhk', 'bedroom', 'room']);
    
    let advice = "Here's a budget breakdown for your home construction:\n\n";
    
    if (sqft) {
        advice += `For ${sqft} sq ft:\n`;
        advice += `• Basic: ₹${(sqft * 1200).toLocaleString()} (₹1,200/sq ft)\n`;
        advice += `• Standard: ₹${(sqft * 1800).toLocaleString()} (₹1,800/sq ft)\n`;
        advice += `• Premium: ₹${(sqft * 2500).toLocaleString()} (₹2,500/sq ft)\n\n`;
    }
    
    advice += "💡 **Cost Distribution:**\n";
    advice += "• Structure (40%): Foundation, walls, roof\n";
    advice += "• Flooring (15%): Tiles, marble, wood\n";
    advice += "• Fixtures (12%): Doors, windows, fittings\n";
    advice += "• Plumbing (10%): Water supply, drainage\n";
    advice += "• Electrical (10%): Wiring, connections\n";
    advice += "• Painting (8%): Primer, paint, finishes\n";
    advice += "• Finishing (5%): Final touches\n\n";
    advice += "Would you like me to connect you with architects for a detailed estimate?";
    
    return advice;
}

function generateRoomPlanningAdvice(message) {
    let advice = "Here are some expert room planning guidelines:\n\n";
    
    if (message.includes('bedroom')) {
        advice += "🛏️ **Bedroom Planning:**\n";
        advice += "• Minimum size: 10x10 feet\n";
        advice += "• Ideal size: 12x12 feet\n";
        advice += "• Key elements: Bed, wardrobe, study area\n";
        advice += "• Design focus: Natural light, cross ventilation, privacy\n\n";
    }
    
    if (message.includes('kitchen')) {
        advice += "🍳 **Kitchen Planning:**\n";
        advice += "• Minimum size: 8x10 feet\n";
        advice += "• Ideal size: 10x12 feet\n";
        advice += "• Work triangle: Stove, sink, refrigerator\n";
        advice += "• Essential zones: Cooking, prep, storage, washing\n\n";
    }
    
    if (message.includes('bathroom')) {
        advice += "🚿 **Bathroom Planning:**\n";
        advice += "• Minimum size: 5x7 feet\n";
        advice += "• Ideal size: 6x8 feet\n";
        advice += "• Key elements: Toilet, basin, shower/bathtub\n";
        advice += "• Focus: Waterproofing, ventilation, safety\n\n";
    }
    
    advice += "Would you like specific layout suggestions for any room?";
    return advice;
}

function generateProfessionalAdvice(message) {
    return "I can help you find the right professionals for your project:\n\n" +
           "👩‍💼 **Architects** - Design and planning (₹50k-600k)\n" +
           "🔨 **Carpenters** - Furniture and woodwork (₹15k-120k)\n" +
           "🔧 **Plumbers** - Water systems and fixtures (₹3k-60k)\n" +
           "🎨 **Painters** - Interior and exterior painting (₹5k-50k)\n" +
           "⚡ **Electricians** - Wiring and electrical work (₹10k-80k)\n\n" +
           "All professionals are verified with ratings and portfolios. Would you like me to show you professionals in your area?";
}

function generateVastuAdvice() {
    return "Here are key Vastu principles for your home:\n\n" +
           "🚪 **Main Entrance:** North, East, or Northeast\n" +
           "🍳 **Kitchen:** Southeast corner\n" +
           "🛏️ **Master Bedroom:** Southwest corner\n" +
           "🙏 **Puja Room:** Northeast corner\n" +
           "🚿 **Bathrooms:** Northwest or Southeast\n" +
           "🪜 **Staircase:** South, Southwest, or West\n\n" +
           "These guidelines can help create positive energy flow in your home. Would you like specific advice for any room?";
}

function generateMaterialAdvice(message) {
    return "Here's guidance on construction materials:\n\n" +
           "🧱 **Foundation:** M20 grade concrete, steel reinforcement\n" +
           "🏗️ **Walls:** Red brick, AAC blocks, or concrete blocks\n" +
           "🏠 **Roofing:** RCC slab, tile roofing, or metal sheets\n" +
           "🪟 **Windows:** UPVC, aluminum, or wooden frames\n" +
           "🚪 **Doors:** Teak, engineered wood, or steel\n" +
           "⚡ **Wiring:** Copper wires, modular switches\n\n" +
           "💡 **Quality Tips:**\n" +
           "• Always buy ISI marked materials\n" +
           "• Check manufacturer warranties\n" +
           "• Compare prices from 3+ suppliers\n\n" +
           "Need specific material recommendations for your project?";
}

function generateTimelineAdvice() {
    return "Here's a typical construction timeline:\n\n" +
           "📅 **Phase-wise Duration:**\n" +
           "• Foundation & Structure: 3-4 months\n" +
           "• Plumbing & Electrical: 2-3 weeks each\n" +
           "• Flooring: 3-4 weeks\n" +
           "• Painting: 2-3 weeks\n" +
           "• Fixtures & Fittings: 2-3 weeks\n" +
           "• Final Finishing: 1-2 weeks\n\n" +
           "⚡ **Total Timeline:** 6-8 months for complete construction\n\n" +
           "💡 **Factors affecting timeline:**\n" +
           "• Weather conditions\n" +
           "• Material availability\n" +
           "• Approval processes\n" +
           "• Labor availability\n\n" +
           "Would you like a detailed timeline for your specific project?";
}

function extractNumber(text, keywords) {
    for (let keyword of keywords) {
        const regex = new RegExp(`(\\d+)\\s*${keyword}`, 'i');
        const match = text.match(regex);
        if (match) {
            return parseInt(match[1]);
        }
    }
    return null;
}

// Pathway Functions
function initializePathway() {
    console.log('Initializing pathway screen');
    setupPhaseNavigation();
}

function setupPhaseNavigation() {
    const phaseTabs = document.querySelectorAll('.phase-tab');
    phaseTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => switchPhase(index));
    });
}

function switchPhase(phaseIndex) {
    const phaseTabs = document.querySelectorAll('.phase-tab');
    const phaseContents = document.querySelectorAll('.phase-content');
    
    // Remove active class from all tabs and contents
    phaseTabs.forEach(tab => tab.classList.remove('active'));
    phaseContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    if (phaseTabs[phaseIndex] && phaseContents[phaseIndex]) {
        phaseTabs[phaseIndex].classList.add('active');
        phaseContents[phaseIndex].classList.add('active');
    }
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized - DOM ready');
    
    // Check if running in Cordova
    if (window.cordova) {
        console.log('Running in Cordova environment');
        // Cordova initialization will be handled by deviceready event
    } else {
        console.log('Running in browser environment');
        // Initialize app for browser testing
        showScreen('splash');
        setTimeout(() => {
            showScreen('intro1');
        }, 3000);
    }
});

// New Navigation Functions for Enhanced Features

// Property Audit Navigation
function navigateToPropertyAudit() {
    console.log('Navigating to Property Audit');
    showScreen('property-audit');
}

function navigateToIdentifyChanges() {
    console.log('Navigating to Identify Changes');
    showScreen('identify-changes');
}

function navigateToUploadDrawings() {
    console.log('Navigating to Upload Drawings');
    showScreen('upload-layout');
}

function navigateToShortlistArchitect() {
    console.log('Navigating to Shortlist Architect');
    showScreen('shortlist-architect');
}

function navigateToFindArchitect() {
    console.log('Navigating to Find Professionals');
    showScreen('find-professionals');
}

// Professional Navigation Functions
function navigateToTrack() {
    console.log('Navigating to Track screen');
    showScreen('track');
}

function navigateToMore() {
    console.log('Navigating to More screen');
    showScreen('track'); // Using track as placeholder for more
}

function navigateToNotifications() {
    console.log('Navigating to Notifications');
    // Placeholder for notifications functionality
    navigator.notification.alert('Notifications coming soon!', null, 'Notifications', 'OK');
}

// Professional Search and Filter Functions
function switchCategory(category) {
    console.log('Switching to category:', category);
    
    // Update active tab
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Update professionals list based on category
    updateProfessionalsList(category);
}

function updateProfessionalsList(category) {
    console.log('Updating professionals list for:', category);
    // Placeholder for dynamic professional loading
    const professionalsList = document.querySelector('.professionals-list');
    if (professionalsList) {
        console.log('Professionals list updated for category:', category);
    }
}

function startVoiceSearch() {
    console.log('Starting voice search');
    
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        recognition.onresult = function(event) {
            const searchTerm = event.results[0][0].transcript;
            const searchInput = document.querySelector('.search-bar input');
            if (searchInput) {
                searchInput.value = searchTerm;
            }
            console.log('Voice search result:', searchTerm);
        };
        
        recognition.onerror = function(event) {
            console.error('Voice search error:', event.error);
            navigator.notification.alert('Voice search not available', null, 'Error', 'OK');
        };
        
        recognition.start();
    } else {
        navigator.notification.alert('Voice search not supported', null, 'Error', 'OK');
    }
}

function removeFilter(filterElement) {
    console.log('Removing filter');
    filterElement.parentElement.remove();
}

function shortlistProfessional(professionalId) {
    console.log('Shortlisting professional:', professionalId);
    navigator.notification.alert('Professional shortlisted successfully!', null, 'Success', 'OK');
}

function viewWork(professionalId) {
    console.log('Viewing work for professional:', professionalId);
    showScreen('professional-details');
}

function showProfessionalDetails(professionalId) {
    console.log('Showing details for professional:', professionalId);
    showScreen('professional-details');
}

function contactProfessional() {
    console.log('Contacting professional');
    navigator.notification.alert('Contact functionality coming soon!', null, 'Contact', 'OK');
}

function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    const targetPanel = document.getElementById(tabName + '-tab');
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
}

// Filter Functions
function resetFilters() {
    console.log('Resetting filters');
    
    // Reset all form inputs
    document.querySelectorAll('#filter-architects input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    document.querySelectorAll('#filter-architects input[type="radio"]').forEach(rb => {
        rb.checked = false;
    });
    
    document.querySelectorAll('#filter-architects .style-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    // Reset range slider
    const slider = document.querySelector('.radius-slider');
    if (slider) {
        slider.value = 25;
        document.querySelector('.radius-value').textContent = '25 km';
    }
    
    navigator.notification.alert('Filters reset successfully!', null, 'Reset', 'OK');
}

function applyFilters() {
    console.log('Applying filters');
    navigator.notification.alert('Filters applied successfully!', null, 'Filters Applied', 'OK');
    showScreen('find-professionals');
}

// Shortlisted Architects Functions
function removeFromShortlist(architectId) {
    console.log('Removing from shortlist:', architectId);
    navigator.notification.alert('Architect removed from shortlist', null, 'Removed', 'OK');
}

function contactArchitect(architectId) {
    console.log('Contacting architect:', architectId);
    navigator.notification.alert('Contact functionality coming soon!', null, 'Contact', 'OK');
}

function compareArchitects() {
    console.log('Comparing architects');
    navigator.notification.alert('Compare functionality coming soon!', null, 'Compare', 'OK');
}

// AI Assistant Functions
let isVoiceInputActive = false;
let recognition = null;

function showAIAssistant() {
    console.log('Showing AI Assistant');
    showScreen('ai-assistant');
}

function askAI(question) {
    console.log('Asking AI:', question);
    
    // Add user message to chat
    addMessageToAIChat('user', question);
    
    // Simulate AI response
    setTimeout(() => {
        const response = generateAIResponse(question);
        addMessageToAIChat('ai', response);
    }, 1000);
}

function generateAIResponse(question) {
    const responses = {
        'I need to paint my house': 'Great! I can help you find the best painters. First, let me understand your requirements:\n\n1. What type of rooms need painting?\n2. What\'s your budget range?\n3. Do you prefer any specific paint brands?\n4. When do you want to start?\n\nBased on your answers, I\'ll connect you with top-rated painters in your area!',
        
        'Find me a carpenter': 'I\'d be happy to help you find skilled carpenters! Let me gather some details:\n\n1. What type of carpentry work do you need? (furniture, doors, windows, custom work)\n2. What\'s your location?\n3. What\'s your budget range?\n4. Any specific timeline?\n\nI have access to verified carpenters with great reviews. Shall I show you some options?',
        
        'What should my budget be?': 'Budget planning is crucial for a successful home project! Here\'s a rough breakdown:\n\n🏗️ **Construction/Renovation:**\n- Basic: ₹800-1200 per sq ft\n- Premium: ₹1500-2500 per sq ft\n\n🎨 **Interiors:**\n- Basic: ₹300-600 per sq ft\n- Premium: ₹800-1500 per sq ft\n\n💡 **Pro tip:** Always keep 15-20% buffer for unexpected costs!\n\nTell me your project details for a more accurate estimate.',
        
        'Help me plan my home renovation': 'I\'ll help you create a comprehensive renovation plan! Here\'s our systematic approach:\n\n📋 **Phase 1: Planning**\n- Define scope and goals\n- Set budget\n- Get necessary permits\n\n🏗️ **Phase 2: Structural**\n- Plumbing, electrical, HVAC\n- Structural changes\n\n🎨 **Phase 3: Finishing**\n- Flooring, painting, fixtures\n- Interior design\n\nWould you like me to create a detailed timeline for your specific project?'
    };
    
    return responses[question] || 'I understand you\'re asking about home construction and renovation. I\'m here to help you with:\n\n• Finding qualified professionals\n• Budget planning and cost estimation\n• Project timeline and planning\n• Material selection and sourcing\n• Quality control and inspection\n\nWhat specific aspect would you like to explore further?';
}

function addMessageToAIChat(sender, message) {
    const chatMessages = document.getElementById('aiChatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    if (sender === 'ai') {
        messageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>${message}</p>
                <span class="message-time">${time}</span>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-avatar">👤</div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendAIMessage() {
    const input = document.getElementById('aiMessageInput');
    if (!input || !input.value.trim()) return;
    
    const message = input.value.trim();
    input.value = '';
    
    askAI(message);
}

function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window)) {
        navigator.notification.alert('Voice input not supported on this device', null, 'Error', 'OK');
        return;
    }
    
    if (isVoiceInputActive) {
        stopVoiceInput();
        return;
    }
    
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'hi-IN'; // Hindi language
    recognition.interimResults = true;
    recognition.continuous = true;
    
    const voiceBtn = document.getElementById('voiceBtn');
    const input = document.getElementById('aiMessageInput');
    
    recognition.onstart = function() {
        isVoiceInputActive = true;
        voiceBtn.textContent = '🔴';
        voiceBtn.style.backgroundColor = '#ff4444';
        input.placeholder = 'Listening... Speak in Hindi';
    };
    
    recognition.onresult = function(event) {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        input.value = transcript;
    };
    
    recognition.onend = function() {
        isVoiceInputActive = false;
        voiceBtn.textContent = '🎤';
        voiceBtn.style.backgroundColor = '';
        input.placeholder = 'Type your message or press mic for voice input...';
    };
    
    recognition.onerror = function(event) {
        console.error('Voice recognition error:', event.error);
        stopVoiceInput();
        navigator.notification.alert('Voice input error. Please try again.', null, 'Error', 'OK');
    };
    
    recognition.start();
}

function stopVoiceInput() {
    if (recognition) {
        recognition.stop();
    }
    isVoiceInputActive = false;
    
    const voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
        voiceBtn.textContent = '🎤';
        voiceBtn.style.backgroundColor = '';
    }
}

// Notes Functions
function toggleNotes() {
    const notesPanel = document.getElementById('notesPanel');
    if (notesPanel) {
        const isVisible = notesPanel.style.display !== 'none';
        notesPanel.style.display = isVisible ? 'none' : 'block';
    }
}

function saveNotes() {
    const notesArea = document.getElementById('notesArea');
    if (notesArea && notesArea.value.trim()) {
        // Save notes to local storage
        localStorage.setItem('homii_notes', notesArea.value);
        navigator.notification.alert('Notes saved successfully!', null, 'Saved', 'OK');
    }
}

// Photo and Camera Functions
function openCamera() {
    console.log('Opening camera for property audit');
    
    if (navigator.camera) {
        const options = {
            quality: 75,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            saveToPhotoAlbum: true
        };
        
        navigator.camera.getPicture(onPhotoSuccess, onPhotoError, options);
    } else {
        // Fallback for browser testing
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'camera';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    addPhotoToGallery(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }
}

function onPhotoSuccess(imageURI) {
    console.log('Photo captured successfully:', imageURI);
    addPhotoToGallery(imageURI);
}

function onPhotoError(message) {
    console.error('Camera error:', message);
    navigator.notification.alert('Unable to take photo: ' + message, null, 'Camera Error', 'OK');
}

function addPhotoToGallery(imageURI) {
    const gallery = document.querySelector('.photo-gallery');
    if (gallery) {
        const photoDiv = document.createElement('div');
        photoDiv.className = 'photo-preview';
        photoDiv.innerHTML = `<img src="${imageURI}" alt="Property photo">`;
        
        // Insert before the "Add Photo" button
        const addButton = gallery.querySelector('.photo-item');
        gallery.insertBefore(photoDiv, addButton);
    }
}

function uploadLayout() {
    console.log('Uploading layout/floor plan');
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            navigator.notification.alert('Layout uploaded successfully!', null, 'Upload Complete', 'OK');
            
            // Add to uploaded layouts list
            const layoutsList = document.querySelector('.uploaded-layouts');
            if (layoutsList) {
                const layoutDiv = document.createElement('div');
                layoutDiv.className = 'layout-item';
                layoutDiv.innerHTML = `
                    <img src="https://via.placeholder.com/100x80?text=Layout" alt="Layout">
                    <span>${file.name}</span>
                `;
                layoutsList.appendChild(layoutDiv);
            }
        }
    };
    input.click();
}

function showPhotoHelp() {
    const helpText = `Taking site photos helps:\n\n• Document current condition\n• Identify potential issues\n• Plan renovation work\n• Track progress\n• Insurance purposes\n\nTip: Take photos of all rooms, walls, ceilings, and any existing damage.`;
    navigator.notification.alert(helpText, null, 'Why Site Photos?', 'OK');
}

// Phase Navigation Functions
function switchPhase(phaseNumber) {
    console.log('Switching to phase:', phaseNumber);
    
    // Update active phase tab
    document.querySelectorAll('.phase-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // Update phase content based on phase number
    updatePhaseContent(phaseNumber);
}

function updatePhaseContent(phaseNumber) {
    const phaseContent = document.querySelector('.phase-content');
    if (!phaseContent) return;
    
    const phases = {
        1: {
            title: 'Project Setup and Clarity',
            description: 'Getting ready to start your dream home',
            stats: ['2-3 weeks', '1-3 Lakhs', '4 Steps'],
            tasks: [
                { name: 'Define Goal & Scope', status: 'completed', icon: '📋' },
                { name: 'Property Audit', status: 'current', icon: '📸' },
                { name: 'Architect Onboarding', status: 'pending', icon: '👨‍💼' },
                { name: 'Design Development', status: 'pending', icon: '📐' }
            ]
        },
        2: {
            title: 'Design and Planning',
            description: 'Creating detailed plans for your home',
            stats: ['4-6 weeks', '2-5 Lakhs', '5 Steps'],
            tasks: [
                { name: 'Site Survey', status: 'pending', icon: '📏' },
                { name: 'Design Concepts', status: 'pending', icon: '🎨' },
                { name: 'Technical Drawings', status: 'pending', icon: '📐' },
                { name: 'Approval Process', status: 'pending', icon: '✅' },
                { name: 'Material Selection', status: 'pending', icon: '🧱' }
            ]
        },
        3: {
            title: 'Construction Preparation',
            description: 'Getting ready for construction phase',
            stats: ['2-3 weeks', '1-2 Lakhs', '3 Steps'],
            tasks: [
                { name: 'Permits & Approvals', status: 'pending', icon: '📋' },
                { name: 'Contractor Selection', status: 'pending', icon: '👷' },
                { name: 'Construction Planning', status: 'pending', icon: '🏗️' }
            ]
        }
    };
    
    const phase = phases[phaseNumber] || phases[1];
    
    // Update header
    const header = phaseContent.querySelector('.phase-header h3');
    const description = phaseContent.querySelector('.phase-header p');
    if (header) header.textContent = phase.title;
    if (description) description.textContent = phase.description;
    
    // Update stats
    const statItems = phaseContent.querySelectorAll('.stat-item span:last-child');
    statItems.forEach((item, index) => {
        if (phase.stats[index]) {
            item.textContent = phase.stats[index];
        }
    });
    
    console.log('Phase content updated for phase:', phaseNumber);
}

// Initialize app for browser testing if not in Cordova
if (!window.cordova) {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Browser initialization');
        showScreen('splash');
        setTimeout(() => {
            showScreen('intro1');
        }, 3000);
    });
}

console.log('App.js fully loaded - All functions available');
