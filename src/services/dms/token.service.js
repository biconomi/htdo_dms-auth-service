let currentToken = null;
const loginDMS = require('../../login/login')
exports.getToken = async () => {
  if (!currentToken) {
    console.log("Login lấy token...");
    // currentToken = await loginDMS();
  }
  return 'zLlzx3ftDeDr70dX5InBOc7_kd1-Hvtj9t7uvH13KsOc3KOhAtfxRwYPaaeJjU_Z1CuyCmTYGVQYuI5DGkz4EOa0ZFEGd7L4sD0LW2x54_yrwwqZ0-xJIlr8nxr8Kryw1IReQzcBCq5UFFsLw7-tIt0a1YtOvySjQ_7w04qiAuIxUr3h9PRVdCkPmpj_d3jWVWI3h1X9Q0qd2Xr0A9e_FTt7Z0lf3GslmOPoYXx_IcA_fpQLzDNUQR1rjwcXq0dUCWs6OyJrUFAhcDIx0xH2HFVjJGk1oWpGlpRR4kJ495FBt-dUeljptZw0iTwu4i6iq3X-8OSLL3oa3WeIh0hGuxP7Y7N04GzqJMovv-cZ1ERzSxGwRHaRbfIhoT85aSn6d2m4QEaYHKts6fjjODnNPEYYJlE_lTthxVyF3PgdOWE';
};
exports.resetToken = async () => {
  console.log("Reset token...");
  // currentToken = await loginDMS();
  return currentToken;
};