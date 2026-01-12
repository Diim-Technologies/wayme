export declare class AppService {
    getHello(): string;
    getHealth(): {
        status: string;
        message: string;
        timestamp: string;
        uptime: number;
        version: string;
        environment: string;
    };
}
