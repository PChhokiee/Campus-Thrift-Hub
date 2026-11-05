// Plain-JS "types": JSDoc typedefs documenting the shape of every Firestore document.
// Nothing runs here; editors (VS Code) use it for autocomplete hints.

/**
 * @typedef {'available'|'reserved'|'sold'} ListingStatus
 * @typedef {'New'|'Like new'|'Good condition'|'Fair'} Condition
 * @typedef {'like'|'save'|'rating'|'comment'|'message'|'priceDrop'|'sold'|'order'} NotificationType
 * @typedef {'requested'|'accepted'|'declined'|'cancelled'|'completed'} OrderStatus
 *
 * @typedef {Object} UserProfile
 * @property {string} uid
 * @property {string} fullName
 * @property {string} email
 * @property {string} college
 * @property {string} year
 * @property {string} [department]
 * @property {string} [bio]
 * @property {'chat'|'meetup'|'either'} [contactPreference]
 * @property {string|null} [profilePicBase64]
 * @property {'user'|'admin'} role
 * @property {string[]} blockedUids
 * @property {number} ratingAvg
 * @property {number} ratingCount
 * @property {number} completedSales
 * @property {number} upheldReports
 * @property {boolean} trusted
 * @property {Object<string, boolean>} notificationPrefs   // keyed by NotificationType
 * @property {number} createdAt
 *
 * @typedef {Object} Listing
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {Condition} condition
 * @property {number} price                 // 0 = free
 * @property {string} location
 * @property {string[]} images              // base64 strings or URLs
 * @property {ListingStatus} status
 * @property {string} sellerUid
 * @property {string} sellerName
 * @property {boolean} sellerTrusted
 * @property {number} likeCount
 * @property {number} commentCount
 * @property {number} ratingAvg
 * @property {number} ratingCount
 * @property {number} createdAt
 *
 * @typedef {Object} Comment    {id, listingId, authorUid, authorName, text, createdAt}
 * @typedef {Object} Rating     {id, listingId, sellerUid, buyerUid, buyerName, stars, review, createdAt}
 * @typedef {Object} Order      {id, listingId, buyerUid, sellerUid, status, price, meetupPointId, rated, createdAt, updatedAt}
 * @typedef {Object} Chat       {id: `${listingId}_${buyerUid}`, listingId, buyerUid, sellerUid, participants, lastMessage, lastMessageAt, unread}
 * @typedef {Object} ChatMessage {id, senderUid, senderName, text, type: 'text'|'meetup', meetup?, createdAt}
 * @typedef {Object} AppNotification {id, toUid, type, title, body, listingId?, chatId?, read, createdAt}
 * @typedef {Object} Report     {id, targetType: 'listing'|'comment'|'user', targetId, reporterUid, reason, status: 'open'|'upheld'|'dismissed', createdAt}
 */
export {};
