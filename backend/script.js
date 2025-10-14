// Energy Waves One-Page Website JavaScript

// Global variables
let scrollTimeout;
const body = document.body;

// Wave animation on scroll
function handleScroll() {
    // Add scrolling class to trigger animation
    body.classList.add('scrolling');
    
    // Clear existing timeout
    clearTimeout(scrollTimeout);
    
    // Remove scrolling class after scroll stops
    scrollTimeout = setTimeout(() => {
        body.classList.remove('scrolling');
    }, 300); // Increased timeout for better effect
}

// Enhanced scroll handler for both page changes and wave animations
function handleEnhancedScroll() {
    // Trigger wave animations
    handleScroll();
    
    // Get current scroll position
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Calculate which section is currently in view using Intersection Observer
    const sections = document.querySelectorAll('.section');
    let currentSection = null;
    
    sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionBottom = rect.bottom;
        const viewportMiddle = windowHeight / 2;
        
        // Check if section is in the middle of viewport
        if (sectionTop <= viewportMiddle && sectionBottom >= viewportMiddle) {
            currentSection = index;
        }
    });
    
    // Add visual feedback for current section
    sections.forEach((section, index) => {
        if (index === currentSection) {
            section.classList.add('active');
            // Update URL hash without triggering scroll
            const sectionId = section.id;
            if (sectionId && window.location.hash !== '#' + sectionId) {
                history.replaceState(null, null, '#' + sectionId);
            }
        } else {
            section.classList.remove('active');
        }
    });
    
    // Debug log (remove in production)
    if (currentSection !== null) {
        console.log('Current section:', currentSection, sections[currentSection].id);
    }
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll animations
function animateOnScroll() {
    const elements = document.querySelectorAll('.section-title, .section-subtitle, .about-card, .calendar-item, .blog-card, .contact-form');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animate');
        }
    });
}

// Intersection Observer for better performance
function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.section-title, .section-subtitle, .about-card, .calendar-item, .blog-card, .contact-form').forEach(el => {
        observer.observe(el);
    });
}

// Contact form handling
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We\'ll get back to you soon.');
            this.reset();
        });
    }
}

// Navigation menu functionality
function initNavigation() {
    // Add click handlers for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
        });
    });
}

// Initialize all functionality when DOM is loaded
function init() {
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize intersection observer
    initIntersectionObserver();
    
    // Initialize contact form
    initContactForm();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize animations on page load
    animateOnScroll();
}

// Event listeners
function addEventListeners() {
    // Listen for scroll events with enhanced functionality
    window.addEventListener('scroll', handleEnhancedScroll);
    window.addEventListener('scroll', animateOnScroll);
    
    // Also listen for wheel events for better responsiveness
    window.addEventListener('wheel', handleEnhancedScroll);
    
    // Listen for touch events on mobile
    window.addEventListener('touchmove', handleEnhancedScroll);
    
    // Initialize on page load
    window.addEventListener('load', init);
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}

// Start the application
addEventListeners();

// Export functions for potential external use
window.EnergyWaves = {
    handleScroll,
    handleEnhancedScroll,
    animateOnScroll,
    init
};
