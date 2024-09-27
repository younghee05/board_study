import { css } from '@emotion/react';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import { storage } from '../../firebase/firebase';
import { v4 as uuid } from 'uuid'; 
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import { updateProfileImgApi } from '../../apis/userApi';
/** @jsxImportSource @emotion/react */

const layout = css`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 100px auto;
    width: 1000px;
`;

const imgBox = css`
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    width: 300px;
    height: 300px;
    box-shadow: 0px 0px 2px #00000088;
    cursor: pointer;
    overflow: hidden;

    & > img {
        height: 100%;
    }

`;

const progressBox = css`
    padding-top: 20px;
    width: 300px;
`;

function UserProfilePage(props) {
    const queryClient = useQueryClient();
    const userInfoState = queryClient.getQueryState("userInfoQuery");
    const [ uploadPercent, setUploadPercent ] = useState(0);

    const handleImageChangeOnClick = () => {
        if(window.confirm("프로필 사진을 변경하시겠습니까?")) {
            const fileInput = document.createElement("input");
            fileInput.setAttribute("type", "file");
            fileInput.setAttribute("accept", "image/*"); // image 파일들만 받겠다 라는 의미 
            fileInput.click();

            fileInput.onchange = (e) => {
                const files = Array.from(e.target.files);
                const profileImage = files[0];
                setUploadPercent(0); // 0%로 시작 
                
                // ${uuid()}_${profileImage.name} 앞에는 랜덤한 숫자를 그 뒤에는 파일명이 붙여져서 호출한다
                const storageRef = ref(storage, `user/profile/${uuid()}_${profileImage.name}`); // ref((어떤 저장소), (파일경로))

                const uploadTask = uploadBytesResumable(storageRef, profileImage); // 실행 되면 파일이 올라감 
                uploadTask.on(
                    "state_changed", // 상태가 변했을 때 / 업로드 중일 때 동작할 이벤트
                    // 3가지 함수가 들어감 
                    (snapshot) => { // 업로드 중
                        // console.log(snapshot.totalBytes); // 실제 파일 데이터
                        // console.log(snapshot.bytesTransferred); // 업로드 중인 파일 데이터
                        setUploadPercent(
                            // 파일 업로드가 완료 되면 퍼센트가 100%로 변하는 
                            Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100 // 결과 : % 
                        );
                    },
                    (error) => { // 업로드 오류
                        console.error(error);
                    },
                    async (success) => { // 업로드 완료
                        const url = await getDownloadURL(storageRef);
                        const response = await updateProfileImgApi(url);
                        queryClient.invalidateQueries(["userInfoQuery"]);
                    }
                );
            }
        }
    }

    const handleDefaultImgChangeOnClick = async() => {
        if(window.confirm("기본이미지로 변경하시겠습니까?")) {
            await updateProfileImgApi(""); // 기본 프로필
            queryClient.invalidateQueries(["userInfoQuery"]);
        }
    }

    return (
        <div css={layout}>
            <h1>프로필</h1>
            <div css={imgBox} onClick={handleImageChangeOnClick}>
                <img src={userInfoState?.data?.data.img} alt="" />
            </div>
            <div css={progressBox}>
                <Progress percent={uploadPercent} status={uploadPercent !== 100 ? "active" : "success"}/>
            </div>
            <div>
                <button onClick={handleDefaultImgChangeOnClick}>기본 이미지로 변경</button>
            </div>
        </div>
    );
}

export default UserProfilePage;