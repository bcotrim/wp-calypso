import { Card } from '@wordpress/components';
import classnames from 'classnames';
import { useState } from 'react';
import Draggable from 'react-draggable';
import HelpCenterDesktopContent from './help-center-desktop-content';
import HelpCenterDesktopHeader from './help-center-desktop-header';

const HelpCenterDeskopContainer: React.FC = () => {
	const [ isMinimized, setIsMinimized ] = useState( false );
	const classNames = classnames( 'help-center__container', 'is-desktop' );
	return (
		<Draggable handle={ '.help-center__container-header' }>
			<Card className={ classNames }>
				<HelpCenterDesktopHeader
					isMinimized={ isMinimized }
					onMinimize={ () => setIsMinimized( true ) }
					onMaximize={ () => setIsMinimized( false ) }
				/>
				{ ! isMinimized && <HelpCenterDesktopContent /> }
			</Card>
		</Draggable>
	);
};

export default HelpCenterDeskopContainer;
