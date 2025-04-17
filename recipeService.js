class RecipeService {
    constructor() {
        this.recipes = [];
        this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        this.weeklyPlan = JSON.parse(localStorage.getItem('weeklyPlan') || '[]');
        this.loadRecipes();
    }

    async loadRecipes() {
        try {
            const response = await fetch('recipes.json');
            this.recipes = await response.json();
        } catch (error) {
            console.error('Error loading recipes:', error);
            this.recipes = [];
        }
    }

    getAllRecipes() {
        // Return recipes in random order
        return [...this.recipes].sort(() => Math.random() - 0.5);
    }

    getRecipeById(id) {
        return this.recipes.find(recipe => recipe.Id === id);
    }

    searchByIngredients(ingredients) {
        const searchTerms = ingredients.toLowerCase().split(',').map(term => term.trim());
        return this.recipes.filter(recipe => {
            const recipeIngredients = recipe.Ingredients.map(ing => ing.Name.toLowerCase());
            return searchTerms.every(term => 
                recipeIngredients.some(ing => ing.includes(term))
            );
        });
    }

    addToFavorites(recipeId) {
        if (!this.favorites.includes(recipeId)) {
            this.favorites.push(recipeId);
            this.saveFavorites();
        }
    }

    removeFromFavorites(recipeId) {
        this.favorites = this.favorites.filter(id => id !== recipeId);
        this.saveFavorites();
    }

    getFavorites() {
        return this.recipes.filter(recipe => this.favorites.includes(recipe.Id));
    }

    addToWeeklyPlan(recipeId, day) {
        const existingIndex = this.weeklyPlan.findIndex(plan => plan.day === day);
        
        if (existingIndex !== -1) {
            this.weeklyPlan[existingIndex].recipeId = recipeId;
        } else {
            this.weeklyPlan.push({ day, recipeId });
        }
        
        this.saveWeeklyPlan();
    }

    removeFromWeeklyPlan(day) {
        this.weeklyPlan = this.weeklyPlan.filter(plan => plan.day !== day);
        this.saveWeeklyPlan();
    }

    getWeeklyPlan() {
        return this.weeklyPlan.map(plan => ({
            day: plan.day,
            recipe: this.getRecipeById(plan.recipeId)
        }));
    }

    saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }

    saveWeeklyPlan() {
        localStorage.setItem('weeklyPlan', JSON.stringify(this.weeklyPlan));
    }
}

// Create a singleton instance
const recipeService = new RecipeService(); 