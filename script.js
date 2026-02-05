// ========================================
// 📝 DONNÉES MODULAIRES - MODIFIEZ ICI
// ========================================
// 
// INSTRUCTIONS :
// - Pour AJOUTER un projet : Ajoutez un objet dans MES_PROJETS
// - Pour SUPPRIMER : Supprimez l'objet correspondant
// - Pour AJOUTER une compétence : Ajoutez dans le tableau "items"
//
// ========================================

// ----------------------------------------
// 🚀 MES PROJETS
// ----------------------------------------

const MES_PROJETS = [
    {
        titre: "Audit Sécurité Infrastructure",
        description: "Analyse complète des vulnérabilités d'une infrastructure d'entreprise avec mise en place de recommandations de remédiation et hardening.",
        tags: ["Pentest", "Nmap", "Metasploit", "Burp Suite"],
        lien: "https://github.com/Dow08",
        icone: "fas fa-search"
    },
    {
        titre: "SOC Monitoring Dashboard",
        description: "Développement d'un tableau de bord de surveillance sécurité en temps réel avec alertes personnalisées et corrélation d'événements.",
        tags: ["SIEM", "Python", "ELK Stack", "Grafana"],
        lien: "https://github.com/Dow08",
        icone: "fas fa-shield-alt"
    },
    {
        titre: "Automatisation DevSecOps",
        description: "Pipeline CI/CD sécurisé avec intégration de scans de vulnérabilités automatisés et tests de sécurité continus.",
        tags: ["GitHub Actions", "Docker", "OWASP ZAP", "SonarQube"],
        lien: "https://github.com/Dow08",
        icone: "fas fa-cogs"
    },
    {
        titre: "CTF Write-ups Collection",
        description: "Documentation détaillée des challenges CTF résolus sur TryHackMe et HackTheBox avec méthodologies d'exploitation.",
        tags: ["CTF", "Writeups", "Exploitation", "Forensics"],
        lien: "https://github.com/Dow08",
        icone: "fas fa-spider"
    },
    {
        titre: "CyberDailyWatch",
        description: "Agrégateur automatisé d'actualités cybersécurité avec briefings audio générés par IA. Scraping quotidien, résumés GPT et interface web futuriste.",
        tags: ["Python", "OpenAI", "GitHub Actions", "TTS"],
        lien: "https://github.com/Dow08/ActuCybersecurite",
        icone: "fas fa-satellite-dish"
    }
];

// ----------------------------------------
// 🎯 MES COMPÉTENCES
// ----------------------------------------

const MES_COMPETENCES = {
    cyber: {
        titre: "Cybersécurité",
        icone: "fas fa-shield-alt",
        items: ["Pentest", "SIEM/SOC", "OWASP Top 10", "Forensics", "Threat Hunting", "Incident Response"]
    },
    dev: {
        titre: "Développement",
        icone: "fas fa-code",
        items: ["Python", "JavaScript", "SQL", "API REST", "Bash/PowerShell", "Git"]
    },
    reseau: {
        titre: "Réseau & Infrastructure",
        icone: "fas fa-network-wired",
        items: ["Linux", "Windows Server", "Active Directory", "Cloud AWS/Azure", "Docker", "Firewall"]
    }
};

// ----------------------------------------
// 📊 MES STATS
// ----------------------------------------

const MES_STATS = [
    { valeur: "99.9%", label: "Uptime" },
    { valeur: "15min", label: "Response" },
    { valeur: "200+", label: "Systems" },
    { valeur: "350+", label: "Threats" }
];

// ----------------------------------------
// 📬 INFOS CONTACT
// ----------------------------------------

const INFOS_CONTACT = {
    email: "Dow@ikmail.com",
    localisation: "France",
    disponibilite: "Ouvert aux opportunités",
    intro: "Je suis toujours ouvert aux discussions sur la cybersécurité, les opportunités de stage/alternance, ou simplement pour échanger sur les dernières techniques de sécurité offensive et défensive.",

    reseaux: [
        { nom: "GitHub", icone: "fab fa-github", url: "https://github.com/Dow08" },
        { nom: "LinkedIn", icone: "fab fa-linkedin", url: "https://www.linkedin.com/in/dorian-poncelet-1807612b5" },
        { nom: "Twitter", icone: "fab fa-twitter", url: "https://twitter.com/Dow163877" }
    ],

    ctf: [
        { nom: "TryHackMe", icone: "fas fa-flag", url: "https://tryhackme.com/p/seallia81", texte: "Voir mon profil TryHackMe" },
        { nom: "HackTheBox", icone: "fas fa-cube", url: "https://ctf.hackthebox.com/user/profile/1010141", texte: "Voir mon profil HackTheBox" }
    ]
};

// ========================================
// 🌌 ENHANCED PARTICLE SYSTEM
// ========================================

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.particleCount = 100;
        this.connectionDistance = 150;
        this.mouseRadius = 100;

        this.colors = ['#00ff46', '#8b5cf6', '#3b82f6', '#00d4ff'];

        this.resize();
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                color: color,
                baseOpacity: Math.random() * 0.5 + 0.3,
                pulseSpeed: Math.random() * 0.02 + 0.01,
                pulseOffset: Math.random() * Math.PI * 2
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const time = Date.now() * 0.001;

        this.particles.forEach((p, i) => {
            // Mouse interaction
            if (this.mouse.x && this.mouse.y) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.mouseRadius) {
                    const force = (this.mouseRadius - dist) / this.mouseRadius;
                    p.vx -= (dx / dist) * force * 0.5;
                    p.vy -= (dy / dist) * force * 0.5;
                }
            }

            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Friction
            p.vx *= 0.99;
            p.vy *= 0.99;

            // Random movement
            p.vx += (Math.random() - 0.5) * 0.1;
            p.vy += (Math.random() - 0.5) * 0.1;

            // Bounce
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // Pulsing opacity
            const pulse = Math.sin(time * p.pulseSpeed * 10 + p.pulseOffset);
            const opacity = p.baseOpacity + pulse * 0.2;

            // Draw particle with glow
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color.replace(')', `, ${opacity})`).replace('rgb', 'rgba').replace('#', '');

            // Convert hex to rgba for glow
            const hexToRgba = (hex, alpha) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };

            this.ctx.fillStyle = hexToRgba(p.color, opacity);
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = p.color;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            // Connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.connectionDistance) {
                    const lineOpacity = (1 - distance / this.connectionDistance) * 0.2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = hexToRgba(p.color, lineOpacity);
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ========================================
// 📄 PAGE NAVIGATION
// ========================================

let currentPage = 'home';

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const ctaButtons = document.querySelectorAll('[data-page]');

    function navigateToPage(pageId) {
        if (pageId === currentPage) return;

        const currentSection = document.getElementById(`page-${currentPage}`);
        const nextSection = document.getElementById(`page-${pageId}`);

        if (!nextSection) return;

        // Fade out current page
        currentSection.classList.add('fade-out');

        setTimeout(() => {
            currentSection.classList.remove('active', 'fade-out');

            // Fade in next page
            nextSection.classList.add('active');

            // Update nav
            navLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.page === pageId);
            });

            currentPage = pageId;

            // Re-init reveal animations
            initScrollReveal();

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

        }, 300);
    }

    // Nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPage(link.dataset.page);
        });
    });

    // CTA buttons
    ctaButtons.forEach(btn => {
        if (!btn.classList.contains('nav-link')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                navigateToPage(btn.dataset.page);
            });
        }
    });
}

// ========================================
// 📜 SCROLL REVEAL ANIMATIONS
// ========================================

function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => {
        el.classList.remove('active');
        observer.observe(el);
    });
}

// ========================================
// 🖥️ DYNAMIC RENDERING
// ========================================

function renderStats() {
    const container = document.getElementById('hero-stats');
    if (!container) return;

    container.innerHTML = MES_STATS.map(stat => `
        <div class="hero-stat">
            <span class="stat-value">${stat.valeur}</span>
            <span class="stat-label">${stat.label}</span>
        </div>
    `).join('');
}

function renderProjects() {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    container.innerHTML = MES_PROJETS.map((projet, i) => `
        <div class="project-card reveal" style="transition-delay: ${i * 0.1}s">
            <div class="project-icon">
                <i class="${projet.icone}"></i>
            </div>
            <h3 class="project-title">${projet.titre}</h3>
            <p class="project-description">${projet.description}</p>
            <div class="project-tags">
                ${projet.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <a href="${projet.lien}" target="_blank" class="project-link">
                <i class="fab fa-github"></i> Code Source
                <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `).join('');
}

function renderSkills() {
    const container = document.getElementById('skills-grid');
    if (!container) return;

    container.innerHTML = Object.values(MES_COMPETENCES).map((cat, i) => `
        <div class="skill-category reveal" style="transition-delay: ${i * 0.1}s">
            <div class="skill-header">
                <div class="skill-icon">
                    <i class="${cat.icone}"></i>
                </div>
                <h3 class="skill-title">${cat.titre}</h3>
            </div>
            <div class="skill-items">
                ${cat.items.map(item => `<span class="skill-item">${item}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function renderContact() {
    const container = document.getElementById('contact-grid');
    if (!container) return;

    const info = INFOS_CONTACT;

    container.innerHTML = `
        <div class="contact-info reveal">
            <h2 class="contact-title">Restons en contact</h2>
            <p class="contact-intro">${info.intro}</p>
            
            <div class="contact-details">
                <div class="contact-item">
                    <i class="fas fa-envelope"></i>
                    <span>${info.email}</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${info.localisation}</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-briefcase"></i>
                    <span>${info.disponibilite}</span>
                </div>
            </div>
            
            <div class="social-links">
                ${info.reseaux.map(r => `
                    <a href="${r.url}" target="_blank" class="social-btn" title="${r.nom}">
                        <i class="${r.icone}"></i>
                    </a>
                `).join('')}
            </div>
            
            <div class="ctf-section">
                <h4>CTF & Profils</h4>
                <div class="ctf-links">
                    ${info.ctf.map(c => `
                        <a href="${c.url}" target="_blank" class="ctf-link">
                            <i class="${c.icone}"></i>
                            <span>${c.texte}</span>
                            <i class="fas fa-arrow-right arrow"></i>
                        </a>
                    `).join('')}
                </div>
            </div>
            
            <div class="cv-download-section">
                <a href="assets/documents/CV_Poncelet_Dorian.pdf" download class="cv-download-btn">
                    <i class="fas fa-file-pdf"></i>
                    <span>Télécharger mon CV</span>
                    <i class="fas fa-download"></i>
                </a>
            </div>
        </div>
        
        <div class="contact-form-card reveal reveal-delay-1">
            <form id="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
                <input type="hidden" name="_subject" value="Nouveau message depuis le Portfolio">
                <input type="hidden" name="_captcha" value="false">
                <div class="form-group">
                    <input type="text" name="name" placeholder="Nom complet" required>
                </div>
                <div class="form-group">
                    <input type="email" name="email" placeholder="Email" required>
                </div>
                <div class="form-group">
                    <input type="text" name="subject" placeholder="Sujet" required>
                </div>
                <div class="form-group">
                    <textarea name="message" placeholder="Votre message..." rows="5" required></textarea>
                </div>
                <button type="submit" class="form-btn" id="submit-btn">
                    <i class="fas fa-paper-plane"></i>
                    <span>Envoyer le message</span>
                </button>
            </form>
            <div class="form-footer">
                <i class="fas fa-shield-alt"></i>
                <span>Vos données ne seront jamais partagées avec des tiers.</span>
            </div>
        </div>
    `;

    // Form handler with Formspree integration
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('submit-btn');
            const originalText = submitBtn.innerHTML;

            // Loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Envoi...</span>';
            submitBtn.disabled = true;

            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    showToast('✅ Message envoyé avec succès !');
                    form.reset();
                } else {
                    throw new Error('Erreur serveur');
                }
            } catch (error) {
                console.error('Erreur envoi formulaire:', error);
                showToast('❌ Erreur lors de l\'envoi. Réessayez.');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// ========================================
// 📰 CYBER NEWS RENDERING
// ========================================

async function renderCyberNews() {
    const newsGrid = document.getElementById('cyber-news-grid');
    const audioPlayer = document.getElementById('cyber-audio-player');
    const audioFallback = document.getElementById('audio-fallback');
    const updateDate = document.getElementById('cyber-update-date');
    const scriptSection = document.getElementById('cyber-script-section');
    const scriptContent = document.getElementById('cyber-script-content');

    if (!newsGrid) return;

    try {
        // Fetch local data.json with cache busting
        const cacheBuster = new Date().getTime();
        const response = await fetch(`./cyber-news/data.json?t=${cacheBuster}`);

        if (!response.ok) {
            throw new Error('Données non disponibles');
        }

        const data = await response.json();

        // DEV LOGS - Cyber Pulse Pipeline
        console.log('🛡️ [CyberPulse] Données chargées avec succès');
        console.log('📅 [CyberPulse] Dernière MAJ:', data.generated_at);
        console.log('📰 [CyberPulse] Articles récupérés:', data.articles?.length || 0);
        if (data.script) console.log('🎙️ [CyberPulse] Script radio disponible');
        if (data.audio_file) console.log('🔊 [CyberPulse] Audio briefing:', data.audio_file);

        // Update date
        if (updateDate && data.generated_at) {
            const date = new Date(data.generated_at);
            updateDate.textContent = `Dernière mise à jour : ${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        }

        // 🎵 FORCE AUDIO UPDATE (Cache Busting)
        if (data.audio_file && audioPlayer) {
            // Construit le chemin avec un timestamp pour éviter le cache navigateur
            // data.audio_file est relatif (ex: "audio/latest_briefing.mp3")
            const audioPath = `./cyber-news/${data.audio_file}?t=${new Date().getTime()}`;
            console.log('🔊 [CyberPulse] Updating audio source:', audioPath);

            audioPlayer.src = audioPath;
            audioPlayer.load(); // Force le rechargement du flux
        }

        // Render articles
        if (data.articles && data.articles.length > 0) {
            newsGrid.innerHTML = data.articles.map((article, index) => `
                <article class="cyber-news-item reveal" style="transition-delay: ${index * 0.1}s">
                    <span class="news-item-index">[${String(index + 1).padStart(2, '0')}]</span>
                    <h3 class="news-item-title">
                        <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                            ${article.title_fr || article.title}
                        </a>
                    </h3>
                    <p class="news-item-summary">${article.summary_fr || article.summary}</p>
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="news-item-link">
                        <i class="fas fa-external-link-alt"></i> Lire l'article
                    </a>
                </article>
            `).join('');

            // Re-init reveal animations
            initScrollReveal();
        } else {
            newsGrid.innerHTML = `
                <div class="cyber-error">
                    <i class="fas fa-database"></i>
                    <p>Aucune actualité disponible pour le moment</p>
                </div>
            `;
        }

        // Display script if available
        if (scriptSection && scriptContent && data.script) {
            scriptSection.style.display = 'block';
            scriptContent.textContent = data.script;
        }

    } catch (error) {
        console.error('Erreur chargement Cyber News:', error);
        newsGrid.innerHTML = `
            <div class="cyber-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Impossible de charger les actualités</p>
                <p style="font-size: 0.8rem; margin-top: 0.5rem; opacity: 0.7;">${error.message}</p>
            </div>
        `;
    }

    // Handle audio fallback
    if (audioPlayer) {
        audioPlayer.addEventListener('error', () => {
            const customPlayer = document.getElementById('custom-audio-player');
            if (customPlayer) customPlayer.style.display = 'none';
            if (audioFallback) {
                audioFallback.style.display = 'flex';
            }
        });

        // Initialize custom audio player
        initCustomAudioPlayer();
    }
}

// ========================================
// 🎵 CUSTOM AUDIO PLAYER
// ========================================

function initCustomAudioPlayer() {
    const audio = document.getElementById('cyber-audio-player');
    const playBtn = document.getElementById('audio-play-btn');
    const playIcon = document.getElementById('play-icon');
    const progressBar = document.getElementById('audio-progress-bar');
    const progress = document.getElementById('audio-progress');
    const progressHandle = document.getElementById('audio-progress-handle');
    const currentTimeEl = document.getElementById('audio-current-time');
    const durationEl = document.getElementById('audio-duration');
    const volumeBtn = document.getElementById('audio-volume-btn');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('audio-volume-slider');
    const volumeLevel = document.getElementById('volume-level');
    const visualizer = document.getElementById('audio-visualizer');

    if (!audio || !playBtn) return;

    // Format time helper
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Play/Pause toggle
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playIcon.className = 'fas fa-pause';
            visualizer.classList.add('playing');
        } else {
            audio.pause();
            playIcon.className = 'fas fa-play';
            visualizer.classList.remove('playing');
        }
    });

    // Update progress bar
    audio.addEventListener('timeupdate', () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = `${percent}%`;
        progressHandle.style.left = `${percent}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    // Set duration when loaded
    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
    });

    // Handle audio end
    audio.addEventListener('ended', () => {
        playIcon.className = 'fas fa-play';
        visualizer.classList.remove('playing');
        progress.style.width = '0%';
        progressHandle.style.left = '0%';
    });

    // Click on progress bar to seek
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    });

    // Volume control
    let currentVolume = 0.7;
    audio.volume = currentVolume;
    volumeLevel.style.width = `${currentVolume * 100}%`;

    volumeBtn.addEventListener('click', () => {
        if (audio.volume > 0) {
            audio.volume = 0;
            volumeLevel.style.width = '0%';
            volumeIcon.className = 'fas fa-volume-mute';
        } else {
            audio.volume = currentVolume;
            volumeLevel.style.width = `${currentVolume * 100}%`;
            volumeIcon.className = 'fas fa-volume-up';
        }
    });

    volumeSlider.addEventListener('click', (e) => {
        const rect = volumeSlider.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audio.volume = percent;
        currentVolume = percent;
        volumeLevel.style.width = `${percent * 100}%`;

        if (percent === 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (percent < 0.5) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    });
}

// ========================================
// 🍞 TOAST NOTIFICATION
// ========================================

function showToast(message = 'Action effectuée !') {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.querySelector('span').textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

// ========================================
// ✨ CARD SPOTLIGHT EFFECT
// ========================================

function initSpotlightEffect() {
    document.querySelectorAll('.project-card, .skill-category').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// ========================================
// 🚀 INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle system
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        new ParticleSystem(canvas);
    }

    // Render all sections
    renderStats();
    renderProjects();
    renderSkills();
    renderContact();
    renderCyberNews();

    // Initialize interactions
    initNavigation();
    initScrollReveal();
    initSpotlightEffect();

    // Initial reveal
    setTimeout(() => {
        document.querySelectorAll('#page-home .reveal, #page-home .hero-stat, #page-home .hero-badge').forEach(el => {
            el.classList.add('active');
        });
    }, 100);

    console.log('🚀 Vision 2026 Multi-Page Portfolio Loaded');
});
