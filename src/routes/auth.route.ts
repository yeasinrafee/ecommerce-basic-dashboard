const authBase = '/auth';

export const AuthRoutes = {
  login: `${authBase}/login`,           
  refresh: `${authBase}/refresh`,       
  createAdmin: `${authBase}/admin/create`,
  logout: `${authBase}/logout`
};

export default AuthRoutes;