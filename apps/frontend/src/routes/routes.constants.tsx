export const ROUTE_PATHS = {
   notFound: '*',
   forbidden: '/403',
   landing: '/',
   // auth
   auth: '/auth',
   auth_login: '/auth/login',
   auth_logout: '/auth/logout',
   // main
   main: '/main',
   // main/routine
   main_routine: '/main/routine',
   main_routine_morning: '/main/routine/morning',
   main_routine_evening: '/main/routine/evening',
   // main/tags
   main_tags: '/main/tags',
   main_tags_tagId: '/main/tags/:tagId',
   // main/settings
   main_settings: '/main/settings',
} as const;
