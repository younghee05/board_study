import axios from "axios";

//axios 를 내가 직접 만들겠다 / 기초적인 작업 
export const instance = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        Authorization: localStorage.getItem("accessToken"), // 처음 값은 null / accessToken은 인증할 때 필요한 키값 
    }
});