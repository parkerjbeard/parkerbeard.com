document.addEventListener('DOMContentLoaded', function() {
    const article = document.querySelector('article');
    const readTimeElement = document.querySelector('.read-time');
    
    if (!article || !readTimeElement) return;
    
    // Get text content and calculate word count
    const text = article.textContent || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    // Average reading speed: 200-250 words per minute
    // Using 225 as a balanced average
    const wordsPerMinute = 225;
    const minutes = Math.ceil(words / wordsPerMinute);
    
    // Update the read time display
    readTimeElement.textContent = `${minutes} min read`;
});