// Main JavaScript for Event Management System

document.addEventListener('DOMContentLoaded', function() {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Initialize popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });

  // Add fade-in animation to main content
  const mainContent = document.querySelector('main');
  if (mainContent) {
    mainContent.classList.add('fade-in');
  }

  // Form validation
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });

  // Event booking form - update total price
  const ticketInput = document.getElementById('num_tickets');
  const pricePerTicket = document.getElementById('price_per_ticket');
  const totalPrice = document.getElementById('total_price');
  
  if (ticketInput && pricePerTicket && totalPrice) {
    ticketInput.addEventListener('input', function() {
      const price = parseFloat(pricePerTicket.dataset.price);
      const tickets = parseInt(this.value) || 0;
      totalPrice.textContent = (price * tickets).toFixed(2);
    });
  }

  // Search form - toggle advanced search options
  const advancedSearchToggle = document.getElementById('advanced-search-toggle');
  const advancedSearchOptions = document.getElementById('advanced-search-options');
  
  if (advancedSearchToggle && advancedSearchOptions) {
    advancedSearchToggle.addEventListener('click', function(e) {
      e.preventDefault();
      advancedSearchOptions.classList.toggle('d-none');
      this.textContent = advancedSearchOptions.classList.contains('d-none') 
        ? 'Show Advanced Options' 
        : 'Hide Advanced Options';
    });
  }

  // Event review form - star rating
  const ratingInputs = document.querySelectorAll('.rating-input');
  const ratingStars = document.querySelectorAll('.rating-star');
  
  if (ratingStars.length > 0) {
    ratingStars.forEach(star => {
      star.addEventListener('click', function() {
        const value = this.dataset.value;
        document.getElementById('rating').value = value;
        
        // Update stars
        ratingStars.forEach(s => {
          if (s.dataset.value <= value) {
            s.classList.add('fas');
            s.classList.remove('far');
          } else {
            s.classList.add('far');
            s.classList.remove('fas');
          }
        });
      });
    });
  }

  // Admin dashboard charts (placeholder)
  const chartCanvas = document.getElementById('bookingsChart');
  if (chartCanvas) {
    // In a real application, this would use Chart.js or similar
    console.log('Chart would be initialized here');
  }
});
