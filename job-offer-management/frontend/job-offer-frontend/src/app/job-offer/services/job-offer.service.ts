import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  JobOffer, 
  EnvelopeResponse, 
  SignatureStatus, 
  StatusUpdate, 
  Activity, 
  ApiResponse 
} from '../models/job-offer.model';

@Injectable({
  providedIn: 'root'
})
export class JobOfferService {
  private readonly apiUrl = 'http://localhost:5000/api';
  
  // State management
  private currentOfferSubject = new BehaviorSubject<JobOffer | null>(null);
  private statusSubject = new BehaviorSubject<SignatureStatus>(SignatureStatus.DRAFT);
  private activitiesSubject = new BehaviorSubject<Activity[]>([]);
  private statusUpdatesSubject = new Subject<StatusUpdate>();

  // Public observables
  public readonly currentOffer$ = this.currentOfferSubject.asObservable();
  public readonly status$ = this.statusSubject.asObservable();
  public readonly activities$ = this.activitiesSubject.asObservable();
  public readonly statusUpdates$ = this.statusUpdatesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeStatusPolling();
  }

  /**
   * Generate PDF from job offer data
   */
  generateOfferLetter(offerData: JobOffer): Observable<ApiResponse<{ pdfUrl: string }>> {
    return this.http.post<ApiResponse<{ pdfUrl: string }>>(`${this.apiUrl}/offers/generate`, offerData)
      .pipe(
        map(response => {
          if (response.success) {
            this.currentOfferSubject.next(offerData);
            this.updateStatus(SignatureStatus.GENERATED, 'PDF Generated', 'Offer letter PDF created successfully');
            this.addActivity('PDF Generated', 'Offer letter PDF created successfully', 'fas fa-file-pdf', 'text-blue-600');
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get PDF preview URL
   */
  getPreviewUrl(offerId: string): Observable<ApiResponse<{ previewUrl: string }>> {
    return this.http.get<ApiResponse<{ previewUrl: string }>>(`${this.apiUrl}/offers/${offerId}/preview`)
      .pipe(
        map(response => {
          if (response.success) {
            this.addActivity('PDF Previewed', 'Offer letter PDF was previewed', 'fas fa-eye', 'text-blue-600');
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Send offer letter for signature via simulated DocuSign
   */
  sendForSignature(offerId: string): Observable<ApiResponse<EnvelopeResponse>> {
    return this.http.post<ApiResponse<EnvelopeResponse>>(`${this.apiUrl}/docusign/send`, { offerId })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            this.updateStatus(SignatureStatus.SENT, 'Sent for Signature', `Sent to ${response.data.recipientEmail}`);
            this.addActivity('Sent for Signature', `Envelope ID: ${response.data.envelopeId}`, 'fas fa-paper-plane', 'text-green-600');
            this.startEnvelopeStatusPolling(response.data.envelopeId);
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Check signature status
   */
  checkSignatureStatus(envelopeId: string): Observable<ApiResponse<{ status: SignatureStatus }>> {
    return this.http.get<ApiResponse<{ status: SignatureStatus }>>(`${this.apiUrl}/docusign/status/${envelopeId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get offer history
   */
  getOfferHistory(): Observable<ApiResponse<JobOffer[]>> {
    return this.http.get<ApiResponse<JobOffer[]>>(`${this.apiUrl}/offers/history`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update current status and emit status update
   */
  private updateStatus(status: SignatureStatus, title: string, message: string): void {
    this.statusSubject.next(status);
    this.statusUpdatesSubject.next({
      status,
      message: title,
      timestamp: new Date()
    });
  }

  /**
   * Add activity to the activity log
   */
  private addActivity(title: string, description: string, icon: string, colorClass: string): void {
    const currentActivities = this.activitiesSubject.value;
    const newActivity: Activity = {
      id: this.generateId(),
      title,
      description,
      icon,
      colorClass,
      timestamp: new Date()
    };

    const updatedActivities = [newActivity, ...currentActivities.slice(0, 4)]; // Keep only last 5
    this.activitiesSubject.next(updatedActivities);
  }

  /**
   * Start polling for envelope status updates (simulated)
   */
  private startEnvelopeStatusPolling(envelopeId: string): void {
    // Simulate status updates over time
    const statusSequence = [
      { status: SignatureStatus.DELIVERED, delay: 5000, message: 'Email delivered to recipient' },
      { status: SignatureStatus.VIEWED, delay: 15000, message: 'Recipient viewed the document' },
      { status: SignatureStatus.SIGNED, delay: 30000, message: 'Document signed successfully' },
      { status: SignatureStatus.COMPLETED, delay: 35000, message: 'Signature process completed' }
    ];

    statusSequence.forEach(update => {
      setTimeout(() => {
        this.updateStatus(update.status, this.getStatusTitle(update.status), update.message);
        this.addActivity(this.getStatusTitle(update.status), update.message, this.getStatusIcon(update.status), this.getStatusColor(update.status));
      }, update.delay);
    });
  }

  /**
   * Initialize status polling (for reconnection scenarios)
   */
  private initializeStatusPolling(): void {
    // This would connect to real-time updates in a production app
  }

  /**
   * Get status display title
   */
  private getStatusTitle(status: SignatureStatus): string {
    const titles = {
      [SignatureStatus.DRAFT]: 'Draft',
      [SignatureStatus.GENERATED]: 'Generated',
      [SignatureStatus.SENT]: 'Sent',
      [SignatureStatus.DELIVERED]: 'Delivered',
      [SignatureStatus.VIEWED]: 'Viewed',
      [SignatureStatus.SIGNED]: 'Signed',
      [SignatureStatus.COMPLETED]: 'Completed',
      [SignatureStatus.DECLINED]: 'Declined',
      [SignatureStatus.EXPIRED]: 'Expired'
    };
    return titles[status] || 'Unknown';
  }

  /**
   * Get status icon
   */
  private getStatusIcon(status: SignatureStatus): string {
    const icons = {
      [SignatureStatus.DRAFT]: 'fas fa-edit',
      [SignatureStatus.GENERATED]: 'fas fa-file-pdf',
      [SignatureStatus.SENT]: 'fas fa-paper-plane',
      [SignatureStatus.DELIVERED]: 'fas fa-envelope-open',
      [SignatureStatus.VIEWED]: 'fas fa-eye',
      [SignatureStatus.SIGNED]: 'fas fa-signature',
      [SignatureStatus.COMPLETED]: 'fas fa-check-circle',
      [SignatureStatus.DECLINED]: 'fas fa-times-circle',
      [SignatureStatus.EXPIRED]: 'fas fa-clock'
    };
    return icons[status] || 'fas fa-circle';
  }

  /**
   * Get status color class
   */
  private getStatusColor(status: SignatureStatus): string {
    const colors = {
      [SignatureStatus.DRAFT]: 'text-gray-600',
      [SignatureStatus.GENERATED]: 'text-blue-600',
      [SignatureStatus.SENT]: 'text-primary',
      [SignatureStatus.DELIVERED]: 'text-yellow-600',
      [SignatureStatus.VIEWED]: 'text-orange-600',
      [SignatureStatus.SIGNED]: 'text-green-600',
      [SignatureStatus.COMPLETED]: 'text-success',
      [SignatureStatus.DECLINED]: 'text-danger',
      [SignatureStatus.EXPIRED]: 'text-gray-500'
    };
    return colors[status] || 'text-gray-600';
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
    }
    
    console.error('JobOfferService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Reset service state
   */
  resetState(): void {
    this.currentOfferSubject.next(null);
    this.statusSubject.next(SignatureStatus.DRAFT);
    this.activitiesSubject.next([]);
  }

  /**
   * Get current offer data
   */
  getCurrentOffer(): JobOffer | null {
    return this.currentOfferSubject.value;
  }

  /**
   * Get current status
   */
  getCurrentStatus(): SignatureStatus {
    return this.statusSubject.value;
  }
}
