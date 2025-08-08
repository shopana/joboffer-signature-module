import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { JobOfferService } from '../services/job-offer.service';
import { JobOffer, SignatureStatus } from '../models/job-offer.model';

@Component({
  selector: 'app-offer-form',
  templateUrl: './offer-form.component.html',
  styleUrls: ['./offer-form.component.scss']
})
export class OfferFormComponent implements OnInit, OnDestroy {
  @Output() pdfGenerated = new EventEmitter<{ offerId: string, pdfUrl: string }>();
  @Output() sentForSignature = new EventEmitter<{ envelopeId: string }>();

  offerForm!: FormGroup;
  minDate: string;
  isLoading = false;
  canPreview = false;
  canSend = false;
  isSent = false;
  successMessage = '';
  errorMessage = '';
  currentOfferId: string | null = null;

  private destroy$ = new Subject<void>();

  placeholderText = `Dear [Recipient Name],

We are pleased to offer you the position of [Job Title] in our [Department] department. 

This is a full-time position with an annual salary of $[Salary]. Your anticipated start date is [Start Date].

In this role, you will be responsible for:
• [Key responsibility 1]
• [Key responsibility 2]
• [Key responsibility 3]

We believe your skills and experience make you an excellent fit for our team. This offer is contingent upon the successful completion of a background check and any other conditions outlined in our employment policies.

Please sign and return this offer letter to indicate your acceptance of this position. We look forward to having you join our team!

Best regards,
[Your Name]
[Your Title]
[Company Name]`;

  constructor(
    private fb: FormBuilder,
    private jobOfferService: JobOfferService
  ) {
    this.minDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToStatusUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.offerForm = this.fb.group({
      recipientName: ['', [Validators.required, Validators.minLength(2)]],
      recipientEmail: ['', [Validators.required, Validators.email]],
      jobTitle: ['', [Validators.required, Validators.minLength(2)]],
      department: ['', Validators.required],
      salary: ['', [Validators.required, Validators.min(1)]],
      startDate: ['', [Validators.required, this.futureDateValidator]],
      offerContent: ['', [Validators.required, Validators.minLength(50)]]
    });

    // Set default content
    this.offerForm.patchValue({
      offerContent: this.placeholderText
    });
  }

  private subscribeToStatusUpdates(): void {
    this.jobOfferService.status$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.updateButtonStates(status);
      });
  }

  private updateButtonStates(status: SignatureStatus): void {
    this.canPreview = status === SignatureStatus.GENERATED || 
                     status === SignatureStatus.SENT || 
                     status === SignatureStatus.COMPLETED;
    
    this.canSend = status === SignatureStatus.GENERATED;
    this.isSent = status === SignatureStatus.SENT || 
                  status === SignatureStatus.DELIVERED || 
                  status === SignatureStatus.VIEWED || 
                  status === SignatureStatus.SIGNED || 
                  status === SignatureStatus.COMPLETED;
  }

  onSubmit(): void {
    if (this.offerForm.valid && !this.isLoading) {
      this.generateOfferLetter();
    }
  }

  private generateOfferLetter(): void {
    this.isLoading = true;
    this.clearMessages();

    const formData = this.offerForm.value;
    const offerData: JobOffer = {
      ...formData,
      id: this.generateId()
    };

    this.jobOfferService.generateOfferLetter(offerData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success && response.data) {
            this.currentOfferId = offerData.id!;
            this.successMessage = 'Offer letter generated successfully! You can now preview or send it for signature.';
            this.pdfGenerated.emit({ 
              offerId: offerData.id!, 
              pdfUrl: response.data.pdfUrl 
            });
          } else {
            this.errorMessage = response.message || 'Failed to generate offer letter';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to generate offer letter. Please try again.';
          console.error('Generate offer error:', error);
        }
      });
  }

  onPreviewPDF(): void {
    if (!this.currentOfferId) {
      this.errorMessage = 'No offer letter generated. Please generate one first.';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.jobOfferService.getPreviewUrl(this.currentOfferId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success && response.data) {
            // Open PDF in new window/tab
            window.open(response.data.previewUrl, '_blank');
            this.successMessage = 'PDF preview opened in new tab.';
          } else {
            this.errorMessage = response.message || 'Failed to get preview URL';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to preview PDF. Please try again.';
          console.error('Preview PDF error:', error);
        }
      });
  }

  onSendForSignature(): void {
    if (!this.currentOfferId) {
      this.errorMessage = 'No offer letter generated. Please generate one first.';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.jobOfferService.sendForSignature(this.currentOfferId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success && response.data) {
            const formData = this.offerForm.value;
            this.successMessage = `Offer letter sent successfully to ${formData.recipientEmail}!`;
            this.sentForSignature.emit({ 
              envelopeId: response.data.envelopeId 
            });
          } else {
            this.errorMessage = response.message || 'Failed to send offer letter';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to send offer letter. Please try again.';
          console.error('Send for signature error:', error);
        }
      });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.offerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.offerForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return 'This field is required.';
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address.';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `Minimum length is ${requiredLength} characters.`;
      }
      if (field.errors['min']) {
        return 'Please enter a valid positive number.';
      }
      if (field.errors['futureDate']) {
        return 'Start date must be today or in the future.';
      }
    }
    return '';
  }

  private futureDateValidator(control: any) {
    if (!control.value) {
      return null;
    }
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return { futureDate: true };
    }
    
    return null;
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private generateId(): string {
    return 'offer-' + Math.random().toString(36).substr(2, 9);
  }

  // Reset form to initial state
  resetForm(): void {
    this.offerForm.reset();
    this.offerForm.patchValue({
      offerContent: this.placeholderText
    });
    this.currentOfferId = null;
    this.canPreview = false;
    this.canSend = false;
    this.isSent = false;
    this.clearMessages();
    this.jobOfferService.resetState();
  }

  // Get form data for external access
  getFormData(): JobOffer | null {
    if (this.offerForm.valid) {
      return {
        ...this.offerForm.value,
        id: this.currentOfferId
      };
    }
    return null;
  }
}
