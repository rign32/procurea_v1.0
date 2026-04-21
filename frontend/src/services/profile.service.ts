import apiClient from './api.client';
import type { User } from '../types/campaign.types';

export interface UpdateProfileDto {
    name?: string;
    phone?: string;
    jobTitle?: string;
    companyName?: string;
}

export const profileService = {
    getProfile: async (): Promise<User> => {
        const { data } = await apiClient.get<User>('/auth/me');
        return data;
    },

    updateProfile: async (dto: UpdateProfileDto): Promise<User> => {
        const { data } = await apiClient.patch<User>('/auth/me/profile', dto);
        return data;
    },

    acknowledgeTrialEnded: async (): Promise<void> => {
        await apiClient.post('/auth/me/acknowledge-trial-ended');
    },
};

export default profileService;
