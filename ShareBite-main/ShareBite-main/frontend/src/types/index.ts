export interface User {
  id: number;
  email: string;
  role: 'DONOR' | 'RECIPIENT';
}

export interface Profile {
  id: number;
  name: string;
  phoneNumber: string;
}

export interface Listing {
  id: number;
  name: string;
  description: string;
  servings: number;
  type: string;
  photoUrl: string;
  latitude: number;
  longitude: number;
  address: string;
  phoneNumber: string;
  status: 'AVAILABLE' | 'CLAIMED' | 'EXPIRED' | 'COMPLETED';
  claimByTime: string;
  donorId: number;
  claimerId?: number;
  donorName?: string;
  donorEmail?: string;
  recipientSigned: boolean;
  donorVerified: boolean;
}

export interface Claim {
  id: number;
  listingId: number;
  recipientId: number;
  status: 'PENDING_PICKUP' | 'FULFILLED' | 'CANCELLED';
  claimTime: string;
  fulfillmentTime?: string;
  recipientName?: string;
  recipientPhone?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  role: 'DONOR' | 'RECIPIENT';
  name:string;
}
