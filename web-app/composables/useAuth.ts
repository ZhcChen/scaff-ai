export const useAuth = () => {
  const tokenCookie = useCookie("auth_token");
  const userCookie = useCookie<{ id: number; username: string; displayName?: string } | null>("auth_user");

  const isLoggedIn = computed(() => !!tokenCookie.value);

  const login = (token: string, user: { id: number; username: string; displayName?: string }) => {
    tokenCookie.value = token;
    userCookie.value = user;
  };

  const logout = () => {
    tokenCookie.value = null;
    userCookie.value = null;
    navigateTo("/login");
  };

  return {
    token: tokenCookie,
    user: userCookie,
    isLoggedIn,
    login,
    logout,
  };
};
