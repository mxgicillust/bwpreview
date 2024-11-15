window.onload = () => {
    document.querySelectorAll("li.c_list a").forEach(link => link.setAttribute("target", "_blank"));
    coverResize();
};

document.addEventListener("DOMContentLoaded", () => {
    const containerHolder = document.getElementById("rowHolder");
    const HolderHatsubai = document.getElementById("hatsubai");
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

    function japanTime(date = new Date()) {
        const utc = date.getTime() + date.getTimezoneOffset() * 60000; 
        const japanTime = new Date(utc + 9 * 3600000); 
        //console.log(`current japan time: ${japanTime}`)
        return japanTime;
    }

    const GoogleAPI = async (isbn) => {
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
            const data = await response.json();
            const publishedDate = data.items?.[0]?.volumeInfo?.publishedDate;
            
            return publishedDate ? new Date(publishedDate) : null;
        } catch (error) {
            console.error('Google Books API Error:', error);
            return null;
        }
    };
    

    const fetchISBN = async () => {
        try {
            const response = await fetch(`https://raw.githubusercontent.com/mxgicillust/bwjson/main/isbn.json?t=${Date.now()}`);
            return await response.json();
        } catch (error) {
            console.error('Error loading ISBN list:', error);
            return [];
        }
    };

    const fetchISBNData = async (isbn, isSingle, isbnList) => {
        const bookData = isbnList.find(item => item.isbn === isbn);
        const placeholder = `https://pub-e28bf2d5c16b4edb835dd176df0418ef.r2.dev/${bookData.isbn}/i-001.jpg` || 'assets/now-printing.jpg';
    
        try {
            const response = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`);
            const data = (await response.json())[0];
    
            if (data && data.summary) {
                const { title, series: publisher } = data.summary;
                const maxPage = getMaxPage(isbnList, isbn);
                isSingle 
                    ? displayContent(isbn, title, placeholder, maxPage) 
                    : createItem(isbn, title, placeholder, publisher, bookData);
            } else {
                console.warn('Data not found for ISBN:', isbn);
                fetchList(isbn, isSingle, isbnList, placeholder);
            }
        } catch (error) {
            console.error('Error fetching API data:', error);
            fetchList(isbn, isSingle, isbnList, placeholder);
        }
    };
    

    const fetchList = async (isbn, isSingle, placeholder = 'assets/now-printing.jpg') => {
        try {
            const jsonData = await fetchISBN();
            const bookData = jsonData.find(item => item.isbn === isbn);
            const maxPage = getMaxPage(jsonData, isbn);

            if (bookData?.title) {
                isSingle ? displayContent(isbn, bookData.title, placeholder, maxPage) : createItem(isbn, bookData.title, placeholder);
            } else {
                notitle(isbn, isSingle, placeholder);
            }
        } catch (error) {
            console.error('Error fetching local JSON data:', error);
            notitle(isbn, isSingle, placeholder);
        }
    };

    const getMaxPage = (isbnList, isbn) => isbnList.find(item => item.isbn === isbn)?.maxPage || 10;

    const createItem = (isbn, title, placeholder, publisher, bookData) => {
        const imageUrl = `https://pub-e28bf2d5c16b4edb835dd176df0418ef.r2.dev/${isbn}/i-001.jpg`;
        const re_publisher = pubMap[publisher] || publisher;
        const logo = publisherLogos[re_publisher] ? `<img src="${publisherLogos[re_publisher]}" alt="${re_publisher} logo" class="publisher-logo">` : '';

        const img = new Image();
        img.src = imageUrl;

        img.onload　= async function() {
            const releaseDate = await GoogleAPI(isbn);
            const localjptime = japanTime()
            const targetContainer = releaseDate && localjptime >= japanTime(releaseDate) ? HolderHatsubai : containerHolder;
    
            const newItem = document.createElement("div");
            newItem.className = "col-xxl-3 col-xl-3 col-lg-4 col-md-4 col-sm-6 col-6 pad";
            newItem.innerHTML = `
                <div class="item" id="${isbn}">
                    <div class="img-holder">
                        <img src="https://pub-e28bf2d5c16b4edb835dd176df0418ef.r2.dev/${isbn}/i-001.jpg" alt="${title}" isbn="${isbn}" loading="lazy" 
                        onerror="this.onerror=null; this.src='${imageUrl}'; this.onerror=function() {this.src='${placeholder}';};">
                    </div>
                    <p>${title}</p>
                    <span>${logo} ${re_publisher || ' '}</span>
                </div>
            `;
                
            targetContainer.appendChild(newItem);
            console.log(`${isbn} Loaded!`)

            const item = newItem.querySelector('.item');
            item.addEventListener("click", function () {
                const altimg = new Image();
                altimg.src = imageUrl;
    
                altimg.onload = function() {
                    window.location.href = `index.html?isbn=${isbn}`;
                }
                
                altimg.onerror = function() {
                    alert("Error: Sub Illustration hasn't been uploaded\n口絵はまだアップロードされておりません");
                    console.warn("Sub Illustration hasn't been uploaded", isbn);
                };
            })
        }
    };

    const displayContent = (isbn, title = 'Loading...', placeholder, maxPage = 10) => {
        listContainer.style.display = 'none';
        contentContainer.style.display = 'block';
    
        contentTitle.innerText = title;
    
        contentHolder.innerHTML = `
            <link rel="stylesheet" href="content/custom.css">
            <div class="images-container"></div>
        `;
    
        const imagesContainer = contentHolder.querySelector('.images-container');
        for (let i = 1; i <= maxPage; i++) {
            const img = document.createElement("img");
            img.src = `https://pub-e28bf2d5c16b4edb835dd176df0418ef.r2.dev/${isbn}/i-${i.toString().padStart(3, '0')}.jpg`;
            img.loading = "lazy";
            img.alt = `${title}-${i}`;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.marginBottom = '10px';
            img.onerror = () => (img.style.display = 'none');
            imagesContainer.appendChild(img);
            console.log(`Image ${i} Loaded!`)
        }
    };

    fetchISBN().then(isbnList => {
        if (isbn) {
            mainFooter.style.display = 'none';
            fetchISBNData(isbn, true, isbnList);
        } else {
            listContainer.style.display = 'block';
            contentContainer.style.display = 'none';
            mainFooter.style.display = 'block';
            isbnList.forEach(item => fetchISBNData(item.isbn, false, isbnList, item.placeholder));
        }
    });
});


window.addEventListener('resize', () => {
    document.getElementById('spaceHolder').style.height = `${document.querySelector('.headimg img').offsetHeight}px`;
    coverResize();
});

const coverResize = () => {
    const coverHeight = document.getElementById('coverHeight').offsetHeight;
    document.querySelectorAll('.img-holder img:not(#coverHeight)').forEach(img => img.style.height = `${coverHeight}px`);
};

function searchFunction() {
    const input = document.getElementById('searchInput').value.toUpperCase();
    const items = document.querySelectorAll('.item');
    const noResults = Array.from(items).every(item => {
        const isMatch = item.querySelector('p').textContent.trim().toUpperCase().includes(input);
        item.parentElement.classList.toggle('d-none', !isMatch);
        return !isMatch;
    });

    document.getElementById('failedInput').style.display = noResults ? 'block' : 'none';
    document.querySelector('.paging').style.display = input ? 'none' : 'flex';
}
