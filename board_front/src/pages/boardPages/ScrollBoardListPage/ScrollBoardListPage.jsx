/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';
import { IoMdHeart } from 'react-icons/io';
import { useInfiniteQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { instance } from '../../../apis/util/instance';

const layout = css`
    margin: 0px auto;
    width: 1030px;
    background-color: #fafafa;
`;

const cardLayout = css`
    display: flex;
    flex-wrap: wrap;
    border-top: 3px solid #dbdbdb;
    padding: 0;
    padding-top: 50px;
    width: 100%;
    list-style-type: none;
`;

const card = css`
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    margin: 0px 0px 40px;
    width: 330px;
    height: 330px;
    box-shadow: 0px 3px 5px #00000011;
    transition: all 0.3s ease-in-out;

    cursor: pointer;

    &:nth-of-type(3n - 1) { // 3의 배수에 -1 을 하므로 중간에 타입이 주어짐
        margin: 0px 20px 40px;
        
    }

    &:hover {
        transform: translateY(-5%);
        box-shadow: 0px 3px 10px #00000011;
    }
`;

const cardMain = css`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
`;

const cardImg = css`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 170px;
    overflow: hidden;

    & > img {
        width: 100%;
    }
`;

const cardContent = (isShowImg) => css`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 10px;

    & > h3 {
        margin: 0px 0px 4px;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    & > div {
        display: -webkit-box;
        flex-grow: 1;
        overflow: hidden;
        word-break: break-all;
        -webkit-line-clamp: ${isShowImg ? 3 : 11};
        -webkit-box-orient: vertical;
        text-overflow: ellipsis;
    }
`;

const cardFooter = css`
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #f5f5f5;
    padding: 0px 15px;
    height: 50px;

    & > div:nth-of-type(1) {
        display: flex;
        align-items: center;
        font-weight: 600;

        & > img {
            margin-right: 5px;
            border: 1px solid #dbdbdb;
            border-radius: 50%;
            width: 20px;
            height: 20px;
        } 

        & > span {
            margin-right: 8px;
            font-weight: 400;
            font-size: 14px;
            color: #999999;
        }
    }

    & > div:nth-of-type(2) {
        display: flex;
        align-items: center;
        & > span {
            line-height: 10px;
        }
    }
`;

// 무한 스크롤
function ScrollBoardListPage(props) {

    const loadMoreRef = useRef(null);
    const [ currentPage, setCurrentPage ] = useState(1);
    const limit = 20;

    // useInfiniteQuery 는 무한 스크롤할 때 쓰이는 query이다.
    const boardList = useInfiniteQuery(
        ["boardScrollQuery"],
        async ({pageParam = 1}) => await instance.get(`/board/list?page=${pageParam}&limit=${limit}`),
        {
            // null 이거나 undifind이면 null 아니면 lastPage.nextPage인 그대로 값이 리턴된다.
            getNextPageParam: (lastPage, allPage) => lastPage.nextPage ?? null,
            onSuccess: response => console.log(response)
            
        }
    );

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                console.log("div 보임!!!");
            }
        }, { threshold: 1.0 });

        observer.observe(loadMoreRef.current)
    }, []);

    return (
        <div css={layout}>
            <Link to={"/"}><h1>사이트 로고</h1></Link>
            <ul css={cardLayout}>
                {
                    boardList.data?.pages.map(page => page.data.boards.map(board => {
                        const mainImgStartIndex = board.content.indexOf("<img"); // img로 부터 열리는 index를 찾는
                        console.log(mainImgStartIndex);

                        let mainImg = board.content.slice(mainImgStartIndex);
                        mainImg = mainImg.slice(0, mainImg.indexOf(">") + 1);
                        const mainImgSrc = mainImg.slice(mainImg.indexOf("src") + 5, mainImg.length - 2) // " 전까지 자르는 

                        console.log(mainImgSrc);
                        return (
                            <li key={board.id} css={card}>
                                <main css={cardMain}>
                                    {
                                        mainImgStartIndex != -1 &&
                                        <div css={cardImg}>
                                            <img src={mainImgSrc} alt="" />
                                        </div>
                                    }
                                    <div css={cardContent(mainImgStartIndex != -1)}>
                                        <h3>테스트 글입니다. 문자열이 길어지면 이렇게 표시하세요 </h3>
                                        <div>testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest</div>
                                    </div>
                                </main>
                                <footer css={cardFooter}>
                                    {/* 사용자 */}
                                    <div>
                                        <img src="" alt="" />
                                        <span>by</span>
                                        user12
                                    </div>
                                    {/* 좋아요 갯수 */}
                                    <div><IoMdHeart color='red' /><span>10</span></div>
                                </footer>
                            </li>
                        )
                    }))
                }
            </ul>
            <div ref={loadMoreRef}></div>
        </div>
    );
}

export default ScrollBoardListPage;