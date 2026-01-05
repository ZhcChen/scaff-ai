export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    headers: {
      "Content-Type": "application/json",
    },
    onRequest({ options }) {
      const token = useCookie("auth_token").value;
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        useCookie("auth_token").value = null;
        navigateTo("/login");
      }
    },
  });

  return {
    provide: {
      api,
    },
  };
});
