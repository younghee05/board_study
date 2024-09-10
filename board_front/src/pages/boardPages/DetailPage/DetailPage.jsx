/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { instance } from "../../../apis/util/instance";
import { IoMdHeart, IoMdHeartEmpty  } from "react-icons/io";
import { useState } from "react";


const layout = css`
    box-sizing: border-box;
    margin: 50px auto 300px;
    width: 1100px;

`;

const header = css`
    box-sizing: border-box;
    margin-top: 5px;
    border: 1px solid #dbdbdb;
    padding: 0px 15px;
    & > h1 {
        margin: 0;
        margin-bottom: 15px;
        font-size: 38px;
        cursor: default;
    }

`;

const titleAndLike = css`
    display: flex;
    justify-content: space-between;
    align-items: center;

    & > button {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        border: none;
        background-color: #ffffff;
        cursor: pointer;

        & > svg {
            font-size: 30px;
        }
    }
`;

const contentBox = css`
    box-sizing: border-box;
    border: 1px solid #dbdbdb;
    padding: 12px 15px;
    // img에 속성이 없으면 너비 100%를 줘라
    & img:not(img[width]) {
        width: 100%;
    }
`
const boardInfoContainer = css`
    display: flex;
    justify-content: space-between;

    & span {
        margin-right: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: default;

    }

    & button {
        box-sizing: border-box;
        border: 1px;
        padding: 5px 20px;
        background-color: white;
        font-size: 12px;
        font-weight: 600;
        color: #333333;
        cursor: pointer;
        &:hover {
            background-color: #fafafa;
        }
        &:active {
            background-color: #eeeeee;
        }
    }
    
`;

const commentContainer = css`
    margin-bottom: 50px;
`;

const commentWriteBox = (level) => css`
    display: flex;
    box-sizing: border-box;
    margin-top: 5px;
    margin-left: ${level * 3}%;
    height: 80px;

    & > textarea {
        flex-grow: 1;
        margin-right: 5px;
        border: 1px solid #dbdbdb;
        outline: none;
        padding: 12px 15px;
        resize: none;
    }

    & > button {
        box-sizing: border-box;
        border: 1px solid #dbdbdb;
        width: 80px;
        background-color: #ffffff;
        cursor: pointer;
    }
`;

const commentListContainer = (level) => css` // 중괄호를 안쓰는 것은 바로 return을 하겠다는 뜻 
    box-sizing: border-box;
    display: flex;
    align-items: center;
    margin-left: ${level * 3}%;
    border-bottom: 1px solid #dbdbdb;
    padding: 12px 15px;

    & > div:nth-of-type(1) {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 12px;
        border: 1px solid #dbdbdb;
        border-radius: 50%;
        width: 70px;
        height: 70px;
        overflow: hidden;
        & > img {
            height: 100%;
        }
    }

`;

const commentDetail = css`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
`;

const detailHeader = css`
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;

    & > span:nth-of-type(1) {
        font-weight: 600;
        cursor: pointer;
    }
`;

const detailContent = css`
    margin-bottom: 10px;
    max-height: 50px;
    overflow-y: auto;
`;

const detailButtons = css`
    display: flex;
    justify-content: flex-end;
    width: 100%;
    & button {
        box-sizing: border-box;
        margin-left: 4px;
        border: 1px solid #dbdbdb;
        padding: 5px 10px;
        background-color: #ffffff;
        cursor: pointer;
    }
    
`;

function DetailPage(props) {
    const navigate = useNavigate();
    const params = useParams();
    const boardId = params.boardId;
    const queryClient = useQueryClient();
    const userInfoData = queryClient.getQueryData("userInfoQuery");
    const userInfoState = queryClient.getQueryState("userInfoQuery");

    const [ selectedCommentId, setSelectCommentId ] = useState(null);
    const [ commentData, setCommentData ] = useState({
        boardId, // key 값과 변수명이 같으면 key 값이 생략 가능하다 / boardId: boardId 에서 boardId: 가 생략 된것 
        parentId: null,
        content: "", // onChange 할 때 바뀔 값 

    });

    const board = useQuery(
        ["boardQuery", boardId],
        async () => {
            return instance.get(`/board/${boardId}`);
        },
        {
            refetchOnWindowFocus: false,
            retry: 0,
            onSuccess: response => {
                console.log(response);
            },
            onError: error => {

            }
        }
    );

    const boardLike = useQuery(
        ["boardLikeQuery"],
        async () => {
            return instance.get(`/board/${boardId}/like`);
        },
        {
            refetchOnWindowFocus: false,
            retry: 0
        }
    );

    const comments = useQuery(
        ["commentsQuery"],
        async () => {
            return instance.get(`/board/${boardId}/comments`);
        },
        {
            retry: 0,
            // onSuccess: response => console.log(response)
        }
    );

    // useQuery와 비슷 = useMutation
    const likeMutation = useMutation(
        async () => {
            await instance.post(`/board/${boardId}/like`)
        }, 
        {
            onSuccess: response => {
                boardLike.refetch();
            },
            onError: error => {
                console.log("like 에러");
                console.log(error);
            }
        }
    ); 

    const dislikeMutation = useMutation(
        async () => {
            return await instance.delete(`/board/like/${boardLike?.data?.data.boardLikeId}`)
        }, 
        {
            onSuccess: response => {
                boardLike.refetch();
            },
            onError: error => {
                console.log("dislike 에러");
                console.log(error);
            }
        }
    ); 

    const commentMutation = useMutation(
        async () => {
            return await instance.post("/board/comment", commentData);
        },
        {
            onSuccess: response => {
                alert("댓글 작성이 완료되었습니다.");
                setCommentData({
                    boardId,
                    parentId: null,
                    content: "",
                });
                comments.refetch(); // 다시 refetch 하여 들고와라 (데이터값을)
            }
        }
    );

    const deleteCommentMutation = useMutation(
        async (commentId) => await instance.delete(`/board/comment/${commentId}`),
        {
            onSuccess: response => {
                alert("댓글을 삭제하였습니다.");
                comments.refetch();
            }
        }
    );

    const handleLikeOnClick = () => {
        console.log(userInfoData);
        if(!userInfoData?.data) {
            if(window.confirm("로그인 후 이용가능합니다. 로그인 페이지로 이동하시겠습니까?")) {
                navigate("/user/login");
            }
            return;
        }
        likeMutation.mutateAsync();
    };
    
    const handledisLikeOnClick = () => {
        dislikeMutation.mutateAsync();
    };

    const handleCommentInputOnChange = (e) => {
        // comment의 데이터의 상태를 바꾸고 있음 
        setCommentData(commentData => ({
            ...commentData,
            [e.target.name]: e.target.value,
        }));
    };

    const handleCommentSubmitOnClick = () => {
        if(!userInfoData?.data) {
            if(window.confirm("로그인 후 이용가능합니다. 로그인 페이지로 이동하시겠습니까?")) {
                navigate("/user/login");
            }
            return;
        }
        commentMutation.mutateAsync(); // mutate에 async가  붙었으므로 비동기처리됨 
    };

    const handleReplyButtonOnClick = (commentId) => {
        setCommentData(commentData => ({
            boardId,
            parentId: commentId === commentData.parentId ? null : commentId,
            content: "",
        }));
    }; 

    const handleDeleteCommentButtonOnClick = (commentId) => {
        deleteCommentMutation.mutateAsync(commentId);
    }

    return (
        <div css={layout}>
            <Link to={"/"}><h1>사이트 로고</h1></Link>
            {
                board.isLoading && <></>
            }
            {
                board.isError && <h1>{board.error.response.data}</h1>
            }
            {
                board.isSuccess &&
                <>
                    <div css={header}>
                        <div css={titleAndLike}>
                            <h1>{board.data.data.title}</h1>
                            {
                                !!boardLike?.data?.data?.boardLikeId
                                    ?
                                    <button onClick={handledisLikeOnClick}>
                                        <IoMdHeart color="red"/>
                                    </button>
                                    :
                                    <button onClick={handleLikeOnClick}>
                                        <IoMdHeartEmpty />
                                    </button>
                            }
                        </div>

                        <div css={boardInfoContainer}>
                            <div>
                                <span>
                                    작성자: {board.data.data.writerUsername}
                                </span>
                                <span>
                                    조회: {board.data.data.viewCount}
                                </span>
                                <span>
                                    추천: {boardLike?.data?.data.likeCount}
                                </span>
                            </div>
                            <div>
                                {
                                    console.log(userInfoData?.data.userId)
                                },
                                {
                                    board.data.data.writerId === userInfoData?.data.userId &&
                                    <>
                                        <button>수정</button>
                                        <button>삭제</button>
                                    </>
                                }
                            </div>
                        </div>
                    </div>

                    <div css={contentBox} dangerouslySetInnerHTML={{
                        __html: board.data.data.content }}>
                    </div>
                    <div css={commentContainer}>
                        <h2>댓글 {comments?.data?.data.commentCount}</h2>
                        {
                            commentData.parentId === null &&
                            <div css={commentWriteBox(0)}>
                                <textarea name="content" disabled={commentData.parentId !== null} onChange={handleCommentInputOnChange} value={commentData.content} placeholder="댓글을 입력하세요."></textarea>
                                <button disabled={commentData.parentId !== null} onClick={handleCommentSubmitOnClick}>작성하기</button>
                            </div>
                        }
                        <div >
                            {
                                comments?.data?.data.comments.map(comment =>  
                                    <div key={comment.id}>
                                        <div css={commentListContainer(comment.level)}>
                                            <div>
                                                <img src={userInfoState?.data?.data.img} alt="" />
                                            </div>

                                            <div css={commentDetail}> 
                                                <div css={detailHeader}>
                                                    <span>{comment.username}</span>
                                                    <span>{new Date(comment.createDate).toLocaleString()}</span>
                                                </div>

                                                <pre css={detailContent}>{comment.content}</pre>

                                                <div css={detailButtons}>
                                                    {
                                                        userInfoData?.data?.userId === comment.writerId && 
                                                        <div>
                                                            <button>수정</button>
                                                            <button onClick={() => handleDeleteCommentButtonOnClick(comment.id)}>삭제</button>
                                                        </div>
                                                    }
                                                    {
                                                        comment.level < 3 &&
                                                        <div>
                                                            <button onClick={() => handleReplyButtonOnClick(comment.id)}>답글</button>
                                                        </div>
                                                    }
                                                    
                                                </div>
                                            </div>
                                        </div>
                                            {
                                                commentData.parentId === comment.id && 
                                                <div css={commentWriteBox(comment.level)}>
                                                    <textarea name="content" onChange={handleCommentInputOnChange} value={commentData.content} placeholder="댓글을 입력하세요."></textarea>
                                                    <button onClick={handleCommentSubmitOnClick}>작성하기</button>
                                                </div>
                                            }
                                    </div>
                                )
                            }
                            
                        </div>
                    </div>
                </>
            }
            
        </div>
    );
}

export default DetailPage;




