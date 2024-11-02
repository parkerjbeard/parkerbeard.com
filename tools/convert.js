/**
 * Simple Markdown to HTML converter
 * Processes markdown files into static HTML pages
 */
class MarkdownConverter {
    constructor() {
        this.footnotes = [];
        this.headings = [];
        this.errors = [];
    }

    async processFile(inputPath) {
        try {
            console.log('Processing file:', inputPath);
            
            const markdown = await this.readFile(inputPath);
            const frontMatter = this.extractFrontMatter(markdown);
            const content = this.convertMarkdownToHtml(markdown);
            const template = await this.readFile('./tools/templates/page-template.html');
            
            const html = this.injectIntoTemplate(template, {
                title: frontMatter.title,
                description: frontMatter.description,
                date: frontMatter.date,
                content: content,
                footnotes: this.generateFootnotesHtml(),
                toc: this.generateTocHtml()
            });

            const outputPath = this.getOutputPath(inputPath);
            console.log('Writing to:', outputPath);
            
            await this.writeFile(outputPath, html);
            
            this.reportErrors();
        } catch (error) {
            console.error('Error processing file:', error);
            throw error;
        }
    }

    extractFrontMatter(markdown) {
        const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
        const match = markdown.match(frontMatterRegex);
        
        if (!match) return {};
        
        const frontMatter = {};
        const lines = match[1].split('\n');
        
        lines.forEach(line => {
            const [key, ...value] = line.split(':');
            if (key && value) {
                frontMatter[key.trim()] = value.join(':').trim();
            }
        });

        return frontMatter;
    }

    convertMarkdownToHtml(markdown) {
        // Remove front matter
        markdown = markdown.replace(/^---\n[\s\S]*?\n---\n/, '');

        // Process markdown elements
        let html = markdown
            // Headers
            .replace(/^#{1,6}\s+(.+)$/gm, (match, content) => {
                const level = match.trim().indexOf(' ');
                const id = this.slugify(content);
                this.headings.push({ level, content, id });
                return `<h${level} id="${id}">${content}</h${level}>`;
            })
            
            // Footnotes
            .replace(/\[\^(\d+)\]:\s+(.+)$/gm, (match, ref, content) => {
                this.footnotes.push({ ref, content });
                return '';
            })
            .replace(/\[\^(\d+)\]/g, (match, ref) => {
                return `<a href="#fn${ref}" id="fnref${ref}" class="footnote-ref">[${ref}]</a>`;
            })
            
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
                const isExternal = url.startsWith('http');
                const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
                return `<a href="${url}"${attrs}>${text}</a>`;
            })
            
            // Bold
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            
            // Italic
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            
            // Lists
            .replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
            
            // Paragraphs
            .replace(/^(?!<[hou])[^\n].+(?:\n[^\n].+)*/gm, '<p>$&</p>');

        return html;
    }

    generateFootnotesHtml() {
        return this.footnotes
            .map(({ ref, content }) => `
                <li id="fn${ref}">
                    <p>${content} <a href="#fnref${ref}" class="footnote-backref" aria-label="Return to text">↩</a></p>
                </li>
            `)
            .join('\n');
    }

    generateTocHtml() {
        const toc = [];
        let currentLevel = 1;
        
        this.headings.forEach(({ level, content, id }) => {
            const indent = '  '.repeat(level - 1);
            toc.push(`${indent}<li><a href="#${id}" class="toc-link">${content}</a></li>`);
        });

        return `<ul class="toc-list">\n${toc.join('\n')}\n</ul>`;
    }

    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    injectIntoTemplate(template, data) {
        return template
            .replace(/{{TITLE}}/g, data.title)
            .replace(/{{DESCRIPTION}}/g, data.description)
            .replace(/{{DATE_ISO}}/g, new Date(data.date).toISOString().split('T')[0])
            .replace(/{{DATE_FORMATTED}}/g, new Date(data.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }))
            .replace(/{{CONTENT}}/g, data.content)
            .replace(/{{FOOTNOTES}}/g, data.footnotes)
            .replace(/{{TOC}}/g, data.toc);
    }

    validateHtml(html) {
        // Basic HTML validation
        const openTags = [];
        const tagRegex = /<\/?([a-z0-9]+)[^>]*>/gi;
        let match;

        while ((match = tagRegex.exec(html)) !== null) {
            const [fullTag, tagName] = match;
            if (!fullTag.startsWith('</')) {
                if (!fullTag.includes('/>')) {
                    openTags.push(tagName);
                }
            } else {
                const lastTag = openTags.pop();
                if (lastTag !== tagName) {
                    this.errors.push(`Mismatched HTML tags: ${lastTag} and ${tagName}`);
                }
            }
        }

        if (openTags.length > 0) {
            this.errors.push(`Unclosed HTML tags: ${openTags.join(', ')}`);
        }
    }

    reportErrors() {
        if (this.errors.length > 0) {
            console.error('\nErrors found:');
            this.errors.forEach(error => console.error(`- ${error}`));
        }
    }

    async readFile(path) {
        try {
            return await Deno.readTextFile(path);
        } catch (error) {
            throw new Error(`Failed to read file ${path}: ${error}`);
        }
    }

    async writeFile(path, content) {
        try {
            await Deno.writeTextFile(path, content);
        } catch (error) {
            throw new Error(`Failed to write file ${path}: ${error}`);
        }
    }

    getOutputPath(inputPath) {
        // Create path in content/processed directory
        const outputDir = './content/processed';
        
        // Extract the filename
        const filename = inputPath.split('/').pop();
        
        // Create output directory if it doesn't exist
        try {
            Deno.mkdirSync(outputDir, { recursive: true });
        } catch (error) {
            if (!(error instanceof Deno.errors.AlreadyExists)) {
                throw error;
            }
        }

        console.log(`Converting ${inputPath} -> ${outputDir}/${filename.replace('.md', '.html')}`);
        return `${outputDir}/${filename.replace('.md', '.html')}`;
    }
}

// CLI interface
if (import.meta.main) {
    const converter = new MarkdownConverter();
    
    try {
        if (Deno.args.includes('--watch')) {
            const watcher = Deno.watchFs('./content/essays');
            console.log('Watching for changes...');
            
            for await (const event of watcher) {
                if (event.kind === 'modify' && event.paths[0].endsWith('.md')) {
                    console.log(`Processing ${event.paths[0]}...`);
                    await converter.processFile(event.paths[0]);
                }
            }
        } else {
            // Single run mode with error handling
            const files = [];
            for await (const file of Deno.readDir('./content/essays')) {
                if (file.name.endsWith('.md')) {
                    files.push(file);
                }
            }
            
            if (files.length === 0) {
                console.log('No markdown files found in ./content/essays');
            }

            for (const file of files) {
                console.log(`Processing ${file.name}...`);
                await converter.processFile(`./content/essays/${file.name}`);
            }
        }
    } catch (error) {
        console.error('Fatal error:', error);
        Deno.exit(1);
    }
}
