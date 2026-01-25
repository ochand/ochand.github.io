/**
 * Portfolio Template Engine
 * Handles dynamic rendering of portfolio sections based on configuration
 */

// === CONSTANTES PARA MODO RESUME ===
// Límites de contenido para garantizar que cabe en una página A4
const RESUME_LIMITS = {
    education: 3,           // Máximo # títulos académicos
    projects: 10,            // Máximo # proyectos
    experience: 10,          // Máximo 2 roles profesionales
    skillCategories: 10,     // Máximo 5 categorías de skills
    summaryMaxWords: 800     // Máximo 80 palabras en summary
};

// Dimensiones exactas de página A4
const A4_DIMENSIONS = {
    height: { mm: 297, px: 1123 },
    width: { mm: 210, px: 794 },
    contentArea: { height: 277, width: 190 } // Con márgenes de 10mm
};

class TemplateEngine {
    constructor() {
        this.config = null;
        this.projectsData = null;
        this.profilesData = null;
        this.currentProfile = null;
        this.renderMode = 'full';       // 'full' | 'resume'
        this.resumeLimits = RESUME_LIMITS;
    }

    /**
     * Initialize the template engine
     */
    async init() {
        try {
            await this.loadProfiles();
            await this.detectAndLoadProfile();
            await this.loadProjectsData();
            console.log('TemplateEngine initialized successfully');
        } catch (error) {
            console.error('Failed to initialize TemplateEngine:', error);
        }
    }

    /**
     * Set render mode (full or resume)
     */
    setRenderMode(mode) {
        this.renderMode = mode;
        console.log(`Render mode set to: ${mode}`);
    }

    /**
     * Check if currently in resume mode
     */
    isResumeMode() {
        return this.renderMode === 'resume';
    }

    /**
     * Get resume limits configuration
     */
    getResumeLimits() {
        return this.resumeLimits;
    }

    /**
     * Load profiles configuration
     */
    async loadProfiles() {
        try {
            const response = await fetch('/config/profiles.json');
            this.profilesData = await response.json();
            return this.profilesData;
        } catch (error) {
            console.error('Failed to load profiles:', error);
            throw error;
        }
    }

    /**
     * Detect profile from URL or localStorage and load it
     */
    async detectAndLoadProfile() {
        const urlParams = new URLSearchParams(window.location.search);
        const profileName = urlParams.get('profile') ||
                           localStorage.getItem('selected-profile') ||
                           'default';

        await this.loadProfile(profileName);
    }

    /**
     * Load specific profile configuration
     */
    async loadProfile(profileName = 'default') {
        if (!this.profilesData) {
            await this.loadProfiles();
        }

        const profile = this.profilesData[profileName] || this.profilesData.default;
        this.currentProfile = profileName;

        // Store selected profile
        localStorage.setItem('selected-profile', profileName);

        // Use profile config as main config
        this.config = {
            sections: profile.sections,
            meta: {
                version: '2.0.0',
                profile: profileName,
                profileName: profile.name,
                profileDescription: profile.description
            }
        };

        // Store project filters from profile
        this.profileProjectFilters = profile.projects || {};

        console.log(`Profile loaded: ${profile.name} (${profileName})`);
        return profile;
    }

    /**
     * Load portfolio configuration
     */
    async loadConfig() {
        try {
            const response = await fetch('/config/portfolio.json');
            this.config = await response.json();
            return this.config;
        } catch (error) {
            console.error('Failed to load portfolio config:', error);
            throw error;
        }
    }

    /**
     * Load projects data
     */
    async loadProjectsData() {
        try {
            const response = await fetch('/data/projects.json');
            this.projectsData = await response.json();
            return this.projectsData;
        } catch (error) {
            console.error('Failed to load projects data:', error);
            throw error;
        }
    }

    /**
     * Get sorted and filtered sections based on config
     */
    getSections() {
        if (!this.config) return [];

        return this.config.sections
            .filter(section => section.enabled)
            .sort((a, b) => a.order - b.order);
    }

    /**
     * Render all sections dynamically
     */
    renderAllSections() {
        // Support both .container (full portfolio) and #content (resume)
        const container = document.querySelector('.container') || document.querySelector('#content');
        if (!container) return;

        const sections = this.getSections();

        // Clear existing content
        if (this.isResumeMode()) {
            // Resume mode: clear everything in #content
            container.innerHTML = '';
        } else {
            // Full mode: clear sections but keep header
            const existingSections = container.querySelectorAll('.section');
            existingSections.forEach(section => section.remove());
        }

        // Render each section
        sections.forEach(section => {
            const sectionHTML = this.renderSection(section);
            if (sectionHTML) {
                container.insertAdjacentHTML('beforeend', sectionHTML);
            }
        });
    }

    /**
     * Render a single section based on its type
     */
    renderSection(sectionConfig) {
        // Si está en modo resume, usa métodos compactos
        if (this.isResumeMode()) {
            return this.renderSectionCompact(sectionConfig);
        }

        // Modo full: usa métodos normales
        const sectionMap = {
            'summary': () => this.renderSummary(sectionConfig),
            'research': () => this.renderResearch(sectionConfig),
            'projects': () => this.renderProjectsSection(sectionConfig),
            'techStack': () => this.renderTechStack(sectionConfig),
            'experience': () => this.renderExperience(sectionConfig),
            'community': () => this.renderCommunity(sectionConfig),
            'languages': () => this.renderLanguages(sectionConfig),
            'creative': () => this.renderCreative(sectionConfig),
            'opportunities': () => this.renderOpportunities(sectionConfig)
        };

        const renderer = sectionMap[sectionConfig.id];
        return renderer ? renderer() : '';
    }

    /**
     * Render section in compact mode (for resume)
     */
    renderSectionCompact(sectionConfig) {
        const compactRenderMethods = {
            'summary': () => this.renderSummaryCompact(sectionConfig),
            'research': () => this.renderResearchCompact(sectionConfig),
            'projects': () => this.renderProjectsCompact(sectionConfig),
            'techStack': () => this.renderTechStackCompact(sectionConfig),
            'experience': () => this.renderExperienceCompact(sectionConfig),
            'languages': () => this.renderLanguagesCompact(sectionConfig),
            // Community, Creative, Opportunities se omiten en resume
            'community': () => '',
            'creative': () => '',
            'opportunities': () => ''
        };

        return compactRenderMethods[sectionConfig.id] ? compactRenderMethods[sectionConfig.id]() : '';
    }

    /**
     * Filter projects by profile configuration
     */
    filterProjectsByProfile(projects, type) {
        if (!this.profileProjectFilters || !this.profileProjectFilters[type]) {
            return projects;
        }

        const enabledIds = this.profileProjectFilters[type].enabled;

        // If no filter specified, return all enabled projects
        if (!enabledIds || enabledIds.length === 0) {
            return projects.filter(p => p.enabled !== false);
        }

        // Filter by profile's enabled list
        return projects.filter(p => enabledIds.includes(p.id) && p.enabled !== false);
    }

    /**
     * Render projects section with dynamic data
     */
    renderProjectsSection(sectionConfig) {
        if (!this.projectsData) return '';

        const limit = sectionConfig.config?.limit;
        const showAcademic = sectionConfig.config?.showAcademic;
        const showCreative = sectionConfig.config?.showCreative;

        // Collect all projects to render
        let allProjects = [];

        if (showAcademic) {
            const academic = this.filterProjectsByProfile(this.projectsData.academic, 'academic')
                .sort((a, b) => (a.order || 999) - (b.order || 999))  // Sort by order
                .map(p => ({...p, type: 'academic'}));
            allProjects = [...allProjects, ...academic];
        }

        if (showCreative) {
            const creative = this.filterProjectsByProfile(this.projectsData.creative, 'creative')
                .sort((a, b) => (a.order || 999) - (b.order || 999))  // Sort by order
                .map(p => ({...p, type: 'creative'}));
            allProjects = [...allProjects, ...creative];
        }

        // Apply limit if specified (limits total projects across all types)
        if (limit && limit > 0) {
            allProjects = allProjects.slice(0, limit);
        }

        // Group back by type
        const academicProjects = allProjects.filter(p => p.type === 'academic');
        const creativeProjects = allProjects.filter(p => p.type === 'creative');

        let html = '';

        if (academicProjects.length > 0) {
            html += this.renderAcademicProjects(academicProjects);
        }

        if (creativeProjects.length > 0) {
            html += this.renderCreativeProjects(creativeProjects);
        }

        return html;
    }

    /**
     * Render academic projects section
     */
    renderAcademicProjects(projects = null) {
        if (!this.projectsData || !this.projectsData.academic) return '';

        const projectsToRender = projects || this.projectsData.academic;
        const projectCards = projectsToRender
            .map(project => this.createProjectCard(project))
            .join('');

        return `
            <section class="section research-focus" data-section-id="projects-academic">
                <h2 class="section-title" data-i18n="projects.title">🎓 Academic Projects</h2>
                <div class="projects-grid">
                    ${projectCards}
                </div>
            </section>
        `;
    }

    /**
     * Render creative projects section
     */
    renderCreativeProjects(projects = null) {
        if (!this.projectsData || !this.projectsData.creative) return '';

        const projectsToRender = projects || this.projectsData.creative;
        const projectCards = projectsToRender
            .map(project => this.createProjectCard(project))
            .join('');

        return `
            <section class="section creative-focus" data-section-id="projects-creative">
                <h2 class="section-title" data-i18n="creative.title">🎨 Creative Technology Projects</h2>
                <div class="projects-grid">
                    ${projectCards}
                </div>
            </section>
        `;
    }

    /**
     * Create a project card HTML
     */
    createProjectCard(project) {
        const categoryClass = project.category === 'research' ? 'research-project' :
                            project.category === 'creative' ? 'creative-project' : '';

        const badgeHTML = project.badge ?
            `<span class="status-badge ${project.badgeClass || ''}" data-i18n="${project.badgeI18n}">${project.badge}</span>` : '';

        const techTags = project.technologies.map(tech =>
            `<span class="tech-tag">${tech}</span>`
        ).join('');

        const linksHTML = project.links.map(link =>
            `<a href="${link.url}" class="project-link" target="_blank">${link.icon} ${link.label}</a>`
        ).join('');

        const statusHTML = project.status ?
            `<span data-i18n="${project.statusI18n}">${project.status}</span>` : '';

        const impactHTML = project.impact ?
            `<p class="project-impact" data-i18n="${project.impactI18n}">${project.impact}</p>` : '';

        return `
            <div class="project-card ${categoryClass}">
                <div class="project-header">
                    <h3 class="project-title" data-i18n="${project.titleI18n}">
                        ${project.title}${badgeHTML}
                    </h3>
                    <span class="project-category ${project.category}" data-i18n="${project.categoryI18n}">
                        ${project.categoryLabel}
                    </span>
                </div>
                <p class="project-description" data-i18n="${project.descriptionI18n}">
                    ${project.description}
                </p>
                <div class="project-tech">
                    ${techTags}
                </div>
                <div class="project-links">
                    ${linksHTML}
                    ${statusHTML}
                </div>
                ${impactHTML}
            </div>
        `;
    }

    /**
     * Render enterprise projects section
     */
    renderEnterpriseProjects() {
        if (!this.projectsData || !this.projectsData.enterprise) return '';

        return this.projectsData.enterprise.map(project => this.createProjectCard(project)).join('');
    }

    /**
     * Check if a section is enabled
     */
    isSectionEnabled(sectionId) {
        if (!this.config) return false;

        const section = this.config.sections.find(s => s.id === sectionId);
        return section ? section.enabled : false;
    }

    /**
     * Get section configuration by ID
     */
    getSectionConfig(sectionId) {
        if (!this.config) return null;

        return this.config.sections.find(s => s.id === sectionId);
    }

    /**
     * Get section order
     */
    getSectionOrder(sectionId) {
        const section = this.getSectionConfig(sectionId);
        return section ? section.order : 999;
    }

    /**
     * Reorder sections in the DOM based on configuration
     */
    reorderSections() {
        const container = document.querySelector('.container');
        if (!container) return;

        const sections = this.getSections();
        const sectionElements = {};

        // Map section IDs to their DOM elements
        sections.forEach(section => {
            const element = document.querySelector(`[data-section-id="${section.id}"]`);
            if (element) {
                sectionElements[section.id] = element;
            }
        });

        // Reorder by appending in the correct order
        sections.forEach(section => {
            const element = sectionElements[section.id];
            if (element) {
                container.appendChild(element);
            }
        });
    }

    /**
     * Hide/show sections based on configuration
     */
    applyVisibility() {
        if (!this.config) return;

        this.config.sections.forEach(section => {
            const element = document.querySelector(`[data-section-id="${section.id}"]`);
            if (element) {
                element.style.display = section.enabled ? '' : 'none';
            }
        });
    }

    /**
     * Render summary section
     */
    renderSummary(sectionConfig) {
        return `
            <section class="section" data-section-id="summary">
                <h2 class="section-title" data-i18n="summary.title">Professional Summary</h2>
                <p class="summary-text" data-i18n="summary.text">
                    <strong>AI Systems Architect in Training</strong> with 16+ years of enterprise systems expertise,
                    currently pursuing <strong>Master in Informatics Engineering at UPC BarcelonaTech</strong> (Expected 2026) and
                    <strong>IBM AI Engineering Professional Certificate</strong>. Specializing in <strong>agentic AI systems,
                    manufacturing intelligence, and autonomous business solutions</strong>. International transition from Mexico to Spain
                    for advanced studies while developing a VR platform for cultural and entertainment applications.
                </p>

                ${sectionConfig.config?.showStats ? `
                <div class="highlight-stats">
                    <div class="stat-item academic">
                        <div class="stat-number">2026</div>
                        <div class="stat-label" data-i18n="impact.graduation.label">Expected Graduation</div>
                    </div>
                    <div class="stat-item academic">
                        <div class="stat-number">3</div>
                        <div class="stat-label" data-i18n="impact.academic.label">AI/ML Projects</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">16+</div>
                        <div class="stat-label" data-i18n="impact.experience.label">Years Experience</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">100K+</div>
                        <div class="stat-label" data-i18n="impact.users.label">Users Served</div>
                    </div>
                </div>
                ` : ''}

                <div class="domain-expertise-highlight" style="background: rgba(139, 92, 246, 0.08); border-left: 4px solid #8b5cf6; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid rgba(139, 92, 246, 0.2);">
                    <h3 style="color: #8b5cf6; font-size: 18px; margin: 0 0 12px 0; display: flex; align-items: center;">
                        <span style="margin-right: 8px;">📦</span>
                        <span data-i18n="summary.domainExpertise.title">Manufacturing & Supply Chain Domain Expertise</span>
                    </h3>
                    <p style="margin-bottom: 10px; font-weight: 600; color: #e2e8f0;" data-i18n="summary.domainExpertise.intro">16+ years implementing MRP/ERP systems in production:</p>
                    <ul style="margin-left: 20px; line-height: 1.8; color: #c4b5fd;">
                        <li data-i18n="summary.domainExpertise.inventory">Inventory management, procurement, production planning</li>
                        <li data-i18n="summary.domainExpertise.bom">BOM management, demand forecasting, manual reordering</li>
                        <li data-i18n="summary.domainExpertise.multiLocation">Multi-location operations, supply chain coordination</li>
                        <li data-i18n="summary.domainExpertise.optimization">Inventory optimization, financial integration</li>
                        <li data-i18n="summary.domainExpertise.restaurant">Restaurant industry (300+ SKUs, 4 locations): Grupo Chadorama (2012-2024)</li>
                        <li data-i18n="summary.domainExpertise.retail">Retail operations: Multi-channel inventory synchronization</li>
                    </ul>
                </div>
            </section>
        `;
    }

    /**
     * Render research/education section
     */
    renderResearch(sectionConfig) {
        return `
            <section class="section" data-section-id="research">
                <h2 class="section-title" data-i18n="research.title">🎓 Education & Certifications</h2>
                <div class="education-item current">
                    <h3 class="degree" data-i18n="research.master.title">Master in Informatics Engineering</h3>
                    <p class="university" data-i18n="research.master.institution">Universitat Politècnica de Catalunya (UPC BarcelonaTech), Barcelona, Spain</p>
                    <p class="year">2024 - 2026 <span class="current-badge" data-i18n="research.badges.current">CURRENT</span></p>
                    <p class="thesis">
                        <strong data-i18n="research.master.specialization.label">Specialization:</strong> <span data-i18n="research.master.specialization.text">AI Systems, Manufacturing Intelligence, Agentic AI, Computer Vision</span><br>
                        <strong data-i18n="research.master.thesis.label">Master's Thesis Proposal:</strong> <span data-i18n="research.master.thesis.text">Autonomous agent-based MRP system with predictive analytics</span>
                    </p>
                </div>
                <div class="education-item current">
                    <h3 class="degree" data-i18n="research.ibm.title">IBM AI Engineering Professional Certificate</h3>
                    <p class="university" data-i18n="research.ibm.institution">IBM via Coursera</p>
                    <p class="year">2025 - Present <span class="current-badge" data-i18n="research.badges.pursuing">PURSUING</span></p>
                    <p class="thesis">
                        <strong data-i18n="research.ibm.focus.label">Focus:</strong> <span data-i18n="research.ibm.focus.text">Advanced ML, Deep Learning, Generative AI, LLMs Fine-Tuning, AI Agents, Keras, TensorFlow, PyTorch</span><br>
                        <strong data-i18n="research.ibm.goal.label">Goal:</strong> <span data-i18n="research.ibm.goal.text">Expanding expertise in ML frameworks for future AI engineering roles</span><br>
                        <strong data-i18n="research.ibm.completed.label">Certificates Obtained: </strong><span data-i18n="research.ibm.completed.text">Machine Learning with Python, Introduction to Deep Learning & Neural Networks with Keras, Deep Learning with Keras and TensorFlow</span>
                    </p>
                </div>

                <div class="education-item">
                    <h3 class="degree" data-i18n="research.mti.title">Master in Information Technology Management</h3>
                    <p class="university" data-i18n="research.mti.institution">Tecnológico de Monterrey, Monterrey, Mexico</p>
                    <p class="year" data-i18n="research.mti.year">2009 - 2012</p>
                    <p class="thesis">
                        <strong data-i18n="research.mti.thesis.label">Thesis:</strong> <span data-i18n="research.mti.thesis.text">Service-Oriented Architecture as Competitive Advantage Enabler in Enterprise Information Systems Development Companies</span>
                    </p>
                    <p class="honors" data-i18n="research.honors.excellence">🏆 Excellence Recognition (Mención Honorífica)</p>
                </div>

                <div class="education-item">
                    <h3 class="degree" data-i18n="research.exchange.title">International Exchange Program</h3>
                    <p class="university" data-i18n="research.exchange.institution">University College of Borås, Sweden</p>
                    <p class="year" data-i18n="research.exchange.year">2007</p>
                    <p class="thesis">
                        <strong data-i18n="research.exchange.focus.label">Focus:</strong> <span data-i18n="research.exchange.focus.text">International Business, Internship in Informatics: InnovationLab</span><br>
                        <strong data-i18n="research.exchange.impact.label">Impact:</strong> <span data-i18n="research.exchange.impact.text">Foundation for current international academic transition</span>
                    </p>
                </div>

                <div class="education-item">
                    <h3 class="degree" data-i18n="research.bachelor.title">Bachelor's in Information Systems Engineering</h3>
                    <p class="university" data-i18n="research.bachelor.institution">Tecnológico de Monterrey, Culiacán, Mexico</p>
                    <p class="year" data-i18n="research.bachelor.year">2003 - 2008</p>
                    <p class="honors" data-i18n="research.honors.ceneval">🏆 Outstanding Performance in CENEVAL National Exam</p>
                </div>
            </section>
        `;
    }

    /**
     * Render Technical Expertise section
     */
    renderTechStack(sectionConfig) {
        const showAI = sectionConfig.config?.showAI !== false;
        const showLearning = sectionConfig.config?.showLearning !== false;

        return `
            <section class="section" data-section-id="techStack">
                <h2 class="section-title" data-i18n="techStack.title">Technical Expertise</h2>
                <div class="skills-container">
                    ${showAI ? `
                    <div class="skill-category ai-focus">
                        <h3 data-i18n="techStack.ai.title">🤖 AI & Machine Learning (Current Focus)</h3>
                        <div class="skill-item">
                            <span class="skill-name" data-i18n="techStack.ai.agenticSystems">Agentic AI Systems</span>
                            <span class="skill-level" data-i18n="techStack.levels.basic">Basic</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name" data-i18n="techStack.ai.agenticCoding">Agentic Coding</span>
                            <span class="skill-level" data-i18n="techStack.levels.advanced">Advanced</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name" data-i18n="techStack.ai.rag">RAG Implementation</span>
                            <span class="skill-level" data-i18n="techStack.levels.intermediate">Intermediate</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name" data-i18n="techStack.ai.llm">LLM Integration</span>
                            <span class="skill-level" data-i18n="techStack.levels.intermediate">Intermediate</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name" data-i18n="techStack.ai.computerVision">Computer Vision</span>
                            <span class="skill-level" data-i18n="techStack.levels.basic">Basic</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name" data-i18n="techStack.ai.manufacturingIntelligence">Manufacturing Intelligence</span>
                            <span class="skill-level" data-i18n="techStack.levels.research">Research</span>
                        </div>
                    </div>
                    ` : ''}

                    ${showLearning ? `
                    <div class="skill-category learning-focus">
                        <h3 data-i18n="techStack.learning.title">📚 Learning Stack (IBM Certification)</h3>
                        <div class="skill-item">
                            <span class="skill-name">Machine Learning with Python</span>
                            <span class="skill-level learning" data-i18n="techStack.levels.basic">Basic</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">Deep Learning and Neural Networks</span>
                            <span class="skill-level learning" data-i18n="techStack.levels.basic">Basic</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">TensorFlow, Keras & PyTorch</span>
                            <span class="skill-level learning" data-i18n="techStack.levels.basic">Basic</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">AI Agents with RAG and LangChain</span>
                            <span class="skill-level learning" data-i18n="techStack.levels.intermediate">Intermediate</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">Prompt Engineering</span>
                            <span class="skill-level learning" data-i18n="techStack.levels.intermediate">Intermediate</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">Generative AI and LLMs: Models and Fine-Tuning</span>
                            <span class="skill-level learning" data-i18n="techStack.levels.developing">Learning</span>
                        </div>
                    </div>
                    ` : ''}

                    <div class="skill-category">
                        <h3>🎮 XR/AR Development</h3>
                        <div class="skill-item">
                            <span class="skill-name">Unity / C#</span>
                            <span class="skill-level" data-i18n="techStack.levels.intermediate">Intermediate</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">Vuforia AR</span>
                            <span class="skill-level" data-i18n="techStack.levels.intermediate">Intermediate</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">VR Development</span>
                            <span class="skill-level" data-i18n="techStack.levels.intermediate">Intermediate</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">Google Cardboard</span>
                            <span class="skill-level" data-i18n="techStack.levels.advanced">Advanced</span>
                        </div>
                    </div>

                    <div class="skill-category">
                        <h3>💻 Full-Stack Development</h3>
                        <div class="skill-item">
                            <span class="skill-name">Python / FastAPI</span>
                            <span class="skill-level" data-i18n="techStack.levels.advanced">Advanced</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">Java / Spring</span>
                            <span class="skill-level" data-i18n="techStack.levels.intermediate">Intermediate</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">PHP / Laravel</span>
                            <span class="skill-level" data-i18n="techStack.levels.expert">Expert</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">JavaScript / AngularJS</span>
                            <span class="skill-level" data-i18n="techStack.levels.expert">Expert</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">Bootstrap</span>
                            <span class="skill-level" data-i18n="techStack.levels.advanced">Advanced</span>
                        </div>
                    </div>

                    <div class="skill-category">
                        <h3>📱 Mobile Development</h3>
                        <div class="skill-item">
                            <span class="skill-name">Flutter</span>
                            <span class="skill-level" data-i18n="techStack.levels.basic">Basic</span>
                        </div>
                    </div>

                    <div class="skill-category">
                        <h3>🗄️ Database Management Systems</h3>
                        <div class="skill-item">
                            <span class="skill-name">Oracle MySQL</span>
                            <span class="skill-level" data-i18n="techStack.levels.expert">Expert</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">MS SQL Server</span>
                            <span class="skill-level" data-i18n="techStack.levels.expert">Expert</span>
                        </div>
                    </div>

                    <div class="skill-category">
                        <h3>☁️ Infrastructure</h3>
                        <div class="skill-item">
                            <span class="skill-name">Docker</span>
                            <span class="skill-level" data-i18n="techStack.levels.advanced">Advanced</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">AWS (EC2, Serverless, IoC)</span>
                            <span class="skill-level" data-i18n="techStack.levels.intermediate">Intermediate</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">HPC Parallel Training BSC</span>
                            <span class="skill-level" data-i18n="techStack.levels.basic">Basic</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">Oracle VirtualBox</span>
                            <span class="skill-level" data-i18n="techStack.levels.expert">Expert</span>
                        </div>
                    </div>

                    <div class="skill-category">
                        <h3>🛠️ DevTools & DevOps</h3>
                        <div class="skill-item">
                            <span class="skill-name">Git</span>
                            <span class="skill-level" data-i18n="techStack.levels.intermediate">Intermediate</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">Postman</span>
                            <span class="skill-level" data-i18n="techStack.levels.advanced">Advanced</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">CI/CD Pipelines</span>
                            <span class="skill-level" data-i18n="techStack.levels.basic">Basic</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">Google Workspace</span>
                            <span class="skill-level" data-i18n="techStack.levels.advanced">Advanced</span>
                        </div>
                    </div>

                    <div class="skill-category">
                        <h3>🎵 Creative Technology</h3>
                        <div class="skill-item">
                            <span class="skill-name">Audio Engineering</span>
                            <span class="skill-level" data-i18n="techStack.levels.basic">Basic</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">Music Production</span>
                            <span class="skill-level" data-i18n="techStack.levels.advanced">Professional</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-name">Live Performance</span>
                            <span class="skill-level" data-i18n="techStack.levels.advanced">Professional</span>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderExperience(sectionConfig) {
        const showProfessionalHistory = sectionConfig.config?.showProfessionalHistory !== false;
        const showEnterpriseProjects = sectionConfig.config?.showEnterpriseProjects !== false;
        const limit = sectionConfig.config?.limit || null;

        let html = '';

        // Professional History Timeline (4 roles)
        if (showProfessionalHistory) {
            html += `
                <section class="section" data-section-id="experience-history">
                    <h2 class="section-title" data-i18n="experience.leadership.title">💼 Professional Experience Background</h2>
                    <div class="timeline">
                        <div class="timeline-item current-focus">
                            <h3 class="job-title" data-i18n="experience.student.title">Master's Student</h3>
                            <p class="company" data-i18n="experience.student.company">UPC BarcelonaTech & Independent Research</p>
                            <p class="duration">2024 - <span data-i18n="experience.badges.currentFocus">CURRENT FOCUS</span></p>
                            <ul class="achievements">
                                <li data-i18n="experience.student.achievements.specialization">Specializing in agentic AI systems, manufacturing intelligence, and autonomous business solutions</li>
                                <li data-i18n="experience.student.achievements.transition">International transition from Mexico to Spain for advanced studies in AI and computer engineering</li>
                                <li data-i18n="experience.student.achievements.research">Research focus on autonomous agent-based MRP system with predictive analytics for Master's thesis</li>
                                <li data-i18n="experience.student.achievements.certification">Currently enrolled in IBM AI Engineering Professional Certificate program</li>
                                <li data-i18n="experience.student.achievements.vr">Developing VR solutions for educational and cultural applications</li>
                            </ul>
                        </div>

                        <div class="timeline-item">
                            <h3 class="job-title" data-i18n="experience.director.title">Director of Systems, Continuous Improvement and Company Partner</h3>
                            <p class="company" data-i18n="experience.director.company">Grupo Chadorama (restaurant industry): Caprichito Bello, Taller de Pizzas</p>
                            <p class="duration"><span data-i18n="experience.director.duration">2012 - 2024</span> (<span data-i18n="experience.badges.leadership">10+ years leadership experience</span>)</p>
                            <ul class="achievements">
                                <li data-i18n="experience.director.achievements.management">Coordinated middle management, aligning objectives with business strategy</li>
                                <li data-i18n="experience.director.achievements.franchise">Coordinated development, implementation, and operation of franchise model</li>
                                <li data-i18n="experience.director.achievements.quality">Designed and coordinated the service quality evaluation system</li>
                                <li data-i18n="experience.director.achievements.workshop">Active participation in the development, launch and operation of the pizza workshop project, Taller de Pizzas</li>
                                <li data-i18n="experience.director.achievements.erp">Developed and implemented restaurant POS, invoicing, inventory management, procurement, and multi-location operations (scaled from 1 to 4 locations)</li>
                                <li data-i18n="experience.director.achievements.architecture">Led enterprise software architecture and development for multi-location retail operations</li>
                                <li data-i18n="experience.director.achievements.invoicing">Built and implemented SAT-compliant electronic invoicing system</li>
                                <li data-i18n="experience.director.achievements.teams">Managed cross-functional teams and strategic technology initiatives</li>
                            </ul>
                        </div>

                        <div class="timeline-item">
                            <h3 class="job-title" data-i18n="experience.advisor.title">Financial Subsystem Advisor</h3>
                            <p class="company" data-i18n="experience.advisor.company">Universidad Autónoma de Sinaloa (UAS)</p>
                            <p class="duration" data-i18n="experience.advisor.duration">2022 - 2024 (100K+ users)</p>
                            <ul class="achievements">
                                <li data-i18n="experience.advisor.achievements.advisory">Provided technical advisory for financial systems serving 100K+ users</li>
                                <li data-i18n="experience.advisor.achievements.analytics">Performed advanced data processing, presentation and interpretation of accounting and financial analytics using SQL Server</li>
                                <li data-i18n="experience.advisor.achievements.compliance">Led technical consulting for systems in compliance with government budget and accounting standards.</li>
                            </ul>
                        </div>

                        <div class="timeline-item">
                            <h3 class="job-title" data-i18n="experience.fullStack.title">Full-Stack Developer & Team Lead</h3>
                            <p class="company" data-i18n="experience.fullStack.company">Universidad Autónoma de Sinaloa (UAS) - Financial Subsystem</p>
                            <p class="duration" data-i18n="experience.fullStack.duration">2008 - 2022</p>
                            <ul class="achievements">
                                <li data-i18n="experience.fullStack.achievements.team">2+ years leading a team of developers for the Financial Subsystem</li>
                                <li data-i18n="experience.fullStack.achievements.verification">Development of digital expense verification</li>
                                <li data-i18n="experience.fullStack.achievements.microservices">Architecture, development, and implementation of microservices: integration into Internal Audit modules</li>
                                <li data-i18n="experience.fullStack.achievements.modernization">Legacy system modernization and internal community leadership</li>
                                <li data-i18n="experience.fullStack.achievements.publicInfo">Public information access module, general archive digitization module development</li>
                                <li data-i18n="experience.fullStack.achievements.financial">Expense verification module, financial reporting module development</li>
                                <li data-i18n="experience.fullStack.achievements.revenue">Revenue module development and maintenance</li>
                            </ul>
                        </div>
                    </div>
                </section>
            `;
        }

        // Enterprise Projects Section
        if (showEnterpriseProjects) {
            let enterpriseProjects = this.projectsData?.enterprise
                ? this.filterProjectsByProfile(this.projectsData.enterprise, 'enterprise')
                    .sort((a, b) => (a.order || 999) - (b.order || 999))
                : [];

            // Apply limit if specified
            if (limit && limit > 0) {
                enterpriseProjects = enterpriseProjects.slice(0, limit);
            }

            if (enterpriseProjects.length > 0) {
                const enterpriseHTML = enterpriseProjects
                    .map(p => this.createProjectCard(p))
                    .join('');

                html += `
                    <section class="section" data-section-id="experience-projects">
                        <h2 class="section-title" data-i18n="experience.title">💼 Professional Enterprise Projects</h2>
                        <div class="projects-grid">
                            ${enterpriseHTML}
                        </div>
                    </section>
                `;
            }
        }

        return html;
    }

    renderCommunity(sectionConfig) {
        return `
            <section class="section" data-section-id="community">
                <h2 class="section-title" data-i18n="community.title">🌍 Community Leadership & Social Impact</h2>
                <div class="timeline">
                    <div class="timeline-item">
                        <h3 class="job-title" data-i18n="community.urbanAdvisor.title">Urban Activism & Sustainable Mobility Advisor</h3>
                        <p class="company" data-i18n="community.urbanAdvisor.company">Ciclos Urbanos, PRO-Ciudad, IMPLAN</p>
                        <p class="duration" data-i18n="community.urbanAdvisor.duration">2015 - 2022</p>
                        <ul class="achievements">
                            <li data-i18n="community.urbanAdvisor.achievements.activism">Urban activism focused on sustainable mobility and public space development</li>
                            <li data-i18n="community.urbanAdvisor.achievements.projects">Sustainable mobility projects development and implementation</li>
                            <li data-i18n="community.urbanAdvisor.achievements.advisor">Citizen advisor role in local urban planning institute</li>
                            <li data-i18n="community.urbanAdvisor.achievements.collaboration">Cross-sector collaboration between government, NGOs, and civic organizations</li>
                            <li data-i18n="community.urbanAdvisor.achievements.engagement">Public space design and community engagement in urban development projects</li>
                        </ul>
                    </div>
                    <div class="timeline-item">
                        <h3 class="job-title" data-i18n="community.techCoordinator.title">Technology Community Coordinator & Startup Weekend Co-Organizer</h3>
                        <p class="company" data-i18n="community.techCoordinator.company">Comunidad Orientada a las Tecnologías de Sinaloa (COLTSIN)</p>
                        <p class="duration" data-i18n="community.techCoordinator.duration">2014 - 2016</p>
                        <ul class="achievements">
                            <li data-i18n="community.techCoordinator.achievements.coordination">Coordination of technology dissemination, promotion and development events</li>
                            <li data-i18n="community.techCoordinator.achievements.startup">Co-organizer of Startup Weekend events, fostering entrepreneurial ecosystem</li>
                            <li data-i18n="community.techCoordinator.achievements.community">Technology community building and ecosystem development</li>
                            <li data-i18n="community.techCoordinator.achievements.speakers">Speaker coordination and event management for tech conferences</li>
                            <li data-i18n="community.techCoordinator.achievements.mentorship">Mentorship and support for emerging tech entrepreneurs and startups</li>
                        </ul>
                    </div>
                    <div class="timeline-item">
                        <h3 class="job-title" data-i18n="community.pmi.title">Founder & Secretary</h3>
                        <p class="company" data-i18n="community.pmi.company">PMI Sinaloa, Mexico Chapter</p>
                        <p class="duration" data-i18n="community.pmi.duration">2011 - 2013</p>
                        <ul class="achievements">
                            <li data-i18n="community.pmi.achievements.founded">Founded and established chapter, building professional community from ground up</li>
                            <li data-i18n="community.pmi.achievements.events">Organized conferences, courses and networking events for PMI network</li>
                            <li data-i18n="community.pmi.achievements.leadership">Strategic planning and organizational leadership for chapter growth and sustainability</li>
                            <li data-i18n="community.pmi.achievements.networking">Cross-industry networking and knowledge sharing facilitation</li>
                        </ul>
                    </div>
                </div>
            </section>
        `;
    }

    renderLanguages(sectionConfig) {
        return `
            <section class="section" data-section-id="languages">
                <h2 class="section-title" data-i18n="languages.title">🌐 Languages</h2>
                <div class="languages-grid">
                    <div class="language-item">
                        <h3 class="language-name" data-i18n="languages.spanish.name">🇲🇽 Spanish</h3>
                        <p class="language-level" data-i18n="languages.spanish.level">Native</p>
                    </div>
                    <div class="language-item">
                        <h3 class="language-name" data-i18n="languages.english.name">🇺🇸 English</h3>
                        <p class="language-level" data-i18n-html="languages.english.level">Professional</p>
                    </div>
                    <div class="language-item">
                        <h3 class="language-name" data-i18n="languages.german.name">🇩🇪 German</h3>
                        <p class="language-level" data-i18n="languages.german.level">Beginner</p>
                    </div>
                    <div class="language-item">
                        <h3 class="language-name" data-i18n="languages.catalan.name">Catalan</h3>
                        <p class="language-level" data-i18n="languages.catalan.level">Basic (Reading & Listening)</p>
                    </div>
                </div>
            </section>
        `;
    }

    renderCreative(sectionConfig) {
        const showSocialLinks = sectionConfig.config?.showSocialLinks !== false;

        return `
            <section class="section creative-focus" data-section-id="creative">
                <h2 class="section-title" data-i18n="creative.title">🎵 Creative Technology Fusion</h2>
                <div style="text-align: center;">
                    <p style="font-size: 1.2rem; color: #cbd5e1; max-width: 800px; margin: 0 auto 20px; line-height: 1.8;" data-i18n="creative.text">
                        Beyond AI research and VR development, I'm <strong>The Ocean</strong> - a DJ and electronic music producer
                        who bridges the gap between <strong>creative artistry</strong> and <strong>technical innovation</strong>.
                        My audio engineering projects demonstrate how deep technical expertise can enhance creative workflows.
                    </p>
                    <p style="color: #94a3b8; margin-bottom: 20px;" data-i18n="creative.description">
                        This cross-disciplinary background enables me to bridge technical innovation with creative problem-solving,
                        creating a unique profile ideal for creative tech companies and innovation roles.
                    </p>
                    ${showSocialLinks ? `
                    <a href="https://instagram.com/theoceandj" style="display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(45deg, #06b6d4, #10b981); color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: 600; margin-top: 20px; transition: transform 0.3s ease;" target="_blank">
                        <span>🎵</span>
                        <span>Follow The Ocean DJ</span>
                    </a>
                    ` : ''}
                </div>
            </section>
        `;
    }

    renderOpportunities(sectionConfig) {
        const showCTA = sectionConfig.config?.showCTA !== false;

        return `
            <section class="section" data-section-id="opportunities" style="text-align: center; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1)); border-color: rgba(139, 92, 246, 0.3);">
                <h2 class="section-title" data-i18n="opportunities.title">🚀 Open to AI Engineering Opportunities</h2>
                <p style="font-size: 1.2rem; color: #cbd5e1; max-width: 600px; margin: 0 auto 30px; line-height: 1.8;" data-i18n="opportunities.text">
                    Seeking <strong>AI Engineering and Systems Architecture</strong> positions that leverage both
                    academic research and enterprise experience
                </p>
                ${showCTA ? `
                <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                    <a href="mailto:ochand@gmail.com" style="display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(45deg, #8b5cf6, #06b6d4); color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: 600; transition: transform 0.3s ease;">
                        <span>📧</span>
                        <span data-i18n="opportunities.contact">Contact Me</span>
                    </a>
                    <a href="https://github.com/ochand" style="display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(45deg, #333, #555); color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: 600; transition: transform 0.3s ease;" target="_blank">
                        <span>💻</span>
                        <span data-i18n="opportunities.projects">View All Projects</span>
                    </a>
                </div>
                ` : ''}
                <div style="margin-top: 30px;">
                    <p style="color: #8b5cf6; font-style: italic; max-width: 500px; margin: 0 auto;" data-i18n="opportunities.quote">
                        "Bridging 16+ years of enterprise systems expertise with cutting-edge AI research
                        to create autonomous business intelligence solutions"
                    </p>
                </div>
            </section>
        `;
    }

    /**
     * Switch to a different profile
     */
    async switchProfile(profileName) {
        try {
            await this.loadProfile(profileName);
            this.renderAllSections();

            // Trigger i18n update if available
            if (window.i18n && typeof window.i18n.translatePage === 'function') {
                window.i18n.translatePage();
            }

            // Update URL without reload
            const url = new URL(window.location);
            url.searchParams.set('profile', profileName);
            window.history.pushState({}, '', url);

            console.log(`Switched to profile: ${profileName}`);

            // Dispatch custom event for profile change
            window.dispatchEvent(new CustomEvent('profileChanged', {
                detail: { profile: profileName }
            }));
        } catch (error) {
            console.error('Failed to switch profile:', error);
        }
    }

    /**
     * Get current profile name
     */
    getCurrentProfile() {
        return this.currentProfile || 'default';
    }

    /**
     * Get all available profiles
     */
    getAvailableProfiles() {
        if (!this.profilesData) return {};
        return Object.keys(this.profilesData).map(key => ({
            id: key,
            name: this.profilesData[key].name,
            description: this.profilesData[key].description
        }));
    }

    /**
     * Apply full configuration to the page
     */
    async applyConfiguration() {
        try {
            await this.init();
            this.renderAllSections();

            // Trigger i18n update if available
            if (window.i18n && typeof window.i18n.translatePage === 'function') {
                window.i18n.translatePage();
            }

            console.log('Configuration applied successfully');
        } catch (error) {
            console.error('Failed to apply configuration:', error);
        }
    }

    // ============================================
    // MÉTODOS COMPACTOS PARA MODO RESUME
    // ============================================

    /**
     * Render Summary in compact format (2-3 lines + inline metrics)
     */
    renderSummaryCompact(sectionConfig) {
        const showStats = sectionConfig.config?.showStats !== false;

        return `
            <section class="section compact-section" data-section-id="summary">
                <h2 class="section-title compact" data-i18n="summary.title">Professional Summary</h2>
                <p class="summary-text compact" data-i18n="summary.text">
                    AI Systems Architect in Training with 16+ years enterprise experience, transitioning from enterprise leadership to AI systems development. Currently pursuing Master's in Informatics Engineering at UPC BarcelonaTech, specializing in agentic AI systems and manufacturing intelligence.
                </p>
                ${showStats ? `
                <div class="metrics-inline">
                    <span><strong>2026</strong> <span data-i18n="impact.graduation.label">Expected Graduation</span></span> |
                    <span><strong>3</strong> <span data-i18n="impact.academic.label">AI/ML Projects</span></span> |
                    <span><strong>16+</strong> <span data-i18n="impact.experience.label">Years Experience</span></span> |
                    <span><strong>100K+</strong> <span data-i18n="impact.users.label">Users Served</span></span>
                </div>
                ` : ''}
                <div class="domain-expertise-compact" style="background: #f0f9ff; border-left: 3px solid #2b6cb0; padding: 6px 10px; margin: 8px 0; font-size: 9px; line-height: 1.4;">
                    <strong style="color: #2b6cb0;">📦 <span data-i18n="summary.domainExpertise.compactTitle">Manufacturing Domain:</span></strong>
                    <span data-i18n="summary.domainExpertise.compactText">16+ years MRP/ERP (inventory, BOM, procurement, forecasting) | 300+ SKUs, 4 locations | Restaurant + Retail operations</span>
                </div>
            </section>
        `;
    }

    /**
     * Render Education in compact format (condensed list)
     */
    renderResearchCompact(sectionConfig) {
        const limit = RESUME_LIMITS.education;

        // Array de todas las entradas de educación (5 total)
        const educationEntries = [
            {
                title: 'research.master.title',
                titleText: 'Master in Informatics Engineering',
                institution: 'research.master.institution',
                institutionText: 'UPC BarcelonaTech, Barcelona, Spain (2024-2026)',
                year: null,
                yearText: null,
                badge: 'research.badges.current',
                badgeText: 'CURRENT'
            },
            {
                title: 'research.ibm.title',
                titleText: 'IBM AI Engineering Professional Certificate',
                institution: 'research.ibm.institution',
                institutionText: 'IBM via Coursera (2025-Present)',
                year: null,
                yearText: null,
                badge: 'research.badges.pursuing',
                badgeText: 'PURSUING'
            },
            {
                title: 'research.mti.title',
                titleText: 'Master in Information Technology Management',
                institution: 'research.mti.institution',
                institutionText: 'Tecnológico de Monterrey, Monterrey, Mexico',
                year: 'research.mti.year',
                yearText: '2009 - 2012',
                badge: null,
                badgeText: null
            },
            {
                title: 'research.exchange.title',
                titleText: 'International Exchange Program',
                institution: 'research.exchange.institution',
                institutionText: 'University College of Borås, Sweden',
                year: 'research.exchange.year',
                yearText: '2007',
                badge: null,
                badgeText: null
            },
            {
                title: 'research.bachelor.title',
                titleText: "Bachelor's in Information Systems Engineering",
                institution: 'research.bachelor.institution',
                institutionText: 'Tecnológico de Monterrey, Culiacán, Mexico',
                year: 'research.bachelor.year',
                yearText: '2003 - 2008',
                badge: null,
                badgeText: null
            }
        ];

        // Aplicar límite
        const limitedEntries = educationEntries.slice(0, limit);

        // Generar HTML para cada entrada
        const entriesHTML = limitedEntries.map(entry => `
            <div class="education-entry">
                <strong data-i18n="${entry.title}">${entry.titleText}</strong>
                <span class="institution" ${entry.institution ? `data-i18n="${entry.institution}"` : ''}>${entry.institutionText}</span>
                ${entry.yearText ? `<span class="year" ${entry.year ? `data-i18n="${entry.year}"` : ''}>${entry.yearText}</span>` : ''}
                ${entry.badge ? `<span class="badge-inline" data-i18n="${entry.badge}">${entry.badgeText}</span>` : ''}
            </div>
        `).join('');

        return `
            <section class="section compact-section" data-section-id="research">
                <h2 class="section-title compact" data-i18n="research.title">🎓 Education & Certifications</h2>
                <div class="education-compact">
                    ${entriesHTML}
                </div>
            </section>
        `;
    }

    /**
     * Render Projects in compact format (title + tech only)
     */
    renderProjectsCompact(sectionConfig) {
        const showAcademic = sectionConfig.config?.showAcademic !== false;
        const showCreative = sectionConfig.config?.showCreative !== false;
        const limit = RESUME_LIMITS.projects;

        let academicProjects = [];
        let creativeProjects = [];

        if (showAcademic && this.projectsData?.academic) {
            academicProjects = this.filterProjectsByProfile(this.projectsData.academic, 'academic')
                .sort((a, b) => (a.order || 999) - (b.order || 999));
        }

        if (showCreative && this.projectsData?.creative) {
            creativeProjects = this.filterProjectsByProfile(this.projectsData.creative, 'creative')
                .sort((a, b) => (a.order || 999) - (b.order || 999));
        }

        // Aplicar límite total
        const totalLimit = limit;
        let limitedAcademic = academicProjects.slice(0, totalLimit);
        let limitedCreative = creativeProjects.slice(0, Math.max(0, totalLimit - limitedAcademic.length));

        const renderProject = (project) => `
            <div class="project-compact">
                <strong class="project-title" data-i18n="${project.titleI18n}">${project.title}</strong>
                <span class="project-category" data-i18n="${project.categoryI18n}">${project.categoryLabel}</span>
                <div class="project-tech-inline">
                    ${project.technologies.slice(0, 3).map(tech => `<span class="tech-tag-small">${tech}</span>`).join(' ')}
                </div>
                ${project.impact ? `<p class="project-impact" data-i18n="${project.impactI18n}">${project.impact}</p>` : ''}
            </div>
        `;

        const academicHTML = limitedAcademic.map(renderProject).join('');
        const creativeHTML = limitedCreative.map(renderProject).join('');

        const separator = (limitedAcademic.length > 0 && limitedCreative.length > 0)
            ? '<div class="projects-separator"><span data-i18n="projects.creative.separator">Creative Projects</span></div>'
            : '';

        return `
            <section class="section compact-section" data-section-id="projects">
                <h2 class="section-title compact" data-i18n="projects.title">🎓 Projects</h2>
                <div class="projects-compact">
                    ${academicHTML}
                    ${separator}
                    ${creativeHTML}
                </div>
            </section>
        `;
    }

    /**
     * Render TechStack in compact format (inline layout similar to projects-compact)
     */
    renderTechStackCompact(sectionConfig) {
        const showAI = sectionConfig.config?.showAI !== false;
        const showLearning = sectionConfig.config?.showLearning !== false;

        return `
            <section class="section compact-section" data-section-id="techStack">
                <h2 class="section-title compact" data-i18n="techStack.title">💡 Technical Expertise</h2>
                <div class="skills-compact">
                    ${showAI ? `
                    <div class="skill-category-compact">
                        <strong data-i18n="techStack.ai.title">🤖 AI & ML (Current Focus):</strong>
                        <span>Agentic AI Systems, Agentic Coding, RAG Implementation, LLM Integration, Computer Vision, Manufacturing Intelligence</span>
                    </div>
                    ` : ''}
                    ${showLearning ? `
                    <div class="skill-category-compact">
                        <strong data-i18n="techStack.learning.title">📚 Learning Stack (IBM):</strong>
                        <span>ML, DL & NN, TensorFlow/Keras/PyTorch, AI Agents (RAG/LangChain), Prompt Engineering, Generative AI & LLMs Fine-Tuning</span>
                    </div>
                    ` : ''}
                    <div class="skill-category-compact">
                        <strong>🎮 XR/AR:</strong>
                        <span>Unity/C#, Vuforia AR, VR Development, Google Cardboard</span>
                    </div>
                    <div class="skill-category-compact">
                        <strong>💻 Full-Stack:</strong>
                        <span>Python/FastAPI, Java/Spring, PHP/Laravel, JavaScript/Angular, Bootstrap</span>
                    </div>
                    <div class="skill-category-compact">
                        <strong>🗄️ Database:</strong>
                        <span>Oracle MySQL, MS SQL Server</span>
                    </div>
                    <div class="skill-category-compact">
                        <strong>☁️ Infrastructure:</strong>
                        <span>Docker, AWS (EC2, Serverless, IoC), Parallel Training BSC, VirtualBox</span>
                    </div>
                    <div class="skill-category-compact">
                        <strong>🛠️ DevTools & DevOps:</strong>
                        <span>Git, Postman, CI/CD Pipelines, Google Workspace</span>
                    </div>
                    <div class="skill-category-compact">
                        <strong>🎵 Creative Tech:</strong>
                        <span>Audio Engineering, Music Production, Live Performance</span>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * Render Experience in compact format (dynamic roles + enterprise projects)
     */
    renderExperienceCompact(sectionConfig) {
        const limit = RESUME_LIMITS.experience;

        // Array de 4 roles profesionales con i18n
        const professionalRoles = [
            {
                titleI18n: 'experience.student.title',
                titleText: "Master's Student & VR Entrepreneur",
                companyI18n: 'experience.student.company',
                companyText: 'UPC BarcelonaTech & Independent Research',
                duration: '2024-Present',
                achievementI18n: 'experience.student.summary',
                achievement: 'Developing VR solutions while specializing in agentic AI systems and manufacturing intelligence'
            },
            {
                titleI18n: 'experience.director.title',
                titleText: 'Director of Systems, Continuous Improvement & Company Partner',
                companyI18n: 'experience.director.company',
                companyText: 'Grupo Chadorama (Restaurant Industry): Caprichito Bello, Taller de Pizzas',
                durationI18n: 'experience.director.duration',
                duration: '2012 - 2024',
                achievementI18n: 'experience.director.summary',
                achievement: 'Led enterprise software architecture for multi-location operations. Built SAT-compliant e-invoicing system'
            },
            {
                titleI18n: 'experience.advisor.title',
                titleText: 'Financial Subsystem Advisor',
                companyI18n: 'experience.advisor.company',
                companyText: 'Universidad Autónoma de Sinaloa (UAS)',
                durationI18n: 'experience.advisor.duration',
                duration: '2022 - 2024',
                achievementI18n: 'experience.advisor.summary',
                achievement: 'Technical advisory for financial systems serving 100K+ users. Advanced data processing and analytics using SQL Server'
            },
            {
                titleI18n: 'experience.fullStack.title',
                titleText: 'Full-Stack Developer & Team Lead',
                companyI18n: 'experience.fullStack.company',
                companyText: 'Universidad Autónoma de Sinaloa (UAS) - Financial Subsystem',
                durationI18n: 'experience.fullStack.duration',
                duration: '2008 - 2022',
                achievementI18n: 'experience.fullStack.summary',
                achievement: '2+ years leading dev team. Microservices architecture and legacy system modernization'
            }
        ];

        // Aplicar límite
        const limitedRoles = professionalRoles.slice(0, limit);

        // Generar HTML de roles
        const rolesHTML = limitedRoles.map(role => `
            <div class="experience-item">
                <div class="job-title" data-i18n="${role.titleI18n}">${role.titleText}</div>
                <div class="company"><span data-i18n="${role.companyI18n}">${role.companyText}</span> | ${role.duration}</div>
                <div class="achievement" data-i18n="${role.achievementI18n}">${role.achievement}</div>
            </div>
        `).join('');

        // Cargar enterprise projects dinámicamente
        let enterpriseProjects = this.projectsData?.enterprise
            ? this.filterProjectsByProfile(this.projectsData.enterprise, 'enterprise')
                .sort((a, b) => (a.order || 999) - (b.order || 999))
            : [];

        // Generar lista de proyectos enterprise
        const projectNames = enterpriseProjects
            .map(p => p.title)
            .join(', ');

        return `
            <section class="section compact-section" data-section-id="experience">
                <h2 class="section-title compact" data-i18n="experience.leadership.title">💼 Professional Experience</h2>
                ${rolesHTML}
                ${projectNames ? `
                <div class="enterprise-compact">
                    <strong>Key Enterprise Projects:</strong> ${projectNames}
                </div>
                ` : ''}
            </section>
        `;
    }

    /**
     * Render Languages in inline format
     */
    renderLanguagesCompact(sectionConfig) {
        return `
            <section class="section compact-section" data-section-id="languages">
                <h2 class="section-title compact" data-i18n="languages.title">🌐 Languages</h2>
                <div class="languages-inline">
                    <span><strong data-i18n="languages.spanish.name">Spanish:</strong> <span data-i18n="languages.spanish.level">Native</span></span> |
                    <span><strong data-i18n="languages.english.name">English:</strong> <span data-i18n="languages.english.level">Professional</span></span> |
                    <span><strong data-i18n="languages.german.name">German:</strong> <span data-i18n="languages.german.level">Beginner</span></span> |
                    <span><strong data-i18n="languages.catalan.name">Catalan:</strong> <span data-i18n="languages.catalan.level">Basic (Reading & Listening)</span></span>
                </div>
            </section>
        `;
    }
}

// Export for global use
window.TemplateEngine = TemplateEngine;

// Auto-initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
    const templateEngine = new TemplateEngine();
    await templateEngine.init();

    // Check if we should use dynamic rendering
    const useDynamic = document.body.hasAttribute('data-dynamic-rendering');
    if (useDynamic) {
        await templateEngine.applyConfiguration();
    }

    window.templateEngine = templateEngine;
    console.log('Template Engine ready');
});
