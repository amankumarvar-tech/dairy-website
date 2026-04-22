import React, { useState, useEffect, createContext, useContext } from 'react';
import { getProducts, createOrder, registerUser, loginUser, sendContact, deleteProduct } from './api';
import './App.css';

// Context
const AppContext = createContext();

export function useApp() { return useContext(AppContext); }

// ============ TOAST ============
function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => removeToast(t.id)}>
          <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ============ NAVBAR ============
function Navbar({ page, setPage, cart, user, setUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => setPage('home')}>
        <span className="brand-icon">🐄</span>
        <div>
          <div className="brand-name">Shree Gau Dairy</div>
          <div className="brand-tagline">Pure • Fresh • Natural</div>
        </div>
      </div>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {['home', 'products', 'about', 'contact'].map(p => (
          <button key={p} className={`nav-link ${page === p ? 'active' : ''}`}
            onClick={() => { setPage(p); setMenuOpen(false); }}>
            {p === 'home' ? '🏠 Home' : p === 'products' ? '🥛 Products' : p === 'about' ? 'ℹ️ About' : '📞 Contact'}
          </button>
        ))}
        {user?.role === 'admin' && (
          <button className={`nav-link ${page === 'admin' ? 'active' : ''}`} onClick={() => { setPage('admin'); setMenuOpen(false); }}>
            ⚙️ Admin
          </button>
        )}
      </div>

      <div className="nav-actions">
        <button className="cart-btn" onClick={() => setPage('cart')}>
          🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
        {user ? (
          <div className="user-info">
            <span className="user-name">👤 {user.name.split(' ')[0]}</span>
            <button className="logout-btn" onClick={() => { setUser(null); localStorage.removeItem('dairy_user'); }}>Logout</button>
          </div>
        ) : (
          <button className="login-btn" onClick={() => setPage('auth')}>Login / Register</button>
        )}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      </div>
    </nav>
  );
}

// ============ HOME PAGE ============
function HomePage({ setPage }) {
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-circle c1"></div>
          <div className="hero-circle c2"></div>
          <div className="hero-circle c3"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">🌿 100% Natural & Pure</div>
          <h1 className="hero-title">
            Ghar Ki Yaad Dilaata<br />
            <span className="hero-highlight">Shree Gau Dairy</span>
          </h1>
          <p className="hero-desc">
            Taaze desi gaay ka doodh, seedha aapke ghar tak. Koi milawat nahi, koi chemical nahi —
            sirf shudh aur natural dairy products.
          </p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => setPage('products')}>
              🛍️ Products Dekho
            </button>
            <button className="btn-secondary" onClick={() => setPage('contact')}>
              📞 Order Karo
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">500+</span><span className="stat-label">Happy Customers</span></div>
            <div className="stat"><span className="stat-num">10+</span><span className="stat-label">Years Experience</span></div>
            <div className="stat"><span className="stat-num">15+</span><span className="stat-label">Desi Gaayein</span></div>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-img-bg">
            <div className="floating-emoji e1">🥛</div>
            <div className="floating-emoji e2">🐄</div>
            <div className="floating-emoji e3">🌿</div>
            <div className="floating-emoji e4">🧈</div>
            <div className="big-cow">🐄</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <h2 className="section-title">Hum Kyun Khaas Hain? 🌟</h2>
        <div className="features-grid">
          {[
            { icon: '🌅', title: 'Subah Ki Taazgi', desc: 'Har roz subah 5 baje doodh nikaala jaata hai aur seedha delivery hoti hai' },
            { icon: '🚫', title: 'Koi Milawat Nahi', desc: 'Hum kasam khaate hain — koi paani, koi powder, koi chemical kabhi nahi' },
            { icon: '🐄', title: 'Desi Nasal Gaayein', desc: 'Sirf sahiwal aur gir nasal ki desi gaayein, jo A2 milk deti hain' },
            { icon: '🏠', title: 'Ghar Tak Delivery', desc: 'Subah 7 baje se pehle aapke darwaze par fresh milk pahunch jaata hai' },
            { icon: '💰', title: 'Seedha Daam', desc: 'Beechiye nahi, doosra margin nahi — seedha dairy se aapke paas' },
            { icon: '🌱', title: 'Natural Aahaar', desc: 'Gaayein sirf hara chaara, bajra, aur natural grass khaati hain' },
          ].map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>🎁 Pehli Delivery FREE!</h2>
          <p>Abhi register karo aur pehli order par FREE delivery pao</p>
          <button className="btn-primary" onClick={() => setPage('auth')}>Abhi Join Karo 🚀</button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2 className="section-title">Log Kya Kehte Hain 💬</h2>
        <div className="testimonials-grid">
          {[
            { name: 'Manoj Kumar', review: 'Sach mein pehle wali doodh ki yaad aa gayi! Itni malaai aur khushboo kahin aur nahi milti.', rating: 5, city: 'Mallhchak More' },
            { name: 'Rahul Yadav', review: 'Mere bacche ab bimar nahi padey jab se hum in ka doodh le rahe hain. Bahut shukra!', rating: 5, city: 'Bandhuganj' },
            { name: 'Monu Kumar', review: 'Ghee itna acha hai ki khana hi badal gaya! Subah ki roti ghee ke saath...wah!', rating: 5, city: 'Tehta' },
          ].map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="stars">{'⭐'.repeat(t.rating)}</div>
              <p className="review-text">"{t.review}"</p>
              <div className="reviewer">
                <span className="reviewer-name">— {t.name}</span>
                <span className="reviewer-city">📍 {t.city}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ============ PRODUCTS PAGE ============
function ProductsPage({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const { addToast } = useApp();

  useEffect(() => {
    fetchProducts();
  }, [category]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      const res = await getProducts(params);
      setProducts(res.data.data);
    } catch (err) {
      addToast('Products load nahi ho sake. Backend chalu karo!', 'error');
      // Demo data fallback
      setProducts([
        { _id: '1', name: 'Fresh Full Cream Milk', category: 'milk', price: 60, unit: '1 Liter', description: 'Pure desi cow ka taaza full cream milk', image: '🥛', inStock: true, rating: 4.8 },
        { _id: '2', name: 'Pure Desi Ghee', category: 'ghee', price: 650, unit: '500gm', description: 'Bilona method se bana 100% pure desi ghee', image: '🫙', inStock: true, rating: 4.9 },
        { _id: '3', name: 'Fresh Paneer', category: 'paneer', price: 320, unit: '500gm', description: 'Taaze doodh se bana soft paneer', image: '🧀', inStock: true, rating: 4.7 },
        { _id: '4', name: 'Dahi (Curd)', category: 'curd', price: 80, unit: '500gm', description: 'Thick creamy dahi', image: '🍦', inStock: true, rating: 4.8 },
        { _id: '5', name: 'Homemade Butter', category: 'butter', price: 280, unit: '500gm', description: 'Cream se bana fresh white butter', image: '🧈', inStock: true, rating: 4.6 },
        { _id: '6', name: 'Sweet Lassi', category: 'lassi', price: 40, unit: '250ml', description: 'Meethi creamy lassi', image: '🥤', inStock: true, rating: 4.7 },
      ]);
    }
    setLoading(false);
  }

  const categories = ['all', 'milk', 'ghee', 'paneer', 'butter', 'curd', 'lassi', 'sweets'];
  const catEmoji = { all: '🌟', milk: '🥛', ghee: '🫙', paneer: '🧀', butter: '🧈', curd: '🍦', lassi: '🥤', sweets: '🍮' };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="products-page">
      <div className="products-header">
        <h1 className="page-title">Hamare Products 🥛</h1>
        <p>Sabse fresh, sabse pure — seedha desi gaay se</p>
      </div>

      <div className="search-bar">
        <input
          type="text" placeholder="🔍 Product dhundo..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="category-tabs">
        {categories.map(c => (
          <button key={c} className={`cat-tab ${category === c ? 'active' : ''}`}
            onClick={() => setCategory(c)}>
            {catEmoji[c]} {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-grid">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-card"></div>)}
        </div>
      ) : (
        <div className="products-grid">
          {filtered.length === 0 ? (
            <div className="no-products">
              <div style={{ fontSize: '3rem' }}>🔍</div>
              <p>Koi product nahi mila</p>
            </div>
          ) : filtered.map(product => (
            <ProductCard key={product._id} product={product} addToCart={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, addToCart }) {
  const { addToast } = useApp();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(product);
    addToast(`${product.name} cart mein add ho gaya! 🛒`, 'success');
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="product-card">
      <div className="product-emoji">{product.image}</div>
      <div className="product-info">
        <div className="product-category">{product.category.toUpperCase()}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-rating">{'⭐'.repeat(Math.round(product.rating))} ({product.rating})</div>
        <div className="product-footer">
          <div className="product-price">
            <span className="price">₹{product.price}</span>
            <span className="unit">/ {product.unit}</span>
          </div>
          <button
            className={`add-btn ${added ? 'added' : ''} ${!product.inStock ? 'disabled' : ''}`}
            onClick={handleAdd}
            disabled={!product.inStock}
          >
            {!product.inStock ? '❌ Out of Stock' : added ? '✅ Added!' : '🛒 Add'}
          </button>
        </div>
        {!product.inStock && <div className="out-of-stock-badge">Out of Stock</div>}
      </div>
    </div>
  );
}

// ============ CART PAGE ============
function CartPage({ cart, setCart, setPage }) {
  const { addToast } = useApp();
  const [form, setForm] = useState({ customerName: '', customerPhone: '', address: '', paymentMethod: 'cash', notes: '' });
  const [loading, setLoading] = useState(false);
  const [orderDone, setOrderDone] = useState(null);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  function updateQty(id, delta) {
    setCart(prev => prev.map(i => i._id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  }
  function removeItem(id) {
    setCart(prev => prev.filter(i => i._id !== id));
    addToast('Item cart se remove ho gaya', 'info');
  }

  async function placeOrder(e) {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.address) {
      addToast('Saari zaruri information bharo!', 'error');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        ...form,
        items: cart.map(i => ({ productId: i._id, productName: i.name, price: i.price, quantity: i.quantity, unit: i.unit })),
        totalAmount: total
      };
      const res = await createOrder(orderData);
      setOrderDone(res.data);
      setCart([]);
      addToast(res.data.message, 'success');
    } catch (err) {
      addToast('Order place karne mein problem. Backend check karo!', 'error');
      // Demo success
      setOrderDone({ success: true, message: 'Order place ho gaya! (Demo Mode) 🎉' });
      setCart([]);
    }
    setLoading(false);
  }

  if (orderDone) {
    return (
      <div className="order-success">
        <div className="success-icon">🎉</div>
        <h2>Order Ho Gaya Bhai!</h2>
        <p>{orderDone.message}</p>
        <p className="success-note">Aapko call aayegi jald hi! 📞</p>
        <button className="btn-primary" onClick={() => setPage('products')}>Aur Shopping Karo</button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <div style={{ fontSize: '4rem' }}>🛒</div>
        <h2>Cart Khaali Hai!</h2>
        <p>Kuch products add karo pehle</p>
        <button className="btn-primary" onClick={() => setPage('products')}>Products Dekho</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="page-title">Your Cart 🛒</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.map(item => (
            <div className="cart-item" key={item._id}>
              <div className="cart-item-emoji">{item.image}</div>
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p className="cart-item-unit">{item.unit}</p>
                <p className="cart-item-price">₹{item.price} × {item.quantity} = <strong>₹{item.price * item.quantity}</strong></p>
              </div>
              <div className="cart-item-controls">
                <button className="qty-btn" onClick={() => updateQty(item._id, -1)}>−</button>
                <span className="qty-num">{item.quantity}</span>
                <button className="qty-btn" onClick={() => updateQty(item._id, 1)}>+</button>
                <button className="remove-btn" onClick={() => removeItem(item._id)}>🗑️</button>
              </div>
            </div>
          ))}
          <div className="cart-total">
            <span>Kul Amount:</span>
            <strong className="total-price">₹{total}</strong>
          </div>
        </div>

        <div className="order-form">
          <h2>Delivery Details 🏠</h2>
          <form onSubmit={placeOrder}>
            <div className="form-group">
              <label>Aapka Naam *</label>
              <input type="text" placeholder="Pura naam likhein" value={form.customerName}
                onChange={e => setForm({ ...form, customerName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" placeholder="10 digit number" value={form.customerPhone}
                onChange={e => setForm({ ...form, customerPhone: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Delivery Address *</label>
              <textarea placeholder="Pura address likhein..." value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })} rows={3} required />
            </div>
            <div className="form-group">
              <label>Payment Ka Tarika</label>
              <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                <option value="cash">💵 Cash on Delivery</option>
                <option value="upi">📱 UPI</option>
                <option value="online">💳 Online Payment</option>
              </select>
            </div>
            <div className="form-group">
              <label>Koi Note? (Optional)</label>
              <input type="text" placeholder="Koi khaas baat likhein..." value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary order-btn" disabled={loading}>
              {loading ? '⏳ Order Ho Raha Hai...' : `✅ Order Karo — ₹${total}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============ AUTH PAGE ============
function AuthPage({ setUser, setPage }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { addToast } = useApp();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = isLogin ? await loginUser({ email: form.email, password: form.password }) : await registerUser(form);
      setUser(res.data.user);
      localStorage.setItem('dairy_user', JSON.stringify(res.data.user));
      addToast(res.data.message, 'success');
      setPage('home');
    } catch (err) {
      addToast(err.response?.data?.message || 'Kuch galat hua. Try karo phir!', 'error');
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">🐄</div>
        <h2>{isLogin ? 'Login Karo' : 'Register Karo'}</h2>
        <p>{isLogin ? 'Welcome back!' : 'Shree Gau Dairy family mein aapka swagat hai!'}</p>

        <div className="auth-tabs">
          <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>Login</button>
          <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Register</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Aapka Naam</label>
                <input type="text" placeholder="Pura naam" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="Mobile number" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="aapka@email.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? '⏳ Wait karo...' : isLogin ? '🔓 Login' : '🎉 Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============ ABOUT PAGE ============
function AboutPage({ setPage }) {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>Hamare Baare Mein 🐄</h1>
        <p>10 saal se aapke ghar mein shuddhata laa rahe hain</p>
      </div>
      <div className="about-content">
        <div className="about-section">
          <h2>🌱 Hamari Kahani</h2>
          <p>Shree Gau Dairy ki shuruaat 2014 mein ek choti si gaushala se hui. Humare founder Ramkishan Yadav ji ka sapna tha ki har ghar mein pure aur natural dairy products pahunche. Aaj hum 500+ families ko seedha apne farm se fresh milk deliver karte hain.</p>
        </div>
        <div className="about-section">
          <h2>🐄 Hamaari Gaushala</h2>
          <p>Hamare paas 15 pure desi sahiwal aur gir nasal ki gaayein hain. In gaayein ko hum pyaar aur care se paalte hain. Inhe koi injection ya hormone nahi diya jaata. Ye sirf hara chaara, bajra, aur natural grass khaati hain.</p>
        </div>
        <div className="about-section">
          <h2>✅ Hamaara Vaada</h2>
          <div className="promises-grid">
            {['Koi paani nahi milata', 'Koi powder nahi', 'Koi preservative nahi', 'Roz fresh milking', 'Subah delivery', 'Quality guarantee'].map((p, i) => (
              <div className="promise-item" key={i}>✅ {p}</div>
            ))}
          </div>
        </div>
        <div className="about-cta">
          <button className="btn-primary" onClick={() => setPage('products')}>Abhi Order Karo 🛍️</button>
        </div>
      </div>
    </div>
  );
}

// ============ CONTACT PAGE ============
function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const { addToast } = useApp();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await sendContact(form);
      addToast(res.data.message, 'success');
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch (err) {
      addToast('Message bhej diya! Hum jald call karenge. 📞', 'success');
      setForm({ name: '', phone: '', email: '', message: '' });
    }
    setLoading(false);
  }

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Humse Miliye 📞</h1>
        <p>Koi bhi sawaal? Hum ready hain!</p>
      </div>
      <div className="contact-layout">
        <div className="contact-info">
          <h2>Contact Details</h2>
          <div className="contact-items">
            <div className="contact-item"><span>📞</span><div><strong>Phone</strong><p>+91 90606 55645</p><p>+91 72778 83088</p></div></div>
            <div className="contact-item"><span>📍</span><div><strong>Address</strong><p>Shree Gau Dairy, Village Kurtha Bazar,<br />Tehsil Tehta, District Jehanabad,<br />Rajasthan - 302001</p></div></div>
            <div className="contact-item"><span>⏰</span><div><strong>Delivery Time</strong><p>Subah 5 AM - 8 AM</p><p>Shaam 5 PM - 7 PM</p></div></div>
            <div className="contact-item"><span>📧</span><div><strong>Email</strong><p>amankumarvar@gmail.com</p></div></div>
          </div>
        </div>
        <div className="contact-form">
          <h2>Message Bhejo 💬</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Naam *</label>
              <input type="text" placeholder="Aapka naam" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input type="tel" placeholder="Mobile number" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Email (optional)" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Message *</label>
              <textarea placeholder="Kya poochna hai? Order karna hai? Likhein..." value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })} rows={4} required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '⏳ Bhej raha hun...' : '📤 Message Bhejo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============ ADMIN PAGE ============
function AdminPage() {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'milk', price: '', unit: '1 Liter', description: '', image: '🥛', inStock: true, featured: false, rating: 4.5 });
  const { addToast } = useApp();
  const { getOrders: fetchOrdersApi, createProduct: createProdApi } = require('./api');

  useEffect(() => {
    if (tab === 'products') loadProducts();
    if (tab === 'orders') loadOrders();
  }, [tab]);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await getProducts();
      setProducts(res.data.data);
    } catch { addToast('Backend se products nahi aaye', 'error'); }
    setLoading(false);
  }

  async function loadOrders() {
    setLoading(true);
    try {
      const { getOrders } = await import('./api');
      const res = await getOrders();
      setOrders(res.data.data);
    } catch { addToast('Orders nahi aaye. Backend check karo.', 'error'); }
    setLoading(false);
  }

  async function handleDeleteProduct(id) {
    if (!window.confirm('Kya aap sach mein delete karna chahte hain?')) return;
    try {
      await deleteProduct(id);
      addToast('Product delete ho gaya!', 'success');
      loadProducts();
    } catch { addToast('Delete nahi hua', 'error'); }
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    try {
      const { createProduct } = await import('./api');
      await createProduct({ ...form, price: Number(form.price) });
      addToast('Naya product add ho gaya! 🎉', 'success');
      setForm({ name: '', category: 'milk', price: '', unit: '1 Liter', description: '', image: '🥛', inStock: true, featured: false, rating: 4.5 });
      loadProducts();
    } catch { addToast('Product add nahi hua', 'error'); }
  }

  async function handleUpdateStatus(id, status) {
    try {
      const { updateOrderStatus } = await import('./api');
      await updateOrderStatus(id, status);
      addToast('Order status update ho gaya!', 'success');
      loadOrders();
    } catch { addToast('Status update nahi hua', 'error'); }
  }

  return (
    <div className="admin-page">
      <h1 className="page-title">Admin Panel ⚙️</h1>
      <div className="admin-tabs">
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>🥛 Products</button>
        <button className={tab === 'add' ? 'active' : ''} onClick={() => setTab('add')}>➕ Product Add Karo</button>
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>📋 Orders</button>
      </div>

      {tab === 'products' && (
        <div className="admin-products">
          {loading ? <div className="loading-text">⏳ Loading...</div> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td>{p.image} {p.name}</td>
                      <td><span className="cat-badge">{p.category}</span></td>
                      <td>₹{p.price}/{p.unit}</td>
                      <td><span className={p.inStock ? 'in-stock' : 'no-stock'}>{p.inStock ? '✅ In Stock' : '❌ Out'}</span></td>
                      <td><button className="del-btn" onClick={() => handleDeleteProduct(p._id)}>🗑️ Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'add' && (
        <div className="add-product-form">
          <h2>Naya Product Add Karo ➕</h2>
          <form onSubmit={handleAddProduct}>
            <div className="form-row">
              <div className="form-group"><label>Product Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product ka naam" required /></div>
              <div className="form-group"><label>Category *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {['milk', 'ghee', 'paneer', 'butter', 'curd', 'lassi', 'sweets', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Price (₹) *</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0" required /></div>
              <div className="form-group"><label>Unit *</label>
                <input type="text" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="1 Liter / 500gm" required /></div>
            </div>
            <div className="form-group"><label>Description *</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Product ke baare mein likhein" required /></div>
            <div className="form-row">
              <div className="form-group"><label>Emoji 🎨</label>
                <input type="text" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="🥛" /></div>
              <div className="form-group"><label>Rating</label>
                <input type="number" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} min="0" max="5" step="0.1" /></div>
            </div>
            <div className="form-row">
              <label className="checkbox-label"><input type="checkbox" checked={form.inStock} onChange={e => setForm({ ...form, inStock: e.target.checked })} /> In Stock</label>
              <label className="checkbox-label"><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Featured Product</label>
            </div>
            <button type="submit" className="btn-primary">➕ Product Add Karo</button>
          </form>
        </div>
      )}

      {tab === 'orders' && (
        <div className="admin-orders">
          {loading ? <div className="loading-text">⏳ Loading orders...</div> : orders.length === 0 ? (
            <div className="no-data">📭 Koi orders nahi hain abhi</div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div className="order-card-admin" key={order._id}>
                  <div className="order-header-admin">
                    <div>
                      <strong>{order.customerName}</strong> — 📞 {order.customerPhone}
                      <div className="order-address">📍 {order.address}</div>
                    </div>
                    <div className="order-amount">₹{order.totalAmount}</div>
                  </div>
                  <div className="order-items-list">
                    {order.items?.map((item, i) => <span key={i} className="order-item-chip">{item.productName} ×{item.quantity}</span>)}
                  </div>
                  <div className="order-footer-admin">
                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                    <select value={order.status} onChange={e => handleUpdateStatus(order._id, e.target.value)} className="status-select">
                      {['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============ FOOTER ============
function Footer({ setPage }) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">🐄 Shree Gau Dairy</div>
          <p>Pure desi milk, seedha gaay se aapke ghar tak. Ek vaada — koi milawat nahi!</p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          {[['home', '🏠 Home'], ['products', '🥛 Products'], ['about', 'ℹ️ About'], ['contact', '📞 Contact']].map(([p, label]) => (
            <button key={p} className="footer-link" onClick={() => setPage(p)}>{label}</button>
          ))}
        </div>
        <div className="footer-contact">
          <h4>Contact</h4>
          <p>📞 +91 9060655645</p>
          <p>📍 Kurtha Bazar,Tehta,Jehanabad</p>
          <p>⏰ Delivery: 5 AM - 8 AM</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 Shree Gau Dairy. Sabke liye pure milk! 🐄❤️ || Developed By Aman Kumar Verma</p>
      </div>
    </footer>
  );
}

// ============ MAIN APP ============
export default function App() {
  const [page, setPage] = useState('home');
  const [cart, setCart] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dairy_user')); } catch { return null; }
  });

  function addToast(message, type = 'info') {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }

  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  function addToCart(product) {
    setCart(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) return prev.map(i => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage setPage={setPage} />;
      case 'products': return <ProductsPage addToCart={addToCart} />;
      case 'cart': return <CartPage cart={cart} setCart={setCart} setPage={setPage} />;
      case 'about': return <AboutPage setPage={setPage} />;
      case 'contact': return <ContactPage />;
      case 'auth': return <AuthPage setUser={setUser} setPage={setPage} />;
      case 'admin': return user?.role === 'admin' ? <AdminPage /> : <AuthPage setUser={setUser} setPage={setPage} />;
      default: return <HomePage setPage={setPage} />;
    }
  };

  return (
    <AppContext.Provider value={{ addToast, user }}>
      <div className="app">
        <Navbar page={page} setPage={setPage} cart={cart} user={user} setUser={setUser} />
        <main className="main-content">{renderPage()}</main>
        <Footer setPage={setPage} />
        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </AppContext.Provider>
  );
}
