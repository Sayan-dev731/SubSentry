# SubSentry Frontend

A clean, professional static frontend for the SubSentry subscription management API.

## 🎨 Design Philosophy

The frontend follows a minimalist, enterprise-grade design language inspired by:
- Microsoft's Fluent Design System
- Webflow's clean interface
- Modern SaaS applications

**Key Design Principles:**
- Clean, professional aesthetics
- Generous whitespace
- Clear typography hierarchy
- Subtle interactions
- Professional color palette
- Responsive layout

## 📁 File Structure

```
public/
├── index.html              # Login/Register page
├── dashboard.html          # Main dashboard with subscriptions table
├── subscription-form.html  # Add/Edit subscription form
├── styles.css              # Global styles
└── main.js                 # Frontend JavaScript logic
```

## ✨ Features

### Authentication
- **Login Form** - Sign in with email and password
- **Registration Form** - Create a new account
- **Tab Switching** - Toggle between login and register
- **Token Storage** - JWT tokens stored in localStorage
- **Auto-redirect** - Redirects to dashboard after successful auth

### Dashboard
- **Statistics Cards** - Overview of subscriptions, costs, and renewals
- **Subscriptions Table** - Clean table with all user subscriptions
- **Real-time Data** - Fetches data from API on load
- **Actions** - Edit and delete subscriptions inline
- **Empty State** - Helpful message when no subscriptions exist
- **Loading State** - Spinner while fetching data

### Subscription Management
- **Add Subscription** - Form to create new subscriptions
- **Edit Subscription** - Pre-populated form for updates
- **Validation** - Client-side and server-side validation
- **Date Picker** - Native date input for renewal dates
- **Currency Input** - Formatted cost input with $ prefix
- **Reminder Days** - Configure reminder offset (0-30 days)

## 🚀 Getting Started

### Prerequisites
- SubSentry API server running on `http://localhost:3000`
- MongoDB connected and operational

### Access the Frontend

1. **Start the API server:**
   ```bash
   npm run dev
   ```

2. **Open in browser:**
   ```
   http://localhost:3000
   ```

3. **Create an account:**
   - Click "Sign Up" tab
   - Enter email and password
   - Click "Create Account"

4. **Add subscriptions:**
   - Click "Add Subscription" button
   - Fill in service details
   - Save and view in dashboard

## 🎨 Design System

### Color Palette
- **Primary:** `#0066FF` - Used for CTAs and interactive elements
- **Secondary:** `#6B7280` - Used for secondary actions
- **Success:** `#10B981` - Success messages
- **Danger:** `#EF4444` - Error messages, destructive actions
- **Neutrals:** Gray scale from `#F9FAFB` to `#111827`

### Typography
- **Font Family:** System fonts (-apple-system, Segoe UI, Roboto)
- **Headings:** 600 weight, sizes from 1.25rem to 2.5rem
- **Body:** 1rem, 1.5 line-height
- **Small Text:** 0.875rem for hints and secondary info

### Spacing Scale
- **xs:** 0.25rem (4px)
- **sm:** 0.5rem (8px)
- **md:** 1rem (16px)
- **lg:** 1.5rem (24px)
- **xl:** 2rem (32px)
- **2xl:** 3rem (48px)

### Components
- **Buttons:** Medium-sized with 0.625rem padding, rounded corners
- **Forms:** Clean inputs with focus states and validation
- **Cards:** White background with subtle border and shadow
- **Tables:** Hover states, clean borders, responsive

## 📱 Responsive Design

The frontend is fully responsive with breakpoints at:
- **Mobile:** < 480px (single column, stacked forms)
- **Tablet:** < 768px (simplified stats grid)
- **Desktop:** ≥ 768px (full layout)

### Mobile Optimizations
- Single-column stat cards
- Simplified navigation
- Touch-friendly buttons
- Stacked form fields
- Responsive table design

## 🔒 Security Features

- **JWT Authentication** - Token-based auth with localStorage
- **Auto-logout** - Redirects to login if token is invalid
- **XSS Protection** - HTML escaping for user-generated content
- **HTTPS Ready** - Works with secure connections
- **Token Expiry** - Handles expired tokens gracefully

## 🎯 User Flow

1. **Landing Page** (index.html)
   - User sees login/register form
   - Can toggle between forms with tabs
   - Submits credentials
   - Redirected to dashboard on success

2. **Dashboard** (dashboard.html)
   - User sees stats overview
   - Views all subscriptions in table
   - Can add, edit, or delete subscriptions
   - Can sign out

3. **Add/Edit Subscription** (subscription-form.html)
   - User fills in service details
   - Submits form
   - Redirected back to dashboard
   - Sees updated subscription list

## 🛠️ Technical Details

### API Integration
- Base URL: `http://localhost:3000/api`
- Authentication: Bearer token in Authorization header
- All API calls use `fetch()` with error handling
- Responses handled as JSON

### State Management
- **localStorage** for token and user data
- **DOM manipulation** for dynamic content
- **No frameworks** - Pure vanilla JavaScript
- **Event delegation** for dynamic elements

### Error Handling
- API errors displayed in UI with error messages
- Network errors caught and displayed
- Validation errors shown inline
- 401 errors trigger auto-logout

## 🎭 Animations & Interactions

- **Transitions:** 150-250ms cubic-bezier easing
- **Button States:** Hover, active, disabled, loading
- **Loading Spinners:** Smooth rotation animation
- **Form Focus:** Blue ring with shadow
- **Table Hover:** Subtle background change

## 🧪 Testing

### Manual Testing Checklist
- [ ] Register new user
- [ ] Login with credentials
- [ ] View empty state
- [ ] Add first subscription
- [ ] View subscription in table
- [ ] Edit subscription
- [ ] Delete subscription
- [ ] View statistics update
- [ ] Logout and login again
- [ ] Test on mobile device

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📝 Customization

### Changing Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --color-primary: #0066FF;  /* Change primary color */
    --color-secondary: #6B7280; /* Change secondary color */
}
```

### Changing API URL
Edit `main.js`:
```javascript
const API_BASE_URL = 'https://your-api.com/api';
```

### Adding Features
1. Add HTML structure to appropriate page
2. Add styles to `styles.css`
3. Add JavaScript logic to `main.js`
4. Wire up event listeners

## 🐛 Troubleshooting

### Login not working
- Check API server is running
- Check browser console for errors
- Verify API_BASE_URL in main.js
- Check CORS is enabled on server

### Subscriptions not loading
- Check authentication token is valid
- Verify API endpoints are working
- Check MongoDB connection
- Clear localStorage and login again

### Styles not loading
- Verify `styles.css` path is correct
- Check browser cache (Ctrl+Shift+R)
- Verify Express static middleware is configured

## 🚀 Deployment

### Production Build
1. Update `API_BASE_URL` in `main.js` to production URL
2. Ensure HTTPS is used for secure connections
3. Enable production mode in Express
4. Configure CORS for production domain

### Hosting Options
- **Static hosting:** Netlify, Vercel, GitHub Pages
- **With API:** Same server as backend
- **CDN:** CloudFlare, AWS CloudFront

## 📚 Resources

- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Tricks](https://css-tricks.com/)
- [Fetch API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## 🎉 Future Enhancements

- [ ] Dark mode toggle
- [ ] Data visualization (charts)
- [ ] Search and filter subscriptions
- [ ] Bulk operations
- [ ] Export to CSV
- [ ] Notification preferences
- [ ] Profile settings page
- [ ] Password reset flow

---

**Built with ❤️ using vanilla HTML, CSS, and JavaScript**
