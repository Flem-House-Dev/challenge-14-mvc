const { application } = require("express");

const blogFormSubmitHandler = async (event) => {
    event.preventDefault();

    const blogForm = document.getElementById('blog-post-form');

    const formData = new FormData(blogForm);
    const blogData = {
        title: formData.get('blog-form-title'),
        author: formData.get('blog-form-author'),
        content: formData.get('blog-text-area')
    };

    try {
        const response = await fetch('/api/blog-form', {
            method: POST,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(blogData)
        });

        if(response.ok) {
            const result = await response.json();
            console.log('Blog post created', result);
            blogForm.reset();
        } else {
            console.error('Error creating blog post', response.statusText);
        }
    } catch (err) {
        console.error('Error', err);
    };
};

document
    .querySelector('.blog-form')
    .addEventListener('submit', blogFormSubmitHandler);