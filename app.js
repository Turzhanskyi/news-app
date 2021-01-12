// Custom Http Module для get і post запитів
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    }
  };
}

// Init http module
const http = customHttp();

// Сервіс для роботи з новинами, який через apiKey взаємодіє з сервером новин apiUrl
const newsService = (function() {
  const apiKey = "f5c6b4b70c2f452d868c3712145e7753";
  const apiUrl = 'https://news-api-v2.herokuapp.com';

  return {
    topHeadlines(country = "ua", cb) {
      http.get(
        `${apiUrl}/top-headlines?country=${country}&category=technology&apiKey=${apiKey}`,
        cb
      );
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    }
  };
})();

//  init selects
document.addEventListener("DOMContentLoaded", function() {
  M.AutoInit();
  loadNews();
});

// Шукаємо елементи форми
const form = document.forms["newsControls"];
const countrySelect = form.elements["country"];
const searchInput = form.elements["search"];

form.addEventListener("submit", e => {
  e.preventDefault(); // для того, щоб форма не перезавантажувалась
  loadNews();
});

// Функція, що здійснює завантаження новин в розрізі вибраної країни topHeadlines або ключовим словом введеним у формі пошуку everything
function loadNews() {
  showLoader();

  const country = countrySelect.value;
  const searchText = searchInput.value;

  if (!searchText) {
    newsService.topHeadlines(country, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}

// Функція, що отримує відповідь від сервера
function onGetResponse(err, res) {
  removePreloader();

  if (err) {
    showAlert(err, "error-msg");
    return;
  }

  renderNews(res.articles);
}

// Функція, що рендерить новини на сторінку
function renderNews(news) {
  const newsContainer = document.querySelector(".news-container .row");
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = "";

  news.forEach(newsItem => {
    const el = newsTemplate(newsItem);
    fragment += el;
  });
  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}

// Функція, що очищує контейнер новин
function clearContainer(container) {
  // container.innerHTML = '';
  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

// Функція, що формує темплейт рендеренгу новин
function newsTemplate({ urlToImage, title, url, description }) {
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage}">
          <span class="card-title">${title || ""}</span>
        </div>
        <div class="card-content">
          <p>${description || ""}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
  `;
}

// Функція, що виводить вспливаючі повідомлення за допомогою Materialize
function showAlert(msg) {
  M.toast({ html: msg, classes: "rounded" });
}

// Функція, що показує хід завантаження новин створена за допомогою Materialize
function showLoader() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
    <div class="progress">
      <div class="indeterminate"></div>
    </div>
  `
  );
}

// Функція, що видаляє хід завантаження новин
function removePreloader() {
  const loader = document.querySelector(".progress");
  if (loader) {
    loader.remove();
  }
}
