// Navigation Component for Energy Waves Website

// Navigation data structure
const navigationData = {
    logo: {
        text: "Energy Waves",
        href: "#home"
    },
    menuItems: [
        {
            text: "Home",
            href: "#home",
            active: true
        },
        {
            text: "About", 
            href: "#about",
            active: false
        },
        {
            text: "Calendar",
            href: "#calendar", 
            active: false
        },
        {
            text: "Blog",
            href: "#blog",
            active: false
        },
        {
            text: "Contact",
            href: "#contact",
            active: false
        }
    ]
};

// Create navigation HTML structure
function createNavigationHTML() {
    return `
        <nav class="navbar">
            <div class="nav-container">
                <ul class="nav-menu">
                    ${navigationData.menuItems.map(item => `
                        <li class="nav-item">
                            <a href="${item.href}" class="nav-link ${item.active ? 'active' : ''}" data-section="${item.href.replace('#', '')}">
                                ${item.text}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </nav>
    `;
}

// Update active navigation item based on current section
function updateActiveNavigation(currentSectionId) {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkSection = link.getAttribute('data-section');
        
        if (linkSection === currentSectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Initialize navigation functionality
function initNavigation() {
    // Add click handlers for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get target section
            const targetSection = this.getAttribute('data-section');
            const targetElement = document.getElementById(targetSection);
            
            if (targetElement) {
                // Smooth scroll to section
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active state
                updateActiveNavigation(targetSection);
                
                // Update URL hash
                history.pushState(null, null, '#' + targetSection);
            }
        });
    });
    
    // Listen for scroll events to update active navigation
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('.section');
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        
        let currentSection = null;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionBottom = rect.bottom;
            const viewportMiddle = windowHeight / 2;
            
            if (sectionTop <= viewportMiddle && sectionBottom >= viewportMiddle) {
                currentSection = section.id;
            }
        });
        
        if (currentSection) {
            updateActiveNavigation(currentSection);
        }
    });
}

// Mobile menu toggle functionality (for future enhancement)
function initMobileMenu() {
    // This can be expanded for mobile hamburger menu
    const navContainer = document.querySelector('.nav-container');
    
    // Add mobile menu button if needed
    if (window.innerWidth <= 768) {
        // Mobile menu logic can be added here
        console.log('Mobile menu initialization');
    }
}

// Navigation utility functions
const NavigationUtils = {
    // Get current active section
    getCurrentSection: function() {
        const sections = document.querySelectorAll('.section');
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        
        let currentSection = null;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionBottom = rect.bottom;
            const viewportMiddle = windowHeight / 2;
            
            if (sectionTop <= viewportMiddle && sectionBottom >= viewportMiddle) {
                currentSection = section.id;
            }
        });
        
        return currentSection;
    },
    
    // Scroll to specific section
    scrollToSection: function(sectionId) {
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            updateActiveNavigation(sectionId);
        }
    },
    
    // Update navigation based on scroll position
    updateOnScroll: function() {
        const currentSection = this.getCurrentSection();
        if (currentSection) {
            updateActiveNavigation(currentSection);
        }
    }
};

// Export navigation functions
window.Navigation = {
    createNavigationHTML,
    updateActiveNavigation,
    initNavigation,
    initMobileMenu,
    NavigationUtils,
    navigationData
};

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}
