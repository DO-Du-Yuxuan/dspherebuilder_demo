export const getCurrentUser = () => {
  return {
    user_id: 'guest_001',
    username: '访客用户',
    name: '访客',
    role: '管理员',
  };
};

export const logout = () => {
  console.log('Logout called');
};
