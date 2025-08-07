// ===== MAIN FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function () {
    // ===== ELEMENT SELECTORS =====
    const navbar = document.querySelector('.navbar');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    const themeToggleButtons = document.querySelectorAll('.theme-switch');

    // ===== NAVBAR FUNCTIONALITY =====
    function handleNavbarScroll() {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }

    function toggleMobileMenu() {
        if (mobileMenu && mobileMenuToggle) {
            mobileMenu.classList.toggle('active');
            const icon = mobileMenuToggle.querySelector('i');

            if (icon) {
                if (mobileMenu.classList.contains('active')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        }
    }

    function handleNavClick(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');

        if (targetId && targetId.startsWith('#')) {
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }

        // Close mobile menu if open
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            toggleMobileMenu();
        }

        // Update active link
        updateActiveLink(targetId);
    }

    function updateActiveLink(targetId) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === targetId) {
                link.classList.add('active');
            }
        });
    }

    function highlightActiveSection() {
        const sections = ['#home', '#features', '#contact', '#about'];
        const scrollPosition = window.scrollY + 100;

        sections.forEach(sectionId => {
            const section = document.querySelector(sectionId);
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    updateActiveLink(sectionId);
                }
            }
        });
    }

    // ===== DARK MODE FUNCTIONALITY =====
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.classList.add('theme-transitioning');
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        setTimeout(() => {
            document.documentElement.classList.remove('theme-transitioning');
        }, 300);

        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: newTheme }
        }));
    }

    function handleSystemThemeChange(e) {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
        }
    }

    // ===== EVENT LISTENERS =====

    // Scroll events
    window.addEventListener('scroll', () => {
        handleNavbarScroll();
        highlightActiveSection();
    });

    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });

    // Theme toggle buttons
    themeToggleButtons.forEach(button => {
        button.addEventListener('click', toggleTheme);
    });

    // System theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemThemeChange);

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
        if (navbar && mobileMenu && !navbar.contains(e.target) && mobileMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    });

    // ===== INITIALIZATION =====
    console.log('Initializing LEX website...');
    console.log('Mobile menu toggle:', mobileMenuToggle);
    console.log('Theme toggle buttons:', themeToggleButtons.length);

    initializeTheme();
    handleNavbarScroll();
    updateActiveLink('#home');

    console.log('LEX website initialized successfully!');
});

// ===== HERO SECTION FUNCTIONALITY =====
class HeroSlideshow {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.isPlaying = true;

        this.init();
    }

    init() {
        if (this.slides.length === 0) return;

        this.setupSlideImages();
        this.bindEvents();
        this.startAutoplay();
        this.initGSAPAnimations();
    }

    setupSlideImages() {
        // Preload images for smooth transitions
        this.slides.forEach(slide => {
            const img = slide.querySelector('.slide-image');
            if (img && img.src) {
                const preloadImg = new Image();
                preloadImg.src = img.src;
            }
        });
    }

    bindEvents() {
        // Indicator clicks
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToSlide(index);
                this.resetAutoplay();
            });
        });

        // Pause on hover
        const slideshowContainer = document.querySelector('.slideshow-container');
        if (slideshowContainer) {
            slideshowContainer.addEventListener('mouseenter', () => {
                this.pauseAutoplay();
            });

            slideshowContainer.addEventListener('mouseleave', () => {
                this.resumeAutoplay();
            });
        }

        // Touch/swipe support
        this.addTouchSupport();
    }

    addTouchSupport() {
        const container = document.querySelector('.slideshow-container');
        if (!container) return;

        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        container.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;

            const deltaX = endX - startX;
            const deltaY = endY - startY;

            // Only trigger if horizontal swipe is more significant than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.previousSlide();
                } else {
                    this.nextSlide();
                }
                this.resetAutoplay();
            }
        });
    }

    goToSlide(index) {
        if (index === this.currentSlide) return;

        // Remove active class from current slide and indicator
        this.slides[this.currentSlide].classList.remove('active');
        this.indicators[this.currentSlide].classList.remove('active');

        // Add active class to new slide and indicator
        this.currentSlide = index;
        this.slides[this.currentSlide].classList.add('active');
        this.indicators[this.currentSlide].classList.add('active');

        // Animate slide transition with GSAP
        this.animateSlideTransition();
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }

    previousSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }

    animateSlideTransition() {
        const currentSlide = this.slides[this.currentSlide];
        const slideImage = currentSlide.querySelector('.slide-image');
        const slideContent = currentSlide.querySelector('.slide-content');

        if (window.gsap) {
            // Animate the slide image
            if (slideImage) {
                gsap.fromTo(slideImage,
                    {
                        scale: 1.2,
                        opacity: 0.8
                    },
                    {
                        scale: 1.05,
                        opacity: 1,
                        duration: 1.2,
                        ease: "power2.out"
                    }
                );
            }

            // Animate the slide content
            if (slideContent) {
                gsap.fromTo(slideContent,
                    {
                        y: 30,
                        opacity: 0
                    },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        delay: 0.3,
                        ease: "power2.out"
                    }
                );
            }
        }
    }

    startAutoplay() {
        this.slideInterval = setInterval(() => {
            if (this.isPlaying) {
                this.nextSlide();
            }
        }, 4000);
    }

    pauseAutoplay() {
        this.isPlaying = false;
    }

    resumeAutoplay() {
        this.isPlaying = true;
    }

    resetAutoplay() {
        clearInterval(this.slideInterval);
        this.startAutoplay();
    }

    initGSAPAnimations() {
        if (!window.gsap) return;

        // Animate floating elements
        const floatingElements = document.querySelectorAll('.float-element');
        floatingElements.forEach((element, index) => {
            gsap.to(element, {
                y: -20,
                rotation: 360,
                duration: 3 + index,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut",
                delay: index * 0.5
            });
        });

        // Animate hero content on scroll
        gsap.registerPlugin(ScrollTrigger);

        gsap.fromTo('.hero-content > *',
            {
                opacity: 0,
                y: 50
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.hero-content',
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }
}

// ===== HERO INTERACTIONS =====
class HeroInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.setupButtonAnimations();
        this.setupStatsCounter();
        this.setupParallaxEffect();
    }

    setupButtonAnimations() {
        const ctaButtons = document.querySelectorAll('.cta-primary, .cta-secondary');

        ctaButtons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (window.gsap) {
                    gsap.to(button, {
                        scale: 1.05,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });

            button.addEventListener('mouseleave', () => {
                if (window.gsap) {
                    gsap.to(button, {
                        scale: 1,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });

            button.addEventListener('click', (e) => {
                // Create ripple effect
                this.createRippleEffect(e, button);
            });
        });
    }

    createRippleEffect(e, button) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    setupStatsCounter() {
        const statNumbers = document.querySelectorAll('.stat-number');

        statNumbers.forEach(stat => {
            const finalValue = stat.textContent;
            const numericValue = parseInt(finalValue.replace(/\D/g, ''));

            if (numericValue && window.gsap) {
                const counter = { value: 0 };

                gsap.to(counter, {
                    value: numericValue,
                    duration: 2,
                    ease: "power2.out",
                    onUpdate: () => {
                        const currentValue = Math.floor(counter.value);
                        if (finalValue.includes('K')) {
                            stat.textContent = currentValue + 'K+';
                        } else if (finalValue.includes('★')) {
                            stat.textContent = (currentValue / 10).toFixed(1) + '★';
                        } else {
                            stat.textContent = currentValue + '+';
                        }
                    },
                    scrollTrigger: {
                        trigger: stat,
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                });
            }
        });
    }

    setupParallaxEffect() {
        if (!window.gsap) return;

        const heroVisual = document.querySelector('.hero-visual');
        const heroContent = document.querySelector('.hero-content');

        if (heroVisual && heroContent) {
            gsap.to(heroVisual, {
                yPercent: -20,
                ease: "none",
                scrollTrigger: {
                    trigger: '.hero-section',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });

            gsap.to(heroContent, {
                yPercent: -10,
                ease: "none",
                scrollTrigger: {
                    trigger: '.hero-section',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }
    }
}

// ===== INITIALIZE HERO FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function () {
    // Wait for GSAP to load
    const initHero = () => {
        new HeroSlideshow();
        new HeroInteractions();
        console.log('Hero section initialized successfully!');
    };

    if (window.gsap) {
        initHero();
    } else {
        // Fallback if GSAP doesn't load
        setTimeout(initHero, 100);
    }
});

// ===== CSS ANIMATIONS FOR RIPPLE EFFECT =====
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== FOOTER FUNCTIONALITY =====
class FooterAccordion {
    constructor() {
        this.accordions = document.querySelectorAll('.footer-nav-accordion');
        this.init();
    }
    
    init() {
        if (this.accordions.length === 0) return;
        
        this.accordions.forEach(accordion => {
            const toggle = accordion.querySelector('.accordion-toggle');
            const content = accordion.querySelector('.accordion-content');
            
            if (!toggle || !content) return;
            
            // Set initial state
            content.style.height = '0px';
            content.style.overflow = 'hidden';
            
            toggle.addEventListener('click', () => {
                this.toggleAccordion(toggle, content);
            });
            
            // Keyboard support
            toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleAccordion(toggle, content);
                }
            });
        });
    }
    
    toggleAccordion(toggle, content) {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        
        // Update ARIA state
        toggle.setAttribute('aria-expanded', !isExpanded);
        
        if (isExpanded) {
            // Collapse
            content.style.height = '0px';
            content.classList.remove('active');
        } else {
            // Expand
            const scrollHeight = content.scrollHeight;
            content.style.height = scrollHeight + 'px';
            content.classList.add('active');
            
            // Reset height to auto after animation
            setTimeout(() => {
                if (content.classList.contains('active')) {
                    content.style.height = 'auto';
                }
            }, 300);
        }
    }
}

// ===== FOOTER ANIMATIONS =====
class FooterAnimations {
    constructor() {
        this.footerSection = document.querySelector('.footer-section');
        this.init();
    }
    
    init() {
        if (!this.footerSection) return;
        
        this.setupScrollAnimations();
        this.setupProductCarousel();
    }
    
    setupScrollAnimations() {
        // Use Intersection Observer for performance
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateFooterEntrance();
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        observer.observe(this.footerSection);
    }
    
    animateFooterEntrance() {
        const footerColumns = document.querySelectorAll('.footer-container > *');
        
        footerColumns.forEach((column, index) => {
            column.style.opacity = '0';
            column.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                column.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                column.style.opacity = '1';
                column.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    setupProductCarousel() {
        const productGrid = document.querySelector('.featured-products-grid');
        if (!productGrid || window.innerWidth > 768) return;
        
        // Add smooth scrolling for mobile carousel
        productGrid.style.scrollBehavior = 'smooth';
        
        // Optional: Add scroll snap for better UX
        productGrid.style.scrollSnapType = 'x mandatory';
        
        const products = productGrid.querySelectorAll('.featured-product');
        products.forEach(product => {
            product.style.scrollSnapAlign = 'start';
        });
    }
}

// ===== FOOTER SOCIAL TRACKING =====
class FooterTracking {
    constructor() {
        this.init();
    }
    
    init() {
        this.trackSocialClicks();
        this.trackProductClicks();
        this.trackNavigationClicks();
    }
    
    trackSocialClicks() {
        const socialLinks = document.querySelectorAll('.footer-social .social-icon');
        
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const platform = this.getSocialPlatform(link.href);
                console.log(`Footer social click: ${platform}`);
                
                // Analytics tracking (replace with your analytics service)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'social_click', {
                        social_platform: platform,
                        location: 'footer'
                    });
                }
            });
        });
    }
    
    trackProductClicks() {
        const productButtons = document.querySelectorAll('.product-cta');
        
        productButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productName = button.closest('.featured-product')
                    ?.querySelector('.product-name')?.textContent || 'Unknown';
                
                console.log(`Footer product click: ${productName}`);
                
                // Analytics tracking
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'product_click', {
                        product_name: productName,
                        location: 'footer'
                    });
                }
            });
        });
    }
    
    trackNavigationClicks() {
        const navLinks = document.querySelectorAll('.footer-nav-list a, .legal-links a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const linkText = link.textContent.trim();
                console.log(`Footer navigation click: ${linkText}`);
                
                // Analytics tracking
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'footer_navigation', {
                        link_text: linkText,
                        link_url: link.href
                    });
                }
            });
        });
    }
    
    getSocialPlatform(url) {
        if (url.includes('instagram')) return 'instagram';
        if (url.includes('tiktok')) return 'tiktok';
        if (url.includes('twitter') || url.includes('x.com')) return 'twitter';
        if (url.includes('youtube')) return 'youtube';
        return 'unknown';
    }
}

// ===== ABOUT SECTION FUNCTIONALITY =====
class AboutSectionAnimations {
    constructor() {
        this.aboutSection = document.querySelector('.about-section');
        this.init();
    }
    
    init() {
        if (!this.aboutSection) return;
        
        this.setupScrollAnimations();
        this.setupDifferentiatorAnimations();
        this.setupStoryToggle();
    }
    
    setupScrollAnimations() {
        // Use Intersection Observer for performance
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateAboutEntrance();
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });
        
        observer.observe(this.aboutSection);
    }
    
    animateAboutEntrance() {
        // Header entrance animation
        const headerElements = document.querySelectorAll('.about-header > *');
        headerElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(50px)';
            
            setTimeout(() => {
                element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200);
        });
        
        // Differentiator items staggered animation
        const differentiatorItems = document.querySelectorAll('.differentiator-item');
        differentiatorItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(40px) scale(0.95)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0) scale(1)';
            }, 400 + (index * 150));
        });
    }
    
    setupDifferentiatorAnimations() {
        // Icon hover animations
        const differentiatorIcons = document.querySelectorAll('.differentiator-icon');
        
        differentiatorIcons.forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                if (window.gsap) {
                    gsap.to(icon, {
                        scale: 1.1,
                        rotation: 5,
                        duration: 0.3,
                        ease: "back.out(1.7)"
                    });
                } else {
                    // Fallback CSS animation
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                }
            });
            
            icon.addEventListener('mouseleave', () => {
                if (window.gsap) {
                    gsap.to(icon, {
                        scale: 1,
                        rotation: 0,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                } else {
                    // Fallback CSS animation
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });
    }
    
    setupStoryToggle() {
        const toggle = document.querySelector('.story-toggle');
        const content = document.querySelector('.story-content');
        const icon = document.querySelector('.story-toggle-icon');
        
        if (!toggle || !content) return;
        
        // Set initial state
        content.style.height = '0px';
        content.style.overflow = 'hidden';
        content.style.opacity = '0';
        
        toggle.addEventListener('click', () => {
            this.toggleStory(toggle, content, icon);
        });
        
        // Keyboard support
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleStory(toggle, content, icon);
            }
        });
    }
    
    toggleStory(toggle, content, icon) {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        
        // Update ARIA state
        toggle.setAttribute('aria-expanded', !isExpanded);
        
        if (isExpanded) {
            // Collapse
            content.style.height = '0px';
            content.style.opacity = '0';
            content.classList.remove('active');
            
            if (icon) {
                icon.style.transform = 'rotate(0deg)';
            }
        } else {
            // Expand
            content.classList.add('active');
            const scrollHeight = content.scrollHeight;
            content.style.height = scrollHeight + 'px';
            content.style.opacity = '1';
            
            if (icon) {
                icon.style.transform = 'rotate(180deg)';
            }
            
            // Reset height to auto after animation
            setTimeout(() => {
                if (content.classList.contains('active')) {
                    content.style.height = 'auto';
                }
            }, 400);
        }
    }
}

// ===== ABOUT SECTION TRACKING =====
class AboutSectionTracking {
    constructor() {
        this.init();
    }
    
    init() {
        this.trackDifferentiatorInteractions();
        this.trackStoryToggle();
        this.trackCTAClicks();
    }
    
    trackDifferentiatorInteractions() {
        const differentiatorItems = document.querySelectorAll('.differentiator-item');
        
        differentiatorItems.forEach((item, index) => {
            const title = item.querySelector('.differentiator-title')?.textContent || `Differentiator ${index + 1}`;
            
            item.addEventListener('mouseenter', () => {
                console.log(`About differentiator hover: ${title}`);
                
                // Analytics tracking
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'about_differentiator_hover', {
                        differentiator_name: title,
                        differentiator_position: index + 1
                    });
                }
            });
        });
    }
    
    trackStoryToggle() {
        const storyToggle = document.querySelector('.story-toggle');
        
        if (storyToggle) {
            storyToggle.addEventListener('click', () => {
                const isExpanded = storyToggle.getAttribute('aria-expanded') === 'true';
                const action = isExpanded ? 'collapse' : 'expand';
                
                console.log(`About story ${action}`);
                
                // Analytics tracking
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'about_story_toggle', {
                        action: action,
                        section: 'about'
                    });
                }
            });
        }
    }
    
    trackCTAClicks() {
        const ctaLink = document.querySelector('.about-cta-link');
        
        if (ctaLink) {
            ctaLink.addEventListener('click', (e) => {
                const ctaText = ctaLink.querySelector('.cta-text')?.textContent || 'About CTA';
                
                console.log(`About CTA click: ${ctaText}`);
                
                // Analytics tracking
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'about_cta_click', {
                        cta_text: ctaText,
                        destination: ctaLink.href
                    });
                }
            });
        }
    }
}

// ===== INITIALIZE FOOTER FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function () {
    // Initialize footer components
    new FooterAccordion();
    new FooterAnimations();
    new FooterTracking();
    
    console.log('Footer functionality initialized successfully!');
});

// ===== INITIALIZE ABOUT FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function () {
    // Initialize about section after a short delay to ensure DOM is ready
    setTimeout(() => {
        new AboutSectionAnimations();
        new AboutSectionTracking();
        console.log('About section functionality initialized successfully!');
    }, 100);
});
// ===== FEATURES SECTION FUNCTIONALITY =====
class FeaturesSection {
    constructor() {
        this.featureCards = document.querySelectorAll('.feature-card');
        this.featuresSection = document.querySelector('.features-section');
        this.init();
    }

    init() {
        if (!this.featuresSection) return;

        this.setupScrollAnimations();
        this.setupInteractiveEffects();
        this.setupAccessibility();
    }

    setupScrollAnimations() {
        if (!window.gsap || !window.ScrollTrigger) return;

        // Animate features header
        gsap.fromTo('.features-header',
            {
                opacity: 0,
                y: 30
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.features-section',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        // Animate feature cards with stagger
        gsap.fromTo('.feature-card',
            {
                opacity: 0,
                y: 40,
                scale: 0.95
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                stagger: 0.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.features-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }

    setupInteractiveEffects() {
        this.featureCards.forEach(card => {
            // Enhanced hover effects with GSAP
            card.addEventListener('mouseenter', () => {
                if (window.gsap) {
                    const icon = card.querySelector('.feature-icon');
                    const headline = card.querySelector('.feature-headline');

                    gsap.to(card, {
                        y: -8,
                        duration: 0.3,
                        ease: "power2.out"
                    });

                    gsap.to(icon, {
                        scale: 1.1,
                        duration: 0.3,
                        ease: "back.out(1.7)"
                    });

                    gsap.to(headline, {
                        color: "var(--brand-green)",
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                if (window.gsap) {
                    const icon = card.querySelector('.feature-icon');
                    const headline = card.querySelector('.feature-headline');

                    gsap.to(card, {
                        y: 0,
                        duration: 0.3,
                        ease: "power2.out"
                    });

                    gsap.to(icon, {
                        scale: 1,
                        duration: 0.3,
                        ease: "power2.out"
                    });

                    gsap.to(headline, {
                        color: "var(--text-primary)",
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });

            // Touch feedback for mobile
            card.addEventListener('touchstart', () => {
                if (window.gsap) {
                    gsap.to(card, {
                        scale: 0.98,
                        duration: 0.1,
                        ease: "power2.out"
                    });
                }
            });

            card.addEventListener('touchend', () => {
                if (window.gsap) {
                    gsap.to(card, {
                        scale: 1,
                        duration: 0.2,
                        ease: "power2.out"
                    });
                }
            });
        });
    }

    setupAccessibility() {
        // Make cards focusable and add keyboard navigation
        this.featureCards.forEach((card, index) => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Feature ${index + 1}: ${card.querySelector('.feature-headline').textContent}`);

            // Keyboard interaction
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // Trigger a subtle animation to show interaction
                    if (window.gsap) {
                        gsap.to(card, {
                            scale: 0.95,
                            duration: 0.1,
                            yoyo: true,
                            repeat: 1,
                            ease: "power2.inOut"
                        });
                    }
                }
            });
        });
    }
}

// ===== FEATURES INTERSECTION OBSERVER =====
class FeaturesObserver {
    constructor() {
        this.featuresSection = document.querySelector('.features-section');
        this.init();
    }

    init() {
        if (!this.featuresSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });

        observer.observe(this.featuresSection);
    }

    animateCounters() {
        // Animate any numbers in the feature descriptions
        const descriptions = document.querySelectorAll('.feature-description');

        descriptions.forEach(desc => {
            const text = desc.textContent;
            const numbers = text.match(/\d+/g);

            if (numbers && window.gsap) {
                numbers.forEach(num => {
                    const numValue = parseInt(num);
                    const counter = { value: 0 };

                    gsap.to(counter, {
                        value: numValue,
                        duration: 1.5,
                        ease: "power2.out",
                        onUpdate: () => {
                            const currentValue = Math.floor(counter.value);
                            desc.innerHTML = text.replace(num, currentValue);
                        }
                    });
                });
            }
        });
    }
}

// ===== INITIALIZE FEATURES FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function () {
    // Initialize features section after a short delay to ensure GSAP is loaded
    setTimeout(() => {
        new FeaturesSection();
        new FeaturesObserver();
        console.log('Features section initialized successfully!');
    }, 200);
});
// ===== ENHANCED FEATURES SECTION FUNCTIONALITY =====
class EnhancedFeaturesSection {
    constructor() {
        this.featureCards = document.querySelectorAll('.feature-card');
        this.featuresSection = document.querySelector('.features-section');
        this.init();
    }

    init() {
        if (!this.featuresSection) return;

        this.setupScrollAnimations();
        this.setupCardInteractions();
        this.setupSpecialEffects();
    }

    setupScrollAnimations() {
        if (!window.gsap || !window.ScrollTrigger) return;

        // Animate features header with enhanced effect
        gsap.fromTo('.features-header',
            {
                opacity: 0,
                y: 50,
                scale: 0.9
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.features-section',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        // Animate different card types with unique effects
        this.featureCards.forEach((card, index) => {
            const cardType = this.getCardType(card);
            const animation = this.getCardAnimation(cardType, index);

            gsap.fromTo(card, animation.from, {
                ...animation.to,
                scrollTrigger: {
                    trigger: card,
                    start: 'top 90%',
                    toggleActions: 'play none none reverse'
                }
            });
        });
    }

    getCardType(card) {
        if (card.classList.contains('feature-card--image')) return 'image';
        if (card.classList.contains('feature-card--icon')) return 'icon';
        if (card.classList.contains('feature-card--gradient')) return 'gradient';
        if (card.classList.contains('feature-card--minimal')) return 'minimal';
        if (card.classList.contains('feature-card--eco')) return 'eco';
        if (card.classList.contains('feature-card--tech')) return 'tech';
        return 'default';
    }

    getCardAnimation(type, index) {
        const baseDelay = index * 0.15;

        const animations = {
            image: {
                from: { opacity: 0, scale: 1.1, rotationY: -15 },
                to: { opacity: 1, scale: 1, rotationY: 0, duration: 1, delay: baseDelay, ease: "power2.out" }
            },
            icon: {
                from: { opacity: 0, y: 50, rotationZ: -10 },
                to: { opacity: 1, y: 0, rotationZ: 0, duration: 0.8, delay: baseDelay, ease: "back.out(1.7)" }
            },
            gradient: {
                from: { opacity: 0, x: -50, skewX: 5 },
                to: { opacity: 1, x: 0, skewX: 0, duration: 0.9, delay: baseDelay, ease: "power2.out" }
            },
            minimal: {
                from: { opacity: 0, scale: 0.8 },
                to: { opacity: 1, scale: 1, duration: 0.7, delay: baseDelay, ease: "power2.out" }
            },
            eco: {
                from: { opacity: 0, y: 30, rotationX: 15 },
                to: { opacity: 1, y: 0, rotationX: 0, duration: 0.8, delay: baseDelay, ease: "power2.out" }
            },
            tech: {
                from: { opacity: 0, x: 50, rotationY: 15 },
                to: { opacity: 1, x: 0, rotationY: 0, duration: 0.9, delay: baseDelay, ease: "power2.out" }
            }
        };

        return animations[type] || animations.default || {
            from: { opacity: 0, y: 40 },
            to: { opacity: 1, y: 0, duration: 0.8, delay: baseDelay, ease: "power2.out" }
        };
    }

    setupCardInteractions() {
        this.featureCards.forEach(card => {
            const cardType = this.getCardType(card);

            card.addEventListener('mouseenter', () => {
                this.handleCardHover(card, cardType, true);
            });

            card.addEventListener('mouseleave', () => {
                this.handleCardHover(card, cardType, false);
            });

            // Touch interactions for mobile
            card.addEventListener('touchstart', () => {
                this.handleCardTouch(card, cardType, true);
            });

            card.addEventListener('touchend', () => {
                this.handleCardTouch(card, cardType, false);
            });
        });
    }

    handleCardHover(card, type, isHover) {
        if (!window.gsap) return;

        const hoverEffects = {
            image: () => {
                const img = card.querySelector('.feature-bg-image');
                gsap.to(img, {
                    scale: isHover ? 1.1 : 1,
                    duration: 0.6,
                    ease: "power2.out"
                });
            },
            icon: () => {
                const icon = card.querySelector('.feature-icon-large');
                gsap.to(icon, {
                    scale: isHover ? 1.1 : 1,
                    rotation: isHover ? 5 : 0,
                    duration: 0.4,
                    ease: "back.out(1.7)"
                });
            },
            gradient: () => {
                const gradientBg = card.querySelector('.gradient-bg');
                gsap.to(gradientBg, {
                    scale: isHover ? 1.05 : 1,
                    duration: 0.5,
                    ease: "power2.out"
                });
            },
            tech: () => {
                const scanLine = card.querySelector('.scan-line');
                if (isHover && scanLine) {
                    gsap.to(scanLine, {
                        left: '100%',
                        duration: 0.8,
                        ease: "power2.inOut"
                    });
                }
            }
        };

        if (hoverEffects[type]) {
            hoverEffects[type]();
        }

        // Common hover effect for all cards
        gsap.to(card, {
            y: isHover ? -8 : 0,
            duration: 0.3,
            ease: "power2.out"
        });
    }

    handleCardTouch(card, type, isTouch) {
        if (!window.gsap) return;

        gsap.to(card, {
            scale: isTouch ? 0.98 : 1,
            duration: 0.1,
            ease: "power2.out"
        });
    }

    setupSpecialEffects() {
        // Animate tech scan lines continuously
        const techCards = document.querySelectorAll('.feature-card--tech');
        techCards.forEach(card => {
            const scanLine = card.querySelector('.scan-line');
            if (scanLine && window.gsap) {
                gsap.to(scanLine, {
                    left: '100%',
                    duration: 2,
                    ease: "power2.inOut",
                    repeat: -1,
                    repeatDelay: 3
                });
            }
        });

        // Animate eco patterns
        const ecoPatterns = document.querySelectorAll('.eco-pattern');
        ecoPatterns.forEach(pattern => {
            if (window.gsap) {
                gsap.to(pattern, {
                    rotation: 360,
                    duration: 20,
                    ease: "none",
                    repeat: -1
                });
            }
        });

        // Pulse effect for icon glows
        const iconGlows = document.querySelectorAll('.icon-glow');
        iconGlows.forEach(glow => {
            if (window.gsap) {
                gsap.to(glow, {
                    opacity: 0.6,
                    scale: 1.1,
                    duration: 2,
                    ease: "power2.inOut",
                    yoyo: true,
                    repeat: -1
                });
            }
        });
    }
}

// ===== FEATURES METRICS COUNTER =====
class FeaturesMetricsCounter {
    constructor() {
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateMetrics(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        // Observe metric values
        document.querySelectorAll('.metric-value, .stat').forEach(el => {
            observer.observe(el);
        });
    }

    animateMetrics(element) {
        if (!window.gsap) return;

        const text = element.textContent;
        const number = text.match(/\d+/);

        if (number) {
            const targetValue = parseInt(number[0]);
            const counter = { value: 0 };

            gsap.to(counter, {
                value: targetValue,
                duration: 2,
                ease: "power2.out",
                onUpdate: () => {
                    const currentValue = Math.floor(counter.value);
                    element.textContent = text.replace(number[0], currentValue);
                }
            });
        }
    }
}

// ===== INITIALIZE ENHANCED FEATURES =====
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        new EnhancedFeaturesSection();
        new FeaturesMetricsCounter();
        console.log('Enhanced features section initialized!');
    }, 300);
});
// // ====
// = CONTACT SECTION FUNCTIONALITY =====
class ContactSection {
    constructor() {
        this.faqItems = document.querySelectorAll('.faq-item');
        this.contactForm = document.querySelector('.contact-form');
        this.chatWidget = document.querySelector('.start-chat-btn');
        this.socialLinks = document.querySelectorAll('.social-link');
        this.quickLinks = document.querySelectorAll('.quick-link');

        this.init();
    }

    init() {
        this.setupFAQAccordion();
        this.setupFormValidation();
        this.setupChatWidget();
        this.setupSocialTracking();
        this.setupScrollAnimations();
    }

    // FAQ Accordion functionality
    setupFAQAccordion() {
        console.log('Setting up FAQ accordion, found items:', this.faqItems.length);

        this.faqItems.forEach((item, index) => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            console.log(`FAQ item ${index}:`, { question: !!question, answer: !!answer });

            if (question && answer) {
                question.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('FAQ question clicked:', question.querySelector('span').textContent);

                    const isExpanded = question.getAttribute('aria-expanded') === 'true';

                    // Close all other FAQ items
                    this.faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            const otherQuestion = otherItem.querySelector('.faq-question');
                            const otherAnswer = otherItem.querySelector('.faq-answer');

                            if (otherQuestion && otherAnswer) {
                                otherQuestion.setAttribute('aria-expanded', 'false');
                                otherAnswer.classList.remove('active');
                            }
                        }
                    });

                    // Toggle current item
                    if (isExpanded) {
                        question.setAttribute('aria-expanded', 'false');
                        answer.classList.remove('active');
                        console.log('FAQ closed');
                    } else {
                        question.setAttribute('aria-expanded', 'true');
                        answer.classList.add('active');
                        console.log('FAQ opened');

                        // Track FAQ interaction
                        this.trackEvent('faq_expand', {
                            question: question.querySelector('span').textContent
                        });
                    }
                });

                // Keyboard accessibility
                question.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        question.click();
                    }
                });
            } else {
                console.warn(`FAQ item ${index} missing elements:`, { question: !!question, answer: !!answer });
            }
        });
    }

    // Form validation and submission
    setupFormValidation() {
        if (!this.contactForm) return;

        const inputs = this.contactForm.querySelectorAll('input, select, textarea');
        const submitBtn = this.contactForm.querySelector('.contact-submit-btn');

        // Real-time validation
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Form submission
        this.contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error
        this.clearFieldError(field);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Select validation
        if (field.tagName === 'SELECT' && !value) {
            isValid = false;
            errorMessage = 'Please select an option';
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.style.borderColor = 'var(--error)';

        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: var(--error);
            font-size: var(--text-sm);
            margin-top: var(--space-1);
            animation: fadeInUp 0.3s ease-out;
        `;

        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    handleFormSubmission() {
        const formData = new FormData(this.contactForm);
        const submitBtn = this.contactForm.querySelector('.contact-submit-btn');
        const originalText = submitBtn.innerHTML;

        // Validate all fields
        const inputs = this.contactForm.querySelectorAll('input, select, textarea');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showFormMessage('Please correct the errors above', 'error');
            return;
        }

        // Show loading state
        submitBtn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;

        // Simulate form submission (replace with actual service integration)
        setTimeout(() => {
            // Track form submission
            this.trackEvent('contact_form_submit', {
                inquiry_type: formData.get('inquiry_type')
            });

            // Show success message
            this.showFormMessage('Message sent successfully! We\'ll get back to you soon.', 'success');

            // Reset form
            this.contactForm.reset();

            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }

    showFormMessage(message, type) {
        // Remove existing message
        const existingMessage = this.contactForm.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageElement = document.createElement('div');
        messageElement.className = `form-message form-message--${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            padding: var(--space-3) var(--space-4);
            border-radius: var(--radius-lg);
            margin-top: var(--space-4);
            font-size: var(--text-sm);
            font-weight: var(--font-weight-medium);
            animation: fadeInUp 0.3s ease-out;
            ${type === 'success' ? `
                background: var(--success-light);
                color: var(--success);
                border: 1px solid var(--success);
            ` : `
                background: var(--error-light);
                color: var(--error);
                border: 1px solid var(--error);
            `}
        `;

        this.contactForm.appendChild(messageElement);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
    }

    // Chat widget functionality
    setupChatWidget() {
        if (!this.chatWidget) return;

        this.chatWidget.addEventListener('click', () => {
            // Track chat widget interaction
            this.trackEvent('live_chat_open');

            // Simulate chat opening (replace with actual chat service)
            this.showChatMessage('Chat feature coming soon! Please use the contact form for now.');
        });
    }

    showChatMessage(message) {
        const chatPreview = document.querySelector('.chat-preview');
        if (chatPreview) {
            const originalContent = chatPreview.innerHTML;
            chatPreview.innerHTML = `<p style="color: var(--brand-green); font-weight: var(--font-weight-medium);">${message}</p>`;

            setTimeout(() => {
                chatPreview.innerHTML = originalContent;
            }, 3000);
        }
    }

    // Social media tracking
    setupSocialTracking() {
        this.socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const platform = link.querySelector('span').textContent.toLowerCase();
                this.trackEvent('social_click', { platform });
            });
        });

        this.quickLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const linkText = link.querySelector('span').textContent;
                this.trackEvent('quick_link_click', { link: linkText });
            });
        });
    }

    // Scroll animations
    setupScrollAnimations() {
        if (!window.gsap || !window.ScrollTrigger) return;

        // Animate contact header
        gsap.fromTo('.contact-header',
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.contact-section',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        // Animate contact content with stagger
        gsap.fromTo('.contact-left > *, .contact-right > *',
            { opacity: 0, y: 40 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.contact-content',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        // Animate FAQ section
        gsap.fromTo('.faq-item',
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.faq-section',
                    start: 'top 90%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }

    // Event tracking helper
    trackEvent(eventName, parameters = {}) {
        // Google Analytics 4 / GTM tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                page_location: window.location.href,
                ...parameters
            });
        }

        // Console log for development
        console.log('Event tracked:', eventName, parameters);
    }
}

// ===== INITIALIZE CONTACT SECTION =====
document.addEventListener('DOMContentLoaded', function () {
    // Initialize contact section after a short delay to ensure all elements are loaded
    setTimeout(() => {
        new ContactSection();
        console.log('Contact section initialized successfully!');
    }, 500);
});
// 
// ===== ACCESSIBILITY ENHANCEMENTS =====
class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupFormAccessibility();
        this.setupFocusManagement();
        this.setupAriaLiveRegions();
        this.setupKeyboardNavigation();
    }

    setupFormAccessibility() {
        const form = document.querySelector('.contact-form');
        if (!form) return;

        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            // Add aria-describedby for error messages
            input.addEventListener('invalid', (e) => {
                e.preventDefault();
                input.setAttribute('aria-invalid', 'true');

                // Create or update error message
                const errorId = `${input.id}-error`;
                let errorElement = document.getElementById(errorId);

                if (!errorElement) {
                    errorElement = document.createElement('div');
                    errorElement.id = errorId;
                    errorElement.className = 'field-error';
                    errorElement.setAttribute('role', 'alert');
                    input.parentNode.appendChild(errorElement);
                    input.setAttribute('aria-describedby', errorId);
                }

                errorElement.textContent = input.validationMessage;
            });

            input.addEventListener('input', () => {
                if (input.checkValidity()) {
                    input.setAttribute('aria-invalid', 'false');
                    const errorElement = document.getElementById(`${input.id}-error`);
                    if (errorElement) {
                        errorElement.remove();
                        input.removeAttribute('aria-describedby');
                    }
                }
            });
        });
    }

    setupFocusManagement() {
        // Trap focus in modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal-overlay');
                if (modal && modal.style.display !== 'none') {
                    this.trapFocus(e, modal);
                }
            }
        });

        // Skip link functionality
        this.addSkipLink();
    }

    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#contact';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to contact section';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    setupAriaLiveRegions() {
        // Create live region for dynamic announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);

        // Announce form submission status
        const form = document.querySelector('.contact-form');
        if (form) {
            form.addEventListener('submit', () => {
                this.announce('Form submitted. Please wait...');
            });
        }
    }

    announce(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;

            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation for FAQ
        const faqQuestions = document.querySelectorAll('.faq-question');

        faqQuestions.forEach((question, index) => {
            question.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        const nextQuestion = faqQuestions[index + 1];
                        if (nextQuestion) nextQuestion.focus();
                        break;

                    case 'ArrowUp':
                        e.preventDefault();
                        const prevQuestion = faqQuestions[index - 1];
                        if (prevQuestion) prevQuestion.focus();
                        break;

                    case 'Home':
                        e.preventDefault();
                        faqQuestions[0].focus();
                        break;

                    case 'End':
                        e.preventDefault();
                        faqQuestions[faqQuestions.length - 1].focus();
                        break;
                }
            });
        });
    }
}

// Initialize accessibility manager
document.addEventListener('DOMContentLoaded', function () {
    new AccessibilityManager();
    console.log('Accessibility features initialized!');
});// ==
// === SPAM PROTECTION =====
class SpamProtection {
    constructor() {
        this.submissionTimes = [];
        this.maxSubmissions = 3;
        this.timeWindow = 300000; // 5 minutes
        this.init();
    }

    init() {
        this.setupHoneypotProtection();
        this.setupRateLimiting();
        this.setupBotDetection();
    }

    setupHoneypotProtection() {
        const honeypotField = document.querySelector('input[name="website"]');
        if (honeypotField) {
            // If honeypot field is filled, it's likely a bot
            honeypotField.addEventListener('input', () => {
                console.warn('Honeypot field filled - potential spam detected');
                this.blockSubmission('Spam detected');
            });
        }
    }

    setupRateLimiting() {
        const form = document.querySelector('.contact-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            if (!this.checkRateLimit()) {
                e.preventDefault();
                this.blockSubmission('Too many submissions. Please wait before trying again.');
                return false;
            }

            // Record submission time
            this.submissionTimes.push(Date.now());
            this.cleanOldSubmissions();
        });
    }

    checkRateLimit() {
        this.cleanOldSubmissions();
        return this.submissionTimes.length < this.maxSubmissions;
    }

    cleanOldSubmissions() {
        const now = Date.now();
        this.submissionTimes = this.submissionTimes.filter(
            time => now - time < this.timeWindow
        );
    }

    setupBotDetection() {
        let mouseMovements = 0;
        let keystrokes = 0;
        let formFocused = false;

        // Track human-like behavior
        document.addEventListener('mousemove', () => {
            mouseMovements++;
        });

        document.addEventListener('keydown', () => {
            keystrokes++;
        });

        const form = document.querySelector('.contact-form');
        if (form) {
            form.addEventListener('focusin', () => {
                formFocused = true;
            });

            form.addEventListener('submit', (e) => {
                // Basic bot detection - real users typically move mouse and type
                if (mouseMovements < 5 && keystrokes < 10 && !formFocused) {
                    e.preventDefault();
                    this.blockSubmission('Please interact with the form naturally');
                    return false;
                }
            });
        }
    }

    blockSubmission(message) {
        const form = document.querySelector('.contact-form');
        if (form) {
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'spam-error';
            errorDiv.style.cssText = `
                background: var(--error-light);
                color: var(--error);
                padding: var(--space-3) var(--space-4);
                border-radius: var(--radius-lg);
                margin-top: var(--space-4);
                font-size: var(--text-sm);
                font-weight: var(--font-weight-medium);
                border: 1px solid var(--error);
            `;
            errorDiv.textContent = message;

            // Remove existing error
            const existingError = form.querySelector('.spam-error');
            if (existingError) {
                existingError.remove();
            }

            form.appendChild(errorDiv);

            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, 5000);
        }

        console.warn('Form submission blocked:', message);
    }
}

// Initialize spam protection
document.addEventListener('DOMContentLoaded', function () {
    new SpamProtection();
    console.log('Spam protection initialized!');
});

// ===== WORKING FAQ ACCORDION =====
function initFAQAccordion() {
    console.log('Initializing FAQ accordion...');

    const faqItems = document.querySelectorAll('.faq-item');
    console.log('Found FAQ items:', faqItems.length);

    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (question && answer) {
            console.log(`Setting up FAQ ${index + 1}`);

            question.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                console.log('FAQ clicked:', question.querySelector('span').textContent);

                const isCurrentlyOpen = answer.classList.contains('active');

                // Close all FAQ answers
                document.querySelectorAll('.faq-answer').forEach(ans => {
                    ans.classList.remove('active');
                });

                document.querySelectorAll('.faq-question').forEach(q => {
                    q.setAttribute('aria-expanded', 'false');
                });

                // Toggle current FAQ
                if (!isCurrentlyOpen) {
                    answer.classList.add('active');
                    question.setAttribute('aria-expanded', 'true');
                    console.log('FAQ opened');
                } else {
                    console.log('FAQ closed');
                }
            });

            // Keyboard support
            question.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    question.click();
                }
            });
        }
    });
}

// Initialize FAQ when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(initFAQAccordion, 1000);
});

// Also try immediately if DOM is already loaded
if (document.readyState === 'complete') {
    initFAQAccordion();
}