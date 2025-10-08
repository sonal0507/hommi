// Global Variables
let projectData = {
    step1: {},
    step2: {},
    step3: {},
    step4: {}
};
let uploadedPhotos = [];
let currentFilter = 'architects';
let shortlistedProfessionals = [];

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

// Screen Management
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
        console.log('Screen shown:', screenId);
    } else {
        console.error('Screen not found:', screenId);
    }
}

// Questionnaire Form Handlers
function handleStep1(event) {
    event.preventDefault();
    console.log('Processing Step 1');
    
    const homeName = document.getElementById('home-name-step1').value.trim();
    
    if (!homeName) {
        alert('Please enter a name for your home');
        return;
    }
    
    // Store data
    projectData.step1 = {
        homeName
    };
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
        familyEmail
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
    
    // Update dashboard with user data
    updateDashboardData();
    
    // Project creation complete - navigate to dashboard
    showScreen('dashboard');
}

// Function to update dashboard with completed questionnaire data
function updateDashboardData() {
    // Update user name in dashboard
    const userName = projectData.step1?.homeName || 'Your';
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
        el.textContent = userName.replace(' ', '\'s ');
    });
    
    // Update project name
    const projectNameEl = document.getElementById('projectName');
    if (projectNameEl) {
        projectNameEl.textContent = projectData.step1?.homeName || 'Your Project';
    }
    
    // Update budget
    const budgetEl = document.getElementById('projectBudget');
    if (budgetEl) {
        budgetEl.textContent = projectData.step4?.budget || '₹25L';
    }
}

// NEW: Function to show Goal & Scope screen with populated data
function showGoalAndScope() {
    console.log('Navigating to Goal & Scope screen');
    
    // Populate the Goal & Scope screen with questionnaire data
    populateGoalScopeData();
    
    // Navigate to the Goal & Scope screen
    showScreen('goalAndScopeScreen');
}

// NEW: Function to populate Goal & Scope screen with questionnaire data
function populateGoalScopeData() {
    console.log('Populating Goal & Scope with project data:', projectData);
    
    // Update project name
    const projectNameEl = document.getElementById('projectNameGoal');
    if (projectNameEl) {
        projectNameEl.textContent = projectData.step1?.homeName || 'Not specified';
    }
    
    // Update home type
    const homeTypeEl = document.getElementById('homeTypeGoal');
    if (homeTypeEl) {
        homeTypeEl.textContent = projectData.step2?.homeType || 'Not specified';
    }
    
    // Update size
    const sizeEl = document.getElementById('homeSizeGoal');
    if (sizeEl) {
        sizeEl.textContent = projectData.step2?.squareFeet || 'Not specified';
    }
    
    // Update bedrooms
    const bedroomsEl = document.getElementById('bedroomsGoal');
    if (bedroomsEl) {
        bedroomsEl.textContent = projectData.step2?.bedrooms || 'Not specified';
    }
    
    // Update bathrooms
    const bathroomsEl = document.getElementById('bathroomsGoal');
    if (bathroomsEl) {
        bathroomsEl.textContent = projectData.step2?.bathrooms || 'Not specified';
    }
    
    // Update location
    const locationEl = document.getElementById('locationGoal');
    if (locationEl) {
        locationEl.textContent = projectData.step2?.location || 'Not specified';
    }
    
    // Update budget
    const budgetEl = document.getElementById('budgetGoal');
    if (budgetEl) {
        budgetEl.textContent = projectData.step4?.budget || 'Not specified';
    }
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
    
    console.log('Email login initiated for:', email);
    // Simulate successful login
    setTimeout(() => {
        showScreen('home-setup');
    }, 1000);
}

function showOtherOptions() {
    console.log('Showing other login options');
    // You can implement additional login methods here
    alert('Additional login options coming soon!');
}

// BOQ Upload Handler
function handleBOQUpload(input) {
    const file = input.files[0];
    if (file) {
        const statusEl = document.getElementById('boq-status');
        statusEl.textContent = `✅ ${file.name} uploaded successfully`;
        statusEl.style.color = '#28a745';
        console.log('BOQ file uploaded:', file.name);
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
    
    if (navigator.notification) {
        navigator.notification.alert('Photo captured successfully!', null, 'Success', 'OK');
    }
}

function onCameraError(message) {
    console.log('Camera error: ' + message);
    if (navigator.notification) {
        navigator.notification.alert('Failed to capture photo: ' + message, null, 'Camera Error', 'OK');
    }
}

function handleFileUpload(input) {
    const files = Array.from(input.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedPhotos.push({
                id: Date.now() + Math.random(),
                url: e.target.result,
                timestamp: new Date().toISOString(),
                name: file.name
            });
            updatePhotoDisplay();
        };
        reader.readAsDataURL(file);
    });
}

function updatePhotoDisplay() {
    const photoGrid = document.getElementById('photo-grid');
    const photoCount = document.getElementById('photo-count');
    
    if (photoGrid) {
        photoGrid.innerHTML = '';
        uploadedPhotos.forEach(photo => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            photoItem.innerHTML = `
                <img src="${photo.url}" alt="Property photo">
                <div class="photo-tag">Property ${uploadedPhotos.indexOf(photo) + 1}</div>
                <div class="photo-delete" onclick="deletePhoto(${photo.id})">❌</div>
            `;
            photoGrid.appendChild(photoItem);
        });
    }
    
    if (photoCount) {
        photoCount.textContent = `${uploadedPhotos.length} photos added`;
    }
}

function deletePhoto(photoId) {
    uploadedPhotos = uploadedPhotos.filter(photo => photo.id !== photoId);
    updatePhotoDisplay();
}

// Professional Search and Filter Functions
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
            specializations: ["Home Wiring", "LED Installation", "Fan Installation", "Switch Installation"],
            styles: ["Residential", "Commercial"],
            budget: "3k-20k",
            phone: "+91 98765 43222",
            email: "mohan.electrician@example.com",
            verified: true,
            portfolio: ["House Wiring", "LED Setup", "Fan Installation"],
            expertise: ["Electrical Wiring", "Lighting Systems", "Power Outlets", "Safety Switches"]
        }
    ]
};

function initializeProfessionalSearch() {
    populateProfessionalsList('architects');
}

function populateProfessionalsList(type) {
    const container = document.getElementById('professionals-list');
    if (!container) return;
    
    const professionals = professionalDatabase[type] || [];
    container.innerHTML = '';
    
    professionals.forEach(professional => {
        const card = createProfessionalCard(professional);
        container.appendChild(card);
    });
}

function createProfessionalCard(professional) {
    const card = document.createElement('div');
    card.className = 'professional-card';
    card.innerHTML = `
        <div class="professional-header">
            <div class="professional-avatar">👤</div>
            <div class="professional-info">
                <h3>${professional.name} ${professional.verified ? '✅' : ''}</h3>
                <p>${professional.profession} • ${professional.experience}</p>
                <div class="professional-rating">
                    <span>⭐ ${professional.rating}</span>
                    <span>(${professional.reviews} reviews)</span>
                </div>
            </div>
            <div class="professional-actions">
                <button class="btn-heart" onclick="toggleShortlist('${professional.id}')" title="Add to shortlist">❤️</button>
                <button class="btn-contact" onclick="contactProfessional('${professional.id}')" title="Contact">📞</button>
            </div>
        </div>
        <div class="professional-details">
            <div class="professional-location">
                <span>📍 ${professional.location}</span>
                <span>📏 ${professional.distance}</span>
            </div>
            <div class="professional-budget">
                <span>💰 Budget: ₹${professional.budget}</span>
            </div>
            <div class="professional-specializations">
                ${professional.specializations.slice(0, 3).map(spec => `<span class="spec-tag">${spec}</span>`).join('')}
            </div>
        </div>
    `;
    return card;
}

function filterByType(type) {
    currentFilter = type;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    
    // Populate list with filtered professionals
    populateProfessionalsList(type);
}

function toggleFilters() {
    const filtersEl = document.getElementById('search-filters');
    if (filtersEl.style.display === 'none') {
        filtersEl.style.display = 'block';
    } else {
        filtersEl.style.display = 'none';
    }
}

function toggleShortlist(professionalId) {
    const index = shortlistedProfessionals.indexOf(professionalId);
    if (index > -1) {
        shortlistedProfessionals.splice(index, 1);
        console.log('Removed from shortlist:', professionalId);
    } else {
        shortlistedProfessionals.push(professionalId);
        console.log('Added to shortlist:', professionalId);
    }
}

function contactProfessional(professionalId) {
    console.log('Contacting professional:', professionalId);
    alert('Contact feature coming soon!');
}

// AI Chat Bot Functions
let chatMessages = [];
let isTyping = false;
let chatInitialized = false;
let voiceMode = false;

function showAIChatBot() {
    console.log('Opening AI Chat Bot');
    
    if (!chatInitialized) {
        initializeChatBot();
        chatInitialized = true;
    }
    
    showScreen('aiChatScreen');
}

function closeChatBot() {
    console.log('Closing AI Chat Bot');
    showScreen('dashboard');
}

function initializeChatBot() {
    console.log('Initializing AI Chat Bot');
    const chatContainer = document.getElementById('chat-messages');
    
    // Add welcome message if not already present
    if (chatContainer && chatMessages.length === 0) {
        addChatMessage('bot', `Hello! I'm your Homii AI Assistant. I'm here to help you plan, build, and connect with the right professionals for your home project.\n\nYou can ask me about:\n• 🏗️ Construction planning & budgeting\n• 🎨 Design ideas & room layouts\n• 👷 Finding architects, carpenters, painters\n• 📋 Project management & timelines\n• 💡 Home improvement suggestions\n\nWhat would you like to know?`);
    }
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage('user', message);
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate AI response
    setTimeout(() => {
        hideTypingIndicator();
        generateAIResponse(message);
    }, 1500);
}

function addChatMessage(sender, message) {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    if (sender === 'bot') {
        messageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>${message.replace(/\n/g, '</p><p>')}</p>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
            </div>
            <div class="message-avatar">👤</div>
        `;
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Store message
    chatMessages.push({ sender, message, timestamp: new Date() });
}

function showTypingIndicator() {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <p>Thinking...</p>
        </div>
    `;
    
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    let response = '';
    
    // Simple AI response logic
    if (message.includes('cost') || message.includes('budget') || message.includes('price')) {
        response = `Based on your project requirements, here's a rough cost breakdown:\n\n💰 **Budget Estimation:**\n• Basic renovation: ₹800-1200 per sq ft\n• Standard renovation: ₹1200-1800 per sq ft\n• Premium renovation: ₹1800-2500 per sq ft\n\nFor your ${projectData.step2?.squareFeet || 'specified size'} space, I'd estimate ${projectData.step4?.budget || '₹15-25 lakhs'}.\n\nWould you like me to connect you with cost estimators in your area?`;
    } else if (message.includes('architect') || message.includes('designer')) {
        response = `I can help you find the perfect architect! 🏗️\n\nBased on your location (${projectData.step2?.location || 'your area'}), I found some great architects:\n\n⭐ **Top Recommendations:**\n• Priya Sharma - Modern & Sustainable Design\n• Rajesh Kumar - Renovation Specialist\n• Ananya Patel - Luxury Homes\n\nWould you like me to show you their profiles and help you connect?`;
    } else if (message.includes('kitchen') || message.includes('bathroom') || message.includes('room')) {
        response = `Great question about room planning! 🏠\n\n**Design Tips:**\n• Kitchen: Focus on the work triangle (stove, sink, fridge)\n• Bathroom: Ensure proper ventilation and waterproofing\n• Living room: Create conversation areas with good lighting\n• Bedroom: Prioritize storage and natural light\n\nFor your ${projectData.step2?.homeType || 'home type'}, I recommend consulting with an interior designer. Would you like me to find some specialists?`;
    } else if (message.includes('timeline') || message.includes('time') || message.includes('duration')) {
        response = `Here's a typical timeline for home projects: ⏰\n\n**Construction Phases:**\n• Planning & Permits: 2-4 weeks\n• Foundation & Structure: 6-8 weeks\n• Electrical & Plumbing: 2-3 weeks\n• Flooring & Painting: 3-4 weeks\n• Finishing & Fixtures: 2-3 weeks\n\n**Total Duration:** 15-22 weeks for complete renovation\n\nYour project timeline may vary based on scope and complexity. Need help creating a detailed schedule?`;
    } else if (message.includes('hello') || message.includes('hi') || message.includes('help')) {
        response = `Hello! I'm here to help with your home project! 👋\n\nI can assist you with:\n🏗️ Planning and budgeting\n🎨 Design suggestions\n👷 Finding professionals\n📋 Project management\n💡 Expert advice\n\nWhat specific aspect of your home project would you like to discuss?`;
    } else {
        response = `That's an interesting question! 🤔\n\nI'd be happy to help you with that. For specific technical questions, I recommend consulting with a professional expert.\n\nWould you like me to:\n• Connect you with relevant professionals?\n• Provide general guidance on this topic?\n• Help you plan your next steps?\n\nJust let me know how I can assist you better!`;
    }
    
    addChatMessage('bot', response);
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function askQuickQuestion(question) {
    document.getElementById('chat-input').value = question;
    sendMessage();
}

function startVoiceInput() {
    console.log('Starting voice input');
    alert('Voice input feature coming soon! Will support Hindi and English.');
}

function toggleVoiceMode() {
    voiceMode = !voiceMode;
    const voiceModeEl = document.getElementById('voice-mode');
    const chatInputEl = document.getElementById('chat-input-container');
    
    if (voiceMode) {
        voiceModeEl.style.display = 'block';
        chatInputEl.style.display = 'none';
    } else {
        voiceModeEl.style.display = 'none';
        chatInputEl.style.display = 'flex';
    }
}

function stopVoiceMode() {
    toggleVoiceMode();
}

function clearChat() {
    chatMessages = [];
    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer) {
        chatContainer.innerHTML = '';
    }
    initializeChatBot();
}

// Dashboard Functions
function toggleSearch() {
    const searchSection = document.getElementById('search-section');
    if (searchSection.style.display === 'none') {
        searchSection.style.display = 'block';
        document.getElementById('search-input').focus();
    } else {
        searchSection.style.display = 'none';
    }
}

function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    if (query) {
        console.log('Searching for:', query);
        alert(`Search results for "${query}" coming soon!`);
    }
}

function startVoiceSearch() {
    console.log('Starting voice search');
    alert('Voice search feature coming soon!');
}

function editProjectName() {
    const newName = prompt('Enter new project name:');
    if (newName && newName.trim()) {
        projectData.step1.homeName = newName.trim();
        updateDashboardData();
    }
}

// Navigation Functions
function showAuditHelp() {
    alert('Property Audit Help:\n\n1. Take photos of each room\n2. Include different angles\n3. Capture any issues or areas of interest\n4. Minimum 5 photos required\n\nThis helps architects understand your space better!');
}

function addNewTask() {
    const taskName = prompt('Enter new task:');
    if (taskName && taskName.trim()) {
        console.log('Adding new task:', taskName);
        alert('Task management feature coming soon!');
    }
}

function inviteTeamMember() {
    const email = prompt('Enter team member email:');
    if (email && email.trim()) {
        console.log('Inviting team member:', email);
        alert('Team invitation feature coming soon!');
    }
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

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Set up click handler for splash screen
    const splashScreen = document.getElementById('splash');
    if (splashScreen) {
        splashScreen.addEventListener('click', function() {
            showScreen('intro1');
        });
    }
    
    // Initialize professional search
    initializeProfessionalSearch();
    
    // If not running in Cordova, start immediately
    if (!window.cordova) {
        console.log('Running in browser mode');
        showScreen('splash');
        setTimeout(() => {
            showScreen('intro1');
        }, 3000);
    }
});

// Fallback initialization for browsers
if (!window.cordova) {
    console.log('Cordova not detected, running in browser mode');
    
    // Simulate device ready
    setTimeout(() => {
        console.log('Browser initialization complete');
        showScreen('splash');
        setTimeout(() => {
            showScreen('intro1');
        }, 3000);
    }, 100);
}
