/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
const { __ } = wp.i18n;
const { Component, Fragment, createRef } = wp.element;
const { focus } = wp.dom;
const { createBlock } = wp.blocks;
const { compose, ifCondition } = wp.compose;
const { select, withSelect, withDispatch, dispatch } = wp.data;
const { withSpokenMessages, Modal, Button } = wp.components;

class TransformControls extends Component {
	constructor() {
		super( ...arguments );

		this.nameInput = createRef();
		this.focus = this.focus.bind( this );
	}
	componentDidMount() {
		this.focus();
	}

	focus() {
		if ( this.nameInput.current !== null ) {
			const tabbables = focus.tabbable.find( document.querySelector( '.components-modal--editorskit-transform-empty' ) );
			if ( tabbables.length ) {
				document.activeElement.classList.remove( 'is-selected' );
				document.activeElement.blur();
				tabbables[ 0 ].focus();
			}
		}
	}

	componentDidUpdate() {
		this.focus();
	}

	render() {
		const { getBlocks, getBlockIndex, createSpacer, onToggle, isPrompted } = this.props;
		const isValid = getBlockIndex - 3;

		const closeModal = () => {
			onToggle( 1 );
		};

		if ( isValid < 0 ) {
			return null;
		}
		const getFirst = getBlocks[ isValid ];
		const getSecond = getBlocks[ isValid + 1 ];
		const getThird = getBlocks[ isValid + 2 ];
		const getFourth = getBlocks[ isValid + 3 ];

		if ( getFirst.name !== 'core/paragraph' || getSecond.name !== 'core/paragraph' || getThird.name !== 'core/paragraph' || getFourth.name !== 'core/paragraph' ) {
			return null;
		}

		if ( ! isEmpty( getFirst.attributes.content ) || ! isEmpty( getSecond.attributes.content ) || ! isEmpty( getThird.attributes.content ) || ! isEmpty( getFourth.attributes.content ) ) {
			return null;
		}

		if ( ! isPrompted ) {
			return (
				<Fragment>
					<Modal
						title={ __( 'Enable Shortcut', 'block-options' ) }
						// onRequestClose={() => closeModal()}
						shouldCloseOnEsc={ false }
						shouldCloseOnClickOutside={ false }
						closeLabel={ __( 'Close', 'block-options' ) }
						icon={ null }
						className="editorskit-modal-component components-modal--editorskit-transform-empty"
					>
						<p>{ __( 'Do you want to automatically transform four(4) consecutive empty paragraphs into Spacer Block?', 'block-options' ) }</p>
						<Button isPrimary isLarge onClick={
							() => {
								onToggle( 0 );
								createSpacer( getFirst.clientId, getSecond.clientId, getThird.clientId, getFourth.clientId );
							}
						} ref={ this.nameInput } >
							{ __( 'Yes Enable', 'block-options' ) }
						</Button>
						&nbsp;
						<Button isDefault isLarge onClick={ () => closeModal() } >
							{ __( 'No, Thanks', 'block-options' ) }
						</Button>
						<p><small>{ __( 'This prompt will only be shown once and will remember your preference. Thanks!', 'block-options' ) }</small></p>
					</Modal>
				</Fragment>
			);
		}
		createSpacer( getFirst.clientId, getSecond.clientId, getThird.clientId, getFourth.clientId );

		return null;
	}
}

export default compose(
	withSelect( () => {
		const selectedId = select( 'core/block-editor' ).getSelectedBlockClientId();
		return {
			getBlocks: select( 'core/block-editor' ).getBlocks(),
			getBlockIndex: select( 'core/block-editor' ).getBlockIndex( selectedId ),
			isDisabled: select( 'core/edit-post' ).isFeatureActive( 'disableEditorsKitTransformEmptyWriting' ),
			isPrompted: select( 'core/edit-post' ).isFeatureActive( 'editorsKitTransformEmptyWriting' ),
		};
	} ),
	withDispatch( () => ( {
		createSpacer( getFirst, getSecond, getThird, getFourth ) {
			const { selectBlock, replaceBlock, removeBlocks } = dispatch( 'core/block-editor' );
			const createSpacer = createBlock( 'core/spacer', {} );
			removeBlocks( [ getFirst, getSecond, getThird ] );
			replaceBlock( getFourth, createSpacer );
			selectBlock( createSpacer.clientId );
		},
		onToggle( disabled ) {
			dispatch( 'core/edit-post' ).toggleFeature( 'editorsKitTransformEmptyWriting' );
			if ( disabled ) {
				dispatch( 'core/edit-post' ).toggleFeature( 'disableEditorsKitTransformEmptyWriting' );
			}
		},
	} ) ),
	ifCondition( ( props ) => {
		return ! props.isDisabled;
	} ),
	withSpokenMessages,
)( TransformControls );
