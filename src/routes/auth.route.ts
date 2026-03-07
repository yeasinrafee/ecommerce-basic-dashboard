const authBase = '/auth';

export const AuthRoutes = {
  login: `${authBase}/login`,
  refresh: `${authBase}/refresh`,
  logout: `${authBase}/logout`,
  createAdmin: `${authBase}/admin/create`
};

export default AuthRoutes;