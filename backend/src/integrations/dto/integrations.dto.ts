export class ConnectIntegrationDto {
    providerAccountId!: string;
    providerAccountToken?: string;
    integrationCategory!: 'accounting' | 'crm' | 'hris';
    platformSlug!: string;
    platformName!: string;
}

export class SyncIntegrationDto {
    connectionId!: string;
}

export class ConfirmMatchDto {
    matchId!: string;
    status!: 'confirmed' | 'rejected';
    rejectedReason?: string;
}
