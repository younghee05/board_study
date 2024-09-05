/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signinApi } from "../../apis/signinApi";
import { instance } from "../../apis/util/instance";

const layout = css`
    display: flex;
    flex-direction: column;
    margin: 0px auto;
    width: 460px;
`;

const logo = css`
    font-size: 24px;
    margin-bottom: 40px;
`;

const loginInfoBox = css`
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    width: 100%;

    & input {
        box-sizing: border-box;
        border: none;
        outline: none;
        width: 100%;
        height: 50px;
        font-size: 16px;
    }

    & p {
        margin: 0px 0px 10px 10px;
        color: #ff2f2f;
        font-size: 12px;
    }

    & > div {
        box-sizing: border-box;
        width: 100%;
        border: 1px solid #dbdbdb;
        border-bottom: none;
        padding: 0px 20px;
    }

    & > div:nth-of-type(1) {
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }

    & > div:nth-last-of-type(1) {
        border-bottom: 1px solid #dbdbdb;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
    }
`;

const loginButton = css`
    border: none;
    border-radius: 10px;
    width: 100%;
    height: 50px;
    background-color: #999999;
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
`;

function UserLoginPage(props) {
    const navigate = useNavigate();

    const [ inputUser, setInputUser ] = useState({
        username: "",
        password: ""
    });

    const [ fieldErrorMessages, setFieldErrorMessages ] = useState({
        username: <></>,
        password: <></>

    });

    const handleInputUserOnChange = (e) => {
        setInputUser(inputUser => ({
            ...inputUser,
            [e.target.name]: e.target.value
        }));
    }

    const handleLoginSubmitOnClick = async () => {
        const signinData = await signinApi(inputUser);
        if(!signinData.isSuccess) { // 로그인 실패 했을 때(isSuccess가 false 일 때) 
            if(signinData.errorStatus === 'fieldError') {
                showFieldErrorMessage(signinData.error);
            }

            if(signinData.errorStatus === 'loginError') {
                let emptyFieldError = {
                    username: <></>,
                    password: <></>
                };
                setFieldErrorMessages(emptyFieldError);
                alert(signinData.error);
            }

            if(signinData)
            
            return; 
        }
        
        localStorage.setItem("accessToken", "Bearer " + signinData.token.accessToken); // 로그인 성공 시 token 값을 localStorage에 저장 

        instance.interceptors.request.use(config => {
            config.headers["Authorization"] = localStorage.getItem("accessToken");
            return config;
        });

        if(window.history.length > 2) {
            navigate(-1); // t(탭(창)) -> index(홈) -> 로그인 화면에 들어갔을 때 로그인 할 시 index로 돌아가는 (즉, 이전페이지로 돌아가는)
            return;
        }
        navigate("/"); // 2이상이 아닌 경우 index 페이지로 넘어가는 
    }

    const showFieldErrorMessage = (fieldErrors) => {
        let EmptyFieldError = {
            username: <></>,
            password: <></>
        };

        for(let fieldError of fieldErrors) {
            EmptyFieldError = {
                ...EmptyFieldError,
                [fieldError.field]: <p>{fieldError.defaultMessage}</p>
            }
        }
        setFieldErrorMessages(EmptyFieldError);
    }

    return (
        <div css={layout}>
            <Link to={"/"}><h1 css={logo}>사이트 로고</h1></Link>
            <div css={loginInfoBox}>
                <div>
                    <input type="text" name='username' onChange={handleInputUserOnChange} value={inputUser.username} placeholder='아이디'/>
                    {fieldErrorMessages.username}
                </div>
                
                <div>
                    <input type="password" name='password' onChange={handleInputUserOnChange} value={inputUser.password} placeholder='비밀번호'/>
                    {fieldErrorMessages.password}
                </div>
            </div>
            <button css={loginButton} onClick={handleLoginSubmitOnClick}>로그인</button>
            <a href="http://localhost:8080/oauth2/authorization/google">구글로그인</a>
            <a href="http://localhost:8080/oauth2/authorization/naver">네이버로그인</a>
            <a href="http://localhost:8080/oauth2/authorization/kakao">카카오로그인</a>
        </div>
    );
}

export default UserLoginPage;