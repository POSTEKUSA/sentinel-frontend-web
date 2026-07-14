export const environment = {
  production: false,
  /**
   * Cuando es true, el TelemetryService usa datos mock locales en lugar de llamar al API.
   * Cambiar a false cuando el backend ASP.NET Core esté disponible.
   */
  useMockData: true,
  apiBaseUrl: 'https://localhost:7000/api',
};
