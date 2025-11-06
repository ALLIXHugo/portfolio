document.addEventListener('DOMContentLoaded', function() {

    const translations = {
        fr: {
            metaTitle: "Hugo ALLIX - Étudiant en Gestion de Données",
            navAbout: "À propos",
            navEducation: "Formations",
            navExperience: "Expériences",
            navPortfolio: "Portfolio",
            navContact: "Contact",
            cvButton: "Télécharger mon CV",
            cvPath: "assets/cv/CV-Hugo-Allix-FR.pdf",
            cvFileName: "CV-Hugo-Allix-FR.pdf",
            heroTitle: "Hugo ALLIX",
            heroSubtitle: "Étudiant en gestion & exploitation de données.",
            heroButton: "Découvrir mes projets",
            aboutTitle: "À Propos",
            aboutImgAlt: "Photo de Hugo ALLIX",
            aboutHeadline: "La même rigueur, du sport aux données.",
            aboutP1: "Le trail et le cyclisme m'ont appris la discipline et la persévérance. J'applique cette même mentalité à mes études : être méthodique, structuré et aller au bout des projets, peu importe la complexité.",
            aboutP2: "Je suis actuellement en parcours \"Administration, Gestion et Exploitation de Données\". Ce qui me plaît, c'est de construire des systèmes de données fiables. Je me spécialise donc en administration de BDD (SQL, PostgreSQL) tout en explorant l'analyse de données.",
            
            educationTitle: "Formations",
            edu1Date: "2024 - Présent",
            edu1Title: "BUT Informatique (Bac+3)",
            edu1School: "Université Savoie Mont-Blanc, IUT d'Annecy",
            edu1Desc: "Parcours \"Administration, Gestion et Exploitation de Données\". Deuxième année en cours.",
            edu2Date: "2021 - 2024",
            edu2Title: "Baccalauréat Français STI2D",
            edu2School: "Lycée International de Ferney-Voltaire",
            edu2Desc: "Option Systèmes d'Information et Numérique (SIN). Obtenu avec Mention Très Bien.",
    
            experienceTitle: "Expériences",
            exp1Date: "Oct. 2025 - Jan. 2026",
            exp1Title: "Développement d'une Application Client (SAE)",
            exp1Company: "IUT d'Annecy",
            exp1Desc: "Conception d'une application complète en équipe, de l'analyse des besoins à la sécurisation des données, en passant par l'optimisation de la base de données.",
            exp2Date: "Mars - Mai 2025",
            exp2Title: "Création d'une Base de Données (SAE)",
            exp2Company: "IUT d'Annecy",
            exp2Desc: "Conception et exploitation d'une base de données PostgreSQL en groupe. Modélisation, scripting SQL et création de rapports Power BI.",
            exp3Date: "Mars - Mai 2022",
            exp3Title: "Aide aux Devoirs",
            exp3Company: "CSC Les Libellules, Gex",
            exp3Desc: "Accompagnement hebdomadaire d'élèves en difficulté, développement de compétences pédagogiques et création d'un climat de confiance.",
    
            portfolioTitle: "Mes Projets Universitaires",
            dateLabel: "Date :",
            typeLabel: "Type :",
            techLabel: "Technologie :",
            contextLabel: "Contexte :",
            accessButton: "Accéder",
    
            project1Title: "Jeu 'Chicken Catch'",
            project1Subtitle: "Un jeu de scoring simple et addictif.",
            project1Date: "Déc. 2024",
            project1Type: "Jeu-Vidéo",
            project1Tech: "C# (WPF)",
            project1Context: "Projet Universitaire (SAE101)",
            
            project2Title: "Système de Gestion 'Nicolas'",
            project2Subtitle: "Application de gestion pour les caves Nicolas.",
            project2Date: "Mai 2025",
            project2Type: "Application de bureau",
            project2Tech: "UML, SGBD (PostgreSQL), C#",
            project2Context: "Projet Universitaire (SAE201)",
    
            referencesTitle: "Références",
            ref1Name: "Pascal COLIN",
            ref1Title: "Professeur d'UML et SQL",
            ref1Location: "IUT Annecy, Annecy (74)",
            ref1Email: "pascal.colin@univ-smb.fr",
            ref1Phone: "+33 4 50 66 60 05",
            ref2Name: "Benoit DIARD",
            ref2Title: "Professeur de programmation",
            ref2Location: "IUT Annecy, Annecy (74)",
            ref2Email: "benoit.diard@univ-smb.fr",
            ref2Phone: "+33 4 50 09 23 48",
    
            contactTitle: "Contact",
            contactIntro: "Prêt à explorer des données, discuter d'une opportunité ou d'un projet ? Contactez-moi.",
            contactButton: "Envoyez-moi un email",
            footerText: "&copy; 2025 Hugo ALLIX."
        },
        en: {
            metaTitle: "Hugo ALLIX - Data Management Student",
            navAbout: "About",
            navEducation: "Education",
            navExperience: "Experience",
            navPortfolio: "Portfolio",
            navContact: "Contact",
            cvButton: "Download my CV",
            cvPath: "assets/cv/CV-Hugo-Allix-EN.pdf",
            cvFileName: "CV-Hugo-Allix-EN.pdf",
            heroTitle: "Hugo ALLIX",
            heroSubtitle: "Data management & operations student.",
            heroButton: "Discover my projects",
            aboutTitle: "About Me",
            aboutImgAlt: "Photo of Hugo ALLIX",
            aboutHeadline: "The same rigor, from sports to data.",
            aboutP1: "Trail running and cycling have taught me discipline and perseverance. I apply this same mentality to my studies: being methodical, structured, and seeing projects through to the end, regardless of their complexity.",
            aboutP2: "I am currently in the \"Data Administration, Management, and Operations\" program. What I enjoy is building reliable data systems. I'm specializing in database administration (SQL, PostgreSQL) while also exploring data analysis.",

            educationTitle: "Education",
            edu1Date: "2024 - Present",
            edu1Title: "BUT in Computer Science (Technical Degree)",
            edu1School: "University Savoie Mont-Blanc, IUT of Annecy",
            edu1Desc: "Specialization in 'Data Administration, Management, and Operations'. Currently in second year.",
            edu2Date: "2021 - 2024",
            edu2Title: "French Baccalaureate STI2D",
            edu2School: "Lycée International de Ferney-Voltaire",
            edu2Desc: "Information and Digital Systems (SIN) option. Graduated with High Honors.",
    
            experienceTitle: "Experience",
            exp1Date: "Oct 2025 - Jan 2026",
            exp1Title: "Client Application Development (SAE Project)",
            exp1Company: "IUT of Annecy",
            exp1Desc: "Team-based design of a complete application, from requirements analysis to data security and database optimization.",
            exp2Date: "March - May 2025",
            exp2Title: "Database Creation (SAE Project)",
            exp2Company: "IUT of Annecy",
            exp2Desc: "Group design and operation of a PostgreSQL database. Included data modeling, SQL scripting, and creating Power BI reports.",
            exp3Date: "March - May 2022",
            exp3Title: "Homework Tutoring",
            exp3Company: "CSC Les Libellules, Gex",
            exp3Desc: "Weekly support for students facing academic challenges, developing pedagogical skills and building a trusting learning environment.",
    
            portfolioTitle: "My University Projects",
            dateLabel: "Date:",
            typeLabel: "Type:",
            techLabel: "Technology:",
            contextLabel: "Context:",
            accessButton: "Access",
    
            project1Title: "'Chicken Catch' Game",
            project1Subtitle: "A simple and addictive scoring game.",
            project1Date: "Dec 2024",
            project1Type: "Video Game",
            project1Tech: "C# (WPF)",
            project1Context: "University Project (1st Sem.)",
    
            project2Title: "'Nicolas' Management System",
            project2Subtitle: "Management application for Nicolas wine shops.",
            project2Date: "May 2025",
            project2Type: "Desktop Application",
            project2Tech: "UML, DBMS (PostgreSQL), C#",
            project2Context: "University Project (2nd Sem.)",
            
            referencesTitle: "References",
            ref1Name: "Pascal COLIN",
            ref1Title: "UML and SQL Professor",
            ref1Location: "IUT Annecy, Annecy (74)",
            ref1Email: "pascal.colin@univ-smb.fr",
            ref1Phone: "+33 4 50 66 60 05",
            ref2Name: "Benoit DIARD",
            ref2Title: "Programming Professor",
            ref2Location: "IUT Annecy, Annecy (74)",
            ref2Email: "benoit.diard@univ-smb.fr",
            ref2Phone: "+33 4 50 09 23 48",
    
            contactTitle: "Contact",
            contactIntro: "Ready to explore data, discuss an opportunity, or a project? Let's connect.",
            contactButton: "Send me an email",
            footerText: "&copy; 2025 Hugo ALLIX."
        }
    };

    // --- Le reste du code JS pour gérer la langue et les animations ---
    // (colle ici le reste de ton fichier main.js)
    const langFrBtn = document.getElementById('lang-fr');
    const langEnBtn = document.getElementById('lang-en');
    const cvDownloadLink = document.getElementById('cv-download-link');

    const setLanguage = (lang) => {
        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.getAttribute('data-key');
            if (translations[lang][key]) {
                element.innerHTML = translations[lang][key];
            }
        });

        const cvLink = document.getElementById('cv-download-link');
        if(cvLink) {
          cvLink.href = translations[lang].cvPath;
          cvLink.setAttribute('download', translations[lang].cvFileName);
        }
        
        document.documentElement.lang = lang;

        if (lang === 'fr') {
            langFrBtn.classList.add('active');
            langEnBtn.classList.remove('active');
        } else {
            langEnBtn.classList.add('active');
            langFrBtn.classList.remove('active');
        }
        localStorage.setItem('language', lang);
    };

    langFrBtn.addEventListener('click', () => setLanguage('fr'));
    langEnBtn.addEventListener('click', () => setLanguage('en'));
    const savedLang = localStorage.getItem('language') || 'fr';
    setLanguage(savedLang);

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

    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - (document.querySelector('header').offsetHeight + 50)) {
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
});

document.querySelectorAll('[data-key]').forEach(element => {
    const key = element.getAttribute('data-key');
    if (translations[lang][key]) {
        element.innerHTML = translations[lang][key];
    }
});
