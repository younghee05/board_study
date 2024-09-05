import { instance } from "./util/instance"

export const boardApi = async (write) => {
    try {
        const response = await instance.post("/board", write);
    } catch (error) {
        console.error(error);
        const fieldErrors = error.response.data;

        for (let fieldError of fieldErrors) {
            if (fieldError.field === "title") {
                alert(fieldError.defaultMessage);
                return; // 밑에꺼 동작 안하기 위함 (title -> content)
            }
        }

        for (let fieldError of fieldErrors) {
            if (fieldError.field === "content") {
                alert(fieldError.defaultMessage);
                break;
            }
        }
    }
}