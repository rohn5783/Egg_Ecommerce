import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, Heart, ShoppingBag, ArrowLeft, Check, Sparkles, Box, RefreshCw } from 'lucide-react';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { CartDrawer } from '../components/common/CartDrawer.js';
import { Carton3DScene } from '../components/common/Carton3DScene.js';
import { IProduct, IReview } from '../types/index.js';
import { api } from '../services/api.js';
import { useCartStore } from '../stores/cartStore.js';
import { useAuthStore } from '../stores/authStore.js';
import styles from './ProductDetailPage.module.scss';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [viewMode, setViewMode] = useState<'photo' | '3d'>('photo');
  const [purchaseType, setPurchaseType] = useState<'one-time' | 'subscribe'>('one-time');
  const [subFrequency, setSubFrequency] = useState<'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'>('WEEKLY');
  const [subSuccess, setSubSuccess] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Review Form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data.data);

        // Fetch reviews for this product
        if (res.data.data?._id) {
          const revRes = await api.get(`/reviews/product/${res.data.data._id}`);
          setReviews(revRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addItem(product._id, quantity);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setReviewSubmitting(true);
    setReviewMsg('');
    try {
      await api.post(`/reviews/product/${product._id}`, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setReviewMsg('Thank you! Your verified review has been published.');
      setReviewTitle('');
      setReviewComment('');
      // Reload reviews
      const revRes = await api.get(`/reviews/product/${product._id}`);
      setReviews(revRes.data.data);
    } catch (err: any) {
      setReviewMsg(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <Navbar />
        <div className={styles.loader}>Loading fresh farm details...</div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.loadingPage}>
        <Navbar />
        <div className={styles.loader}>
          <h3>Product Not Found</h3>
          <Link to="/shop" className="btn-primary">
            Return to Shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Back Link */}
        <Link to="/shop" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to All Packs</span>
        </Link>

        {/* Product Hero Grid */}
        <div className={styles.productHero}>
          {/* Gallery & 3D Interactive Viewer */}
          <div className={styles.galleryCol}>
            {/* View Mode Switcher */}
            <div className={styles.viewModeToggle}>
              <button
                className={`${styles.viewModeBtn} ${viewMode === 'photo' ? styles.viewModeActive : ''}`}
                onClick={() => setViewMode('photo')}
              >
                <span>Pack Photography</span>
              </button>
              <button
                className={`${styles.viewModeBtn} ${viewMode === '3d' ? styles.viewModeActive : ''}`}
                onClick={() => setViewMode('3d')}
              >
                <Box size={15} />
                <span>3D Pulp Carton</span>
              </button>
            </div>

            {viewMode === '3d' ? (
              <div className={styles.threeDInspectorWrapper}>
                <Carton3DScene initialOpen={true} />
              </div>
            ) : (
              <>
                <div className={styles.mainImgWrapper}>
                  <img
                    src={product.images[selectedImg] || product.images[0]}
                    alt={product.name}
                    className={styles.mainImg}
                  />
                </div>
                {product.images.length > 1 && (
                  <div className={styles.thumbRow}>
                    {product.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImg(i)}
                        className={`${styles.thumbBtn} ${selectedImg === i ? styles.thumbActive : ''}`}
                      >
                        <img src={img} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Details & Actions */}
          <div className={styles.infoCol}>
            <div className={styles.topBadgeRow}>
              <span className="badge-organic">100% Pasture-Raised</span>
              <div className={styles.ratingBox}>
                <Star size={14} fill="#FFB800" color="#FFB800" />
                <span>{product.ratingsAverage}</span>
                <span className={styles.revCount}>({reviews.length} reviews)</span>
              </div>
            </div>

            <h1 className={styles.productTitle}>{product.name}</h1>
            <p className={styles.shortDesc}>{product.shortDescription || product.description}</p>

            {/* Price Box */}
            <div className={styles.priceBox}>
              <span className={styles.price}>₹{product.discountPrice || product.price}</span>
              {product.discountPrice && (
                <>
                  <span className={styles.original}>₹{product.price}</span>
                  <span className={styles.savings}>
                    Save ₹{product.price - product.discountPrice}
                  </span>
                </>
              )}
            </div>

            {/* Key Specifications Grid */}
            <div className={styles.specsGrid}>
              <div className={styles.specBox}>
                <span className={styles.specLabel}>Count</span>
                <strong className={styles.specValue}>{product.eggQuantity} Eggs</strong>
              </div>
              <div className={styles.specBox}>
                <span className={styles.specLabel}>Shell Color</span>
                <strong className={styles.specValue}>{product.shellColor || 'Rustic Brown'}</strong>
              </div>
              <div className={styles.specBox}>
                <span className={styles.specLabel}>Yolk Score</span>
                <strong className={styles.specValue}>
                  #{product.yolkColorScore || 14} Roche
                </strong>
              </div>
              <div className={styles.specBox}>
                <span className={styles.specLabel}>Protein / Egg</span>
                <strong className={styles.specValue}>
                  {product.nutritionInfo?.protein || '6.5g'}
                </strong>
              </div>
            </div>

            {/* Actions: Quantity + Add To Basket + Pack in Custom Carton */}
            <div className={styles.actionRow}>
              <div className={styles.qtyControl}>
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>

              <button onClick={handleAddToCart} className={styles.addCartBtn}>
                <ShoppingBag size={18} />
                <span>{addedSuccess ? 'Added to Basket!' : 'Add to Morning Basket'}</span>
              </button>
            </div>

            {/* Trust Points */}
            <div className={styles.trustStrip}>
              <div className={styles.trustItem}>
                <ShieldCheck size={18} color="#2E7D32" />
                <span>Doorstep delivery before 8:00 AM</span>
              </div>
              <div className={styles.trustItem}>
                <Sparkles size={18} color="#FFB800" />
                <span>Gathered within 24 hours of dispatch</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition & Farm Story Tabs */}
        <section className={styles.nutritionSection}>
          <div className={styles.sectionHeader}>
            <span className="section-label">Laboratory Tested</span>
            <h2 className={styles.sectionTitle}>Nutritional Profile & Farm Standards</h2>
          </div>

          <div className={styles.nutritionGrid}>
            <div className={styles.nutritionCard}>
              <h3 className={styles.cardHeader}>Per Single Large Egg (50g)</h3>
              <div className={styles.nutriRow}>
                <span>Calories</span>
                <strong>{product.nutritionInfo?.calories || 72} kcal</strong>
              </div>
              <div className={styles.nutriRow}>
                <span>Protein</span>
                <strong>{product.nutritionInfo?.protein || '6.5g'}</strong>
              </div>
              <div className={styles.nutriRow}>
                <span>Omega-3 Fatty Acids</span>
                <strong>{product.nutritionInfo?.omega3 || '240mg'}</strong>
              </div>
              <div className={styles.nutriRow}>
                <span>Lutein & Zeaxanthin</span>
                <strong>{product.nutritionInfo?.lutein || '260mcg'}</strong>
              </div>
              <div className={styles.nutriRow}>
                <span>Vitamin D</span>
                <strong>{product.nutritionInfo?.vitaminD || '1.3mcg'}</strong>
              </div>
              <div className={styles.nutriRow}>
                <span>Total Good Fats</span>
                <strong>{product.nutritionInfo?.totalFat || '4.8g'}</strong>
              </div>
            </div>

            <div className={styles.farmingCard}>
              <h3 className={styles.cardHeader}>Farming & Packaging Commitment</h3>
              <p className={styles.farmParagraph}>{product.farmingPractice}</p>
              <div className={styles.packagingBox}>
                <strong>Packaging Detail:</strong>
                <p>{product.packagingInfo}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className={styles.reviewsSection}>
          <div className={styles.reviewsHeader}>
            <div>
              <span className="section-label">Verified Experiences</span>
              <h2 className={styles.sectionTitle}>Customer Reviews ({reviews.length})</h2>
            </div>
          </div>

          <div className={styles.reviewsLayout}>
            {/* Reviews List */}
            <div className={styles.reviewsList}>
              {reviews.length === 0 ? (
                <p className={styles.noReviews}>
                  No reviews yet for this pack. Be the first to share your experience!
                </p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className={styles.reviewItem}>
                    <div className={styles.revTop}>
                      <div className={styles.revStars}>
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={14} fill="#FFB800" color="#FFB800" />
                        ))}
                      </div>
                      {rev.isVerifiedPurchase && (
                        <span className={styles.verifiedTag}>
                          <Check size={12} /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <h4 className={styles.revTitle}>{rev.title}</h4>
                    <p className={styles.revComment}>{rev.comment}</p>
                    <span className={styles.revAuthor}>
                      By {rev.user?.name || 'Customer'} on{' '}
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Form */}
            <div className={styles.reviewFormCard}>
              <h3 className={styles.formTitle}>Write a Review</h3>
              {!isAuthenticated ? (
                <p className={styles.loginPrompt}>
                  Please <Link to="/login">sign in</Link> to submit a verified purchase review.
                </p>
              ) : (
                <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
                  <div className={styles.ratingSelect}>
                    <label>Rating:</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                    >
                      <option value={5}>★★★★★ (5/5 Exceptional)</option>
                      <option value={4}>★★★★☆ (4/5 Great)</option>
                      <option value={3}>★★★☆☆ (3/5 Good)</option>
                      <option value={2}>★★☆☆☆ (2/5 Fair)</option>
                      <option value={1}>★☆☆☆☆ (1/5 Poor)</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    placeholder="Review headline (e.g. Best yolks in the city!)"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    required
                    className={styles.inputField}
                  />

                  <textarea
                    placeholder="Share details about shell quality, yolk vibrancy, taste, or delivery..."
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    className={styles.textArea}
                  />

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="btn-primary"
                    style={{ width: '100%' }}
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>

                  {reviewMsg && <p className={styles.reviewFeedback}>{reviewMsg}</p>}
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

