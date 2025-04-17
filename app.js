document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-button');
    const pages = document.querySelectorAll('.page');
    const searchInput = document.getElementById('ingredient-search');
    const searchButton = document.getElementById('search-button');
    const searchResultsContainer = document.getElementById('search-results');
    const weeklyPlanContainer = document.getElementById('weekly-plan');
    const recipeScrollContainer = document.getElementById('recipe-scroll');

    // Handle navigation
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Hide all pages
            pages.forEach(page => page.classList.add('hidden'));
            
            // Show the selected page
            const pageId = `${button.dataset.page}-page`;
            document.getElementById(pageId).classList.remove('hidden');

            // Load appropriate content
            if (pageId === 'home-page') {
                loadHomeRecipes();
            } else if (pageId === 'week-page') {
                loadWeeklyPlan();
            }
        });
    });

    // Handle search
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            const results = recipeService.searchByIngredients(searchTerm);
            displaySearchResults(results);
        }
    });

    // Load initial content
    loadHomeRecipes();

    function loadHomeRecipes() {
        const recipes = recipeService.getAllRecipes();
        displayRecipes(recipes);
    }

    function displayRecipes(recipes) {
        recipeScrollContainer.innerHTML = recipes.map(recipe => `
            <div class="recipe-card" style="background-image: url('images/${recipe.Id}.jpg')">
                <div class="recipe-overlay">
                    <div class="recipe-header">
                        <h2 class="recipe-title">${recipe.Name}</h2>
                        <div class="recipe-actions">
                            <button class="favorite-btn ${recipeService.favorites.includes(recipe.Id) ? 'active' : ''}" data-id="${recipe.Id}">
                                <i class="fas fa-heart"></i>
                            </button>
                            <button class="add-to-week-btn" data-id="${recipe.Id}">
                                <i class="fas fa-calendar-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="ingredients-container">
                        <div class="ingredients-grid">
                            ${recipe.Ingredients.slice(0, 10).map(ingredient => `
                                <div class="ingredient-item">
                                    <span class="ingredient-amount">${ingredient.Amount}</span>
                                    <span class="ingredient-unit">${ingredient.Unit}</span>
                                    <span class="ingredient-name">${ingredient.Name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners for favorite buttons
        recipeScrollContainer.querySelectorAll('.favorite-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const recipeId = parseInt(e.target.closest('.favorite-btn').dataset.id);
                if (recipeService.favorites.includes(recipeId)) {
                    recipeService.removeFromFavorites(recipeId);
                    button.classList.remove('active');
                } else {
                    recipeService.addToFavorites(recipeId);
                    button.classList.add('active');
                }
            });
        });

        // Add event listeners for add to week buttons
        recipeScrollContainer.querySelectorAll('.add-to-week-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const recipeId = parseInt(e.target.closest('.add-to-week-btn').dataset.id);
                // For simplicity, we'll add to Monday
                recipeService.addToWeeklyPlan(recipeId, 'Monday');
                loadWeeklyPlan();
            });
        });
    }

    function displaySearchResults(recipes) {
        searchResultsContainer.innerHTML = recipes.map(recipe => `
            <div class="recipe-card">
                <h3>${recipe.Name}</h3>
                <p>Time: ${recipe.TimeEstimate}</p>
                <p>Servings: ${recipe.Servings}</p>
                <p>Calories: ${recipe.Calories}</p>
                <div class="recipe-actions">
                    <button class="favorite-btn ${recipeService.favorites.includes(recipe.Id) ? 'active' : ''}" data-id="${recipe.Id}">
                        ${recipeService.favorites.includes(recipe.Id) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                    <button class="add-to-week-btn" data-id="${recipe.Id}">Add to Week</button>
                </div>
            </div>
        `).join('');

        // Add event listeners for favorite buttons
        searchResultsContainer.querySelectorAll('.favorite-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const recipeId = parseInt(e.target.dataset.id);
                if (recipeService.favorites.includes(recipeId)) {
                    recipeService.removeFromFavorites(recipeId);
                } else {
                    recipeService.addToFavorites(recipeId);
                }
                displaySearchResults(recipes);
            });
        });

        // Add event listeners for add to week buttons
        searchResultsContainer.querySelectorAll('.add-to-week-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const recipeId = parseInt(e.target.dataset.id);
                recipeService.addToWeeklyPlan(recipeId, 'Monday');
                loadWeeklyPlan();
            });
        });
    }

    function loadWeeklyPlan() {
        const weeklyPlan = recipeService.getWeeklyPlan();
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        weeklyPlanContainer.innerHTML = days.map(day => {
            const plan = weeklyPlan.find(p => p.day === day);
            return `
                <div class="weekly-plan-day">
                    <h3>${day}</h3>
                    ${plan ? `
                        <div class="recipe-card">
                            <h3>${plan.recipe.Name}</h3>
                            <p>Time: ${plan.recipe.TimeEstimate}</p>
                            <p>Servings: ${plan.recipe.Servings}</p>
                            <button class="remove-from-week-btn" data-day="${day}">Remove</button>
                        </div>
                    ` : `
                        <select class="recipe-select" data-day="${day}">
                            <option value="">Select a recipe...</option>
                            ${recipeService.getAllRecipes().map(recipe => 
                                `<option value="${recipe.Id}">${recipe.Name}</option>`
                            ).join('')}
                        </select>
                    `}
                </div>
            `;
        }).join('');

        // Add event listeners for recipe selection
        document.querySelectorAll('.recipe-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const day = e.target.dataset.day;
                const recipeId = parseInt(e.target.value);
                if (recipeId) {
                    recipeService.addToWeeklyPlan(recipeId, day);
                    loadWeeklyPlan();
                }
            });
        });

        // Add event listeners for removing recipes
        document.querySelectorAll('.remove-from-week-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const day = e.target.dataset.day;
                recipeService.removeFromWeeklyPlan(day);
                loadWeeklyPlan();
            });
        });
    }
}); 