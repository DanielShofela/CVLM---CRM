export type RequestStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED';

export interface CVRequest {
  id: string;
  date: string;
  status: RequestStatus;
  promoCode: string; // The code USED by this prospect for this request
  details: string; // The specific message or plan requested
}

export interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
}

export interface Profile {
  id: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  nationality: string;
  birthYear: string;
  portfolioUrl: string;
  summary: string;
  skills: string[];
  certifications: string[];
  interests: string[];
  references: string[];
  experience: Experience[];
  education: Education[];
  requests: CVRequest[]; // List of all CV requests/orders for this prospect
  ownPromoCode: string; // The unique referral code OF this prospect (to share with others)
  createdAt: string;
}

export type ViewState = 'LIST' | 'ADD' | 'DETAIL';

export interface CVParserResponse {
  // Prospect Info
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  nationality: string;
  birthYear: string;
  portfolioUrl: string;
  summary: string;
  skills: string[];
  certifications: string[];
  interests: string[];
  references: string[];
  experience: Experience[];
  education: Education[];
  // Request Specific Info
  extractedPromoCode: string; // Code used in the request
  extractedOwnPromoCode: string; // Code belonging to the user (if mentioned)
  extractedRequestDetails: string;
}