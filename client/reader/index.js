import config from '@automattic/calypso-config';
import page from 'page';
import { addMiddleware } from 'redux-dynamic-middlewares';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	blogListing,
	feedDiscovery,
	feedListing,
	following,
	unreadFollowing,
	incompleteUrlRedirects,
	legacyRedirects,
	prettyRedirects,
	readA8C,
	readFollowingP2,
	sidebar,
	updateLastRoute,
} from './controller';

import './style.scss';

function forceTeamA8C( context, next ) {
	context.params.team = 'a8c';
	next();
}

export async function lazyLoadDependencies() {
	const isBrowser = typeof window === 'object';
	if ( isBrowser && config.isEnabled( 'lasagna' ) && config.isEnabled( 'reader' ) ) {
		const lasagnaMiddleware = await import(
			/* webpackChunkName: "lasagnaMiddleware" */ 'calypso/state/lasagna/middleware.js'
		);
		addMiddleware( lasagnaMiddleware.default );
	}
}

export default async function () {
	await lazyLoadDependencies();

	if ( config.isEnabled( 'reader' ) ) {
		page( '/read', updateLastRoute, sidebar, following, makeLayout, clientRender );
		page(
			'/read/following/unread',
			updateLastRoute,
			sidebar,
			unreadFollowing,
			makeLayout,
			clientRender
		);

		// Old and incomplete paths that should be redirected to /
		page( '/read/following', '/read' );
		page( '/read/blogs', '/read' );
		page( '/read/feeds', '/read' );
		page( '/read/blog', '/read' );
		page( '/read/post', '/read' );
		page( '/read/feed', '/read' );

		// Feed stream
		page( '/read/blog/feed/:feed_id', legacyRedirects );
		page( '/read/feeds/:feed_id/posts', incompleteUrlRedirects );
		page(
			'/read/feeds/:feed_id',
			updateLastRoute,
			prettyRedirects,
			sidebar,
			feedDiscovery,
			feedListing,
			makeLayout,
			clientRender
		);

		// Blog stream
		page( '/read/blog/id/:blog_id', legacyRedirects );
		page( '/read/blogs/:blog_id/posts', incompleteUrlRedirects );
		page(
			'/read/blogs/:blog_id',
			updateLastRoute,
			prettyRedirects,
			sidebar,
			blogListing,
			makeLayout,
			clientRender
		);

		// Old full post view
		page( '/read/post/feed/:feed_id/:post_id', legacyRedirects );
		page( '/read/post/id/:blog_id/:post_id', legacyRedirects );

		// Old Freshly Pressed
		page( '/read/fresh', '/discover' );
	}

	// Automattic Employee Posts
	page( '/read/a8c', updateLastRoute, sidebar, forceTeamA8C, readA8C, makeLayout, clientRender );

	// new P2 Posts
	page( '/read/p2', updateLastRoute, sidebar, readFollowingP2, makeLayout, clientRender );
}
