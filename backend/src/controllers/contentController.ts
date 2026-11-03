import { Request, Response, NextFunction } from 'express';
import { Content, Newsletter } from '../models/Content.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class ContentController {
  static async getHomeContent(_req: Request, res: Response, next: NextFunction) {
    try {
      const contents = await Content.find({});
      const contentMap: Record<string, any> = {};
      contents.forEach((c) => {
        contentMap[c.key] = c.data;
      });

      // Provide rich defaults matching the reference requirements if not yet seeded
      const defaults = {
        announcement: {
          message: 'Farm-fresh morning dispatch! Free doorstep delivery on orders above ₹499.',
          highlight: 'Order before 9 PM for tomorrow morning breakfast.',
        },
        hero: {
          headline: 'GOOD EGGS.\nBETTER MORNINGS.',
          subheadline:
            'Ethically gathered from pasture-raised hens roaming free under open skies. Rich golden yolks delivered to your kitchen before sunrise.',
          badge: '100% Certified Pasture Raised',
          ctaPrimary: 'Pick Your Pack',
          ctaSecondary: 'Our Farm Story',
        },
        eggComparison: {
          title: 'TWO SHELLS. SAME GOOD EGG.',
          subtitle: 'Whether you prefer rustic deep brown or porcelain white, every GoodEgg shares the same nutrient-dense golden yolk.',
          varieties: [
            {
              name: 'Pasture-Raised Brown',
              shellColor: 'Rich Amber Brown',
              henBreed: 'Rhode Island Red & Heritage Plymouth Rock',
              yolkColorIndex: '14 / 15 Deep Marigold',
              proteinPerEgg: '6.5g',
              omega3: '240mg',
              diet: 'Pasture bugs, wildflowers, non-GMO grains',
              description: 'Hearty shells, velvety whites, and a decadent buttery flavor profile ideal for sunny-side-ups and soft boiling.',
            },
            {
              name: 'Pasture-Raised Classic White',
              shellColor: 'Porcelain Clean White',
              henBreed: 'White Leghorn Free-Range Hens',
              yolkColorIndex: '13 / 15 Vibrant Golden',
              proteinPerEgg: '6.3g',
              omega3: '215mg',
              diet: 'Open field foraging + organic flaxseed grain',
              description: 'Delicate crisp shell with high albumen elasticity, providing unmatched fluffiness for soufflés, omelets, and baking.',
            },
          ],
        },
        packaging: {
          title: 'PLASTIC-FREE CRADLES FOR FRESHNESS',
          subtitle: 'Our bespoke cartons are engineered from 100% biodegradable moulded wood pulp.',
          features: [
            {
              title: 'Shock-Absorbent Nesting',
              desc: 'Contoured honeycomb pockets absorb kinetic shocks during transport to deliver zero crack integrity.',
            },
            {
              title: 'Breathable Micro-Climate',
              desc: 'Natural wood fibers allow optimal moisture exchange, preserving natural cuticle bloom and shelf life.',
            },
            {
              title: 'Zero Waste Commitment',
              desc: 'Cartons decompose naturally in home compost within 90 days. Return them to your morning delivery partner for recycling!',
            },
          ],
        },
        farmStory: {
          title: 'SUNLIGHT, CLOVER & ETHICAL STEWARDSHIP',
          subtitle: '108 Square Feet Of Freedom For Every Single Hen',
          body: 'We founded GoodEggs with a simple promise: hens treated with kindness lay better eggs. Our partner family farms ensure every bird enjoys sprawling green pastures, shade under fruit orchards, dust baths in the soil, and clean spring water. No cages, no hormones, no compromises.',
          stats: [
            { label: 'Pasture Space', value: '108+ sq ft/hen' },
            { label: 'Farm-to-Door Time', value: '< 24 Hours' },
            { label: 'Organic Feed', value: '100% Non-GMO' },
            { label: 'Happy Hens', value: '15,000+' },
          ],
        },
        faqs: [
          {
            q: 'How fresh are GoodEggs when they arrive at my door?',
            a: 'All eggs are gathered at dawn from our family farms, inspected for shell integrity, packed in temperature-monitored crates, and delivered to your doorstep within 24 to 36 hours of laying.',
          },
          {
            q: 'Why are your yolks so much deeper in color?',
            a: 'Pasture-raised hens roam freely outdoors, eating green grasses, clovers, seeds, and insects rich in natural carotenoids, beta-carotene, and lutein. This creates that rich, vibrant deep-amber yolk.',
          },
          {
            q: 'Are your egg cartons recyclable?',
            a: 'Yes, 100%! Our cartons are pressed from post-consumer recycled paper and natural wood pulp without chemical dyes. You can compost them at home or hand them back to our delivery rider.',
          },
          {
            q: 'Do you deliver every morning?',
            a: 'Yes, we operate 7 days a week. Place your order before 9:00 PM for scheduled doorstep delivery between 6:00 AM and 8:30 AM the next morning.',
          },
        ],
        testimonials: [
          {
            name: 'Ananya Sharma',
            role: 'Pastry Chef & Food Writer',
            comment: 'The yolk vibrancy and whites elasticity make a night-and-day difference in my baking. GoodEggs is now the only egg brand in my kitchen.',
            rating: 5,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          },
          {
            name: 'Vikram Mehta',
            role: 'Fitness Coach & Athlete',
            comment: '6.5g of pure protein per egg with higher Omega-3 and zero fishy smell. The morning delivery before my 6 AM workout is unbeatable.',
            rating: 5,
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          },
          {
            name: 'Pooja Iyer',
            role: 'Mother of Two',
            comment: 'Knowing exactly where our eggs come from gives me complete peace of mind. The kids love the custom carton packs!',
            rating: 5,
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
          },
        ],
      };

      return ApiResponse.success(res, { ...defaults, ...contentMap });
    } catch (err) {
      next(err);
    }
  }

  static async subscribeNewsletter(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email || !email.includes('@')) {
        return next(ApiError.badRequest('Valid email address is required'));
      }

      await Newsletter.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        { isActive: true },
        { upsert: true, new: true }
      );

      return ApiResponse.success(
        res,
        null,
        'Thank you for subscribing to our morning dispatch!'
      );
    } catch (err) {
      next(err);
    }
  }
}

