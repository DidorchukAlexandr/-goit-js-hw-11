import axios from "axios";
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const form = document.querySelector('.search-form');
const input = document.querySelector('.input');
const gallery = document.querySelector('.gallery');
const searchBtn = document.querySelector('.search');
const loadMoreBtn = document.querySelector('.load-more');
const MYAPI_KEY = '30803999-2b9bdfa4d87cb87078f15d2d8';
const myUrl = 'https://pixabay.com/api/';

let page = 1;
let perPage = 40;

const getUrlApi = (MYAPI_KEY, inputValue, page, perPage) =>
`?key=${MYAPI_KEY}&q=${inputValue}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

form.addEventListener('submit', onImageSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onImageSearch(evt) {
    evt.preventDefault();
    const inputValue = input.value.trim();

    if (inputValue) {
        gallery.innerHTML = '';
        page = 1;

        try {
            axios.defaults.baseURL = myUrl;
            const response = await axios.get(getUrlApi
                (MYAPI_KEY, inputValue, page, perPage));
            
            if (response.data.hits.length === 0) {
                Notiflix.Report.warning('Sorry, there are no images matching your search query. Please try again.');
            }

            if (response.data.hits.length > 0) {
                loadMoreBtn.classList.remove('is-hidden');
                render(response.data.hits);
                const simpleLightbox = new SimpleLightbox('.gallery a', {
                    captionDelay: 250,
                    captionsData: 'alt',
                }).refresh();
                const totalHits = response.data.totalHits;
                Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
            }
            if (response.data.hits.length < 40) {
                loadMoreBtn.classList.add('is-hidden');
            }
        } catch (error) {
            console.log(error);
        }
    }
}

function render(image) {
    const newGallery = image.map(({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
    }) => {
        return `
        <div class="main">
                <a class="photo-link" href="${largeImageURL}">
                    <img class="image" src="${webformatURL}" alt="${tags}" loading="lazy"  width="300" height="300"/>
                </a>
            <div class="info">
                <p class="info-item">
                   <b> Лайки:${likes}</b>
                </p>
                <p class="info-item">
                   <b> Просмотры: ${views}</b>
                </p>
                <p class="info-item">
                   <b> Комментарии: ${comments}</b>
                </p>
                <p class="info-item">
                   <b> Загрузки: ${downloads}</b>
                </p>
            </div>
        </div>`;
    }).join('');

    gallery.insertAdjacentHTML('beforeend', newGallery);
}

async function onLoadMore(evt) {
    evt.preventDefault();
    const inputValue = input.value.trim();
    page += 1;
    try {
        axios.defaults.baseURL = myUrl;
        const response = await axios.get(
            getUrlApi(MYAPI_KEY, inputValue, page, perPage));
        render(response.data.hits);
        const simpleLightbox = new SimpleLightbox('.gallery a').refresh();
        const maxValue = Math.floor(response.data.totalHits / perPage);
        if (maxValue < page) {
            loadMoreBtn.classList.add('is-hidden');
            Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        }
    } catch (error) {
        console.log(error);
    }
}


