import './css/common.css';
import articlecTpl from './templates/articles.hbs';
import NewsApiService from './js/api-service.js';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import throttle from 'lodash.throttle';

const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadingEl: document.querySelector('#load-more')
}
let isLoading = false;

refs.searchForm.addEventListener('submit', onSearch)
window.addEventListener('scroll', throttle(checkPosition, 250))
window.addEventListener('resize', throttle(checkPosition, 250))

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
  if (isLoading || photosApiService.query === '') return;
  isLoading = true;
  photosApiService.fetchArticles().then(r => {
    getResponse(r);
    if (photosApiService.onePage||photosApiService.pages===0) {
    refs.loadingEl.classList.add('is-hidden')
  }
  })
    .catch(e => {
    Notify.failure('Oops, error!!!')
  })
}

function onLoadMore() {
  if (isLoading || photosApiService.query === '') return;
  isLoading = true;
  photosApiService.fetchArticles().then(r => {
    getResponse(r)
    if (photosApiService.hidden) {
    refs.loadingEl.classList.add('is-hidden')
  }
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
    gallery.refresh()
    isLoading = false;
}

function checkPosition() {
  const height = document.body.offsetHeight
  const screenHeight = window.innerHeight
  const scrolled = window.scrollY
  const threshold = height - screenHeight / 2
  const position = scrolled + screenHeight

  if (position >= threshold) {
    onLoadMore();
  }
}