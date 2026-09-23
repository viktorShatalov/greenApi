export const GREEN_API_URL = 'https://api.green-api.com';

export const buildApiUrl = (idInstance: string, apiTokenInstance: string, method: string) =>
  `${GREEN_API_URL}/waInstance${encodeURIComponent(idInstance)}/${method}/${encodeURIComponent(apiTokenInstance)}`;
