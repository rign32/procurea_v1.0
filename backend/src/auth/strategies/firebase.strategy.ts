
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor() {
    super();
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      // Check if running in Cloud Functions (FIREBASE_CONFIG is auto-set)
      if (process.env.FIREBASE_CONFIG || process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT) {
        // Running in Cloud Functions or GCP - use default credentials
        admin.initializeApp();
        console.log('Firebase Admin initialized with default credentials (Cloud Functions)');
      } else {
        // Local development - use service account credentials
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: privateKey,
            }),
          });
          console.log('Firebase Admin initialized with service account credentials');
        } else {
          console.warn('Firebase Admin Config missing. Firebase Strategy will fail.');
        }
      }
    }
  }

  async validate(req: Request): Promise<any> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      console.error('Firebase Token Verification Failed:', error);
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}
