document.addEventListener('DOMContentLoaded', function() {

    // --- GESTION DES TRADUCTIONS ---

    const langFrBtn = document.getElementById('lang-fr');
    const langEnBtn = document.getElementById('lang-en');


    const setLanguage = async (lang) => {
        try {
            const response = await fetch(`./lang/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Impossible de charger le fichier ${lang}.json`);
            }
            const translations = await response.json();

            document.querySelectorAll('[data-key]').forEach(element => {
                const key = element.getAttribute('data-key');
                if (translations[key]) {
                    element.innerHTML = translations[key];
                }
            });

            const cvLink = document.getElementById('cv-download-link');
            if (cvLink && translations.cvPath) {
                cvLink.href = translations.cvPath;
                cvLink.setAttribute('download', translations.cvFileName);
            }
            
            document.documentElement.lang = lang;

            if (lang === 'en') {
                langFrBtn.classList.remove('active');
                langEnBtn.classList.add('active');
            } else {
                langEnBtn.classList.remove('active');
                langFrBtn.classList.add('active');
            }

            localStorage.setItem('language', lang);

        } catch (error) {
            console.error("Erreur lors du chargement de la langue:", error);
        }
    };

    // Listeners pour les boutons
    langFrBtn.addEventListener('click', () => setLanguage('fr'));
    langEnBtn.addEventListener('click', () => setLanguage('en'));
    
    // Chargement initial au démarrage
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);

    
    // --- GESTION MENU MOBILE ---

    const navToggle = document.querySelector('.nav-toggle');
    const navLinksList = document.querySelectorAll('.nav-links a');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            document.body.classList.toggle('nav-open');
            const isOpen = document.body.classList.contains('nav-open');
            navToggle.setAttribute('aria-expanded', isOpen);
            navToggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
        });
    }

    navLinksList.forEach(link => {
        link.addEventListener('click', () => {
            document.body.classList.remove('nav-open');
            if (navToggle) {
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.setAttribute('aria-label', 'Ouvrir le menu');
            }
        });
    });


    // --- ANIMATIONS "FADE IN" ---

    const fadeElems = document.querySelectorAll('.fade-in');
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    fadeElems.forEach(elem => observer.observe(elem));


    // --- SUIVI DE SECTION ACTIVE DANS LA NAV ---

    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    const headerHeight = document.querySelector('header').offsetHeight + 50; 

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - headerHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // --- ANIMATION DES BARRES DE COMPÉTENCES ---
    const skillBars = document.querySelectorAll('.bar-fill');

    const skillsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const level = bar.getAttribute('data-level');
                if (level) {
                    bar.style.width = level + '%';
                }
                observer.unobserve(bar); 
            }
        });
    }, {
        threshold: 0.7 
    });

    skillBars.forEach(bar => {
        skillsObserver.observe(bar);
    });

});

// --- GESTION DES FILTRES PORTFOLIO ---
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Gestion de la classe active
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
            // Récupère les catégories de la carte (ex: "web data")
            const cardCategories = card.getAttribute('data-category');

            if (filterValue === 'all' || cardCategories.includes(filterValue)) {
                card.classList.remove('hide');
                card.classList.add('show');
            } else {
                card.classList.add('hide');
                card.classList.remove('show');
            }
        });
    });
});
