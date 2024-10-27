// Configuration
const config = {
    defaultPost: 'post1.md',
    postsDirectory: 'posts/',
    contentElement: 'content'
};

// Cache object for storing fetched posts
const postCache = new Map();

/**
 * Loads and renders a markdown post
 * @param {string} filename - The markdown file to load
 */
async function loadPost(filename) {
    const contentElement = document.getElementById(config.contentElement);
    
    try {
        // Show loading state
        contentElement.innerHTML = '<div class="loading">Loading post...</div>';
        
        // Check cache first
        if (postCache.has(filename)) {
            contentElement.innerHTML = postCache.get(filename);
            return;
        }

        const response = await fetch(`${config.postsDirectory}${filename}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const markdown = await response.text();
        
        // Basic validation of markdown content
        if (!markdown.trim()) {
            throw new Error('Empty markdown file');
        }
        
        // Use the marked.parse() method instead of marked directly
        const htmlContent = marked.parse(markdown);
        
        // Cache the rendered HTML
        postCache.set(filename, htmlContent);
        
        // Update the DOM
        contentElement.innerHTML = htmlContent;

        // Update URL without page reload
        history.pushState({ post: filename }, '', `?post=${filename}`);
        
    } catch (error) {
        console.error('Error loading post:', error);
        contentElement.innerHTML = `
            <div class="error">
                <h2>Post Not Found</h2>
                <p>The requested post could not be loaded. Please check the filename and try again.</p>
                <pre>${error.message}</pre>
            </div>
        `;
    }
}

/**
 * Displays an error message in the content area
 * @param {HTMLElement} element - The element to show the error in
 */
function showErrorMessage(element) {
    element.innerHTML = `
        <div class="error">
            <h2>Oops! Something went wrong</h2>
            <p>Unable to load the post. Please try again later.</p>
        </div>
    `;
}

/**
 * Loads the landing page
 */
async function loadLandingPage() {
    const contentElement = document.getElementById(config.contentElement);
    try {
        const response = await fetch('posts/index.json');
        const posts = await response.json();
        
        const landingHTML = `
            <div class="posts-list">
                ${posts.map(post => `
                    <div class="post-link">
                        <span class="post-date">${new Date(post.date).toLocaleDateString()}</span>
                        <a href="?post=${post.filename}">${post.title}</a>
                    </div>
                `).join('')}
            </div>
        `;
        
        contentElement.innerHTML = landingHTML;
    } catch (error) {
        showErrorMessage(contentElement);
    }
}

/**
 * Initializes the blog functionality
 */
function initBlog() {
    // Set up marked.js options
    marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: true,
        mangle: false
    });

    // Load landing page or specific post based on URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const postToLoad = urlParams.get('post');
    
    if (postToLoad) {
        loadPost(postToLoad);
    } else {
        loadLandingPage();
    }
}

/**
 * Creates navigation links for available posts
 */
async function setupNavigation() {
    try {
        const response = await fetch('posts/index.json');
        if (!response.ok) {
            console.log('No navigation index found - skipping navigation setup');
            return; // Gracefully handle missing navigation
        }
        
        const posts = await response.json();
        const nav = document.createElement('nav');
        nav.className = 'post-navigation';
        
        posts.forEach(post => {
            const link = document.createElement('a');
            link.href = `?post=${post.filename}`;
            link.textContent = post.title;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                loadPost(post.filename);
            });
            nav.appendChild(link);
        });

        document.querySelector('header').appendChild(nav);
    } catch (error) {
        console.log('Navigation setup skipped:', error);
        // Don't show an error to the user, just skip navigation
    }
}

// Initialize when DOM is ready and marked is available
document.addEventListener('DOMContentLoaded', () => {
    // Check if marked is loaded
    if (typeof marked === 'undefined') {
        console.error('Marked.js is not loaded!');
        document.getElementById(config.contentElement).innerHTML = `
            <div class="error">
                <h2>Error</h2>
                <p>Required dependencies are not loaded. Please check the console for more information.</p>
            </div>
        `;
        return;
    }
    
    initBlog();
});

// Debounced scroll handler for potential future use
const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

// Example scroll handler (commented out until needed)
/*
window.addEventListener('scroll', debounce(() => {
    // Handle scroll events
}, 100));
*/
