class I18n {
    constructor() {
        this.currentLang = 'en';
        this.translations = {};
        this.supportedLanguages = ['en', 'es'];
        this.fallbackLang = 'en';
        
        this.init();
    }

    async init() {
        try {
            await this.detectLanguage();
            await this.loadTranslations();
            // this.createLanguageSwitcher(); // Disabled - using manual HTML switcher
            this.setupRouting();
            this.translatePage();
        } catch (error) {
            console.error('i18n initialization failed:', error);
        }
    }

    async detectLanguage() {
        const urlLang = this.getLanguageFromURL();
        const storedLang = localStorage.getItem('preferred-language');
        const browserLang = navigator.language.split('-')[0];
        
        if (urlLang && this.supportedLanguages.includes(urlLang)) {
            this.currentLang = urlLang;
        } else if (storedLang && this.supportedLanguages.includes(storedLang)) {
            this.currentLang = storedLang;
        } else if (this.supportedLanguages.includes(browserLang)) {
            this.currentLang = browserLang;
        } else {
            this.currentLang = this.fallbackLang;
        }
        
        localStorage.setItem('preferred-language', this.currentLang);
    }

    getLanguageFromURL() {
        const path = window.location.pathname;
        const langMatch = path.match(/^\/([a-z]{2})\//);
        return langMatch ? langMatch[1] : null;
    }

    async loadTranslations() {
        try {
            // Use simple relative path from the root directory
            const translationUrl = `/locales/${this.currentLang}.json`;
            
            const response = await fetch(translationUrl);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${this.currentLang}`);
            }
            this.translations = await response.json();
        } catch (error) {
            if (this.currentLang !== this.fallbackLang) {
                this.currentLang = this.fallbackLang;
                const fallbackUrl = `/locales/${this.fallbackLang}.json`;
                const fallbackResponse = await fetch(fallbackUrl);
                this.translations = await fallbackResponse.json();
            }
        }
    }

    createLanguageSwitcher() {
        // Check if switcher already exists
        const existingSwitcher = document.querySelector('.language-switcher');
        if (existingSwitcher) {
            this.bindLanguageSwitcherEvents(existingSwitcher);
            this.updateLanguageDisplay();
            return;
        }

        const languageNames = {
            'en': 'English',
            'es': 'Español'
        };

        const switcher = document.createElement('div');
        switcher.className = 'language-switcher';
        switcher.innerHTML = `
            <div class="language-dropdown">
                <button class="language-button" aria-label="${this.t('language.selector')}">
                    <span class="language-icon">🌐</span>
                    <span class="language-text">${languageNames[this.currentLang]}</span>
                    <span class="dropdown-arrow">▼</span>
                </button>
                <div class="language-menu">
                    ${this.supportedLanguages.map(lang => `
                        <button class="language-option ${lang === this.currentLang ? 'active' : ''}" 
                                data-lang="${lang}">
                            ${languageNames[lang]}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        const header = document.querySelector('.header .container');
        if (header) {
            header.style.position = 'relative';
            header.appendChild(switcher);
        }

        this.addLanguageSwitcherStyles();
        this.bindLanguageSwitcherEvents(switcher);
    }

    updateLanguageDisplay() {
        const languageCodes = {
            'en': 'EN',
            'es': 'ES'
        };
        
        const languageText = document.querySelector('.language-text');
        if (languageText) {
            languageText.textContent = languageCodes[this.currentLang];
        }
        
        const options = document.querySelectorAll('.language-option');
        options.forEach(option => {
            option.classList.toggle('active', option.dataset.lang === this.currentLang);
        });
    }

    addLanguageSwitcherStyles() {
        const styles = `
            .language-switcher {
                position: absolute;
                top: 20px;
                right: 20px;
                z-index: 1000;
            }
            
            .header .container {
                position: relative;
            }

            .language-dropdown {
                position: relative;
            }

            .language-button {
                display: flex;
                align-items: center;
                gap: 8px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                padding: 8px 12px;
                color: #e2e8f0;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s ease;
            }

            .language-button:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(59, 130, 246, 0.5);
            }

            .language-icon {
                font-size: 1.1rem;
            }

            .dropdown-arrow {
                font-size: 0.7rem;
                transition: transform 0.3s ease;
            }

            .language-dropdown.open .dropdown-arrow {
                transform: rotate(180deg);
            }

            .language-menu {
                position: absolute;
                top: 100%;
                right: 0;
                background: rgba(10, 10, 26, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                min-width: 120px;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                margin-top: 4px;
            }

            .language-dropdown.open .language-menu {
                opacity: 1 !important;
                visibility: visible !important;
                transform: translateY(0);
            }
            
            .language-button:hover {
                background: rgba(255, 255, 255, 0.15) !important;
                border-color: rgba(59, 130, 246, 0.5) !important;
            }

            .language-option {
                width: 100%;
                padding: 10px 15px;
                background: none;
                border: none;
                color: #e2e8f0;
                cursor: pointer;
                font-size: 0.9rem;
                text-align: left;
                transition: background-color 0.2s ease;
            }

            .language-option:hover {
                background: rgba(59, 130, 246, 0.2);
            }

            .language-option.active {
                background: rgba(59, 130, 246, 0.3);
                color: #3b82f6;
            }

            .language-option:first-child {
                border-radius: 7px 7px 0 0;
            }

            .language-option:last-child {
                border-radius: 0 0 7px 7px;
            }

            @media (max-width: 768px) {
                .language-switcher {
                    position: relative;
                    top: 0;
                    right: 0;
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: center;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    bindLanguageSwitcherEvents(switcher) {
        const button = switcher.querySelector('.language-button');
        const dropdown = switcher.querySelector('.language-dropdown');
        const options = switcher.querySelectorAll('.language-option');

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('open');
        });

        options.forEach(option => {
            option.addEventListener('click', async (e) => {
                const lang = e.target.dataset.lang;
                if (lang && lang !== this.currentLang) {
                    await this.changeLanguage(lang);
                }
                dropdown.classList.remove('open');
            });
        });
    }

    async changeLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) return;
        
        this.currentLang = lang;
        localStorage.setItem('preferred-language', lang);
        
        await this.loadTranslations();
        this.translatePage();
        this.updateLanguageDisplay();
        // this.updateURL(); // Disabled to avoid URL routing issues
        
        document.documentElement.lang = lang;
    }

    updateURL() {
        const currentPath = window.location.pathname;
        const currentLangPattern = /^\/([a-z]{2})\//;
        
        let newPath;
        if (this.currentLang === 'en') {
            newPath = currentPath.replace(currentLangPattern, '/');
        } else {
            if (currentLangPattern.test(currentPath)) {
                newPath = currentPath.replace(currentLangPattern, `/${this.currentLang}/`);
            } else {
                newPath = `/${this.currentLang}${currentPath}`;
            }
        }
        
        if (newPath !== currentPath) {
            window.history.pushState({}, '', newPath);
        }
    }

    setupRouting() {
        window.addEventListener('popstate', async () => {
            await this.detectLanguage();
            await this.loadTranslations();
            this.translatePage();
        });
    }

    t(key, fallback = '') {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return fallback || key;
            }
        }
        
        return typeof value === 'string' ? value : fallback || key;
    }

    translatePage() {
        this.updateMetaTags();
        this.translateElements();
    }

    updateMetaTags() {
        document.title = this.t('meta.title');
        
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', this.t('meta.description'));
        }
        
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            metaKeywords.setAttribute('content', this.t('meta.keywords'));
        }
        
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.setAttribute('content', this.t('meta.ogTitle'));
        }
        
        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
            ogDescription.setAttribute('content', this.t('meta.ogDescription'));
        }
        
        document.documentElement.lang = this.currentLang;
    }

    translateElements() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.hasAttribute('data-i18n-placeholder')) {
                element.placeholder = translation;
            } else if (element.hasAttribute('data-i18n-title')) {
                element.title = translation;
            } else if (element.hasAttribute('data-i18n-html')) {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.i18n = new I18n();
});