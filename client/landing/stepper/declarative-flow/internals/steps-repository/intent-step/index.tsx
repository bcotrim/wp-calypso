/* eslint-disable wpcalypso/jsx-classname-namespace */
import { IntentScreen, StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import intentImageUrl from 'calypso/assets/images/onboarding/intent.svg';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import { ONBOARD_STORE } from '../../../../stores';
import { useIntents, useIntentsAlt } from './intents';
import type { Step } from '../../types';
import './style.scss';

/**
 * The intent capture step
 */
const IntentStep: Step = function IntentStep( { navigation } ) {
	const { submit } = navigation;
	const translate = useTranslate();
	const headerText = translate( 'Where will you start?' );
	const subHeaderText = translate( 'You can change your mind at any time.' );

	const { setIntent } = useDispatch( ONBOARD_STORE );
	const intents = useIntents();
	// TODO: I need to get the site slug to get the siteId to get the canImport
	const intentsAlt = useIntentsAlt( true );

	const submitIntent = ( intent: string ) => {
		const providedDependencies = { intent };
		recordTracksEvent( 'calypso_signup_intent_select', providedDependencies );
		setIntent( intent );
		submit?.( providedDependencies, intent );
	};

	return (
		<StepContainer
			stepName={ 'intent-step' }
			headerImageUrl={ intentImageUrl }
			hideSkip
			hideBack
			isHorizontalLayout={ true }
			formattedHeader={
				<FormattedHeader
					id={ 'intent-header' }
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					align={ 'left' }
				/>
			}
			stepContent={
				<IntentScreen
					intents={ intents }
					intentsAlt={ intentsAlt }
					onSelect={ submitIntent }
					preventWidows={ preventWidows }
				/>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default IntentStep;
