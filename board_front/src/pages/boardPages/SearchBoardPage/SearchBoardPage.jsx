/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import ReactPaginate from 'react-paginate';
import { useQuery } from 'react-query';
import { instance } from '../../../apis/util/instance';
import { useState } from 'react';

const paginateContainer = css`
    & > ul {
        list-style-type: none;
        display: flex;

        & > li {
            margin: 0px 5px;
        }

        & a {
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            border: 1px solid #dbdbdb;
            border-radius: 32px;
            padding: 0px 5px;
            min-width: 32px;
            height: 32px;
            font-size: 12px;
            font-weight: 600; 
            cursor: pointer;
        }

            & .active {
                border-radius: 32px;
                background-color: #bbbbbb;
                color: #ffffff;
            }
    }
`;

function SearchBoardPage(props) {
    const navigate = useNavigate();
    const [ searchParams, setSearchParams ] = useSearchParams(); // 주소:포토/페이지URL?key=value(쿼리스트링, 파람스)
    const [ totalPageCount, setTotalPageCount ] = useState(1);
    // 왼쪽 값이 null 또는 undefined인 경우 오른쪽 값을 사용
    const [ searchValue, setSearchValue ] = useState(searchParams.get("search") ?? ""); // searchParams.get("search")가 null이거나 undefined이면 빈 문자열("")을 초기값으로 사용하겠다는 의미
    const [ searchOption, setSearchOption ] = useState(searchParams.get("option") ?? "all");
    const limit = 10;

    const boardList = useQuery(
        ["boardListQuery", searchParams.get("page"), searchParams.get("option"), searchParams.get("search") ], // page가 바뀔때마다 boardListQuery가 실행된다.
        async () => await instance.get(`/board/search?page=${searchParams.get("page")}&limit=${limit}&search=${searchValue}&option=${searchOption}`), // 문자열로 nulldl
        {
            retry: 0,
            refetchOnWindowFocus: false,
                onSuccess: response => setTotalPageCount(
                    response.data.totalCount % limit === 0 
                        ? response.data.totalCount / limit 
                        : Math.floor(response.data.totalCount / limit) + 1)
        }
    );
    
    const handleSearchOptionOnChange = (e) => {
        setSearchOption(e.target.value);
    }
    
    const handleSearchInputOnChange = (e) => {
        setSearchValue(e.target.value);
    } 


    const handleSearchButtonOnClick = () => {
        navigate(`/board/search?page=1&option=${searchOption}&search=${searchValue}`);
    }

    const handlePageOnChange = (e) => {
        navigate(`/board/search?page=${e.selected + 1}&option=${searchOption}&search=${searchValue}`);
    }
    

    return (
        <div>
            <Link to={"/"}><h1>사이트 로고</h1></Link>
            <div>
                <select onChange={handleSearchOptionOnChange} value={searchOption}>
                    <option value="all">전체</option>
                    <option value="title">제목</option>
                    <option value="writer">작성자</option>
                </select>
                <input type="search" onChange={handleSearchInputOnChange} value={searchValue} />
                <button onClick={handleSearchButtonOnClick}>검색</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>추천</th>
                        <th>조회</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        boardList.isLoading
                        ?
                        <></>
                        : // loding이 끝나면 
                        boardList?.data?.data?.boards?.map(board => 
                            <tr key={board.id} onClick={() => navigate(`/board/detail/${board.id}`)}>
                                <td>{board.id}</td>
                                <td>{board.title}</td>
                                <td>{board.writerName}</td>
                                <td>{board.likeCount}</td>
                                <td>{board.viewCount}</td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
            <div css={paginateContainer}>
                <ReactPaginate 
                    breakLabel="..."
                    previousLabel={<><IoMdArrowDropleft /></>}
                    nextLabel={<><IoMdArrowDropright /></>}
                    pageCount={totalPageCount}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    activeClassName='active'
                    onPageChange={handlePageOnChange}
                    forcePage={parseInt(searchParams.get("page")) - 1} // 페이지 번호를 수동적으로 칠때 그 페이지번호로 넘어갈 수 있는

                />
            </div>
        </div>
    );
}

export default SearchBoardPage;