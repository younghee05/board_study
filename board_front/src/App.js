import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import IndexPage from './pages/IndexPage/IndexPage';
import UserJoinPage from './pages/UserJoinPage/UserJoinPage';
import UserLoginPage from './pages/UserLoginPage/UserLoginPage';
import { instance } from './apis/util/instance';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import UserProfilePage from './pages/UserProfilePage/UserProfilePage';
import OAuth2JoinPage from './pages/OAuth2JoinPage/OAuth2JoinPage';
import OAuth2LoginPage from './pages/OAuth2LoginPage/OAuth2LoginPage';

function App() {

    const location = useLocation();
    const navigate = useNavigate();
    const [ authRefresh, setAuthRefresh ] = useState(true); // 처음에 authRefresh에 true가 들어와 있다 
    /**
     * 경우의 수 먼저 체크
     * 페이지 이동시 Auth(로그인, 토큰) 확인
     * 1. index(home) 페이지를 먼저 들어가서 로그인 화면으로 이동한 경우 -> index로 이동
     * 2. 탭(창)을 열자마자 주소창에 수동입력을 통해 로그인 페이지로 이동한 경우 -> index로 이동
     * 3. 로그인 후 사용 가능한 페이지로 들어갔을 때 로그인 페이지로 이동한 경우 -> 이전 페이지 이동 / 1번 조건이랑 비슷 
     * 4. 로그인이 된 상태 -> 어느 페이지든 이동  
     */

    // 처음으로 시작하는 것이 true 이므로 처음에 실행이 되지 않음 
    // false로 바뀔때 / 마운트가 되어야 실행이 됨 -> 정의만 된 상태 
    useEffect(() => {
        if(!authRefresh) {
            setAuthRefresh(true);
        } 
    }, [location.pathname]); // location.pathname 이 바껴야 실행이 되므로 이 주소는 아직 indexPage 이므로 처음엔 실행 안됨 

    // const [ refresh, setRefresh ] = useState(false);

    // refresh가 true일 때 실행이 된다 
    // token 유효성 검사 실행 
    const accessTokenValid = useQuery(
        ["accessTokenValidQuery"], // atom 대신 key 값을 넣음 
        async () => {
            // console.log("쿼리에서 요청!!!");
            // setRefresh(false); 
            setAuthRefresh(false); // 처음에 refresh가 true 이므로 실행 되었을 때 false로 바꾸는 
            // 비동기로 요청만 날림 
            return await instance.get("/auth/access", {
                params: {
                    accessToken: localStorage.getItem("accessToken")
                } 
            });
        }, 
        {
            // enabled: refresh,
            // refetchOnWindowFocus: false, // 윈도우에 포커스 갔을 때 refetch를 해라
            // retry: 0, // 처음에만 로그인 요청을 보내라 / 재요청
            // // 요청이 성공적으로 보내졌을 때 동작
            enabled: authRefresh, // 처음엔 true / 활성화만 됨 
            retry: 0,
            refetchOnWindowFocus: false, // 다른 탭 or 다른 콘솔창 들어갔다 오면 재실행 

            // 로그인이 되어져 있는 상태일 때 회원가입이나 login 사이트로 못들어가게 막는 
            onSuccess: response => {
                const permitAllPaths = ["/user"]; 
                for(let permitAllPath of permitAllPaths) {
                    if(location.pathname.startsWith(permitAllPath)) {
                        // alert("잘못된 요청입니다.");
                        navigate("/");
                        break;
                    }
                }
            },
            onError: error => { // 403 오류로 응답이 왔을 때 실행된다  
                const authPaths = ["/profile"]; // profile로 시작을 하면
                for(let authPagth of authPaths) {
                    if(location.pathname.startsWith(authPagth)) {
                        navigate("/user/login"); // 로그인으로 보내버린다 
                        break; // 무한반복을 멈추기 위함 
                    }
                }
            }
            // onSuccess: response => { 
            //     // console.log("OK에 응답");
            //     console.log(response.data);
            // },
            // // 요청을 보냈을 때 error 가 나면 동작
            // onError: error => {
            //     // console.log("오류!!");
            //     console.error(error);
            // }
        }
    ); 

    const userInfo = useQuery(
        ["userInfoQuery"],
        async () => {
            return await instance.get("/user/me");
        },
        {
            // 응답이 와야 true가 됨 
            enabled: accessTokenValid.isSuccess && accessTokenValid.data?.data, // data?.data 데이터 안에 데이터 값이 존재하면 데이터값을 참조하겠다 
            refetchOnWindowFocus: false,
            // onSuccess: response => {
            //     console.log(response);
            // },
            // onError: error => {

            // }
        }
    );

    // console.log("그냥 출력!!");

    useEffect(() => {
        // const accessToken = localStorage.getItem("accessToken");
        // if(!!accessToken) {
        //     setRefresh(true);
        // }
        // console.log("Effect!!!");
    }, [accessTokenValid.data]);

    return (
            <Routes>
                <Route path="/" element={ <IndexPage /> }/>
                <Route path="/user/join" element={ <UserJoinPage /> }/>
                <Route path="/user/join/oauth2" element={ <OAuth2JoinPage /> }/>
                <Route path="/user/login" element={ <UserLoginPage /> }/>
                <Route path="/user/login/oauth2" element={ <OAuth2LoginPage /> }/>
                <Route path="/profile" element={ <UserProfilePage /> }/>
                <Route path="/admin/*" element={ <></> }/>

                {/* Not Found 구간 */}
                <Route path="/admin/*" element={ <h1>Not Found</h1> }/>
                <Route path="*" element={ <h1>Not Found</h1> }/>
            </Routes>
    );
}

export default App;
