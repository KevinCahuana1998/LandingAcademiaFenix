/**
 * ============================================
 * ACADEMIA FENIX - LANDING PAGE JAVASCRIPT
 * Main functionality for the SPA
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initCarousel();
    initActiveNavHighlight();
});

/**
 * ============================================
 * MOBILE MENU FUNCTIONALITY
 * Toggle hamburger menu on mobile devices
 * ============================================
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerIcon = menuToggle.querySelector('.hamburger-icon');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    // Toggle menu on button click
    menuToggle.addEventListener('click', function() {
        const isOpen = !mobileMenu.classList.contains('hidden');
        
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu when clicking on a nav link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = mobileMenu.contains(event.target);
        const isClickOnToggle = menuToggle.contains(event.target);
        
        if (!isClickInsideMenu && !isClickOnToggle && !mobileMenu.classList.contains('hidden')) {
            closeMenu();
        }
    });

    // Helper functions
    function openMenu() {
        mobileMenu.classList.remove('hidden');
        hamburgerIcon.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
        mobileMenu.classList.add('hidden');
        hamburgerIcon.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
}

/**
 * ============================================
 * SMOOTH SCROLL NAVIGATION
 * Smooth scroll to sections when clicking nav links
 * ============================================
 */
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    const navbar = document.getElementById('navbar');
    const navbarHeight = navbar.offsetHeight;

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const targetPosition = targetSection.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * ============================================
 * SCROLL ANIMATIONS
 * Animate sections when they enter the viewport
 * Using Intersection Observer API
 * ============================================
 */
function initScrollAnimations() {
    const animatedSections = document.querySelectorAll('.animate-section');
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // Show all sections immediately if reduced motion is preferred
        animatedSections.forEach(section => {
            section.classList.add('visible');
        });
        return;
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optionally unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedSections.forEach(section => {
        observer.observe(section);
    });
}

/**
 * ============================================
 * TESTIMONIAL CAROUSEL
 * Image carousel with arrows and autoplay
 * ============================================
 */
function initCarousel() {
    const track = document.getElementById('carousel-track');
    const slides = track.querySelectorAll('.carousel-slide');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const indicatorsContainer = document.getElementById('carousel-indicators');
    
    let currentIndex = 0;
    let autoplayInterval = null;
    const totalSlides = slides.length;
    const autoplayDelay = 5000; // 5 seconds

    // Generate indicators dynamically
    indicatorsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
        const indicator = document.createElement('button');
        indicator.className = `carousel-indicator w-3 h-3 rounded-full transition-all duration-300 ${i === 0 ? 'bg-primary-500' : 'bg-gray-300'}`;
        indicator.setAttribute('data-index', i);
        indicator.setAttribute('aria-label', `Ir al testimonio ${i + 1}`);
        indicator.addEventListener('click', function() {
            currentIndex = i;
            updateCarousel();
            resetAutoplay();
        });
        indicatorsContainer.appendChild(indicator);
    }

    // Get dynamically created indicators
    const indicators = indicatorsContainer.querySelectorAll('.carousel-indicator');

    // Initialize carousel
    updateCarousel();
    startAutoplay();

    // Previous button click
    prevBtn.addEventListener('click', function() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
        resetAutoplay();
    });

    // Next button click
    nextBtn.addEventListener('click', function() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
        resetAutoplay();
    });

    // Pause autoplay on hover
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    // Touch support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
    }, { passive: true });

    track.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoplay();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - go to next
                currentIndex = (currentIndex + 1) % totalSlides;
            } else {
                // Swipe right - go to previous
                currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            }
            updateCarousel();
        }
    }

    // Update carousel position and indicators
    function updateCarousel() {
        const translateX = -currentIndex * 100;
        track.style.transform = `translateX(${translateX}%)`;
        
        // Update indicators
        indicators.forEach((indicator, index) => {
            if (index === currentIndex) {
                indicator.classList.add('active', 'bg-primary-500');
                indicator.classList.remove('bg-gray-300');
            } else {
                indicator.classList.remove('active', 'bg-primary-500');
                indicator.classList.add('bg-gray-300');
            }
        });
    }

    // Autoplay functions
    function startAutoplay() {
        if (autoplayInterval) return;
        autoplayInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateCarousel();
        }, autoplayDelay);
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }

    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    // Keyboard navigation for accessibility
    document.addEventListener('keydown', function(e) {
        // Only respond if carousel is in viewport
        const carouselRect = track.getBoundingClientRect();
        const inViewport = (
            carouselRect.top >= 0 &&
            carouselRect.bottom <= window.innerHeight
        );
        
        if (inViewport) {
            if (e.key === 'ArrowLeft') {
                currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                updateCarousel();
                resetAutoplay();
            } else if (e.key === 'ArrowRight') {
                currentIndex = (currentIndex + 1) % totalSlides;
                updateCarousel();
                resetAutoplay();
            }
        }
    });
}

/**
 * ============================================
 * ACTIVE NAV HIGHLIGHT
 * Highlight current section in navigation
 * ============================================
 */
function initActiveNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');
    const navbarHeight = navbar.offsetHeight;

    function highlightNav() {
        const scrollPosition = window.scrollY + navbarHeight + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Initial check
    highlightNav();
    
    // Update on scroll with throttling for performance
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                highlightNav();
                ticking = false;
            });
            ticking = true;
        }
    });
}

/**
 * ============================================
 * NAVBAR SCROLL EFFECT
 * Add shadow/background change on scroll
 * ============================================
 */
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    
    if (window.scrollY > 50) {
        navbar.classList.add('shadow-lg');
    } else {
        navbar.classList.remove('shadow-lg');
    }
});
