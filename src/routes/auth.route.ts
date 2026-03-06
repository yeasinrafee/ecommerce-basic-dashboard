import baseUrl from './index';

const authBase = `${baseUrl}/auth`;

export const AuthRoutes = {
  login: `${authBase}/login`,           
  refresh: `${authBase}/refresh`,       
  createAdmin: `${authBase}/admin/create` 
};

export default AuthRoutes;