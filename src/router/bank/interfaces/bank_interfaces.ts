export interface TokenResponse {
  success: boolean;
  message: string; // Este es el token JWT
}

export interface GenerateQrResponse {
  id: string;
  qr: string; // Base64 encoded image
  success: boolean;
  message: string;
}
