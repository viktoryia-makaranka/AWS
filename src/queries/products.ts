import axios, { AxiosError } from "axios";
import API_PATHS from "~/constants/apiPaths";
import { AvailableProduct, Stock } from "~/models/Product";
import { useQuery, useQueryClient, useMutation } from "react-query";
import React from "react";

export function useAvailableProducts() {
  return useQuery<AvailableProduct[], AxiosError>(
    "available-products",
    async () => {
      const res = await axios.get<AvailableProduct[]>(
        `${API_PATHS.bff}/products`
      );
      return res.data;
    }
  );
}

export function useInvalidateAvailableProducts() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("available-products", { exact: true }),
    []
  );
}

export function useAvailableProduct(id?: string) {
  return useQuery<AvailableProduct, AxiosError>(
    ["products", { id }],
    async () => {
      const { data: product } = await axios.get<AvailableProduct>(
        `${API_PATHS.bff}/products/${id}`
      );

      const {
        data: { product_id, ...stock },
      } = await axios.get<Stock>(`${API_PATHS.bff}/stocks/${id}`);

      return {
        ...product,
        ...stock,
      };
    },
    { enabled: !!id }
  );
}

export function useRemoveProductCache() {
  const queryClient = useQueryClient();
  return React.useCallback(
    (id?: string) =>
      queryClient.removeQueries(["products", { id }], { exact: true }),
    []
  );
}

export function useUpsertAvailableProduct() {
  return useMutation((values: AvailableProduct) =>
    axios.post<AvailableProduct>(`${API_PATHS.bff}/products`, values)
  );
}

export function useDeleteAvailableProduct() {
  return useMutation((id: string) =>
    axios.delete(`${API_PATHS.bff}/products/${id}`, {
      headers: {
        Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
      },
    })
  );
}
