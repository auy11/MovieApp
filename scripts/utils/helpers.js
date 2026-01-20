// Yardımcı fonksiyonlar
class Helpers {
    
    // Format date
    static formatDate(dateString, format = 'long') {
        if (!dateString) return 'Tarih Yok';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Geçersiz Tarih';
        
        const options = {
            year: 'numeric',
            month: format === 'short' ? 'short' : 'long',
            day: 'numeric'
        };
        
        return date.toLocaleDateString('tr-TR', options);
    }
    
    // Format currency
    static formatCurrency(amount, currency = 'USD') {
        if (!amount || isNaN(amount)) return 'Bilinmiyor';
        
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    // Format runtime (dakika → saat:dakika)
    static formatRuntime(minutes) {
        if (!minutes || isNaN(minutes)) return 'Bilinmiyor';
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours === 0) {
            return `${mins} dakika`;
        }
        
        return `${hours} saat ${mins} dakika`;
    }
    
    // Generate star rating HTML
    static generateStars(rating, maxRating = 10) {
        const normalizedRating = (rating / maxRating) * 5;
        const fullStars = Math.floor(normalizedRating);
        const halfStar = normalizedRating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let starsHTML = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (halfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }
        
        return starsHTML;
    }
    
    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle function
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Safe JSON parse
    static safeJSONParse(str, defaultValue = null) {
        try {
            return JSON.parse(str);
        } catch (error) {
            console.warn('JSON parse hatası:', error);
            return defaultValue;
        }
    }
    
    // Clamp number
    static clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }
    
    // Generate random ID
    static generateId(length = 8) {
        return Math.random().toString(36).substr(2, length);
    }
    
    // Deep clone object
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    // Merge objects
    static mergeObjects(...objects) {
        return Object.assign({}, ...objects);
    }
    
    // Check if element is in viewport
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // Smooth scroll to element
    static smoothScrollTo(element, duration = 500) {
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        
        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        requestAnimationFrame(animation);
    }
    
    // Format file size
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Validate email
    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Validate URL
    static isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    // Capitalize first letter
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    // Truncate text
    static truncateText(text, maxLength = 100) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength).trim() + '...';
    }
    
    // Generate gradient
    static generateGradient(color1, color2, angle = 45) {
        return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    }
    
    // Get contrast color
    static getContrastColor(hexColor) {
        // Convert hex to RGB
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Return black or white based on luminance
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }
    
    // Create element with attributes
    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.substring(2).toLowerCase(), value);
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Append children
        if (Array.isArray(children)) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    element.appendChild(child);
                }
            });
        }
        
        return element;
    }
    
    // Show notification
    static showNotification(message, type = 'info', duration = 3000) {
        // Remove existing notification
        const existingNotification = document.querySelector('.custom-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `custom-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 
                                 type === 'error' ? 'exclamation-circle' : 
                                 type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        const styles = `
            .custom-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 10px;
                max-width: 350px;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease;
                border-left: 4px solid;
            }
            .custom-notification.success {
                border-left-color: #4CAF50;
            }
            .custom-notification.error {
                border-left-color: #F44336;
            }
            .custom-notification.warning {
                border-left-color: #FF9800;
            }
            .custom-notification.info {
                border-left-color: #2196F3;
            }
            .custom-notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .custom-notification i {
                font-size: 20px;
            }
            .custom-notification.success i {
                color: #4CAF50;
            }
            .custom-notification.error i {
                color: #F44336;
            }
            .custom-notification.warning i {
                color: #FF9800;
            }
            .custom-notification.info i {
                color: #2196F3;
            }
            .custom-notification span {
                color: #333;
                font-size: 14px;
            }
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'notification-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
        
        // Add to document
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide and remove after duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
        
        // Click to dismiss
        notification.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
    
    // Copy to clipboard
    static copyToClipboard(text) {
        return new Promise((resolve, reject) => {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text)
                    .then(resolve)
                    .catch(reject);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    document.execCommand('copy');
                    resolve();
                } catch (error) {
                    reject(error);
                } finally {
                    textArea.remove();
                }
            }
        });
    }
    
    // Generate UUID
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // Format number with commas
    static formatNumber(num) {
        if (!num && num !== 0) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    // Calculate percentage
    static calculatePercentage(value, total) {
        if (!total) return 0;
        return Math.round((value / total) * 100);
    }
}

// Global erişim için
window.Helpers = Helpers;