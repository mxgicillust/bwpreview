document.addEventListener("DOMContentLoaded", () => {
    const containerHolder = document.getElementById("rowHolder");
    const contentContainer = document.getElementById("contentContainer");
    const listContainer = document.getElementById("listContainer");
    const contentTitle = document.getElementById("contentTitle");
    const contentHolder = document.getElementById("contentHolder");
    const mainFooter = document.getElementById("mainFooter");

    const urlParams = new URLSearchParams(window.location.search);
    const isbn = urlParams.get('isbn');

    fetch("isbn.json")
        .then(response => response.json())
        .then(isbnList => {
            isbnList.reverse()
            if (isbn) {
                mainFooter.style.display = 'none'; 
                fetchOpenBDData(isbn, true);
            } else {
                listContainer.style.display = 'block';
                contentContainer.style.display = 'none';
                mainFooter.style.display = 'block';
                isbnList.forEach(isbn => {
                    fetchOpenBDData(isbn, false);
                });
            }
        })
        .catch(error => console.error('Error loading ISBN list:', error));

    async function fetchOpenBDData(isbn, isSingle, isbnList = []) {
        try {
            const response = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            if (data[0] && data[0].summary) {
                const title = data[0].summary.title;
                if (isSingle) {
                    displayContent(isbn, title);
                } else {
                    createItem(isbn, title);
                }
            } else {
                console.error('Title not found in OpenBD data');
                handleInvalidISBN(isSingle, isbnList);
            }
        } catch (error) {
            console.error('Error fetching OpenBD data:', error);
            handleInvalidISBN(isSingle, isbnList);
        }
    }

    function handleInvalidISBN(isSingle, isbnList) {
        if (isSingle) {
            // Check if the ISBN is in the list, if not, redirect to main page
            if (!isbnList.includes(isbn)) {
                window.location.href = 'index.html';
            }
        } else {
            createPlaceholderItem(isbn, 'Title not available');
        }
    }

    function createItem(isbn, title) {
        const newItem = document.createElement("div");
        newItem.className = "col-xxl-3 col-xl-3 col-lg-4 col-md-4 col-sm-6 col-6 pad";
        newItem.innerHTML = `
            <div class="item" id="${isbn}">
                <div class="img-holder">
                    <img src="content/${isbn}/i-001.jpg" alt="" loading="lazy" onerror="this.onerror=null; this.src='assets/now-printing.jpg';">
                </div>
                <p>${title}</p>
            </div>
        `;
        containerHolder.appendChild(newItem);

        const item = newItem.querySelector('.item');
        item.addEventListener("click", function () {
            const img = this.querySelector('img');
            if (img.src.includes('now-printing.jpg')) {
                return;
            } else {
                window.location.href = `index.html?isbn=${isbn}`;
            }
        });
    }

    function createPlaceholderItem(isbn, title) {
        const newItem = document.createElement("div");
        newItem.className = "col-xxl-3 col-xl-3 col-lg-4 col-md-4 col-sm-6 col-6 pad";
        newItem.innerHTML = `
            <div class="item" id="${isbn}">
                <div class="img-holder">
                    <img src="assets/now-printing.jpg" alt="" loading="lazy">
                </div>
                <p>${title}</p>
            </div>
        `;
        containerHolder.appendChild(newItem);
    }

    function displayContent(isbn, title) {
        listContainer.style.display = 'none';
        contentContainer.style.display = 'block';
        contentTitle.textContent = title || 'Loading...';

        const imagesHtml = generateImagesHtml(isbn);
        contentHolder.innerHTML = `
            <link rel="stylesheet" href="content/custom.css"> 
            <img src="content/${isbn}/i-001.jpg" alt="${title}" style="max-width: 100%; height: auto;" onerror="this.onerror=null; this.src='assets/now-printing.jpg';">
            <div class="images-container">
                ${imagesHtml}
            </div>
        `;
    }

    function generateImagesHtml(isbn) {
        let imagesHtml = '';
        for (let i = 1; i <= 100; i++) {
            const imageNumber = String(i).padStart(3, '0'); // Format number as 3-digit string
            imagesHtml += `<img src="content/${isbn}/i-${imageNumber}.jpg" style="max-width: 100%; height: auto; margin-bottom: 10px;" onerror='this.style.display = "none"'>`;
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
