import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Star, Heart, Plus, Check, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { CartDrawer } from '../components/common/CartDrawer.js';
import { IProduct, ICategory } from '../types/index.js';
import { api } from '../services/api.js';
import { useCartStore } from '../stores/cartStore.js';
import styles from './ShopPage.module.scss';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedEggType, setSelectedEggType] = useState<string>(searchParams.get('eggType') || 'all');
  const [maxPrice, setMaxPrice] = useState<number>(600);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/products', {
          params: {
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            eggType: selectedEggType !== 'all' ? selectedEggType : undefined,
            maxPrice: maxPrice < 600 ? maxPrice : undefined,
            search: searchTerm || undefined,
            sort: sortBy,
            limit: 20,
          },
        });
        setProducts(res.data.data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, selectedEggType, maxPrice, searchTerm, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedEggType('all');
    setMaxPrice(600);
    setSearchTerm('');
    setSortBy('newest');
    setSearchParams({});
  };

  const handleAddToCart = async (product: IProduct, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await addItem(product._id, 1);
      setAddedItemNotice(product._id);
      setTimeout(() => setAddedItemNotice(null), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Page Banner */}
        <div className={styles.shopHeader}>
          <span className="section-label">Fresh Farm Catalogue</span>
          <h1 className={styles.pageTitle}>Shop Pasture-Raised Packs</h1>
          <p className={styles.pageSubtitle}>
            Gathered daily at sunrise from ethical family farms. Filter by hen breed, egg count, and packaging.
          </p>
        </div>

        <div className={styles.contentLayout}>
          {/* Sidebar Filter Panel (Modeled after reference video) */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <div className={styles.filterTitle}>
                <SlidersHorizontal size={18} />
                <span>Filters</span>
              </div>
              <button onClick={resetFilters} className={styles.resetBtn}>
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>

            {/* Search Input */}
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Category Filter */}
            <div className={styles.filterGroup}>
              <h4 className={styles.groupHeading}>CATEGORY</h4>
              <div className={styles.filterList}>
                <button
                  className={`${styles.categoryOption} ${selectedCategory === 'all' ? styles.optionActive : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    className={`${styles.categoryOption} ${selectedCategory === cat.slug ? styles.optionActive : ''}`}
                    onClick={() => setSelectedCategory(cat.slug)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Egg Type Variety */}
            <div className={styles.filterGroup}>
              <h4 className={styles.groupHeading}>EGG VARIETY</h4>
              <div className={styles.filterList}>
                {[
                  { id: 'all', label: 'All Varieties' },
                  { id: 'PASTURE_RAISED', label: 'Pasture-Raised Golden' },
                  { id: 'ORGANIC_BROWN', label: 'Organic Brown' },
                  { id: 'CLASSIC_WHITE', label: 'Classic White' },
                  { id: 'DUCK', label: 'Pasture Duck' },
                ].map((type) => (
                  <button
                    key={type.id}
                    className={`${styles.categoryOption} ${selectedEggType === type.id ? styles.optionActive : ''}`}
                    onClick={() => setSelectedEggType(type.id)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className={styles.filterGroup}>
              <div className={styles.priceHeader}>
                <h4 className={styles.groupHeading}>PRICE RANGE</h4>
                <span className={styles.priceVal}>Up to ₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="100"
                max="600"
                step="20"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className={styles.rangeSlider}
              />
            </div>
          </aside>

          {/* Product Results Area */}
          <section className={styles.resultsArea}>
            {/* Top Bar with Count & Sort */}
            <div className={styles.resultsTopBar}>
              <span className={styles.resultsCount}>
                Showing <strong>{products.length}</strong> farm packs
              </span>

              <div className={styles.sortWrapper}>
                <label htmlFor="sortSelect">Sort by:</label>
                <select
                  id="sortSelect"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.sortSelect}
                >
                  <option value="newest">Newest Dispatch</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Customer Rated</option>
                </select>
              </div>
            </div>

            {/* Grid of Product Cards */}
            {loading ? (
              <div className={styles.loadingGrid}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={styles.skeletonCard} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className={styles.noResults}>
                <div className={styles.noResultsEgg}>🥚</div>
                <h3>No eggs match your current filter</h3>
                <p>Try resetting filters or adjusting your price slider.</p>
                <button onClick={resetFilters} className="btn-primary">
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className={styles.cardsGrid}>
                {products.map((product) => {
                  const isAdded = addedItemNotice === product._id;
                  const isLiked = !!wishlist[product._id];

                  return (
                    <div key={product._id} className={styles.productCard}>
                      {/* Top Action Row */}
                      <div className={styles.cardTopRow}>
                        <button
                          className={`${styles.wishlistBtn} ${isLiked ? styles.wishlistActive : ''}`}
                          onClick={() => setWishlist((p) => ({ ...p, [product._id]: !p[product._id] }))}
                        >
                          <Heart
                            size={16}
                            fill={isLiked ? '#D9381E' : 'none'}
                            color={isLiked ? '#D9381E' : '#5C3D2E'}
                          />
                        </button>

                        <div className={styles.ratingBadge}>
                          <Star size={13} fill="#FFB800" color="#FFB800" />
                          <span>{product.ratingsAverage}</span>
                        </div>
                      </div>

                      {/* Image */}
                      <Link to={`/products/${product.slug}`} className={styles.imageWrapper}>
                        <img
                          src={
                            product.images[0] ||
                            'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80'
                          }
                          alt={product.name}
                          className={styles.productImg}
                        />
                      </Link>

                      {/* Details */}
                      <div className={styles.cardDetails}>
                        <span className={styles.quantityBadge}>{product.eggQuantity} EGGS</span>
                        <Link to={`/products/${product.slug}`} className={styles.titleLink}>
                          {product.name}
                        </Link>
                        <div className={styles.priceRow}>
                          <span className={styles.currentPrice}>
                            ₹{product.discountPrice || product.price}
                          </span>
                          {product.discountPrice && (
                            <span className={styles.originalPrice}>₹{product.price}</span>
                          )}
                        </div>
                      </div>

                      {/* Corner Radial Add-to-Cart Action */}
                      <button
                        className={`${styles.cornerActionBtn} ${isAdded ? styles.cornerAdded : ''}`}
                        onClick={(e) => handleAddToCart(product, e)}
                        title="Add to basket"
                      >
                        {isAdded ? <Check size={20} /> : <Plus size={20} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

