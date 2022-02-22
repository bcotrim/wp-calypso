import classNames from 'classnames';
import { get, keys } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import wpcom from 'wpcom';
import proxyRequest from 'wpcom-proxy-request';
import { withCurrentRoute } from 'calypso/components/route';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Module variables
 */
const noop = () => {};

class EditorMediaModalDetailPreviewVideoPress extends Component {
	static propTypes = {
		className: PropTypes.string,
		isPlaying: PropTypes.bool,
		item: PropTypes.object.isRequired,
		onPause: PropTypes.func,
		onVideoLoaded: PropTypes.func,
	};

	static defaultProps = {
		isPlaying: false,
		onPause: noop,
		onVideoLoaded: noop,
	};

	componentDidMount() {
		window.addEventListener( 'message', this.receiveMessage, false );
	}

	componentWillUnmount() {
		this.destroy();
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.isPlaying && ! nextProps.isPlaying ) {
			this.pause();
		} else if ( ! this.props.isPlaying && nextProps.isPlaying ) {
			this.play();
		}
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.item.videopress_guid !== prevProps.item.videopress_guid ) {
			this.destroy();
		}
	}

	shouldComponentUpdate( nextProps ) {
		if ( this.props.item.videopress_guid !== nextProps.item.videopress_guid ) {
			return true;
		}

		return false;
	}

	setVideoInstance = ( ref ) => ( this.video = ref );

	receiveMessage = ( event ) => {
		const { data } = event;

		if ( ! data || ! data.event ) {
			return;
		}

		// events received from calypso
		if ( 'videopress_refresh_iframe' === data.event ) {
			// in a timeout to guard against a race condition with cache not being busted prior to this message being received
			// and the `privacy_setting` not being accurate as a result.
			// Potential solution to this is to prevent the `videopress_refresh_iframe` message from being SENT until
			// the update has completed.
			setTimeout( () => {
				this.video.src += ''; // force reload of potentially cross-origin iframe
			}, 1000 );
		}

		// events received from player only
		if ( event.origin && event.origin !== 'https://video.wordpress.com' ) {
			return;
		}

		if (
			'videopress_loading_state' === data.event &&
			'loaded' === get( data, 'state' ) &&
			! get( data, 'converting' )
		) {
			this.props.onVideoLoaded();
		}

		if ( 'videopress_action_pause_response' === data.event ) {
			const currentTime = get( data, 'currentTime' );
			this.props.onPause( currentTime );
		}

		if ( 'videopress_token_request' === data.event ) {
			this.requestVideoPressToken( event );
		}
	};

	requestVideoPressToken = ( event ) => {
		const { siteId } = this.props;
		const guid = event.data.guid;
		const proxiedWpcom = wpcom();
		proxiedWpcom.request = proxyRequest;

		const path = `/sites/${ siteId }/media/videopress-playback-jwt/${ guid }`;
		proxiedWpcom.req.post( { path, apiNamespace: 'wpcom/v2' } ).then( function ( response ) {
			if ( ! response.metadata_token ) {
				event.source.postMessage(
					{
						event: 'videopress_token_error',
						guid,
					},
					'*'
				);
				return;
			}
			const jwt = response.metadata_token;
			event.source.postMessage(
				{
					event: 'videopress_token_received',
					guid,
					jwt,
				},
				'*'
			);
		} );
	};

	destroy() {
		window.removeEventListener( 'message', this.receiveMessage );

		if ( ! this.video ) {
			return;
		}

		// Remove DOM created outside of React.
		while ( this.video.firstChild ) {
			this.video.removeChild( this.video.firstChild );
		}
	}

	play() {
		if ( ! this.video ) {
			return;
		}

		this.video.contentWindow.postMessage(
			{ event: 'videopress_action_play' },
			'https://video.wordpress.com'
		);
	}

	pause() {
		if ( ! this.video ) {
			return;
		}

		this.video.contentWindow.postMessage(
			{ event: 'videopress_action_pause' },
			'https://video.wordpress.com'
		);
	}

	render() {
		const classes = classNames( this.props.className, 'is-video' );
		const { isPlaying, item } = this.props;
		const { height = 480, videopress_guid, width = 854 } = item;

		const params = {
			autoPlay: isPlaying,
			height,
			width,
			fill: true,
		};
		const qs = keys( params ).map( ( key ) => `${ key }=${ params[ key ] }` );
		const videoUrl = `https://video.wordpress.com/v/${ videopress_guid }?${ qs.join( '&' ) }`;

		return (
			<iframe title="Video" src={ videoUrl } className={ classes } ref={ this.setVideoInstance } />
		);
	}
}

export default withCurrentRoute(
	connect( ( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
		};
	} )( EditorMediaModalDetailPreviewVideoPress )
);
