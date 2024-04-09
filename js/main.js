/*--------------------------------------------------
-----------------------------------------------------
		CSS INDEX
		================
		01. Header Dropdown
		02. Sticky Menu Activation
		03. Main Slider Activation
		04. Scroll Top
		05. Sign Out
		06. Signed In Status
		07. Search Bar
		08. Generate Products
		
-----------------------------------------------------------------------------------*/
(function ($) {
	"use Strict";
 /*----------------------------------------*/
 /* 01. Header Dropdown
 /*----------------------------------------*/
	$('.ht-setting-trigger, .ht-currency-trigger, .ht-language-trigger, .hm-minicart-trigger, .cw-sub-menu').on('click', function (e) {
		e.preventDefault();
		$(this).toggleClass('is-active');
		$(this).siblings('.ht-setting, .ht-currency, .ht-language, .minicart, .cw-sub-menu li').slideToggle();
	});
	$('.ht-setting-trigger.is-active').siblings('.catmenu-body').slideDown();
/*----------------------------------------*/
/* 02. Sticky Menu Activation
/*----------------------------------------*/
	$(window).on('scroll',function() {
		if ($(this).scrollTop() > 300) {
			$('.header-sticky').addClass("sticky");
		} else {
			$('.header-sticky').removeClass("sticky");
		}
	});
/*----------------------------------------*/
/* 03. Main Slider Activation
/*----------------------------------------*/
	$(".slider-active").owlCarousel({
		loop: true,
		margin: 0,
		nav: true,
		autoplay: true,
		items: 1,
		autoplayTimeout: 5000,
		navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
		dots: true,
		autoHeight: true,
		lazyLoad: true
	});
})(jQuery);

/*----------------------------------------*/
/* 04. Scroll Top
/*----------------------------------------*/
// Add a click event listener to the div
document.getElementById('scrollToTop').addEventListener('click', function() {
	// Scroll to the top of the page
	window.scrollTo({
		top: 0,
		behavior: 'smooth' // Smooth scrolling effect
	});
});
/*----------------------------------------*/
/* 05. Sign Out
/*----------------------------------------*/
function signOut() {
	sessionStorage.removeItem('userId');
	sessionStorage.removeItem('username');
	window.location.href = 'index.html';
}
/*----------------------------------------*/
/* 06. Signed In Status
/*----------------------------------------*/
function checkSignInStatus() {
    let signInLink = document.querySelector('#sign-in-link');
	
    if (sessionStorage.getItem('username') !== 'guest') {
        signInLink.innerHTML = '<a id="sign-out" href="#">Sign Out</a>';
        document.querySelector('#sign-out').addEventListener('click', signOut);
    }

    // Assume you have stored the username in sessionStorage
    const username = sessionStorage.getItem('username');

    // Update the HTML with the dynamically fetched lastname
    if (username) {
        document.querySelector('#greet-user').innerText = `${username}`;
    }
}
function getCartNumber() {

	if(!sessionStorage.getItem('userId')) {
		return;
	}

	const userId = sessionStorage.getItem('userId');

	fetch(`http://localhost:8080/carts/${userId}/cart-items/count`) 
		.then(response => {
			return response.json();
		})
		.then(response => {
			document.querySelector('#cart-number').innerText = response;
		})
		.catch(error => {
			console.error(error);
		});
}
/*----------------------------------------*/
/* 07. Search Bar
/*----------------------------------------*/
document.getElementById('searchForm').addEventListener('keydown', function(event) {
	// Check if the 'Enter' key was pressed
	if (event.key === 'Enter') {
		// Prevent the form from being submitted normally
		event.preventDefault();

		// Get the selected category ID and search term
		const categoryId = document.getElementById('categorySelect').value;
		const searchTerm = document.getElementById('searchInput').value;

		// Build the redirect URL
		let url = 'product-grid-general.html';

		url += '?searchType=Search';

		if (categoryId !== '0') {
			url += '&categoryId=' + encodeURIComponent(categoryId);
		}

		// Append search term if it exists
		if (searchTerm) {
			// Check if there are existing query parameters
			if (url.includes('?')) {
				url += '&searchTerm=' + encodeURIComponent(searchTerm);
			} else {
				url += '?searchTerm=' + encodeURIComponent(searchTerm);
			}
		}

		// Redirect the user to the product grid page with the search parameters in the URL
		window.location.href = url;
	}
});
/*----------------------------------------*/
/* 08. Generate Products
/*----------------------------------------*/
function generateSingleProduct(product) {
	const productElement = document.createElement('div');

	productElement.innerHTML = `
		<div class="single-product-wrap">
			<div class="product-image">
				<a href="product-details.html?productId=${product.id}">
					<img src="images/product/large-size/${product.name}.jpg">
					<div class="product-tag-container">
						${product.productTag.newArrival ? '<div class="product-tag new-arrival">New Arrival</div>' : ''}
						${product.productTag.bestSeller ? '<div class="product-tag best-seller">Best Seller</div>' : ''}
					</div>
				</a>
			</div>
			<div class="product-desc">
				<div>
					<span class="product-manufacturer">${product.manufacturer}</span>
				</div>
				<hr>
				<p class="product-name"><a href="product-details.html?productId=${product.id}">${product.name}</a></p>
				<hr>
				<span class="product-price">RM ${product.unitPrice.toFixed(2)}</span>
			</div>
		</div>
	`;
	return productElement;
}
function generateSingleProductSmall(product) {
	const productElement = document.createElement('div');

	productElement.innerHTML = `
		<div class="single-product-wrap">
			<div class="product-image">
				<a href="product-details.html?productId=${product.id}">
					<img src="images/product/large-size/${product.name}.jpg">
				</a>
			</div>
			<div class="product-desc">
				<div>
					<span class="product-manufacturer">${product.manufacturer}</span>
				</div>
				<hr>
				<span class="product-price">RM ${product.unitPrice.toFixed(2)}</span>
			</div>
		</div>
	`;
	return productElement;
}
function generateSingleProductGrid(product) {
	const productElement = document.createElement('div');
	productElement.className = 'col-4'

	productElement.innerHTML = `
		<div class="single-product-wrap">
			<div class="product-image">
				<a href="product-details.html?productId=${product.id}">
					<img src="images/product/large-size/${product.name}.jpg">
					<div class="product-tag-container">
						${product.productTag.newArrival ? '<div class="product-tag new-arrival">New Arrival</div>' : ''}
						${product.productTag.bestSeller ? '<div class="product-tag best-seller">Best Seller</div>' : ''}
					</div>
				</a>
			</div>
			<div class="product-desc">
				<div>
					<span class="product-manufacturer">${product.manufacturer}</span>
				</div>
				<hr>
				<p class="product-name"><a href="product-details.html?productId=${product.id}">${product.name}</a></p>
				<hr>
				<span class="product-price">RM ${product.unitPrice.toFixed(2)}</span>
			</div>
		</div>
	`;
	return productElement;
}
function initializeOwlCarousel(productsContainer) {
	$(productsContainer).trigger('destroy.owl.carousel');

	// $(productsContainer).owlCarousel().trigger('add.owl.carousel').trigger('refresh.owl.carousel');
	$(productsContainer).owlCarousel({
		loop: true,
		nav: true,
		dots: false,
		autoplay: false,
		autoplayTimeout: 5000,
		navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
		item: 5,
		responsive: {
			0: {
				items: 1
			},
			480: {
				items: 2
			},
			768: {
				items: 3
			},
			992: {
				items: 4
			},
			1200: {
				items: 5
			}
		}
	});
}
/*----------------------------------------------------------------------------------------------------*/
/*------------------------------------------> The End <-----------------------------------------------*/
/*----------------------------------------------------------------------------------------------------*/