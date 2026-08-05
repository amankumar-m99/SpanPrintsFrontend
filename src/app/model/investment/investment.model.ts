export interface Investment {
    id: number;
    uuid: string;
    amount: number;
    description: string;
    dateOfInvestment: string;
    ledgerId: number;
    ledgerUuid: string;
    updatedAt: string;
    createdAt: string;
    createdBy: string;
    createdById: number;
}
