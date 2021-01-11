import React from 'react';
import axios from 'axios';
import Loader from '../loading.gif';
import PageNavigation from './PageNavigation.js';
//import Details from './PageNavigation.js';

class Search extends React.Component {
    
    constructor (props){
        super(props);

        this.state={
            query: '',
            results:{},
            results2:{},
            loading: false,
            message: '',
            totalResults: 0,
            totalPages: 0,
            currentPageN: 0,
            show:false,
        };

        this.cancel= '';
    }

    getPageCount = ( total, denominator ) => {
        const divisible = 0 === total % denominator;
        const valueToBeAdded = divisible ? 0: 1;
        return Math.floor( total/denominator ) + valueToBeAdded;
    }

    /* 6d4b5d48ae4cf0c60344d2244ba8e195
    https://api.themoviedb.org/3/search/movie?api_key=6d4b5d48ae4cf0c60344d2244ba8e195&language=en-US&query=infinity&page=1
    */
    fetchSearchResults = (updatedPageNo = '', query) =>{
        const pageNumber = updatedPageNo ? `&page=${updatedPageNo}` : '';
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=6d4b5d48ae4cf0c60344d2244ba8e195&language=en-US&query=${query}${pageNumber}`;

        if( this.cancel ){
            this.cancel.cancel();
        }

        this.cancel = axios.CancelToken.source();

        axios.get( searchUrl, {
            cancelToken: this.cancel.token
        })
            .then( res=>{
                const total = res.data.total_results;
                const totalPagesCount = this.getPageCount( total, 20 );
                /* const totalPagesCount = res.data.total_pages; probar despues */
                console.warn( res.data );
                const resultNotFoundMsg = ! res.data.results.length ? 'There are no more search results.' : '';
                this.setState({
                    results: res.data.results,
                    message: resultNotFoundMsg,
                    totalResults: total,
                    totalPages: totalPagesCount,
                    currentPageN: updatedPageNo,
                    loading: false,
                    show: false,
                })
                
            })
            .catch( error=>{
                if(axios.isCancel(error) || error ){
                    this.setState({
                        loading: false,
                        message: ' ',/* Failed to fetch the data. Please check network */
                    })
                }
            } )
    };

    handleOnInputChange = ( event ) => {
        const query = event.target.value;
        if(!query){
            this.setState({query, results:{}, message:''})
        }else{
            this.setState({query:query, loading:true, message: '' },  ()=>{
                this.fetchSearchResults(1,query);
            } );
        }
    };

    handlePageClick = ( type , /*event*/ ) => {
        //event.preventDefault();
        const updatedPageNo = 'prev' === type ? this.state.currentPageN - 1 : this.state.currentPageN + 1;

        if( ! this.state.loading ){
            this.setState({loading: true, message:'' }, () => {
                this.fetchSearchResults( updatedPageNo, this.state.query );
            });
        }
    };

    renderSearchResults = () => {
        const {results} = this.state;
        if( Object.keys(results).length && results.length){
            return(
                <div className="results-container">
                    { results.map( result=> {
                        const x = "https://image.tmdb.org/t/p/w185";
                        const alttext = " poster image";
                        return(
                            //https://api.themoviedb.org/3/search/movie?api_key=6d4b5d48ae4cf0c60344d2244ba8e195&language=en-US&query=infinity&page=1
                            // imagen https://image.tmdb.org/t/p/w600_and_h900_bestv2 + result.poster_path
                            <p key={result.id} /*href={result.title}*/ className="result-item">
                                <h6 className="pic-tittle">{result.title}</h6>
                                <div className="img-cont">
                                <img className="img" src={x+result.poster_path} alt={result.title+alttext}/>
                                <p class="cuerpo">{result.overview} <p></p> <button class="moreinfo" onClick={()=>{this.changeShow(); this.showResults(result.id)}}>More info</button></p>
                                </div>
                            </p>
                        )
                    } )}
                </div>
            )
        }
    };
    
    changeShow(){
            this.state.show = true
    }

    showResults(url){

        const x = "https://image.tmdb.org/t/p/w780";
        const alttext = " poster image";
        const neourl = `https://api.themoviedb.org/3/movie/${url}?api_key=6d4b5d48ae4cf0c60344d2244ba8e195&language=en-US`;

        axios.get(neourl).then( res=>{
            //const total = res.data.total_results;
            console.warn( res.data );
            this.setState({
                results2: res.data,
            })

            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;

        })
            return(
                <div itemID="objdet" className={`infowindow ${this.state.show ? 'show' : 'hide'}`}>
                
                <div class="box">
                <h1 id="title">{this.state.results2.title}</h1>
                <img className="detailimg" itemID="img" src={x+this.state.results2.poster_path} alt={this.state.results2.title+alttext}/>
                <p></p>
                <h2 class="strong"><strong>Synopsis: </strong></h2>
                <p id="sinop">{this.state.results2.overview}</p>
                <h2 class="strong2"><strong>Average Score: </strong></h2>
                <h3><p id="score">{this.state.results2.vote_average}</p></h3>
                <h2 class="strong3"><strong>Release date: </strong></h2>
                <p id="release">{this.state.results2.release_date}</p>
                <button className="button" onClick={()=>{
                    this.setState({show:false})
                }}>Hide info</button>
                </div>
                </div>
                
            )

    };

    render(){

        const { query, loading, message, currentPageN, totalPages } = this.state;

        const showPrevLink = 1 < currentPageN;
        const showNextLink = totalPages > currentPageN;
        

        return(
            
            <div className="container">
                {/*heading*/}
                <h1 className="heading">The Movie Database</h1>
                {/*Search input */}
                <label className="search-label" htmlFor="search-input">
                    <input 
                        type="text"
                        name="query"
                        value={query}
                        id="search-input"
                        placeholder="Search..."
                        onChange={this.handleOnInputChange}
                    />
                    <i class="fas fa-search search-icon"/>
                </label>
                {/*error message*/}
                {message && <p classname="err-message">{message}</p>}

                {/*show or hide loading gif*/}
                <img src={Loader} alt="loading gif" className={`loading-gif ${loading ? 'show' : 'hide' } `}/>




                {/*Navigation*/}
                <PageNavigation
                    loading={loading}
                    showPrevLink={showPrevLink}
                    showNextLink={showNextLink}
                    handlePrevClick={() => this.handlePageClick('prev'/*, event*/)}
                    handleNextClick={() => this.handlePageClick('next'/*, event*/)}
                />

                {/*print results */}
                {this.renderSearchResults()}
                {this.showResults()}
                 {/*Navigation*/}
                <PageNavigation
                    loading={loading}
                    showPrevLink={showPrevLink}
                    showNextLink={showNextLink}
                    handlePrevClick={() => this.handlePageClick('prev'/*, event*/)}
                    handleNextClick={() => this.handlePageClick('next'/*, event*/)}
                />

            </div>
            
        )
    }
}

export default Search;