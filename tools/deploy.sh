#!/bin/bash

# Configuration
SITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${SITE_DIR}/backups/$(date +%Y%m%d_%H%M%S)"
PROCESSED_DIR="${SITE_DIR}/content/processed"
REMOTE_USER="your-username"
REMOTE_HOST="your-host"
REMOTE_PATH="/var/www/html"
REMOTE_BACKUP_PATH="/var/www/backups"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${2:-$NC}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Error handling
set -e
trap 'catch $? $LINENO' ERR

catch() {
    if [ "$1" != "0" ]; then
        log "Error $1 occurred on line $2" "$RED"
        # Attempt rollback if deployment started
        if [ -d "$BACKUP_DIR" ]; then
            log "Attempting rollback..." "$YELLOW"
            ssh $REMOTE_USER@$REMOTE_HOST "cp -r $REMOTE_BACKUP_PATH/* $REMOTE_PATH/"
            log "Rollback completed" "$GREEN"
        fi
        exit 1
    fi
}

# Check if required commands exist
check_requirements() {
    local requirements=(deno ssh rsync curl)
    for cmd in "${requirements[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            log "Error: $cmd is required but not installed." "$RED"
            exit 1
        fi
    done
}

# Validate HTML files
validate_html() {
    local file="$1"
    local errors=0
    
    # Basic HTML validation
    if ! grep -q "<!DOCTYPE html>" "$file"; then
        log "Error: Missing DOCTYPE in $file" "$RED"
        errors=$((errors + 1))
    fi
    
    if ! grep -q "<title>" "$file"; then
        log "Error: Missing title in $file" "$RED"
        errors=$((errors + 1))
    fi
    
    # Check for broken internal links
    local internal_links=$(grep -o 'href="[^"]*"' "$file" | grep -v "^http" | cut -d'"' -f2)
    for link in $internal_links; do
        if [[ $link == /* ]]; then
            if [ ! -f "${SITE_DIR}${link}" ]; then
                log "Error: Broken internal link $link in $file" "$RED"
                errors=$((errors + 1))
            fi
        fi
    done
    
    return $errors
}

# Run basic smoke tests
run_smoke_tests() {
    local url="$1"
    local errors=0
    
    # Test main page
    if ! curl -s -f -I "$url" &>/dev/null; then
        log "Error: Main page not accessible" "$RED"
        errors=$((errors + 1))
    fi
    
    # Test CSS
    if ! curl -s -f -I "$url/styles.css" &>/dev/null; then
        log "Error: CSS not accessible" "$RED"
        errors=$((errors + 1))
    fi
    
    # Test JavaScript files
    local js_files=("darkmode.js" "toc.js" "footnotes.js")
    for js in "${js_files[@]}"; do
        if ! curl -s -f -I "$url/js/$js" &>/dev/null; then
            log "Error: $js not accessible" "$RED"
            errors=$((errors + 1))
        fi
    done
    
    return $errors
}

# Main deployment process
main() {
    log "Starting deployment process..." "$GREEN"
    
    # Check requirements
    check_requirements
    
    # Create backup directory
    log "Creating backup directory..."
    mkdir -p "$BACKUP_DIR"
    
    # Backup current processed content
    if [ -d "$PROCESSED_DIR" ]; then
        log "Backing up current content..."
        cp -r "$PROCESSED_DIR" "$BACKUP_DIR/"
    fi
    
    # Run conversion script
    log "Converting markdown to HTML..."
    if ! deno run --allow-read --allow-write "${SITE_DIR}/tools/convert.js"; then
        log "Conversion failed" "$RED"
        exit 1
    fi
    
    # Validate generated HTML
    log "Validating HTML files..."
    local validation_errors=0
    for file in "$PROCESSED_DIR"/*.html; do
        if ! validate_html "$file"; then
            validation_errors=$((validation_errors + 1))
        fi
    done
    
    if [ $validation_errors -gt 0 ]; then
        log "Validation failed with $validation_errors errors" "$RED"
        exit 1
    fi
    
    # Create remote backup
    log "Creating remote backup..."
    ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_BACKUP_PATH && cp -r $REMOTE_PATH/* $REMOTE_BACKUP_PATH/"
    
    # Deploy to remote server
    log "Deploying to remote server..."
    rsync -avz --delete \
        --exclude '.git/' \
        --exclude 'tools/' \
        --exclude 'content/essays/' \
        --exclude 'backups/' \
        "$SITE_DIR/" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
    
    # Clear CDN cache if configured
    if [ -n "${CDN_PURGE_URL:-}" ]; then
        log "Clearing CDN cache..."
        curl -X POST "$CDN_PURGE_URL"
    fi
    
    # Run smoke tests
    log "Running smoke tests..."
    if ! run_smoke_tests "https://yourdomain.com"; then
        log "Smoke tests failed" "$RED"
        exit 1
    fi
    
    log "Deployment completed successfully!" "$GREEN"
}

# Run main function
main

