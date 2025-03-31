document.addEventListener('DOMContentLoaded', () => {
    const productContainer = document.getElementById('product-container');
    const searchInput = document.getElementById('search');
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const quantityModal = new bootstrap.Modal(document.getElementById('quantityModal'));
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    const paymentForm = document.getElementById('payment-form');

    let cart = [];
    let currentProduct = null;

    // Cargar productos desde la API
    fetch('https://fakestoreapi.com/products')
        .then(response => response.json())
        .then(products => {
            products.forEach(product => {
                const card = createProductCard(product);
                productContainer.appendChild(card);
            });
        });

    // Crear tarjeta de producto
    function createProductCard(product) {
        const card = document.createElement('div');
        card.classList.add('col-md-4');
        card.innerHTML = `
            <div class="card">
                <img src="${product.image}" class="card-img-top" alt="${product.title}">
                <div class="card-body">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="card-text">$${product.price}</p>
                    <button class="btn btn-primary add-to-cart" data-id="${product.id}">Añadir al carrito</button>
                </div>
            </div>
        `;
        return card;
    }

    // Añadir producto al carrito
    productContainer.addEventListener('click', event => {
        if (event.target.classList.contains('add-to-cart')) {
            currentProduct = event.target.dataset.id;
            quantityModal.show();
        }
    });

    // Actualizar contador del carrito
    function updateCartCount() {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Mostrar productos en el carrito
    function renderCartItems() {
        cartItems.innerHTML = '';
        cart.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('cart-item');
            div.innerHTML = `
                <span>${item.title} x${item.quantity}</span>
                <span>$${item.price * item.quantity}</span>
            `;
            cartItems.appendChild(div);
        });
    }

    // Añadir producto al carrito
    document.getElementById('add-to-cart').addEventListener('click', () => {
        const quantity = document.getElementById('product-quantity').value;
        fetch(`https://fakestoreapi.com/products/${currentProduct}`)
            .then(response => response.json())
            .then(product => {
                const existingItem = cart.find(item => item.id === product.id);
                if (existingItem) {
                    existingItem.quantity += parseInt(quantity);
                } else {
                    cart.push({ ...product, quantity: parseInt(quantity) });
                }
                updateCartCount();
                renderCartItems();
                quantityModal.hide();
            });
    });

    // Filtrar productos por nombre o categoría
    searchInput.addEventListener('input', event => {
        const query = event.target.value.toLowerCase();
        const cards = productContainer.querySelectorAll('.card');
        cards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            if (title.includes(query)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // Generar factura en PDF
    paymentForm.addEventListener('submit', event => {
        event.preventDefault();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 10;

        // Agregar la imagen
        const imgUrl = 'https://sdmntprwestus.oaiusercontent.com/files/00000000-9ee8-5230-8c20-3376b3dbaef3/raw?se=2025-03-31T02%3A01%3A20Z&sp=r&sv=2024-08-04&sr=b&scid=264ccda9-e13e-5918-b2fc-a43580ab8e29&skoid=51916beb-8d6a-49b8-8b29-ca48ed86557e&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-03-30T17%3A30%3A28Z&ske=2025-03-31T17%3A30%3A28Z&sks=b&skv=2024-08-04&sig=E3vvpUudyZH4fjbMBtGsdNJO9m5bikyxIW9AMCQh/80%3D';
        doc.addImage(imgUrl, 'PNG', 10, y, 40, 40);

        y += 50; // Ajustar la posición del texto debajo de la imagen
        doc.text('BOUTIQUE Ana Rosario', 10, y);
        y += 10;
        doc.text('Factura', 10, y);
        y += 10;
        cart.forEach(item => {
            doc.text(`${item.title} x${item.quantity} - $${item.price * item.quantity}`, 10, y);
            y += 10;
        });
        const total = cart.reduce((total, item) => total + item.price * item.quantity, 0);
        doc.text(`Total: $${total}`, 10, y);
        doc.save('factura.pdf');
        cart = [];
        updateCartCount();
        renderCartItems();
        paymentModal.hide();
        cartModal.hide();
    });
});
