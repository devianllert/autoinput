import { RouterProvider } from 'react-router-dom';

import { router } from './router';

export const App = (): React.ReactNode => {
  return <RouterProvider router={router} />;
};
