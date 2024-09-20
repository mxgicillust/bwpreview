window.onload = function () {
    var allLinks = document.querySelectorAll("li.c_list a");
    for (var i = 0; i < allLinks.length; i++) {
        var currentLink = allLinks[i];
        currentLink.setAttribute("target", "_blank");
    }
    coverResize();
}
    
document.addEventListener("DOMContentLoaded", () => {
    const containerHolder = document.getElementById("rowHolder");
    const containerHolderTBD = document.getElementById("rowHolder_tbd");
    const contentContainer = document.getElementById("contentContainer");
    const listContainer = document.getElementById("listContainer");
    const contentTitle = document.getElementById("contentTitle");
    const contentHolder = document.getElementById("contentHolder");
    const mainFooter = document.getElementById("mainFooter");

    const urlParams = new URLSearchParams(window.location.search);
    const isbn = urlParams.get('isbn');

    const publisherLogos = {
        'ダッシュエックス文庫DIGITAL': 'assets/logo/logo_dashxbunko.svg',
        '電撃文庫': 'assets/logo/logo_dengekibunko.svg',
        '電撃の新文芸': 'assets/logo/logo_dengekishinbungei.svg',
        'ファミ通文': 'assets/logo/logo_famitsubunko.svg',
        '富士見ファンタジア文庫': 'assets/logo/logo_fantasiabunko.svg',
        'GA文庫': 'assets/logo/logo_gabunko.svg',
        'ガガガ文庫': 'assets/logo/logo_gagagabunko.svg',
        'GAノベル': 'assets/logo/logo_ganovel.svg',
        'HJ文庫': 'assets/logo/logo_hjbunko.svg',
        'カドカワBOOKS': 'assets/logo/logo_kadokawabooks.svg',
        'Ｋラノベブックス': 'assets/logo/logo_kranobe.svg',
        '講談社ラノベ文庫': 'assets/logo/logo_kranobebunko.svg',
        'MFブックス': 'assets/logo/logo_mfbooks.svg',
        'MF文庫J': 'assets/logo/logo_mfbunkoj.svg',
        'オーバーラップ文庫': 'assets/logo/logo_overlapbunko.svg',
        'オーバーラップノベルス': 'assets/logo/logo_overlapnovels.svg',
        '角川スニーカー文庫': 'assets/logo/logo_sneakerbunko.svg',
    };

    const pubMap = {
        '角川スニーカー文庫': 'スニーカー文庫',
        '富士見ファンタジア文庫': 'ファンタジア文庫',
        'ダッシュエックス文庫DIGITAL': 'ダッシュエックス文庫'
    };

    fetch(`https://raw.githubusercontent.com/mxgicillust/bwjson/main/isbn.json?t=${Date.now()}`)
    //fetch("isbn.json")
        .then(response => response.json())
        .then(isbnList => {
            if (isbn) {
                mainFooter.style.display = 'none'; 
                fetchISBN(isbn, true, isbnList);
            } else {
                listContainer.style.display = 'block';
                contentContainer.style.display = 'none';
                mainFooter.style.display = 'block';
                isbnList.forEach(item => {
                    fetchISBN(item.isbn, false, isbnList, item.placeholder);
                });
            }
        })
        .catch(error => console.error('Error loading ISBN list:', error));

    async function fetchISBN(isbn, isSingle, isbnList = [], placeholder = 'assets/now-printing.jpg') {
        try {
            const response = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`);
            if (!response.ok) throw new Error('Error');
            const data = await response.json();

            if (data[0] && data[0].summary) {
                const title = data[0].summary.title;
                const publisher = data[0].summary.series;
                if (isSingle) {
                    displayContent(isbn, title, placeholder);
                } else {
                    createItem(isbn, title, placeholder, publisher);
                }
            } else {
                console.error('Title not found in OpenBD data', isbn);
                fetchJSON(isbn, isSingle, isbnList, placeholder);
            }
        } catch (error) {
            console.error('Error fetching OpenBD data:', error);
            fetchJSON(isbn, isSingle, isbnList, placeholder);
        }
    }

    async function fetchJSON(isbn, isSingle, isbnList = [], placeholder = 'assets/now-printing.jpg') {
        try {
            const response = await fetch('https://raw.githubusercontent.com/mxgicillust/bwjson/main/isbn.json'); 
            if (!response.ok) throw new Error('Error fetching JSON');
            const jsonData = await response.json();

            const bookData = jsonData.find(item => item.isbn === isbn);
            if (bookData && bookData.title) {
                const title = bookData.title;
                if (isSingle) {
                    displayContent(isbn, title, placeholder);
                } else {
                    createItem(isbn, title, placeholder);
                }
            } else {
                console.error('Title not found in local JSON data', isbn);
                ISBNHandler(isSingle, isbnList, placeholder);
            }
        } catch (error) {
            console.error('Error fetching local JSON data:', error);
            ISBNHandler(isSingle, isbnList, placeholder);
        }
    }

    function ISBNHandler(isSingle, isbnList, placeholder) {
        if (isSingle) {
            if (!isbnList.includes(isbn)) {
                window.location.href = 'index.html';
            }
        } else {
            CreatePlaceholder(isbn, 'Title not available', placeholder);
        }
    }

    function createItem(isbn, title, placeholder, publisher) {
        const imageUrl = `https://pub-e28bf2d5c16b4edb835dd176df0418ef.r2.dev/${isbn}/i-001.jpg`;
    
        const img = new Image();
        img.src = imageUrl;
    
        img.onload = function() {
            const newItem = document.createElement("div");
            const re_publisher = pubMap[publisher] || publisher;
            const logo = publisherLogos[re_publisher] ? `<img src="${publisherLogos[re_publisher]}" alt="${re_publisher} logo" class="publisher-logo">` : '';    
            const cldate = new Date().getTime()
            newItem.className = "col-xxl-3 col-xl-3 col-lg-4 col-md-4 col-sm-6 col-6 pad";
            newItem.innerHTML = `
                <div class="item" id="${isbn}">
                    <div class="img-holder">
                        <img id="coverHeight" src="https://www.books.or.jp/img/books_icon/${isbn}.jpg?${cldate}" alt="${title}" loading="lazy" onerror="this.onerror=null; this.src='${imageUrl}'; this.onerror=function() {this.src='${placeholder}';};">
                    </div>
                    <p>${title}</p>
                    <span>${logo} ${re_publisher || undefined }</span>
                </div>
            `;
            containerHolder.appendChild(newItem);
    
            const item = newItem.querySelector('.item');
            item.addEventListener("click", function () {
                const img = this.querySelector('img');
                if (img.src.includes(placeholder)) {
                    return;
                }
    
                const altimg = new Image();
                altimg.src = imageUrl;
    
                altimg.onload = function() {
                    window.location.href = `index.html?isbn=${isbn}`;
                }
                
                altimg.onerror = function() {
                    alert("Error: Sub Illustration hasn't been uploaded\n口絵はまだアップロードされておりません");
                    console.warn("Sub Illustration hasn't been uploaded", isbn);
                };
            });
        };
    
        img.onerror = function() {
            const newItem = document.createElement("div");
            const re_publisher = pubMap[publisher] || publisher;
            const logo = publisherLogos[re_publisher] ? `<img src="${publisherLogos[re_publisher]}" alt="${re_publisher} logo" class="publisher-logo">` : '';    
            const cldate = new Date().getTime() 
            newItem.className = "col-xxl-3 col-xl-3 col-lg-4 col-md-4 col-sm-6 col-6 pad";
            newItem.innerHTML = `
                <div class="item" id="${isbn}">
                    <div class="img-holder">
                        <img src="https://www.books.or.jp/img/books_icon/${isbn}.jpg?${cldate}" alt="${title}" loading="lazy" onerror="this.onerror=null; this.src='${imageUrl}'; this.onerror=function() {this.src='${placeholder}';};">
                    </div>
                    <p>${title}</p>
                    <span>${logo} ${re_publisher || undefined }</span>
                </div>
            `;
            containerHolderTBD.appendChild(newItem);
    
            const item = newItem.querySelector('.item');
            item.addEventListener("click", function () {
                const img = this.querySelector('img');
                if (img.src.includes(placeholder)) {
                    return;
                }
    
                const altimg = new Image();
                altimg.src = imageUrl;
    
                altimg.onload = function() {
                    return;
                }
                
                altimg.onerror = function() {
                    alert("Error: Sub Illustration hasn't been uploaded\n口絵はまだアップロードされておりません");
                    console.warn("Sub Illustration hasn't been uploaded", isbn);
                };
            });;
        };
    }

    function CreatePlaceholder(isbn, title, placeholder) {
        const newItem = document.createElement("div");
        newItem.className = "col-xxl-3 col-xl-3 col-lg-4 col-md-4 col-sm-6 col-6 pad";
        newItem.innerHTML = `
            <div class="item" id="${isbn}">
                <div class="img-holder">
                <img src="${placeholder}" alt="${title}" loading="lazy">
                </div>
                <p>${title}</p>
            </div>
        `;
        containerHolder.appendChild(newItem);
    }

    function displayContent(isbn, title, placeholder) {
        listContainer.style.display = 'none';
        contentContainer.style.display = 'block';
        contentTitle.textContent = title || 'Loading...';
    
        const imageUrl = `https://pub-e28bf2d5c16b4edb835dd176df0418ef.r2.dev/${isbn}/i-001.jpg`;
        const fallbackImageUrl = placeholder;
    
        const imagesHtml = generateImagesHtml(isbn);
        contentHolder.innerHTML = `
            <link rel="stylesheet" href="content/custom.css"> 
            <img src="${imageUrl}" alt="${title}" style="max-width: 100%; height: auto;" onerror="this.onerror=null; this.src='${fallbackImageUrl}';">
            <div></div>
            <div class="images-container">
                ${imagesHtml}
            </div>
        `;
    }


    function generateImagesHtml(isbn) {
        let imagesHtml = '';
        for (let i = 2; i <= 10; i++) {
            const imageNumber = String(i).padStart(3, '0');
            imagesHtml += `<img src="https://pub-e28bf2d5c16b4edb835dd176df0418ef.r2.dev/${isbn}/i-${imageNumber}.jpg" style="max-width: 100%; height: auto; margin-bottom: 10px;" onerror='this.style.display = "none"'>`;
        }
        return imagesHtml;
    }
});

document.getElementById('spaceHolder').style.height = document.querySelector('.headimg img').offsetHeight + 'px';
window.addEventListener('resize', () => {
    document.getElementById('spaceHolder').style.height = document.querySelector('.headimg img').offsetHeight + 'px';
    coverResize();
});

var coverResize = () => {
    var coverHeight = document.getElementById('coverHeight').offsetHeight;
    var coversList = document.querySelectorAll('.img-holder img:not(#coverHeight)');
    for (let i = 0; i < coversList.length; i++) {
        coversList[i].style.height = coverHeight + 'px';
    }
}

// Search

function searchFunction() {
    const input = document.getElementById('searchInput').value.toUpperCase();
    const items = document.getElementsByClassName('item');

    for (let i = 0; i < items.length; i++) {
        if (!items[i].getElementsByTagName('p')[0].innerHTML.trim().toUpperCase().includes(input)) {
            items[i].parentElement.classList.add('d-none');
        } else items[i].parentElement.classList.remove('d-none');
    }

    if (Array.from(items).every(item => item.parentElement.classList.contains('d-none')))
        document.getElementById('failedInput').style.display = 'block';
    else document.getElementById('failedInput').style.display = 'none';

    if (input != '')
        document.getElementsByClassName('paging')[0].style.display = "none";
    else {
        for (let i = 0; i < items.length; i++) {
            if (i < 24) items[i].parentElement.classList.remove('d-none');
            else items[i].parentElement.classList.add('d-none');
        }
        document.getElementsByClassName('paging')[0].style.display = "flex";
    }
}
