// Job Offer Management API Integration
class JobOfferAPI {
    constructor() {
        this.API_BASE_URL = 'http://localhost:5257/api';
        this.currentOfferId = null;
        this.currentPdfUrl = null;
        this.isLoading = false;
    }

    // Validation functions
    validateForm() {
        const fullName = document.getElementById('fullName').value.trim();
        const emailAddress = document.getElementById('emailAddress').value.trim();
        const offerContent = document.getElementById('jobOfferEditor').innerText.trim();

        const errors = [];

        // Required field validation
        if (!fullName) {
            errors.push('Recipient name is required');
            this.showFieldError('fullName', 'This field is required');
        } else {
            this.clearFieldError('fullName');
        }

        if (!emailAddress) {
            errors.push('Recipient email is required');
            this.showFieldError('emailAddress', 'This field is required');
        } else if (!this.isValidEmail(emailAddress)) {
            errors.push('Please enter a valid email address');
            this.showFieldError('emailAddress', 'Please enter a valid email address');
        } else {
            this.clearFieldError('emailAddress');
        }

        if (!offerContent || offerContent.length < 10) {
            errors.push('Job offer content is required');
            this.showEditorError('Job offer content is required and must be at least 10 characters');
        } else {
            this.clearEditorError();
        }

        return errors.length === 0;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        field.classList.add('border-red-500');
        field.classList.remove('border-gray-300');
        
        let errorDiv = field.parentNode.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message text-red-500 text-xs mt-1';
            field.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        field.classList.remove('border-red-500');
        field.classList.add('border-gray-300');
        
        const errorDiv = field.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    showEditorError(message) {
        const editor = document.getElementById('jobOfferEditor');
        editor.style.borderColor = '#ef4444';
        
        let errorDiv = editor.parentNode.querySelector('.editor-error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'editor-error-message text-red-500 text-xs mt-1';
            editor.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }

    clearEditorError() {
        const editor = document.getElementById('jobOfferEditor');
        editor.style.borderColor = '#e5e7eb';
        
        const errorDiv = editor.parentNode.querySelector('.editor-error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // API Functions
    async generateOfferLetter() {
        if (!this.validateForm()) {
            this.showNotification('Please fix the validation errors before generating the offer letter.', 'error');
            return;
        }

        if (this.isLoading) return;

        try {
            this.setLoading(true);
            this.showNotification('Generating offer letter...', 'info');

            const formData = this.getFormData();
            
            const response = await fetch(`${this.API_BASE_URL}/joboffers/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                this.currentOfferId = formData.id;
                this.currentPdfUrl = result.data.pdfUrl;
                
                // Enable preview and send buttons
                this.enableButton('previewBtn');
                this.enableButton('sendForSignatureBtn');
                
                this.showNotification('Offer letter generated successfully!', 'success');
            } else {
                this.showNotification(result.message || 'Failed to generate offer letter', 'error');
            }
        } catch (error) {
            console.error('Error generating offer letter:', error);
            this.showNotification('Failed to connect to the server. Please make sure the API is running.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async previewPDF() {
        if (!this.currentOfferId) {
            this.showNotification('Please generate the offer letter first.', 'error');
            return;
        }

        try {
            this.setLoading(true);
            
            const response = await fetch(`${this.API_BASE_URL}/joboffers/${this.currentOfferId}/preview`);
            const result = await response.json();

            if (result.success) {
                // Open PDF in new tab
                const pdfUrl = `http://localhost:5257${result.data.previewUrl}`;
                window.open(pdfUrl, '_blank');
                this.showNotification('PDF preview opened in new tab.', 'success');
            } else {
                this.showNotification(result.message || 'Failed to get PDF preview', 'error');
            }
        } catch (error) {
            console.error('Error previewing PDF:', error);
            this.showNotification('Failed to preview PDF. Please try again.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async sendForSignature() {
        if (!this.currentOfferId) {
            this.showNotification('Please generate the offer letter first.', 'error');
            return;
        }

        try {
            this.setLoading(true);
            this.showNotification('Sending offer letter for signature...', 'info');

            const response = await fetch(`${this.API_BASE_URL}/docusign/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ offerId: this.currentOfferId })
            });

            const result = await response.json();

            if (result.success) {
                const envelope = result.data;
                
                // Update send button to show sent status
                const sendBtn = document.getElementById('sendForSignatureBtn');
                sendBtn.innerHTML = '<i class="fas fa-check mr-2"></i><span>Sent Successfully</span>';
                sendBtn.disabled = true;
                sendBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                sendBtn.classList.add('bg-green-600');

                this.showNotification(`Offer letter sent successfully to ${envelope.recipientEmail}! Envelope ID: ${envelope.envelopeId}`, 'success');
                
                // Start status polling
                this.pollEnvelopeStatus(envelope.envelopeId);
            } else {
                this.showNotification(result.message || 'Failed to send offer letter', 'error');
            }
        } catch (error) {
            console.error('Error sending for signature:', error);
            this.showNotification('Failed to send offer letter. Please try again.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // Status polling function
    async pollEnvelopeStatus(envelopeId) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/docusign/status/${envelopeId}`);
            const result = await response.json();

            if (result.success) {
                const status = result.data.status;
                this.updateStatusDisplay(status);
                
                // Continue polling if not completed
                if (status !== 'completed' && status !== 'declined' && status !== 'expired') {
                    setTimeout(() => this.pollEnvelopeStatus(envelopeId), 5000);
                }
            }
        } catch (error) {
            console.error('Error polling status:', error);
        }
    }

    // Helper functions
    getFormData() {
        const fullName = document.getElementById('fullName').value.trim();
        const emailAddress = document.getElementById('emailAddress').value.trim();
        const offerContent = document.getElementById('jobOfferEditor').innerHTML;

        return {
            id: this.generateId(),
            recipientName: fullName,
            recipientEmail: emailAddress,
            jobTitle: 'Software Engineer', // Default value
            department: 'Engineering', // Default value
            salary: 80000, // Default value
            startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
            offerContent: offerContent
        };
    }

    generateId() {
        return 'offer-' + Math.random().toString(36).substr(2, 9);
    }

    setLoading(loading) {
        this.isLoading = loading;
        const generateBtn = document.getElementById('generateBtn');
        const previewBtn = document.getElementById('previewBtn');
        const sendBtn = document.getElementById('sendForSignatureBtn');

        if (loading) {
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i><span>Processing...</span>';
            if (previewBtn && !previewBtn.classList.contains('bg-blue-600')) {
                previewBtn.disabled = true;
            }
            if (sendBtn && !sendBtn.classList.contains('bg-green-600')) {
                sendBtn.disabled = true;
            }
        } else {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-file-pdf mr-2"></i><span>Generate Offer Letter</span>';
        }
    }

    enableButton(buttonId) {
        const button = document.getElementById(buttonId);
        button.disabled = false;
        button.classList.remove('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
        
        if (buttonId === 'previewBtn') {
            button.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-700');
        } else if (buttonId === 'sendForSignatureBtn') {
            button.classList.add('bg-green-600', 'text-white', 'hover:bg-green-700');
        }
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md ${this.getNotificationClasses(type)}`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${this.getNotificationIcon(type)} mr-2"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-lg">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationClasses(type) {
        switch (type) {
            case 'success': return 'bg-green-100 border border-green-400 text-green-700';
            case 'error': return 'bg-red-100 border border-red-400 text-red-700';
            case 'info': return 'bg-blue-100 border border-blue-400 text-blue-700';
            default: return 'bg-gray-100 border border-gray-400 text-gray-700';
        }
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-triangle';
            case 'info': return 'fa-info-circle';
            default: return 'fa-bell';
        }
    }

    updateStatusDisplay(status) {
        const statusMessages = {
            'sent': 'Document sent to recipient',
            'delivered': 'Email delivered to recipient',
            'viewed': 'Recipient opened the document',
            'signed': 'Document signed by recipient',
            'completed': 'Signing process completed',
            'declined': 'Recipient declined to sign',
            'expired': 'Document expired'
        };

        const message = statusMessages[status] || `Status: ${status}`;
        this.showNotification(message, status === 'completed' ? 'success' : 'info');
    }
}

// Global instance
let jobOfferAPI;

// Global functions for HTML onclick handlers
function generateOfferLetter() {
    jobOfferAPI.generateOfferLetter();
}

function previewPDF() {
    jobOfferAPI.previewPDF();
}

function sendForSignature() {
    jobOfferAPI.sendForSignature();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    jobOfferAPI = new JobOfferAPI();
});
