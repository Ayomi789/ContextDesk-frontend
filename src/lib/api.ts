// // import axios from "axios";

// // const api = axios.create({
// //   baseURL: "http://localhost:5011/api/v1",
// // });

// // api.interceptors.request.use((config) => {
// //   const token = localStorage.getItem("crm_token");

// //   if (token) {
// //     config.headers.Authorization = `Bearer ${token}`;
// //   }

// //   return config;
// // });

// // api.interceptors.response.use(
// //   (response) => response,
// //   (error) => {
// //     const message =
// //       error.response?.data?.message ||
// //       error.response?.data?.error ||
// //       "Something went wrong";

// //     return Promise.reject(new Error(message));
// //   }
// // );

// // export default api;


// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5011/api/v1",
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("crm_token");

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const message =
//       error.response?.data?.message ||
//       error.response?.data?.error ||
//       "Something went wrong";

//     return Promise.reject(new Error(message));
//   }
// );

// export default api;


import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5011/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("crm_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  }
);

export default api;