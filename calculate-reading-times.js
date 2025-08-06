// Script to calculate reading times for all essays
document.addEventListener('DOMContentLoaded', async function() {
    const essayItems = document.querySelectorAll('.essay-item');
    
    // Map of essay URLs to their calculated reading times
    const readingTimes = {};
    
    // Dynamically get all essay URLs from the page
    const essays = [];
    essayItems.forEach(item => {
        const link = item.querySelector('.essay-title a');
        if (link) {
            const href = link.getAttribute('href');
            if (href && href.endsWith('.html')) {
                essays.push(href);
            }
        }
    });
    
    // Function to fetch and calculate word count
    async function calculateReadingTime(url) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            
            // Parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Get article content
            const article = doc.querySelector('article');
            if (!article) return null;
            
            // Get text content and calculate word count
            const text = article.textContent || '';
            const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
            
            // Calculate reading time (225 words per minute)
            const wordsPerMinute = 225;
            const minutes = Math.ceil(words / wordsPerMinute);
            
            return minutes;
        } catch (error) {
            console.error(`Error calculating reading time for ${url}:`, error);
            return null;
        }
    }
    
    // Calculate all reading times
    for (const essay of essays) {
        const minutes = await calculateReadingTime(essay);
        if (minutes !== null) {
            readingTimes[essay] = minutes;
        }
    }
    
    // Update the display
    essayItems.forEach(item => {
        const link = item.querySelector('.essay-title a');
        const dateElement = item.querySelector('.essay-date');
        
        if (link && dateElement) {
            const href = link.getAttribute('href');
            const readingTime = readingTimes[href];
            
            if (readingTime) {
                // Extract the existing date text (before the · separator)
                const dateText = dateElement.textContent.split('·')[0].trim();
                
                // Update with calculated reading time
                dateElement.textContent = `${dateText} · ${readingTime} min read`;
            }
        }
    });
});