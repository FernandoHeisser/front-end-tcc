import axios from 'axios';

const api = axios.create({
    baseURL: 'https://heroku-tcc-back-end.herokuapp.com/'
})

export default api;