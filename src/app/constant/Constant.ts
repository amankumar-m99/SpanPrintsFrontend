export const Constant = {
    // API_URL : 'http://192.168.1.5:8090',
    // PROFILE_PIC_API_GET_BASR_URL : 'http://192.168.1.5:8090/profile-pic/',
    API_URL : 'http://localhost:8090',
    PROFILE_PIC_API_GET_BASR_URL : 'http://localhost:8090/profile-pics/',

    EXCLUDED_URLS_FOR_ATTACHING_JWT : ['/login', '/register', '/refresh'],

    STORAGE_TYPE : {
        LOCAL_STORAGE: 0,
        SESSION_STORAGE: 1
    },
    UUID_REGEX : /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
}