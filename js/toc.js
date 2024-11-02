/**
 * Table of Contents Manager
 * Handles TOC generation, navigation, and scroll highlighting
 */
class TableOfContents {
    constructor() {
        this.config = {
            contentSelector: 'article',
            headingSelector: 'h2, h3',
            tocSelector: '.toc',
            activeClass: 'active',
            scrollOffset: 100,
            intersectionThreshold: 0.2
        };

        this.content = document.querySelector(this.config.contentSelector);
        this.toc = document.querySelector(this.config.tocSelector);
        
        if (this.content && this.toc) {
            this.headings = Array.from(
                this.content.querySelectorAll(this.config.headingSelector)
            );
            
            this.generateTOC();
            this.setupIntersectionObserver();
            this.setupScrollHandling();
        }
    }

    generateTOC() {
        const list = document.createElement('ul');
        list.className = 'toc-list';

        this.headings.forEach(heading => {
            // Ensure heading has an ID
            if (!heading.id) {
                heading.id = this.generateId(heading);
            }

            const item = document.createElement('li');
            const link = document.createElement('a');
            
            link.href = `#${heading.id}`;
            link.textContent = heading.textContent;
            link.className = 'toc-link';
            link.dataset.level = heading.tagName.toLowerCase();
            
            item.appendChild(link);
            list.appendChild(item);
        });

        // Clear existing TOC content except the title
        Array.from(this.toc.children).forEach(child => {
            if (!child.classList.contains('toc-title')) {
                child.remove();
            }
        });
        
        this.toc.appendChild(list);
        this.setupTOCClickHandlers();
    }

    setupTOCClickHandlers() {
        this.toc.querySelectorAll('.toc-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                const targetHeading = document.getElementById(targetId);
                
                if (targetHeading) {
                    const offset = this.config.scrollOffset;
                    const targetPosition = targetHeading.getBoundingClientRect().top + window.pageYOffset - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    history.pushState(null, '', `#${targetId}`);
                }
            });
        });
    }

    generateId(heading) {
        return heading.textContent
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    const id = entry.target.getAttribute('id');
                    const link = this.toc.querySelector(`[href="#${id}"]`);
                    
                    if (link) {
                        if (entry.isIntersecting) {
                            // Remove active class from all links
                            this.toc.querySelectorAll('.toc-link').forEach(
                                link => link.classList.remove('active')
                            );
                            // Add active class to current link
                            link.classList.add('active');
                        }
                    }
                });
            },
            {
                rootMargin: `-${this.config.scrollOffset}px 0px 0px 0px`,
                threshold: this.config.intersectionThreshold
            }
        );

        this.content.querySelectorAll(this.config.headingSelector)
            .forEach(heading => observer.observe(heading));
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TableOfContents();
});
