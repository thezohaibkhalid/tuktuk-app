import { apiFetch } from './api';

export type Address = {
  id: number;
  firstName: string;
  lastName: string;
  company: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
  phone: string;
  isDefaultBilling?: boolean;
  isDefaultShipping?: boolean;
};

export type AddressInput = Omit<
  Address,
  'id' | 'isDefaultBilling' | 'isDefaultShipping'
>;

export const listAddresses = () =>
  apiFetch<Address[]>('/customer/addresses');

export const createAddress = (input: AddressInput) =>
  apiFetch<Address>('/customer/addresses', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const updateAddress = (id: number, input: AddressInput) =>
  apiFetch<Address>(`/customer/addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

export const deleteAddress = (id: number) =>
  apiFetch<null>(`/customer/addresses/${id}`, { method: 'DELETE' });

export const setDefaultAddress = (id: number, type: 'shipping' | 'billing') =>
  apiFetch<{ message: string }>(`/customer/addresses/${id}/default`, {
    method: 'POST',
    body: JSON.stringify({ type }),
  });

export const emptyAddress = (): AddressInput => ({
  firstName: '',
  lastName: '',
  company: '',
  street1: '',
  street2: '',
  city: '',
  state: '',
  country: 'Pakistan',
  postcode: '',
  phone: '',
});
