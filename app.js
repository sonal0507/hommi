// App State Management
let currentUser = null;
let currentProject = null;
let shortlistedProfessionals = [];
let projectNotes = [];

// Mock data for architects
const mockArchitects = [
    {
        id: 1,
        name: "Rajesh Kumar",
        location: "Mumbai, Maharashtra",
        distance: "2.5 km away",
        rating: 4.8,
        reviews: 156,
        bio: "Award-winning residential architect with 15+ years experience in modern and traditional designs.",
        avatar: "👨‍💼",
        portfolio: ["Modern Villa in Bandra", "Traditional Home in Juhu", "Luxury Apartment in Worli"]
    },
    {
        id: 2,
        name: "Priya Sharma",
        location: "Delhi, NCR",
        distance: "3.1 km away",
        rating: 4.9,
        reviews: 203,
        bio: "Sustainable architecture specialist focusing on eco-friendly and energy-efficient homes.",
        avatar: "👩‍💼",
        portfolio: ["Eco House in Gurgaon", "Solar Villa in Noida", "Green Apartment Complex"]
    },
    {
        id: 3,
        name: "Arjun Patel",
        location: "Bangalore, Karnataka",
        distance: "1.8 km away",
        rating: 4.7,
        reviews: 127,
        bio: "Contemporary architect known for innovative space utilization and smart home integration.",
        avatar: "👨‍🎨",
        portfolio: ["Smart Home in Whitefield", "Compact Villa in Koramangala", "Tech House in Electronic City"]
    }
];

// Advanced AI Chatbot System with Hindi Support
const CHATBOT_CONFIG = {
    apiEndpoint: 'https://api.openai.com/v1/chat/completions', // Replace with your API
    model: 'gpt-3.5-turbo',
    systemPrompt: `You are Homii Assistant, an expert AI chatbot for home construction and architecture in India. You can communicate in both English and Hindi. You help users with:
- Architectural design advice and suggestions (आर्किटेक्चरल डिजाइन सलाह)
- Construction planning and project management (निर्माण योजना और प्रोजेक्ट प्रबंधन)
- Material selection and cost estimation (सामग्री चयन और लागत अनुमान)
- Building regulations and permits (भवन नियम और अनुमति)
- Interior design recommendations (इंटीरियर डिजाइन सुझाव)
- Sustainable building practices (टिकाऊ निर्माण प्रथाएं)
- Smart home technology integration (स्मार्ट होम टेक्नोलॉजी)

Respond in the same language the user writes in. For Hindi users, use simple, clear Hindi. Always prioritize safety and Indian building codes.`,
    maxTokens: 500,
    temperature: 0.7
};

let chatHistory = [];
let isTyping = false;

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    console.log('Homii App loaded successfully');
    
    // Initialize the app
    initializeApp();
    
    // Setup event listeners
    setupEventListeners();
    
    // Show splash screen initially
    showScreen('splash');
    
    // Auto-transition from splash to intro1 after 3 seconds
    setTimeout(() => {
        showScreen('intro1');
    }, 3000);
});

// Initialize Application
function initializeApp() {
    // Load saved data from localStorage
    loadUserData();
    loadProjectData();
    loadShortlistData();
    loadChatHistory();
    
    // Initialize components
    initializeChatbot();
    updateDashboardNames();
}

// Screen Navigation System
function showScreen(screenId) {
    console.log('Navigating to:', screenId);
    
    // Hide all screens
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        window.scrollTo(0, 0);
        
        // Screen-specific actions
        if (screenId === 'dashboard') {
            updateDashboardNames();
        }
        if (screenId === 'architect-listing') {
            loadProfessionals('architects');
        }
        if (screenId === 'notes-list') {
            loadNotesList();
        }
        if (screenId === 'ai-chatbot-screen') {
            initializeChatInterface();
        }
        
        console.log('Successfully navigated to:', screenId);
    } else {
        console.error('Screen not found:', screenId);
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Splash screen click handler
    const splashScreen = document.getElementById('splash');
    if (splashScreen) {
        splashScreen.addEventListener('click', function() {
            console.log('Splash screen clicked');
            showScreen('intro1');
        });
    }
    
    // Chat input handler
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
}

// Navigation Functions
function goToWelcome() { showScreen('welcome'); }
function goToLogin() { showScreen('login'); }
function goToSignup() { showScreen('signup'); }
function goToOnboarding() { showScreen('intro1'); }
function goToDashboard() { showScreen('dashboard'); }
function goToStartProject() { showScreen('start-new-project'); }
function goToFindProfessionals() { showScreen('find-professionals-main'); }
function goToTrackProgress() { showScreen('track-progress-main'); }
function goToProjectDetails() { showScreen('project-details-form'); }
function goToUploadPhotos() { showScreen('upload-photos'); }
function goToHomePathway() { showScreen('home-pathway'); }
function goToFindArchitect() { showScreen('find-professionals-main'); }

// Login Functions
function handleGoogleLogin() {
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
    console.log('Show other login options');
    showScreen('login');
}

// Project Form Handlers
function handleStep1(event) {
    event.preventDefault();
    const homeName = document.getElementById('home-name-step1').value;
    if (homeName.trim()) {
        if (!currentProject) currentProject = {};
        currentProject.homeName = homeName.trim();
        saveProjectData();
        showScreen('home-details-step2');
    }
}

function handleStep2(event) {
    event.preventDefault();
    const homeType = document.getElementById('home-type-step2').value;
    const bedrooms = document.getElementById('bedrooms-step2').value;
    const squareFeet = document.getElementById('square-feet-step2').value;
    const bathrooms = document.getElementById('bathrooms-step2').value;
    const location = document.getElementById('home-location-step2').value;
    
    if (homeType && bedrooms && squareFeet && bathrooms && location) {
        currentProject.homeType = homeType;
        currentProject.bedrooms = bedrooms;
        currentProject.squareFeet = squareFeet;
        currentProject.bathrooms = bathrooms;
        currentProject.location = location;
        saveProjectData();
        showScreen('home-details-step3');
    } else {
        alert('Please fill in all required fields');
    }
}

function handleStep3(event) {
    event.preventDefault();
    const familyEmail = document.getElementById('family-invite-step3').value;
    
    // Family invitation is optional, so we can proceed regardless
    if (familyEmail && familyEmail.trim()) {
        currentProject.familyEmail = familyEmail.trim();
    }
    saveProjectData();
    showScreen('home-details-step4');
}

function handleStep4(event) {
    event.preventDefault();
    const budget = document.getElementById('budget-step4').value;
    
    if (budget && budget.trim()) {
        currentProject.budget = budget.trim();
        currentProject.status = 'setup_complete';
        currentProject.createdAt = new Date().toISOString();
        saveProjectData();
        showScreen('dashboard');
    } else {
        alert('Please enter your budget to continue');
    }
}

// Professional Management
function loadProfessionals(type = 'architects') {
    const list = document.getElementById('professionals-list');
    if (!list) return;
    
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
    const isShortlisted = shortlistedProfessionals.some(p => p.id === architect.id);
    
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
            <button class="btn btn-outline ${isShortlisted ? 'shortlisted' : ''}" 
                    onclick="shortlistArchitect(${architect.id})" 
                    style="${isShortlisted ? 'background-color: #4CAF50; color: white;' : ''}">
                ${isShortlisted ? 'Shortlisted' : 'Shortlist'}
            </button>
            <button class="btn btn-primary" onclick="viewArchitectProfile(${architect.id})">View work</button>
        </div>
    `;
    return card;
}

function shortlistArchitect(architectId) {
    const architect = mockArchitects.find(a => a.id === architectId);
    if (!architect) return;
    
    const existingIndex = shortlistedProfessionals.findIndex(p => p.id === architectId);
    
    if (existingIndex === -1) {
        shortlistedProfessionals.push(architect);
        console.log('Added to shortlist:', architect.name);
    } else {
        shortlistedProfessionals.splice(existingIndex, 1);
        console.log('Removed from shortlist:', architect.name);
    }
    
    saveShortlistData();
    loadProfessionals('architects');
}

function viewArchitectProfile(architectId) {
    const architect = mockArchitects.find(a => a.id === architectId);
    if (architect) {
        // Store selected architect for profile view
        localStorage.setItem('selectedArchitect', JSON.stringify(architect));
        showScreen('architect-profile');
    }
}

// Notes Management
function loadNotesList() {
    const notesList = document.getElementById('notes-list-container');
    if (!notesList) return;
    
    if (projectNotes.length === 0) {
        notesList.innerHTML = '<div class="empty-state">No notes yet. Start by adding your first note!</div>';
        return;
    }
    
    notesList.innerHTML = projectNotes.map(note => `
        <div class="note-item">
            <div class="note-header">
                <span class="note-date">${note.date}</span>
                <button class="btn-icon" onclick="deleteNote(${note.id})">🗑️</button>
            </div>
            <div class="note-content">${note.content}</div>
        </div>
    `).join('');
}

function saveNote() {
    const noteInput = document.getElementById('note-input');
    if (!noteInput || !noteInput.value.trim()) return;
    
    const note = {
        id: Date.now(),
        content: noteInput.value.trim(),
        date: new Date().toLocaleDateString(),
        timestamp: Date.now()
    };
    
    projectNotes.unshift(note);
    saveNotesData();
    noteInput.value = '';
    showScreen('notes-list');
}

function deleteNote(noteId) {
    projectNotes = projectNotes.filter(note => note.id !== noteId);
    saveNotesData();
    loadNotesList();
}

// Advanced AI Chatbot Implementation
function initializeChatbot() {
    console.log('Initializing Advanced AI Chatbot...');
    loadChatHistory();
}

function initializeChatInterface() {
    const chatContainer = document.getElementById('chat-messages-container');
    if (!chatContainer) return;
    
    // Clear and load chat history
    chatContainer.innerHTML = '';
    
    if (chatHistory.length === 0) {
        // Add welcome message
        addChatMessage('bot', 'Hello! I\'m your Homii AI Assistant. I can help you in English and Hindi (मैं हिंदी में भी बात कर सकता हूँ).\n\nI can help you with architectural design, construction planning, material selection, and much more. How can I assist you with your dream home today? / आज मैं आपके सपनों के घर के लिए कैसे मदद कर सकता हूँ?');
    } else {
        // Load existing chat history
        chatHistory.forEach(message => {
            addChatMessageToDOM(message.role, message.content, false);
        });
    }
    
    scrollToBottom();
}

function addChatMessage(role, content, save = true) {
    const message = { role, content, timestamp: Date.now() };
    
    if (save) {
        chatHistory.push(message);
        saveChatHistory();
    }
    
    addChatMessageToDOM(role, content, true);
}

function addChatMessageToDOM(role, content, animate = false) {
    const chatContainer = document.getElementById('chat-messages-container');
    if (!chatContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role === 'user' ? 'user-message' : 'bot-message'}`;
    
    if (animate) {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
    }
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            ${role === 'user' ? '👤' : '🤖'}
        </div>
        <div class="message-content">
            <div class="message-text">${content}</div>
            <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
    `;
    
    chatContainer.appendChild(messageDiv);
    
    if (animate) {
        // Animate in
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 50);
    }
    
    scrollToBottom();
}

function showTypingIndicator() {
    if (isTyping) return;
    isTyping = true;
    
    const chatContainer = document.getElementById('chat-messages-container');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'chat-message bot-message typing';
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    
    chatContainer.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    isTyping = false;
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    if (!chatInput || !chatInput.value.trim() || isTyping) return;
    
    const message = chatInput.value.trim();
    chatInput.value = '';
    
    // Add user message
    addChatMessage('user', message);
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Get AI response
        const response = await getAIResponse(message);
        hideTypingIndicator();
        addChatMessage('bot', response);
    } catch (error) {
        console.error('AI Chat Error:', error);
        hideTypingIndicator();
        addChatMessage('bot', 'I apologize, but I\'m having trouble connecting right now. Let me provide some general guidance instead!\n\nFor your home construction needs, I recommend:\n• Consulting with local architects for design\n• Getting proper building permits\n• Using quality materials from trusted suppliers\n• Planning your budget with 10-15% contingency\n\nWould you like me to help you find architects in your area?');
    }
}

async function getAIResponse(userMessage) {
    // Prepare context with user's project data
    let contextualPrompt = CHATBOT_CONFIG.systemPrompt;
    
    if (currentProject) {
        contextualPrompt += `\n\nUser's Current Project Context:
- Home Name: ${currentProject.homeName || 'Not specified'}
- Home Type: ${currentProject.homeType || 'Not specified'}
- Plot Size: ${currentProject.plotSize || 'Not specified'}
- Budget: ${currentProject.budget || 'Not specified'}
- Bedrooms: ${currentProject.bedrooms || 'Not specified'}
- Bathrooms: ${currentProject.bathrooms || 'Not specified'}
- Floors: ${currentProject.floors || 'Not specified'}
- Location: ${currentProject.location || 'Not specified'}
- Timeline: ${currentProject.timeline || 'Not specified'}
- Priorities: ${currentProject.priorities ? currentProject.priorities.join(', ') : 'Not specified'}`;
    }
    
    // Prepare conversation history for context
    const recentHistory = chatHistory.slice(-10); // Last 10 messages for context
    const messages = [
        { role: 'system', content: contextualPrompt },
        ...recentHistory,
        { role: 'user', content: userMessage }
    ];
    
    // Simulate AI response with intelligent construction/architecture advice
    return generateSmartResponse(userMessage, currentProject);
}

function generateSmartResponse(userMessage, projectContext) {
    const message = userMessage.toLowerCase();
    
    // Detect language
    const isHindi = /[\u0900-\u097F]/.test(userMessage) || 
                   message.includes('kya') || message.includes('kaise') || 
                   message.includes('kitna') || message.includes('kahan');
    
    // Intelligent response patterns based on user input
    if (message.includes('budget') || message.includes('cost') || message.includes('price') || 
        message.includes('बजट') || message.includes('लागत') || message.includes('पैसा')) {
        return generateBudgetAdvice(projectContext, isHindi);
    } else if (message.includes('design') || message.includes('architect') || message.includes('plan') ||
               message.includes('डिजाइन') || message.includes('आर्किटेक्ट') || message.includes('नक्शा')) {
        return generateDesignAdvice(projectContext, isHindi);
    } else if (message.includes('material') || message.includes('cement') || message.includes('steel') ||
               message.includes('सामग्री') || message.includes('सीमेंट') || message.includes('स्टील')) {
        return generateMaterialAdvice(projectContext, isHindi);
    } else if (message.includes('permit') || message.includes('approval') || message.includes('legal') ||
               message.includes('अनुमति') || message.includes('मंजूरी') || message.includes('कानूनी')) {
        return generatePermitAdvice(projectContext, isHindi);
    } else if (message.includes('timeline') || message.includes('schedule') || message.includes('duration') ||
               message.includes('समय') || message.includes('अवधि') || message.includes('कब')) {
        return generateTimelineAdvice(projectContext, isHindi);
    } else if (message.includes('vastu') || message.includes('feng shui') || message.includes('direction') ||
               message.includes('वास्तु') || message.includes('दिशा')) {
        return generateVastuAdvice(projectContext, isHindi);
    } else if (message.includes('sustainable') || message.includes('eco') || message.includes('green') ||
               message.includes('पर्यावरण') || message.includes('हरित')) {
        return generateSustainabilityAdvice(projectContext, isHindi);
    } else if (message.includes('smart home') || message.includes('technology') || message.includes('automation') ||
               message.includes('स्मार्ट होम') || message.includes('तकनीक')) {
        return generateSmartHomeAdvice(projectContext, isHindi);
    } else {
        return generateGeneralAdvice(userMessage, projectContext, isHindi);
    }
}

function generateBudgetAdvice(project, isHindi = false) {
    if (isHindi) {
        if (project && project.budget) {
            return `आपके ${project.budget} के बजट के अनुसार, यहाँ आपके ${project.homeType || 'घर'} के लिए स्मार्ट बंटवारा है:

💰 **निर्माण लागत वितरण:**
• संरचना और नींव: 40-45%
• दीवारें और छत: 25-30%
• फिनिशिंग कार्य: 20-25%
• इलेक्ट्रिकल और प्लंबिंग: 10-15%

📋 **सुझाव:**
• 10-15% आकस्मिक लागत रखें
• स्थानीय दरों की तुलना करें
• गुणवत्ता सामग्री चुनें
• चरणबद्ध निर्माण पर विचार करें

क्या आप किसी विशेष क्षेत्र की विस्तृत लागत जानना चाहेंगे?`;
        } else {
            return `बजट योजना के लिए मुझे आपकी परियोजना की जानकारी चाहिए।

🏠 **सामान्य बजट गाइड (प्रति वर्ग फुट):**
• बेसिक: ₹1,200-1,800
• मध्यम: ₹1,800-2,500  
• प्रीमियम: ₹2,500-4,000
• लक्जरी: ₹4,000+

💡 **बजट टिप्स:**
• पहले भूमि और अनुमति की लागत निकालें
• 15% अतिरिक्त राशि रखें
• चरणों में पैसा खर्च करें

आपका घर कितने वर्ग फुट का है?`;
        }
    } else {
        if (project && project.budget) {
            return `Based on your budget of ${project.budget}, here's a smart breakdown for your ${project.homeType || 'home'}:

💰 **Construction Cost Allocation:**
• Structure & Foundation: 40-45%
• Walls & Roofing: 25-30%
• Finishing Work: 20-25%
• Electrical & Plumbing: 10-15%

📋 **Recommendations:**
• Keep 10-15% contingency fund
• Compare local material rates
• Choose quality over quantity
• Consider phased construction

Would you like detailed costs for any specific area?`;
        } else {
            return `I'd need your project details for budget planning.

🏠 **General Budget Guide (per sq ft):**
• Basic: ₹1,200-1,800
• Standard: ₹1,800-2,500  
• Premium: ₹2,500-4,000
• Luxury: ₹4,000+

💡 **Budget Tips:**
• Factor in land and permit costs
• Keep 15% buffer for unexpected expenses
• Stagger payments by construction phases

What's your target square footage?`;
        }
    }
}n: 35-40%
• Interior & Finishing: 25-30%
• Electrical & Plumbing: 15-20%
• Architecture & Design: 8-12%
• Contingency Fund: 10-15%

💡 **Budget Optimization Tips:**
• Compare quotes from at least 3 contractors
• Buy materials directly to save 15-20%
• Plan electrical/plumbing before construction
• Use local materials to reduce transport costs

Would you like specific vendor recommendations for your location?`;
    }
    
    return `Here's a comprehensive budget planning guide for home construction:

📊 **Typical Cost Distribution:**
• Plot Development: 10-15%
• Foundation & Structure: 35-40%
• Walls & Roofing: 20-25%
• Interior & Finishing: 15-20%
• Utilities (Electrical/Plumbing): 10-15%

💰 **Per Sq Ft Estimates (Indian Market):**
• Basic Construction: ₹1,200-1,500/sq ft
• Standard Construction: ₹1,500-2,000/sq ft
• Premium Construction: ₹2,000-3,000/sq ft
• Luxury Construction: ₹3,000+/sq ft

Would you like me to create a detailed budget based on your specific requirements?`;
}

function generateDesignAdvice(project) {
    const homeType = project?.homeType || 'residential';
    const bedrooms = project?.bedrooms || '3-4';
    
    return `Great question about design! For your ${homeType} with ${bedrooms} bedrooms, here are some expert recommendations:

🏗️ **Architectural Considerations:**
• Optimize natural light with proper window placement
• Plan for cross-ventilation for climate comfort
• Design flexible spaces that can adapt over time
• Consider future expansion possibilities

📐 **Space Planning Tips:**
• Follow 60-30-10 rule for room proportions
• Ensure minimum 3-foot corridors
• Plan storage at 15-20% of total area
• Keep wet areas (kitchen/bathrooms) adjacent

🎨 **Design Elements:**
• Use neutral colors for timeless appeal
• Incorporate local architectural elements
• Plan for both artificial and natural lighting
• Consider maintenance accessibility

Would you like me to suggest specific architects in your area, or help you create a design brief?`;
}

function generateMaterialAdvice(project) {
    return `Excellent question about materials! Here's your comprehensive material guide:

🧱 **Foundation & Structure:**
• Cement: OPC 53 grade for foundation, PPC for general use
• Steel: Fe 500D TMT bars, 8mm-25mm as per requirement
• Aggregate: 20mm & 10mm graded stone, river sand
• Bricks: Fly ash bricks (eco-friendly) or red clay bricks

🏠 **Walls & Roofing:**
• Blocks: AAC blocks for better insulation
• Roofing: RCC slab or pre-cast slabs
• Waterproofing: Polymer-based solutions
• Insulation: Thermal insulation for energy efficiency

✨ **Finishing Materials:**
• Flooring: Vitrified tiles, granite, or bamboo
• Paint: Weather-resistant exterior, low-VOC interior
• Fixtures: Water-efficient sanitaryware
• Electrical: ISI marked cables and switches

💡 **Smart Shopping Tips:**
• Buy materials during off-season for discounts
• Verify ISI/BIS certifications
• Compare prices from multiple suppliers
• Consider bulk purchase for better rates

Need specific brand recommendations or quantity calculations?`;
}

function generatePermitAdvice(project) {
    const location = project?.location || 'your area';
    
    return `Important guidance on building permits and approvals for ${location}:

📋 **Essential Approvals Required:**
• Building Plan Approval from Municipal Corporation
• Environmental Clearance (if applicable)
• Fire Safety Certificate (for buildings >15m height)
• Structural Stability Certificate from Engineer

📝 **Required Documents:**
• Title deed and ownership documents
• Survey settlement records
• Site plan and building drawings
• Structural design drawings signed by engineer
• NOC from electricity/water departments

⏱️ **Typical Timeline:**
• Plan Approval: 30-60 days
• Commencement Certificate: 7-15 days
• Occupancy Certificate: 30-45 days
• Total Process: 3-4 months

💡 **Pro Tips:**
• Engage a licensed architect for drawings
• Submit complete documents to avoid delays
• Keep buffer time in your construction schedule
• Ensure compliance with local building bylaws

Would you like help finding approved architects or understanding specific requirements for ${location}?`;
}

function generateTimelineAdvice(project) {
    const projectTimeline = project?.timeline || '12-18 months';
    const homeType = project?.homeType || 'home';
    
    return `Here's a realistic timeline for your ${homeType} construction (Target: ${projectTimeline}):

📅 **Phase-wise Timeline:**

**Planning & Approvals (2-4 months):**
• Architectural design: 3-4 weeks
• Structural design: 2-3 weeks
• Government approvals: 6-8 weeks
• Contractor finalization: 2-3 weeks

**Construction Phase (8-12 months):**
• Foundation work: 3-4 weeks
• Structure (Columns, Beams, Slabs): 3-4 months
• Masonry & Roofing: 2-3 months
• Plumbing & Electrical: 1-2 months
• Finishing & Interiors: 2-3 months

**Final Phase (1-2 months):**
• Inspections & certifications
• Final touches & cleanup
• Handover & documentation

⚡ **Timeline Optimization Tips:**
• Start material procurement early
• Plan parallel activities where possible
• Keep weather factors in mind
• Maintain 15-20% buffer time

Want help creating a detailed project schedule with milestones?`;
}

function generateVastuAdvice(project) {
    return `Here are essential Vastu principles for your home construction:

🧭 **Directional Guidelines:**
• **Main Entrance:** East or North for positive energy flow
• **Kitchen:** Southeast corner (fire element placement)
• **Master Bedroom:** Southwest for stability
• **Study/Office:** Northeast or East for concentration
• **Staircase:** South or West side, clockwise direction

🏠 **Room Placement Principles:**
• Living room in North/East for social harmony
• Toilets in South/West, never in Northeast
• Water storage in Northeast corner
• Heavy furniture/storage in South/West

✨ **Design Elements:**
• Central courtyard or open space (Brahmasthan)
• Even number of doors and windows
• Avoid beam directly over bed or dining table
• Use light colors for North/East walls

🌿 **Additional Tips:**
• Plant Tulsi in Northeast garden area
• Avoid underground water tank in Southwest
• Keep Northeast corner clutter-free
• Use natural lighting in Northeast rooms

Remember: Vastu principles should complement practical design, not compromise functionality. Would you like specific Vastu advice for your floor plan?`;
}

function generateSustainabilityAdvice(project) {
    return `Excellent choice for sustainable construction! Here's your eco-friendly building guide:

🌱 **Green Building Materials:**
• **Eco Bricks:** Fly ash bricks (40% less energy than clay bricks)
• **Bamboo:** For flooring, false ceiling, temporary structures
• **Recycled Steel:** Reduces carbon footprint by 60%
• **AAC Blocks:** Better insulation, lighter weight
• **Natural Stones:** Local sourcing reduces transportation

♻️ **Energy Efficiency:**
• Solar panels for 30-50% energy needs
• LED lighting throughout (80% energy savings)
• Energy-efficient appliances (5-star rated)
• Natural ventilation design
• Proper building orientation for passive cooling

💧 **Water Conservation:**
• Rainwater harvesting system (mandatory in many cities)
• Greywater recycling for gardens
• Low-flow fixtures and dual-flush toilets
• Permeable paving for groundwater recharge

🌡️ **Climate Control:**
• Double-glazed windows for insulation
• Green roof or terrace gardens
• Cavity walls for thermal mass
• Reflective roofing materials

🏆 **Certification Benefits:**
• IGBC/GRIHA certification increases property value
• Lower utility bills (30-50% savings)
• Tax benefits in some states
• Better indoor air quality

Would you like help designing a specific sustainable feature for your home?`;
}

function generateSmartHomeAdvice(project) {
    return `Great thinking about smart home integration! Here's your comprehensive smart home guide:

🏠 **Smart Home Infrastructure:**
• **Structured Cabling:** Cat6/Cat6a for future-proofing
• **WiFi Planning:** Mesh network coverage in all areas
• **Electrical:** Smart switches, dimmers, and outlets
• **Security:** IP cameras, smart locks, video doorbells

💡 **Essential Smart Systems:**

**Lighting Automation:**
• Smart switches for remote control
• Motion sensors for automatic on/off
• Daylight sensors for energy optimization
• Scene-based lighting (dining, movie, party modes)

**Climate Control:**
• Smart thermostats for AC/heating
• Automated window blinds
• Smart fans with temperature sensors
• Zone-based climate control

**Security & Safety:**
• Smart door locks with biometric access
• CCTV with mobile monitoring
• Smart smoke & gas detectors
• Water leak sensors in wet areas

**Entertainment & Convenience:**
• Whole-home audio systems
• Smart TV integration
• Voice assistants in key areas
• Smart kitchen appliances

📱 **Integration Platforms:**
• Google Home/Amazon Alexa ecosystem
• Apple HomeKit for iOS users
• Samsung SmartThings hub
• Custom home automation systems

💰 **Budget Planning:**
• Basic automation: ₹1-2 lakhs
• Intermediate setup: ₹3-5 lakhs
• Premium smart home: ₹6-10 lakhs

Start with basic smart lighting and security, then expand gradually. Would you like specific product recommendations for your budget?`;
}

function generateGeneralAdvice(userMessage, project, isHindi = false) {
    if (isHindi) {
        return `धन्यवाद! आपके Homii AI असिस्टेंट के रूप में, मैं आपके घर निर्माण की यात्रा में हर कदम पर मदद करने के लिए यहाँ हूँ।

🏗️ **मैं इनमें आपकी सहायता कर सकता हूँ:**
• आर्किटेक्चरल डिजाइन और प्लानिंग सलाह
• निर्माण लागत अनुमान और बजटिंग
• सामग्री चयन और गुणवत्ता मार्गदर्शन
• ठेकेदार और विक्रेता सुझाव
• समयसीमा योजना और प्रोजेक्ट प्रबंधन
• भवन अनुमति और कानूनी आवश्यकताएं
• वास्तु/फेंग शुई सिद्धांत
• टिकाऊ और पर्यावरण अनुकूल निर्माण
• स्मार्ट होम टेक्नोलॉजी
• इंटीरियर डिजाइन सुझाव

💡 **लोकप्रिय प्रश्न जिनका मैं उत्तर दे सकता हूँ:**
• "मेरे निर्माण की लागत कितनी होगी?"
• "नींव के लिए कौन सी सामग्री उपयोग करूं?"
• "मेरे शहर में भवन अनुमति कैसे लें?"
• "मेरे प्लॉट के लिए वास्तु अनुकूल डिजाइन?"
• "अपना घर ऊर्जा कुशल कैसे बनाऊं?"
• "2000 वर्ग फुट घर बनने में कितना समय?"

कृपया अपने घर निर्माण प्रोजेक्ट के बारे में कुछ भी पूछने में संकोच न करें!

${project ? `\nमैं देख रहा हूँ कि आप ${project.homeType || 'घर'} का प्रोजेक्ट${project.location ? ` ${project.location} में` : ''} प्लान कर रहे हैं। आपकी विशिष्ट आवश्यकताओं के लिए व्यक्तिगत सलाह देने में खुश हूँ!` : ''}`;
    } else {
        return `Thank you for your question! As your Homii AI Assistant, I'm here to help with all aspects of your home construction journey.

🏗️ **I can assist you with:**
• Architectural design and planning advice
• Construction cost estimation and budgeting
• Material selection and quality guidance
• Contractor and vendor recommendations
• Timeline planning and project management
• Building permits and legal requirements
• Vastu/Feng Shui principles
• Sustainable and eco-friendly building practices
• Smart home technology integration
• Interior design suggestions

💡 **Popular Questions I Can Answer:**
• "How much will my construction cost?"
• "What materials should I use for my foundation?"
• "How to get building permits in [your city]?"
• "Best Vastu-compliant design for my plot?"
• "How to make my home energy-efficient?"
• "Timeline for completing a 2000 sq ft house?"

Please feel free to ask me anything specific about your home construction project. I'm here to provide expert guidance based on your unique requirements!

${project ? `\nI see you're planning a ${project.homeType || 'home'} project${project.location ? ` in ${project.location}` : ''}. Happy to provide personalized advice for your specific needs!` : ''}`;
    }
}

function scrollToBottom() {
    const chatContainer = document.getElementById('chat-messages-container');
    if (chatContainer) {
        setTimeout(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 100);
    }
}

function handleChatInputKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
}

function showChatbot() {
    showScreen('ai-chatbot-screen');
}

// Data Management Functions
function loadUserData() {
    const saved = localStorage.getItem('homii-user');
    if (saved) {
        currentUser = JSON.parse(saved);
    }
}

function saveUserData() {
    if (currentUser) {
        localStorage.setItem('homii-user', JSON.stringify(currentUser));
    }
}

function loadProjectData() {
    const saved = localStorage.getItem('homii-project');
    if (saved) {
        currentProject = JSON.parse(saved);
    }
}

function saveProjectData() {
    if (currentProject) {
        localStorage.setItem('homii-project', JSON.stringify(currentProject));
    }
}

function loadShortlistData() {
    const saved = localStorage.getItem('homii-shortlist');
    if (saved) {
        shortlistedProfessionals = JSON.parse(saved);
    }
}

function saveShortlistData() {
    localStorage.setItem('homii-shortlist', JSON.stringify(shortlistedProfessionals));
}

function loadChatHistory() {
    const saved = localStorage.getItem('homii-chat-history');
    if (saved) {
        chatHistory = JSON.parse(saved);
    }
}

function saveChatHistory() {
    localStorage.setItem('homii-chat-history', JSON.stringify(chatHistory));
}

function saveNotesData() {
    localStorage.setItem('homii-notes', JSON.stringify(projectNotes));
}

function loadNotesData() {
    const saved = localStorage.getItem('homii-notes');
    if (saved) {
        projectNotes = JSON.parse(saved);
    }
}

function updateDashboardNames() {
    if (currentUser && currentUser.name) {
        const nameElements = document.querySelectorAll('.user-name-display');
        nameElements.forEach(element => {
            element.textContent = currentUser.name;
        });
    }
    
    if (currentProject && currentProject.homeName) {
        const projectElements = document.querySelectorAll('.project-name-display');
        projectElements.forEach(element => {
            element.textContent = currentProject.homeName;
        });
    }
}

function logout() {
    currentUser = null;
    currentProject = null;
    localStorage.removeItem('homii-user');
    localStorage.removeItem('homii-project');
    showScreen('welcome');
}

function goBack() {
    // Simple back functionality - can be enhanced based on navigation history
    window.history.back();
}

function goToDesignBrief() {
    showScreen('design-brief');
}

// Missing Navigation Functions - Fix for all stuck situations
function handleBOQUpload(fileInput) {
    const file = fileInput.files[0];
    const statusElement = document.getElementById('boq-status');
    
    if (file) {
        statusElement.textContent = `✅ ${file.name} uploaded successfully`;
        statusElement.style.color = '#4CAF50';
    }
}

function selectPhase(phaseNumber) {
    // Remove active class from all phase tabs
    const allTabs = document.querySelectorAll('.phase-tab');
    allTabs.forEach(tab => tab.classList.remove('active'));
    
    // Add active class to clicked tab
    const activeTab = document.querySelector(`button[onclick="selectPhase(${phaseNumber})"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    console.log(`Selected Phase ${phaseNumber}`);
}

function openPhotoOptions() {
    const modal = document.getElementById('photo-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closePhotoModal() {
    const modal = document.getElementById('photo-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function takePhoto() {
    console.log('Taking photo...');
    closePhotoModal();
    
    // Simulate photo capture
    setTimeout(() => {
        addPhotoToGallery('📸 Camera Photo');
        enableNextButton();
    }, 1000);
}

function selectFromGallery() {
    console.log('Selecting from gallery...');
    closePhotoModal();
    
    // Create hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            addPhotoToGallery(`📱 ${file.name}`);
            enableNextButton();
        }
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}

function addPhotoToGallery(photoName) {
    const gallery = document.querySelector('.photo-grid');
    if (gallery) {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.innerHTML = `
            <div class="photo-placeholder">
                <span>📷</span>
                <p>${photoName}</p>
            </div>
        `;
        gallery.appendChild(photoItem);
    }
}

function enableNextButton() {
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.textContent = 'Next';
    }
}

function goToNext() {
    // Determine next screen based on current screen
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen) {
        const screenId = currentScreen.id;
        console.log('Current screen:', screenId);
        
        // Navigate to appropriate next screen
        if (screenId === 'site-survey') {
            showScreen('dashboard');
        } else {
            showScreen('dashboard');
        }
    }
}

function closePhotoDetailModal() {
    const modal = document.getElementById('photo-detail-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function toggleVoiceRecording() {
    const recordBtn = document.querySelector('button[onclick="toggleVoiceRecording()"]');
    if (recordBtn) {
        const isRecording = recordBtn.textContent.includes('Stop');
        
        if (isRecording) {
            recordBtn.innerHTML = '🎤 Start Recording';
            recordBtn.style.backgroundColor = '#007AFF';
            console.log('Voice recording stopped');
        } else {
            recordBtn.innerHTML = '⏹️ Stop Recording';
            recordBtn.style.backgroundColor = '#FF3B30';
            console.log('Voice recording started');
        }
    }
}

// Dashboard navigation functions
function goToCreateProject() {
    showScreen('home-details-form');
}

function goToFindContractors() {
    showScreen('find-professionals-main');
}

function goToNotes() {
    showScreen('notes-list');
}

function goToPhotos() {
    showScreen('site-survey');
}

function goToSettings() {
    showScreen('settings');
}

// Professional listing functions
function loadContractors() {
    loadProfessionals('contractors');
}

function loadInteriorDesigners() {
    loadProfessionals('interior-designers');
}

function loadOthers() {
    loadProfessionals('others');
}

// Utility Functions
function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 100);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Make all functions globally available for onclick handlers
window.showScreen = showScreen;
window.goToWelcome = goToWelcome;
window.goToLogin = goToLogin;
window.goToSignup = goToSignup;
window.goToOnboarding = goToOnboarding;
window.goToDashboard = goToDashboard;
window.goToStartProject = goToStartProject;
window.goToFindProfessionals = goToFindProfessionals;
window.goToTrackProgress = goToTrackProgress;
window.goToProjectDetails = goToProjectDetails;
window.goToUploadPhotos = goToUploadPhotos;
window.goToHomePathway = goToHomePathway;
window.goToFindArchitect = goToFindArchitect;
window.handleGoogleLogin = handleGoogleLogin;
window.handleEmailLogin = handleEmailLogin;
window.showOtherOptions = showOtherOptions;
window.handleStep1 = handleStep1;
window.handleStep2 = handleStep2;
window.handleStep3 = handleStep3;
window.handleStep4 = handleStep4;
window.shortlistArchitect = shortlistArchitect;
window.viewArchitectProfile = viewArchitectProfile;
window.saveNote = saveNote;
window.deleteNote = deleteNote;
window.loadNotesList = loadNotesList;
window.goToDesignBrief = goToDesignBrief;
window.showChatbot = showChatbot;
window.sendChatMessage = sendChatMessage;
window.handleChatInputKeyPress = handleChatInputKeyPress;
window.logout = logout;
window.goBack = goBack;

// Additional missing functions for complete navigation
window.handleBOQUpload = handleBOQUpload;
window.selectPhase = selectPhase;
window.openPhotoOptions = openPhotoOptions;
window.closePhotoModal = closePhotoModal;
window.takePhoto = takePhoto;
window.selectFromGallery = selectFromGallery;
window.goToNext = goToNext;
window.closePhotoDetailModal = closePhotoDetailModal;
window.toggleVoiceRecording = toggleVoiceRecording;
window.goToCreateProject = goToCreateProject;
window.goToFindContractors = goToFindContractors;
window.goToNotes = goToNotes;
window.goToPhotos = goToPhotos;
window.goToSettings = goToSettings;
window.loadContractors = loadContractors;
window.loadInteriorDesigners = loadInteriorDesigners;
window.loadOthers = loadOthers;

// Utility functions
window.showToast = showToast;