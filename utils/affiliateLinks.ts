import type { RecommendedProduct } from '../types';

/**
 * Builds a properly-encoded, trackable affiliate URL for a RecommendedProduct.
 *
 * Two encoding strategies are supported:
 *  - 'rakuten':  wraps the destination in a Rakuten Advertising (LinkSynergy)
 *                deep link (click.linksynergy.com/deeplink) carrying the
 *                publisher id, merchant id, and any sub/campaign tracking ids.
 *  - 'generic':  appends a `ref` affiliate tag plus standard UTM parameters
 *                directly onto the retailer's own URL.
 *
 * All parameters are encoded via the native URL/URLSearchParams APIs rather
 * than hand-built strings, so values are always safely percent-encoded and
 * existing query parameters on the destination URL are preserved.
 */

const RAKUTEN_DEEPLINK_BASE = 'https://click.linksynergy.com/deeplink';
const DEFAULT_CAMPAIGN = 'recommended-products';

export function buildAffiliateUrl(product: RecommendedProduct): string {
  // Throws on a malformed destination URL — fail loudly during development
  // rather than silently shipping a broken/unencoded link to users.
  const destination = new URL(product.destinationUrl);

  if (destination.protocol !== 'https:') {
    throw new Error(`Recommended product "${product.id}" must use an https destination URL`);
  }

  switch (product.affiliateNetwork) {
    case 'rakuten': {
      if (!product.rakuten) {
        throw new Error(`Recommended product "${product.id}" is missing rakuten affiliate params`);
      }
      const { affiliateId, merchantId, subId, u1 } = product.rakuten;
      const params = new URLSearchParams();
      params.set('id', affiliateId);
      params.set('mid', merchantId);
      if (u1) params.set('u1', u1);
      if (subId) params.set('subid', subId);
      // murl must be encoded as a single query value — URLSearchParams handles this for us.
      params.set('murl', destination.toString());
      return `${RAKUTEN_DEEPLINK_BASE}?${params.toString()}`;
    }

    case 'generic': {
      if (!product.generic?.affiliateTag) {
        throw new Error(`Recommended product "${product.id}" is missing a generic affiliateTag`);
      }
      destination.searchParams.set('ref', product.generic.affiliateTag);
      destination.searchParams.set('utm_source', 'harmony-lifestyle-academy');
      destination.searchParams.set('utm_medium', 'affiliate');
      destination.searchParams.set('utm_campaign', product.generic.campaign ?? DEFAULT_CAMPAIGN);
      return destination.toString();
    }

    default:
      // Exhaustiveness check — new networks must be handled explicitly above.
      throw new Error(`Unsupported affiliate network for product "${product.id}"`);
  }
}

/** Anchor-tag props for an outbound affiliate link: opens safely in a new tab and marks the link as sponsored for search engines. */
export function getAffiliateLinkProps(product: RecommendedProduct) {
  return {
    href: buildAffiliateUrl(product),
    target: '_blank',
    rel: 'sponsored noopener noreferrer',
  } as const;
}
