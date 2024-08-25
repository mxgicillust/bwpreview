document.addEventListener("DOMContentLoaded", () => {
    const containerHolder = document.getElementById("rowHolder");
    const contentContainer = document.getElementById("contentContainer");
    const listContainer = document.getElementById("listContainer");
    const contentTitle = document.getElementById("contentTitle");
    const contentHolder = document.getElementById("contentHolder");
    const mainFooter = document.getElementById("mainFooter");

    const urlParams = new URLSearchParams(window.location.search);
    const isbn = urlParams.get('isbn');

    // Fetch Isbn

    fetch("https://raw.githubusercontent.com/mxgicillust/bwjson/main/isbn.json")
    //fetch("isbn.json")
        .then(response => response.json())
        .then(isbnList => {
            isbnList.reverse();
            if (isbn) {
                mainFooter.style.display = 'none'; 
                fetchOpenBDData(isbn, true, isbnList);
            } else {
                listContainer.style.display = 'block';
                contentContainer.style.display = 'none';
                mainFooter.style.display = 'block';
                isbnList.forEach(item => {
                    fetchOpenBDData(item.isbn, false, isbnList, item.placeholder);
                });
            }
        })
        .catch(error => console.error('Error loading ISBN list:', error));

    async function fetchOpenBDData(isbn, isSingle, isbnList = [], placeholder = 'assets/now-printing.jpg') {
        try {
            const response = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`);
            if (!response.ok) throw new Error('Error');
            const data = await response.json();

            if (data[0] && data[0].summary) {
                const title = data[0].summary.title;
                if (isSingle) {
                    displayContent(isbn, title, placeholder);
                } else {
                    createItem(isbn, title, placeholder);
                }
            } else {
                console.error('Title not found in OpenBD data', isbn);
                fetchLocalJSONData(isbn, isSingle, isbnList, placeholder);
            }
        } catch (error) {
            console.error('Error fetching OpenBD data:', error);
            fetchLocalJSONData(isbn, isSingle, isbnList, placeholder);
        }
    }

    async function fetchLocalJSONData(isbn, isSingle, isbnList = [], placeholder = 'assets/now-printing.jpg') {
        try {
            const response = await fetch('https://raw.githubusercontent.com/mxgicillust/bwpreview/main/isbn.json'); 
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
                handleInvalidISBN(isSingle, isbnList, placeholder);
            }
        } catch (error) {
            console.error('Error fetching local JSON data:', error);
            handleInvalidISBN(isSingle, isbnList, placeholder);
        }
    }

    function handleInvalidISBN(isSingle, isbnList, placeholder) {
        if (isSingle) {
            if (!isbnList.includes(isbn)) {
                window.location.href = 'index.html';
            }
        } else {
            createPlaceholderItem(isbn, 'Title not available', placeholder);
        }
    }

    function createItem(isbn, title, placeholder) {
        const newItem = document.createElement("div");
        newItem.className = "col-xxl-3 col-xl-3 col-lg-4 col-md-4 col-sm-6 col-6 pad";
        newItem.innerHTML = `
            <div class="item" id="${isbn}">
                <div class="img-holder">
                <img src="https://pub-e28bf2d5c16b4edb835dd176df0418ef.r2.dev/${isbn}/i-001.jpg" alt="" loading="lazy" onerror="this.onerror=null; this.src='${placeholder}';">
                </div>
                <p>${title}</p>
            </div>
        `;
        containerHolder.appendChild(newItem);

        const item = newItem.querySelector('.item');
        item.addEventListener("click", function () {
            const img = this.querySelector('img');
            if (img.src.includes(placeholder)) {
                return;
            }

            const altimg = `https://pub-e28bf2d5c16b4edb835dd176df0418ef.r2.dev/${isbn}/i-002.jpg`;
            fetch(altimg, { method: 'HEAD' })
            .then(response => {
                if (response.status == 200) {
                    window.location.href = `index.html?isbn=${isbn}`;
                } else {
                    alert("Error: Illustration doesn't got uploaded");
                    console.log(Error("Illustration doesn't got uploaded"))
                }
            })
            .catch(error => {
                console.error(error);
            });
        });
    }
    }

    function createPlaceholderItem(isbn, title, placeholder) {
        const newItem = document.createElement("div");
        newItem.className = "col-xxl-3 col-xl-3 col-lg-4 col-md-4 col-sm-6 col-6 pad";
        newItem.innerHTML = `
            <div class="item" id="${isbn}">
                <div class="img-holder">
                <img src="${placeholder}" alt="" loading="lazy">
                </div>
                <p>${title}</p>
            </div>
        `;
        containerHolder.appendChild(newItem);
    }

    function setTags(title, imageUrl, fallbackImageUrl) {
        const head = document.head;
    
        CreatemetaTag(head, 'og:title', title);
        CreatemetaTag(head, 'og:image', imageUrl);
        CreatemetaTag(head, 'og:image:alt', title);
        CreatemetaTag(head, 'og:type', 'website');
        CreatemetaTag(head, 'og:url', window.location.href);
    
        const img = new Image();
        img.onload = () => CreatemetaTag(head, 'og:image', imageUrl);
        img.onerror = () => CreatemetaTag(head, 'og:image', fallbackImageUrl);
        img.src = imageUrl;
    }
    
    function CreatemetaTag(parent, property, content) {
        let metaTag = parent.querySelector(`meta[property="${property}"]`);
    
        if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.setAttribute('property', property);
            parent.appendChild(metaTag);
        }
        metaTag.setAttribute('content', content);
    }

    function displayContent(isbn, title, placeholder) {
        listContainer.style.display = 'none';
        contentContainer.style.display = 'block';
        contentTitle.textContent = title || 'Loading...';
    
        const imageUrl = `https://pub-e28bf2d5c16b4edb835dd176df0418ef.r2.dev/${isbn}/i-001.jpg`;
        const fallbackImageUrl = placeholder;
    
        if (isbn) {
            setTags(title, imageUrl, fallbackImageUrl);
        }
    
        const imagesHtml = generateImagesHtml(isbn);
        contentHolder.innerHTML = `
            <link rel="stylesheet" href="content/custom.css"> 
            <img src="${imageUrl}" alt="${title}" style="max-width: 100%; height: auto;" onerror="this.onerror=null; this.src='${fallbackImageUrl}';">
            <div class="images-container">
                ${imagesHtml}
            </div>
        `;
    }


    function generateImagesHtml(isbn) {
        let imagesHtml = '';
        for (let i = 2; i <= 80; i++) {
            const imageNumber = String(i).padStart(3, '0');
            imagesHtml += `<img src="https://pub-e28bf2d5c16b4edb835dd176df0418ef.r2.dev/${isbn}/i-${imageNumber}.jpg" style="max-width: 100%; height: auto; margin-bottom: 10px;" onerror='this.style.display = "none"'>`;
        }
        return imagesHtml;
    }
});

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
