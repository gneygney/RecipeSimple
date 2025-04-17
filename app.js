document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-button');
    const pages = document.querySelectorAll('.page');

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
        });
    });

    // Initialize the home page as active
    document.getElementById('home-page').classList.remove('hidden');
}); 