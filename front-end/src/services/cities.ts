// TODO : verify this call
import { axiosInstance } from './axios';

export async function searchCity(search: string): Promise<any[]> {
  const response = await axiosInstance.get(
    `/communes?nom=${search}&fields=departement&boost=population&limit=5`,
    { baseURL: 'https://geo.api.gouv.fr', withCredentials: false },
  );
  return response.data;
}
