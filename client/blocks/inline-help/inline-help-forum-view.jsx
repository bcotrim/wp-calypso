import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import './inline-help-forum-view.scss';

const trackForumOpen = () =>
	recordTracksEvent( 'calypso_inlinehelp_forums_open', {
		location: 'inline-help-popover',
	} );

const InlineHelpForumView = () => {
	const translate = useTranslate();

	return (
		<div className="inline-help__forum-view">
			<h2 className="inline-help__view-heading">
				{ preventWidows( translate( 'Ask the Community for Help' ) ) }
			</h2>
			<p>
				{ preventWidows(
					translate(
						'Use this link to post a question in our {{strong}}public forums{{/strong}}, ' +
							'where thousands of WordPress.com members around the world ' +
							'can offer their expertise and advice.',
						{
							components: {
								strong: <strong />,
							},
						}
					)
				) }
			</p>
			<Button
				href={ localizeUrl( 'https://en.forums.wordpress.com/' ) }
				target="_blank"
				rel="noopener noreferrer"
				primary
				onClick={ trackForumOpen }
			>
				{ translate( 'Go to the Support Forums' ) }
			</Button>
		</div>
	);
};

export default InlineHelpForumView;
