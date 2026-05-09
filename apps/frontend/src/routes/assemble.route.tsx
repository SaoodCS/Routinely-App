import { createBrowserRouter, createRoutesFromElements } from 'react-router';
import { authRoute } from './auth/auth.route';
import { forbiddenRoute } from './forbidden/forbidden.route';
import { landingRoute } from './landing/landing.route';
import { mainRoute } from './main/main.route';
import { notFoundRoute } from './notFound/notFound.route';

export const router = createBrowserRouter(
   createRoutesFromElements(
      <>
         {forbiddenRoute}
         {notFoundRoute}
         {landingRoute}
         {authRoute}
         {mainRoute}
      </>,
   ),
);
