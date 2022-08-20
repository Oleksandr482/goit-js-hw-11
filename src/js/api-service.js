import { Notify } from 'notiflix/build/notiflix-notify-aio';
const axios = require('axios');

export default class NewApiService {
    constructor() {
        this.searchQuery = '';
        this.page = 1;
        this.totalPages = null;
    }

    async fetchArticles() {
        const API_KEY = '29336410-bf8336e60ac171a1237415fd3';
        const OPTIONS = 'image_type=photo&orientation=horizontal&safesearch=true&lang=en&lang=uk&per_page=40'
        const url = `https://pixabay.com/api/?key=${API_KEY}&q=${this.searchQuery}&${OPTIONS}&page=${this.page}`;
        
        const r = await axios.get(url);
        const data = await r.data;
        const photos = await this.getArrayOfPhotos(data)
        return photos;
    }

    getArrayOfPhotos(r) {
        this.totalPages = Math.ceil(r.totalHits / 40);
        if (r.totalHits === 0) {
            return Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        }
        if (this.page === 1) {
            Notify.success(`Hooray! We found ${r.totalHits} images.`);
        }
        this.page += 1;
        return r.hits;
    }

    resetPage() {
        this.page = 1;
        this.totalPages = null;
    }
    
    get query() {
        return this.searchQuery;
    }

    set query(newQuery) {
        this.searchQuery = newQuery;
    }
}
    