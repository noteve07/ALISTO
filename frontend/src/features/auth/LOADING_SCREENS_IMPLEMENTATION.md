# Loading Screens Implementation

## Overview
Modern loading screens have been implemented for the authentication flow to provide better user experience during transitions.

## Loading Flow

### Login Flow
1. **User enters credentials** → Login form
2. **Clicks "Sign In"** → `AuthLoadingScreen` (1 second + profile check time)
3. **Profile check completed** → Two paths:
   - **Location disabled**: Shows `LocationStepPage`
   - **Location enabled**: Shows `DashboardLoadingScreen` (2 seconds) → Dashboard

4. **After location setup/skip** → `DashboardLoadingScreen` (2 seconds) → Dashboard

### Signup Flow
1. **User fills signup form** → Signup form
2. **Clicks "Sign Up"** → `AuthLoadingScreen` (1 second + profile update time)
3. **Profile updated** → Shows `LocationStepPage`
4. **After location setup/skip** → `DashboardLoadingScreen` (2 seconds) → Dashboard

## Components

### AuthLoadingScreen
**Location**: `frontend/src/features/auth/components/AuthLoadingScreen.jsx`

**Purpose**: Loading screen shown during authentication processes (login/signup)

**Features**:
- ALISTO branding with animated logo
- Rotating ring spinner with pulsing center
- Customizable message via props
- Bouncing loading dots animation
- Clean white background

**Props**:
- `message` (string): The loading message to display
  - Default for login: "Signing you in..."
  - Default for signup: "Setting up your account..."

**Animations**:
- Logo: Scale-in animation (scaleIn)
- Spinner ring: 1s continuous rotation (spin)
- Center dot: Pulsing animation (pulse)
- Loading dots: Bouncing with staggered delays (bounce)

### DashboardLoadingScreen
**Location**: `frontend/src/features/auth/components/DashboardLoadingScreen.jsx`

**Purpose**: Loading screen shown before redirecting to dashboard

**Features**:
- Gradient background matching brand colors (primary-v2 → primary)
- Floating orbs with different animation speeds
- Triple rotating rings (different speeds for depth effect)
- Home icon in center
- Animated progress bar
- Customizable message via props

**Props**:
- `message` (string): The loading message to display
  - Default: "Preparing your dashboard..."

**Animations**:
- Orbs: Floating animation at 6s and 8s speeds (float)
- Outer ring: 2s rotation (spin)
- Middle ring: 1.5s rotation (spin)
- Inner ring: 1s rotation (spin)
- Center icon: Pulsing animation (pulse)
- Progress bar: 2s slide from 0% to 100% (slideProgress)

## Updated Files

### LoginPage.jsx
- Added state management for loading screens
- Shows `AuthLoadingScreen` after successful login
- Shows `DashboardLoadingScreen` before dashboard navigation
- Includes 1-second delay during auth process for better UX
- 2-second dashboard loading before navigation

### SignupPage.jsx
- Added state management for loading screens
- Shows `AuthLoadingScreen` after successful signup
- Shows `DashboardLoadingScreen` before dashboard navigation
- Includes 1-second delay during auth process for better UX
- 2-second dashboard loading before navigation

### animations.css
New keyframe animations added:
- `spin`: 360-degree rotation for spinner rings
- `bounce`: Vertical bounce animation for loading dots
- `slideProgress`: Progress bar animation from 0% to 100% width

## Timing Details

### Auth Loading Phase
- **Duration**: 1 second minimum + actual API call time
- **Purpose**: Provides visual feedback during authentication
- **User sees**: Rotating spinner and loading message

### Dashboard Loading Phase
- **Duration**: Exactly 2 seconds
- **Purpose**: Smooth transition to dashboard with branded loading screen
- **User sees**: Rotating rings, progress bar, and dashboard message

## Error Handling
- Loading screens are hidden if authentication fails
- Error messages are displayed in the auth forms
- Auth loading state is properly reset on errors
- No loading screen shown if validation fails

## Best Practices
1. **Consistent timing**: All dashboard loading screens show for exactly 2 seconds
2. **Clear messaging**: Different messages for login vs signup vs dashboard loading
3. **Smooth transitions**: Loading screens replace current view completely (no overlays)
4. **Error recovery**: Loading states are properly cleared on errors
5. **User feedback**: Always show visual feedback during async operations

## Testing Checklist
- [ ] Login with valid credentials shows auth loading
- [ ] Login with location disabled shows location step → dashboard loading
- [ ] Login with location enabled shows auth loading → dashboard loading → dashboard
- [ ] Signup shows auth loading → location step → dashboard loading → dashboard
- [ ] Location skip shows dashboard loading before redirect
- [ ] Location set shows dashboard loading before redirect
- [ ] Invalid credentials don't show loading screens
- [ ] Form validation errors don't show loading screens
- [ ] Loading screens properly clear on errors

## Future Enhancements
- Add skeleton screens for dashboard content
- Implement loading progress indicators for file uploads
- Add loading states for other async operations
- Consider adding transition animations between screens
