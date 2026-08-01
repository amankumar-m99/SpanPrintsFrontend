export interface ErrorResponse {
    timestamp: string;
    message: string;
    statusCode: number;
    error: string;
    path: string;
    fieldErrors: string[];
}
