/**
 * Footnotes Manager
 * Handles bi-directional footnote navigation and accessibility
 */
class FootnotesManager {
    constructor() {
        // Configuration
        this.options = {
            scrollOffset: 60, // Pixels from top when scrolling to footnotes
            scrollBehavior: 'smooth',
            footnoteSelector: '.footnote-ref',
            backrefSelector: '.footnote-backref'
        };

        this.init();
    }

    init() {
        // Set up click handlers for footnote references
        document.querySelectorAll(this.options.footnoteSelector).forEach(ref => {
            ref.addEventListener('click', this.handleFootnoteClick.bind(this));
            this.enhanceFootnoteRef(ref);
        });

        // Set up click handlers for back references
        document.querySelectorAll(this.options.backrefSelector).forEach(backref => {
            backref.addEventListener('click', this.handleBackrefClick.bind(this));
            this.enhanceBackref(backref);
        });
    }

    enhanceFootnoteRef(ref) {
        // Add ARIA attributes for accessibility
        ref.setAttribute('role', 'doc-noteref');
        ref.setAttribute('aria-label', 'See footnote');
        
        // Create tooltip container
        const tooltip = document.createElement('span');
        tooltip.className = 'footnote-tooltip';
        tooltip.setAttribute('role', 'tooltip');
        tooltip.hidden = true;

        // Get footnote content
        const footnoteId = ref.getAttribute('href').slice(1);
        const footnoteContent = document.getElementById(footnoteId)
            ?.querySelector('p')?.textContent;

        if (footnoteContent) {
            tooltip.textContent = footnoteContent;
            ref.appendChild(tooltip);
            
            // Show/hide tooltip on hover
            ref.addEventListener('mouseenter', () => tooltip.hidden = false);
            ref.addEventListener('mouseleave', () => tooltip.hidden = true);
        }
    }

    enhanceBackref(backref) {
        backref.setAttribute('role', 'doc-backlink');
        backref.setAttribute('aria-label', 'Return to text');
    }

    handleFootnoteClick(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);

        if (target) {
            this.scrollToElement(target);
            target.focus({ preventScroll: true });
        }
    }

    handleBackrefClick(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);

        if (target) {
            this.scrollToElement(target);
            target.focus({ preventScroll: true });
        }
    }

    scrollToElement(element) {
        const rect = element.getBoundingClientRect();
        const absoluteTop = window.pageYOffset + rect.top - this.options.scrollOffset;

        window.scrollTo({
            top: absoluteTop,
            behavior: this.options.scrollBehavior
        });
    }
}

// Initialize footnotes functionality
const footnotes = new FootnotesManager();
