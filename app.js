class View {
	constructor() {
		this.searchWrapper = document.querySelector(".menu");
		this.inputBox = document.querySelector("input");
		this.suggBox = document.querySelector(".dropdown-container");
		this.cardContainer = document.querySelector(".cards-container");
		this.emptyResult = document.querySelector(".empty-result");
	}
	createElement(elementTag, elementClass) {
		const element = document.createElement(elementTag);
		if (elementClass) {
			element.classList.add(elementClass);
		}
		return element;
	}

	createUser(userData) {
		let name = userData.name;
		let owner = userData.owner.login;
		let stars = userData.stargazers_count;
		let dropdownContentInner = `<div class="dropdown-content" data-owner="${owner}" data-stars="${stars}">${name}</div>`;
		this.suggBox.innerHTML += dropdownContentInner;
	}

	addCard(userData) {
		this.dropDownItems = document.querySelectorAll(".dropdown-content");
		this.dropDownItems.forEach((element) =>
			element.addEventListener("click", (event) => {
				element.removeEventListener("click", event);
				let target = event.target;
				if (!target.classList.contains("dropdown-content")) {
					return;
				} else {
					this.clearUsers();
					this.addTarget(target);
				}
			})
		);
	}
	addTarget(target) {
		let name = target.textContent;
		let owner = target.dataset.owner;
		let stars = target.dataset.stars;

		this.cardContainer.innerHTML += `<div class="card">Name: ${name}<br>Owner: ${owner}<br>Stars: ${stars}<button class="btn-close"></button></div>`;
	}
	emptySearch() {
		let emptyMessage = "По вашему запросу ничего не найдено";
		this.emptyResult.innerHTML = emptyMessage;
	}
}

class Search extends View {
	constructor() {
		super();
		const dropPages = 5;

		this.inputBox.addEventListener(
			"input",
			this.debounce(this.searchUsers.bind(this, dropPages), 500)
		);
		this.inputBox.removeEventListener(
			"input",
			this.debounce(this.searchUsers.bind(this, dropPages), 500)
		);
		this.cardContainer.addEventListener("click", (event) => {
			this.cardContainer.removeEventListener("click", event);
			let target = event.target;
			if (!target.classList.contains("btn-close")) return;

			target.parentElement.remove();
		});
	}
	async searchUsers(page) {
		try {
			const searchValue = this.inputBox.value;
			if (searchValue) {
				return await fetch(
					`https://api.github.com/search/repositories?q=${searchValue}&per_page=${page}`
				).then((response) => {
					if (response.ok) {
						response.json().then((response) => {
							if (response.total_count === 0) {
								this.emptySearch();
							} else {
								this.clearEmptyResult();
							}
							this.clearUsers();
							response.items.forEach((user) => {
								this.createUser(user);
								this.addCard(user);
							});
						});
					} else return null;
				});
			} else {
				this.clearUsers();
			}
		} catch (error) {
			return null;
		}
	}
	clearEmptyResult() {
		this.emptyResult.innerHTML = "";
	}
	clearUsers() {
		this.suggBox.innerHTML = "";
	}

	debounce(func, wait, immediatle) {
		let timeout;
		return function () {
			const context = this,
				args = arguments;
			const later = function () {
				timeout = null;
				if (!immediatle) func.apply(context, args);
			};
			const callNow = immediatle && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}
}
new View();
new Search();
