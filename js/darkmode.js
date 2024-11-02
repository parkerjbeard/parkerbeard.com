/**
 * Dark Mode Manager
 * Handles theme switching, persistence, and system preference detection
 */
class DarkModeManager {
    constructor() {
        // DOM elements
        this.root = document.documentElement;
        this.toggleBtn = document.querySelector('.theme-toggle');
        
        // Bind methods
        this.toggleTheme = this.toggleTheme.bind(this);
        this.handleSystemPreference = this.handleSystemPreference.bind(this);
        
        // Initialize
        this.init();
    }

    init() {
        // Add toggle button listener
        this.toggleBtn?.addEventListener('click', this.toggleTheme);
        
        // Watch system preference changes
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', this.handleSystemPreference);
        
        // Set initial theme
        this.setInitialTheme();
    }

    setInitialTheme() {
        // Check local storage first
        const storedTheme = localStorage.getItem('theme');
        
        if (storedTheme) {
            this.setTheme(storedTheme === 'dark');
            return;
        }

        // Fall back to system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(prefersDark);
    }

    toggleTheme() {
        const isDark = this.root.classList.contains('dark-mode');
        this.setTheme(!isDark);
    }

    setTheme(isDark) {
        // Update DOM
        this.root.classList.toggle('dark-mode', isDark);
        
        // Update button aria-label
        if (this.toggleBtn) {
            this.toggleBtn.setAttribute('aria-label', 
                isDark ? 'Switch to light mode' : 'Switch to dark mode');
            
            // Add pressed state for accessibility
            this.toggleBtn.setAttribute('aria-pressed', isDark);
        }
        
        // Store preference
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    handleSystemPreference(e) {
        // Only follow system preference if no stored preference exists
        if (!localStorage.getItem('theme')) {
            this.setTheme(e.matches);
        }
    }
}

// Initialize dark mode functionality
const darkMode = new DarkModeManager();
