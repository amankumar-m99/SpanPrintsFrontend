
export class AppStorage {

    static setItem(key: string, value: string, isStoreInLocal: boolean): void {
        if (isStoreInLocal) {
            localStorage.setItem(key, value);
        }
        else {
            sessionStorage.setItem(key, value);
        }
    }

    static getItem(key: string): string | null {
        return sessionStorage.getItem(key) || localStorage.getItem(key);
    }

    static removeItem(key: string): void {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    }

}