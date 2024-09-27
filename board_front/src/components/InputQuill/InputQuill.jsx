import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { instance } from '../../apis/util/instance';
import { getDownloadURL } from 'firebase/storage';
import ReactQuill from 'react-quill';

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





function InputQuill(props) {
    const navigate = useNavigate();
    
    const [ board, setBoard ] = useState({
        title: "",
        content: ""
    });
    
    const quillRef = useRef(null);
    const [ isUploading, setUploading ] = useState(false); 
    
    const handleQuillValueOnChang = (value) => {
        setBoard(board => ({
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
                    setBoard(board => ({
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
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'color': [] }, { 'background': [] }, { 'align': [] }],          // dropdown with defaults from theme
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        ['link', 'image', 'video', 'formula'],
        ['blockquote', 'code-block'],
    ], []);

    return (
        <>
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
        </>
    );
}

export default InputQuill;