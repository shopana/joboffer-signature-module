export interface JobOffer {
  id?: string;
  recipientName: string;
  recipientEmail: string;
  jobTitle: string;
  department: string;
  salary: number;
  startDate: string;
  offerContent: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EnvelopeResponse {
  envelopeId: string;
  status: SignatureStatus;
  recipientName: string;
  recipientEmail: string;
  documentName: string;
  submissionTimestamp: string;
}

export enum SignatureStatus {
  DRAFT = 'draft',
  GENERATED = 'generated', 
  SENT = 'sent',
  DELIVERED = 'delivered',
  VIEWED = 'viewed',
  SIGNED = 'signed',
  COMPLETED = 'completed',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

export interface StatusUpdate {
  status: SignatureStatus;
  message: string;
  timestamp: Date;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  icon: string;
  colorClass: string;
  timestamp: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
}
