const authBase = '/auth';

export const AuthRoutes = {
  login: `${authBase}/login`,
  refresh: `${authBase}/refresh`,
  logout: `${authBase}/logout`,
  createAdmin: `${authBase}/admin/create`,
  verifyOtp: `${authBase}/otp/verify`,
  sendOtp: `${authBase}/otp/send`
};

export default AuthRoutes;