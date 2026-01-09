export declare class StripePaymentMethod {
    id: string;
    stripeType: string;
    displayName: string;
    category: string;
    description: string;
    supportedCountries: string[];
    supportedCurrencies: string[];
    isActive: boolean;
    requiresInvite: boolean;
    logoUrl: string;
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
}
