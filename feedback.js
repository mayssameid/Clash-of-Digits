
const API_URL = 'http://localhost:3000/api';

// fetch and display recent feedback from database
async function loadRecentFeedback() {
  try {
    const response = await fetch(`${API_URL}/feedback/recent?limit=5`);
    
    if (!response.ok) {
      throw new Error('Failed to load feedback');
    }
    
    const feedbackList = await response.json();
    displayFeedback(feedbackList);
  } catch (error) {
    console.error('Error loading feedback:', error);
    // keeps existing testimonials if API fails
  }
}

// displays feedback in testimonials section
function displayFeedback(feedbackList) {
  const testimonialsContainer = document.getElementById('testimonials-list');
  if (!testimonialsContainer || feedbackList.length === 0) return;
  
  // clears existing content
  testimonialsContainer.innerHTML = '';
  
  feedbackList.forEach(feedback => {
    const stars = '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);
    const date = new Date(feedback.created_at).toLocaleDateString();
    // Show actual comment from any of the feedback fields
    const comment = feedback.liked || feedback.additional_comments || feedback.disliked || 'Thank you for your feedback!';
    
    const feedbackHTML = `
      <div class="forum-post">
        <div class="title">⭐ ${stars} Rating</div>
        <div class="meta">By ${feedback.name} • ${date}</div>
        <div class="body">"${comment}"</div>
      </div>
    `;
    
    testimonialsContainer.innerHTML += feedbackHTML;
  });
}

// adds new testimonial to the testimonials section
function addNewTestimonial(data) {
  const testimonialsContainer = document.getElementById('testimonials-list');
  if (!testimonialsContainer) return;
  
  // shows actual comment from any feedback field
  const comment = data.like || data.additional || data.disliked || 'Thank you for your feedback!';
  
  // making star rating display
  const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
  
  // scrolling to testimonials section so user can see their new testimonial
  document.getElementById('player-testimonials').scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  });
}

// setting up animated background particles using particles.js
// found this library here: https://github.com/VincentGarreau/particles.js/
function initMathParticles() {
  particlesJS('particles-js', {
    "particles": {
      "number": {
        "value": 25,
        "density": {
          "enable": true,
          "value_area": 800
        }
      },
      "color": {
        "value": ["#0fcece", "#e94560", "#ffffff"]
      },
      "shape": {
        "type": ["circle", "edge"],
        "stroke": {
          "width": 1,
          "color": "#0fcece"
        }
      },
      "opacity": {
        "value": 0.1,
        "random": true,
        "anim": {
          "enable": true,
          "speed": 1,
          "opacity_min": 0.05,
          "sync": false
        }
      },
      "size": {
        "value": 8,
        "random": true,
        "anim": {
          "enable": true,
          "speed": 2,
          "size_min": 3,
          "sync": false
        }
      },
      "line_linked": {
        "enable": true,
        "distance": 150,
        "color": "#0fcece",
        "opacity": 0.05,
        "width": 1
      },
      "move": {
        "enable": true,
        "speed": 1.5,
        "direction": "top",
        "random": true,
        "straight": false,
        "out_mode": "out",
        "bounce": false,
        "attract": {
          "enable": true,
          "rotateX": 600,
          "rotateY": 1200
        }
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": {
          "enable": true,
          "mode": "grab"
        },
        "onclick": {
          "enable": true,
          "mode": "push"
        },
        "resize": true
      },
      "modes": {
        "grab": {
          "distance": 140,
          "line_linked": {
            "opacity": 0.2
          }
        },
        "push": {
          "particles_nb": 4
        }
      }
    },
    "retina_detect": true
  });
}

// submits feedback to database using Fetch API
async function submitFeedback(feedbackData) {
  try {
    // sends POST request to save feedback in database
    const response = await fetch(`${API_URL}/feedback`, {
      method: 'POST', // POST method to create new feedback entry
      headers: {
        'Content-Type': 'application/json', // sending JSON data
      },
      body: JSON.stringify(feedbackData) // converts feedback object to JSON
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit feedback');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
}

// when the page loads, this starts everything up
document.addEventListener('DOMContentLoaded', function() {
  console.log('Feedback page JavaScript loaded!');
  
  // loads recent feedback from database
  loadRecentFeedback();
  
  // starting up the scroll animations
  // got this library from: https://github.com/michalsnik/aos
  AOS.init({
    duration: 1000,
    easing: 'ease-in-out',
    once: true
  });
  
  // starting up the background particles animation
  // using particles.js library: https://github.com/VincentGarreau/particles.js/
  initMathParticles();
  
  // setting up form validation and submission
  const form = document.getElementById('feedback-form');
  const statusElement = document.getElementById('fb-status');
  
  if (form) {
    form.addEventListener('submit', async function(event) {
      event.preventDefault();
      
      // getting required fields from the form
      const name = document.getElementById('fb-name').value.trim();
      const email = document.getElementById('fb-email').value.trim();
      const rating = document.querySelector('input[name="rating"]:checked');
      
      // checking if required fields are filled
      if (!name) {
        statusElement.textContent = 'Please fill in your name (required field marked with *)';
        statusElement.style.color = '#e94560';
        return;
      }
      
      if (!email) {
        statusElement.textContent = 'Please fill in your email (required field marked with *)';
        statusElement.style.color = '#e94560';
        return;
      }
      
      if (!rating) {
        statusElement.textContent = 'Please select a rating (required field marked with *)';
        statusElement.style.color = '#e94560';
        return;
      }
      
      // gets all form data
      const ratingValue = rating.value;
      const liked = document.getElementById('fb-like').value.trim();
      const disliked = document.getElementById('fb-dislike').value.trim();
      const features = document.getElementById('fb-features').value.trim();
      const additional = document.getElementById('fb-additional').value.trim();
      
      // gets selected challenges
      const challengesChecked = document.querySelectorAll('input[name="challenges"]:checked');
      const challengesArray = Array.from(challengesChecked).map(cb => cb.value);
      const otherChallenge = document.getElementById('challenges-other').value.trim();
      if (otherChallenge) {
        challengesArray.push(otherChallenge);
      }
      const challenges = challengesArray.join(',');
      
      // prepares feedback data for API
      const feedbackData = {
        name: name,
        email: email,
        rating: parseInt(ratingValue),
        liked: liked,
        disliked: disliked,
        feature_requests: features,
        challenges: challenges,
        additional_comments: additional
      };
      
      // shows loading message
      statusElement.textContent = 'Submitting feedback...';
      statusElement.style.color = '#0fcece';
      
      try {
        // submits to database using Fetch API
        await submitFeedback(feedbackData);
        
        // creating testimonial data for local display
        const testimonialData = {
          name: name,
          email: email,
          rating: parseInt(ratingValue),
          like: liked,
          additional: additional,
          date: new Date().toLocaleDateString()
        };
        
        // adding testimonial if user provided a comment
        if (testimonialData.like || testimonialData.additional) {
          addNewTestimonial(testimonialData);
        }
        
        // showing thank you message
        document.getElementById('thank-you').style.display = 'block';
        
        // resetting form for next use
        form.reset();
        
        // reloads recent feedback to show updated list
        setTimeout(() => {
          loadRecentFeedback();
        }, 1000);
        
      } catch (error) {
        statusElement.textContent = 'Error submitting feedback. Please try again.';
        statusElement.style.color = '#e94560';
      }
      
      // hiding messages after 5 seconds
      setTimeout(() => {
        statusElement.textContent = '';
        document.getElementById('thank-you').style.display = 'none';
      }, 5000);
    });
  }
});
