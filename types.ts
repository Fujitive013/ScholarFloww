
export type UserRole = 'STUDENT' | 'REVIEWER' | 'ADMIN' | 'GUEST';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export enum ThesisStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  REVIEWED = 'REVIEWED', // Ready for Admin
  PUBLISHED = 'PUBLISHED',
  REVISION_REQUIRED = 'REVISION_REQUIRED',
  REJECTED = 'REJECTED'
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  comment: string;
  date: string;
  recommendation: 'APPROVE' | 'REVISE' | 'REJECT';
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface ThesisVersion {
  id: string;
  timestamp: string;
  title: string;
  abstract: string;
  fileName?: string;
  fileUrl?: string;
  changeNote?: string;
}

export interface Thesis {
  id: string;
  authorId: string;
  authorName: string;
  supervisorName: string;
  coResearchers?: string[];
  title: string;
  abstract: string;
  department: string;
  year: string;
  status: ThesisStatus;
  fileUrl?: string;
  fileName?: string;
  submissionDate: string;
  publishedDate?: string;
  keywords: string[];
  reviews: Review[];
  milestones?: Milestone[];
  versions?: ThesisVersion[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
}
