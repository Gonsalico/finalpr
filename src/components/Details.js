import React from 'react';

export default (url) => {
    
    const neourl = `https://api.themoviedb.org/3/movie/${url}?api_key=6d4b5d48ae4cf0c60344d2244ba8e195&language=en-US`;

    axios.get(neourl).then( res=>{
        //const total = res.data.total_results;
        console.warn( res.data );
        this.setState({
            results2: res.data,
        })
    })


    return(
        <div className="infowindow">
        <h1>{this.state.results2.title}</h1>
        <p>{this.state.results2.popularity}</p>
        </div>
    )
}