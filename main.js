/* =====================================================================
   PORTFOLIO HUGO ALLIX - main.js
   1. Utilitaires              6. Compteurs
   2. Relief topographique     7. Apparitions au défilement
   3. Traductions (FR / EN)    8. Défilement (header, parallaxe, nav)
   4. Thème clair / sombre     9. Menu mobile
   5. Texte tournant du hero  10. Filtres + fenêtre de détail
   ===================================================================== */
(function () {
    'use strict';

    /* ---------- 1. UTILITAIRES ---------- */
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // localStorage peut être bloqué (navigation privée, etc.) : on ne plante jamais
    const store = {
        get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
        set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* rien */ } }
    };

    const escapeHtml = (str) => str.replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));


    /* ---------- 2. RELIEF TOPOGRAPHIQUE ----------
       Un "terrain" est calculé à partir d'une graine (texte) : quelques sommets
       gaussiens + des ondulations. Les courbes de niveau sont extraites avec
       l'algorithme des "marching squares", puis lissées. Même graine = même dessin. */

    function hashString(str) {
        let h = 1779033703 ^ str.length;
        for (let i = 0; i < str.length; i++) {
            h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
            h = (h << 13) | (h >>> 19);
        }
        return h >>> 0;
    }

    function seededRandom(seed) {
        let a = hashString(seed);
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function buildTerrain(seed, w, h, cols, rows, peakCount) {
        const rand = seededRandom(seed);
        const size = Math.max(w, h);
        const peaks = [];
        for (let i = 0; i < peakCount; i++) {
            peaks.push({
                x: (rand() * 1.1 - 0.05) * w,
                y: (rand() * 1.1 - 0.05) * h,
                a: 0.55 + rand() * 0.7,
                s: (0.14 + rand() * 0.22) * size
            });
        }
        const waves = [];
        for (let i = 0; i < 4; i++) {
            const k = 1 + rand() * 3;
            const angle = rand() * Math.PI;
            waves.push({
                fx: Math.cos(angle) * k * 2 * Math.PI / size,
                fy: Math.sin(angle) * k * 2 * Math.PI / size,
                p: rand() * Math.PI * 2,
                a: 0.04 + rand() * 0.06
            });
        }
        const dx = w / cols, dy = h / rows;
        const grid = [];
        let min = Infinity, max = -Infinity;
        for (let j = 0; j <= rows; j++) {
            const row = new Float64Array(cols + 1);
            for (let i = 0; i <= cols; i++) {
                const x = i * dx, y = j * dy;
                let v = 0;
                for (const p of peaks) {
                    const d2 = (x - p.x) ** 2 + (y - p.y) ** 2;
                    v += p.a * Math.exp(-d2 / (2 * p.s * p.s));
                }
                for (const wv of waves) v += wv.a * Math.sin(wv.fx * x + wv.fy * y + wv.p);
                row[i] = v;
                if (v < min) min = v;
                if (v > max) max = v;
            }
            grid.push(row);
        }
        return { grid, cols, rows, dx, dy, min, max, w, h };
    }

    // Segments d'une courbe de niveau (marching squares)
    function isoSegments(t, level) {
        const { grid, cols, rows, dx, dy } = t;
        const segs = [];
        const lerp = (a, b) => (level - a) / (b - a);
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                const tl = grid[j][i], tr = grid[j][i + 1], br = grid[j + 1][i + 1], bl = grid[j + 1][i];
                const idx = (tl >= level ? 8 : 0) | (tr >= level ? 4 : 0) | (br >= level ? 2 : 0) | (bl >= level ? 1 : 0);
                if (idx === 0 || idx === 15) continue;
                const x0 = i * dx, y0 = j * dy;
                const T = () => [x0 + dx * lerp(tl, tr), y0];
                const R = () => [x0 + dx, y0 + dy * lerp(tr, br)];
                const B = () => [x0 + dx * lerp(bl, br), y0 + dy];
                const L = () => [x0, y0 + dy * lerp(tl, bl)];
                switch (idx) {
                    case 1: case 14: segs.push([L(), B()]); break;
                    case 2: case 13: segs.push([B(), R()]); break;
                    case 3: case 12: segs.push([L(), R()]); break;
                    case 4: case 11: segs.push([T(), R()]); break;
                    case 6: case 9: segs.push([T(), B()]); break;
                    case 7: case 8: segs.push([L(), T()]); break;
                    case 5: segs.push([L(), T()], [B(), R()]); break;
                    case 10: segs.push([T(), R()], [L(), B()]); break;
                }
            }
        }
        return segs;
    }

    // Recolle les segments en lignes continues pour pouvoir les lisser
    function chainSegments(segs) {
        const key = (p) => p[0].toFixed(2) + ',' + p[1].toFixed(2);
        const byPoint = new Map();
        segs.forEach((s, idx) => {
            [0, 1].forEach((end) => {
                const k = key(s[end]);
                if (!byPoint.has(k)) byPoint.set(k, []);
                byPoint.get(k).push(idx);
            });
        });
        const used = new Uint8Array(segs.length);
        const lines = [];
        const extend = (line, atEnd) => {
            for (;;) {
                const tip = atEnd ? line[line.length - 1] : line[0];
                const next = (byPoint.get(key(tip)) || []).find((i) => !used[i]);
                if (next === undefined) return;
                used[next] = 1;
                const s = segs[next];
                const other = key(s[0]) === key(tip) ? s[1] : s[0];
                if (atEnd) line.push(other); else line.unshift(other);
            }
        };
        segs.forEach((s, idx) => {
            if (used[idx]) return;
            used[idx] = 1;
            const line = [s[0], s[1]];
            extend(line, true);
            extend(line, false);
            lines.push(line);
        });
        return lines;
    }

    // Ligne lissée : courbes quadratiques passant par le milieu des segments
    function smoothPath(pts) {
        const f = (n) => n.toFixed(1);
        if (pts.length < 3) return 'M' + pts.map((p) => f(p[0]) + ' ' + f(p[1])).join('L');
        let d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
        for (let i = 1; i < pts.length - 1; i++) {
            const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
            d += 'Q' + f(pts[i][0]) + ' ' + f(pts[i][1]) + ' ' + f(mx) + ' ' + f(my);
        }
        const last = pts[pts.length - 1];
        return d + 'L' + f(last[0]) + ' ' + f(last[1]);
    }

    function topoSVG(opts) {
        const { seed, w, h, cols, rows, levels = 14, peaks = 3, majorEvery = 4,
                minorWidth = 0.8, majorWidth = 1.5, summit = null, className = '' } = opts;
        const t = buildTerrain(seed, w, h, cols, rows, peaks);
        let minor = '', major = '';
        for (let k = 0; k < levels; k++) {
            const level = t.min + (k + 0.5) * (t.max - t.min) / levels;
            const d = chainSegments(isoSegments(t, level)).map(smoothPath).join('');
            if (k % majorEvery === majorEvery - 1) major += d; else minor += d;
        }

        // Sommet le plus haut, cherché dans la partie droite pour ne pas gêner l'icône
        let summitMarkup = '';
        if (summit) {
            let best = -Infinity, sx = 0, sy = 0;
            for (let j = Math.round(rows * 0.22); j <= Math.round(rows * 0.72); j++) {
                for (let i = Math.round(cols * 0.42); i <= Math.round(cols * 0.86); i++) {
                    if (t.grid[j][i] > best) { best = t.grid[j][i]; sx = i * t.dx; sy = j * t.dy; }
                }
            }
            const right = sx < w - 70;
            const tx = right ? sx + 16 : sx - 16;
            summitMarkup =
                '<g class="cover-summit">' +
                    '<circle class="halo" cx="' + sx.toFixed(1) + '" cy="' + (sy - 2).toFixed(1) + '" r="13"/>' +
                    '<polygon points="' + (sx - 7).toFixed(1) + ',' + (sy + 4).toFixed(1) + ' ' + sx.toFixed(1) + ',' + (sy - 8).toFixed(1) + ' ' + (sx + 7).toFixed(1) + ',' + (sy + 4).toFixed(1) + '"/>' +
                    '<text x="' + tx.toFixed(1) + '" y="' + (sy + 1).toFixed(1) + '" text-anchor="' + (right ? 'start' : 'end') + '" dominant-baseline="middle">' + escapeHtml(String(summit)) + '</text>' +
                '</g>';
        }

        return '<svg class="' + className + '" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid slice" ' +
            'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
            '<path class="minor" stroke-width="' + minorWidth + '" vector-effect="non-scaling-stroke" d="' + minor + '"/>' +
            '<path class="major" stroke-width="' + majorWidth + '" vector-effect="non-scaling-stroke" d="' + major + '"/>' +
            summitMarkup + '</svg>';
    }

    function drawTopography() {
        // Fond de page
        const bg = document.querySelector('.topo-bg');
        if (bg) {
            bg.innerHTML = topoSVG({ seed: 'hugo-allix-annecy', w: 1600, h: 1000, cols: 120, rows: 75, levels: 22, peaks: 6, majorEvery: 5, minorWidth: 0.9, majorWidth: 1.6 });
        }
        // Carte de contact
        const contact = document.querySelector('.contact-topo');
        if (contact) {
            contact.innerHTML = topoSVG({ seed: 'arrivee', w: 1100, h: 520, cols: 96, rows: 46, levels: 16, peaks: 3, minorWidth: 0.9, majorWidth: 1.6 });
        }
        // Couvertures des projets
        document.querySelectorAll('.project-card').forEach((card) => {
            const cover = card.querySelector('.project-cover');
            if (!cover || cover.querySelector('.cover-topo')) return;
            const svg = topoSVG({
                seed: card.dataset.seed || card.querySelector('h3').textContent,
                w: 400, h: 170, cols: 70, rows: 30, levels: 13, peaks: 3,
                summit: card.dataset.year || null,
                className: 'cover-topo'
            });
            const icon = '<span class="cover-icon" aria-hidden="true"><i class="fa-solid ' + (card.dataset.icon || 'fa-mountain') + '"></i></span>';
            cover.insertAdjacentHTML('afterbegin', svg + icon);
        });
    }


    /* ---------- 3. TRADUCTIONS (FR par défaut) ---------- */
    const langFrBtn = document.getElementById('lang-fr');
    const langEnBtn = document.getElementById('lang-en');
    const dictionaries = window.I18N || {};
    let currentLang = 'fr';
    let rotatorWords = ['des bases de données fiables', "des outils d'IA en local", 'des tableaux de bord utiles', 'des pipelines de données'];

    // Transforme "Python, PostgreSQL, Docker" en pastilles
    function renderTechChips(scope) {
        (scope || document).querySelectorAll('.tech-list').forEach((el) => {
            if (el.querySelector('.tech-chip')) return;
            const items = el.textContent.split(',').map((s) => s.trim()).filter(Boolean);
            el.innerHTML = items.map((t) => '<span class="tech-chip">' + escapeHtml(t) + '</span>').join('');
        });
    }

    function applyTranslations(dict, lang) {
        document.querySelectorAll('[data-key]').forEach((el) => {
            const value = dict[el.dataset.key];
            if (typeof value === 'string') el.innerHTML = value;
        });
        document.querySelectorAll('[data-aria-key]').forEach((el) => {
            const value = dict[el.dataset.ariaKey];
            if (typeof value === 'string') el.setAttribute('aria-label', value);
        });
        document.querySelectorAll('[data-alt-key]').forEach((el) => {
            const value = dict[el.dataset.altKey];
            if (typeof value === 'string') el.alt = value;
        });
        document.querySelectorAll('#cv-download-link, .js-cv-link').forEach((link) => {
            if (dict.cvPath) link.href = dict.cvPath;
            if (dict.cvFileName) link.setAttribute('download', dict.cvFileName);
        });
        if (dict.heroRotate) {
            rotatorWords = dict.heroRotate.split('|');
            restartRotator();
        }
        renderTechChips();
        root.lang = lang;
        currentLang = lang;
        langFrBtn.classList.toggle('active', lang === 'fr');
        langEnBtn.classList.toggle('active', lang === 'en');
        langFrBtn.setAttribute('aria-pressed', String(lang === 'fr'));
        langEnBtn.setAttribute('aria-pressed', String(lang === 'en'));
    }

    // Les textes viennent de lang/fr.js et lang/en.js (chargés avant ce fichier)
    function setLanguage(lang) {
        const dict = dictionaries[lang];
        if (!dict) {
            console.warn('Traduction introuvable : lang/' + lang + '.js est-il bien chargé ?');
            return;
        }
        if (dialog && dialog.open) dialog.close();
        applyTranslations(dict, lang);
        store.set('language', lang);
    }

    langFrBtn.addEventListener('click', () => setLanguage('fr'));
    langEnBtn.addEventListener('click', () => setLanguage('en'));


    /* ---------- 4. THÈME CLAIR / SOMBRE ---------- */
    const themeBtn = document.querySelector('.theme-toggle');
    const themeMeta = document.querySelector('meta[name="theme-color"]');

    function setTheme(theme, save) {
        root.setAttribute('data-theme', theme);
        if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#0a1120' : '#f3efe4');
        if (save) store.set('theme', theme);
    }
    setTheme(root.getAttribute('data-theme') || 'light', false);

    themeBtn.addEventListener('click', () => {
        setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });

    // Si le visiteur n'a rien choisi, on suit le réglage du système
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    const followSystem = (e) => { if (!store.get('theme')) setTheme(e.matches ? 'dark' : 'light', false); };
    if (systemDark.addEventListener) systemDark.addEventListener('change', followSystem);


    /* ---------- 5. TEXTE TOURNANT DU HERO ---------- */
    const rotatorEl = document.querySelector('.rotator');
    let rotatorTimer = null;

    function restartRotator() {
        if (!rotatorEl) return;
        clearTimeout(rotatorTimer);
        let wordIndex = 0;
        rotatorEl.textContent = rotatorWords[0];

        if (reduceMotion) {
            const swap = () => {
                wordIndex = (wordIndex + 1) % rotatorWords.length;
                rotatorEl.textContent = rotatorWords[wordIndex];
                rotatorTimer = setTimeout(swap, 3200);
            };
            rotatorTimer = setTimeout(swap, 3200);
            return;
        }

        let chars = rotatorWords[0].length;
        let deleting = true;
        const tick = () => {
            const word = rotatorWords[wordIndex];
            if (deleting) {
                chars--;
                rotatorEl.textContent = word.slice(0, chars);
                if (chars <= 0) {
                    deleting = false;
                    wordIndex = (wordIndex + 1) % rotatorWords.length;
                    rotatorTimer = setTimeout(tick, 320);
                    return;
                }
                rotatorTimer = setTimeout(tick, 28);
            } else {
                chars++;
                rotatorEl.textContent = word.slice(0, chars);
                if (chars >= word.length) {
                    deleting = true;
                    rotatorTimer = setTimeout(tick, 2200);
                    return;
                }
                rotatorTimer = setTimeout(tick, 55);
            }
        };
        rotatorTimer = setTimeout(tick, 2600);
    }


    /* ---------- 6. COMPTEURS ---------- */
    function animateCounter(el) {
        let target = el.dataset.count;
        if (target === 'auto-projects') target = document.querySelectorAll('.project-card').length;
        target = parseInt(target, 10) || 0;
        if (reduceMotion) { el.textContent = target; return; }
        const duration = 1300;
        const start = performance.now();
        const step = (now) => {
            const p = Math.min((now - start) / duration, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }


    /* ---------- 7. APPARITIONS AU DÉFILEMENT ---------- */
    function setupReveal() {
        // Décalage en cascade dans les grilles
        document.querySelectorAll('.stats, .skills-grid, .skills-extra, .portfolio-grid, .references-grid, .timeline, .hero-content').forEach((group) => {
            group.querySelectorAll(':scope > .fade-in').forEach((el, i) => {
                el.style.setProperty('--d', ((i % 4) * 0.09).toFixed(2) + 's');
            });
        });

        const show = (el) => {
            el.classList.add('visible');
            el.querySelectorAll('[data-count]').forEach(animateCounter);
            if (el.matches('[data-count]')) animateCounter(el);
        };

        const items = document.querySelectorAll('.fade-in');
        if (!('IntersectionObserver' in window)) { items.forEach(show); return; }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    show(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        items.forEach((el) => observer.observe(el));
    }


    /* ---------- 8. DÉFILEMENT : HEADER, PROGRESSION, PARALLAXE, NAV ACTIVE ---------- */
    const header = document.querySelector('.site-header');
    const progress = document.querySelector('.scroll-progress span');
    const backToTop = document.querySelector('.back-to-top');
    const hero = document.querySelector('.hero');
    const heroBg = document.querySelector('.hero-bg');
    const heroContent = document.querySelector('.hero-content');
    const ridges = document.querySelectorAll('.ridge');
    let ticking = false;

    function onScroll() {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        header.classList.toggle('scrolled', y > 30);
        progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
        backToTop.classList.toggle('show', y > window.innerHeight * 0.9);

        if (!reduceMotion && hero && y < hero.offsetHeight) {
            heroBg.style.transform = 'translate3d(0,' + (y * 0.35).toFixed(1) + 'px,0) scale(1.06)';
            heroContent.style.transform = 'translate3d(0,' + (y * -0.12).toFixed(1) + 'px,0)';
            heroContent.style.opacity = Math.max(0, 1 - y / (hero.offsetHeight * 0.7)).toFixed(3);
            ridges.forEach((r) => {
                r.style.transform = 'translate3d(0,' + (y * parseFloat(r.dataset.speed || 0)).toFixed(1) + 'px,0)';
            });
        }
        ticking = false;
    }
    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });

    // Lien actif dans le menu selon la section affichée
    const navLinks = document.querySelectorAll('.nav-links a');
    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === '#' + id));
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));
    }


    /* ---------- 9. MENU MOBILE ---------- */
    const navToggle = document.querySelector('.nav-toggle');

    function setMenu(open) {
        document.body.classList.toggle('nav-open', open);
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.dataset.ariaKey = open ? 'ariaMenuClose' : 'ariaMenuOpen';
        const dict = dictionaries[currentLang];
        navToggle.setAttribute('aria-label', (dict && dict[navToggle.dataset.ariaKey]) || (open ? 'Fermer le menu' : 'Ouvrir le menu'));
    }
    navToggle.addEventListener('click', () => setMenu(!document.body.classList.contains('nav-open')));
    navLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('nav-open')) setMenu(false);
    });


    /* ---------- 10. FILTRES DES PROJETS + FENÊTRE DE DÉTAIL ---------- */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach((btn) => {
        btn.setAttribute('aria-pressed', String(btn.classList.contains('active')));
        btn.addEventListener('click', () => {
            filterBtns.forEach((b) => {
                b.classList.toggle('active', b === btn);
                b.setAttribute('aria-pressed', String(b === btn));
            });
            const filter = btn.dataset.filter;
            projectCards.forEach((card) => {
                const match = filter === 'all' || card.dataset.category.split(' ').includes(filter);
                card.classList.toggle('is-hidden', !match);
                if (match) {
                    card.classList.add('visible');
                    card.classList.remove('pop');
                    void card.offsetWidth; // relance l'animation
                    card.classList.add('pop');
                }
            });
        });
    });

    const dialog = document.querySelector('.project-dialog');

    function openProject(card) {
        if (!dialog || typeof dialog.showModal !== 'function') return;
        dialog.dataset.tone = card.dataset.tone || 'dev';
        dialog.querySelector('.dialog-cover').innerHTML = card.querySelector('.project-cover').innerHTML;
        dialog.querySelector('.dialog-meta').innerHTML = card.querySelector('.project-meta').innerHTML;
        dialog.querySelector('#dialog-title').innerHTML = card.querySelector('h3').innerHTML;
        dialog.querySelector('.dialog-desc').innerHTML = card.querySelector('.project-desc').innerHTML;
        dialog.querySelector('.dialog-tech').innerHTML = card.querySelector('.tech-list').innerHTML;
        dialog.querySelector('.dialog-context').innerHTML = card.querySelector('.project-context').innerHTML;

        const actions = dialog.querySelector('.dialog-actions');
        actions.innerHTML = '';
        const link = card.querySelector('.project-actions a');
        const privateLabel = card.querySelector('.private-label');
        if (link) {
            const clone = link.cloneNode(true);
            clone.className = 'btn btn-primary';
            actions.appendChild(clone);
        } else if (privateLabel) {
            actions.appendChild(privateLabel.cloneNode(true));
        }

        dialog.showModal();
        dialog.querySelector('.dialog-close').focus();
    }

    document.querySelectorAll('.js-details').forEach((btn) => {
        btn.addEventListener('click', () => openProject(btn.closest('.project-card')));
    });
    if (dialog) {
        dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
        // Clic sur le fond assombri = fermeture
        dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    }


    /* ---------- DÉMARRAGE ---------- */
    document.querySelectorAll('.js-year').forEach((el) => { el.textContent = new Date().getFullYear(); });
    drawTopography();
    renderTechChips();
    setupReveal();
    restartRotator();
    onScroll();

    const savedLang = store.get('language');
    setLanguage(savedLang === 'en' ? 'en' : 'fr');
})();
