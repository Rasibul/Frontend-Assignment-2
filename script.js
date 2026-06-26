// API URL
const API_BASE_URL = "https://www.thecocktaildb.com/api/json/v1/1";

// HTML elements
const drinkContainer = document.getElementById("drinkContainer");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const loadingText = document.getElementById("loadingText");
const selectedDrinkList = document.getElementById("selectedDrinkList");
const drinkCount = document.getElementById("drinkCount");

// This array stores the drinks that are currently showing on the page
let currentDrinks = [];

// This array stores the drinks added to cart
let cartDrinks = [];

// Load 10 default drinks when the website opens
const loadDefaultDrinks = async () => {
	showLoading(true);

	try {
		const response = await fetch(`${API_BASE_URL}/search.php?f=a`);
		const data = await response.json();

		if (data.drinks) {
			currentDrinks = data.drinks.slice(0, 10);
			displayDrinks(currentDrinks);
		}
	} catch (error) {
		showErrorMessage("Something went wrong. Please try again.");
	}

	showLoading(false);
};

// Search drink by name
const searchDrinks = async () => {
	const searchValue = searchInput.value.trim();

	if (searchValue === "") {
		alert("Please write a drink name first");
		return;
	}

	showLoading(true);
	drinkContainer.innerHTML = "";

	try {
		const response = await fetch(`${API_BASE_URL}/search.php?s=${searchValue}`);

		const data = await response.json();

		if (data.drinks === null) {
			currentDrinks = [];
			showErrorMessage("No drink found!");
		} else {
			currentDrinks = data.drinks;
			displayDrinks(currentDrinks);
		}
	} catch (error) {
		showErrorMessage("Something went wrong. Please try again.");
	}

	showLoading(false);
};

// Show or hide loading
const showLoading = (isLoading) => {
	if (isLoading) {
		loadingText.style.display = "block";
	} else {
		loadingText.style.display = "none";
	}
};

// Show error or not found message
const showErrorMessage = (message) => {
	drinkContainer.innerHTML = `
		<div class="col-12">
			<div class="not-found">
				<i class="fa-solid fa-face-sad-tear"></i>
				<h3>${message}</h3>
				<p class="mb-0 text-muted">Please try another drink name.</p>
			</div>
		</div>
	`;
};

// Check if drink already added to cart
const isDrinkAdded = (drinkId) => {
	return cartDrinks.some((drink) => drink.id === drinkId);
};

// Display all drink cards
const displayDrinks = (drinks) => {
	drinkContainer.innerHTML = "";

	drinks.forEach((drink) => {
		const shortInstructions = getShortInstructions(drink.strInstructions);
		const alreadyAdded = isDrinkAdded(drink.idDrink);

		const drinkCard = document.createElement("div");
		drinkCard.className = "col-md-6";

		drinkCard.innerHTML = `
			<div class="card drink-card">
				<img
					src="${drink.strDrinkThumb}"
					class="card-img-top"
					alt="${drink.strDrink}" />

				<div class="card-body p-4">
					<span class="category-badge">
						${drink.strCategory || "Unknown Category"}
					</span>

					<h5 class="drink-name">${drink.strDrink}</h5>

					<p class="instruction-text mb-0">
						<strong>Instructions:</strong>
						${shortInstructions}
					</p>

					<div class="card-buttons">
						<button
							class="btn btn-success btn-sm add-btn"
							onclick="addToCart('${drink.idDrink}')"
							${alreadyAdded ? "disabled" : ""}>
							${
								alreadyAdded
									? `<i class="fa-solid fa-check me-1"></i> Added`
									: `<i class="fa-solid fa-plus me-1"></i> Add to Cart`
							}
						</button>

						<button
							class="btn btn-outline-dark btn-sm details-btn"
							onclick="showDrinkDetails('${drink.idDrink}')">
							<i class="fa-solid fa-circle-info me-1"></i>
							Details
						</button>
					</div>
				</div>
			</div>
		`;

		drinkContainer.appendChild(drinkCard);
	});
};

// Make instructions only 15 letters/characters
const getShortInstructions = (instructions) => {
	if (!instructions) {
		return "Not available";
	}

	if (instructions.length > 15) {
		return instructions.slice(0, 15) + "...";
	}

	return instructions;
};

// Add drink to cart
const addToCart = (drinkId) => {
	const drink = currentDrinks.find((item) => item.idDrink === drinkId);

	if (!drink) {
		alert("Drink not found!");
		return;
	}

	if (isDrinkAdded(drinkId)) {
		alert("This drink is already added to the cart!");
		return;
	}

	if (cartDrinks.length >= 7) {
		alert("You cannot add more than 7 drinks to a group!");
		return;
	}

	const cartItem = {
		id: drink.idDrink,
		name: drink.strDrink,
		image: drink.strDrinkThumb,
	};

	cartDrinks.push(cartItem);

	showCartDrinks();

	// Update cards again so added button becomes disabled
	displayDrinks(currentDrinks);
};

// Show cart drinks on the right side
const showCartDrinks = () => {
	selectedDrinkList.innerHTML = "";

	if (cartDrinks.length === 0) {
		selectedDrinkList.innerHTML = `
			<p class="empty-text mb-0">No drink added yet</p>
		`;
	}

	cartDrinks.forEach((drink, index) => {
		const cartItem = document.createElement("div");
		cartItem.className = "cart-item";

		cartItem.innerHTML = `
			<div class="cart-left">
				<span class="cart-serial">${index + 1}</span>

				<img
					src="${drink.image}"
					alt="${drink.name}"
					class="cart-img" />

				<span class="cart-name">${drink.name}</span>
			</div>

			<button
				class="remove-btn"
				onclick="removeFromCart('${drink.id}')">
				<i class="fa-solid fa-xmark"></i>
			</button>
		`;

		selectedDrinkList.appendChild(cartItem);
	});

	drinkCount.innerText = cartDrinks.length;
};

// Remove drink from cart
const removeFromCart = (drinkId) => {
	cartDrinks = cartDrinks.filter((drink) => drink.id !== drinkId);

	showCartDrinks();

	// Update cards again so removed drink button becomes active
	if (currentDrinks.length > 0) {
		displayDrinks(currentDrinks);
	}
};

// Show drink details in modal
const showDrinkDetails = (drinkId) => {
	const drink = currentDrinks.find((item) => item.idDrink === drinkId);

	if (!drink) {
		alert("Drink details not found!");
		return;
	}

	document.getElementById("modalTitle").innerText = drink.strDrink;
	document.getElementById("modalImage").src = drink.strDrinkThumb;

	document.getElementById("modalName").innerText = drink.strDrink || "Not available";

	document.getElementById("modalCategory").innerText = drink.strCategory || "Not available";

	document.getElementById("modalAlcoholic").innerText = drink.strAlcoholic || "Not available";

	document.getElementById("modalGlass").innerText = drink.strGlass || "Not available";

	document.getElementById("modalInstructions").innerText =
		drink.strInstructions || "Not available";

	document.getElementById("modalIngredients").innerText = getIngredients(drink);

	const modal = new bootstrap.Modal(document.getElementById("drinkDetailsModal"));

	modal.show();
};

// Get ingredients from drink data
const getIngredients = (drink) => {
	const ingredients = [];

	for (let i = 1; i <= 15; i++) {
		const ingredient = drink[`strIngredient${i}`];

		if (ingredient) {
			ingredients.push(ingredient);
		}
	}

	if (ingredients.length === 0) {
		return "Not available";
	}

	return ingredients.join(", ");
};

// Search button click
searchButton.addEventListener("click", searchDrinks);

// Press Enter key to search
searchInput.addEventListener("keyup", (event) => {
	if (event.key === "Enter") {
		searchDrinks();
	}
});

// If search input is cleared, load default drinks again
searchInput.addEventListener("input", () => {
	const searchValue = searchInput.value.trim();

	if (searchValue === "") {
		loadDefaultDrinks();
	}
});

// Load default drinks
loadDefaultDrinks();
