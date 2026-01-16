# I18n Translation System Documentation

## Overview
This is a comprehensive multilingual translation system supporting 4 languages:
- **English (en)** - Default language
- **Kinyarwanda (rw)** - Rwanda's official language
- **Swahili (sw)** - East African language
- **French (fr)** - Francophone regions

## File Structure

```
src/
├── i18n/
│   ├── en.json                 # English translations
│   ├── rw.json                 # Kinyarwanda translations
│   ├── sw.json                 # Swahili translations
│   ├── fr.json                 # French translations
│   ├── i18n.js                 # i18next configuration
│   └── translationHelper.js    # Helper utilities
├── context/
│   └── LanguageContext.jsx     # Language context provider
└── components/
    └── LanguageSwitcher.jsx    # Language selector component
```

## Translation Categories

### 1. App Translations
```json
"app": {
  "title": "Application Title",
  "description": "Application Description",
  "tagline": "Application Tagline"
}
```

### 2. Navigation
```json
"nav": {
  "home": "Home",
  "browse": "Browse Items",
  "postFound": "Post Found Item",
  "postLost": "Post Lost Item",
  "search": "Search",
  "dashboard": "Dashboard",
  "profile": "Profile",
  "logout": "Logout",
  "login": "Login",
  "register": "Register"
}
```

### 3. Common UI Elements
```json
"common": {
  "submit": "Submit",
  "cancel": "Cancel",
  "loading": "Loading...",
  "error": "An error occurred",
  "success": "Success",
  "warning": "Warning",
  "info": "Information",
  "save": "Save",
  "delete": "Delete",
  "edit": "Edit"
}
```

### 4. Authentication
```json
"auth": {
  "login": "Login",
  "register": "Register",
  "email": "Email Address",
  "password": "Password",
  "invalidEmail": "Invalid email address",
  "passwordTooShort": "Password too short"
}
```

### 5. Items Management
```json
"items": {
  "title": "Title",
  "description": "Description",
  "category": "Category",
  "location": "Location",
  "date": "Date",
  "image": "Image",
  "postFoundItem": "Post Found Item",
  "postLostItem": "Post Lost Item",
  "myFoundItems": "My Found Items",
  "myLostItems": "My Lost Items"
}
```

### 6. Search & Filtering
```json
"search": {
  "searchItems": "Search Items",
  "searchPlaceholder": "Search placeholder text",
  "noResultsMessage": "No results message",
  "filters": "Filters",
  "sortBy": "Sort By"
}
```

### 7. Matching System
```json
"matches": {
  "potentialMatches": "Potential Matches",
  "matchedItems": "Matched Items",
  "noMatches": "No matches found",
  "claimItem": "Claim Item"
}
```

### 8. Admin Panel
```json
"admin": {
  "dashboard": "Admin Dashboard",
  "manageUsers": "Manage Users",
  "manageItems": "Manage Items",
  "systemStats": "System Statistics"
}
```

### 9. Police Dashboard
```json
"police": {
  "dashboard": "Police Dashboard",
  "postOfficialDocument": "Post Official Document",
  "manageClaims": "Manage Claims",
  "returnedDocuments": "Returned Documents"
}
```

### 10. Notifications
```json
"notifications": {
  "notifications": "Notifications",
  "noNotifications": "No notifications",
  "newMatch": "New match found",
  "itemClaimed": "Item claimed"
}
```

### 11. User Profile
```json
"profile": {
  "myProfile": "My Profile",
  "editProfile": "Edit Profile",
  "changePassword": "Change Password",
  "personalInfo": "Personal Information"
}
```

### 12. Languages
```json
"language": {
  "selectLanguage": "Select Language",
  "english": "English",
  "kinyarwanda": "Kinyarwanda",
  "swahili": "Swahili",
  "french": "Français"
}
```

### 13. Validation Messages
```json
"validation": {
  "required": "This field is required",
  "invalidEmail": "Invalid email",
  "passwordTooShort": "Password too short",
  "passwordMismatch": "Passwords do not match"
}
```

### 14. System Messages
```json
"messages": {
  "confirming": "Confirming...",
  "processing": "Processing...",
  "savedSuccessfully": "Saved successfully",
  "deletedSuccessfully": "Deleted successfully",
  "updatedSuccessfully": "Updated successfully",
  "operationFailed": "Operation failed"
}
```

## Usage Examples

### In Components with react-i18next

```jsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('app.description')}</p>
      <button>{t('common.submit')}</button>
    </div>
  )
}
```

### With LanguageContext

```jsx
import { useLanguage } from '../context/LanguageContext'

function MyComponent() {
  const { t } = useLanguage()
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <button>{t('common.submit')}</button>
    </div>
  )
}
```

### Using Translation Helper

```jsx
import { useTranslate } from '../i18n/translationHelper'
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  const translations = useTranslate(t)
  
  return (
    <div>
      <h1>{translations.appTitle}</h1>
      <button>{translations.commonSubmit}</button>
    </div>
  )
}
```

## Changing Language

### Using Language Switcher Component
The LanguageSwitcher component provides buttons to switch between languages:

```jsx
<LanguageSwitcher />
```

### Programmatically Change Language

```jsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { i18n } = useTranslation()
  
  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
  }
  
  return (
    <button onClick={() => handleChangeLanguage('rw')}>
      Switch to Kinyarwanda
    </button>
  )
}
```

## Adding New Translations

1. **Update all JSON files** with the new key:
   - `src/i18n/en.json`
   - `src/i18n/rw.json`
   - `src/i18n/sw.json`
   - `src/i18n/fr.json`

2. **Example:**
   ```json
   "myNewKey": {
     "property1": "Value in English",
     "property2": "Value in English"
   }
   ```

3. **Use in component:**
   ```jsx
   <h1>{t('myNewKey.property1')}</h1>
   ```

## Language Persistence

- Selected language is stored in localStorage with key: `language`
- Default language is English if no language is set
- Language preference persists across sessions

## Supported Languages

| Code | Language | Native Name |
|------|----------|-------------|
| en | English | English |
| rw | Kinyarwanda | Icyarwanda |
| sw | Swahili | Kiswahili |
| fr | French | Français |

## Complete Translation Coverage

The system includes comprehensive translations for:
- ✅ Application interface (title, description, tagline)
- ✅ Navigation menu (all menu items and links)
- ✅ Common UI elements (buttons, forms, dialogs)
- ✅ Authentication (login, register, validation)
- ✅ Item management (posting, editing, deleting)
- ✅ Search and filtering functionality
- ✅ Matching algorithm results
- ✅ Admin dashboard
- ✅ Police dashboard
- ✅ Notifications system
- ✅ User profiles
- ✅ Language selection
- ✅ Form validation messages
- ✅ System messages and feedback
- ✅ Footer content

## Best Practices

1. **Always provide fallback values** in case translation keys are missing
2. **Keep translation keys organized** in logical groups
3. **Test all languages** before deployment
4. **Use consistent naming** for translation keys
5. **Document new translation keys** in this file
6. **Keep translations accurate** and culturally appropriate

## Troubleshooting

### Translations not appearing:
- Check if the translation key exists in all language files
- Verify the JSON syntax in language files
- Clear browser cache and localStorage

### Language not changing:
- Check if localStorage is available
- Verify the language code is correct (en, rw, sw, fr)
- Check browser console for errors

### Special characters not displaying:
- Ensure JSON files are saved as UTF-8
- Verify special characters are properly escaped in JSON
