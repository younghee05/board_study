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
import { useNavigate, useParams } from "react-router-dom";
import { instance } from "../../../apis/util/instance";
import { useMutation, useQuery } from "react-query";

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

`;

const modifyButton = css`

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

    & > button:nth-of-type(1) {
        margin-right: 5px;
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


function ModifyPage(props) {
    const navigate = useNavigate();
    const params = useParams();
    const boardId = params.boardId;

    const [ modifyBoardData, setModifyBoardData ] = useState({
        boardId,
        title: "",
        content: ""
    });

    const quillRef = useRef(null);
    const [ isUploading, setUploading ] = useState(false); 

    const modifyBoard = useQuery(
        ["modifyBoardQuery"],
        async () => await instance.get(`/board/${boardId}`),
        {
            retry: 0,
            refetchOnWindowFocus: false,
            onSuccess: response => {
                console.log(response);
                setModifyBoardData({
                    boardId,
                    title: response.data.title,
                    content: response.data.content
                })
            }
        }
    );
    
    const modifyBoardMutation = useMutation(
        async() => await instance.put(`/board/modify/${modifyBoardData.boardId}`, modifyBoardData), 
        {
            onSuccess: response => {
                console.log(response);
                alert("수정이 완료되었습니다");
                setModifyBoardData({
                    boardId,
                    title: "",
                    content: ""
                });
                modifyBoard.refetch();
                navigate(-1);

            }
        }
    );

    const handleModifyBoardSubmitOnClick = async () => {
        const modifyBoardConfirm = window.confirm("수정하시겠습니까?");

        if(!modifyBoardData.title.trim()) {
            alert("제목은 공백일 수 없습니다.");
            return;
        }

        if(!modifyBoardData.content.trim()) {
            alert("내용은 공백일 수 없습니다.")
            return;
        }

        if(modifyBoardConfirm) {
            try {
                await modifyBoardMutation.mutateAsync();
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
        };
        
    }

    const handleTitleInputOnChange = (e) => {
        setModifyBoardData(board => ({
            ...board,
            [e.target.name]: e.target.value,
        }));
    }
    
    const handleQuillValueOnChang = (value) => {
        setModifyBoardData(board => ({
            ...board,
            content: quillRef.current.getEditor().getText().trim() === "" ? "" : value, 
        }));
    }

    const handleImageLoad = useCallback (() => {
        const input = document.createElement("input"); 
        input.setAttribute("type", "file");
        input.click();

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
                    const url = await getDownloadURL(storageRef);
                    editor.insertEmbed(editPoint.index, "image", url);
                    editor.setSelection(editPoint.index + 1);
                    editor.insertText(editPoint.index + 1, "\n");
                    setUploading(false);
                    setModifyBoardData(board => ({
                        ...board,
                        content: editor.root.innerHTML,
                    }));
                }
            )
        }

    }, []);

    const toolbarOptions = useMemo(() => [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        ['bold', 'italic', 'underline', 'strike'],       
        [{ 'color': [] }, { 'background': [] }, { 'align': [] }],          
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],          
        ['link', 'image', 'video', 'formula'],
        ['blockquote', 'code-block'],
    ], []);

    return (
        <div css={layout}>
            <header css={header}>
                <h1>게시글 수정</h1>
                <div css={modifyButton}>
                    <button onClick={() => navigate(-1)} >취소하기</button>
                    <button onClick={handleModifyBoardSubmitOnClick} >수정하기</button>
                </div>
            </header>
            <input css={titleInput} type="text" name="title" onChange={handleTitleInputOnChange} value={modifyBoardData.title} placeholder="게시글의 제목을 입력하세요."/>
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
                    value={modifyBoardData.content}

                />

            </div>
            
        </div>
    );
}

export default ModifyPage;