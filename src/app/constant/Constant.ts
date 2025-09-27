export const Constant = {
    API_URL : 'http://192.168.1.5:8090',

    EXCLUDED_URLS_FOR_ATTACHING_JWT : ['/auth/login', '/auth/register', '/auth/refresh'],

    STORAGE_TYPE : {
        LOCAL_STORAGE: 0,
        SESSION_STORAGE: 1
    }
}