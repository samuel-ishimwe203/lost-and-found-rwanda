// Translation helper utility
export const getTranslation = (t, key, defaultValue = '') => {
  const translation = t(key)
  return translation !== key ? translation : defaultValue || key
}

export const useTranslate = (t) => {
  return {
    // App translations
    appTitle: getTranslation(t, 'app.title'),
    appDescription: getTranslation(t, 'app.description'),
    
    // Navigation
    navHome: getTranslation(t, 'nav.home'),
    navBrowse: getTranslation(t, 'nav.browse'),
    navPostFound: getTranslation(t, 'nav.postFound'),
    navPostLost: getTranslation(t, 'nav.postLost'),
    navSearch: getTranslation(t, 'nav.search'),
    navDashboard: getTranslation(t, 'nav.dashboard'),
    navProfile: getTranslation(t, 'nav.profile'),
    navLogout: getTranslation(t, 'nav.logout'),
    navLogin: getTranslation(t, 'nav.login'),
    navRegister: getTranslation(t, 'nav.register'),
    
    // Common
    commonSubmit: getTranslation(t, 'common.submit'),
    commonCancel: getTranslation(t, 'common.cancel'),
    commonLoading: getTranslation(t, 'common.loading'),
    commonError: getTranslation(t, 'common.error'),
    commonSuccess: getTranslation(t, 'common.success'),
    commonSave: getTranslation(t, 'common.save'),
    commonDelete: getTranslation(t, 'common.delete'),
    commonEdit: getTranslation(t, 'common.edit'),
    
    // Items
    itemsTitle: getTranslation(t, 'items.title'),
    itemsDescription: getTranslation(t, 'items.description'),
    itemsCategory: getTranslation(t, 'items.category'),
    itemsLocation: getTranslation(t, 'items.location'),
    itemsDate: getTranslation(t, 'items.date'),
    itemsImage: getTranslation(t, 'items.image'),
    itemsPostFoundItem: getTranslation(t, 'items.postFoundItem'),
    itemsPostLostItem: getTranslation(t, 'items.postLostItem'),
    itemsMyFoundItems: getTranslation(t, 'items.myFoundItems'),
    itemsMyLostItems: getTranslation(t, 'items.myLostItems'),
    itemsBrowseItems: getTranslation(t, 'items.browseItems'),
    
    // Auth
    authLogin: getTranslation(t, 'auth.login'),
    authRegister: getTranslation(t, 'auth.register'),
    authEmail: getTranslation(t, 'auth.email'),
    authPassword: getTranslation(t, 'auth.password'),
    authConfirmPassword: getTranslation(t, 'auth.confirmPassword'),
    
    // Dashboard
    dashboardWelcome: getTranslation(t, 'dashboard.welcome'),
    dashboardMyItems: getTranslation(t, 'dashboard.myItems'),
    
    // Search
    searchSearchItems: getTranslation(t, 'search.searchItems'),
    searchNoResultsMessage: getTranslation(t, 'search.noResultsMessage'),
    
    // Matches
    matchesPotentialMatches: getTranslation(t, 'matches.potentialMatches'),
    matchesNoMatches: getTranslation(t, 'matches.noMatches'),
    
    // Admin
    adminDashboard: getTranslation(t, 'admin.dashboard'),
    adminManageUsers: getTranslation(t, 'admin.manageUsers'),
    adminManageItems: getTranslation(t, 'admin.manageItems'),
    
    // Messages
    messagesConfirming: getTranslation(t, 'messages.confirming'),
    messagesSavedSuccessfully: getTranslation(t, 'messages.savedSuccessfully'),
    messagesDeletedSuccessfully: getTranslation(t, 'messages.deletedSuccessfully'),
    messagesUpdatedSuccessfully: getTranslation(t, 'messages.updatedSuccessfully'),
    
    // Validation
    validationRequired: getTranslation(t, 'validation.required'),
    validationInvalidEmail: getTranslation(t, 'validation.invalidEmail'),
    validationPasswordTooShort: getTranslation(t, 'validation.passwordTooShort')
  }
}
