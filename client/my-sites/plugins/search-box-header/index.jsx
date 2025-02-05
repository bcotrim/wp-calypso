import Search from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';

import './style.scss';

const SearchBox = ( { isMobile, doSearch, searchTerm } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const recordSearchEvent = ( eventName ) =>
		dispatch( recordGoogleEvent( 'PluginsBrowser', eventName ) );

	return (
		<div className="search-box-header__searchbox">
			<Search
				pinned={ isMobile }
				fitsContainer={ isMobile }
				onSearch={ doSearch }
				defaultValue={ searchTerm }
				placeholder={ translate( 'Try searching "ecommerce"' ) }
				delaySearch={ true }
				recordEvent={ recordSearchEvent }
			/>
		</div>
	);
};

const PopularSearches = ( props ) => {
	const { searchTerms, siteSlug } = props;
	const translate = useTranslate();

	return (
		<div className="search-box-header__recommended-searches">
			<div className="search-box-header__recommended-searches-title">
				{ translate( 'Most popular searches' ) }
			</div>

			<div className="search-box-header__recommended-searches-list">
				{ searchTerms.map( ( searchTerm, n ) => (
					<a
						href={ `/plugins/${ siteSlug || '' }?s=${ searchTerm }` }
						className="search-box-header__recommended-searches-list-item"
						key={ 'recommended-search-item-' + n }
					>
						{ searchTerm }
					</a>
				) ) }
			</div>
		</div>
	);
};

const SearchHeader = ( props ) => {
	const { doSearch, searchTerm, siteSlug, title, searchTerms } = props;

	return (
		<div className="search-box-header">
			<div className="search-box-header__header">{ title }</div>
			<div className="search-box-header__search">
				<SearchBox doSearch={ doSearch } searchTerm={ searchTerm } />
			</div>
			<PopularSearches siteSlug={ siteSlug } searchTerms={ searchTerms } />
		</div>
	);
};

export default SearchHeader;
