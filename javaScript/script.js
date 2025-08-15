document.addEventListener('DOMContentLoaded', function() {
    // --------------------------
    // 1. نظام عربة التسوق المحسن
    // --------------------------
    
    const cartSystem = {
        init: function() {
            this.createCartElements();
            this.loadCart();
            this.setupEventListeners();
            this.updateCartDisplay();
            this.addCartButtonsToProducts();
        },
        
        addCartButtonsToProducts: function() {
            const shopContainer = document.querySelector('.shop-container');
            if (!shopContainer) return;
            
            const products = shopContainer.querySelectorAll('div');
            products.forEach(product => {
                const name = product.querySelector('h4').textContent;
                const priceText = product.querySelector('.Price').textContent;
                const price = parseFloat(priceText.replace('$', ''));
                const image = product.querySelector('img').getAttribute('src');
                
                const addButton = document.createElement('button');
                addButton.className = 'add-to-cart';
                addButton.textContent = 'Add to Cart';
                addButton.dataset.name = name;
                addButton.dataset.price = price;
                addButton.dataset.image = image;
                
                product.appendChild(addButton);
            });
        },
        
        createCartElements: function() {
            if (!document.getElementById('cartSidebar')) {
                const cartHtml = `
                    <div class="cart-overlay" id="cartOverlay"></div>
                    <aside class="cart-sidebar" id="cartSidebar">
                        <div class="cart-header">
                            <h2>Cart(<span id="cartCount">0</span>)</h2>
                            <button id="closeCart">Close</button>
                        </div>
                        <div class="cart-items" id="cartItems">
                            <p>Your cart is empty</p>
                        </div>
                        <div class="cart-total" id="cartTotal">
                            Total : $0.00
                        </div>
                    </aside>
                    <button class="cart-toggle" id="cartToggle">Cart(<span id="cartToggleCount">0</span>)</button>
                    <div class="cart-counter" id="cartCounter">0</div>
                `;
                document.body.insertAdjacentHTML('beforeend', cartHtml);
            }
        },
        setupEventListeners: function() {
            document.getElementById('cartToggle')?.addEventListener('click', () => this.toggleCart());
            document.getElementById('closeCart')?.addEventListener('click', () => this.toggleCart());
            document.getElementById('cartOverlay')?.addEventListener('click', () => this.toggleCart());
            
            // Set closeCart button background color after it's available in DOM
            const closeCart = document.getElementById('closeCart');
            if (closeCart) {
                closeCart.style.backgroundColor = '#6f4c3e';
                closeCart.style.color = 'white';
                closeCart.style.width = '100%';
                closeCart.style.borderRadius = '15px';
                closeCart.style.height = '40px';
                closeCart.style.cursor = 'pointer';
            }
            
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('add-to-cart')) {
                    const button = e.target;
                    const product = {
                        name: button.dataset.name,
                        price: parseFloat(button.dataset.price),
                        image: button.dataset.image,
                        quantity: 1
                    };
                    this.addItem(product);
                }
            });
        },
        
        toggleCart: function() {
            const sidebar = document.getElementById('cartSidebar');
            const overlay = document.getElementById('cartOverlay');
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        },
        
        addItem: function(product) {
            const existingItem = this.cart.find(item => 
                item.name === product.name && item.price === product.price
            );
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.cart.push(product);
            }
            
            this.saveCart();
            this.updateCartDisplay();
            this.showNotification(`${product.name} has been added to the cart!`);
            
            if (!document.getElementById('cartSidebar').classList.contains('active')) {
                this.toggleCart();
            }
        },
        
        removeItem: function(index) {
            this.cart.splice(index, 1);
            this.saveCart();
            this.updateCartDisplay();
        },
        
        updateQuantity: function(index, change) {
            this.cart[index].quantity += change;
            
            if (this.cart[index].quantity < 1) {
                this.cart.splice(index, 1);
            }
            
            this.saveCart();
            this.updateCartDisplay();
        },
        
        updateCartDisplay: function() {
            const cartItemsContainer = document.getElementById('cartItems');
            const cartTotalElement = document.getElementById('cartTotal');
            
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            document.getElementById('cartCount').textContent = totalItems;
            document.getElementById('cartToggleCount').textContent = totalItems;
            document.getElementById('cartCounter').textContent = totalItems;
            
            document.getElementById('cartCounter').style.display = totalItems > 0 ? 'flex' : 'none';
            
            if (this.cart.length === 0) {
                cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
                cartTotalElement.textContent = 'Total : $0.00';
                return;
            }
            
            cartItemsContainer.innerHTML = '';
            this.cart.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
                        <div class="cart-item-actions">
                            <button class="decrease-quantity" data-index="${index}">-</button>
                            <button class="increase-quantity" data-index="${index}">+</button>
                            <button class="remove-item" data-index="${index}">Remove</button>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
            
            cartTotalElement.textContent = `Total : $${totalPrice.toFixed(2)}`;
            
            document.querySelectorAll('.decrease-quantity').forEach(button => {
                button.addEventListener('click', () => {
                    this.updateQuantity(parseInt(button.dataset.index), -1);
                });
            });
            
            document.querySelectorAll('.increase-quantity').forEach(button => {
                button.addEventListener('click', () => {
                    this.updateQuantity(parseInt(button.dataset.index), 1);
                });
            });
            
            document.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', () => {
                    this.removeItem(parseInt(button.dataset.index));
                });
            });
            let remove = document.querySelectorAll('.remove-item');
            remove.forEach(button => {
                button.style.backgroundColor = '#6f4c3e';
                button.style.color = 'white';
                button.style.border = 'none';
                button.style.padding = '8px 16px';
                button.style.marginTop = '10px';
                button.style.borderRadius = '15px';
                button.style.cursor = 'pointer';
                button.style.transition = 'all 0.3s ease';
                button.style.width = '100%';
            });
        },
        
        loadCart: function() {
            this.cart = JSON.parse(localStorage.getItem('coffeeShopCart')) || [];
        },
        
        saveCart: function() {
            localStorage.setItem('coffeeShopCart', JSON.stringify(this.cart));
        },
        
        showNotification: function(message) {
            const notification = document.createElement('div');
            notification.className = 'cart-notification';
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        },
        
        cart: []
    };

    // تهيئة نظام السلة
    cartSystem.init();

    // --------------------------
    // 2. تحسينات أخرى
    // --------------------------
    
    // تأثيرات الصور
    const images = document.querySelectorAll('.shop-container img');
    images.forEach(img => {
        img.parentElement.style.position = 'relative';
        
        img.addEventListener('mouseenter', () => {
            img.style.transform = 'scale(1.03)';
            img.style.transition = 'transform 0.3s ease';
        });
        
        img.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1)';
        });
    });
});

// أنماط CSS المطلوبة
const style = document.createElement('style');
style.textContent = `
    /* أزرار إضافة إلى السلة */
    .add-to-cart {
        background-color: #6f4c3e;
        color: white;
        border: none;
        padding: 8px 16px;
        margin-top: 10px;
        border-radius: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
    }
    
    .add-to-cart:hover {
        background-color: #6f4c3e;
        transform: translateY(-2px);
    }
    
    /* عداد السلة */
    .cart-counter {
        position: fixed;
        top: 50px;
        right: 20px;
        background-color: #8B4513;
        color: white;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    
    /* شريط السلة الجانبي */
    .cart-sidebar {
        position: fixed;
        top: 0;
        right: -400px;
        width: 350px;
        height: 100%;
        background-color: #f8f8f8;
        box-shadow: -2px 0 5px rgba(0,0,0,0.1);
        transition: right 0.3s ease;
        z-index: 1000;
        padding: 20px;
        overflow-y: auto;
    }
    
    .cart-sidebar.active {
        right: 0;
    }
    
    .cart-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        z-index: 999;
        display: none;
    }
    
    .cart-overlay.active {
        display: block;
    }
    
    /* زر عرض السلة */
    .cart-toggle {
        position: fixed;
        right: 20px;
        top: 150px;
        background-color: #6f4c3e;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 15px;
        cursor: pointer;
        z-index: 100;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    /* إشعارات السلة */
    .cart-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #6f4c3e;
        color: white;
        padding: 15px 25px;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
    }
    
    .cart-notification.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    /* عناصر السلة */
    .cart-item {
        display: flex;
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
    }
    
    .cart-item img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        margin-right: 10px;
    }
    
    .cart-item-actions {
        display: flex;
        gap: 5px;
        margin-top: 5px;
    }
    
    .cart-item-actions button {
        background-color: #ddd;
        border: none;
        padding: 2px 5px;
        border-radius: 3px;
        cursor: pointer;
    }
`;
document.head.appendChild(style);


document.addEventListener('DOMContentLoaded', function() {
    // 1. إنشاء عناصر السايدبار وزر العرض
    const createOrderElements = () => {
        if (!document.getElementById('ordersSidebar')) {
            const orderHtml = `
                <div class="orders-overlay" id="ordersOverlay"></div>
                <aside class="orders-sidebar" id="ordersSidebar">
                    <div class="orders-header">
                        <h2> Orders (<span id="ordersCount">0</span>)</h2>
                        <button id="closeOrders">Close</button>
                    </div>
                    <div class="orders-list" id="ordersList">
                        <p class="empty-orders">No orders yet</p>
                    </div>
                    <div class="orders-total" id="ordersTotal">
                        Total: $0.00
                    </div>
                    <button class="checkout-btn" id="checkoutBtn">Checkout</button>
                </aside>
                <button class="show-orders-btn" id="showOrdersBtn">
                    <span class="orders-icon">🛒</span>
                    <span class="orders-badge" id="ordersBadge">0</span>
                </button>
            `;
            document.body.insertAdjacentHTML('beforeend', orderHtml);
        }
    };


    // 2. تهيئة نظام الطلبات
    const ordersSystem = {
        orders: [],
        
        init: function() {
            this.loadOrders();
            this.setupEventListeners();
            this.updateOrdersDisplay();
        },
        
        loadOrders: function() {
            const savedOrders = localStorage.getItem('coffeeShopOrders');
            if (savedOrders) {
                this.orders = JSON.parse(savedOrders);
            }
        },
        
        saveOrders: function() {
            localStorage.setItem('coffeeShopOrders', JSON.stringify(this.orders));
        },
        
        addOrder: function(itemName, itemPrice) {
            const existingOrder = this.orders.find(order => order.name === itemName);
            
            if (existingOrder) {
                existingOrder.quantity += 1;
            } else {
                this.orders.push({
                    name: itemName,
                    price: parseFloat(itemPrice),
                    quantity: 1
                });
            }
            
            this.saveOrders();
            this.updateOrdersDisplay();
            this.showOrderNotification(itemName);
        },
        
        removeOrder: function(index) {
            this.orders.splice(index, 1);
            this.saveOrders();
            this.updateOrdersDisplay();
        },
        
        updateQuantity: function(index, change) {
            this.orders[index].quantity += change;
            
            if (this.orders[index].quantity < 1) {
                this.orders.splice(index, 1);
            }
            
            this.saveOrders();
            this.updateOrdersDisplay();
        },
        
        updateOrdersDisplay: function() {
            const ordersList = document.getElementById('ordersList');
            const ordersCount = document.getElementById('ordersCount');
            const ordersBadge = document.getElementById('ordersBadge');
            const ordersTotal = document.getElementById('ordersTotal');
            
            const totalItems = this.orders.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = this.orders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // تحديث العداد
            if (ordersCount) ordersCount.textContent = totalItems;
            if (ordersBadge) ordersBadge.textContent = totalItems;
            
            // تحديث قائمة الطلبات
            if (ordersList) {
                ordersList.innerHTML = '';
                
                if (this.orders.length === 0) {
                    ordersList.innerHTML = '<p class="empty-orders">No orders yet</p>';
                    ordersTotal.textContent = 'Total: $0.00';
                    return;
                }
                
                this.orders.forEach((order, index) => {
                    const orderItem = document.createElement('div');
                    orderItem.className = 'order-item';
                    orderItem.innerHTML = `
                        <div class="order-info">
                            <h4>${order.name}</h4>
                            <p>$${order.price.toFixed(2)} × ${order.quantity}</p>
                        </div>
                        <div class="order-actions">
                            <button class="decrease-order" data-index="${index}">-</button>
                            <button class="increase-order" data-index="${index}">+</button>
                            <button class="remove-order" data-index="${index}">×</button>
                        </div>
                    `;
                    ordersList.appendChild(orderItem);
                });
                
                // تحديث الإجمالي
                ordersTotal.textContent = `Total: $${totalPrice.toFixed(2)}`;
                
                // إضافة مستمعي الأحداث للأزرار الجديدة
                document.querySelectorAll('.decrease-order').forEach(btn => {
                    btn.addEventListener('click', () => {
                        this.updateQuantity(parseInt(btn.dataset.index), -1);
                    });
                });
                
                document.querySelectorAll('.increase-order').forEach(btn => {
                    btn.addEventListener('click', () => {
                        this.updateQuantity(parseInt(btn.dataset.index), 1);
                    });
                });
                
                document.querySelectorAll('.remove-order').forEach(btn => {
                    btn.addEventListener('click', () => {
                        this.removeOrder(parseInt(btn.dataset.index));
                    });
                });
            }
        },
        
        showOrderNotification: function(itemName) {
            const notification = document.createElement('div');
            notification.className = 'order-notification';
            notification.innerHTML = `
                <p>Added: <strong>${itemName}</strong></p>
                <div class="progress-bar"></div>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
                
                const progressBar = notification.querySelector('.progress-bar');
                progressBar.style.animation = 'progress 3s linear forwards';
                
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        notification.remove();
                    }, 300);
                }, 3000);
            }, 10);
        },
        
        setupEventListeners: function() {
            // أحداث السايدبار
            document.getElementById('showOrdersBtn')?.addEventListener('click', () => {
                this.toggleOrdersSidebar();
            });
            
            document.getElementById('closeOrders')?.addEventListener('click', () => {
                this.toggleOrdersSidebar();
            });
            
            document.getElementById('ordersOverlay')?.addEventListener('click', () => {
                this.toggleOrdersSidebar();
            });
            
            // حدث Checkout
            document.getElementById('checkoutBtn')?.addEventListener('click', () => {
                this.checkout();
            });
        },
        
        toggleOrdersSidebar: function() {
            document.getElementById('ordersSidebar').classList.toggle('active');
            document.getElementById('ordersOverlay').classList.toggle('active');
        },
        
        checkout: function() {
            if (this.orders.length === 0) return;
            
            alert(`Order confirmed! Total: $${this.getTotal().toFixed(2)}`);
            this.orders = [];
            this.saveOrders();
            this.updateOrdersDisplay();
            this.toggleOrdersSidebar();
        },
        
        getTotal: function() {
            return this.orders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
    };

    // 3. نظام القائمة والطلبات
    const setupMenuOrderSystem = () => {
        const menuItems = document.querySelectorAll('.caffe-container > div[class] p');
        
        menuItems.forEach(item => {
            const orderBtn = document.createElement('button');
            orderBtn.className = 'order-btn';
            orderBtn.innerHTML = '<span>+</span> Add to Order';
            
            const price = item.querySelector('.price').textContent;
            orderBtn.dataset.price = price.replace('$', '');
            orderBtn.dataset.item = item.textContent.split('$')[0].trim();
            
            item.appendChild(orderBtn);
            
            orderBtn.addEventListener('click', function() {
                const itemName = this.dataset.item;
                const itemPrice = this.dataset.price;
                ordersSystem.addOrder(itemName, itemPrice);
            });
        });
    };

    // 4. تهيئة جميع الأنظمة
    createOrderElements();
    ordersSystem.init();
    setupMenuOrderSystem();

    // 5. إضافة أنماط CSS ديناميكيًا
    const style = document.createElement('style');
    style.textContent = `
        /* زر عرض الطلبات */
        .show-orders-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            background-color: #8B4513;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 900;
            transition: all 0.3s ease;
        }
        
        .show-orders-btn:hover {
            transform: scale(1.1);
            background-color: #5D2906;
        }
        
        .orders-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background-color: #ff4757;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* سايدبار الطلبات */
        .orders-sidebar {
            position: fixed;
            top: 0;
            right: -400px;
            width: 350px;
            height: 100%;
            background-color: #f8f4e9;
            box-shadow: -2px 0 10px rgba(0,0,0,0.1);
            transition: right 0.3s ease;
            z-index: 1000;
            padding: 20px;
            display: flex;
            flex-direction: column;
        }
        
        .orders-sidebar.active {
            right: 0;
        }
        
        .orders-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            z-index: 999;
            display: none;
        }
        
        .orders-overlay.active {
            display: block;
        }
        
        .orders-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #ddd;
        }
        
        .orders-header h2 {
            color: #5D2906;
            margin: 0;
        }
        
        .orders-header button {
            background: none;
            border: none;
            font-size: 1.2em;
            cursor: pointer;
            color: #8B4513;
        }
        
        .orders-list {
            flex-grow: 1;
            overflow-y: auto;
            margin-bottom: 20px;
        }
        
        .empty-orders {
            text-align: center;
            color: #999;
            margin-top: 50px;
        }
        
        .order-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #eee;
        }
        
        .order-info h4 {
            margin: 0;
            color: #5D2906;
        }
        
        .order-info p {
            margin: 5px 0 0;
            color: #8B4513;
        }
        
        .order-actions {
            display: flex;
            gap: 5px;
        }
        
        .order-actions button {
            background-color: #8B4513;
            color: white;
            border: none;
            width: 25px;
            height: 25px;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .orders-total {
            font-weight: bold;
            text-align: right;
            margin: 15px 0;
            font-size: 1.2em;
            color: #5D2906;
        }
        
        .checkout-btn {
            background-color: #5D2906;
            color: white;
            border: none;
            padding: 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1em;
            transition: background-color 0.3s;
        }
        
        .checkout-btn:hover {
            background-color: #8B4513;
        }
        
        /* أزرار الطلب في القائمة */
        .order-btn {
            background-color: #5D2906;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 15px;
            cursor: pointer;
            display: inline-flex;
            gap: 5px;
            transition: all 0.3s;
            /* العنصر في يمين الصفحه */
            float: right;
            margin-left: 10px;
        }
        
        .order-btn:hover {
            background-color: #8B4513;
            transform: translateY(-2px);
        }
        
        .order-btn span {
            font-weight: bold;
        }
        
        /* إشعارات الطلب */
        .order-notification {
            position: fixed;
            bottom: 100px;
            right: 30px;
            background: #5D2906;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1000;
        }
        
        .order-notification.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .progress-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: rgba(255,255,255,0.5);
            width: 100%;
            transform-origin: left;
            transform: scaleX(0);
        }
        #closeOrders{
            background-color: #5D2906;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 15px;
            cursor: pointer;
            margin-top: 8px;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: all 0.3s;
        }
        
        @keyframes progress {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
        }
        
        /* تصميم متجاوب */
        @media (max-width: 768px) {
            .orders-sidebar {
                width: 100%;
                max-width: 350px;
            }
            
            .show-orders-btn {
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                font-size: 20px;
            }
            .order-btn {
                float: none;
                display: block;
                margin: 8px auto 0 auto;
            }
        }
    `;
    document.head.appendChild(style);
});