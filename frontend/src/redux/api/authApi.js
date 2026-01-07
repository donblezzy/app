import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userApi } from "./userApi";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    register: builder.mutation({
      query(body) {
        return {
          url: "/register",
          method: "POST",
          body,
        };
      },
         // to set register user in state after registering 
         async onQueryStarted(args, { dispatch, queryFulfilled}) {
          try {
            await queryFulfilled
            await dispatch(userApi.endpoints.getMe.initiate(null))
          } catch (error) {
            console.log(error);
          }
        }
    }),

    login: builder.mutation({
      query(body) {
        return {
          url: "/login",
          method: "POST",
          body,
        };
      },
      // to set login user in state after logging in
      async onQueryStarted(args, { dispatch, queryFulfilled}) {
        try {
          await queryFulfilled
          await dispatch(userApi.endpoints.getMe.initiate(null))
        } catch (error) {
          console.log(error);
        }
      }
    }),

    logout: builder.query({
      query() {
        return {
          url: "/logout",
          
        };
      },
    }),
  }),
});
export const { useLoginMutation, useRegisterMutation, useLazyLogoutQuery } = authApi;
