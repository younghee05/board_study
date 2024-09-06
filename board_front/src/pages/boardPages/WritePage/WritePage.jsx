/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import { useCallback, useMemo, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import 'react-quill/dist/quill.snow.css';
import ImageResize from "quill-image-resize";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../../firebase/firebase";
import { v4 as uuid } from "uuid";
import { CircleLoader, RingLoader } from "react-spinners";
import { boardApi } from "../../../apis/boardApi";
import { useNavigate } from "react-router-dom";
import { instance } from "../../../apis/util/instance";

Quill.register("modules/ImageResize", ImageResize);

const layout = css`
    box-sizing: border-box;
    margin: 0 auto;
    padding-top: 30px;
    width: 1100px;
`;  

const header = css`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin: 10px 0px;

    & > h1 {
        margin: 0;
    }

    & > button {
        box-sizing: border-box;
        border: 1px solid #c0c0c0;
        padding: 6px 15px;
        background-color: white;
        font-size: 12px;
        color: #333333;
        font-weight: 600;
        cursor: pointer;

        &:hover {
            background-color: #fafafa;
        }
        &:active {
            background-color: #eeeeee;
        }
    }
`;

const titleInput = css`
    box-sizing: border-box;
    margin-bottom: 10px;
    border: 1px solid #c0c0c0;
    outline: none;
    padding: 12px 15px;
    width: 100%;
    font-size: 16px;
    
`;

const editorLayout = css`
    box-sizing: border-box;
    margin-bottom: 42px;
    width: 100%;
    height: 700px;
`;

const loadingLayout = css`
    position: absolute;
    left: 0;
    top: 0;
    z-index: 99;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #00000033;
`;


function WritePage(props) {
    const navigate = useNavigate();

    const [ board, setBoard ] = useState({
        title: "",
        content: ""
    });

    const quillRef = useRef(null);
    const [ isUploading, setUploading ] = useState(false); // true : 로딩중 / false : 로딩완료

    // async await 쓴 예시
    const handleWriteSubmitOnClick = async() => {
        try {
            const response = await instance.post("/board", board); // await을 달수있는 조건 1. async 안에서만 가능 2. promise 여야 한다 
            alert("작성이 완료되었습니다.");
            navigate(`/board/detail/${response.data.boardId}`);
        } catch (error) {
            const fieldErrors = error.response.data;

                for (let fieldError of fieldErrors) {
                    if(fieldError.field === "title") {
                        alert(fieldError.defaultMessage);
                        return;
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

    // async 와 await을 안쓴 예시 
    // const handleWriteSubmitOnClick = async () => {
    //     instance.post("/board", board)
    //         .then((response) => {
    //             alert("작성이 완료되었습니다.");
    //             navigate(`/board/detail/${response.data.boardId}`);
    //         })
    //         .catch((error) => {
    //             const fieldErrors = error.response.data;

    //             for (let fieldError of fieldErrors) {
    //                 if(fieldError.field === "title") {
    //                     alert(fieldError.defaultMessage);
    //                     return;
    //                 }
    //             }
    //             for (let fieldError of fieldErrors) {
    //                 if (fieldError.field === "content") {
    //                     alert(fieldError.defaultMessage);
    //                     break;
    //                 }
    //             }
    //         })
    //     // const boardData =  await boardApi(board);
    //     // console.log(boardData);
    // }

    const handleTitleInputOnChange = (e) => {
        setBoard(board => ({
            ...board,
            [e.target.name]: e.target.value,
        }));
    }
    
    const handleQuillValueOnChang = (value) => {
        // console.log(value); // html 코드로 작성이 된다 / 무조건 p 태그로 둘러쌓여짐
        // setQuillValue(value);
        setBoard(board => ({
            ...board,
            content: quillRef.current.getEditor().getText().trim() === "" ? "" : value, // 태그없이 문자열만 가지고 오는 형식
        }));
    }

    // useCallback 은 같은 주소를 계속 가지고 오게 해주는 기능
    const handleImageLoad = useCallback (() => {
        // 이미지를 불러올 수 있는 파일을 실행함 
        const input = document.createElement("input"); 
        input.setAttribute("type", "file");
        input.click();

        // 이미지를 불러옴
        input.onchange = (e) => {
            const editor = quillRef.current.getEditor();
            const files = Array.from(input.files);
            const imgFile = files[0]; 
            
            const editPoint = editor.getSelection(true);

            const storageRef = ref(storage, `board/img/${uuid()}_${imgFile.name}`);
            const task = uploadBytesResumable(storageRef, imgFile);
            setUploading(true);
            task.on(
                "state_changed",
                () => {},
                () => {},
                async () => {
                    // 업로드 성공시
                    const url = await getDownloadURL(storageRef);
                    editor.insertEmbed(editPoint.index, "image", url);
                    editor.setSelection(editPoint.index + 1);
                    editor.insertText(editPoint.index + 1, "\n");
                    setUploading(false);
                }
            )
        }

    }, []);

    const toolbarOptions = useMemo(() => [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'color': [] }, { 'background': [] }, { 'align': [] }],          // dropdown with defaults from theme
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        ['link', 'image', 'video', 'formula'],
        ['blockquote', 'code-block'],
    ], []);

    return (
        <div css={layout}>
            <header css={header}>
                <h1>Quill Edit</h1>
                <button onClick={handleWriteSubmitOnClick} >작성하기</button>
            </header>
            <input css={titleInput} type="text" name="title" onChange={handleTitleInputOnChange} value={board.title} placeholder="게시글의 제목을 입력하세요."/>
            <div css={editorLayout}>
                {
                    isUploading &&
                    <div css={loadingLayout}>
                        <RingLoader />
                    </div>
                }

                <ReactQuill 
                    ref={quillRef}
                    style={{
                        boxSizing: "border-box",
                        width: "100%",
                        height: "100%",
                    }}
                    onChange={handleQuillValueOnChang}
                    modules={{
                        toolbar: {
                            container: toolbarOptions,
                            handlers: {
                                image: handleImageLoad,
                            }
                        },
                        ImageResize: {
                            parchment: Quill.import('parchment')
                        },
                        
                    }}

                />

            </div>
            
        </div>
    );
}

export default WritePage;