import React, {useState, useEffect, Fragment} from 'react'
import axios from 'axios'
import styled from 'styled-components'

import Header from './Header'
import ReviewForm from './ReviewForm'
import Review from './Review'


const Wrapper = styled.div`
  margin-left: auto;
  margin-right: auto;
`;

const Column = styled.div`
  background: #fff; 
  max-width: 50%;
  width: 50%;
  float: left; 
  height: 100vh;
  overflow-x: scroll;
  overflow-y: scroll; 
  overflow: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
  &:last-child {
    background: black;
    border-top: 1px solid rgba(255,255,255,0.5);
  }
`;

const Main = styled.div`
  padding-left: 60px;
`;


const Airline = (props) => {
    const [airline, setAirline] = useState({});
    const [review, setReview] = useState({});
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
       const slug = props.match.params.slug;

       const url = `/api/v1/airlines/${slug}`;

       axios.get(url).then(
           resp => {
               setAirline(resp.data);
               setLoaded(true);
           }
       ).catch(
           resp => console.log(resp)
       );

    }, []);

    const handleChange = (e) => {
        // console.log('name:', e.target.name, 'value:', e.target.valueOf);
        e.preventDefault();
        setReview({...review, [e.target.name]: e.target.value});

        // console.log('review:', review)
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const csrfToken = document.querySelector('[name=csrf-token]').content;
        axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;

        const airline_id = airline.data.id;
        axios.post('/api/v1/reviews', {review, airline_id})
            .then(resp => {
                // Ajouter le dernier review a notre liste de reviews, sans faire une nouvelle requete
                const included = [...airline.included, resp.data.data];
                setAirline({...airline, included});
                setReview({title: '', description: '', score: 0});
            }).catch(resp => {console.log(resp)});
    };

    const setRating = (score, e) => {
        setReview({...review, score});
    };

    let reviews;
    if (loaded && airline.included){
        reviews = airline.included.map((item, index) => {
           return (
               <Review key={index} attributes={item.attributes}/>
           )
        });
    }

    return (
        <div>
            <Wrapper>
                {
                    loaded &&
                    <Fragment>
                        <Column>

                            <Header attributes={airline.data.attributes} reviews={airline.included}/>

                            {reviews}
                        </Column>

                        <Column>
                            <ReviewForm handleChange={handleChange} handleSubmit={handleSubmit} setRating={setRating} attributes={airline.data.attributes} reviews={review} />
                        </Column>
                    </Fragment>
                }

            </Wrapper>
        </div>
    )
};

export default Airline