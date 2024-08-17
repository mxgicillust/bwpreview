// Containers

document.addEventListener("DOMContentLoaded", () => {
    const containerHolder = document.getElementById("rowHolder");

    // Predefined list of ISBNs
    const isbnList = [
        "9784040754154",
        "9784040754482",
        "9784040755250",
        "9784040755267",
        "9784040755304",
        "9784040755816",
        "9784094532036",
        "9784094532043",
        "9784094532050",
        "9784094532067",
        "9784824009081",
        "9784824009098",
        "9784824009104",
        "9784824009111",
        "9784824009128",
        "9784824009135",
        "9784824009142",
        "9784824009159",
        "9784824009180",
        "9784824009210",
        "9784824009227",
        // 08/17 Update MF
        "9784046839138",
        "9784046839176",
        "9784046839152",
        "9784046839145",
        "9784046840134"
    ];

    // const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    async function fetchOpenBDData(isbn, index) {
        //await delay(index * 10000); // 10 seconds delay per request

        try {
            const response = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            //console.log(data)

            if (data[0] && data[0].summary) {
                const title = data[0].summary.title;
                createItem(isbn, title);
            } else {
                console.error('Title not found in OpenBD data');
                createPlaceholderItem(isbn, 'Title not available');
            }
        } catch (error) {
            console.error('Error fetching OpenBD data:', error);
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
            const newWindow = window.open("", "_blank");
            const imagesHtml = generateImagesHtml(isbn);

            const newContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${title}</title>
                    <link rel="stylesheet" href="style.css">
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet"
                        integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
                    <link rel="stylesheet" href="content/custom.css"> 
                <body>
                <h1>${title}</h1>
                    <div class="container">
                        <div class="row justify-content-center">
                            <div class="col-12">
                                <img src="content/${isbn}/i-001.jpg" alt="${title}" style="max-width: 100%; height: auto;" onerror="this.onerror=null; this.src='assets/now-printing.jpg';">
                                <div class="images-container">
                                    ${imagesHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `;
            newWindow.document.write(newContent);
            newWindow.document.close();
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

    isbnList.forEach((isbn, index) => {
        fetchOpenBDData(isbn, index);
    });

    function generateImagesHtml(isbn) {
        let imagesHtml = '';
        for (let i = 1; i <= 100; i++) {
            const imageNumber = String(i).padStart(3, '0'); // Format number as 4-digit string
            imagesHtml += `<img src="content/${isbn}/i-${imageNumber}.jpg" style="max-width: 100%; height: auto; margin-bottom: 10px;" onerror='this.style.display = "none"'>`;
        }
        return imagesHtml;
    }
});

// Open in new tab for all labels
window.onload = function () {
    var allLinks = document.querySelectorAll("li.c_list a");
    for (var i = 0; i < allLinks.length; i++) {
        var currentLink = allLinks[i];
        currentLink.setAttribute("target", "_blank");
    }
    coverResize();
}

// URL settings for each item
const items = Array.from(document.getElementsByClassName('item')).slice(0);
items.forEach((item) => {
    item.addEventListener("click", function () {
        let url = "content/" + item.id + "/";
        window.open(url, '_blank');
    });
});


//Pagination
document.addEventListener('DOMContentLoaded', function () {
    const itemsPerPage = 24;
    let currentPage = 0;
    const items = Array.from(document.getElementsByClassName('item')).slice(0);

    function showPage(page) {
        const startIndex = page * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        items.forEach((item, index) => {
            item.parentElement.classList.toggle('d-none', index < startIndex || index >= endIndex);
        });
        updateActiveButtonStates();
    }

    function createPageButtons() {
        const totalPages = Math.ceil(items.length / itemsPerPage);
        const paginationContainer = document.createElement('div');
        const paginationDiv = document.body.appendChild(paginationContainer);
        paginationContainer.classList.add('paging');

        // Add page buttons
        for (let i = 0; i < totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i + 1;
            pageButton.addEventListener('click', () => {
                currentPage = i;
                showPage(currentPage);
                updateActiveButtonStates();
                document.querySelector('.container .head-title').scrollIntoView({ behavior: "smooth" });
            });

            document.getElementById('bodyContent').appendChild(paginationContainer);
            paginationDiv.appendChild(pageButton);
        }
    }

    function updateActiveButtonStates() {
        const pageButtons = document.querySelectorAll('.paging button');
        pageButtons.forEach((button, index) => {
            if (index === currentPage) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    createPageButtons(); // Call this function to create the page buttons initially
    showPage(currentPage);
});

// Set height for #spaceHolder in order to implement parallax
document.getElementById('spaceHolder').style.height = document.querySelector('.headimg img').offsetHeight + 'px';
window.addEventListener('resize', () => {
    document.getElementById('spaceHolder').style.height = document.querySelector('.headimg img').offsetHeight + 'px';
    coverResize();
});

var coverResize = () => {
    var sampleHeight = document.getElementById('sampleHeight').offsetHeight;
    var coversList = document.querySelectorAll('.img-holder img:not(#sampleHeight)');
    for (let i = 0; i < coversList.length; i++) {
        coversList[i].style.height = sampleHeight + 'px';
    }
}

// Search Function
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

