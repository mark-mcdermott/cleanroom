import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { generateIdFromEntropySize } from 'lucia';
import {
	users,
	demoUsers,
	sessions,
	demoSessions,
	posts,
	demoCategories,
	demoProducts,
	demoCartItems,
	demoOrders,
	demoOrderItems,
	demoTrackerCategories,
	demoTrackerMetrics,
	demoTrackerEntries,
	demoTrackerGoals
} from './schema';
import { hashPassword } from '../password';

async function seed() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		console.error('DATABASE_URL environment variable is required');
		process.exit(1);
	}

	const sql = neon(databaseUrl);
	const db = drizzle(sql);

	const seedUsers = [
		{ email: 'user@mail.com', name: 'Demo User', admin: false },
		{ email: 'admin@mail.com', name: 'Demo Admin', admin: true }
	];

	// Clear and seed main users table
	console.log('Clearing sessions and users tables...');
	await db.delete(sessions);
	await db.delete(users);

	console.log('Seeding users table...');
	for (const user of seedUsers) {
		const id = generateIdFromEntropySize(10);
		const passwordHash = await hashPassword('password');
		await db.insert(users).values({
			id,
			email: user.email,
			passwordHash,
			name: user.name,
			admin: user.admin
		});
		console.log(`  Created ${user.admin ? 'admin' : 'user'}: ${user.email}`);
	}

	// Clear and seed demo users table
	console.log('Clearing demo_sessions and demo_users tables...');
	await db.delete(demoSessions);
	await db.delete(demoUsers);

	console.log('Seeding demo_users table...');
	for (const user of seedUsers) {
		const id = generateIdFromEntropySize(10);
		const passwordHash = await hashPassword('password');
		await db.insert(demoUsers).values({
			id,
			email: user.email,
			passwordHash,
			name: user.name,
			admin: user.admin
		});
		console.log(`  Created ${user.admin ? 'admin' : 'user'}: ${user.email}`);
	}

	// Seed blog posts
	console.log('Clearing posts table...');
	await db.delete(posts);

	console.log('Seeding posts table...');
	const seedPosts = [
		{
			id: generateIdFromEntropySize(10),
			slug: 'hello-world',
			title: 'Hello World',
			excerpt: 'Welcome to our blog! This is our first post introducing what we do.',
			content: `<p>Welcome to our blog! We're excited to share our thoughts, ideas, and updates with you.</p>
<h2>What to Expect</h2>
<p>This blog will cover a variety of topics including:</p>
<ul>
<li>Technology and development best practices</li>
<li>Design trends and user experience insights</li>
<li>Tips and tutorials for getting started</li>
<li>Company updates and announcements</li>
</ul>
<p>We hope you'll find valuable content here. Stay tuned for more posts coming soon!</p>`,
			published: true,
			publishedAt: new Date()
		},
		{
			id: generateIdFromEntropySize(10),
			slug: 'getting-started-guide',
			title: 'Getting Started Guide',
			excerpt: 'Learn how to get the most out of our platform with this comprehensive guide.',
			content: `<p>Getting started is easy! Follow these simple steps to begin your journey.</p>
<h2>Step 1: Create an Account</h2>
<p>Sign up for a free account using your email address. You'll receive a confirmation email to verify your account.</p>
<h2>Step 2: Explore the Dashboard</h2>
<p>Once logged in, take some time to explore the dashboard. You'll find all the tools you need to get started.</p>
<h2>Step 3: Start Creating</h2>
<p>Now you're ready to start creating! Use our intuitive interface to build amazing things.</p>
<blockquote>Pro tip: Check out our documentation for more detailed guides and tutorials.</blockquote>`,
			published: true,
			publishedAt: new Date(Date.now() - 86400000) // Yesterday
		},
		{
			id: generateIdFromEntropySize(10),
			slug: 'best-practices-2025',
			title: 'Best Practices for 2025',
			excerpt: 'Stay ahead of the curve with these essential best practices for the new year.',
			content: `<p>As we move into 2025, here are some best practices to keep in mind for building modern applications.</p>
<h2>Performance First</h2>
<p>User experience starts with performance. Optimize your assets, use lazy loading, and minimize bundle sizes.</p>
<h2>Accessibility Matters</h2>
<p>Build inclusive applications that everyone can use. Follow WCAG guidelines and test with screen readers.</p>
<h2>Security by Default</h2>
<p>Don't treat security as an afterthought. Implement proper authentication, validate inputs, and keep dependencies updated.</p>
<h2>Ship Incrementally</h2>
<p>Smaller, more frequent releases reduce risk and allow for faster feedback loops.</p>`,
			published: true,
			publishedAt: new Date(Date.now() - 172800000) // 2 days ago
		}
	];

	for (const post of seedPosts) {
		await db.insert(posts).values(post);
		console.log(`  Created post: ${post.title}`);
	}

	// Seed store data
	console.log('Clearing store tables...');
	await db.delete(demoOrderItems);
	await db.delete(demoOrders);
	await db.delete(demoCartItems);
	await db.delete(demoProducts);
	await db.delete(demoCategories);

	console.log('Seeding store categories...');
	const seedCategories = [
		{
			id: 'cat-tshirts',
			name: 'T-Shirts',
			slug: 't-shirts',
			description: 'Comfortable and stylish t-shirts',
			image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'
		},
		{
			id: 'cat-hoodies',
			name: 'Hoodies',
			slug: 'hoodies',
			description: 'Cozy hoodies for any occasion',
			image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop'
		},
		{
			id: 'cat-accessories',
			name: 'Accessories',
			slug: 'accessories',
			description: 'Hats, bags, and more',
			image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop'
		}
	];

	for (const cat of seedCategories) {
		await db.insert(demoCategories).values(cat);
		console.log(`  Created category: ${cat.name}`);
	}

	console.log('Seeding store products...');
	const seedProducts = [
		{
			id: 'prod-1',
			name: 'Classic Black Tee',
			slug: 'classic-black-tee',
			description: 'A timeless black t-shirt made from 100% organic cotton. Perfect for everyday wear.',
			price: '2999',
			compareAtPrice: null,
			image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
			categoryId: 'cat-tshirts',
			inventory: '50',
			published: true,
			featured: true
		},
		{
			id: 'prod-2',
			name: 'Vintage White Tee',
			slug: 'vintage-white-tee',
			description: 'A soft, vintage-style white t-shirt with a relaxed fit.',
			price: '2499',
			compareAtPrice: '3499',
			image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&h=800&fit=crop',
			categoryId: 'cat-tshirts',
			inventory: '25',
			published: true,
			featured: false
		},
		{
			id: 'prod-3',
			name: 'Navy Blue Tee',
			slug: 'navy-blue-tee',
			description: 'Classic navy blue t-shirt with a modern cut.',
			price: '2799',
			compareAtPrice: null,
			image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=800&fit=crop',
			categoryId: 'cat-tshirts',
			inventory: '0',
			published: true,
			featured: false
		},
		{
			id: 'prod-4',
			name: 'Premium Zip Hoodie',
			slug: 'premium-zip-hoodie',
			description: 'A premium zip-up hoodie with a soft fleece interior. Perfect for chilly days.',
			price: '6999',
			compareAtPrice: null,
			image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
			categoryId: 'cat-hoodies',
			inventory: '30',
			published: true,
			featured: true
		},
		{
			id: 'prod-5',
			name: 'Pullover Hoodie',
			slug: 'pullover-hoodie',
			description: 'Cozy pullover hoodie with kangaroo pocket.',
			price: '5499',
			compareAtPrice: '6499',
			image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=800&fit=crop',
			categoryId: 'cat-hoodies',
			inventory: '15',
			published: true,
			featured: false
		},
		{
			id: 'prod-6',
			name: 'Classic Snapback Cap',
			slug: 'classic-snapback-cap',
			description: 'Adjustable snapback cap with embroidered logo.',
			price: '2499',
			compareAtPrice: null,
			image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=800&fit=crop',
			categoryId: 'cat-accessories',
			inventory: '100',
			published: true,
			featured: false
		},
		{
			id: 'prod-7',
			name: 'Canvas Tote Bag',
			slug: 'canvas-tote-bag',
			description: 'Durable canvas tote bag, perfect for shopping or everyday use.',
			price: '1999',
			compareAtPrice: null,
			image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&h=800&fit=crop',
			categoryId: 'cat-accessories',
			inventory: '75',
			published: true,
			featured: false
		},
		{
			id: 'prod-8',
			name: 'Limited Edition Tee',
			slug: 'limited-edition-tee',
			description: 'Limited edition graphic tee. Get yours before they are gone!',
			price: '3999',
			compareAtPrice: null,
			image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=800&fit=crop',
			categoryId: 'cat-tshirts',
			inventory: '10',
			published: true,
			featured: true
		}
	];

	for (const prod of seedProducts) {
		await db.insert(demoProducts).values(prod);
		console.log(`  Created product: ${prod.name}`);
	}

	// Seed tracker data
	console.log('Clearing tracker tables...');
	await db.delete(demoTrackerGoals);
	await db.delete(demoTrackerEntries);
	await db.delete(demoTrackerMetrics);
	await db.delete(demoTrackerCategories);

	console.log('Seeding tracker categories...');
	const trackerCategories = [
		{ id: 'cat-exercise', name: 'Exercise', slug: 'exercise', description: 'Track your physical activity', icon: '🏃', color: '#10b981', sortOrder: '1' },
		{ id: 'cat-diet', name: 'Diet', slug: 'diet', description: 'Monitor your nutrition', icon: '🥗', color: '#f59e0b', sortOrder: '2' },
		{ id: 'cat-sleep', name: 'Sleep', slug: 'sleep', description: 'Track your sleep patterns', icon: '😴', color: '#8b5cf6', sortOrder: '3' },
		{ id: 'cat-mood', name: 'Mood', slug: 'mood', description: 'Monitor your emotional wellbeing', icon: '😊', color: '#ec4899', sortOrder: '4' },
		{ id: 'cat-health', name: 'Health', slug: 'health', description: 'Track health metrics', icon: '❤️', color: '#ef4444', sortOrder: '5' }
	];

	for (const cat of trackerCategories) {
		await db.insert(demoTrackerCategories).values(cat);
		console.log(`  Created tracker category: ${cat.name}`);
	}

	console.log('Seeding tracker metrics...');
	const trackerMetrics = [
		// Exercise
		{ id: 'metric-steps', categoryId: 'cat-exercise', name: 'Steps', slug: 'steps', unit: 'steps', valueType: 'number', icon: '👟', color: '#10b981', sortOrder: '1' },
		{ id: 'metric-workout', categoryId: 'cat-exercise', name: 'Workout Duration', slug: 'workout-duration', unit: 'min', valueType: 'number', icon: '💪', color: '#10b981', sortOrder: '2' },
		{ id: 'metric-calories-burned', categoryId: 'cat-exercise', name: 'Calories Burned', slug: 'calories-burned', unit: 'cal', valueType: 'number', icon: '🔥', color: '#10b981', sortOrder: '3' },
		// Diet
		{ id: 'metric-calories', categoryId: 'cat-diet', name: 'Calories', slug: 'calories', unit: 'cal', valueType: 'number', icon: '🍎', color: '#f59e0b', sortOrder: '1' },
		{ id: 'metric-water', categoryId: 'cat-diet', name: 'Water', slug: 'water', unit: 'glasses', valueType: 'number', icon: '💧', color: '#3b82f6', sortOrder: '2' },
		{ id: 'metric-protein', categoryId: 'cat-diet', name: 'Protein', slug: 'protein', unit: 'g', valueType: 'number', icon: '🥩', color: '#f59e0b', sortOrder: '3' },
		// Sleep
		{ id: 'metric-sleep-hours', categoryId: 'cat-sleep', name: 'Hours of Sleep', slug: 'sleep-hours', unit: 'hrs', valueType: 'number', icon: '🛏️', color: '#8b5cf6', sortOrder: '1' },
		{ id: 'metric-sleep-quality', categoryId: 'cat-sleep', name: 'Sleep Quality', slug: 'sleep-quality', unit: '/5', valueType: 'rating', icon: '⭐', color: '#8b5cf6', sortOrder: '2' },
		// Mood
		{ id: 'metric-mood', categoryId: 'cat-mood', name: 'Mood', slug: 'mood', unit: '/5', valueType: 'rating', icon: '😊', color: '#ec4899', sortOrder: '1' },
		{ id: 'metric-stress', categoryId: 'cat-mood', name: 'Stress Level', slug: 'stress', unit: '/5', valueType: 'rating', icon: '😰', color: '#ec4899', sortOrder: '2' },
		// Health
		{ id: 'metric-weight', categoryId: 'cat-health', name: 'Weight', slug: 'weight', unit: 'lbs', valueType: 'number', icon: '⚖️', color: '#ef4444', sortOrder: '1' },
		{ id: 'metric-blood-pressure', categoryId: 'cat-health', name: 'Blood Pressure', slug: 'blood-pressure', unit: 'mmHg', valueType: 'text', icon: '🩺', color: '#ef4444', sortOrder: '2' }
	];

	for (const metric of trackerMetrics) {
		await db.insert(demoTrackerMetrics).values(metric);
		console.log(`  Created tracker metric: ${metric.name}`);
	}

	console.log('Seeding tracker goals...');
	const trackerGoals = [
		{ id: 'goal-steps', metricId: 'metric-steps', targetValue: '10000', targetType: 'daily', comparison: 'gte' },
		{ id: 'goal-water', metricId: 'metric-water', targetValue: '8', targetType: 'daily', comparison: 'gte' },
		{ id: 'goal-sleep', metricId: 'metric-sleep-hours', targetValue: '8', targetType: 'daily', comparison: 'gte' },
		{ id: 'goal-workout', metricId: 'metric-workout', targetValue: '30', targetType: 'daily', comparison: 'gte' }
	];

	for (const goal of trackerGoals) {
		await db.insert(demoTrackerGoals).values(goal);
		console.log(`  Created tracker goal for: ${goal.metricId}`);
	}

	console.log('Seeding tracker entries...');
	const now = new Date();
	const yesterday = new Date(now);
	yesterday.setDate(yesterday.getDate() - 1);
	yesterday.setHours(8, 0, 0, 0);
	const twoDaysAgo = new Date(now);
	twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
	twoDaysAgo.setHours(9, 0, 0, 0);
	const today = new Date(now);
	today.setHours(7, 30, 0, 0);

	const trackerEntries = [
		// Yesterday
		{ id: generateIdFromEntropySize(10), metricId: 'metric-steps', value: '8500', date: yesterday },
		{ id: generateIdFromEntropySize(10), metricId: 'metric-water', value: '7', date: yesterday },
		{ id: generateIdFromEntropySize(10), metricId: 'metric-sleep-hours', value: '7.5', date: yesterday },
		{ id: generateIdFromEntropySize(10), metricId: 'metric-mood', value: '4', date: yesterday },
		// Two days ago
		{ id: generateIdFromEntropySize(10), metricId: 'metric-steps', value: '12000', date: twoDaysAgo },
		{ id: generateIdFromEntropySize(10), metricId: 'metric-workout', value: '45', date: twoDaysAgo },
		{ id: generateIdFromEntropySize(10), metricId: 'metric-water', value: '8', date: twoDaysAgo },
		{ id: generateIdFromEntropySize(10), metricId: 'metric-sleep-hours', value: '8', date: twoDaysAgo },
		// Today
		{ id: generateIdFromEntropySize(10), metricId: 'metric-sleep-hours', value: '7', date: today },
		{ id: generateIdFromEntropySize(10), metricId: 'metric-mood', value: '4', notes: 'Feeling good!', date: today }
	];

	for (const entry of trackerEntries) {
		await db.insert(demoTrackerEntries).values(entry);
	}
	console.log(`  Created ${trackerEntries.length} tracker entries`);

	console.log('\nSeeding complete!');
	console.log('Login: user@mail.com / password');
	console.log('Admin: admin@mail.com / password');
}

seed().catch((error) => {
	console.error('Seeding failed:', error);
	process.exit(1);
});
