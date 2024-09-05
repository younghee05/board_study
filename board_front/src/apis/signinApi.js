import { instance } from "./util/instance";

export const signinApi = async (user) => {
    let signinData = {
        isSuccess: false,
        token: null,
        fieldErrors: [
            { 
                field: "",
                defaultMessage: ""
            }
        ]
    }
    try {
        const response = await instance.post("/auth/signin", user);
        signinData = {
            isSuccess: true,
            token: response.data
        }
    } catch (error) {
        const response = error.response;
        signinData = {
            isSuccess: false,
        }

        if(typeof(response.data) === 'string') {
            signinData['errorStatus'] = "loginError";
            signinData['error'] = response.data;
        } 
        
        if(typeof(response.data) === 'string') {
            signinData['errorStatus'] = "fieldError";
            signinData['error'] = response.data.map(fieldError => ({
                field: fieldError.field, 
                defaultMessage: fieldError.defaultMessage
            }));
        }

    }

    return signinData;
}