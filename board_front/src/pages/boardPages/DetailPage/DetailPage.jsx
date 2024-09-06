/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { instance } from "../../../apis/util/instance";
import { IoMdHeart, IoMdHeartEmpty  } from "react-icons/io";


const layout = css`
    box-sizing: border-box;
    margin: 50px auto 0px;
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

function DetailPage(props) {
    const navigate = useNavigate();
    const params = useParams();
    const boardId = params.boardId;
    const queryClient = useQueryClient();
    const userInfoData = queryClient.getQueryData("userInfoQuery");

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

    // useQuery와 비슷 
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

    const handleLikeOnClick = () => {
        console.log(userInfoData);
        if(!userInfoData?.data) {
            if(window.confirm("로그인 후 이용가능합니다. 로그인 페이지로 이동하시겠습니까?")) {
                navigate("/user/login");
            }
            return;
        }
        likeMutation.mutateAsync();
    }
    
    const handledisLikeOnClick = () => {
        dislikeMutation.mutateAsync();
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
                                        <IoMdHeart />
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
                                }
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
                </>
            }
            
        </div>
    );
}

export default DetailPage;