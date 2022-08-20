import './css/common.css';
import articlecTpl from './templates/articles.hbs';
import NewsApiService from './js/api-service.js';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadingEl: document.querySelector('#load-more')
}

const infiniteScroll = new IntersectionObserver(([entry], observer) => {
  if (entry.isIntersecting) {
    observer.unobserve(entry.target)
  onLoadMore();
  }
})

refs.searchForm.addEventListener('submit', onSearch);

const photosApiService = new NewsApiService()
const gallery = new SimpleLightbox('.gallery a', {})

function onSearch(e) {
  e.preventDefault();
  refs.loadingEl.classList.remove('is-hidden')
  refs.gallery.innerHTML = '';
  photosApiService.query = e.currentTarget.elements.searchQuery.value
  photosApiService.resetPage()
    if (photosApiService.query === '') {
      refs.loadingEl.classList.add('is-hidden')
      return Notify.info('Enter your query, please ;-)')
    }
  refs.searchForm.reset();
  photosApiService.fetchArticles().then(r => {
    getResponse(r);
    if (photosApiService.totalPages<=1) {
    refs.loadingEl.classList.add('is-hidden')
    }
    addObserver();
  })
    .catch(e => {
    Notify.failure('Oops, error!!!')
  })
}

function onLoadMore() {
  if (photosApiService.page > photosApiService.totalPages) {
    refs.loadingEl.classList.add('is-hidden')
    Notify.info("We're sorry, but you've reached the end of search results.");
    return
  }
  photosApiService.fetchArticles().then(r => {
    getResponse(r);
    addObserver();
  }).catch(e => {
    Notify.failure('Oops, error!!!')
  })
}

function createGallery(hits) {
  const markup = articlecTpl(hits)
  refs.gallery.insertAdjacentHTML('beforeend', markup)
}

function getResponse(r) {
    createGallery(r);
  gallery.refresh();
}

function addObserver() {
  const lastPhoto = document.querySelector('.gallery a:last-child')
    if (lastPhoto) {
      infiniteScroll.observe(lastPhoto)
    }
}