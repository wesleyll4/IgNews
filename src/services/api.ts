import axios from "axios";

export const api = axios.create({
  baseURL: '/api' // when the address of the baseURL is the same as that of the application, you can omit it and put only the address that is different equal here in this case, because that way the axios will take advantage of the URL that already exists of the application
})